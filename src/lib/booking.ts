/**
 * Booking requests go to the `booking` Supabase Edge Function (supabase/functions/booking),
 * which looks up the real price and emails the bookings inbox and the buyer via Gmail.
 */
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from './supabase'

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
  if (!supabase) throw new Error('Supabase is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE.')

  const { data, error } = await supabase.functions.invoke<BookingResult>('booking', { body: booking })
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const res = error.context as Response
      const body = await res.json().catch(() => null)
      if (res.status < 500 && typeof body?.error === 'string') throw new BookingError(body.error)
    }
    throw error
  }
  return data!
}
