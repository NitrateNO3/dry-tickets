import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AUSTRALIAN_CITIES, type Artist, type EventItem, type Tier } from '../../data/events'
import { useEvents } from '../../lib/events'
import { deleteEvent, upsertEvents } from '../../lib/supabase'
import { slugify } from '../../lib/slug'
import { AVAILABILITY, LIMITS, validateEvent } from '../../lib/validate'
import { Button, Field, Img, Input, Select, Textarea } from '../../components/Primitives'
import { Close } from '../../components/Icons'

const OTHER = '__other__'

/** Turns Supabase/Postgres errors into something an admin can act on. */
const describe = (err: unknown) => {
  const code = (err as { code?: string })?.code
  if (code === '42501') return "Your account isn't allowed to change shows. Sign out and back in; if it persists, the admin role is missing."
  if (code === '23514') return 'The database rejected a field as outside the allowed format. Check URLs are https:// and prices and lengths are within limits.'
  if (code === '23505') return 'A show with this URL slug already exists.'
  return err instanceof Error ? err.message : 'Something went wrong. Try again.'
}

const blank = (): EventItem => ({
  slug: '',
  title: '',
  description: '',
  image: '',
  metro: '',
  artists: [],
  tiers: [],
  category: '',
  presale: false,
})

// ponytail: datetime-local is read and written in the admin's browser timezone.
const toLocal = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
const fromLocal = (local: string) => (local ? new Date(local).toISOString() : undefined)

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="t-h3 mb-6 text-ink">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

/** Dropdown of known values plus an "Other…" option that reveals a free-text input. */
function PickOrType({
  id,
  label,
  value,
  options,
  onChange,
  required,
}: {
  id: string
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
  required?: boolean
}) {
  const known = options.includes(value)
  const [other, setOther] = useState(!known && value !== '')
  return (
    <Field label={label} id={id}>
      <div className="grid gap-2 sm:grid-cols-2">
        <Select
          id={id}
          value={other ? OTHER : value}
          onChange={(e) => {
            if (e.target.value === OTHER) {
              setOther(true)
              onChange('')
            } else {
              setOther(false)
              onChange(e.target.value)
            }
          }}
          required={required && !other}
        >
          <option value="">Choose…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
          <option value={OTHER}>Other…</option>
        </Select>
        {other && (
          <Input aria-label={`${label} (other)`} maxLength={80} value={value} onChange={(e) => onChange(e.target.value)} required={required} autoFocus />
        )}
      </div>
    </Field>
  )
}

/** Waits for the event list, then mounts the form with the record (or a blank one) as initial state. */
export default function AdminEventForm() {
  const { slug } = useParams()
  const { get, loading } = useEvents()
  if (slug && loading) return <div className="skeleton h-96 rounded-xl" aria-hidden />
  const existing = slug ? get(slug) : undefined
  if (slug && !existing) {
    return (
      <div className="card px-4 py-20 text-center">
        <h2 className="t-h3 text-ink">Show not found</h2>
        <Button to="/admin" variant="outline" className="mt-6">
          Back to shows
        </Button>
      </div>
    )
  }
  return <Form key={slug ?? 'new'} initial={existing ?? blank()} isNew={!slug} />
}

function Form({ initial, isNew }: { initial: EventItem; isNew: boolean }) {
  const navigate = useNavigate()
  const { events, categories, refresh } = useEvents()

  const [draft, setDraft] = useState<EventItem>(initial)
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string>()

  const set = <K extends keyof EventItem>(k: K, v: EventItem[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const setTitle = (title: string) => setDraft((d) => ({ ...d, title, slug: slugTouched || !isNew ? d.slug : slugify(title) }))

  const setArtist = (i: number, patch: Partial<Artist>) =>
    set(
      'artists',
      draft.artists.map((a, j) => (j === i ? { ...a, ...patch } : a)),
    )
  const setTier = (i: number, patch: Partial<Tier>) =>
    set(
      'tiers',
      draft.tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)),
    )

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(undefined)
    if (isNew && events.some((x) => x.slug === draft.slug)) {
      setError(`A show with the URL slug "${draft.slug}" already exists.`)
      return
    }
    setSaving(true)
    try {
      const clean: EventItem = {
        ...draft,
        artists: draft.artists.filter((a) => a.name.trim()).map((a) => ({ name: a.name.trim(), image: a.image?.trim() || undefined })),
        tiers: draft.tiers.filter((t) => t.name.trim()).map((t) => ({ ...t, name: t.name.trim(), price: Number(t.price) || 0 })),
      }
      const problem = validateEvent(clean)
      if (problem) {
        setError(problem)
        setSaving(false)
        return
      }
      await upsertEvents([clean])
      await refresh()
      sessionStorage.setItem('admin-notice', `Saved "${clean.title}".`)
      navigate('/admin')
    } catch (err) {
      setError(describe(err))
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!confirm(`Delete "${draft.title}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteEvent(draft.slug)
      await refresh()
      sessionStorage.setItem('admin-notice', `Deleted "${draft.title}".`)
      navigate('/admin')
    } catch (err) {
      setError(describe(err))
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={save} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Section title="Basics">
          <Field label="Title" id="title">
            <Input id="title" required maxLength={LIMITS.title} value={draft.title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="URL slug" id="slug" hint={`Public page: /event/${draft.slug || '…'}`}>
            <Input
              id="slug"
              required
              maxLength={LIMITS.slug}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              title="Lowercase letters, numbers and dashes"
              value={draft.slug}
              readOnly={!isNew}
              onChange={(e) => {
                setSlugTouched(true)
                set('slug', e.target.value)
              }}
            />
          </Field>
          <PickOrType id="category" label="Category" value={draft.category} options={categories} onChange={(v) => set('category', v)} required />
          <label className="flex items-center gap-3 text-sm text-ink">
            <input type="checkbox" className="h-4 w-4 rounded-md accent-blue" checked={draft.presale} onChange={(e) => set('presale', e.target.checked)} />
            Presale — dates not yet announced, collect emails instead of selling tickets
          </label>
          <Field label="Description" id="description">
            <Textarea id="description" rows={4} maxLength={LIMITS.description} value={draft.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
        </Section>

        <Section title="When and where">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Starts" id="start">
              <Input id="start" type="datetime-local" value={toLocal(draft.start)} onChange={(e) => set('start', fromLocal(e.target.value))} />
            </Field>
            <Field label="Ends" id="end">
              <Input id="end" type="datetime-local" value={toLocal(draft.end)} onChange={(e) => set('end', fromLocal(e.target.value))} />
            </Field>
          </div>
          <PickOrType
            id="metro"
            label="City"
            value={draft.metro}
            options={AUSTRALIAN_CITIES.map((c) => c.name)}
            onChange={(v) => set('metro', v)}
            required
          />
          <Field label="Venue" id="venue">
            <Input id="venue" maxLength={LIMITS.text} value={draft.venue ?? ''} onChange={(e) => set('venue', e.target.value || undefined)} />
          </Field>
          <Field label="Street address" id="street">
            <Input id="street" maxLength={LIMITS.text} value={draft.street ?? ''} onChange={(e) => set('street', e.target.value || undefined)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Suburb" id="city">
              <Input id="city" maxLength={LIMITS.text} value={draft.city ?? ''} onChange={(e) => set('city', e.target.value || undefined)} />
            </Field>
            <Field label="State" id="region">
              <Input id="region" maxLength={LIMITS.text} value={draft.region ?? ''} onChange={(e) => set('region', e.target.value || undefined)} />
            </Field>
            <Field label="Postcode" id="postcode">
              <Input id="postcode" maxLength={LIMITS.postcode} inputMode="numeric" value={draft.postcode ?? ''} onChange={(e) => set('postcode', e.target.value || undefined)} />
            </Field>
          </div>
        </Section>

        <Section title="Artists">
          {draft.artists.map((a, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input aria-label="Artist name" placeholder="Name" maxLength={LIMITS.name} value={a.name} onChange={(e) => setArtist(i, { name: e.target.value })} />
              <Input
                aria-label="Artist image URL"
                type="url"
                pattern="https://.*"
                title="Must start with https://"
                maxLength={LIMITS.url}
                placeholder="Image URL"
                value={a.image ?? ''}
                onChange={(e) => setArtist(i, { image: e.target.value })}
                className="col-span-2 sm:col-span-1"
              />
              <button
                type="button"
                aria-label="Remove artist"
                onClick={() => set('artists', draft.artists.filter((_, j) => j !== i))}
                className="grid h-11 w-11 place-items-center rounded-lg border border-line text-muted hover:border-line-strong hover:text-danger cursor-pointer sm:row-start-1 sm:col-start-3"
              >
                <Close className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => set('artists', [...draft.artists, { name: '' }])}>
            Add artist
          </Button>
        </Section>

        <Section title="Tickets">
          {draft.tiers.map((t, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
              <Input aria-label="Ticket name" placeholder="e.g. General admission" maxLength={LIMITS.name} value={t.name} onChange={(e) => setTier(i, { name: e.target.value })} />
              <Input
                aria-label="Price in AUD"
                type="number"
                min={0}
                max={LIMITS.price}
                step="0.01"
                placeholder="Price"
                value={t.price}
                onChange={(e) => setTier(i, { price: Number(e.target.value) })}
                className="col-span-2 sm:col-span-1"
              />
              <Select aria-label="Availability" value={t.availability} onChange={(e) => setTier(i, { availability: e.target.value })} className="col-span-2 sm:col-span-1">
                {AVAILABILITY.map((v) => (
                  <option key={v} value={v}>
                    {v === 'InStock' ? 'Available' : v === 'LimitedAvailability' ? 'Limited' : 'Sold out'}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                aria-label="Remove ticket"
                onClick={() => set('tiers', draft.tiers.filter((_, j) => j !== i))}
                className="grid h-11 w-11 place-items-center rounded-lg border border-line text-muted hover:border-line-strong hover:text-danger cursor-pointer sm:row-start-1 sm:col-start-4"
              >
                <Close className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => set('tiers', [...draft.tiers, { name: '', price: 0, availability: 'InStock' }])}>
            Add ticket type
          </Button>
        </Section>
      </div>

      <div className="space-y-6 lg:sticky lg:top-24">
        <Section title="Poster">
          <Field label="Image URL" id="image">
            <Input id="image" type="url" required pattern="https://.*" title="Must start with https://" maxLength={LIMITS.url} value={draft.image} onChange={(e) => set('image', e.target.value)} />
          </Field>
          {draft.image ? (
            <Img key={draft.image} src={draft.image} alt="Poster preview" className="aspect-[460/651] rounded-lg border border-line" />
          ) : (
            <div className="grid aspect-[460/651] place-items-center rounded-lg border border-dashed border-line text-sm text-faint">
              Poster preview
            </div>
          )}
        </Section>

        <div className="card space-y-3 p-6">
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" loading={saving} className="w-full">
            {isNew ? 'Create show' : 'Save changes'}
          </Button>
          <Button to="/admin" variant="outline" className="w-full">
            Cancel
          </Button>
          {!isNew && (
            <Button variant="ghost" onClick={remove} loading={deleting} className="w-full text-danger hover:bg-danger-light hover:text-danger">
              Delete show
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
