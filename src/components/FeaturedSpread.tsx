import { Link } from 'react-router-dom'
import StackSpread, { type StackSpreadCard } from '@/components/ui/stack-spread'
import type { EventItem } from '../data/events'
import { useEvents } from '../lib/events'
import { fmtDateShort } from '../lib/format'
import { Arrow } from './Icons'

const POSTER_RATIO = 460 / 651

// Orbit positions around the centre copy (vw / vh from centre, width in vw).
// Inner cards sit wide of the headline and button; indices 1 and 5 drop out on phones.
const LAYOUT = [
  { x: -38, y: -23, r: -6, w: 13, sm: { x: -30, y: -28 } },
  { x: -18, y: -30, r: 3, w: 11.5, sm: null },
  { x: 18, y: -31, r: -3, w: 12, sm: { x: 0, y: -30 } },
  { x: 38, y: -22, r: 5, w: 13, sm: { x: 30, y: -28 } },
  { x: -37, y: 24, r: 4, w: 12.5, sm: { x: -30, y: 28 } },
  { x: -19, y: 30, r: -3, w: 11.5, sm: null },
  { x: 19, y: 29, r: 2, w: 12, sm: { x: 0, y: 30 } },
  { x: 38, y: 23, r: -5, w: 12.5, sm: { x: 30, y: 28 } },
]
const SMALL_START_X = [-25, -15, -5, 5, 15, 25]

function pickEvents(featured: EventItem[], live: EventItem[]): EventItem[] {
  const out: EventItem[] = []
  for (const e of [...featured, ...live]) {
    if (out.length === LAYOUT.length) break
    const show = e.title.split(' - ')[0]
    if (!out.some((p) => p.slug === e.slug || p.title.split(' - ')[0] === show)) out.push(e)
  }
  return out
}

export function FeaturedSpread() {
  const { featured, live } = useEvents()
  const picks = pickEvents(featured, live)
  let smallSlot = 0

  const cards: (StackSpreadCard & { event: EventItem })[] = picks.map((event, i) => {
    const l = LAYOUT[i]
    const card: StackSpreadCard & { event: EventItem } = {
      id: event.slug,
      event,
      item: { src: event.image, alt: `${event.title} poster` },
      linearOffset: { x: -38.5 + i * 11, y: 0 },
      linearRotate: -5 + i * (10 / (LAYOUT.length - 1)),
      target: { x: l.x, y: l.y, rotate: l.r, w: l.w },
      hideOnSmall: !l.sm,
    }
    if (l.sm) {
      card.targetSm = { ...l.sm, w: 27 }
      card.linearOffsetSm = { x: SMALL_START_X[smallSlot++], y: 0 }
    }
    return card
  })

  return (
    <StackSpread
      cards={cards}
      aspectRatio={POSTER_RATIO}
      scrollLength={280}
      stackScale={0.82}
      cardRadius={14}
      topOffset={72}
      hint="Scroll to explore"
      className="bg-surface-2"
      renderCard={(card, _i, { spread }) => {
        const e = (card as (typeof cards)[number]).event
        return (
          <Link to={`/event/${e.slug}`} className="group absolute inset-0 block" draggable={false}>
            <img
              src={e.image}
              alt={card.item.alt}
              draggable={false}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 pt-10 text-white transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 ${spread ? 'opacity-100' : 'opacity-0'}`}>
              <p className="line-clamp-2 text-[12px] font-bold leading-snug max-md:hidden">{e.title}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80">
                {fmtDateShort(e.start)} · {e.metro}
              </p>
            </div>
          </Link>
        )
      }}
    >
      <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue">Featured events</span>
      <h2 className="mt-4 max-w-[16ch] text-[clamp(2rem,4.6vw,4rem)] font-black tracking-tight text-cream">
        Don't miss what's happening near you
      </h2>
      <p className="mt-4 max-w-[42ch] text-sm text-muted sm:text-base">
        {picks.length} hand-picked shows across Australia and New Zealand —{' '}
        <span className="max-md:hidden">hover</span>
        <span className="md:hidden">tap</span> a poster to see the details.
      </p>
      <Link
        to="/events"
        className="pointer-events-auto mt-7 inline-flex items-center gap-2 rounded-full bg-blue px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-dark"
      >
        View all events
        <Arrow className="h-4 w-4" />
      </Link>
    </StackSpread>
  )
}
