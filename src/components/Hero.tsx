import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AUSTRALIAN_CITIES, type EventItem } from '../data/events'
import { Button } from './Primitives'
import { ChevronDown, Pin, Search } from './Icons'

export function Hero({ featured: _featured = [] }: { featured?: EventItem[] } = {}) {
  const [q, setQ] = useState('')
  const [city, setCity] = useState('All Australia')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (city !== 'All Australia') params.set('city', city)
    navigate(`/events${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handlePopularSearch = (term: string) => {
    navigate(`/events?category=${encodeURIComponent(term)}`)
  }

  return (
    <section className="relative min-h-[560px] sm:min-h-[620px] lg:min-h-[660px] w-full overflow-hidden bg-white border-b border-line">
      {/* 1. Photographic live-event background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-concert.jpg"
          alt="Australian live concert crowd and stage lights"
          fetchPriority="high"
          className="h-full w-full object-cover object-[center_right] sm:object-right"
        />

        {/* Subtle white/light gradient overlay on the LEFT side so text remains highly readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 sm:via-white/90 md:via-white/80 md:to-white/10 to-white/50" />

        {/* Soft bottom blend to transition smoothly into the white page background */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* 2. Foreground Hero Content */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-5 sm:px-8 pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pt-44 lg:pb-28">
        <div className="max-w-2xl lg:max-w-3xl">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-xs px-3.5 py-1 text-xs font-semibold text-blue border border-line shadow-xs"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue" />
            <span>Australia's Trusted Live Event Marketplace</span>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 text-[clamp(2.5rem,5.4vw,4.4rem)] font-black leading-[1.08] tracking-tight text-cream text-balance"
          >
            Find your next<br className="hidden sm:inline" />{' '}
            <span className="text-blue">live experience.</span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-[clamp(1.05rem,1.8vw,1.25rem)] leading-relaxed text-muted max-w-xl"
          >
            Discover concerts, festivals, comedy, theatre, sports and more across Australia.
          </motion.p>

          {/* Large White Search Container */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 max-w-2xl"
          >
            <form
              onSubmit={handleSearch}
              className="rounded-2xl sm:rounded-full bg-white p-2.5 sm:p-2 border border-line shadow-md shadow-slate-200/60 transition-all focus-within:border-blue focus-within:ring-2 focus-within:ring-blue-light"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Search input field */}
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search events, artists or venues..."
                    aria-label="Search events"
                    className="h-12 w-full rounded-full bg-transparent pl-11 pr-4 text-sm font-medium text-cream placeholder:text-muted focus:outline-none"
                  />
                </div>

                <span className="hidden sm:block h-7 w-px bg-line" />

                {/* Location selector */}
                <div className="relative sm:w-44">
                  <Pin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    aria-label="Location selector"
                    className="h-12 w-full rounded-full bg-surface-2 sm:bg-transparent pl-9 pr-8 text-xs font-bold text-cream appearance-none cursor-pointer focus:outline-none border border-line sm:border-none"
                  >
                    <option value="All Australia">All Australia</option>
                    {AUSTRALIAN_CITIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.state})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
                </div>

                {/* Primary blue button */}
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  className="sm:h-12 px-8 font-bold text-sm bg-blue hover:bg-blue-dark text-white rounded-xl sm:rounded-full shadow-xs shrink-0"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Popular Searches Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-faint">Popular searches:</span>
              {['Concerts', 'Comedy', 'Festivals', 'Theatre', 'Sports'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handlePopularSearch(item)}
                  className="rounded-full bg-white/95 backdrop-blur-xs px-3 py-1 text-xs font-medium text-cream border border-line shadow-2xs hover:border-blue hover:text-blue transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
