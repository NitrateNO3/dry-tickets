import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AUSTRALIAN_CITIES } from '../data/events'
import { useEvents } from '../lib/events'
import { cx, monthKey } from '../lib/format'
import { plural } from '../lib/copy'
import { EventRow, PosterCard } from '../components/PosterCard'
import { Button, Chip, GroupHead, Input, Meta, SkeletonCard, inputCls } from '../components/Primitives'
import { Close, Grid, Menu, Search } from '../components/Icons'

type Sort = 'date' | 'price-low' | 'price-high'
type DateFilter = 'all' | 'weekend' | 'month'
type ViewMode = 'grid' | 'list'

const selectCls = cx(inputCls, 'h-10 w-auto pr-8 font-medium cursor-pointer')

export default function Events() {
  const { events, live, presale, categories, loading } = useEvents()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [city, setCity] = useState(params.get('city') ?? 'All')
  const [cat, setCat] = useState(params.get('category') ?? 'All')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [sort, setSort] = useState<Sort>('date')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [now] = useState(() => Date.now())

  // Once stuck, the filter bar moves with the scroll: each pixel scrolled down slides it up
  // (until fully under the nav), each pixel scrolled up slides it back. Written straight to
  // style so it tracks every scroll frame without re-rendering.
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const stickAt = bar.getBoundingClientRect().top + window.scrollY - 64 // nav is h-16
    let lastY = window.scrollY
    let offset = 0
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - Math.max(lastY, stickAt)
      lastY = y
      offset =
        y <= stickAt || bar.contains(document.activeElement)
          ? 0
          : Math.min(0, Math.max(-bar.offsetHeight, offset - delta))
      bar.style.transform = offset ? `translateY(${offset}px)` : ''
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const filter = params.get('filter')
  const pool = filter === 'presale' ? presale : filter === 'past' ? events : live

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()

    const out = pool.filter((e) => {
      if (city !== 'All' && e.metro !== city) return false
      if (cat !== 'All' && e.category.toLowerCase() !== cat.toLowerCase()) return false

      if (dateFilter === 'weekend' && e.start) {
        const day = new Date(e.start).getDay()
        if (day !== 5 && day !== 6 && day !== 0) return false
      } else if (dateFilter === 'month' && e.start) {
        const diffDays = (new Date(e.start).getTime() - now) / 86_400_000
        if (diffDays < 0 || diffDays > 31) return false
      }

      if (!term) return true
      return [e.title, e.venue, e.metro, e.city, e.category, ...e.artists.map((a) => a.name)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    })

    if (sort === 'price-low') return [...out].sort((a, b) => (a.low ?? 1e9) - (b.low ?? 1e9))
    if (sort === 'price-high') return [...out].sort((a, b) => (b.high ?? 0) - (a.high ?? 0))
    return out
  }, [pool, q, city, cat, dateFilter, sort, now])

  const grouped = useMemo(
    () =>
      results.reduce<Record<string, typeof results>>((acc, e) => {
        ;(acc[monthKey(e.start)] ??= []).push(e)
        return acc
      }, {}),
    [results],
  )

  const active = city !== 'All' || cat !== 'All' || q.trim() !== '' || dateFilter !== 'all'
  const groupByMonth = sort === 'date' && !q.trim() && dateFilter === 'all'

  const reset = () => {
    setQ('')
    setCity('All')
    setCat('All')
    setDateFilter('all')
    setParams({})
  }

  const title =
    filter === 'presale'
      ? 'Presale events'
      : filter === 'past'
        ? 'Past events'
        : city !== 'All'
          ? `Events in ${city}`
          : 'Events across Australia'

  const grid = 'grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  return (
    <div className="wrap page-top">
      <Meta
        title={title}
        description={`Browse ${results.length} ${plural(results.length, 'event')} with official tickets — filter by city, category and date.`}
      />

      <div className="mb-8 max-w-3xl">
        <span className="t-label text-blue">
          {results.length} {plural(results.length, 'event')}
        </span>
        <h1 className="t-h1 mt-3 text-ink">{title}</h1>
      </div>

      {/* Sticky filter bar — sits flush under the h-16 nav and follows the scroll in and out */}
      <div
        ref={barRef}
        onFocus={(e) => (e.currentTarget.style.transform = '')}
        className="sticky top-16 z-30 -mx-4 mb-10 border-y border-line bg-white/95 px-4 py-4 backdrop-blur-md sm:-mx-8 sm:px-8"
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by artist, venue, title or city"
              aria-label="Search events"
              className="h-10 pl-9 pr-9"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-ink cursor-pointer"
              >
                <Close className="h-4 w-4" />
              </button>
            )}
          </div>

          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as DateFilter)} aria-label="Filter by date" className={selectCls}>
            <option value="all">Any date</option>
            <option value="weekend">Fri – Sun only</option>
            <option value="month">Next 30 days</option>
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort events" className={selectCls}>
            <option value="date">Soonest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>

          <div className="hidden h-10 items-center gap-1 rounded-lg border border-line bg-white p-1 sm:flex" role="group" aria-label="View">
            {(
              [
                { id: 'grid', Icon: Grid, label: 'Grid view' },
                { id: 'list', Icon: Menu, label: 'List view' },
              ] as const
            ).map(({ id, Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setViewMode(id)}
                aria-label={label}
                aria-pressed={viewMode === id}
                className={cx(
                  'grid h-8 w-8 place-items-center rounded-md transition-colors duration-150 cursor-pointer',
                  viewMode === id ? 'bg-blue-light text-blue' : 'text-faint hover:text-ink',
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {active && (
            <Button variant="ghost" size="sm" onClick={reset} className="h-10">
              <Close className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto sm:flex-wrap">
          <Chip active={city === 'All'} onClick={() => setCity('All')}>
            All cities
          </Chip>
          {AUSTRALIAN_CITIES.map((c) => (
            <Chip key={c.name} active={city === c.name} onClick={() => setCity(c.name)}>
              {c.name}
            </Chip>
          ))}
          <span className="mx-2 w-px shrink-0 bg-line" />
          <Chip active={cat === 'All'} onClick={() => setCat('All')}>
            All categories
          </Chip>
          {categories.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? 'All' : c)}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="card flex flex-col items-center px-4 py-24 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-surface text-faint">
            <Search className="h-6 w-6" />
          </span>
          <h2 className="t-h3 mt-4 text-ink">No events match these filters</h2>
          <p className="mt-2 max-w-sm text-sm text-muted">Try another city or category, or clear the search term.</p>
          <Button onClick={reset} className="mt-6">
            Clear all filters
          </Button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-10">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <GroupHead title={month} meta={`${items.length} ${plural(items.length, 'event')}`} />
              <div className="card divide-y divide-line p-2">
                {items.map((e) => (
                  <EventRow key={e.slug} event={e} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : groupByMonth ? (
        <div className="space-y-12">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <GroupHead title={month} meta={`${items.length} ${plural(items.length, 'event')}`} />
              <div className={grid}>
                {items.map((e, i) => (
                  <PosterCard key={e.slug} event={e} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={grid}>
          {results.map((e, i) => (
            <PosterCard key={e.slug} event={e} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
