import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export type HeroTile = { image: string; title: string; meta: string }

/** A photo tile with a quiet caption. */
function Tile({ tile, className }: { tile: HeroTile; className?: string }) {
  return (
    <figure className={`relative overflow-hidden rounded-2xl bg-surface-2 shadow-md ${className ?? ''}`}>
      <img src={tile.image} alt={tile.title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
      <figcaption className="absolute inset-x-0 bottom-0 p-4">
        <span className="block truncate text-sm font-semibold text-white">{tile.title}</span>
        <span className="block truncate text-xs text-white/70">{tile.meta}</span>
      </figcaption>
    </figure>
  )
}

/**
 * Light listing-page header: label, headline, lede, optional extra row, stats — with a
 * three-photo grid (one tall, two stacked) on the right. Used by Venues and Artists.
 */
export function PageHero({
  label,
  title,
  lede,
  stats,
  tiles,
  children,
}: {
  label: string
  title: ReactNode
  lede: string
  stats: { n: number; label: string }[]
  tiles: HeroTile[]
  children?: ReactNode
}) {
  const [a, b, c] = tiles

  return (
    <section className="relative overflow-hidden border-b border-line bg-surface text-ink">
      {/* Faint blue wash in the top corner; the only decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_85%_0%,rgba(37,99,235,0.08),transparent_60%)]"
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="wrap relative grid items-center gap-12 pb-16 pt-32 lg:grid-cols-2 lg:gap-16 lg:pb-24 lg:pt-40"
      >
        <div>
          <span className="t-label text-blue">{label}</span>
          <h1 className="mt-5 text-[clamp(2.75rem,6vw,4.75rem)] font-bold leading-[1.02] tracking-[-0.035em]">{title}</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">{lede}</p>

          {children && <div className="mt-8">{children}</div>}

          <dl className="mt-10 grid max-w-lg grid-cols-3 border-t border-line pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="text-3xl font-semibold tracking-tight">{s.n || '—'}</dd>
                <dt className="mt-1 text-sm text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {a && b && c && (
          <div className="grid h-[320px] grid-cols-5 grid-rows-2 gap-3 sm:h-[480px] lg:h-[540px]">
            <Tile tile={a} className="col-span-3 row-span-2" />
            <Tile tile={b} className="col-span-2" />
            <Tile tile={c} className="col-span-2" />
          </div>
        )}
      </motion.div>
    </section>
  )
}
