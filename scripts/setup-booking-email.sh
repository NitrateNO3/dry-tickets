#!/usr/bin/env bash
# One-time setup for booking emails (see README "Booking requests").
# Run from the repo root:  bash scripts/setup-booking-email.sh
# Safe to re-run: every step is idempotent.
set -euo pipefail

PROJECT_REF="gxrahpmvskssdpyqhdsu"
INBOX="ticketbookingau@gmail.com"
SB="npx -y supabase@latest"
API="https://${PROJECT_REF}.supabase.co"

step() { printf '\n\033[1;34m==> %s\033[0m\n' "$1"; }
cd "$(dirname "$0")/.."

step "1/6  Supabase login (opens your browser)"
if ! $SB projects list >/dev/null 2>&1; then
  $SB login
fi

step "2/6  Link this folder to the Supabase project"
echo "If asked for a database password, just press Enter to skip."
$SB link --project-ref "$PROJECT_REF"

step "3/6  Create the rate-limit table (supabase/bookings.sql)"
$SB db query --linked -f supabase/bookings.sql >/dev/null
echo "Done."

step "4/6  Gmail app password"
cat <<EOF
Create one at https://myaccount.google.com/apppasswords while signed in as ${INBOX}.
(That page shows "404" until 2-Step Verification is ON:
 https://myaccount.google.com/signinoptions/twosv)
EOF
read -rsp "Paste the 16-character app password (hidden): " APP_PASSWORD; echo
APP_PASSWORD="${APP_PASSWORD// /}"
if [ "${#APP_PASSWORD}" -ne 16 ]; then
  echo "That is ${#APP_PASSWORD} characters, expected 16. Run the script again." >&2
  exit 1
fi
SECRETS=$(mktemp); chmod 600 "$SECRETS"; trap 'rm -f "$SECRETS"' EXIT
printf 'GMAIL_USER=%s\nGMAIL_APP_PASSWORD=%s\n' "$INBOX" "$APP_PASSWORD" > "$SECRETS"
$SB secrets set --project-ref "$PROJECT_REF" --env-file "$SECRETS"
rm -f "$SECRETS"

step "5/6  Deploy the booking function"
$SB functions deploy booking --project-ref "$PROJECT_REF" --no-verify-jwt --use-api

step "6/6  Check events and send a test booking"
KEY=$($SB projects api-keys --project-ref "$PROJECT_REF" 2>/dev/null | grep -oE 'sb_publishable_[A-Za-z0-9_-]+' | head -1 || true)
if [ -z "$KEY" ]; then
  echo "Could not read the publishable key. Copy it from Supabase → Project Settings → API Keys."
  exit 1
fi

FIRST=$(curl -fsS "${API}/rest/v1/events?select=slug,tiers&limit=50" -H "apikey: ${KEY}" |
  node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8")).find(e=>e.tiers?.some(t=>t.availability!=="SoldOut"));
           if(r){const t=r.tiers.find(t=>t.availability!=="SoldOut");console.log(JSON.stringify({slug:r.slug,tier:t.name}))}')
if [ -z "$FIRST" ]; then
  cat <<EOF
The events table is empty, so every booking would be refused ("event no longer available").
Sign in at https://dry-tickets.vercel.app/admin and click "Import built-in events",
then run this script again to send the test booking.
EOF
else
  read -rp "Send a test booking (both emails go to ${INBOX})? [Y/n] " yn
  if [[ ! "$yn" =~ ^[Nn] ]]; then
    BODY=$(node -e 'const f=JSON.parse(process.argv[1]);console.log(JSON.stringify({...f,qty:1,name:"Setup Test",email:process.argv[2],phone:"0400 000 000"}))' "$FIRST" "$INBOX")
    curl -sS -X POST "${API}/functions/v1/booking" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}" \
      -H 'Content-Type: application/json' -d "$BODY"
    echo
    echo "Expect {\"reference\":\"DT-…\",\"confirmationSent\":true} and two emails in ${INBOX}."
    echo "An error? See Supabase → Edge Functions → booking → Logs."
  fi
fi

cat <<EOF

Last step: Vercel → dry-tickets → Settings → Environment Variables (Production), add
  VITE_SUPABASE_URL          = ${API}
  VITE_SUPABASE_PUBLISHABLE  = ${KEY}
then Deployments → ⋯ → Redeploy. (Skip if they are already there.)
EOF
