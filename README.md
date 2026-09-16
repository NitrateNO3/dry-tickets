# Dry Tickets — redesign

A React + Vite rebuild of [drytickets.com.au](https://drytickets.com.au/), Australia
and New Zealand's ticketing platform for Bollywood, Punjabi, Sufi and desi live events.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
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
3. Copy the **Project URL** and **anon key** (Project Settings → API) into `.env.local`
   (see `.env.example`) and into the Vercel project's environment variables.
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

## What is mocked

This is a front-end redesign. Checkout, presale signup and the organiser enquiry
form show a loading state and a confirmation but post nowhere (search for
`ponytail: mocked`).

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
