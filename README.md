# Dry Tickets — redesign

A React + Vite rebuild of [drytickets.com.au](https://drytickets.com.au/), Australia
and New Zealand's ticketing platform for Bollywood, Punjabi, Sufi and desi live events.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
npm run check    # validator self-check (Node 24+)
```

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** (via `@tailwindcss/vite`) — design tokens live in `src/index.css` under `@theme`
- **React Router** for routing
- **Framer Motion** for section reveals, dropdowns and modals

## Design system

Everything is defined once in `src/index.css` (`@theme` tokens + `@utility` classes) and
`src/components/Primitives.tsx`. New UI should compose these rather than add values.

- **Spacing** — Tailwind's 4pt scale, whole steps only (no `.5`). Layout utilities:
  `wrap` (1400px container), `page-top`, `section`.
- **Type** — Plus Jakarta Sans, weights 400/500/600/700. Ramp: `t-display`, `t-h1`,
  `t-h2`, `t-h3`, `t-lede`, `t-label`; body 15px, `text-sm`, `text-xs`.
- **Colour** — `ink` / `muted` / `faint` text, `surface` / `line` neutrals, one `blue`
  accent, `success` / `warning` / `danger` for status. No other hues.
- **Radius** — `rounded-md` tags · `rounded-lg` buttons, inputs, chips · `rounded-xl`
  cards, dropdowns, modals.
- **Shadow** — `shadow-xs` resting · `shadow-md` hover and dropdown · `shadow-xl` modal.
- **Cards** — `card` + `card-hover` (2px lift, stronger border). No other hover recipes.
- **Motion** — one `Reveal` fade-up per section; no per-item stagger or decorative movement.
- **Loading** — `Button loading`, `Img` (skeleton until loaded). Every async action shows one.
- **Meta** — every page renders `<Meta title description />`, which updates the
  title, description and Open Graph tags from `index.html` in place.

## Structure

```
src/
  data/events.ts      35 seed events derived from the live site's schema.org feed
  lib/supabase.ts     Supabase client + row mapping (null when not configured)
  lib/events.tsx      EventsProvider / useEvents(): data + derived lists for every page
  lib/format.ts       date/money formatting (Australia/Sydney timezone)
  lib/copy.ts         rewrites the boilerplate source descriptions into real sentences
  components/         Nav, Footer, Hero, PosterCard, CheckoutModal, Primitives, Icons
  pages/              Home, Events, EventDetail, Artists, Venues, Sell, About, NotFound
  pages/admin/        AdminLayout, AdminEvents, AdminEventForm
```

## Data

`src/data/events.ts` was generated from the live site's JSON-LD event feed, so titles,
dates, venues, addresses, artists, ratings and ticket tiers with real prices are all
genuine. Poster and artist images are referenced from `drytickets.com.au`.

Two things are derived rather than copied:

- **Descriptions.** The source text is templated (`"<Presenter> Presents <title>
  <artist> Performing Live On Stage."`) and just echoes the title. `lib/copy.ts`
  extracts the presenter and rebuilds a proper sentence from the event's own data.
- **Metro grouping.** Venue suburbs (Moore Park, Granville, Greensborough…) are
  mapped to their metro area so city filtering is useful.

## Booking requests (email)

"Get Tickets" collects the buyer's details and submits a booking request. No payment is
taken and nothing is stored. The site calls the `booking` Supabase Edge Function
(`supabase/functions/booking/index.ts`), which:

- checks the details and re-reads the event, ticket type and price from the database, so
  the total in the emails can't be changed from the browser;
- emails the full request to `ticketbookingau@gmail.com` (Reply-To is the buyer), then a
  confirmation to the buyer (Reply-To is the inbox), both sent from the Gmail account;
- refuses more than 5 requests per hour from one IP and 150 per day overall
  (`supabase/bookings.sql`), which keeps well inside Gmail's ~500 emails/day.

**Setup (once):** run `npm run setup:booking` and follow the prompts. It logs in to Supabase,
creates the rate-limit table, stores the Gmail app password as a Supabase secret, deploys
the function, sends a test booking to the inbox, and prints the two Vercel variables.
Before running it:

- **Gmail app password.** Sign in to `ticketbookingau@gmail.com`, turn on
  [2-Step Verification](https://myaccount.google.com/signinoptions/twosv), then create an
  app password at <https://myaccount.google.com/apppasswords>. That page returns 404 until
  2-Step Verification is on.
- **Events in the database.** The function prices bookings from the `events` table, so it
  must not be empty: `/admin` → **Import built-in events** (see Admin panel below).

Errors show under Supabase → **Edge Functions → booking → Logs**.

The 4.5% booking fee is set in two places: `src/pages/EventDetail.tsx` (what the buyer
sees) and the function (what the emails say). Change both together.

## Admin panel (Supabase)

`/admin` lets a signed-in admin add, edit and delete shows. Data lives in a Supabase
Postgres table; the public site reads it on load. **Without Supabase configured the site
runs on the built-in seed list in `src/data/events.ts` and `/admin` shows a setup
checklist**, so the current Vercel deploy keeps working unchanged.

Setup (once):

1. Create a project at [supabase.com](https://supabase.com). Under **Authentication →
   Providers → Email** turn off *Allow new users to sign up*. Under **Authentication →
   Users** add the admin user (email + password).
2. Open the **SQL editor**, paste [`supabase/schema.sql`](supabase/schema.sql), run it.
   It creates the `events` table and row-level security: anyone can read, only a
   signed-in user can write.
3. Set two variables in `.env.local` (see `.env.example`) and in the Vercel project's
   environment variables:
   - `VITE_SUPABASE_URL` — `https://<project-id>.supabase.co` (the id is in the
     dashboard address bar, or Project Settings → Data API).
   - `VITE_SUPABASE_PUBLISHABLE` — the **publishable** key (`sb_publishable_…`). It is
     public by design; row-level security protects writes. Never use the secret key.
     (Named without "KEY" because Vercel blocks saving `VITE_*KEY*` variables;
     `VITE_SUPABASE_ANON_KEY` is still read as a fallback.)
4. Redeploy. Open `/admin`, sign in, and choose **Import built-in events** to seed the
   table with the 35 shows that ship with the site.

How it fits together:

- `src/lib/supabase.ts` — client (null when env vars are missing), row ↔ `EventItem`
  mapping, `fetchEvents` / `upsertEvents` / `deleteEvent`.
- `src/lib/events.tsx` — `EventsProvider` loads once and exposes `useEvents()` with the
  derived lists every page uses (`live`, `presale`, `featured`, `artists`, `categories`,
  `get(slug)`), plus `loading` for skeletons and `refresh()` after admin saves.
- `src/pages/admin/` — `AdminLayout` (setup / login / signed-in shell), `AdminEvents`
  (list, search, filters, import), `AdminEventForm` (create / edit / delete).
- Times in the admin form are entered in the admin's browser timezone; the public site
  displays them in Australia/Sydney.

## Security

The site is a static SPA; the only backend is Supabase (Postgres + Auth). Security is
enforced in the database and by response headers, not by the browser code.

| Area | How it's handled |
|---|---|
| Keys | Only the **publishable** key (`sb_publishable_…`) ships to browsers. It is public by design. **Never** put the secret key (`sb_secret_…`) in a `VITE_` variable, Vercel, or git. Git history was scanned: no secrets have ever been committed. |
| Authorisation | Row-level security on `events`: anyone reads; insert/update/delete require `is_admin()`, which checks `app_metadata.role = 'admin'` in the login token. `app_metadata` can only be set server-side. Anonymous write grants and `TRUNCATE` are revoked. |
| Field tampering | CHECK constraints on every column (https-only URLs, lengths, price 0–100,000, valid ticket availability, end ≥ start). A trigger recomputes `low`/`high` and `updated_at` server-side. |
| Input validation | `src/lib/validate.ts` mirrors the constraints in the admin form; every input has `maxLength`. Self-check: `npm run check`. |
| Output | React escapes all rendered text; there are no raw-HTML sinks. The public fetch selects explicit columns only. |
| Sessions | No server, so no HttpOnly cookie: the admin token lives in `sessionStorage` (cleared when the tab closes). The CSP blocks the injected scripts that could read it. |
| Passwords | Stored as bcrypt hashes by Supabase Auth; the app never stores passwords. Sign-ups are disabled. |
| Login abuse | Supabase Auth rate-limits sign-in per IP; the form shows a clear message on 429 and never reveals whether an email exists. |
| Headers | `vercel.json`: CSP, HSTS, `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy, COOP. HTTP is redirected to HTTPS by Vercel. |
| Dependencies | `npm audit` clean; Dependabot (`.github/dependabot.yml`) opens weekly update PRs. |
| Bookings | The `booking` Edge Function validates input, prices the order from the database, escapes everything placed in the emails, and rate-limits by hashed IP. The Gmail app password exists only as a Supabase secret. |
| Payments | No payment is taken: "Get Tickets" sends a booking request by email. A real integration must use a hosted payment form (e.g. Stripe Elements) — never collect or store card numbers. |

One-time setup, in order:

1. **Supabase → SQL editor:** run `supabase/schema.sql`, then edit the email in step 3 of
   `supabase/security.sql` and run it. Sign out of `/admin` and back in.
2. **Supabase → Authentication → Rate Limits:** lower sign-in attempts (≈10 per 5 minutes per IP).
3. **GitHub → Settings → Code security** (repo admin): enable Dependabot alerts, secret
   scanning and push protection.

If the Supabase project URL changes, update `connect-src` in the CSP in `vercel.json`.

## What is mocked

This is a front-end redesign. No payment is taken: checkout sends a booking request by
email (see above). Presale signup and the organiser enquiry form show a loading state
and a confirmation but post nowhere (search for `ponytail: mocked`).

## ⚠️ Placeholder copy — not Dry Tickets' real terms

Some copy in this demo was written to fill the design and is **not** taken from
Dry Tickets. Do not treat any of it as the company's actual policy, and replace it
with real figures before this goes anywhere near production:

| Placeholder claim | Location |
| --- | --- |
| 4.5% booking fee (drives the checkout total) | `src/pages/EventDetail.tsx` |
| "No setup fee — we earn on tickets sold" | `src/pages/Sell.tsx` |
| "Event page live within 48 hours" | `src/pages/Sell.tsx` |
| "Dedicated account manager on the night" | `src/pages/Sell.tsx` |
| "Settlement within 5 business days" | `src/pages/Sell.tsx` |
| The five FAQs, incl. the refund/exchange answer | `src/pages/About.tsx` |
| The 2013–2026 company timeline | `src/pages/About.tsx` |

The company's real FAQ, refund and terms pages exist on drytickets.com.au and were
not consulted when writing the above.

Section headlines and marketing lines throughout are likewise original copy written
for this redesign, not lifted from the source site.

## Note on images

Some posters on the origin server are 500KB PNGs served without a CDN. The hero
preloads and fades its images to cover that, but a production build should proxy
them through an image CDN and serve WebP/AVIF at the sizes actually used.
