/**
 * Booking requests go to the Vercel function api/booking.ts, which looks up the real price and
 * emails the bookings inbox and the buyer via Gmail.
 */
export const BOOKINGS_INBOX = 'ticketbookingau@gmail.com'

export type BookingRequest = {
  slug: string
  tier: string
  qty: number
  name: string
  email: string
  phone: string
}

export type BookingResult = { reference: string; confirmationSent: boolean }

/** An error whose message comes from the server and is fit to show the buyer. */
export class BookingError extends Error {}

export async function submitBooking(booking: BookingRequest): Promise<BookingResult> {
  const res = await fetch('/api/booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  })
  const body = await res.json().catch(() => null)
  if (res.ok && body?.reference) return body as BookingResult
  if (res.status < 500 && typeof body?.error === 'string') throw new BookingError(body.error)
  throw new Error(`Booking API ${res.status}${body?.error ? `: ${body.error}` : ''}`)
}
