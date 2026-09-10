import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getEvent, liveEvents } from '../data/events'
import { cx, fmtDate, fmtTime, money } from '../lib/format'
import { blurbOf, plural } from '../lib/copy'
import { PosterCard } from '../components/PosterCard'
import { Badge, Button, Eyebrow, Reveal, SectionHead } from '../components/Primitives'
import { Arrow, Cal, Check, Clock, Pin, Shield, Star, Ticket } from '../components/Icons'
import NotFound from './NotFound'

const BOOKING_FEE_RATE = 0.045

export default function EventDetail() {
  const { slug } = useParams()
  const event = slug ? getEvent(slug) : undefined

  const [tierIdx, setTierIdx] = useState(0)
  const [qty, setQty] = useState(2)

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
  const tier = tiers[tierIdx]
  const subtotal = tier ? tier.price * qty : 0
  const fee = subtotal * BOOKING_FEE_RATE
  const address = [event.street, event.city, event.region, event.postcode].filter(Boolean).join(', ')

  return (
    <div className="relative">
      {/* Poster-derived backdrop */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[70vh] overflow-hidden">
        <img
          src={event.image}
          alt=""
          className="h-full w-full scale-125 object-cover opacity-35 blur-3xl saturate-150"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 pt-32 sm:px-8 lg:pt-40">
        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-2 text-[12.5px] text-faint">
          <Link to="/" className="transition-colors hover:text-cream">
            Home
          </Link>
          <span>/</span>
          <Link to="/events" className="transition-colors hover:text-cream">
            Events
          </Link>
          <span>/</span>
          <span className="truncate text-muted">{event.metro}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
          {/* ------------------------------------------------------ Main */}
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge tone="mint">{event.presale ? 'Presale' : 'On sale now'}</Badge>
              <Badge>{event.category}</Badge>
              {event.rating && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-gold">
                  <Star className="h-3.5 w-3.5" />
                  {event.rating.toFixed(1)}
                  <span className="font-medium text-faint">
                    · {event.ratingCount} {plural(event.ratingCount ?? 0, 'review')}
                  </span>
                </span>
              )}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-[clamp(2.2rem,5.4vw,4.2rem)] font-extrabold"
            >
              {event.title}
            </motion.h1>

            {/* Key facts */}
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { Icon: Cal, label: 'Date', value: fmtDate(event.start) },
                {
                  Icon: Clock,
                  label: 'Doors',
                  value: event.start ? `${fmtTime(event.start)} – ${fmtTime(event.end)}` : 'TBA',
                },
                { Icon: Pin, label: 'Venue', value: event.venue ?? 'To be announced' },
              ].map((f) => (
                <div key={f.label} className="rounded-2xl bg-surface/70 p-5 hairline">
                  <span className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-faint">
                    <f.Icon className="h-3.5 w-3.5 text-saffron" />
                    {f.label}
                  </span>
                  <p className="mt-2.5 text-[14.5px] font-bold leading-snug text-cream">{f.value}</p>
                </div>
              ))}
            </div>

            {/* About */}
            <div className="mt-14">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.22em] text-saffron">
                About this event
              </h2>
              <p className="mt-5 max-w-2xl text-[16px] leading-[1.75] text-muted">
                {blurbOf(event)}
              </p>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  'Instant e-ticket delivery by email',
                  'Barcode scanned entry — no printing needed',
                  'Verified seller, no resale markups',
                  'Support Mon–Fri, 9:00am – 5:30pm AEST',
                ].map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[14px] text-cream/85">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint/15 text-mint">
                      <Check className="h-3 w-3" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Lineup */}
            {event.artists.length > 0 && (
              <div className="mt-14">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.22em] text-saffron">
                  Performing live
                </h2>
                <div className="mt-5 flex flex-wrap gap-4">
                  {event.artists.map((a) => (
                    <Link
                      key={a.name}
                      to={`/events?q=${encodeURIComponent(a.name)}`}
                      className="group flex items-center gap-4 rounded-2xl bg-surface p-3 pr-6 hairline transition-colors hover:bg-surface-2"
                    >
                      {a.image && (
                        <img
                          src={a.image}
                          alt={a.name}
                          loading="lazy"
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                      )}
                      <div>
                        <p className="text-[15px] font-bold text-cream transition-colors group-hover:text-saffron">
                          {a.name}
                        </p>
                        <p className="text-[12px] text-faint">See all dates</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Venue */}
            {event.venue && (
              <div className="mt-14">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.22em] text-saffron">
                  Getting there
                </h2>
                <div className="mt-5 overflow-hidden rounded-3xl bg-surface hairline">
                  <div className="flex flex-wrap items-center justify-between gap-5 p-7">
                    <div>
                      <h3 className="text-[19px] font-bold text-cream">{event.venue}</h3>
                      <p className="mt-1.5 text-[14px] text-muted">{address}</p>
                    </div>
                    <Button
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        `${event.venue}, ${address}`,
                      )}`}
                      variant="outline"
                    >
                      Open in Maps
                      <Arrow className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* Stylised map placeholder — keeps the layout honest without a paid map key */}
                  <div className="relative h-44 overflow-hidden border-t border-line bg-ink-2">
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-[0.18]"
                      style={{
                        backgroundImage:
                          'linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)',
                        backgroundSize: '38px 38px',
                      }}
                    />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="relative grid h-11 w-11 place-items-center rounded-full accent-bg text-ink">
                        <Pin className="h-5 w-5" />
                        <span className="absolute inset-0 animate-ping rounded-full bg-saffron/40" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------- Sidebar */}
          <aside id="tickets" className="scroll-mt-24 lg:sticky lg:top-28 lg:h-fit">
            <div className="overflow-hidden rounded-3xl bg-surface hairline">
              <img
                src={event.image}
                alt={`${event.title} poster`}
                className="aspect-[460/651] w-full object-cover"
              />

              <div className="p-6">
                {tiers.length === 0 ? (
                  <div className="text-center">
                    <Badge tone="gold">Presale</Badge>
                    <h3 className="mt-4 text-[17px] font-bold text-cream">
                      Tickets not yet on sale
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                      Register now and we'll email you a presale code before general on-sale.
                    </p>
                    <form onSubmit={(e) => e.preventDefault()} className="mt-5 space-y-3">
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        aria-label="Email for presale"
                        className="h-11 w-full rounded-full bg-ink px-5 text-[13.5px] text-cream placeholder:text-faint hairline focus:outline-none focus:ring-1 focus:ring-saffron/60"
                      />
                      <Button type="submit" className="w-full">
                        Notify me
                      </Button>
                    </form>
                  </div>
                ) : (
                  <>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-faint">
                      Select ticket
                    </h3>

                    <div className="mt-4 space-y-2">
                      {tiers.map((t, i) => {
                        const sold = t.availability === 'SoldOut'
                        return (
                          <button
                            key={`${t.name}-${i}`}
                            type="button"
                            disabled={sold}
                            onClick={() => setTierIdx(i)}
                            className={cx(
                              'flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-200',
                              sold && 'cursor-not-allowed opacity-40',
                              i === tierIdx && !sold
                                ? 'bg-saffron/12 ring-1 ring-saffron'
                                : 'bg-ink hairline hover:border-cream/20',
                            )}
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-[13.5px] font-bold text-cream">
                                {t.name}
                              </span>
                              <span className="text-[11px] font-semibold text-mint">
                                {sold ? 'Sold out' : 'Limited availability'}
                              </span>
                            </span>
                            <span className="shrink-0 text-[15px] font-extrabold text-cream">
                              {money(t.price)}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Quantity */}
                    <div className="mt-5 flex items-center justify-between rounded-xl bg-ink px-4 py-3 hairline">
                      <span className="text-[13px] font-semibold text-muted">Quantity</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQty((n) => Math.max(1, n - 1))}
                          aria-label="Decrease quantity"
                          className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-[17px] font-bold text-cream transition-colors hover:bg-saffron hover:text-ink"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-[15px] font-extrabold text-cream">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty((n) => Math.min(10, n + 1))}
                          aria-label="Increase quantity"
                          className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-[17px] font-bold text-cream transition-colors hover:bg-saffron hover:text-ink"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Totals */}
                    <dl className="mt-5 space-y-2 border-t border-line pt-5 text-[13px]">
                      <div className="flex justify-between text-muted">
                        <dt>
                          {qty} × {tier?.name}
                        </dt>
                        <dd className="font-semibold text-cream">{money(subtotal)}</dd>
                      </div>
                      <div className="flex justify-between text-muted">
                        <dt>Booking fee</dt>
                        <dd className="font-semibold text-cream">{money(fee)}</dd>
                      </div>
                      <div className="flex items-baseline justify-between border-t border-line pt-3">
                        <dt className="text-[13px] font-bold text-cream">Total</dt>
                        <dd className="text-[22px] font-extrabold text-gradient">
                          {money(subtotal + fee)}
                        </dd>
                      </div>
                    </dl>

                    <Button size="lg" className="mt-5 w-full">
                      <Ticket className="h-[18px] w-[18px]" />
                      Checkout
                    </Button>

                    <p className="mt-4 flex items-center justify-center gap-2 text-[11.5px] text-faint">
                      <Shield className="h-3.5 w-3.5 text-mint" />
                      Secure checkout · Visa, Mastercard, Amex
                    </p>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-32">
            <Reveal>
              <SectionHead eyebrow="You might also like" title="More" accent="like this" />
            </Reveal>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {related.map((e, i) => (
                <Reveal key={e.slug} delay={0.05 * i}>
                  <PosterCard event={e} index={i} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky buy bar */}
      {tiers.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 glass border-t border-line p-4 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-faint">
                From
              </p>
              <p className="text-[19px] font-extrabold leading-tight text-cream">
                {money(event.low)}
              </p>
            </div>
            <Button
              size="lg"
              className="flex-1"
              onClick={() =>
                document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <Ticket className="h-[18px] w-[18px]" />
              Get tickets
            </Button>
          </div>
        </div>
      )}
      <div className="h-20 lg:hidden" />

      <Eyebrow className="sr-only">End of event</Eyebrow>
    </div>
  )
}
