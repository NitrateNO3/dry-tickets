import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AUSTRALIAN_CITIES, AUSTRALIAN_GENRES, liveEvents } from '../data/events'
import { cx, money } from '../lib/format'
import { Button } from './Primitives'
import { ChevronDown, Close, Menu, Pin, Search, Ticket } from './Icons'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5 shrink-0" aria-label="Dry Tickets home">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-blue text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
        <Ticket className="h-[18px] w-[18px]" />
      </span>
      {!compact && (
        <span className="text-[19px] font-black tracking-[-0.03em] text-cream">
          Dry<span className="text-blue">Tickets</span>
          <span className="ml-1.5 rounded bg-blue-light px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-blue border border-blue/20 align-top">
            AU
          </span>
        </span>
      )}
    </Link>
  )
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [openMobile, setOpenMobile] = useState(false)
  const [openLocation, setOpenLocation] = useState(false)
  const [openCategories, setOpenCategories] = useState(false)
  const [q, setQ] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const locRef = useRef<HTMLDivElement>(null)
  const catRef = useRef<HTMLDivElement>(null)

  // Derive city selector from URL params
  const selectedCity = searchParams.get('city') || 'All Australia'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locRef.current && !locRef.current.contains(e.target as Node)) {
        setOpenLocation(false)
      }
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setOpenCategories(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    document.body.style.overflow = openMobile ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [openMobile])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!q.trim()) {
      navigate('/events')
      return
    }
    navigate(`/events?q=${encodeURIComponent(q.trim())}`)
    setQ('')
  }

  const handleCitySelect = (cityName: string) => {
    setOpenLocation(false)
    if (cityName === 'All Australia') {
      navigate('/events')
    } else {
      navigate(`/events?city=${encodeURIComponent(cityName)}`)
    }
  }

  // Quick live search matching results for autocomplete flyout
  const searchResults = q.trim().length > 1
    ? liveEvents
        .filter((e) =>
          [e.title, e.metro, e.category, ...e.artists.map((a) => a.name)]
            .join(' ')
            .toLowerCase()
            .includes(q.toLowerCase()),
        )
        .slice(0, 4)
    : []

  return (
    <>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-50 transition-all duration-200 bg-white/95 backdrop-blur-md border-b border-line',
          scrolled ? 'py-2.5 shadow-xs' : 'py-3.5',
        )}
      >
        <div className="mx-auto flex max-w-[1400px] items-center gap-3.5 px-4 sm:gap-5 sm:px-8">
          <Logo />

          {/* Location Selector (Desktop/Tablet) */}
          <div className="relative hidden md:block" ref={locRef}>
            <button
              type="button"
              onClick={() => {
                setOpenLocation(!openLocation)
                setOpenCategories(false)
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3.5 py-1.5 text-[12.5px] font-semibold text-cream border border-line hover:bg-surface-3 transition-colors cursor-pointer"
            >
              <Pin className="h-3.5 w-3.5 text-blue" />
              <span className="truncate max-w-[120px]">{selectedCity}</span>
              <ChevronDown className={`h-3 w-3 text-faint transition-transform ${openLocation ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {openLocation && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-white p-2 border border-line shadow-lg z-50"
                >
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-faint border-b border-line mb-1">
                    Select Australian City
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCitySelect('All Australia')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCity === 'All Australia'
                        ? 'bg-blue-light text-blue font-bold'
                        : 'text-cream hover:bg-surface-2'
                    }`}
                  >
                    <span>All Australia</span>
                    <span className="text-[11px] text-faint">{liveEvents.length} events</span>
                  </button>
                  <div className="space-y-0.5 mt-1">
                    {AUSTRALIAN_CITIES.map((c) => {
                      const count = liveEvents.filter((e) => e.metro === c.name).length
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleCitySelect(c.name)}
                          className={`w-full text-left px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
                            selectedCity === c.name
                              ? 'bg-blue-light text-blue font-bold'
                              : 'text-muted hover:text-cream hover:bg-surface-2'
                          }`}
                        >
                          <span>{c.name}, {c.state}</span>
                          <span className="text-[11px] text-faint">{count}</span>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 lg:flex ml-4">
            <NavLink
              to="/events"
              className={({ isActive }) =>
                cx(
                  'rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition-colors',
                  isActive && !searchParams.get('category')
                    ? 'text-blue bg-blue-light font-bold'
                    : 'text-muted hover:text-cream',
                )
              }
            >
              Events
            </NavLink>

            {/* Categories dropdown */}
            <div className="relative" ref={catRef}>
              <button
                type="button"
                onClick={() => {
                  setOpenCategories(!openCategories)
                  setOpenLocation(false)
                }}
                className="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold text-muted hover:text-cream transition-colors cursor-pointer"
              >
                <span>Categories</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${openCategories ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {openCategories && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 w-56 rounded-2xl bg-white p-2 border border-line shadow-lg z-50"
                  >
                    <div className="space-y-0.5">
                      {AUSTRALIAN_GENRES.map((g) => (
                        <Link
                          key={g.id}
                          to={g.id === 'all' ? '/events' : `/events?category=${encodeURIComponent(g.id)}`}
                          onClick={() => setOpenCategories(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-cream hover:bg-surface-2 transition-colors"
                        >
                          <span className="text-base">{g.icon}</span>
                          <span>{g.label}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink
              to="/artists"
              className={({ isActive }) =>
                cx(
                  'rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition-colors',
                  isActive ? 'text-blue bg-blue-light font-bold' : 'text-muted hover:text-cream',
                )
              }
            >
              Artists
            </NavLink>

            <NavLink
              to="/venues"
              className={({ isActive }) =>
                cx(
                  'rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition-colors',
                  isActive ? 'text-blue bg-blue-light font-bold' : 'text-muted hover:text-cream',
                )
              }
            >
              Venues
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                cx(
                  'rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition-colors',
                  isActive ? 'text-blue bg-blue-light font-bold' : 'text-muted hover:text-cream',
                )
              }
            >
              About
            </NavLink>
          </nav>

          {/* Search + Action Section */}
          <div className="ml-auto flex items-center gap-2.5">
            {/* Live Search */}
            <div className="relative hidden md:block">
              <form onSubmit={submitSearch}>
                <div className="group relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted transition-colors group-focus-within:text-blue" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search events, artists, venues…"
                    aria-label="Search events"
                    className="h-9 w-48 rounded-full bg-surface-2 pl-9 pr-7 text-[12.5px] text-cream placeholder:text-muted border border-line transition-all duration-200 focus:w-64 focus:bg-white focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-light xl:w-56 xl:focus:w-72"
                  />
                  {q && (
                    <button
                      type="button"
                      onClick={() => setQ('')}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-cream cursor-pointer"
                    >
                      <Close className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </form>

              {/* Autocomplete Dropdown Preview */}
              {searchResults.length > 0 && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white p-3 border border-line shadow-xl z-50">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-faint">
                    Matching Events
                  </div>
                  <div className="mt-1 space-y-1">
                    {searchResults.map((e) => (
                      <Link
                        key={e.slug}
                        to={`/event/${e.slug}`}
                        onClick={() => setQ('')}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-surface-2 transition-colors"
                      >
                        <img
                          src={e.image}
                          alt=""
                          className="h-10 w-8 rounded-lg object-cover shrink-0 border border-line"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-cream truncate">{e.title}</p>
                          <p className="text-[11px] text-muted truncate">
                            {e.metro} · {e.low ? money(e.low) : 'Presale'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/events?q=${encodeURIComponent(q)}`)
                      setQ('')
                    }}
                    className="mt-2 block w-full py-1.5 text-center text-xs font-bold text-blue hover:underline cursor-pointer"
                  >
                    View all matching events →
                  </button>
                </div>
              )}
            </div>

            {/* Primary List Event CTA */}
            <Button to="/sell" size="sm" variant="primary" className="hidden sm:inline-flex">
              List an Event
            </Button>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setOpenMobile(true)}
              aria-label="Open navigation menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-cream transition-colors hover:bg-surface-2 md:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {openMobile && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[70] bg-white flex flex-col md:hidden overflow-y-auto"
          >
            {/* Drawer Top */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <Logo />
              <button
                type="button"
                onClick={() => setOpenMobile(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-cream cursor-pointer"
              >
                <Close className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Search Input */}
            <div className="p-5 border-b border-line bg-surface-2">
              <form onSubmit={submitSearch}>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search events, artists, cities…"
                    className="h-11 w-full rounded-full bg-white pl-10 pr-4 text-sm text-cream placeholder:text-muted border border-line focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-light"
                  />
                </div>
              </form>
            </div>

            {/* Mobile City Selector */}
            <div className="p-5 border-b border-line">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-faint block mb-2.5">
                Select City
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    handleCitySelect('All Australia')
                    setOpenMobile(false)
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border ${
                    selectedCity === 'All Australia'
                      ? 'bg-blue-light text-blue border-blue font-bold'
                      : 'bg-surface-2 text-muted border-line'
                  }`}
                >
                  All AU
                </button>
                {AUSTRALIAN_CITIES.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      handleCitySelect(c.name)
                      setOpenMobile(false)
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border ${
                      selectedCity === c.name
                        ? 'bg-blue-light text-blue border-blue font-bold'
                        : 'bg-surface-2 text-muted border-line'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex-1 px-5 py-4 space-y-1">
              {[
                { to: '/events', label: 'Events' },
                { to: '/events?category=Concert', label: 'Concerts & Music' },
                { to: '/events?category=Comedy', label: 'Comedy' },
                { to: '/events?category=Festival', label: 'Festivals' },
                { to: '/artists', label: 'Artists' },
                { to: '/venues', label: 'Venues' },
                { to: '/about', label: 'About' },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpenMobile(false)}
                  className="block py-3 text-base font-bold text-cream border-b border-line/60 hover:text-blue transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div className="p-5 border-t border-line space-y-3 bg-surface-2">
              <Button to="/sell" size="lg" className="w-full">
                List an Event
              </Button>

              <div className="text-center text-xs text-muted pt-1">
                Australia's Trusted Live Event Marketplace
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
