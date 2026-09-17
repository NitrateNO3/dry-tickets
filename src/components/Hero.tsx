import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AUSTRALIAN_CITIES } from '../data/events'
import { useEvents } from '../lib/events'
import { Button, Input, inputCls } from './Primitives'
import { ChevronDown, Pin, Search } from './Icons'

const ALL = 'All Australia'

export function Hero() {
  const { live, categories } = useEvents()
  const [q, setQ] = useState('')
  const [city, setCity] = useState(ALL)
  const navigate = useNavigate()

  const popular = categories.filter((c) => live.filter((e) => e.category === c).length >= 2)

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (city !== ALL) params.set('city', city)
    navigate(`/events${params.size ? `?${params}` : ''}`)
  }

  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      <div className="absolute inset-0">
        <img
          src="/hero-concert.jpg"
          alt=""
          fetchPriority="high"
          className="h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40 md:to-white/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="wrap relative pb-16 pt-32 sm:pb-20 sm:pt-40"
      >
        <div className="max-w-2xl">
          <h1 className="t-display text-ink">Official tickets for live events across Australia.</h1>
          <p className="t-lede mt-4 max-w-xl">
            Concerts, comedy, festivals and cultural shows sold by the organisers themselves — face-value
            pricing, instant e-tickets, support in Sydney.
          </p>

          <form onSubmit={search} className="card mt-8 flex flex-col gap-2 p-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search events, artists or venues"
                aria-label="Search events"
                className="h-12 border-0 pl-11 hover:border-0 focus:ring-0"
              />
            </div>
            <span className="hidden h-8 w-px bg-line sm:block" />
            <div className="relative sm:w-48">
              <Pin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="City"
                className={`${inputCls} h-12 appearance-none border-0 pl-11 pr-10 font-medium hover:border-0 focus:ring-0 cursor-pointer`}
              >
                <option value={ALL}>{ALL}</option>
                {AUSTRALIAN_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            </div>
            <Button type="submit" size="lg" className="shrink-0">
              Search
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-faint">Browse:</span>
            {popular.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => navigate(`/events?category=${encodeURIComponent(c)}`)}
                className="rounded-lg border border-line bg-white px-3 py-1 font-medium text-muted transition-colors duration-150 hover:border-line-strong hover:text-ink cursor-pointer"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
