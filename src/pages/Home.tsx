import { Link } from 'react-router-dom'
import {
  AUSTRALIAN_CITIES,
  featuredEvents,
  liveEvents,
} from '../data/events'
import { monthKey } from '../lib/format'
import { Hero } from '../components/Hero'
import { EventRow, PosterCard } from '../components/PosterCard'
import { Button, Reveal } from '../components/Primitives'
import { Arrow, Bolt, Check, Pin, Shield, Ticket } from '../components/Icons'

const CATEGORY_CARDS = [
  {
    id: 'Concert',
    name: 'Concerts & Music',
    count: '2,340 events',
    icon: '🎵',
    bg: 'bg-[#EFF6FF]',
    border: 'border-[#DBEAFE]',
    text: 'text-[#1D4ED8]',
  },
  {
    id: 'Comedy',
    name: 'Comedy',
    count: '840 events',
    icon: '🎙️',
    bg: 'bg-[#FFF7ED]',
    border: 'border-[#FFEDD5]',
    text: 'text-[#C2410C]',
  },
  {
    id: 'Festival',
    name: 'Festivals',
    count: '420 events',
    icon: '🎪',
    bg: 'bg-[#FAF5FF]',
    border: 'border-[#F3E8FF]',
    text: 'text-[#7E22CE]',
  },
  {
    id: 'Theatre',
    name: 'Theatre',
    count: '610 events',
    icon: '🎭',
    bg: 'bg-[#FDF2F8]',
    border: 'border-[#FCE7F3]',
    text: 'text-[#BE185D]',
  },
  {
    id: 'Sports',
    name: 'Sports',
    count: '590 events',
    icon: '🏆',
    bg: 'bg-[#F0FDF4]',
    border: 'border-[#DCFCE7]',
    text: 'text-[#15803D]',
  },
  {
    id: 'Arts',
    name: 'Arts & Culture',
    count: '730 events',
    icon: '🎨',
    bg: 'bg-[#FEFCE8]',
    border: 'border-[#FEF9C3]',
    text: 'text-[#A16207]',
  },
]

const guarantees = [
  {
    Icon: Shield,
    title: '100% Official Verified Tickets',
    body: 'Direct primary ticketing seller. Every ticket is officially authorized by promoters and barcode-verified at the venue door.',
  },
  {
    Icon: Bolt,
    title: 'Instant Barcode Delivery',
    body: 'Receive your mobile e-ticket barcode immediately via email and SMS. Add to Apple Wallet or show directly on your phone.',
  },
  {
    Icon: Ticket,
    title: 'No Scalping or Resale Markups',
    body: 'Face-value transparent AUD pricing with clearly disclosed booking fees. No secondary scalper markups ever.',
  },
  {
    Icon: Check,
    title: 'Dedicated Australian Support',
    body: 'Real customer support based in Sydney. Available by phone (0452 337 387) and email Monday through Friday.',
  },
]

export default function Home() {
  // Group events by month for the calendar view
  const grouped = liveEvents.slice(0, 8).reduce<Record<string, typeof liveEvents>>((acc, e) => {
    const k = monthKey(e.start)
    ;(acc[k] ??= []).push(e)
    return acc
  }, {})

  return (
    <div className="bg-white">
      {/* 1. Large Photographic Hero Section with Search Container */}
      <Hero featured={featuredEvents} />

      {/* 2. Featured Events Section */}
      <section className="mx-auto max-w-[1400px] px-5 pt-16 sm:px-8 lg:pt-20">
        <Reveal>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-cream">
                Featured events
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-muted">
                Don't miss what's happening near you.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue hover:text-blue-dark transition-colors"
            >
              <span>View all events</span>
              <Arrow className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        {/* 4-Column Desktop Grid */}
        <Reveal delay={0.06}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEvents.slice(0, 4).map((e, idx) => (
              <PosterCard key={e.slug} event={e} index={idx} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* 3. Explore by Category Section */}
      <section className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-8 lg:pt-24">
        <Reveal>
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-cream">
              Explore by category
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-muted">
              Whatever excites you, there's an event for it.
            </p>
          </div>
        </Reveal>

        {/* Horizontal Category Cards with Soft Pastel Backgrounds */}
        <Reveal delay={0.06}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {CATEGORY_CARDS.map((cat) => (
              <Link
                key={cat.id}
                to={`/events?category=${encodeURIComponent(cat.id)}`}
                className={`group flex items-center justify-between p-5 rounded-2xl border ${cat.bg} ${cat.border} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer`}
              >
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-white shadow-2xs text-2xl shrink-0">
                    {cat.icon}
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-cream group-hover:text-blue transition-colors">
                      {cat.name}
                    </h3>
                    <p className={`text-xs font-semibold mt-0.5 ${cat.text}`}>
                      {cat.count}
                    </p>
                  </div>
                </div>

                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-muted group-hover:bg-white group-hover:text-blue transition-all">
                  <Arrow className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 4. Popular Events Section */}
      <section className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-8 lg:pt-24">
        <Reveal>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-cream">
                Popular events
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-muted">
                The events everyone's talking about.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue hover:text-blue-dark transition-colors"
            >
              <span>View all events</span>
              <Arrow className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        {/* 4-Column Desktop Grid */}
        <Reveal delay={0.06}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {liveEvents.slice(2, 6).map((e, idx) => (
              <PosterCard key={e.slug} event={e} index={idx} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* 5. City Discovery Section */}
      <section className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-8 lg:pt-24">
        <Reveal>
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-cream">
              Explore events by city
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-muted">
              Discover top live entertainment across major Australian cultural hubs.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {AUSTRALIAN_CITIES.map((c) => {
              const count = liveEvents.filter((e) => e.metro === c.name).length
              return (
                <Link
                  key={c.name}
                  to={`/events?city=${encodeURIComponent(c.name)}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-line p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-light text-blue font-bold text-xs">
                      <Pin className="h-4 w-4" />
                    </span>
                    <span className="text-[11px] font-bold text-blue bg-blue-light px-2 py-0.5 rounded-md">
                      {c.state}
                    </span>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-base sm:text-lg font-extrabold text-cream group-hover:text-blue transition-colors">
                      {c.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted truncate">
                      {count > 0 ? `${count} upcoming ${count === 1 ? 'event' : 'events'}` : 'Browse city shows'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </Reveal>
      </section>

      {/* 6. What's On This Weekend / Upcoming Calendar */}
      <section className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-8 lg:pt-24">
        <Reveal>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-cream">
                What's On This Weekend
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-muted">
                Plan your upcoming evenings across major Australian stages.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue hover:text-blue-dark transition-colors"
            >
              <span>Full event schedule</span>
              <Arrow className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="space-y-6">
          {Object.entries(grouped).map(([month, items], gi) => (
            <Reveal key={month} delay={0.04 * gi}>
              <div className="mb-3 flex items-baseline gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue">
                  {month}
                </h3>
                <span className="h-px flex-1 bg-line" />
                <span className="text-xs font-medium text-muted">
                  {items.length} {items.length === 1 ? 'show' : 'shows'}
                </span>
              </div>
              <div className="divide-y divide-line rounded-2xl bg-white border border-line p-2 shadow-2xs">
                {items.map((e) => (
                  <EventRow key={e.slug} event={e} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 7. Why Book With DryTickets (Trust Guarantees) */}
      <section className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-8">
        <div className="rounded-3xl bg-surface-2 p-8 sm:p-12 border border-line">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="inline-block rounded-full bg-blue-light px-3 py-1 text-xs font-bold text-blue border border-blue/20 mb-3">
                Guaranteed & Verified
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-cream">
                Why book with <span className="text-blue">DryTickets</span>?
              </h2>
              <p className="mt-2 text-sm text-muted">
                Australia's clean, simple and trusted marketplace for official event tickets.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {guarantees.map((p, i) => (
              <Reveal key={p.title} delay={0.04 * i}>
                <div className="h-full rounded-2xl bg-white p-6 border border-line shadow-2xs transition-all hover:shadow-sm">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-light text-blue">
                    <p.Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-bold text-cream leading-snug">{p.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Box Office Solution for Organisers */}
      <section className="mx-auto mt-20 max-w-[1400px] px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-white p-8 sm:p-12 lg:p-14 border border-line shadow-2xs">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <span className="inline-block rounded-full bg-blue-light px-3 py-1 text-xs font-bold text-blue border border-blue/20 mb-3">
                  Event Organisers
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-cream">
                  Selling a show?{' '}
                  <span className="text-blue">We manage your box office.</span>
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
                  Full Australian ticketing portals, reserved seating maps, mobile gate scanning apps, thermal hard-copy tickets, and audience promotion — all in one simple platform.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button to="/sell" size="md" variant="primary">
                    List Your Event
                    <Arrow className="h-4 w-4" />
                  </Button>
                  <Button href="tel:0452337387" variant="outline" size="md">
                    Call 0452 337 387
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {[
                  { value: '800+', label: 'Shows ticketed' },
                  { value: '600+', label: 'Artists hosted' },
                  { value: '200k+', label: 'Happy ticket holders' },
                  { value: '320+', label: 'Venues across AU & NZ' },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-surface-2 p-5 border border-line">
                    <p className="text-2xl sm:text-3xl font-black tracking-tight text-cream">
                      {s.value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 9. Clean Closing Call to Action */}
      <section className="mx-auto max-w-[1400px] px-5 pt-20 pb-20 sm:px-8 text-center">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-cream">
            Ready for your next live experience?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted max-w-md mx-auto">
            Book official tickets across Australia in minutes with instant mobile barcode delivery.
          </p>
          <div className="mt-6 flex justify-center">
            <Button to="/events" size="lg" variant="primary">
              Explore All {liveEvents.length} Events
              <Arrow className="h-4 w-4" />
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
