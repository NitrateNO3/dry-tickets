import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { EventItem } from '../data/events'
import { cx, fmtDate, fmtTime, money } from '../lib/format'
import { blurbOf } from '../lib/copy'
import { Button } from './Primitives'
import { Arrow, Cal, Pin, Star } from './Icons'

const ROTATE_MS = 7000

export function Hero({ featured }: { featured: EventItem[] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const event = featured[i]

  // Some posters are half-megabyte PNGs; warm them all up front so a rotation
  // never lands on an empty frame.
  useEffect(() => {
    featured.forEach((f) => {
      const img = new Image()
      img.src = f.image
    })
  }, [featured])

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => setI((n) => (n + 1) % featured.length), ROTATE_MS)
    return () => clearTimeout(t)
  }, [i, paused, featured.length])

  useEffect(() => setLoaded(false), [i])

  return (
    <section
      className="relative overflow-hidden pt-24 pb-4 lg:pt-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Backdrop built from the poster itself */}
      <AnimatePresence mode="sync">
        <motion.div
          key={event.slug}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="absolute inset-0"
          aria-hidden
        >
          <img
            src={event.image}
            alt=""
            fetchPriority="high"
            className="h-full w-full scale-125 object-cover opacity-60 blur-[110px] saturate-[1.7]"
            style={{ animation: 'float-slow 22s ease-in-out infinite' }}
          />
        </motion.div>
      </AnimatePresence>

      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink via-ink/72 to-ink/15" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pb-28">
        {/* Copy */}
        <div className="order-2 max-w-2xl lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-mint/12 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-mint">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
              </span>
              On sale now
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              {event.category}
            </span>
            {event.rating && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gold">
                <Star className="h-3.5 w-3.5" />
                {event.rating.toFixed(1)}
                <span className="font-medium text-faint">({event.ratingCount})</span>
              </span>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={event.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="mt-6 text-[clamp(2.1rem,5vw,4.1rem)] font-extrabold leading-[0.98]">
                {event.title}
              </h1>

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px] text-cream/90">
                <span className="inline-flex items-center gap-2">
                  <Cal className="h-4 w-4 text-saffron" />
                  {fmtDate(event.start)} · {fmtTime(event.start)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Pin className="h-4 w-4 text-saffron" />
                  {event.venue}, {event.metro}
                </span>
              </div>

              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">{blurbOf(event)}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button to={`/event/${event.slug}`} size="lg">
              Get tickets
              {event.low !== undefined && (
                <span className="opacity-70">· from {money(event.low)}</span>
              )}
            </Button>
            <Button to="/events" variant="outline" size="lg">
              Browse all events
              <Arrow className="h-4 w-4" />
            </Button>
          </div>

          {/* Rotation indicators */}
          <div className="mt-12 flex items-center gap-3">
            {featured.map((f, n) => (
              <button
                key={f.slug}
                type="button"
                onClick={() => setI(n)}
                aria-label={`Show ${f.title}`}
                aria-current={n === i}
                className="group flex-1 max-w-[110px]"
              >
                <span className="block h-[3px] w-full overflow-hidden rounded-full bg-cream/15">
                  <motion.span
                    key={`${f.slug}-${n === i}-${paused}`}
                    className="block h-full rounded-full accent-bg"
                    initial={{ width: n === i ? '0%' : '0%' }}
                    animate={{ width: n === i ? '100%' : '0%' }}
                    transition={{
                      duration: n === i && !paused ? ROTATE_MS / 1000 : 0.3,
                      ease: 'linear',
                    }}
                  />
                </span>
                <span
                  className={cx(
                    'mt-2 block truncate text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] transition-colors',
                    n === i ? 'text-cream' : 'text-faint group-hover:text-muted',
                  )}
                >
                  {f.artists[0]?.name ?? f.metro}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Poster stack */}
        <div className="relative order-1 lg:order-2">
          <div className="relative mx-auto w-full max-w-[220px] sm:max-w-[260px] lg:max-w-[340px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={event.slug}
                initial={{ opacity: 0, y: 40, rotate: -6, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, rotate: -2.5, scale: 1 }}
                exit={{ opacity: 0, y: -40, rotate: 4, scale: 0.94 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <Link to={`/event/${event.slug}`} className="block">
                  <div className="relative overflow-hidden rounded-3xl shadow-[0_50px_100px_-25px_rgba(0,0,0,0.9)] hairline">
                    <img
                      src={event.image}
                      alt={`${event.title} poster`}
                      fetchPriority="high"
                      onLoad={() => setLoaded(true)}
                      className={cx(
                        'aspect-[460/651] w-full bg-surface-2 object-cover transition-opacity duration-500',
                        loaded ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-cream/12" />
                  </div>
                </Link>

                {/* Floating price tag */}
                {event.low !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute -bottom-4 -left-4 rotate-[-4deg] rounded-2xl bg-cream px-4 py-2.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] lg:-bottom-5 lg:-left-8 lg:px-5 lg:py-3"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink/50">
                      Tickets from
                    </p>
                    <p className="text-xl font-extrabold leading-tight text-ink lg:text-2xl">
                      {money(event.low)}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Glow behind poster */}
            <div
              aria-hidden
              className="absolute -inset-10 -z-10 rounded-full bg-ember/22 blur-[90px]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
