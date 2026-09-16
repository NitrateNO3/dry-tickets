/**
 * Booking requests are emailed via EmailJS (https://www.emailjs.com) — no backend.
 * Two templates: a confirmation to the customer and a copy to the bookings inbox.
 * Template HTML lives in docs/emailjs/.
 */

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const CUSTOMER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID
const ADMIN_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID

export const BOOKINGS_INBOX = 'ticketbookingau@gmail.com'

export type BookingRequest = {
  name: string
  email: string
  phone: string
  event_title: string
  event_date: string
  venue: string
  tickets: string
  subtotal: string
  fee: string
  total: string
}

const newReference = () => `DT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`

async function sendTemplate(templateId: string, params: Record<string, string>) {
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: templateId,
      user_id: PUBLIC_KEY,
      template_params: params,
    }),
  })
  if (!res.ok) throw new Error(`EmailJS ${res.status}: ${await res.text()}`)
}

/** Sends both emails and returns the booking reference. */
export async function submitBooking(booking: BookingRequest): Promise<string> {
  if (!SERVICE_ID || !PUBLIC_KEY || !CUSTOMER_TEMPLATE_ID || !ADMIN_TEMPLATE_ID) {
    throw new Error('EmailJS is not configured — set the VITE_EMAILJS_* variables.')
  }

  const reference = newReference()
  const params = {
    ...booking,
    reference,
    bookings_inbox: BOOKINGS_INBOX,
    submitted_at: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' }),
  }

  // The inbox copy goes first so a request is never lost if the customer's address bounces.
  await sendTemplate(ADMIN_TEMPLATE_ID, params)
  await sendTemplate(CUSTOMER_TEMPLATE_ID, params)
  return reference
}
