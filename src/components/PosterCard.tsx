import { Link } from 'react-router-dom'
import type { EventItem } from '../data/events'
import { fmtDay, fmtMonth, fmtTime, fmtWeekday, money, urgency } from '../lib/format'
import { Badge, Img } from './Primitives'
import { Arrow, Cal, Pin } from './Icons'

const soldOut = (e: EventItem) => e.tiers.length > 0 && e.tiers.every((t) => t.availability === 'SoldOut')

export function PosterCard({ event, index = 0 }: { event: EventItem; index?: number }) {
  const soon = urgency(event.start)
  const sold = soldOut(event)

  return (
    <Link to={`/event/${event.slug}`} className="card card-hover group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/11] bg-surface">
        <Img src={event.image} alt={`${event.title} poster`} loading={index < 4 ? 'eager' : 'lazy'} className="h-full" />
        <div className="absolute left-3 top-3">
          <Badge tone="neutral">{event.category}</Badge>
        </div>
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
          {event.presale && <Badge tone="warning">Presale</Badge>}
          {sold && <Badge tone="danger">Sold out</Badge>}
          {!sold && soon && <Badge tone="success">{soon}</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium text-blue">
            <Cal className="h-4 w-4 shrink-0" />
            {event.presale
              ? 'Dates to be announced'
              : `${fmtWeekday(event.start)} ${fmtDay(event.start)} ${fmtMonth(event.start)} · ${fmtTime(event.start)}`}
          </p>
          <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-blue">
            {event.title}
          </h3>
          <p className="mt-2 flex items-center gap-2 text-xs text-muted">
            <Pin className="h-4 w-4 shrink-0 text-faint" />
            <span className="truncate">{event.presale ? 'Australia & New Zealand' : [event.venue, event.metro].filter(Boolean).join(', ')}</span>
          </p>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
          <div>
            <p className="text-xs text-faint">From</p>
            <p className="text-sm font-semibold text-ink">{event.low !== undefined ? money(event.low) : 'TBA'}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-blue">
            Tickets
            <Arrow className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/** Compact row used in date-grouped lists. */
export function EventRow({ event }: { event: EventItem }) {
  return (
    <Link
      to={`/event/${event.slug}`}
      className="group grid grid-cols-[56px_1fr_auto] items-center gap-4 rounded-lg p-3 transition-colors duration-150 hover:bg-surface sm:grid-cols-[56px_64px_1fr_auto]"
    >
      <div className="flex flex-col items-center rounded-lg bg-blue-light py-2 text-blue">
        <span className="t-label">{fmtMonth(event.start)}</span>
        <span className="text-lg font-bold leading-none">{fmtDay(event.start)}</span>
      </div>

      <Img src={event.image} alt="" loading="lazy" className="hidden h-16 w-16 rounded-lg border border-line sm:block" />

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{event.category}</Badge>
          {event.presale && <Badge tone="warning">Presale</Badge>}
        </div>
        <h3 className="mt-1 truncate text-sm font-semibold text-ink transition-colors group-hover:text-blue">{event.title}</h3>
        <p className="truncate text-xs text-muted">{[event.venue, event.metro].filter(Boolean).join(' · ')}</p>
      </div>

      <div className="text-right">
        <p className="text-xs text-faint">From</p>
        <p className="text-sm font-semibold text-ink">{event.low !== undefined ? money(event.low) : 'TBA'}</p>
      </div>
    </Link>
  )
}
