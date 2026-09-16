// Self-check for src/lib/validate.ts. Run: npm run check
import assert from 'node:assert/strict'
import { seedEvents, type EventItem } from '../src/data/events.ts'
import { LIMITS, validateEvent } from '../src/lib/validate.ts'

// Every built-in event must pass, or "Import built-in events" would be rejected by the database.
for (const e of seedEvents) assert.equal(validateEvent(e), null, `seed event ${e.slug} should be valid`)

const base: EventItem = seedEvents.find((e) => e.tiers.length > 0 && e.artists.length > 0)!
const bad = (patch: Partial<EventItem>, why: string) => assert.notEqual(validateEvent({ ...base, ...patch }), null, why)

bad({ slug: 'Has Spaces' }, 'slug with spaces/uppercase')
bad({ slug: 'double--dash' }, 'slug with double dash')
bad({ slug: 'a'.repeat(LIMITS.slug + 1) }, 'slug too long')
bad({ title: '   ' }, 'blank title')
bad({ image: 'javascript:alert(1)' }, 'javascript: poster URL')
bad({ image: 'http://insecure.example/p.jpg' }, 'http poster URL')
bad({ image: 'data:image/png;base64,AAAA' }, 'data: poster URL')
bad({ metro: '' }, 'missing city')
bad({ postcode: '12345678901' }, 'postcode too long')
bad({ rating: 6 }, 'rating above 5')
bad({ start: '2026-10-16T21:00:00+10:00', end: '2026-10-16T00:00:00+10:00' }, 'end before start')
bad({ tiers: [{ name: 'GA', price: -1, availability: 'InStock' }] }, 'negative price')
bad({ tiers: [{ name: 'GA', price: Number.NaN, availability: 'InStock' }] }, 'NaN price')
bad({ tiers: [{ name: 'GA', price: 10, availability: 'Free' }] }, 'unknown availability')
bad({ tiers: Array.from({ length: LIMITS.tiers + 1 }, () => ({ name: 'GA', price: 10, availability: 'InStock' })) }, 'too many tiers')
bad({ artists: [{ name: 'X', image: 'javascript:alert(1)' }] }, 'javascript: artist image')

assert.equal(validateEvent({ ...base, artists: [{ name: 'No image' }] }), null, 'artist without image is fine')
assert.equal(validateEvent({ ...base, start: undefined, end: undefined }), null, 'presale-style event without dates is fine')

console.log(`validate: ${seedEvents.length} seed events valid, all rejection cases rejected`)
