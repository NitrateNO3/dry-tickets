import { createClient } from '@supabase/supabase-js'
import type { EventItem } from '../data/events'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
// Publishable key only (sb_publishable_…) — it ships to every browser and is safe because
// row-level security guards writes. NEVER put the secret key (sb_secret_…) in a VITE_ variable.
// Named without "KEY" because Vercel refuses to save VITE_*KEY* variables; the old name is still accepted.
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined

/**
 * Null when the env vars are missing — the site then runs on the built-in seed events.
 * The admin session lives in sessionStorage, so it ends when the tab closes and is not shared
 * across tabs. (No server here, so an HttpOnly cookie isn't possible; the CSP in vercel.json
 * blocks the injected scripts that could otherwise read the token.)
 */
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: { storage: window.sessionStorage, persistSession: true, autoRefreshToken: true },
      })
    : null

/** Columns the site reads. Explicit so nothing added to the table later is exposed by accident. */
const EVENT_COLUMNS =
  'slug,title,description,image,start,end,rating,rating_count,venue,street,city,metro,region,postcode,country,artists,tiers,low,high,category,presale'

type Row = {
  slug: string
  title: string
  description: string
  image: string
  start: string | null
  end: string | null
  rating: number | null
  rating_count: number | null
  venue: string | null
  street: string | null
  city: string | null
  metro: string
  region: string | null
  postcode: string | null
  country: string | null
  artists: EventItem['artists']
  tiers: EventItem['tiers']
  low: number | null
  high: number | null
  category: string
  presale: boolean
}

/** What the client sends. low/high and updated_at are computed by the database trigger. */
type WriteRow = Omit<Row, 'low' | 'high'>

const orUndef = <T>(v: T | null) => (v === null ? undefined : v)
const orNull = <T>(v: T | undefined) => (v === undefined || v === '' ? null : v)

export const fromRow = (r: Row): EventItem => ({
  slug: r.slug,
  title: r.title,
  description: r.description,
  image: r.image,
  start: orUndef(r.start),
  end: orUndef(r.end),
  rating: orUndef(r.rating),
  ratingCount: orUndef(r.rating_count),
  venue: orUndef(r.venue),
  street: orUndef(r.street),
  city: orUndef(r.city),
  metro: r.metro,
  region: orUndef(r.region),
  postcode: orUndef(r.postcode),
  country: orUndef(r.country),
  artists: r.artists ?? [],
  tiers: r.tiers ?? [],
  low: orUndef(r.low),
  high: orUndef(r.high),
  category: r.category,
  presale: r.presale,
})

export const toRow = (e: EventItem): WriteRow => {
  return {
    slug: e.slug,
    title: e.title,
    description: e.description,
    image: e.image,
    start: orNull(e.start),
    end: orNull(e.end),
    rating: orNull(e.rating),
    rating_count: orNull(e.ratingCount),
    venue: orNull(e.venue),
    street: orNull(e.street),
    city: orNull(e.city),
    metro: e.metro,
    region: orNull(e.region),
    postcode: orNull(e.postcode),
    country: orNull(e.country),
    artists: e.artists,
    tiers: e.tiers,
    category: e.category,
    presale: e.presale,
  }
}

const client = () => {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function fetchEvents(): Promise<EventItem[]> {
  const { data, error } = await client().from('events').select(EVENT_COLUMNS)
  if (error) throw error
  return (data as Row[]).map(fromRow)
}

export async function upsertEvents(items: EventItem[]) {
  const { error } = await client().from('events').upsert(items.map(toRow))
  if (error) throw error
}

export async function deleteEvent(slug: string) {
  // RLS doesn't raise on a blocked delete — it just matches 0 rows — so check what was removed.
  const { data, error } = await client().from('events').delete().eq('slug', slug).select('slug')
  if (error) throw error
  if (!data?.length) throw Object.assign(new Error('Nothing was deleted.'), { code: '42501' })
}
