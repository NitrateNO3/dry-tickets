import { Link } from 'react-router-dom'
import type { EventItem } from '../data/events'
import { fmtDay, fmtMonth, fmtTime, fmtWeekday, money, urgency } from '../lib/format'
import { Badge } from './Primitives'
import { Arrow, Cal, Pin, Ticket } from './Icons'

/**
 * Event card matching the reference style:
 * Clean white cards, border #E2E8F0, border radius 12-14px, subtle shadow.
 * Top: Natural event image with small category badge.
 * Below: Date + time, Event title, Location icon + venue, City, Price on right ("From $XX AUD"), Bottom "View Tickets →".
 */
export function PosterCard({ event, index = 0 }: { event: EventItem; index?: number }) {
  const soon = urgency(event.start)
  const sold = event.tiers.length > 0 && event.tiers.every((t) => t.availability === 'SoldOut')

  return (
    <Link
      to={`/event/${event.slug}`}
      className="group relative block focus-visible:outline-none h-full"
      style={{ '--i': index } as React.CSSProperties}
    >
      <div className="relative flex flex-col h-full overflow-hidden rounded-[14px] bg-white border border-line shadow-2xs transition-all duration-200 group-hover:-translate-y-1 group-hover:border-slate-300 group-hover:shadow-md">
        {/* Large event image at the top - 100% natural, no color overlay */}
        <div className="relative aspect-[16/11] overflow-hidden bg-surface-2 rounded-t-[13px]">
          <img
            src={event.image}
            alt={`${event.title} poster`}
            loading={index < 4 ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
          />

          {/* Small Tasteful Category Badge on image */}
          <div className="absolute left-3 top-3">
            <span className="inline-block rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue border border-line shadow-xs">
              {event.category}
            </span>
          </div>

          {/* Status Badges if applicable */}
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
            {event.presale && <Badge tone="gold">Presale</Badge>}
            {sold && <Badge tone="ember">Sold Out</Badge>}
            {!sold && soon && <Badge tone="mint">{soon}</Badge>}
          </div>
        </div>

        {/* Content Body Below Image */}
        <div className="p-4 flex flex-col flex-1 justify-between bg-white">
          <div>
            {/* Date + Time */}
            <p className="text-[12px] font-semibold text-blue flex items-center gap-1.5">
              <Cal className="h-3.5 w-3.5 text-blue shrink-0" />
              <span>
                {event.presale
                  ? 'VIP Presale Active'
                  : `${fmtWeekday(event.start)}, ${fmtDay(event.start)} ${fmtMonth(event.start)}${
                      event.start ? ` • ${fmtTime(event.start)}` : ''
                    }`}
              </span>
            </p>

            {/* Event Title */}
            <h3 className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-snug text-cream transition-colors group-hover:text-blue">
              {event.title}
            </h3>

            {/* Location icon + venue & city */}
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
              <Pin className="h-3.5 w-3.5 shrink-0 text-faint group-hover:text-blue transition-colors" />
              <span className="truncate">
                {event.presale ? 'Australian Tour' : `${event.venue || 'Major Arena'}, ${event.metro}`}
              </span>
            </p>
          </div>

          {/* Price on right & View Tickets CTA */}
          <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-faint">From</p>
              <p className="text-[14px] font-black text-cream leading-tight">
                {event.low !== undefined ? `${money(event.low)} AUD` : 'VIP Presale'}
              </p>
            </div>

            <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-blue group-hover:text-blue-dark transition-colors">
              <span>View Tickets</span>
              <Arrow className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/** Compact horizontal row used in calendar / list view */
export function EventRow({ event }: { event: EventItem }) {
  return (
    <Link
      to={`/event/${event.slug}`}
      className="group grid grid-cols-[64px_1fr_auto] items-center gap-4 rounded-[14px] p-3.5 bg-white border border-line transition-all duration-200 hover:border-slate-300 hover:shadow-xs sm:grid-cols-[72px_76px_1fr_auto] sm:gap-5 sm:p-4"
    >
      {/* Date badge */}
      <div className="flex flex-col items-center justify-center rounded-xl bg-blue-light py-2 px-1 text-blue border border-blue/15">
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {fmtMonth(event.start)}
        </span>
        <span className="text-lg font-black leading-none mt-0.5">
          {fmtDay(event.start)}
        </span>
        <span className="text-[9px] font-semibold mt-0.5 text-blue/75">
          {fmtWeekday(event.start)}
        </span>
      </div>

      {/* Thumbnail */}
      <img
        src={event.image}
        alt=""
        loading="lazy"
        className="hidden h-18 w-18 rounded-xl object-cover border border-line sm:block"
      />

      {/* Middle info */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue bg-blue-light border border-blue/20">
            {event.category}
          </span>
          {event.presale && <Badge tone="gold">Presale</Badge>}
        </div>

        <h3 className="mt-1 truncate text-base font-bold text-cream group-hover:text-blue transition-colors">
          {event.title}
        </h3>

        <p className="mt-0.5 text-xs text-muted truncate">
          {event.venue || 'Major Arena'} · {event.metro}
        </p>
      </div>

      {/* Right price & CTA */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-sm font-black text-cream">
          {event.low ? `${money(event.low)} AUD` : 'Presale'}
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue px-3.5 py-1 text-xs font-bold text-white shadow-xs group-hover:bg-blue-dark transition-colors">
          <Ticket className="h-3 w-3" />
          Tickets
        </span>
      </div>
    </Link>
  )
}
