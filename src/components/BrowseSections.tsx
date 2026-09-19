import { createElement } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { AUSTRALIAN_CITIES } from '../data/events'
import { plural } from '../lib/copy'
import { CITY_INFO, categoryIcon } from './cityIcons'
import { Reveal, SectionHead } from './Primitives'

// Cards rise in one after another as the grid scrolls into view.
const grid: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const rise: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const gridProps = {
  variants: grid,
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-10% 0px' },
} as const

/* ------------------------------------------------------------ Categories */

export function CategoryBrowse({ items }: { items: { name: string; count: number }[] }) {
  return (
    <section className="relative mt-20 overflow-hidden border-y border-blue/10 bg-[linear-gradient(180deg,#eef4ff_0%,#f7faff_100%)] lg:mt-24">
      {/* Dot grid, fading out toward the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_30%,transparent_100%)]"
        style={{
          backgroundImage: 'radial-gradient(rgba(37,99,235,0.22) 1px, transparent 1.4px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <div className="wrap relative py-16 lg:py-20">
        <Reveal>
          <SectionHead eyebrow="Find your vibe" title="Browse by category" />
        </Reveal>
        <motion.div {...gridProps} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((c) => (
            <motion.div key={c.name} variants={rise}>
              <Link
                to={`/events?category=${encodeURIComponent(c.name)}`}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-blue/10 bg-white/85 p-4 shadow-xs backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-blue/30 hover:shadow-[0_22px_40px_-22px_rgba(37,99,235,0.55)]"
              >
                {/* Light sweep on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
                />
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-light text-blue transition-all duration-300 group-hover:-rotate-6 group-hover:bg-blue group-hover:text-white">
                  {createElement(categoryIcon(c.name), { className: 'h-5 w-5' })}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-semibold text-ink">{c.name}</span>
                  <span className="text-sm text-muted">
                    {c.count} {plural(c.count, 'event')}
                  </span>
                </span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-faint transition-all duration-300 group-hover:border-blue group-hover:bg-blue group-hover:text-white">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Cities */

export function CityBrowse({ counts }: { counts: (city: string) => number }) {
  return (
    <section className="relative mt-20 overflow-hidden border-y border-line bg-white lg:mt-24">
      {/* Map-style grid lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,#000_20%,transparent_100%)]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.07) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      {/* Radar rings behind the heading, like a location ping */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full [mask-image:radial-gradient(circle,#000_40%,transparent_70%)]"
        style={{
          backgroundImage: 'repeating-radial-gradient(circle, rgba(37,99,235,0.12) 0 1px, transparent 1px 44px)',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-blue/10 blur-3xl" />

      <div className="wrap relative py-16 lg:py-20">
        <Reveal>
          <SectionHead eyebrow="Near you" title="Browse by city" />
        </Reveal>
        <motion.div {...gridProps} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {AUSTRALIAN_CITIES.map((c) => {
            const count = counts(c.name)
            const Icon = CITY_INFO[c.name]?.Icon ?? MapPin
            return (
              <motion.div key={c.name} variants={rise}>
                <Link
                  to={`/events?city=${encodeURIComponent(c.name)}`}
                  className="group relative flex h-40 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-white p-4 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_24px_44px_-22px_rgba(15,23,42,0.55)] sm:h-44 sm:p-5"
                >
                  {/* City photo fades in on hover */}
                  <img
                    src={c.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  {/* Faint oversized landmark icon */}
                  {createElement(Icon, {
                    'aria-hidden': true,
                    strokeWidth: 1,
                    className:
                      'absolute -bottom-4 -right-4 h-28 w-28 text-blue/10 transition-all duration-500 group-hover:-rotate-12 group-hover:opacity-0',
                  })}

                  <span className="relative flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-light text-blue transition-colors duration-300 group-hover:bg-white/15 group-hover:text-white">
                      {createElement(Icon, { className: 'h-4 w-4' })}
                    </span>
                    <span className="t-label text-faint transition-colors duration-300 group-hover:text-white/70">{c.state}</span>
                  </span>
                  <span className="relative">
                    <span className="flex items-center gap-1 text-lg font-semibold text-ink transition-colors duration-300 group-hover:text-white">
                      {c.name}
                      <ArrowUpRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                    <span className="text-sm text-muted transition-colors duration-300 group-hover:text-white/80">
                      {count > 0 ? `${count} upcoming ${plural(count, 'event')}` : 'No shows listed yet'}
                    </span>
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
