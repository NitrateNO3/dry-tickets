import { Link } from 'react-router-dom'
import type { EventItem } from '../data/events'
import { cx, fmtDay, fmtMonth, fmtTime, fmtWeekday, money, urgency } from '../lib/format'
import { Badge } from './Primitives'
import { Pin, Star } from './Icons'

/**
 * The poster is the product here — every card leads with the artwork at its
 * native 460x651 ratio and lets the metadata sit quietly underneath.
 */
export function PosterCard({ event, index = 0 }: { event: EventItem; index?: number }) {
  const soon = urgency(event.start)
  const sold = event.tiers.length > 0 && event.tiers.every((t) => t.availability === 'SoldOut')

  return (
    <Link
      to={`/event/${event.slug}`}
      className="group relative block focus-visible:outline-none"
      style={{ '--i': index } as React.CSSProperties}
    >
      <div className="relative overflow-hidden rounded-2xl bg-surface hairline">
        {/* Poster */}
        <div className="relative aspect-[460/651] overflow-hidden">
          <img
            src={event.image}
            alt={`${event.title} poster`}
            loading={index < 4 ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />

          {/* Scrim only at the top, where the date chip and flags sit */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/75 to-transparent" />

          {/* Date block */}
          <div className="absolute left-3.5 top-3.5 flex flex-col items-center rounded-xl bg-ink/78 px-2.5 py-2 text-center backdrop-blur-md hairline">
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-saffron">
              {fmtMonth(event.start)}
            </span>
            <span className="text-xl font-extrabold leading-none tracking-tight text-cream">
              {event.presale ? '·' : fmtDay(event.start)}
            </span>
            {!event.presale && (
              <span className="mt-0.5 text-[9px] font-semibold tracking-[0.12em] text-faint">
                {fmtWeekday(event.start)}
              </span>
            )}
          </div>

          {/* Status flags */}
          <div className="absolute right-3.5 top-3.5 flex flex-col items-end gap-1.5">
            {event.presale && <Badge tone="gold">Presale</Badge>}
            {sold && <Badge tone="ember">Sold out</Badge>}
            {!sold && soon && <Badge tone="mint">{soon}</Badge>}
          </div>

        </div>

        {/* Meta */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-[10.5px] font-bold uppercase tracking-[0.16em] text-faint">
              {event.category}
            </span>
            {event.rating && (
              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-gold">
                <Star className="h-3 w-3" />
                {event.rating.toFixed(1)}
              </span>
            )}
          </div>

          <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-snug tracking-[-0.015em] text-cream transition-colors group-hover:text-saffron">
            {event.title}
          </h3>

          <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-muted">
            <Pin className="h-3.5 w-3.5 shrink-0 text-saffron" />
            <span className="truncate">
              {event.presale ? 'Venue to be announced' : `${event.metro} · ${event.venue}`}
            </span>
          </p>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="text-[12.5px] font-bold text-cream">
              {event.low !== undefined ? (
                <>
                  <span className="text-[10.5px] font-semibold text-faint">from </span>
                  {money(event.low)}
                </>
              ) : (
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                  Coming soon
                </span>
              )}
            </span>
            <span className="text-[11.5px] font-semibold text-muted transition-colors group-hover:text-saffron">
              {event.presale ? 'Register' : fmtTime(event.start)}
            </span>
          </div>
        </div>

        {/* Hover glow */}
        <div
          className={cx(
            'pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500',
            'ring-1 ring-saffron/40 group-hover:opacity-100',
          )}
        />
      </div>
    </Link>
  )
}

/** Compact horizontal row used in date-grouped listings. */
export function EventRow({ event }: { event: EventItem }) {
  return (
    <Link
      to={`/event/${event.slug}`}
      className="group grid grid-cols-[64px_1fr_auto] items-center gap-4 rounded-2xl px-3 py-3 transition-colors duration-200 hover:bg-surface sm:grid-cols-[76px_88px_1fr_auto] sm:gap-5 sm:px-4"
    >
      <div className="flex flex-col items-center justify-center rounded-xl bg-surface-2 py-2.5 transition-colors group-hover:bg-ink">
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-saffron">
          {fmtMonth(event.start)}
        </span>
        <span className="text-[22px] font-extrabold leading-none text-cream">{fmtDay(event.start)}</span>
      </div>

      <div className="hidden aspect-[460/651] h-[88px] overflow-hidden rounded-lg sm:block">
        <img
          src={event.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <div className="min-w-0">
        <h4 className="truncate text-[15px] font-bold text-cream transition-colors group-hover:text-saffron">
          {event.title}
        </h4>
        <p className="mt-1 truncate text-[12.5px] text-muted">
          {event.venue} · {event.metro} · {fmtTime(event.start)}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden text-right text-[13px] font-bold text-cream sm:block">
          {event.low !== undefined ? `${money(event.low)}+` : '—'}
        </span>
        <span className="inline-flex h-9 items-center rounded-full bg-cream/8 px-4 text-[12px] font-bold text-cream transition-colors group-hover:bg-saffron group-hover:text-ink">
          Tickets
        </span>
      </div>
    </Link>
  )
}
