import type { EventItem } from '../data/events'

/** Mirrors the CHECK constraints in supabase/security.sql. The database is the authority. */
export const LIMITS = {
  slug: 160,
  title: 200,
  description: 5000,
  url: 1000,
  metro: 80,
  category: 80,
  text: 200,
  postcode: 10,
  tiers: 100,
  artists: 50,
  name: 120,
  price: 100000,
} as const

export const AVAILABILITY = ['InStock', 'LimitedAvailability', 'SoldOut'] as const

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const isHttps = (s: string) => /^https:\/\//.test(s)

const tooLong = (v: string | undefined, max: number) => (v ?? '').length > max

/** Returns the first problem as a sentence for the admin, or null if the event is valid. */
export function validateEvent(e: EventItem): string | null {
  if (!SLUG.test(e.slug) || e.slug.length > LIMITS.slug)
    return `URL slug must be lowercase letters, numbers and single dashes, up to ${LIMITS.slug} characters.`
  if (!e.title.trim() || e.title.length > LIMITS.title) return `Title is required, up to ${LIMITS.title} characters.`
  if (e.description.length > LIMITS.description) return `Description can be up to ${LIMITS.description} characters.`
  if (!isHttps(e.image) || e.image.length > LIMITS.url) return 'Poster image must be an https:// link.'
  if (!e.metro.trim() || e.metro.length > LIMITS.metro) return 'City is required.'
  if (!e.category.trim() || e.category.length > LIMITS.category) return 'Category is required.'
  for (const [label, v] of [
    ['Venue', e.venue],
    ['Street address', e.street],
    ['Suburb', e.city],
    ['State', e.region],
    ['Country', e.country],
  ] as const)
    if (tooLong(v, LIMITS.text)) return `${label} can be up to ${LIMITS.text} characters.`
  if (tooLong(e.postcode, LIMITS.postcode)) return `Postcode can be up to ${LIMITS.postcode} characters.`
  if (e.rating !== undefined && (e.rating < 0 || e.rating > 5)) return 'Rating must be between 0 and 5.'
  if (e.ratingCount !== undefined && e.ratingCount < 0) return 'Review count cannot be negative.'
  if (e.start && e.end && new Date(e.end) < new Date(e.start)) return 'End time must be after the start time.'

  if (e.tiers.length > LIMITS.tiers) return `A show can have up to ${LIMITS.tiers} ticket types.`
  for (const t of e.tiers) {
    if (!t.name.trim() || t.name.length > LIMITS.name) return `Every ticket type needs a name, up to ${LIMITS.name} characters.`
    if (!Number.isFinite(t.price) || t.price < 0 || t.price > LIMITS.price)
      return `Ticket prices must be between $0 and $${LIMITS.price.toLocaleString('en-AU')}.`
    if (!(AVAILABILITY as readonly string[]).includes(t.availability)) return 'Ticket availability is not a recognised value.'
  }

  if (e.artists.length > LIMITS.artists) return `A show can list up to ${LIMITS.artists} artists.`
  for (const a of e.artists) {
    if (!a.name.trim() || a.name.length > LIMITS.name) return `Every artist needs a name, up to ${LIMITS.name} characters.`
    if (a.image && (!isHttps(a.image) || a.image.length > LIMITS.url)) return 'Artist images must be https:// links.'
  }

  return null
}
