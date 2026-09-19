// Adapted from Great UI "Diagonal Marquee Carousel" (MIT): https://great-ui.com
// Author: Saurabh Sharma — https://github.com/Saurabh-2607/GreatUI
// Local change: optional `onCardClick` so cards can open the event they show.
import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export interface CardItem {
  id: string | number
  url: string
  title: string
}

export interface DiagonalMarqueeCarouselProps {
  cards?: CardItem[]
  angle?: number
  baseSpeed?: number
  alternateDirections?: boolean
  className?: string
  cardClassName?: string
  fadeClassName?: string
  onCardClick?: (card: CardItem) => void
}

const DEFAULT_CARDS: CardItem[] = [
  { id: 1, url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80', title: 'Concert crowd' },
  { id: 2, url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80', title: 'Live stage' },
  { id: 3, url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80', title: 'Guitarist' },
  { id: 4, url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', title: 'Stage lights' },
  { id: 5, url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80', title: 'Arena show' },
  { id: 6, url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80', title: 'Festival' },
]

const Card = ({
  card,
  className,
  onClick,
}: {
  card: CardItem
  className?: string
  onClick?: (card: CardItem) => void
}) => (
  <div
    onClick={onClick && (() => onClick(card))}
    className={cn(
      'group relative h-[300px] w-[400px] shrink-0 overflow-hidden rounded-xl shadow-2xl',
      onClick && 'cursor-pointer',
      className,
    )}
  >
    <img
      src={card.url}
      alt={card.title}
      decoding="async"
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/10" />
  </div>
)

const MarqueeRow = ({
  cards,
  speed,
  direction,
  cardClassName,
  onCardClick,
}: {
  cards: CardItem[]
  speed: number
  direction: 1 | -1
  cardClassName?: string
  onCardClick?: (card: CardItem) => void
}) => {
  const animationClass = direction === -1 ? 'animate-marquee-left' : 'animate-marquee-right'

  return (
    <div className="flex w-full overflow-hidden">
      <div
        className={cn('flex shrink-0 hover:[animation-play-state:paused]', animationClass)}
        style={{ '--speed': `${speed}s` } as CSSProperties}
      >
        {(['a', 'b'] as const).map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 'b' || undefined}>
            {cards.map((card, idx) => (
              <div key={`${card.id}-${idx}-${copy}`} className="shrink-0 pr-8">
                <Card card={card} className={cardClassName} onClick={onCardClick} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DiagonalMarqueeCarousel({
  cards = DEFAULT_CARDS,
  angle = -25,
  baseSpeed = 120,
  alternateDirections = true,
  className = '',
  cardClassName = '',
  fadeClassName = '',
  onCardClick,
}: DiagonalMarqueeCarouselProps) {
  const rowCards = [...cards, ...cards, ...cards]
  const rowCardsReverse = [...rowCards].reverse()
  const back = alternateDirections ? 1 : -1

  const rows: { cards: CardItem[]; speed: number; direction: 1 | -1 }[] = [
    { cards: rowCards, speed: baseSpeed, direction: -1 },
    { cards: rowCardsReverse, speed: baseSpeed - 15 > 20 ? baseSpeed - 15 : 30, direction: back },
    { cards: rowCards, speed: baseSpeed + 15, direction: -1 },
    { cards: rowCardsReverse, speed: baseSpeed - 6 > 20 ? baseSpeed - 6 : 35, direction: back },
    { cards: rowCards, speed: baseSpeed + 24, direction: -1 },
  ]

  return (
    <div className={cn('relative flex h-screen w-full items-center justify-center overflow-hidden', className)}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee-left { animation: marquee-left var(--speed) linear infinite; }
        .animate-marquee-right { animation: marquee-right var(--speed) linear infinite; }
      `,
        }}
      />
      <div className="absolute z-0 flex w-[200vw] flex-col gap-8" style={{ transform: `rotate(${angle}deg)` }}>
        {rows.map((r, i) => (
          <MarqueeRow key={i} {...r} cardClassName={cardClassName} onCardClick={onCardClick} />
        ))}
      </div>

      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-10 h-1/4 bg-gradient-to-b from-white to-transparent',
          fadeClassName,
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/4 bg-gradient-to-t from-white to-transparent',
          fadeClassName,
        )}
      />
    </div>
  )
}
