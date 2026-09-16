import { Link } from 'react-router-dom'
import { AUSTRALIAN_CITIES } from '../data/events'
import { useEvents } from '../lib/events'
import { monthKey } from '../lib/format'
import { plural } from '../lib/copy'
import { Hero } from '../components/Hero'
import { EventRow, PosterCard } from '../components/PosterCard'
import { Button, GroupHead, Meta, Reveal, SectionHead, SkeletonCard } from '../components/Primitives'
import { Arrow, Bolt, Check, Pin, Shield, Ticket } from '../components/Icons'

const guarantees = [
  {
    Icon: Shield,
    title: 'Issued by the organiser',
    body: 'We are the primary seller. Every ticket is issued on behalf of the promoter and scanned at the door.',
  },
  {
    Icon: Bolt,
    title: 'E-ticket in minutes',
    body: 'Your ticket arrives by email and SMS as soon as payment clears. Show the QR code on your phone.',
  },
  {
    Icon: Ticket,
    title: 'Face-value pricing',
    body: 'You pay the ticket price plus the booking fee shown before checkout. No resale markups.',
  },
  {
    Icon: Check,
    title: 'Support in Sydney',
    body: 'Call 0452 337 387, Monday to Friday, 9:00am – 5:30pm AEST.',
  },
]

const stats = [
  { value: '800+', label: 'Shows ticketed' },
  { value: '600+', label: 'Artists hosted' },
  { value: '320+', label: 'Venues in AU & NZ' },
  { value: '2013', label: 'Selling tickets since' },
]

const viewAll = (
  <Link to="/events" className="inline-flex items-center gap-2 text-sm font-medium text-blue hover:text-blue-dark">
    View all events
    <Arrow className="h-4 w-4" />
  </Link>
)

export default function Home() {
  const { live, featured, categories, loading } = useEvents()
  const upcoming = live.slice(0, 8).reduce<Record<string, typeof live>>((acc, e) => {
    ;(acc[monthKey(e.start)] ??= []).push(e)
    return acc
  }, {})

  const categoryCounts = categories
    .map((c) => ({ name: c, count: live.filter((e) => e.category === c).length }))
    .filter((c) => c.count > 0)

  const featuredSlugs = new Set(featured.slice(0, 4).map((e) => e.slug))
  const onSale = live.filter((e) => !featuredSlugs.has(e.slug)).slice(0, 4)

  const cards = (list: typeof live) =>
    loading
      ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
      : list.map((e, i) => <PosterCard key={e.slug} event={e} index={i} />)

  return (
    <>
      <Meta
        title="Dry Tickets"
        description="Official tickets for concerts, comedy, festivals and cultural events across Australia and New Zealand. Face-value pricing and instant e-tickets."
      />
      <Hero />

      <section className="wrap section">
        <Reveal>
          <SectionHead title="Featured events" blurb="Headline shows with tickets on sale now." action={viewAll} />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards(featured.slice(0, 4))}
          </div>
        </Reveal>
      </section>

      <section className="wrap section">
        <Reveal>
          <SectionHead title="Browse by category" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryCounts.map((c) => (
              <Link
                key={c.name}
                to={`/events?category=${encodeURIComponent(c.name)}`}
                className="card card-hover group flex items-center justify-between p-4"
              >
                <span>
                  <span className="block text-base font-semibold text-ink">{c.name}</span>
                  <span className="text-sm text-muted">
                    {c.count} {plural(c.count, 'event')}
                  </span>
                </span>
                <Arrow className="h-4 w-4 text-faint transition-colors group-hover:text-blue" />
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="wrap section">
        <Reveal>
          <SectionHead title="On sale now" blurb="More shows with tickets available, soonest first." action={viewAll} />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards(onSale)}
          </div>
        </Reveal>
      </section>

      <section className="wrap section">
        <Reveal>
          <SectionHead title="Browse by city" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {AUSTRALIAN_CITIES.map((c) => {
              const count = live.filter((e) => e.metro === c.name).length
              return (
                <Link key={c.name} to={`/events?city=${encodeURIComponent(c.name)}`} className="card card-hover group p-4">
                  <span className="flex items-center justify-between">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-light text-blue">
                      <Pin className="h-4 w-4" />
                    </span>
                    <span className="t-label text-faint">{c.state}</span>
                  </span>
                  <span className="mt-6 block text-base font-semibold text-ink transition-colors group-hover:text-blue">
                    {c.name}
                  </span>
                  <span className="text-sm text-muted">
                    {count > 0 ? `${count} upcoming ${plural(count, 'event')}` : 'No shows listed yet'}
                  </span>
                </Link>
              )
            })}
          </div>
        </Reveal>
      </section>

      <section className="wrap section">
        <Reveal>
          <SectionHead
            title="Coming up"
            blurb="The next eight shows, by date."
            action={
              <Link to="/events" className="inline-flex items-center gap-2 text-sm font-medium text-blue hover:text-blue-dark">
                Full calendar
                <Arrow className="h-4 w-4" />
              </Link>
            }
          />
          <div className="space-y-8">
            {Object.entries(upcoming).map(([month, items]) => (
              <div key={month}>
                <GroupHead title={month} meta={`${items.length} ${plural(items.length, 'show')}`} />
                <div className="card divide-y divide-line p-2">
                  {items.map((e) => (
                    <EventRow key={e.slug} event={e} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="wrap section">
        <Reveal>
          <SectionHead eyebrow="Why Dry Tickets" title="Buying from the primary seller" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {guarantees.map((g) => (
              <div key={g.title} className="card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-light text-blue">
                  <g.Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">{g.title}</h3>
                <p className="mt-2 text-sm text-muted">{g.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="wrap section">
        <Reveal>
          <div className="card grid grid-cols-1 gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="t-label text-blue">For organisers</span>
              <h2 className="t-h2 mt-3 text-ink">Selling a show? We run the box office.</h2>
              <p className="mt-4 max-w-lg text-muted">
                Online and counter sales, reserved seating maps, door scanning and printed tickets — set up by our
                team and reported to you live on the night.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button to="/sell">
                  List your event
                  <Arrow className="h-4 w-4" />
                </Button>
                <Button href="tel:0452337387" variant="outline">
                  Call 0452 337 387
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg border border-line bg-surface p-6">
                  <p className="t-h2 text-ink">{s.value}</p>
                  <p className="mt-1 text-sm text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
