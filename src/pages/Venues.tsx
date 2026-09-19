import { createElement, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CalendarDays, MapPin, Users } from 'lucide-react'
import { useEvents } from '../lib/events'
import { plural } from '../lib/copy'
import { cx, fmtDateShort } from '../lib/format'
import { PosterCard } from '../components/PosterCard'
import { Button, Img, Meta, Reveal, SectionHead, SkeletonCard } from '../components/Primitives'
import { Arrow } from '../components/Icons'
import { CITY_INFO } from '../components/cityIcons'
import type { EventItem } from '../data/events'
import { PageHero } from '../components/PageHero'
import { DarkCta } from '../components/DarkCta'

const NOTABLE_VENUES = [
  {
    name: 'Sydney Opera House',
    city: 'Sydney',
    state: 'NSW',
    type: 'Concert hall',
    capacity: '5,738',
    image: 'https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Palais Theatre',
    city: 'Melbourne',
    state: 'VIC',
    type: 'Historic theatre',
    capacity: '2,896',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Riverside Theatres',
    city: 'Sydney',
    state: 'NSW',
    type: 'Performing arts centre, Parramatta',
    capacity: '1,200',
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'The Tivoli',
    city: 'Brisbane',
    state: 'QLD',
    type: 'Live music venue',
    capacity: '1,500',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'RAC Arena',
    city: 'Perth',
    state: 'WA',
    type: 'Arena',
    capacity: '15,500',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Adelaide Entertainment Centre',
    city: 'Adelaide',
    state: 'SA',
    type: 'Arena and theatre',
    capacity: '11,300',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
  },
]

type VenueStat = { name: string; metro: string; street?: string; count: number; next: EventItem }

const PREVIEW = 9

export default function Venues() {
  const { live, loading } = useEvents()
  const [city, setCity] = useState('all')
  const [showAll, setShowAll] = useState(false)

  // One entry per venue: how many shows, and the soonest one (for its poster and date).
  const venueStats = useMemo(() => {
    const map = new Map<string, VenueStat>()
    for (const e of live) {
      if (!e.venue) continue
      const v = map.get(e.venue)
      if (v) v.count += 1
      else map.set(e.venue, { name: e.venue, metro: e.metro, street: e.street, count: 1, next: e })
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }, [live])

  const cities = useMemo(() => {
    const counts = new Map<string, number>()
    for (const v of venueStats) counts.set(v.metro, (counts.get(v.metro) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }, [venueStats])

  const filtered = city === 'all' ? venueStats : venueStats.filter((v) => v.metro === city)
  const visible = showAll || city !== 'all' ? filtered : filtered.slice(0, PREVIEW)

  return (
    <>
      <Meta
        title="Venues"
        description={`${venueStats.length} venues with upcoming shows on Dry Tickets, plus the major stages we ticket across Australia.`}
      />

      <PageHero
        label="Venues"
        title={
          <>
            Where the <span className="text-blue">shows</span> are.
          </>
        }
        lede="Every stage with tickets on sale — from heritage theatres to arenas, across Australia and New Zealand."
        stats={[
          { n: venueStats.length, label: 'Venues' },
          { n: cities.length, label: 'Cities' },
          { n: live.length, label: 'Shows on sale' },
        ]}
        tiles={[NOTABLE_VENUES[0], NOTABLE_VENUES[1], NOTABLE_VENUES[3]].map((v) => ({
          image: v.image,
          title: v.name,
          meta: `${v.city} · ${v.capacity} seats`,
        }))}
      />

      <div className="wrap">
        {/* Venues with upcoming shows */}
        <section className="section">
          <Reveal>
            <SectionHead
              title="Venues with upcoming shows"
              blurb="Busiest stages first. Select a venue to see everything on there."
            />

            <div className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              {[['all', venueStats.length] as const, ...cities].map(([name, n]) => {
                const on = city === name
                const Icon = name === 'all' ? Building2 : (CITY_INFO[name]?.Icon ?? MapPin)
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setCity(name)}
                    aria-pressed={on}
                    className={cx(
                      'inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border pl-3 pr-4 text-sm font-medium transition-all duration-150',
                      on
                        ? 'border-ink bg-ink text-white shadow-md'
                        : 'border-line bg-white text-muted hover:border-line-strong hover:text-ink',
                    )}
                  >
                    {createElement(Icon, { className: cx('h-4 w-4', on ? 'text-white' : 'text-blue') })}
                    {name === 'all' ? 'All cities' : name}
                    <span className={cx('text-xs tabular-nums', on ? 'text-white/60' : 'text-faint')}>{n}</span>
                  </button>
                )
              })}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card h-32 skeleton" />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="card flex flex-col items-center px-4 py-16 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-surface text-faint">
                  <Building2 className="h-6 w-6" />
                </span>
                <h3 className="t-h3 mt-4 text-ink">No venues listed yet</h3>
                <p className="mt-2 text-sm text-muted">Check back soon — new shows are added every week.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((v) => (
                  <Link
                    key={v.name}
                    to={`/events?q=${encodeURIComponent(v.name)}`}
                    className="card card-hover group relative flex gap-4 overflow-hidden p-3"
                  >
                    <Img
                      src={v.next.image}
                      alt=""
                      loading="lazy"
                      className="h-28 w-20 shrink-0 rounded-lg border border-line bg-surface"
                    />
                    <div className="flex min-w-0 flex-1 flex-col py-1 pr-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-ink transition-colors group-hover:text-blue">
                          {v.name}
                        </h3>
                        <span className="shrink-0 rounded-full bg-blue-light px-2 py-0.5 text-xs font-semibold text-blue">
                          {v.count} {plural(v.count, 'show')}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1 truncate text-sm text-muted">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-faint" />
                        <span className="truncate">{v.metro}</span>
                      </p>
                      <p className="mt-auto flex items-center gap-1.5 truncate pt-3 text-xs text-faint">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-blue" />
                        <span className="truncate">
                          Next: <span className="font-medium text-ink">{fmtDateShort(v.next.start)}</span> · {v.next.title}
                        </span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!showAll && city === 'all' && filtered.length > PREVIEW && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" onClick={() => setShowAll(true)}>
                  Show all {filtered.length} venues
                </Button>
              </div>
            )}
          </Reveal>
        </section>

        {/* Major stages — bento grid, text over imagery */}
        <section className="section">
          <Reveal>
            <SectionHead
              eyebrow="Across Australia"
              title="Major stages we ticket"
              blurb="The halls, theatres and arenas our organisers book most."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[260px_260px_260px]">
              {NOTABLE_VENUES.map((v, i) => (
                <Link
                  key={v.name}
                  to={`/events?city=${encodeURIComponent(v.city)}`}
                  className={cx(
                    'group relative isolate block min-h-64 overflow-hidden rounded-[20px] bg-ink shadow-md',
                    i === 0 && 'sm:col-span-2 lg:row-span-2 lg:min-h-0',
                  )}
                >
                  <Img
                    src={v.image}
                    alt={v.name}
                    loading="lazy"
                    className="absolute inset-0 -z-10 h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/30 to-black/0" />

                  <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink backdrop-blur">
                    <Users className="h-3.5 w-3.5 text-blue" />
                    {v.capacity}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <span className="t-label text-white/70">
                      {v.city}, {v.state}
                    </span>
                    <h3 className={cx('mt-2 font-bold tracking-tight text-white', i === 0 ? 't-h2' : 'text-xl')}>
                      {v.name}
                    </h3>
                    <p className="mt-1 text-sm text-white/70">{v.type}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                      {v.city} events
                      <Arrow className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Next on stage */}
        <section className="section">
          <Reveal>
            <SectionHead
              title="Next on stage"
              blurb="The soonest shows at any venue."
              action={
                <Button to="/events" variant="outline" size="sm">
                  All events
                  <Arrow className="h-4 w-4" />
                </Button>
              }
            />
            <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-4">
              {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              {live.slice(0, 4).map((e, i) => (
                <PosterCard key={e.slug} event={e} index={i} />
              ))}
            </div>
          </Reveal>
        </section>

        {/* Venue partner CTA, same espresso panel as the home page */}
        <section className="section">
          <Reveal>
            <DarkCta
              label="For venues"
              title="Run a venue? Let’s fill it."
              body="We bring the box office — online sales, seating maps and door scanning — and the promoters who book your stage."
              action="Partner with us"
            />
          </Reveal>
        </section>
      </div>
    </>
  )
}
