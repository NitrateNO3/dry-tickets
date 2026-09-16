import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { liveEvents } from '../data/events'
import { plural } from '../lib/copy'
import { PosterCard } from '../components/PosterCard'
import { Button, Chip, Img, Meta, Reveal, SectionHead } from '../components/Primitives'
import { Arrow, Pin } from '../components/Icons'

const NOTABLE_VENUES = [
  {
    name: 'Sydney Opera House',
    city: 'Sydney',
    state: 'NSW',
    type: 'Concert hall',
    capacity: '5,738',
    image: 'https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?auto=format&fit=crop&w=800&q=80',
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

export default function Venues() {
  const venueStats = useMemo(() => {
    const map = new Map<string, { name: string; metro: string; count: number }>()
    for (const e of liveEvents) {
      if (!e.venue) continue
      const v = map.get(e.venue)
      if (v) v.count += 1
      else map.set(e.venue, { name: e.venue, metro: e.metro, count: 1 })
    }
    return [...map.values()]
  }, [])

  const cities = useMemo(() => [...new Set(venueStats.map((v) => v.metro))].sort(), [venueStats])
  const [city, setCity] = useState('all')
  const filtered = city === 'all' ? venueStats : venueStats.filter((v) => v.metro === city)

  return (
    <div className="wrap page-top">
      <Meta
        title="Venues"
        description={`${venueStats.length} venues with upcoming shows on Dry Tickets, plus the major stages we ticket across Australia.`}
      />

      <div className="max-w-3xl">
        <span className="t-label text-blue">Venues</span>
        <h1 className="t-h1 mt-3 text-ink">Where the shows are</h1>
        <p className="t-lede mt-4">Venues with tickets on sale now, and the major stages we regularly ticket.</p>
      </div>

      <section className="section">
        <Reveal>
          <SectionHead title="Venues with upcoming shows" blurb="Select a venue to see its events." />
          <div className="mb-6 flex flex-wrap gap-2">
            <Chip active={city === 'all'} onClick={() => setCity('all')}>
              All cities
            </Chip>
            {cities.map((c) => (
              <Chip key={c} active={city === c} onClick={() => setCity(c)}>
                {c}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => (
              <Link
                key={v.name}
                to={`/events?q=${encodeURIComponent(v.name)}`}
                className="card card-hover group flex items-center justify-between gap-4 p-4"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink transition-colors group-hover:text-blue">
                    {v.name}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-sm text-muted">
                    <Pin className="h-4 w-4 text-faint" />
                    {v.metro}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-medium text-blue">
                  {v.count} {plural(v.count, 'show')}
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section">
        <Reveal>
          <SectionHead title="Major stages we ticket" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {NOTABLE_VENUES.map((v) => (
              <Link key={v.name} to={`/events?city=${encodeURIComponent(v.city)}`} className="card card-hover group block overflow-hidden">
                <Img src={v.image} alt={v.name} loading="lazy" className="aspect-[16/10] bg-surface" />
                <div className="p-4">
                  <h3 className="text-base font-semibold text-ink transition-colors group-hover:text-blue">{v.name}</h3>
                  <p className="text-sm text-muted">
                    {v.type} · {v.city}, {v.state}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
                    <span className="text-muted">Capacity {v.capacity}</span>
                    <span className="inline-flex items-center gap-1 font-medium text-blue">
                      {v.city} events
                      <Arrow className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section">
        <Reveal>
          <SectionHead
            title="Next on stage"
            action={
              <Button to="/events" variant="outline" size="sm">
                All events
                <Arrow className="h-4 w-4" />
              </Button>
            }
          />
          <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {liveEvents.slice(0, 4).map((e, i) => (
              <PosterCard key={e.slug} event={e} index={i} />
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  )
}
