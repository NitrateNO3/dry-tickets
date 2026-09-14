import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getEvent, liveEvents } from '../data/events'
import { cx, fmtDate, fmtTime, money } from '../lib/format'
import { blurbOf } from '../lib/copy'
import { PosterCard } from '../components/PosterCard'
import { CheckoutModal } from '../components/CheckoutModal'
import { Badge, Button, Reveal, SectionHead } from '../components/Primitives'
import { Arrow, Cal, Check, Pin, Shield, Star, Ticket } from '../components/Icons'
import NotFound from './NotFound'

const BOOKING_FEE_RATE = 0.045

export default function EventDetail() {
  const { slug } = useParams()
  const event = slug ? getEvent(slug) : undefined

  const [tierIdx, setTierIdx] = useState(0)
  const [qty, setQty] = useState(2)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const related = useMemo(
    () =>
      event
        ? liveEvents
            .filter(
              (e) =>
                e.slug !== event.slug &&
                (e.metro === event.metro ||
                  e.category === event.category ||
                  e.artists.some((a) => event.artists.some((b) => b.name === a.name))),
            )
            .slice(0, 5)
        : [],
    [event],
  )

  if (!event) return <NotFound />

  const tiers = [...event.tiers].sort((a, b) => a.price - b.price)
  const tier = tiers[tierIdx] || tiers[0]
  const subtotal = tier ? tier.price * qty : 0
  const fee = subtotal * BOOKING_FEE_RATE
  const total = subtotal + fee
  const address = [event.street, event.city, event.region, event.postcode].filter(Boolean).join(', ')

  return (
    <div className="relative bg-white pb-24">
      <div className="mx-auto max-w-[1400px] px-5 pt-28 sm:px-8 lg:pt-36">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted">
          <Link to="/" className="hover:text-blue transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/events" className="hover:text-blue transition-colors">
            Events
          </Link>
          <span>/</span>
          <Link to={`/events?city=${encodeURIComponent(event.metro)}`} className="hover:text-blue transition-colors">
            {event.metro}
          </Link>
          <span>/</span>
          <span className="truncate text-cream font-medium max-w-[200px]">{event.title}</span>
        </nav>

        {/* 2-Column Layout: Left = Poster Artwork, Right = Event Information & Booking Box */}
        <div className="grid gap-10 lg:grid-cols-[420px_1fr] lg:gap-14 items-start">
          {/* LEFT COLUMN: Event Poster Artwork + Guarantees */}
          <div className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-2xl bg-surface-2 border border-line shadow-xs">
              <img
                src={event.image}
                alt={`${event.title} poster`}
                fetchPriority="high"
                className="w-full aspect-[460/580] object-cover"
              />
            </div>

            {/* Quick Guarantees Below Poster */}
            <div className="mt-4 rounded-2xl bg-surface-2 p-4 border border-line space-y-2.5 text-xs text-muted">
              <div className="flex items-center gap-2 text-cream font-medium">
                <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>100% Official Verified Tickets</span>
              </div>
              <div className="flex items-center gap-2 text-cream font-medium">
                <Ticket className="h-4 w-4 text-blue shrink-0" />
                <span>Instant Mobile Barcode E-Ticket</span>
              </div>
              <div className="flex items-center gap-2 text-cream font-medium">
                <Check className="h-4 w-4 text-blue shrink-0" />
                <span>Sydney-based Australian Support</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Event Information & Booking Box */}
          <div>
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">{event.category}</Badge>
              {event.presale && <Badge tone="gold">VIP Presale</Badge>}
              <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-muted border border-line">
                {event.metro}, Australia
              </span>
              {event.rating && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {event.rating.toFixed(1)}
                  <span className="text-muted font-normal">
                    ({event.ratingCount} reviews)
                  </span>
                </span>
              )}
            </div>

            {/* Event Name */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4 text-[clamp(2rem,4.2vw,3.2rem)] font-extrabold leading-tight text-cream"
            >
              {event.title}
            </motion.h1>

            {/* Prominent Event Details */}
            <div className="mt-6 rounded-2xl bg-surface-2 p-5 border border-line">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-light text-blue shrink-0">
                    <Cal className="h-4 w-4" />
                  </span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                      Date & Time
                    </span>
                    <p className="text-sm font-bold text-cream mt-0.5">
                      {fmtDate(event.start)}
                    </p>
                    <p className="text-xs text-muted">
                      {fmtTime(event.start)} AEST
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-light text-blue shrink-0">
                    <Pin className="h-4 w-4" />
                  </span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                      Venue & Location
                    </span>
                    <p className="text-sm font-bold text-cream mt-0.5 truncate">
                      {event.venue || 'Major Venue'}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {event.metro}, Australia
                    </p>
                  </div>
                </div>
              </div>

              {/* Starting Price Header */}
              {event.low !== undefined && (
                <div className="mt-4 pt-4 border-t border-line flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-muted">Ticket Pricing</span>
                  <span className="text-sm text-muted">
                    From <strong className="text-lg font-black text-cream">{money(event.low)} AUD</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Ticket Booking Box */}
            <div className="mt-8 rounded-3xl bg-white p-6 border border-line shadow-xs">
              {tiers.length === 0 ? (
                <div className="text-center py-4">
                  <Badge tone="gold">VIP Presale</Badge>
                  <h3 className="mt-3 text-base font-bold text-cream">
                    Tickets Not Yet On Public Sale
                  </h3>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed max-w-sm mx-auto">
                    Register your email to receive an early-bird VIP presale code 24 hours prior to public release.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      alert('Thank you! You are on the presale notification list.')
                    }}
                    className="mt-4 max-w-sm mx-auto space-y-2.5"
                  >
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      aria-label="Email for presale"
                      className="h-11 w-full rounded-xl bg-white px-4 text-xs text-cream placeholder:text-muted border border-[#D0D5DD] focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-light"
                    />
                    <Button type="submit" size="md" variant="primary" className="w-full">
                      Notify Me at Presale
                    </Button>
                  </form>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                      Select Ticket Tier
                    </h3>
                    <span className="text-xs font-semibold text-blue">AUD Currency</span>
                  </div>

                  {/* Tier Selector */}
                  <div className="space-y-2.5">
                    {tiers.map((t, i) => {
                      const sold = t.availability === 'SoldOut'
                      const selected = i === tierIdx
                      return (
                        <button
                          key={`${t.name}-${i}`}
                          type="button"
                          disabled={sold}
                          onClick={() => setTierIdx(i)}
                          className={cx(
                            'flex w-full items-center justify-between gap-3 rounded-2xl p-3.5 text-left transition-all cursor-pointer border',
                            sold && 'cursor-not-allowed opacity-40 bg-gray-50 border-line',
                            selected && !sold
                              ? 'bg-blue-light border-blue text-cream ring-1 ring-blue'
                              : 'bg-white border-line hover:border-gray-300',
                          )}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-cream">{t.name}</p>
                            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                              {sold ? 'Sold Out' : 'Instant E-Ticket'}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-black text-cream">
                            {money(t.price)} AUD
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Quantity Picker */}
                  <div className="mt-5 flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3 border border-line">
                    <span className="text-xs font-bold text-cream">Number of Tickets</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQty((n) => Math.max(1, n - 1))}
                        aria-label="Decrease tickets"
                        className="grid h-8 w-8 place-items-center rounded-full bg-white border border-line text-sm font-bold text-cream hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-black text-cream">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty((n) => Math.min(10, n + 1))}
                        aria-label="Increase tickets"
                        className="grid h-8 w-8 place-items-center rounded-full bg-white border border-line text-sm font-bold text-cream hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="mt-5 space-y-2 border-t border-line pt-4 text-xs">
                    <div className="flex justify-between text-muted">
                      <span>
                        {qty} × {tier?.name || 'General Admission'}
                      </span>
                      <span className="font-semibold text-cream">{money(subtotal)} AUD</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Booking & Facility Fee</span>
                      <span className="font-semibold text-cream">{money(fee)} AUD</span>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-line pt-3 text-sm font-bold text-cream">
                      <span>Total Payable</span>
                      <span className="text-xl font-black text-cream">
                        {money(total)} AUD
                      </span>
                    </div>
                  </div>

                  {/* Primary Get Tickets Button */}
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={() => setIsCheckoutOpen(true)}
                    className="mt-6 w-full font-bold shadow-xs py-3.5"
                  >
                    <Ticket className="h-4 w-4" />
                    Get Tickets · {money(total)} AUD
                  </Button>

                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    <span>No customer sign-in required · Instant barcode delivery</span>
                  </div>
                </>
              )}
            </div>

            {/* About This Event */}
            <div className="mt-12">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue mb-3">
                About the Event
              </h2>
              <p className="text-[15px] leading-relaxed text-muted">
                {blurbOf(event)}
              </p>

              <div className="mt-6 rounded-2xl bg-surface-2 p-5 border border-line">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cream mb-3">
                  Admission & Venue Notes
                </h3>
                <ul className="grid gap-2.5 sm:grid-cols-2 text-xs text-cream">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Mobile e-ticket accepted on smartphone</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Australian ID required for 18+ areas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Reserved seating allocated on arrival</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Face-value transparent AUD booking fee</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Venue Location Details */}
            {address && (
              <div className="mt-8 rounded-2xl bg-white p-5 border border-line">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue mb-1">
                      Venue Address
                    </h3>
                    <p className="text-sm font-bold text-cream">{event.venue}</p>
                    <p className="text-xs text-muted mt-0.5">{address}</p>
                  </div>
                  <Button
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue} ${address}`)}`}
                    size="sm"
                    variant="outline"
                  >
                    Open in Maps
                    <Arrow className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Events Rail */}
        {related.length > 0 && (
          <section className="mt-24 pt-16 border-t border-line">
            <Reveal>
              <SectionHead
                eyebrow="More Shows"
                title="You might also"
                accent="like"
                blurb="Explore other popular live events happening across Australia."
              />
            </Reveal>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {related.map((e, i) => (
                <Reveal key={e.slug} delay={0.04 * i}>
                  <PosterCard event={e} index={i} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile Booking Bar */}
      {tiers.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-line p-3.5 lg:hidden shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                From
              </p>
              <p className="text-base font-black text-cream leading-none mt-0.5">
                {money(event.low)} AUD
              </p>
            </div>
            <Button
              size="md"
              variant="primary"
              className="flex-1 font-bold"
              onClick={() => setIsCheckoutOpen(true)}
            >
              <Ticket className="h-4 w-4" />
              Get Tickets
            </Button>
          </div>
        </div>
      )}

      {/* Frictionless Checkout Modal */}
      {tier && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          event={event}
          tier={tier}
          qty={qty}
          subtotal={subtotal}
          fee={fee}
          total={total}
        />
      )}
    </div>
  )
}
