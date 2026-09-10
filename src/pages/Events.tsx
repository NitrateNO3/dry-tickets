import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { categories, events, liveEvents, metros, presaleEvents } from '../data/events'
import { monthKey } from '../lib/format'
import { PosterCard } from '../components/PosterCard'
import { Button, Chip, Eyebrow } from '../components/Primitives'
import { Close, Search } from '../components/Icons'

type Sort = 'date' | 'price-low' | 'price-high'

export default function Events() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [city, setCity] = useState(params.get('city') ?? 'All')
  const [cat, setCat] = useState(params.get('category') ?? 'All')
  const [sort, setSort] = useState<Sort>('date')

  const filter = params.get('filter')
  const pool = filter === 'presale' ? presaleEvents : filter === 'past' ? events : liveEvents

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()

    const out = pool.filter((e) => {
      if (city !== 'All' && e.metro !== city) return false
      if (cat !== 'All' && e.category !== cat) return false
      if (!term) return true
      const hay = [e.title, e.venue, e.metro, e.city, e.category, ...e.artists.map((a) => a.name)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(term)
    })

    if (sort === 'price-low') return [...out].sort((a, b) => (a.low ?? 1e9) - (b.low ?? 1e9))
    if (sort === 'price-high') return [...out].sort((a, b) => (b.high ?? 0) - (a.high ?? 0))
    return out
  }, [pool, q, city, cat, sort])

  const grouped = useMemo(
    () =>
      results.reduce<Record<string, typeof results>>((acc, e) => {
        const k = monthKey(e.start)
        ;(acc[k] ??= []).push(e)
        return acc
      }, {}),
    [results],
  )

  const active = city !== 'All' || cat !== 'All' || q.trim() !== ''

  const reset = () => {
    setQ('')
    setCity('All')
    setCat('All')
    setParams({})
  }

  const title =
    filter === 'presale' ? 'Presale & upcoming' : filter === 'past' ? 'Every event' : 'Now on sale'

  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-36 sm:px-8 lg:pt-44">
      {/* Header */}
      <div className="mb-12">
        <Eyebrow className="mb-5">
          {results.length} {results.length === 1 ? 'event' : 'events'}
        </Eyebrow>
        <h1 className="text-[clamp(2.6rem,6vw,4.6rem)] font-extrabold">
          {title}{' '}
          <em className="font-serif italic font-normal text-gradient">across AU &amp; NZ</em>
        </h1>
      </div>

      {/* Controls */}
      <div className="sticky top-[68px] z-30 -mx-5 mb-12 glass px-5 py-4 sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="group relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint transition-colors group-focus-within:text-saffron" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by artist, venue or city…"
                aria-label="Search events"
                className="h-11 w-full rounded-full bg-surface pl-11 pr-10 text-[13.5px] text-cream placeholder:text-faint hairline focus:outline-none focus:ring-1 focus:ring-saffron/60"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ('')}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-faint hover:text-cream"
                >
                  <Close className="h-4 w-4" />
                </button>
              )}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort events"
              className="h-11 rounded-full bg-surface px-5 text-[13px] font-semibold text-cream hairline focus:outline-none focus:ring-1 focus:ring-saffron/60"
            >
              <option value="date">Soonest first</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>

            {active && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold text-ember hover:bg-ember/10"
              >
                <Close className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible">
            <Chip active={city === 'All'} onClick={() => setCity('All')}>
              All cities
            </Chip>
            {metros.map((m) => (
              <Chip key={m} active={city === m} onClick={() => setCity(m)}>
                {m}
              </Chip>
            ))}
            <span className="mx-1 w-px shrink-0 bg-line" />
            {categories.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? 'All' : c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-surface py-28 text-center hairline">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-2 text-faint">
            <Search className="h-6 w-6" />
          </span>
          <h2 className="mt-6 text-xl font-bold text-cream">No events match that</h2>
          <p className="mt-2 max-w-sm text-[14px] text-muted">
            Try a different city or clear your filters — we add new shows every week.
          </p>
          <Button onClick={reset} className="mt-7">
            Clear filters
          </Button>
        </div>
      ) : sort === 'date' && !q.trim() ? (
        <div className="space-y-16">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <div className="mb-6 flex items-baseline gap-4">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.22em] text-saffron">
                  {month}
                </h2>
                <span className="h-px flex-1 bg-line" />
                <span className="text-[12px] font-semibold text-faint">{items.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((e, i) => (
                  <motion.div
                    key={e.slug}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.3) }}
                  >
                    <PosterCard event={e} index={i} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {results.map((e, i) => (
            <motion.div
              key={e.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.03, 0.3) }}
            >
              <PosterCard event={e} index={i} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
