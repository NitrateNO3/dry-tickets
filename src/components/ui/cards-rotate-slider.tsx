// Adapted from Hyperiux Vault "Cards Rotate Slider": https://vault.hyperiux.com
// Generic: pass `items` and optionally `renderCard` for custom card content.
import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Reduced motion: a much larger perspective flattens the 3D rotation.
const REDUCED_PERSPECTIVE = '4800px'
const ROTATION_REDUCTION_FACTOR = 0.15

const MOBILE_QUERY = '(max-width: 639px)'
const TABLET_QUERY = '(min-width: 640px) and (max-width: 1024px)'

const PRESETS = {
  mobile: { step: 2, rotateIn: -60, rotateOut: 50 },
  tablet: { step: 6, rotateIn: -80, rotateOut: 65 },
  desktop: { step: 10, rotateIn: -100, rotateOut: 80 },
} as const
type Breakpoint = keyof typeof PRESETS

const ROTATE_X_NEGATIVE = 5
const ROTATE_X_POSITIVE = -5

function readBreakpoint(): Breakpoint {
  if (window.matchMedia(MOBILE_QUERY).matches) return 'mobile'
  if (window.matchMedia(TABLET_QUERY).matches) return 'tablet'
  return 'desktop'
}

/** Re-renders only when crossing a breakpoint, so the timelines rebuild with the right preset. */
function useBreakpoint() {
  const [bp, setBp] = useState<Breakpoint>(() => readBreakpoint())
  useEffect(() => {
    const queries = [MOBILE_QUERY, TABLET_QUERY].map((q) => window.matchMedia(q))
    const read = () => setBp(readBreakpoint())
    queries.forEach((mq) => mq.addEventListener('change', read))
    return () => queries.forEach((mq) => mq.removeEventListener('change', read))
  }, [])
  return bp
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const read = () => setReduced(mq.matches)
    mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [])
  return reduced
}

export interface CardsRotateSliderItem {
  id?: string
  src?: string
  text?: string
}

export interface CardsRotateSliderProps<T extends CardsRotateSliderItem = CardsRotateSliderItem> {
  items: T[]
  /** Multiplier on the per-breakpoint rotateY entrance/exit strength. */
  rotationAmount?: number
  /** Multiplier on the per-breakpoint vertical offset each card travels. */
  verticalDrift?: number
  /** ScrollTrigger scrub on the horizontal track — higher lags/smooths more. */
  scrollSmoothing?: number
  /** Perspective in px on the sticky track — lower looks deeper. */
  perspective?: number
  showCaptions?: boolean
  textColor?: string
  className?: string
  /** Overlay rendered over the sticky stage (e.g. a heading or progress). Not rotated. */
  overlay?: ReactNode
  /** Custom card content. Replaces the default image + centred caption. */
  renderCard?: (item: T, index: number) => ReactNode
}

/**
 * A scroll-pinned horizontal track of cards that rotate in from one side,
 * settle flat, then rotate out the other. Driven by GSAP ScrollTrigger with a
 * per-card timeline nested in the horizontal tween.
 */
export default function CardsRotateSlider<T extends CardsRotateSliderItem>({
  items,
  rotationAmount = 1,
  verticalDrift = 1,
  scrollSmoothing = 1,
  perspective = 1200,
  showCaptions = true,
  textColor = '#ffffff',
  className = 'bg-white',
  overlay,
  renderCard,
}: CardsRotateSliderProps<T>) {
  const outerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const wrappersRef = useRef<(HTMLDivElement | null)[]>([])
  const reducedMotion = useReducedMotion()
  const bp = useBreakpoint()

  // Outer height = horizontal travel + one viewport, so the sticky stage pins for exactly the pan.
  useEffect(() => {
    const outer = outerRef.current
    const track = trackRef.current
    if (!outer || !track) return

    const onResize = () => {
      const travel = track.scrollWidth - window.innerWidth
      outer.style.height = `${travel + window.innerHeight}px`
    }
    onResize()

    const ro = new ResizeObserver(onResize)
    ro.observe(track)
    window.addEventListener('resize', onResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [items])

  useLayoutEffect(() => {
    const outer = outerRef.current
    const track = trackRef.current
    if (!outer || !track) return

    const preset = PRESETS[bp]
    const rotationScale = reducedMotion ? ROTATION_REDUCTION_FACTOR : 1

    const ctx = gsap.context(() => {
      const horizontalTween = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: outer,
          start: 'top top',
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          scrub: reducedMotion ? true : scrollSmoothing,
          invalidateOnRefresh: true,
        },
      })

      const total = items.length
      const mid = Math.floor(total / 2)
      const step = preset.step * verticalDrift

      cardsRef.current.slice(0, total).forEach((card, index) => {
        const wrapper = wrappersRef.current[index]
        if (!card || !wrapper) return

        const offset = index < mid ? -((mid - index) * step) : (index - mid + 1) * step
        const rotateX = (offset < 0 ? ROTATE_X_NEGATIVE : ROTATE_X_POSITIVE) * rotationScale

        gsap
          .timeline({
            scrollTrigger: {
              trigger: wrapper,
              containerAnimation: horizontalTween,
              start: 'left 100%',
              end: 'right 0%',
              scrub: true,
            },
          })
          .fromTo(
            card,
            {
              rotateY: preset.rotateIn * rotationScale * rotationAmount,
              rotateX,
              opacity: 0.8,
              y: `${offset}vh`,
            },
            { rotateY: 0, rotateX: 0, opacity: 1, y: 0, ease: 'none' },
          )
          .to(card, {
            rotateY: preset.rotateOut * rotationScale * rotationAmount,
            opacity: 0.9,
            y: `${-offset}vh`,
            ease: 'none',
          })
      })
    }, outer)

    // Web fonts and late layout shift the trigger's start position — re-measure once they settle.
    ScrollTrigger.refresh()
    let cancelled = false
    document.fonts?.ready.then(() => !cancelled && ScrollTrigger.refresh())

    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [items, bp, reducedMotion, rotationAmount, verticalDrift, scrollSmoothing])

  return (
    // overflow-x: clip (not hidden) so the sticky stage keeps the viewport as its containing block.
    <div ref={outerRef} className={`relative ${className}`} style={{ overflowX: 'clip' }}>
      <div
        className="sticky top-0 flex h-screen items-center overflow-hidden"
        style={{ perspective: reducedMotion ? REDUCED_PERSPECTIVE : `${perspective}px` }}
      >
        <div
          ref={trackRef}
          className="flex h-full items-center gap-[5vw] pl-[31vw] pr-[31vw] will-change-transform max-[1025px]:gap-[8vw] max-[1025px]:pl-[22vw] max-[1025px]:pr-[22vw] max-md:gap-[12vw] max-md:pl-[12vw] max-md:pr-[12.5vw]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {items.map((item, index) => (
            <div
              key={item.id ?? index}
              ref={(el) => {
                wrappersRef.current[index] = el
              }}
              className="relative flex h-[45vh] w-[38vw] shrink-0 items-center justify-center max-[1025px]:h-[40vh] max-[1025px]:w-[55vw] max-md:h-[35vh] max-md:w-[75vw] max-[1025px]:[&>div]:h-[40vh] max-[1025px]:[&>div]:w-[50vw] max-md:[&>div]:h-[35vh] max-md:[&>div]:w-[75vw]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <RotationCard
                ref={(el) => {
                  cardsRef.current[index] = el
                }}
                zIndex={items.length - index}
              >
                {renderCard ? (
                  renderCard(item, index)
                ) : (
                  <>
                    <img
                      src={item.src}
                      alt={item.text || 'slide'}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {showCaptions && item.text && (
                      <div
                        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center text-[1.4vw] font-medium max-[1025px]:text-[2.4vw] max-md:text-[4vw]"
                        style={{
                          color: textColor,
                          textShadow: '0 0.15vw 0.35vw rgba(0,0,0,0.35), 0 0.45vw 1.2vw rgba(0,0,0,0.35)',
                        }}
                      >
                        {item.text}
                      </div>
                    )}
                  </>
                )}
              </RotationCard>
            </div>
          ))}
        </div>
        {overlay}
      </div>
    </div>
  )
}

const RotationCard = forwardRef<HTMLDivElement, { zIndex: number; children: ReactNode }>(
  ({ zIndex, children }, ref) => (
    <div
      ref={ref}
      className="absolute h-[45vh] w-[38vw] origin-right overflow-hidden rounded-2xl opacity-0 max-md:h-[35vh] max-md:w-[75vw]"
      style={{ transformStyle: 'preserve-3d', zIndex }}
    >
      {children}
    </div>
  ),
)
RotationCard.displayName = 'RotationCard'
