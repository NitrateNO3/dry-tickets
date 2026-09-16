import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEvent, liveEvents } from '../data/events'
import { cx, fmtDate, fmtTime, money } from '../lib/format'
import { blurbOf, plural } from '../lib/copy'
import { PosterCard } from '../components/PosterCard'
import { CheckoutModal } from '../components/CheckoutModal'
import { Badge, Button, Img, Input, Meta, Reveal, SectionHead } from '../components/Primitives'
import { Arrow, Cal, Check, Pin, Shield, Star, Ticket } from '../components/Icons'
import NotFound from './NotFound'

// ponytail: placeholder rate (see README) — replace with the real fee schedule.
const BOOKING_FEE_RATE = 0.045

const notes = [
  'Mobile e-ticket accepted at the door',
  'Photo ID required for 18+ areas',
  'Seating as allocated on your ticket',
  'Booking fee shown before payment',
]

export default function EventDetail() {
  const { slug } = useParams()
  const event = slug ? getEvent(slug) : undefined

  const [tierIdx, setTierIdx] = useState(0)
  const [qty, setQty] = useState(2)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [notify, setNotify] = useState<'idle' | 'sending' | 'done'>('idle')

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
            .slice(0, 4)
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
  const where = [event.venue, event.metro].filter(Boolean).join(', ')

  return (
    <div className="pb-24">
      <Meta
        title={event.title}
        description={`${event.presale ? 'Presale' : fmtDate(event.start)} · ${where}. ${
          event.low !== undefined ? `Tickets from ${money(event.low)}.` : 'Register for presale access.'
        }`}
        image={event.image}
      />

      <div className="wrap page-top">
        <nav aria-label="Breadcrumb" className="mb-6 flex min-w-0 items-center gap-2 text-sm text-muted">
          <Link to="/" className="hover:text-ink">
            Home
          </Link>
          <span aria-hidden>/</span>
          <Link to="/events" className="hover:text-ink">
            Events
          </Link>
          <span aria-hidden>/</span>
          <Link to={`/events?city=${encodeURIComponent(event.metro)}`} className="hover:text-ink">
            {event.metro}
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate font-medium text-ink">{event.title}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[400px_1fr] lg:gap-16">
          {/* Poster */}
          <div className="lg:sticky lg:top-24">
            <Img
              src={event.image}
              alt={`${event.title} poster`}
              fetchPriority="high"
              className="aspect-[460/651] rounded-xl border border-line shadow-xs"
            />
            <ul className="card mt-4 space-y-3 p-4 text-sm text-ink">
              <li className="flex items-center gap-3">
                <Shield className="h-4 w-4 shrink-0 text-success" />
                Official ticket from the primary seller
              </li>
              <li className="flex items-center gap-3">
                <Ticket className="h-4 w-4 shrink-0 text-blue" />
                E-ticket by email and SMS
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 shrink-0 text-blue" />
                Support on 0452 337 387
              </li>
            </ul>
          </div>

          {/* Details + booking */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">{event.category}</Badge>
              {event.presale && <Badge tone="warning">Presale</Badge>}
              {event.rating && (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-ink">
                  <Star className="h-4 w-4 text-warning" />
                  {event.rating.toFixed(1)}
                  <span className="font-normal text-muted">
                    ({event.ratingCount} {plural(event.ratingCount ?? 0, 'review')})
                  </span>
                </span>
              )}
            </div>

            <h1 className="t-h1 mt-4 text-ink">{event.title}</h1>

            <div className="card mt-6 grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-light text-blue">
                  <Cal className="h-5 w-5" />
                </span>
                <div>
                  <span className="t-label text-faint">Date</span>
                  <p className="mt-1 text-sm font-semibold text-ink">{fmtDate(event.start)}</p>
                  {event.start && <p className="text-sm text-muted">Doors {fmtTime(event.start)} (Sydney time)</p>}
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-light text-blue">
                  <Pin className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <span className="t-label text-faint">Venue</span>
                  <p className="mt-1 truncate text-sm font-semibold text-ink">{event.venue ?? 'To be announced'}</p>
                  <p className="truncate text-sm text-muted">{event.metro}</p>
                </div>
              </div>
            </div>

            {/* Booking box */}
            <div className="card mt-8 p-6">
              {tiers.length === 0 ? (
                <div className="mx-auto max-w-sm py-4 text-center">
                  {notify === 'done' ? (
                    <>
                      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success-light text-success">
                        <Check className="h-6 w-6" />
                      </span>
                      <h2 className="t-h3 mt-4 text-ink">You're on the list</h2>
                      <p className="mt-2 text-sm text-muted">
                        We'll email your presale code before tickets go on general sale.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="t-h3 text-ink">Tickets are not on sale yet</h2>
                      <p className="mt-2 text-sm text-muted">
                        Leave your email and we'll send a presale code 24 hours before general sale.
                      </p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          setNotify('sending')
                          // ponytail: mocked — wire to the mailing-list endpoint.
                          setTimeout(() => setNotify('done'), 700)
                        }}
                        className="mt-6 space-y-3"
                      >
                        <Input type="email" required placeholder="you@example.com" aria-label="Email address" autoComplete="email" />
                        <Button type="submit" loading={notify === 'sending'} className="w-full">
                          Notify me
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <h2 className="t-label mb-4 text-faint">Choose tickets</h2>
                  <div className="space-y-2" role="group" aria-label="Ticket type">
                    {tiers.map((t, i) => {
                      const sold = t.availability === 'SoldOut'
                      const selected = i === tierIdx
                      return (
                        <button
                          key={`${t.name}-${i}`}
                          type="button"
                          disabled={sold}
                          aria-pressed={selected}
                          onClick={() => setTierIdx(i)}
                          className={cx(
                            'flex w-full items-center justify-between gap-4 rounded-lg border p-4 text-left transition-colors duration-150',
                            sold
                              ? 'cursor-not-allowed border-line bg-surface opacity-60'
                              : selected
                                ? 'border-blue bg-blue-light cursor-pointer'
                                : 'border-line bg-white hover:border-line-strong cursor-pointer',
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-ink">{t.name}</span>
                            <span className={cx('text-xs', sold ? 'text-danger' : 'text-muted')}>
                              {sold ? 'Sold out' : 'Available'}
                            </span>
                          </span>
                          <span className="shrink-0 text-sm font-semibold text-ink">{money(t.price)}</span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3">
                    <span className="text-sm font-medium text-ink">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQty((n) => Math.max(1, n - 1))}
                        disabled={qty <= 1}
                        aria-label="Fewer tickets"
                        className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-ink transition-colors hover:border-line-strong disabled:opacity-50 cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-ink" aria-live="polite">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty((n) => Math.min(10, n + 1))}
                        disabled={qty >= 10}
                        aria-label="More tickets"
                        className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-ink transition-colors hover:border-line-strong disabled:opacity-50 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
                    <div className="flex justify-between text-muted">
                      <span>
                        {qty} × {tier.name}
                      </span>
                      <span className="text-ink">{money(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Booking fee</span>
                      <span className="text-ink">{money(fee)}</span>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-line pt-3">
                      <span className="font-semibold text-ink">Total</span>
                      <span className="t-h3 text-ink">{money(total)}</span>
                    </div>
                  </div>

                  <Button size="lg" onClick={() => setIsCheckoutOpen(true)} className="mt-6 w-full">
                    Get tickets
                  </Button>
                </>
              )}
            </div>

            <section className="mt-12">
              <h2 className="t-h3 text-ink">About this event</h2>
              <p className="mt-3 text-muted">{blurbOf(event)}</p>
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {notes.map((n) => (
                  <li key={n} className="flex items-center gap-3 text-sm text-ink">
                    <Check className="h-4 w-4 shrink-0 text-success" />
                    {n}
                  </li>
                ))}
              </ul>
            </section>

            {address && (
              <section className="card mt-8 flex flex-wrap items-start justify-between gap-4 p-6">
                <div className="min-w-0">
                  <h2 className="t-label text-faint">Venue address</h2>
                  <p className="mt-2 text-sm font-semibold text-ink">{event.venue}</p>
                  <p className="text-sm text-muted">{address}</p>
                </div>
                <Button
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue} ${address}`)}`}
                  size="sm"
                  variant="outline"
                >
                  Open in Maps
                  <Arrow className="h-4 w-4" />
                </Button>
              </section>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="section">
            <Reveal>
              <SectionHead title="You might also like" blurb={`More ${event.category.toLowerCase()} and shows in ${event.metro}.`} />
              <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-4">
                {related.map((e, i) => (
                  <PosterCard key={e.slug} event={e} index={i} />
                ))}
              </div>
            </Reveal>
          </section>
        )}
      </div>

      {/* Sticky mobile booking bar */}
      {tiers.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-4 shadow-md backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-faint">From</p>
              <p className="text-base font-semibold text-ink">{money(event.low)}</p>
            </div>
            <Button className="flex-1" onClick={() => setIsCheckoutOpen(true)}>
              Get tickets
            </Button>
          </div>
        </div>
      )}

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
