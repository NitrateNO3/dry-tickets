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
- **Framer Motion** for the hero rotation, scroll reveals and list transitions

## Design direction

The content is the strongest asset the business has — 460×651 gig posters, densely
designed, in saturated colour. The redesign is built around that:

- **Poster-first.** Cards show artwork at its native ratio with nothing layered over
  it except a date chip. Metadata sits in a clean block underneath, so busy posters
  stay readable.
- **Cinematic dark ground.** A near-black ink base (`#07060b`) with a warm cream text
  colour, so the posters supply the colour rather than competing with the chrome.
- **The poster paints the page.** Hero and event-detail backdrops are the current
  poster, scaled and blurred — every event brings its own palette.
- **Saffron → ember accent** for actions, a gold/mint/violet supporting set for
  status. Editorial italic serif (Instrument Serif) against a tight grotesk
  (Plus Jakarta Sans) for headline contrast.
- Film grain overlay, glass nav, reduced-motion support throughout.

## Structure

```
src/
  data/events.ts      29 real events derived from the live site's schema.org feed
  lib/format.ts       date/money formatting (Australia/Sydney timezone)
  lib/copy.ts         rewrites the boilerplate source descriptions into real sentences
  components/         Nav, Footer, Hero, PosterCard, Rail, Marquee, Primitives, Icons
  pages/              Home, Events, EventDetail, Artists, Sell, About, NotFound
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

## What is mocked

This is a front-end redesign. Checkout, newsletter signup and the organiser enquiry
form are wired to state but post nowhere; the venue map is a styled placeholder
rather than a paid map embed.

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
| Facebook and YouTube handles (only Instagram is confirmed) | `src/components/Footer.tsx`, `src/pages/About.tsx` |

The company's real FAQ, refund and terms pages exist on drytickets.com.au and were
not consulted when writing the above.

Section headlines and marketing lines throughout are likewise original copy written
for this redesign, not lifted from the source site.

## Note on images

Some posters on the origin server are 500KB PNGs served without a CDN. The hero
preloads and fades its images to cover that, but a production build should proxy
them through an image CDN and serve WebP/AVIF at the sizes actually used.
