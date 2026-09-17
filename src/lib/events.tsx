import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { byDate, seedEvents, type EventItem } from '../data/events'
import { fetchEvents, supabase } from './supabase'

/* ---------------------------------------------------- pure derivations */

export const deriveLive = (all: EventItem[]) => all.filter((e) => !e.presale).sort(byDate)
export const derivePresale = (all: EventItem[]) => all.filter((e) => e.presale)
export const deriveCategories = (all: EventItem[]) => [...new Set(all.map((e) => e.category))].sort()

export const deriveArtists = (all: EventItem[]) =>
  [...new Map(all.flatMap((e) => e.artists).filter((a) => a.image).map((a) => [a.name, a])).values()]

/**
 * Hero line-up. Long, venue-stuffed titles read badly at display size, so we
 * favour short titles with a named artist and never repeat the same act twice.
 */
export const deriveFeatured = (live: EventItem[]) => {
  const seen = new Set<string>()
  const pick = live.filter((e) => {
    const key = e.artists[0]?.name ?? e.title
    if (seen.has(key) || e.artists.length === 0) return false
    seen.add(key)
    return true
  })
  const punchy = pick.filter((e) => e.title.length <= 56)
  return [...punchy, ...pick.filter((e) => !punchy.includes(e))].slice(0, 6)
}

/* ---------------------------------------------------------- provider */

type Source = 'seed' | 'supabase'

type Ctx = {
  events: EventItem[]
  loading: boolean
  source: Source
  error?: string
  refresh: () => Promise<void>
}

const EventsCtx = createContext<Ctx | null>(null)

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>(supabase ? [] : seedEvents)
  const [loading, setLoading] = useState(!!supabase)
  const [source, setSource] = useState<Source>(supabase ? 'supabase' : 'seed')
  const [error, setError] = useState<string>()

  // Resolves the fetch into state. Falls back to the built-in list so the public site never goes blank.
  const settle = useCallback(
    (p: Promise<EventItem[]>) =>
      p
        .then((list) => {
          setEvents(list)
          setSource('supabase')
          setError(undefined)
        })
        .catch((e: unknown) => {
          console.error('Could not load events from Supabase', e)
          setEvents(seedEvents)
          setSource('seed')
          setError(e instanceof Error ? e.message : String(e))
        })
        .finally(() => setLoading(false)),
    [],
  )

  const refresh = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    await settle(fetchEvents())
  }, [settle])

  useEffect(() => {
    if (supabase) settle(fetchEvents()) // initial state is already loading=true
  }, [settle])

  const value = useMemo(() => ({ events, loading, source, error, refresh }), [events, loading, source, error, refresh])
  return <EventsCtx.Provider value={value}>{children}</EventsCtx.Provider>
}

/** Event data plus every derivation the pages need. Memoised on the event list. */
export function useEvents() {
  const ctx = useContext(EventsCtx)
  if (!ctx) throw new Error('useEvents must be used inside <EventsProvider>')
  const { events } = ctx
  return useMemo(() => {
    const live = deriveLive(events)
    return {
      ...ctx,
      live,
      presale: derivePresale(events),
      featured: deriveFeatured(live),
      artists: deriveArtists(events),
      categories: deriveCategories(events),
      get: (slug: string) => events.find((e) => e.slug === slug),
    }
  }, [ctx, events])
}
