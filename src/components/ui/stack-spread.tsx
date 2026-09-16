// Adapted from Hyperiux Vault "Stack Spread" (Linear-to-Orbit Edition).
// Generic: cards, centre copy and per-card content are all passed in.
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface StackSpreadItem {
  src: string
  alt?: string
}

export interface StackSpreadTarget {
  /** Centre offset from the stage centre, in vw / vh. */
  x: number
  y: number
  rotate: number
  scale?: number
  /** Card width in vw. */
  w: number
  /** Card height in vh — ignored when the stage has an `aspectRatio`. */
  h?: number
}

export interface StackSpreadCard {
  id?: string
  item: StackSpreadItem
  target: StackSpreadTarget
  targetSm?: { x: number; y: number; w?: number }
  linearRotate?: number
  linearOffset?: { x: number; y: number }
  linearOffsetSm?: { x: number; y: number }
  hideOnSmall?: boolean
  z?: number
}

const SCATTER_START = 0.1
const SCATTER_END = 0.8
const PARALLAX_INTENSITY = 2.4
const POINTER_SPRING = { stiffness: 80, damping: 22, mass: 0.7 }
const PROGRESS_SPRING = { stiffness: 120, damping: 32, restDelta: 0.0001 }
const HOVER_SPRING = { type: 'spring', stiffness: 320, damping: 24 } as const

const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p)

function useIsSmall() {
  const [small, setSmall] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const read = () => setSmall(mq.matches)
    read()
    mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [])
  return small
}

function usePointerParallax(active: boolean, enabled: boolean) {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, POINTER_SPRING)
  const y = useSpring(rawY, POINTER_SPRING)

  useEffect(() => {
    if (!enabled || !active) {
      rawX.set(0)
      rawY.set(0)
      return
    }
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2)
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    const onLeave = () => {
      rawX.set(0)
      rawY.set(0)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [active, enabled, rawX, rawY])

  return { x, y }
}

function Card({
  card,
  eased,
  flat,
  isSmall,
  aspectRatio,
  stackScale,
  cardRadius,
  pointer,
  index,
  total,
  spread,
  children,
}: {
  card: StackSpreadCard
  eased: MotionValue<number>
  flat: boolean
  isSmall: boolean
  aspectRatio?: number
  stackScale: number
  cardRadius: number
  pointer: { x: MotionValue<number>; y: MotionValue<number> }
  index: number
  total: number
  spread: boolean
  children: ReactNode
}) {
  const { target } = card
  const sm = isSmall ? card.targetSm : undefined

  const start = (isSmall && card.linearOffsetSm) || card.linearOffset || { x: 0, y: 0 }
  const endX = sm?.x ?? target.x
  const endY = sm?.y ?? target.y
  const startRotate = flat ? 0 : (card.linearRotate ?? 0)
  const endRotate = flat || isSmall ? 0 : target.rotate
  const restScale = target.scale ?? 1
  const w = sm?.w ?? target.w

  // Nearer cards (higher index) drift further with the pointer.
  const depth = 0.5 + (index / (total - 1 || 1)) * 0.7

  const translate = useTransform([eased, pointer.x, pointer.y], ([p, px, py]: number[]) => {
    const dx = start.x + (endX - start.x) * p - px * PARALLAX_INTENSITY * depth * p
    const dy = start.y + (endY - start.y) * p - py * PARALLAX_INTENSITY * depth * p
    return `calc(-50% + ${dx}vw) calc(-50% + ${dy}vh)`
  })
  const rotate = useTransform(eased, [0, 1], [startRotate, endRotate])
  const scale = useTransform(eased, [0, 1], [stackScale, restScale])

  // With an aspect ratio, cap width by viewport height too so short screens don't overflow.
  const size = aspectRatio
    ? { width: `min(${w}vw, ${w * aspectRatio * 1.6}vh)`, aspectRatio: String(aspectRatio) }
    : { width: `${w}vw`, height: `${target.h ?? w}vh` }

  const hoverable = spread && !isSmall && !flat

  return (
    <motion.div
      className={`absolute left-1/2 top-1/2 will-change-transform ${hoverable ? 'hover:z-[100]!' : ''}`}
      style={{ ...size, zIndex: card.z ?? index + 1, translate, rotate, scale }}
    >
      <motion.div
        className="h-full w-full"
        whileHover={hoverable ? { y: -12, scale: 1.06, transition: HOVER_SPRING } : undefined}
        transition={HOVER_SPRING}
      >
        <div
          className="relative h-full w-full overflow-hidden shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)] ring-1 ring-black/10 transition-shadow duration-300 hover:shadow-[0_32px_70px_-18px_rgba(15,23,42,0.55)]"
          style={{ borderRadius: cardRadius }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

export interface StackSpreadProps {
  cards: StackSpreadCard[]
  /** Section height in vh — how much scrolling the spread takes. */
  scrollLength?: number
  /** Width / height. When set, cards keep this ratio (e.g. posters). */
  aspectRatio?: number
  stackScale?: number
  cardRadius?: number
  /** Pixels reserved at the top of the sticky stage, e.g. for a fixed nav. */
  topOffset?: number
  textFadeStart?: number
  hint?: string | null
  className?: string
  /** Centre copy revealed as the cards spread. */
  children?: ReactNode
  renderCard?: (card: StackSpreadCard, index: number, state: { spread: boolean }) => ReactNode
}

export default function StackSpread({
  cards,
  scrollLength = 300,
  aspectRatio,
  stackScale = 0.72,
  cardRadius = 12,
  topOffset = 0,
  textFadeStart = 0.3,
  hint = 'Scroll to expand',
  className = '',
  children,
  renderCard,
}: StackSpreadProps) {
  const wrapRef = useRef<HTMLElement>(null)
  const reduce = useReducedMotion() === true
  const isSmall = useIsSmall()

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, PROGRESS_SPRING)
  const progress = useTransform(smooth, [0, SCATTER_START, SCATTER_END, 1], [0, 0, 1, 1])
  // Ease once here so position, rotation and scale all move on the same curve.
  const eased = useTransform(progress, easeInOut)

  const [spread, setSpread] = useState(false)
  useMotionValueEvent(progress, 'change', (p) => {
    setSpread((was) => (was ? p > 0.97 : p >= 0.995))
  })

  const pointer = usePointerParallax(spread, !reduce && !isSmall)

  const copyOpacity = useTransform(progress, [textFadeStart, textFadeStart + 0.3], [0, 1])
  const copyScale = useTransform(progress, [textFadeStart, 0.85], [0.92, 1])
  const copyY = useTransform(progress, [textFadeStart, 0.85], [24, 0])
  const hintOpacity = useTransform(progress, [0, SCATTER_START], [1, 0])

  const visible = isSmall ? cards.filter((c) => !c.hideOnSmall) : cards

  return (
    <section
      ref={wrapRef}
      className={`relative w-full select-none ${className}`}
      style={{ height: `${scrollLength}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40 blur-[110px]"
        >
          <div className="h-[46vw] w-[46vw] rounded-full bg-blue/15" />
        </div>

        <div className="absolute inset-x-0 bottom-0" style={{ top: topOffset }}>
          {children && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-[5] flex flex-col items-center justify-center px-6 text-center"
              style={{ opacity: copyOpacity, scale: reduce ? 1 : copyScale, y: reduce ? 0 : copyY }}
            >
              {children}
            </motion.div>
          )}

          <div className="absolute inset-0 z-10">
            {visible.map((card, i) => (
              <Card
                key={card.id ?? card.item.src}
                card={card}
                eased={eased}
                flat={reduce}
                isSmall={isSmall}
                aspectRatio={aspectRatio}
                stackScale={stackScale}
                cardRadius={cardRadius}
                pointer={pointer}
                index={i}
                total={visible.length}
                spread={spread}
              >
                {renderCard ? (
                  renderCard(card, i, { spread })
                ) : (
                  <img
                    src={card.item.src}
                    alt={card.item.alt ?? ''}
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </Card>
            ))}
          </div>
        </div>

        {hint && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-[4vh] z-20 flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted"
            style={{ opacity: hintOpacity }}
          >
            <span>{hint}</span>
            <div className="relative h-7 w-px overflow-hidden bg-current/25">
              <motion.div
                className="absolute inset-x-0 top-0 h-full bg-current"
                animate={{ y: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
