/**
 * POST /api/booking — booking request emails (Vercel function).
 *
 * The site posts { slug, tier, qty, name, email, phone }. The price is looked up here (Supabase
 * when configured, otherwise the built-in events), so the browser can't change the total. Then a
 * details email goes to the bookings inbox and a confirmation to the buyer, both via Gmail.
 *
 * Vercel env vars: GMAIL_USER, GMAIL_APP_PASSWORD (a Google app password), optional BOOKINGS_INBOX.
 */
import nodemailer from 'nodemailer'
import { seedEvents } from '../src/data/events.js'
import { BOOKING_FEE_RATE, MAX_TICKETS } from '../src/lib/pricing.js'

const TZ = 'Australia/Sydney'
const GMAIL_USER = process.env.GMAIL_USER ?? ''
const GMAIL_APP_PASSWORD = (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s/g, '')
const INBOX = process.env.BOOKINGS_INBOX || GMAIL_USER
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE ?? process.env.VITE_SUPABASE_ANON_KEY

const mailer = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
})

type Tier = { name: string; price: number; availability: string }
type EventRow = { title: string; start?: string | null; venue?: string | null; metro: string; tiers: Tier[] }

/** Errors whose message is safe to show the buyer. */
class UserError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

/* ------------------------------------------------------------ rate limit */
// Per warm instance only, so it's a speed bump, not a guarantee. Gmail's ~500/day cap is the backstop.
const HOUR = 3_600_000
const hits = new Map<string, number[]>()
function allow(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < HOUR)
  if (recent.length >= 5) return false
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return true
}

/* ------------------------------------------------------------ input */
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/
const PHONE_RE = /^[0-9+()\-.\s]{6,20}$/

function text(v: unknown, field: string, max: number) {
  const s = typeof v === 'string' ? v.trim() : ''
  if (!s) throw new UserError(`Please enter your ${field}.`)
  if (s.length > max || /[\r\n]/.test(s)) throw new UserError(`Please check your ${field}.`)
  return s
}

function parse(body: Record<string, unknown>) {
  const qty = body.qty
  if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1 || qty > MAX_TICKETS) {
    throw new UserError(`Choose between 1 and ${MAX_TICKETS} tickets.`)
  }
  const email = text(body.email, 'email', 254)
  if (!EMAIL_RE.test(email)) throw new UserError('Please enter a valid email address.')
  const phone = text(body.phone, 'mobile number', 20)
  if (!PHONE_RE.test(phone)) throw new UserError('Please enter a valid mobile number.')
  return {
    slug: text(body.slug, 'event', 160),
    tier: text(body.tier, 'ticket type', 120),
    qty,
    name: text(body.name, 'name', 120),
    email,
    phone,
  }
}

/** Same source the site shows: Supabase when configured, otherwise the built-in list. */
async function findEvent(slug: string): Promise<EventRow | undefined> {
  if (SUPABASE_URL && SUPABASE_KEY) {
    const url = `${SUPABASE_URL}/rest/v1/events?select=title,start,venue,metro,tiers&slug=eq.${encodeURIComponent(slug)}`
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } })
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
    return ((await res.json()) as EventRow[])[0]
  }
  return seedEvents.find((e) => e.slug === slug)
}

/* ------------------------------------------------------------ emails */
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const money = (n: number) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 2 }).format(n) + ' AUD'

const when = (iso?: string | null) => {
  if (!iso) return 'Date to be announced'
  const d = new Date(iso)
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-AU', { timeZone: TZ, ...o }).format(d)
  return `${f({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${f({ hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()}`
}

const newReference = () => `DT-${new Date().getFullYear()}-${100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000)}`

type Details = Record<'reference' | 'name' | 'email' | 'phone' | 'event' | 'date' | 'venue' | 'tickets' | 'subtotal' | 'fee' | 'total' | 'submitted', string>

const rows = (pairs: [string, string, boolean?][]) =>
  pairs
    .map(
      ([k, v, bold]) =>
        `<tr><td style="padding:6px 0;color:#667085;width:40%">${k}</td><td style="padding:6px 0;text-align:right;color:#101828;font-weight:${bold ? 700 : 600}">${esc(v)}</td></tr>`,
    )
    .join('')

const card = (inner: string) =>
  `<div style="margin:0;background:#f5f6f8;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif"><div style="max-width:520px;margin:0 auto;padding:32px 16px"><div style="background:#fff;border:1px solid #e4e7ec;border-radius:16px;padding:28px">${inner}</div></div></div>`

const orderRows = (d: Details) =>
  rows([
    ['Booking reference', d.reference],
    ['Event', d.event],
    ['Date &amp; time', d.date],
    ['Venue', d.venue],
    ['Tickets', d.tickets],
    ['Subtotal', d.subtotal],
    ['Booking fee', d.fee],
    ['Total due', d.total, true],
  ])

const inboxEmail = (d: Details) => ({
  from: { name: 'Dry Tickets Website', address: GMAIL_USER },
  to: INBOX,
  replyTo: { name: d.name, address: d.email },
  subject: `New booking request: ${d.tickets} — ${d.event} (${d.reference})`,
  html: card(
    `<h2 style="margin:0 0 4px;font-size:20px;color:#101828">New booking request</h2>` +
      `<p style="margin:0 0 16px;font-size:13px;color:#475467">Submitted ${esc(d.submitted)} (Sydney time). No payment has been taken. Reply to this email to contact the customer.</p>` +
      `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows([
        ['Customer name', d.name, true],
        ['Email', d.email, true],
        ['Phone', d.phone, true],
      ])}</table><hr style="border:0;border-top:1px solid #e4e7ec;margin:12px 0">` +
      `<table style="width:100%;border-collapse:collapse;font-size:14px">${orderRows(d)}</table>`,
  ),
})

const buyerEmail = (d: Details) => ({
  from: { name: 'Dry Tickets', address: GMAIL_USER },
  to: d.email,
  replyTo: INBOX,
  subject: `Booking request received — ${d.event} (${d.reference})`,
  html: card(
    `<p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#2563eb">Dry Tickets</p>` +
      `<h1 style="margin:8px 0 6px;font-size:22px;color:#101828">Thanks, ${esc(d.name)}!</h1>` +
      `<p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#475467">We've received your ticket request. No payment has been taken yet. Our team will contact you shortly to confirm your booking and arrange payment.</p>` +
      `<table style="width:100%;border-collapse:collapse;border-top:1px solid #e4e7ec;font-size:13px">${orderRows(d)}</table>` +
      `<p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:#667085">Questions? Reply to this email and quote your booking reference.</p>`,
  ),
})

/* ------------------------------------------------------------ handler */
export async function POST(req: Request) {
  try {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) throw new Error('GMAIL_USER / GMAIL_APP_PASSWORD are not set in Vercel')

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') throw new UserError('Invalid request.')
    const input = parse(body as Record<string, unknown>)

    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
    if (!allow(ip)) throw new UserError('Too many booking requests. Please try again later.', 429)

    const event = await findEvent(input.slug)
    if (!event) throw new UserError('This event is no longer available.', 404)
    const tier = event.tiers.find((t) => t.name === input.tier)
    if (!tier) throw new UserError('That ticket type is no longer available.', 404)
    if (tier.availability === 'SoldOut') throw new UserError('Sorry, that ticket type is sold out.', 409)

    const subtotal = tier.price * input.qty
    const fee = subtotal * BOOKING_FEE_RATE
    const d: Details = {
      reference: newReference(),
      name: input.name,
      email: input.email,
      phone: input.phone,
      event: event.title,
      date: when(event.start),
      venue: [event.venue, event.metro].filter(Boolean).join(', '),
      tickets: `${input.qty} × ${tier.name}`,
      subtotal: money(subtotal),
      fee: money(fee),
      total: money(subtotal + fee),
      submitted: new Date().toLocaleString('en-AU', { timeZone: TZ }),
    }

    // Inbox copy first, so the request is never lost if the buyer's address is rejected.
    await mailer.sendMail(inboxEmail(d))
    let confirmationSent = true
    try {
      await mailer.sendMail(buyerEmail(d))
    } catch (e) {
      console.error('Buyer confirmation failed', d.reference, e)
      confirmationSent = false
    }
    return json(200, { reference: d.reference, confirmationSent })
  } catch (e) {
    if (e instanceof UserError) return json(e.status, { error: e.message })
    console.error('Booking failed', e)
    return json(500, { error: 'Something went wrong' })
  }
}
