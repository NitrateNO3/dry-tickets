import { Link } from 'react-router-dom'
import { allArtists, featuredEvents, liveEvents, presaleEvents } from '../data/events'
import { fmtDateShort, monthKey } from '../lib/format'
import { Hero } from '../components/Hero'
import { Marquee } from '../components/Marquee'
import { Rail } from '../components/Rail'
import { EventRow, PosterCard } from '../components/PosterCard'
import { Badge, Button, Eyebrow, Reveal, SectionHead } from '../components/Primitives'
import { Arrow, Bolt, Pin, Shield, Ticket } from '../components/Icons'

const stats = [
  { value: '800+', label: 'Shows produced' },
  { value: '600+', label: 'Artists hosted' },
  { value: '200k+', label: 'Ticket holders' },
  { value: '320+', label: 'Venues covered' },
]

const promises = [
  {
    Icon: Shield,
    title: 'Verified tickets, always',
    body: 'Every ticket is issued by us and barcode-scanned at the door. No resale markups, no fakes, no surprises.',
  },
  {
    Icon: Bolt,
    title: 'In your inbox instantly',
    body: 'E-tickets land the moment you pay. Show the barcode on your phone — or we will print thermal tickets for you.',
  },
  {
    Icon: Ticket,
    title: 'Presale before anyone else',
    body: 'Members get first access to tour announcements and discount codes ahead of general on-sale.',
  },
]

export default function Home() {
  const featured = featuredEvents
  const onSale = liveEvents.slice(0, 12)
  const thisMonth = liveEvents.slice(0, 8)

  // Real cities only, busiest first — tour-wide entries have no city to browse.
  const cityCards = Object.entries(
    liveEvents.reduce<Record<string, number>>((acc, e) => {
      if (/tour|wide/i.test(e.metro)) return acc
      acc[e.metro] = (acc[e.metro] ?? 0) + 1
      return acc
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  // Group the next chunk of events by month for the calendar-style listing
  const grouped = liveEvents.slice(0, 14).reduce<Record<string, typeof liveEvents>>((acc, e) => {
    const k = monthKey(e.start)
    ;(acc[k] ??= []).push(e)
    return acc
  }, {})

  return (
    <>
      <Hero featured={featured} />
      <Marquee />

      {/* ------------------------------------------------------ Now on sale */}
      <section className="mx-auto max-w-[1400px] px-5 pt-24 sm:px-8 lg:pt-32">
        <Reveal>
          <SectionHead
            eyebrow="Now on sale"
            title="Tickets moving"
            accent="fast"
            blurb="The shows selling hardest across Australia and New Zealand right now."
            action={
              <Button to="/events" variant="outline">
                All events
                <Arrow className="h-4 w-4" />
              </Button>
            }
          />
        </Reveal>
        <Reveal delay={0.1}>
          <Rail events={onSale} />
        </Reveal>
      </section>

      {/* --------------------------------------------------- Browse by city */}
      <section className="mx-auto max-w-[1400px] px-5 pt-28 sm:px-8">
        <Reveal>
          <SectionHead
            eyebrow="Wherever you are"
            title="Pick your"
            accent="city"
            blurb="From Sydney's Liberty Hall to Christchurch — find what's on near you."
          />
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cityCards.map(([m, count], i) => {
            const next = liveEvents.find((e) => e.metro === m)
            return (
              <Reveal key={m} delay={0.04 * i}>
                <Link
                  to={`/events?city=${encodeURIComponent(m)}`}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-surface p-4 hairline transition-all duration-300 hover:bg-surface-2"
                >
                  {next && (
                    <img
                      src={next.image}
                      alt=""
                      loading="lazy"
                      aria-hidden
                      className="h-16 w-12 shrink-0 rounded-lg object-cover opacity-80 transition-all duration-500 group-hover:opacity-100"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 text-[15px] font-bold text-cream">
                      <Pin className="h-4 w-4 text-saffron" />
                      {m}
                    </h3>
                    <p className="mt-1 truncate text-[12.5px] text-muted">
                      {count} {count === 1 ? 'event' : 'events'}
                      {next && ` · next ${fmtDateShort(next.start)}`}
                    </p>
                  </div>
                  <Arrow className="h-4 w-4 shrink-0 text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-saffron" />
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ------------------------------------------------- Events by date */}
      <section className="mx-auto max-w-[1400px] px-5 pt-28 sm:px-8">
        <Reveal>
          <SectionHead
            eyebrow="The calendar"
            title="What's on,"
            accent="week by week"
            action={
              <Button to="/events" variant="outline">
                Full calendar
                <Arrow className="h-4 w-4" />
              </Button>
            }
          />
        </Reveal>

        <div className="space-y-12">
          {Object.entries(grouped).map(([month, items], gi) => (
            <Reveal key={month} delay={0.05 * gi}>
              <div className="mb-4 flex items-baseline gap-4">
                <h3 className="text-[13px] font-bold uppercase tracking-[0.22em] text-saffron">
                  {month}
                </h3>
                <span className="h-px flex-1 bg-line" />
                <span className="text-[12px] font-semibold text-faint">
                  {items.length} {items.length === 1 ? 'show' : 'shows'}
                </span>
              </div>
              <div className="divide-y divide-line rounded-2xl bg-surface/50 p-1.5 hairline">
                {items.map((e) => (
                  <EventRow key={e.slug} event={e} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- Presale */}
      {presaleEvents.length > 0 && (
        <section className="relative mt-32 overflow-hidden border-y border-line bg-ink-2 py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-violet/15 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-gold/10 blur-[120px]"
          />

          <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
            <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <Reveal>
                <Eyebrow className="mb-5">Exclusive presale</Eyebrow>
                <h2 className="text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold">
                  Tours announced.{' '}
                  <em className="font-serif italic font-normal text-gradient">
                    Tickets not yet public.
                  </em>
                </h2>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
                  Register your interest and we'll send you a presale code before general on-sale —
                  plus first pick of front-row, fanpit and meet-and-greet packages.
                </p>

                <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    aria-label="Email for presale access"
                    className="h-12 flex-1 rounded-full bg-surface px-5 text-sm text-cream placeholder:text-faint hairline focus:outline-none focus:ring-1 focus:ring-saffron/60"
                  />
                  <Button type="submit">Join the list</Button>
                </form>

                <p className="mt-4 text-[12px] text-faint">
                  Joining 200,000+ members. Unsubscribe anytime.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {presaleEvents.map((e) => (
                    <Link
                      key={e.slug}
                      to={`/event/${e.slug}`}
                      className="group relative overflow-hidden rounded-2xl hairline"
                    >
                      <img
                        src={e.image}
                        alt={`${e.title} poster`}
                        loading="lazy"
                        className="aspect-[460/651] w-full object-cover transition-transform duration-[900ms] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
                      <div className="absolute left-3.5 top-3.5">
                        <Badge tone="gold">Presale</Badge>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-cream">
                          {e.title}
                        </h3>
                        <p className="mt-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-saffron">
                          Dates to be announced
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- Artists */}
      <section className="mx-auto max-w-[1400px] px-5 pt-28 sm:px-8">
        <Reveal>
          <SectionHead
            eyebrow="The roster"
            title="Artists on"
            accent="tour"
            blurb="Six hundred acts have played a Dry Tickets stage. These are the ones on the road now."
            action={
              <Button to="/artists" variant="outline">
                All artists
                <Arrow className="h-4 w-4" />
              </Button>
            }
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
            {allArtists.map((a) => {
              const count = liveEvents.filter((e) =>
                e.artists.some((x) => x.name === a.name),
              ).length
              return (
                <Link
                  key={a.name}
                  to={`/events?q=${encodeURIComponent(a.name)}`}
                  className="group w-[168px] shrink-0"
                >
                  <div className="relative overflow-hidden rounded-2xl hairline">
                    <img
                      src={a.image}
                      alt={a.name}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-[900ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <h3 className="truncate text-[13.5px] font-bold text-cream">{a.name}</h3>
                      {count > 0 && (
                        <p className="text-[11px] font-semibold text-saffron">
                          {count} {count === 1 ? 'date' : 'dates'}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </Reveal>
      </section>

      {/* ----------------------------------------------------------- Promise */}
      <section className="mx-auto max-w-[1400px] px-5 pt-32 sm:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {promises.map((p, i) => (
            <Reveal key={p.title} delay={0.08 * i}>
              <div className="h-full rounded-3xl bg-surface p-7 hairline transition-colors duration-300 hover:bg-surface-2">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-saffron/12 text-saffron">
                  <p.Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-[17px] font-bold text-cream">{p.title}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- Organisers */}
      <section className="mx-auto mt-32 max-w-[1400px] px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl bg-surface p-8 hairline sm:p-14 lg:p-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-ember/18 blur-[120px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-24 h-[24rem] w-[24rem] rounded-full bg-saffron/14 blur-[120px]"
            />

            <div className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <Eyebrow className="mb-5">For organisers</Eyebrow>
                <h2 className="text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold">
                  Selling a show?{' '}
                  <em className="font-serif italic font-normal text-gradient">We run the whole box office.</em>
                </h2>
                <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
                  Ticketing, seat maps, barcode scanning, thermal printing, poster design and paid
                  social — one team, one invoice. We've done it for 350 organisers and 800 events over
                  the last decade.
                </p>

                <div className="mt-9 flex flex-wrap gap-4">
                  <Button to="/sell" size="lg">
                    Start selling
                    <Arrow className="h-4 w-4" />
                  </Button>
                  <Button href="tel:0452337387" variant="outline" size="lg">
                    Call 0452 337 387
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-2xl bg-ink/55 p-6 hairline">
                    <p className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-extrabold tracking-[-0.04em] text-gradient">
                      {s.value}
                    </p>
                    <p className="mt-1.5 text-[12.5px] font-medium text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------- Closing grid */}
      <section className="mx-auto max-w-[1400px] px-5 pt-32 sm:px-8">
        <Reveal>
          <SectionHead eyebrow="Don't miss out" title="More to" accent="book" />
        </Reveal>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {thisMonth.slice(0, 8).map((e, i) => (
            <Reveal key={e.slug} delay={0.05 * (i % 4)}>
              <PosterCard event={e} index={i} />
            </Reveal>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Button to="/events" size="lg" variant="outline">
            See all {liveEvents.length} events
            <Arrow className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </>
  )
}
