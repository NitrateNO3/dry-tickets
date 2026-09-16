import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AUSTRALIAN_CITIES, categories, liveEvents } from '../data/events'
import { cx, money } from '../lib/format'
import { Button, Chip, Input, useDialog } from './Primitives'
import { ChevronDown, Close, Menu, Pin, Search, Ticket } from './Icons'

const ALL = 'All Australia'

export function Logo() {
  return (
    <Link to="/" className="inline-flex shrink-0 items-center gap-2" aria-label="Dry Tickets home">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue text-white">
        <Ticket className="h-4 w-4" />
      </span>
      <span className="text-base font-bold tracking-tight text-ink">Dry Tickets</span>
    </Link>
  )
}

const navLink = ({ isActive }: { isActive: boolean }) =>
  cx(
    'inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors duration-150',
    isActive ? 'bg-blue-light text-blue' : 'text-muted hover:bg-surface hover:text-ink',
  )

const panel = 'absolute top-full mt-2 rounded-xl border border-line bg-white p-2 shadow-md z-50'
const item = (active: boolean) =>
  cx(
    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition-colors duration-150 cursor-pointer',
    active ? 'bg-blue-light text-blue font-medium' : 'text-ink hover:bg-surface',
  )

const pop = {
  initial: { opacity: 0, y: 4, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 4, scale: 0.98 },
  transition: { duration: 0.15 },
}

export function Nav() {
  const [openMobile, setOpenMobile] = useState(false)
  const [openLocation, setOpenLocation] = useState(false)
  const [openCategories, setOpenCategories] = useState(false)
  const [q, setQ] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const locRef = useRef<HTMLDivElement>(null)
  const catRef = useRef<HTMLDivElement>(null)

  const selectedCity = searchParams.get('city') || ALL

  useDialog(openMobile, () => setOpenMobile(false))

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!locRef.current?.contains(e.target as Node)) setOpenLocation(false)
      if (!catRef.current?.contains(e.target as Node)) setOpenCategories(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(q.trim() ? `/events?q=${encodeURIComponent(q.trim())}` : '/events')
    setQ('')
    setOpenMobile(false)
  }

  const selectCity = (name: string) => {
    setOpenLocation(false)
    setOpenMobile(false)
    navigate(name === ALL ? '/events' : `/events?city=${encodeURIComponent(name)}`)
  }

  const results =
    q.trim().length > 1
      ? liveEvents
          .filter((e) =>
            [e.title, e.metro, e.category, ...e.artists.map((a) => a.name)].join(' ').toLowerCase().includes(q.toLowerCase()),
          )
          .slice(0, 4)
      : []

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-line bg-white/95 backdrop-blur-md">
        <div className="wrap flex h-full items-center gap-4">
          <Logo />

          {/* City selector */}
          <div className="relative hidden md:block" ref={locRef}>
            <button
              type="button"
              onClick={() => {
                setOpenLocation((v) => !v)
                setOpenCategories(false)
              }}
              aria-expanded={openLocation}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink transition-colors duration-150 hover:border-line-strong cursor-pointer"
            >
              <Pin className="h-4 w-4 text-blue" />
              <span className="max-w-32 truncate">{selectedCity}</span>
              <ChevronDown className={cx('h-4 w-4 text-faint transition-transform duration-150', openLocation && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {openLocation && (
                <motion.div {...pop} className={cx(panel, 'left-0 w-64')}>
                  <button type="button" onClick={() => selectCity(ALL)} className={item(selectedCity === ALL)}>
                    <span>{ALL}</span>
                    <span className="text-xs text-faint">{liveEvents.length}</span>
                  </button>
                  {AUSTRALIAN_CITIES.map((c) => (
                    <button key={c.name} type="button" onClick={() => selectCity(c.name)} className={item(selectedCity === c.name)}>
                      <span>
                        {c.name}, {c.state}
                      </span>
                      <span className="text-xs text-faint">{liveEvents.filter((e) => e.metro === c.name).length}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop links */}
          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink to="/events" className={navLink}>
              Events
            </NavLink>

            <div className="relative" ref={catRef}>
              <button
                type="button"
                onClick={() => {
                  setOpenCategories((v) => !v)
                  setOpenLocation(false)
                }}
                aria-expanded={openCategories}
                className={cx(navLink({ isActive: false }), 'gap-1 cursor-pointer')}
              >
                Categories
                <ChevronDown className={cx('h-4 w-4 transition-transform duration-150', openCategories && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {openCategories && (
                  <motion.div {...pop} className={cx(panel, 'left-0 w-56')}>
                    {categories.map((c) => (
                      <Link
                        key={c}
                        to={`/events?category=${encodeURIComponent(c)}`}
                        onClick={() => setOpenCategories(false)}
                        className={item(false)}
                      >
                        <span>{c}</span>
                        <span className="text-xs text-faint">{liveEvents.filter((e) => e.category === c).length}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/artists" className={navLink}>
              Artists
            </NavLink>
            <NavLink to="/venues" className={navLink}>
              Venues
            </NavLink>
            <NavLink to="/about" className={navLink}>
              About
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <form onSubmit={submitSearch} className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search events, artists, venues"
                  aria-label="Search events"
                  className="h-9 w-48 pl-9 pr-8 xl:w-64"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-faint hover:text-ink cursor-pointer"
                  >
                    <Close className="h-4 w-4" />
                  </button>
                )}
              </form>

              {results.length > 0 && (
                <div className={cx(panel, 'right-0 w-80')}>
                  {results.map((e) => (
                    <Link key={e.slug} to={`/event/${e.slug}`} onClick={() => setQ('')} className="flex items-center gap-3 rounded-lg p-2 hover:bg-surface">
                      <img src={e.image} alt="" className="h-12 w-9 shrink-0 rounded-md border border-line object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{e.title}</span>
                        <span className="block truncate text-xs text-muted">
                          {e.metro} · {e.low ? `from ${money(e.low)}` : 'Presale'}
                        </span>
                      </span>
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => submitSearch({ preventDefault() {} } as React.FormEvent)}
                    className="mt-1 block w-full rounded-lg py-2 text-center text-sm font-medium text-blue hover:bg-blue-light cursor-pointer"
                  >
                    View all results
                  </button>
                </div>
              )}
            </div>

            <Button to="/sell" size="sm" className="hidden sm:inline-flex">
              List an event
            </Button>

            <button
              type="button"
              onClick={() => setOpenMobile(true)}
              aria-label="Open navigation menu"
              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink transition-colors hover:bg-surface md:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {openMobile && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-white md:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Logo />
              <button
                type="button"
                onClick={() => setOpenMobile(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink cursor-pointer"
              >
                <Close className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitSearch} className="relative border-b border-line p-4">
              <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search events, artists, cities"
                aria-label="Search events"
                className="pl-9"
              />
            </form>

            <div className="border-b border-line p-4">
              <span className="t-label mb-3 block text-faint">City</span>
              <div className="flex flex-wrap gap-2">
                <Chip active={selectedCity === ALL} onClick={() => selectCity(ALL)}>
                  All
                </Chip>
                {AUSTRALIAN_CITIES.map((c) => (
                  <Chip key={c.name} active={selectedCity === c.name} onClick={() => selectCity(c.name)}>
                    {c.name}
                  </Chip>
                ))}
              </div>
            </div>

            <nav className="flex-1 p-4">
              {[
                { to: '/events', label: 'Events' },
                ...categories.map((c) => ({ to: `/events?category=${encodeURIComponent(c)}`, label: c })),
                { to: '/artists', label: 'Artists' },
                { to: '/venues', label: 'Venues' },
                { to: '/about', label: 'About' },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpenMobile(false)}
                  className="block border-b border-line py-3 text-base font-medium text-ink transition-colors hover:text-blue"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-line bg-surface p-4">
              <Button to="/sell" size="lg" className="w-full">
                List an event
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
