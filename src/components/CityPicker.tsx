import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Globe, LocateFixed, Search, X } from 'lucide-react'
import { AUSTRALIAN_CITIES } from '../data/events'
import { ALL_CITIES, useCity } from '../lib/city'
import { useEvents } from '../lib/events'
import { plural } from '../lib/copy'
import { cn } from '@/lib/utils'
import { useDialog } from './Primitives'
import { CITY_INFO } from './cityIcons'

const nearestCity = (lat: number, lng: number) =>
  AUSTRALIAN_CITIES.reduce((best, c) => {
    const i = CITY_INFO[c.name]
    const b = CITY_INFO[best.name]
    return (i.lat - lat) ** 2 + (i.lng - lng) ** 2 < (b.lat - lat) ** 2 + (b.lng - lng) ** 2 ? c : best
  }).name

export function CityPicker() {
  const { city, setCity, pickerOpen, closePicker } = useCity()
  const { live } = useEvents()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState('')

  const close = useCallback(() => {
    closePicker()
    setQ('')
    setLocError('')
  }, [closePicker])
  useDialog(pickerOpen, close)

  const choose = (name: string) => {
    setCity(name)
    setQ('')
    setLocError('')
    // On the listings page, apply the city straight to the results.
    if (pathname === '/events') navigate(name === ALL_CITIES ? '/events' : `/events?city=${encodeURIComponent(name)}`)
  }

  const detect = () => {
    if (!('geolocation' in navigator)) return setLocError('Location is not available in this browser.')
    setLocating(true)
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        choose(nearestCity(pos.coords.latitude, pos.coords.longitude))
      },
      () => {
        setLocating(false)
        setLocError('We could not detect your location. Pick a city below.')
      },
      { timeout: 10000, maximumAge: 600000 },
    )
  }

  const count = (name: string) => live.filter((e) => e.metro === name).length
  const matches = AUSTRALIAN_CITIES.filter((c) =>
    `${c.name} ${c.state}`.toLowerCase().includes(q.trim().toLowerCase()),
  )

  return (
    <AnimatePresence>
      {pickerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-ink/60 px-4 pb-8 pt-20 backdrop-blur-sm sm:pt-24"
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="city-picker-title"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="p-4 sm:p-6">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-faint" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search for your city"
                  aria-label="Search for your city"
                  className="h-12 w-full rounded-lg border border-line bg-white pl-12 pr-12 text-base text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus:border-blue focus:ring-4 focus:ring-blue/10"
                />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close city picker"
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-faint transition-colors hover:bg-surface hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                <button
                  type="button"
                  onClick={detect}
                  disabled={locating}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-blue transition-colors hover:text-blue-dark disabled:opacity-60"
                >
                  <LocateFixed className={cn('h-4 w-4', locating && 'animate-spin')} />
                  {locating ? 'Detecting your location…' : 'Detect my location'}
                </button>
                <button
                  type="button"
                  onClick={() => choose(ALL_CITIES)}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  <Globe className="h-4 w-4" />
                  Show all of Australia
                </button>
              </div>
              {locError && <p className="mt-2 text-sm text-danger">{locError}</p>}
            </div>

            <div className="border-t border-line bg-surface/60 px-4 py-6 sm:px-6 sm:py-8">
              <h2 id="city-picker-title" className="text-center text-base font-semibold text-ink">
                {q.trim() ? 'Matching cities' : 'Popular cities'}
              </h2>

              {matches.length === 0 ? (
                <p className="mt-6 text-center text-sm text-muted">
                  No city matches “{q.trim()}”. Try another city, or show all of Australia.
                </p>
              ) : (
                <ul className="mt-4 grid grid-cols-3 gap-1 sm:mt-6 sm:grid-cols-4 sm:gap-2 lg:grid-cols-8">
                  {matches.map((c) => {
                    const { Icon } = CITY_INFO[c.name]
                    const n = count(c.name)
                    const active = city === c.name
                    return (
                      <li key={c.name}>
                        <button
                          type="button"
                          onClick={() => choose(c.name)}
                          aria-pressed={active}
                          className={cn(
                            'group flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border px-1 py-3 transition-all sm:px-2 sm:py-5 duration-200',
                            active
                              ? 'border-blue bg-blue-light'
                              : 'border-transparent hover:-translate-y-0.5 hover:border-line hover:bg-white hover:shadow-md',
                          )}
                        >
                          <Icon
                            strokeWidth={1.25}
                            className={cn(
                              'h-9 w-9 transition-colors sm:h-12 sm:w-12',
                              active ? 'text-blue' : 'text-muted group-hover:text-blue',
                            )}
                          />
                          <span className="text-center leading-tight">
                            <span className={cn('block text-sm font-medium', active ? 'text-blue' : 'text-ink')}>
                              {c.name}
                            </span>
                            <span className="mt-1 block text-xs text-faint">
                              {n > 0 ? `${n} ${plural(n, 'show')}` : c.state}
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
