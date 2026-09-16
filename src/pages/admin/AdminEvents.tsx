import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { seedEvents } from '../../data/events'
import { useEvents } from '../../lib/events'
import { upsertEvents } from '../../lib/supabase'
import { fmtDateShort, money } from '../../lib/format'
import { plural } from '../../lib/copy'
import { Badge, Button, Chip, Img, Input } from '../../components/Primitives'
import { Search } from '../../components/Icons'

type Filter = 'upcoming' | 'presale' | 'past' | 'all'

export default function AdminEvents() {
  const { events, loading, source, refresh } = useEvents()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string>()
  const [now] = useState(() => Date.now())

  // One-shot "Saved" / "Deleted" notice set by the form before navigating here.
  const [notice] = useState(() => sessionStorage.getItem('admin-notice') ?? undefined)
  useEffect(() => sessionStorage.removeItem('admin-notice'), [])

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase()
    return [...events]
      .filter((e) => {
        if (filter === 'presale' && !e.presale) return false
        if (filter === 'upcoming' && (e.presale || !e.start || new Date(e.start).getTime() < now)) return false
        if (filter === 'past' && (!e.start || new Date(e.start).getTime() >= now)) return false
        if (!term) return true
        return [e.title, e.metro, e.venue, e.category, ...e.artists.map((a) => a.name)].join(' ').toLowerCase().includes(term)
      })
      .sort((a, b) => (b.start ?? '9').localeCompare(a.start ?? '9'))
  }, [events, q, filter, now])

  const importSeed = async () => {
    setImporting(true)
    setImportError(undefined)
    try {
      await upsertEvents(seedEvents)
      await refresh()
    } catch (e) {
      setImportError(e instanceof Error ? e.message : String(e))
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      {notice && (
        <p role="status" className="mb-6 rounded-lg border border-success/20 bg-success-light px-4 py-3 text-sm text-success">
          {notice}
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shows" aria-label="Search shows" className="pl-9" />
        </div>
        <Button to="/admin/new">New show</Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ['all', 'All'],
            ['upcoming', 'Upcoming'],
            ['presale', 'Presale'],
            ['past', 'Past'],
          ] as [Filter, string][]
        ).map(([id, label]) => (
          <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>
            {label}
          </Chip>
        ))}
        <span className="ml-auto self-center text-sm text-muted">
          {rows.length} {plural(rows.length, 'show')}
        </span>
      </div>

      {loading ? (
        <div className="card divide-y divide-line p-2" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <div className="skeleton h-14 w-10 rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/2 rounded-md" />
                <div className="skeleton h-3 w-1/3 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 && source === 'supabase' ? (
        <div className="card flex flex-col items-center px-4 py-20 text-center">
          <h2 className="t-h3 text-ink">No shows yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Start from the {seedEvents.length} shows that ship with the site, or add one from scratch.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={importSeed} loading={importing}>
              Import built-in events
            </Button>
            <Button to="/admin/new" variant="outline">
              New show
            </Button>
          </div>
          {importError && (
            <p role="alert" className="mt-4 text-sm text-danger">
              {importError}
            </p>
          )}
        </div>
      ) : rows.length === 0 ? (
        <div className="card px-4 py-20 text-center">
          <h2 className="t-h3 text-ink">No shows match</h2>
          <p className="mt-2 text-sm text-muted">Try a different search or filter.</p>
        </div>
      ) : (
        <div className="card divide-y divide-line p-2">
          {rows.map((e) => (
            <Link
              key={e.slug}
              to={`/admin/${e.slug}`}
              className="group grid grid-cols-[40px_1fr_auto] items-center gap-4 rounded-lg p-3 transition-colors duration-150 hover:bg-surface sm:grid-cols-[40px_1fr_140px_120px_auto]"
            >
              <Img src={e.image} alt="" loading="lazy" className="h-14 w-10 rounded-md border border-line" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink group-hover:text-blue">{e.title}</span>
                <span className="block truncate text-xs text-muted">
                  {[e.venue, e.metro].filter(Boolean).join(' · ')}
                </span>
              </span>
              <span className="hidden text-sm text-muted sm:block">{e.presale ? 'Presale' : fmtDateShort(e.start)}</span>
              <span className="hidden sm:block">
                <Badge tone={e.presale ? 'warning' : 'neutral'}>{e.category}</Badge>
              </span>
              <span className="text-right text-sm font-medium text-ink">{e.low !== undefined ? money(e.low) : '—'}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
