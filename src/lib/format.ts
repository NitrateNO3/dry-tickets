const TZ = 'Australia/Sydney'

const part = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: TZ, ...opts }).format(d)

export const parse = (iso?: string) => (iso ? new Date(iso) : undefined)

export const fmtDay = (iso?: string) => (iso ? part(new Date(iso), { day: '2-digit' }) : '—')
export const fmtMonth = (iso?: string) => (iso ? part(new Date(iso), { month: 'short' }).toUpperCase() : 'TBA')
export const fmtYear = (iso?: string) => (iso ? part(new Date(iso), { year: 'numeric' }) : '')
export const fmtWeekday = (iso?: string) => (iso ? part(new Date(iso), { weekday: 'short' }).toUpperCase() : '')

export const fmtDate = (iso?: string) =>
  iso ? part(new Date(iso), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Date to be announced'

export const fmtDateShort = (iso?: string) =>
  iso ? part(new Date(iso), { weekday: 'short', day: 'numeric', month: 'short' }) : 'TBA'

export const fmtTime = (iso?: string) =>
  iso ? part(new Date(iso), { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase() : ''

export const monthKey = (iso?: string) =>
  iso ? part(new Date(iso), { month: 'long', year: 'numeric' }) : 'To be announced'

export const money = (n?: number) =>
  n === undefined
    ? ''
    : new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: n % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(n)

export const daysUntil = (iso?: string) => {
  if (!iso) return undefined
  const ms = new Date(iso).getTime() - Date.now()
  return Math.ceil(ms / 86_400_000)
}

/** Short, human urgency label used on cards — only when it is genuinely close. */
export const urgency = (iso?: string) => {
  const d = daysUntil(iso)
  if (d === undefined || d < 0) return undefined
  if (d === 0) return 'Tonight'
  if (d === 1) return 'Tomorrow'
  if (d <= 7) return `In ${d} days`
  return undefined
}

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ')
