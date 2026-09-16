import { createClient } from '@supabase/supabase-js'
import type { EventItem } from '../data/events'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Null when the env vars are missing — the site then runs on the built-in seed events. */
export const supabase = url && key ? createClient(url, key) : null

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
  updated_at?: string
}

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

export const toRow = (e: EventItem): Row => {
  const prices = e.tiers.map((t) => t.price)
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
    low: prices.length ? Math.min(...prices) : null,
    high: prices.length ? Math.max(...prices) : null,
    category: e.category,
    presale: e.presale,
  }
}

const client = () => {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function fetchEvents(): Promise<EventItem[]> {
  const { data, error } = await client().from('events').select('*')
  if (error) throw error
  return (data as Row[]).map(fromRow)
}

export async function upsertEvents(items: EventItem[]) {
  const { error } = await client().from('events').upsert(items.map(toRow))
  if (error) throw error
}

export async function deleteEvent(slug: string) {
  const { error } = await client().from('events').delete().eq('slug', slug)
  if (error) throw error
}
