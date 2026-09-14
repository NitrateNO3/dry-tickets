import { useRef } from 'react'
import type { EventItem } from '../data/events'
import { PosterCard } from './PosterCard'
import { Arrow } from './Icons'

/** Horizontally scrollable poster rail with snap + arrow controls on desktop. */
export function Rail({ events }: { events: EventItem[] }) {
  const ref = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 720), behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8"
      >
        {events.map((e, i) => (
          <div
            key={e.slug}
            className="w-[210px] shrink-0 snap-start sm:w-[232px] lg:w-[256px]"
          >
            <PosterCard event={e} index={i} />
          </div>
        ))}
      </div>

      <div className="mt-6 hidden justify-end gap-2 lg:flex">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          className="grid h-11 w-11 place-items-center rounded-full hairline text-cream transition-all duration-200 hover:border-blue/40 hover:text-blue active:scale-95"
        >
          <Arrow className="h-4 w-4 rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className="grid h-11 w-11 place-items-center rounded-full hairline text-cream transition-all duration-200 hover:border-blue/40 hover:text-blue active:scale-95"
        >
          <Arrow className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
