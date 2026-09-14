import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { liveEvents } from '../data/events'
import { PosterCard } from '../components/PosterCard'
import { Button, Eyebrow, Reveal } from '../components/Primitives'
import { Arrow, Pin } from '../components/Icons'

const NOTABLE_VENUES = [
  {
    name: 'Sydney Opera House',
    city: 'Sydney',
    state: 'NSW',
    type: 'Concert Hall & Performing Arts',
    capacity: '5,738',
    image: 'https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Palais Theatre',
    city: 'Melbourne',
    state: 'VIC',
    type: 'Historic Concert Hall',
    capacity: '2,896',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Riverside Theatres',
    city: 'Parramatta',
    state: 'NSW',
    type: 'Theatre & Performing Arts',
    capacity: '1,200',
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'The Tivoli',
    city: 'Brisbane',
    state: 'QLD',
    type: 'Live Music & Theatre',
    capacity: '1,500',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'RAC Arena',
    city: 'Perth',
    state: 'WA',
    type: 'Major Entertainment Arena',
    capacity: '15,500',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Adelaide Entertainment Centre',
    city: 'Adelaide',
    state: 'SA',
    type: 'Arena & Theatre',
    capacity: '11,300',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
  },
]

export default function Venues() {
  const [selectedCity, setSelectedCity] = useState<string>('all')

  // Extract all unique venues from active events
  const venueStats = useMemo(() => {
    const map = new Map<string, { name: string; metro: string; count: number; sampleImage: string }>()
    for (const e of liveEvents) {
      if (!e.venue) continue
      const existing = map.get(e.venue)
      if (existing) {
        existing.count += 1
      } else {
        map.set(e.venue, {
          name: e.venue,
          metro: e.metro,
          count: 1,
          sampleImage: e.image,
        })
      }
    }
    return Array.from(map.values())
  }, [])

  const filteredVenues = selectedCity === 'all'
    ? venueStats
    : venueStats.filter((v) => v.metro.toLowerCase().includes(selectedCity.toLowerCase()))

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header */}
      <section className="border-b border-line bg-surface-2 pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <Reveal>
            <Eyebrow className="mb-3">Australian Venues</Eyebrow>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-cream">
              Iconic Stages & <span className="text-blue">Live Venues</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted">
              Discover Australia's premier concert halls, stadiums, theatres and cultural venues hosting the biggest live experiences.
            </p>

            {/* City Selector */}
            <div className="mt-8 flex flex-wrap gap-2">
              {['all', 'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold cursor-pointer border transition-all ${
                    selectedCity === city
                      ? 'bg-blue text-white border-blue font-bold shadow-xs'
                      : 'bg-white text-muted border-line hover:border-gray-300 hover:text-cream'
                  }`}
                >
                  {city === 'all' ? 'All Australia' : city}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured Australian Venues */}
      <section className="mx-auto max-w-[1400px] px-5 pt-16 sm:px-8">
        <Reveal>
          <div className="mb-8 flex items-baseline justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-cream">Premier Australian Venues</h2>
              <p className="text-xs text-muted mt-1">Leading entertainment complexes and historic auditoriums</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {NOTABLE_VENUES.map((v) => (
              <div
                key={v.name}
                className="group overflow-hidden rounded-2xl bg-white border border-line shadow-xs transition-all hover:border-gray-300 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
                  <img
                    src={v.image}
                    alt={v.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-blue border border-line shadow-xs">
                    {v.city}, {v.state}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-cream group-hover:text-blue transition-colors">
                    {v.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted">{v.type}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
                    <span className="text-muted">Capacity: {v.capacity}</span>
                    <Link
                      to={`/events?city=${encodeURIComponent(v.city)}`}
                      className="font-bold text-blue hover:underline flex items-center gap-1"
                    >
                      View Events
                      <Arrow className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Active Venues in Current Events */}
      <section className="mx-auto max-w-[1400px] px-5 pt-16 sm:px-8">
        <Reveal>
          <div className="mb-6 flex items-baseline justify-between border-b border-line pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-cream">Venues with Upcoming Shows</h2>
              <p className="text-xs text-muted mt-1">Book tickets directly for live shows at these locations</p>
            </div>
            <span className="text-xs font-semibold text-muted">{filteredVenues.length} Venues</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((v) => (
              <Link
                key={v.name}
                to={`/events?city=${encodeURIComponent(v.metro)}`}
                className="flex items-center justify-between p-4 rounded-xl bg-white border border-line hover:border-blue/50 hover:shadow-xs transition-all group cursor-pointer"
              >
                <div className="min-w-0 pr-3">
                  <h4 className="text-sm font-bold text-cream truncate group-hover:text-blue transition-colors">
                    {v.name}
                  </h4>
                  <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    <Pin className="h-3 w-3 text-blue" />
                    {v.metro}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-light px-2.5 py-1 text-xs font-bold text-blue border border-blue/20">
                  {v.count} {v.count === 1 ? 'show' : 'shows'}
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Upcoming Spotlight Events */}
      <section className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-8">
        <Reveal>
          <div className="mb-8 flex items-baseline justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-cream">Upcoming Live Experiences</h2>
              <p className="text-xs text-muted mt-1">Selected shows across Australian stages</p>
            </div>
            <Button to="/events" variant="outline" size="sm">
              All Events →
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {liveEvents.slice(0, 4).map((e, idx) => (
              <PosterCard key={e.slug} event={e} index={idx} />
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  )
}
