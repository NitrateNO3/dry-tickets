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
  data/events.ts      29 real events derived from the live site's schema.org feed
  lib/format.ts       date/money formatting (Australia/Sydney timezone)
  lib/copy.ts         rewrites the boilerplate source descriptions into real sentences
  components/         Nav, Footer, Hero, PosterCard, CheckoutModal, Primitives, Icons
  pages/              Home, Events, EventDetail, Artists, Venues, Sell, About, NotFound
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

"Get Tickets" collects the customer's details and submits a booking request. No payment
is taken. `src/lib/booking.ts` sends two emails via [EmailJS](https://www.emailjs.com)
straight from the browser (no backend, works on any host):

- a copy of the request to `ticketbookingau@gmail.com`, and
- a confirmation to the customer.

Setup (one-time, ~10 minutes):

1. Sign up at emailjs.com. Under **Email Services → Add New Service → Gmail**, connect
   `ticketbookingau@gmail.com`. Note the **Service ID**.
2. Under **Email Templates**, create two templates from `docs/emailjs/`. Each file's
   top comment lists the Subject / To / Reply To to set. Note both **Template IDs**.
3. Under **Account → General**, copy the **Public Key**.
4. Copy `.env.example` to `.env` and fill in the four values. Add the same variables
   wherever the site is built (hosting provider's environment settings), then rebuild.

The free EmailJS plan allows 200 emails/month, which is 100 bookings (2 emails each).

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
