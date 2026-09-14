import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AUSTRALIAN_CITIES,
  AUSTRALIAN_GENRES,
  events,
  liveEvents,
  presaleEvents,
} from '../data/events'
import { monthKey } from '../lib/format'
import { EventRow, PosterCard } from '../components/PosterCard'
import { Button, Chip, Eyebrow } from '../components/Primitives'
import { Close, Grid, Menu, Search } from '../components/Icons'

type Sort = 'date' | 'price-low' | 'price-high'
type DateFilter = 'all' | 'weekend' | 'month'
type ViewMode = 'grid' | 'list'

export default function Events() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [city, setCity] = useState(params.get('city') ?? 'All')
  const [cat, setCat] = useState(params.get('category') ?? 'All')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [sort, setSort] = useState<Sort>('date')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const filter = params.get('filter')
  const pool = filter === 'presale' ? presaleEvents : filter === 'past' ? events : liveEvents

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    const now = new Date()

    const out = pool.filter((e) => {
      // City filter
      if (city !== 'All' && e.metro !== city) return false
      // Category filter
      if (cat !== 'All' && e.category.toLowerCase() !== cat.toLowerCase()) return false

      // Date filter
      if (dateFilter === 'weekend' && e.start) {
        const evDate = new Date(e.start)
        const day = evDate.getDay()
        // Friday (5), Saturday (6), Sunday (0)
        if (day !== 5 && day !== 6 && day !== 0) return false
      } else if (dateFilter === 'month' && e.start) {
        const evDate = new Date(e.start)
        const diffDays = (evDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
        if (diffDays < 0 || diffDays > 31) return false
      }

      // Keyword search
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
  }, [pool, q, city, cat, dateFilter, sort])

  const grouped = useMemo(
    () =>
      results.reduce<Record<string, typeof results>>((acc, e) => {
        const k = monthKey(e.start)
        ;(acc[k] ??= []).push(e)
        return acc
      }, {}),
    [results],
  )

  const active = city !== 'All' || cat !== 'All' || q.trim() !== '' || dateFilter !== 'all'

  const reset = () => {
    setQ('')
    setCity('All')
    setCat('All')
    setDateFilter('all')
    setParams({})
  }

  const title =
    filter === 'presale' ? 'VIP Presale & Upcoming' : filter === 'past' ? 'Past Shows' : 'Discover Events'

  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-32 sm:px-8 lg:pt-40 pb-20">
      {/* Header */}
      <div className="mb-8 max-w-3xl">
        <Eyebrow className="mb-2.5">
          {results.length} {results.length === 1 ? 'event found' : 'events found'}
        </Eyebrow>
        <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold tracking-tight text-cream">
          {title}{' '}
          <span className="text-blue">
            {city !== 'All' ? `in ${city}` : 'across Australia'}
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          Browse concerts, comedy gigs, festivals, and cultural events with transparent AUD pricing.
        </p>
      </div>

      {/* Sticky Filter & Search Control Bar */}
      <div className="sticky top-[61px] z-30 -mx-5 mb-10 bg-white/95 backdrop-blur-md px-5 py-3.5 sm:-mx-8 sm:px-8 border-y border-line shadow-xs">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="group relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-blue" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by artist, venue, title or city…"
                aria-label="Search events"
                className="h-10 w-full rounded-full bg-surface-2 pl-10 pr-9 text-xs font-medium text-cream placeholder:text-muted border border-line focus:bg-white focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-light"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-cream cursor-pointer"
                >
                  <Close className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Date filter dropdown */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              aria-label="Filter by date"
              className="h-10 rounded-full bg-surface-2 px-4 text-xs font-bold text-cream border border-line focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-light cursor-pointer"
            >
              <option value="all">Any Date</option>
              <option value="weekend">This Weekend</option>
              <option value="month">Next 30 Days</option>
            </select>

            {/* Sort options */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort events"
              className="h-10 rounded-full bg-surface-2 px-4 text-xs font-bold text-cream border border-line focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-light cursor-pointer"
            >
              <option value="date">Date: Soonest first</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* Grid / List Switcher */}
            <div className="hidden sm:flex items-center rounded-full bg-surface-2 p-1 border border-line">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-blue text-white shadow-xs' : 'text-muted hover:text-cream'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-blue text-white shadow-xs' : 'text-muted hover:text-cream'
                }`}
              >
                <Menu className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Clear button */}
            {active && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-10 items-center gap-1 rounded-full px-3.5 text-xs font-bold text-blue bg-blue-light border border-blue/20 hover:bg-blue/15 transition-colors cursor-pointer"
              >
                <Close className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            )}
          </div>

          {/* Quick Filter Pills (City & Categories) */}
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap">
            <Chip active={city === 'All'} onClick={() => setCity('All')}>
              All Cities
            </Chip>
            {AUSTRALIAN_CITIES.map((c) => (
              <Chip key={c.name} active={city === c.name} onClick={() => setCity(c.name)}>
                {c.name}
              </Chip>
            ))}

            <span className="mx-1 w-px shrink-0 bg-line" />

            <Chip active={cat === 'All'} onClick={() => setCat('All')}>
              All Categories
            </Chip>
            {AUSTRALIAN_GENRES.filter((g) => g.id !== 'all').map((g) => (
              <Chip key={g.id} active={cat === g.id} onClick={() => setCat(cat === g.id ? 'All' : g.id)}>
                {g.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {/* Results Container */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-surface py-24 text-center hairline px-5">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-faint">
            <Search className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-cream">No events match your criteria</h2>
          <p className="mt-2 max-w-sm text-sm text-muted leading-relaxed">
            Try choosing "All Cities", widening your category selection, or clearing your search term.
          </p>
          <Button onClick={reset} className="mt-6">
            Clear all filters
          </Button>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-12">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <div className="mb-4 flex items-baseline gap-4">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-blue">
                  {month}
                </h2>
                <span className="h-px flex-1 bg-line" />
                <span className="text-xs font-semibold text-faint">
                  {items.length} {items.length === 1 ? 'event' : 'events'}
                </span>
              </div>
              <div className="divide-y divide-line rounded-2xl bg-surface/60 p-2 hairline">
                {items.map((e) => (
                  <EventRow key={e.slug} event={e} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : sort === 'date' && !q.trim() && dateFilter === 'all' ? (
        /* Date-Grouped Grid View */
        <div className="space-y-14">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <div className="mb-5 flex items-baseline gap-4">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-blue">
                  {month}
                </h2>
                <span className="h-px flex-1 bg-line" />
                <span className="text-xs font-semibold text-faint">
                  {items.length} {items.length === 1 ? 'show' : 'shows'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((e, i) => (
                  <motion.div
                    key={e.slug}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.25) }}
                  >
                    <PosterCard event={e} index={i} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Standard Filtered Grid */
        <motion.div
          layout
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {results.map((e, i) => (
            <motion.div
              key={e.slug}
              layout
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.02, 0.25) }}
            >
              <PosterCard event={e} index={i} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
