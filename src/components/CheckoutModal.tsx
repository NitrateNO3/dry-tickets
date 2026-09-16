import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { EventItem, Tier } from '../data/events'
import { BOOKINGS_INBOX, submitBooking } from '../lib/booking'
import { fmtDate, fmtTime, money } from '../lib/format'
import { Button } from './Primitives'
import { Check, Close, Pin, Ticket } from './Icons'

type Props = {
  isOpen: boolean
  onClose: () => void
  event: EventItem
  tier: Tier
  qty: number
  subtotal: number
  fee: number
  total: number
}

export function CheckoutModal({
  isOpen,
  onClose,
  event,
  tier,
  qty,
  subtotal,
  fee,
  total,
}: Props) {
  const [step, setStep] = useState<'details' | 'confirmed'>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [orderId, setOrderId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !phone || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const reference = await submitBooking({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        event_title: event.title,
        event_date: `${fmtDate(event.start)} · ${fmtTime(event.start)}`,
        venue: [event.venue, event.metro].filter(Boolean).join(', '),
        tickets: `${qty} × ${tier.name}`,
        subtotal: `${money(subtotal)} AUD`,
        fee: `${money(fee)} AUD`,
        total: `${money(total)} AUD`,
      })
      setOrderId(reference)
      setStep('confirmed')
    } catch (err) {
      console.error('Booking submission failed', err)
      // In dev, surface the real cause (usually missing VITE_EMAILJS_* config) instead of the generic message.
      const detail = import.meta.env.DEV && err instanceof Error ? ` (${err.message})` : ''
      setError(`We couldn’t submit your booking right now. Please try again, or email ${BOOKINGS_INBOX}.${detail}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (submitting) return
    setStep('details')
    setName('')
    setEmail('')
    setPhone('')
    setError('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-8 border border-line shadow-2xl z-10 my-8"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-cream transition-colors cursor-pointer"
            >
              <Close className="h-4 w-4" />
            </button>

            {/* Step 1: Customer Details & Order Summary */}
            {step === 'details' && (
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-light text-blue">
                    <Ticket className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-cream">Order Summary</h3>
                    <p className="text-xs text-muted truncate max-w-[280px]">
                      {event.title}
                    </p>
                  </div>
                </div>

                {/* Ticket line */}
                <div className="mt-5 rounded-2xl bg-surface-2 p-4 border border-line space-y-2 text-[13px]">
                  <div className="flex justify-between font-bold text-cream">
                    <span>
                      {qty} × {tier.name}
                    </span>
                    <span>{money(subtotal)} AUD</span>
                  </div>
                  <div className="flex justify-between text-muted text-xs">
                    <span>Event Date</span>
                    <span className="text-cream font-medium">
                      {fmtDate(event.start)} · {fmtTime(event.start)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted text-xs">
                    <span>Venue</span>
                    <span className="text-cream font-medium truncate max-w-[220px]">
                      {event.venue}, {event.metro}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted text-xs">
                    <span>Booking & Facility Fee</span>
                    <span className="text-cream font-medium">{money(fee)} AUD</span>
                  </div>
                  <div className="flex justify-between border-t border-line pt-2.5 text-base font-bold text-cream">
                    <span>Total</span>
                    <span className="text-lg font-black text-cream">{money(total)} AUD</span>
                  </div>
                </div>

                {/* Customer Information Form - No Password / No Login Required */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                      Your Details
                    </h4>
                    <p className="text-[11px] text-muted">
                      No payment needed now. We’ll email a confirmation and contact you to finalise your booking.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cream mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Smith"
                      className="h-11 w-full rounded-xl bg-white px-4 text-sm text-cream placeholder:text-muted border border-[#D0D5DD] focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-light transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cream mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="h-11 w-full rounded-xl bg-white px-4 text-sm text-cream placeholder:text-muted border border-[#D0D5DD] focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-light transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cream mb-1">
                      Phone Number (Australian Mobile)
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0412 345 678"
                      className="h-11 w-full rounded-xl bg-white px-4 text-sm text-cream placeholder:text-muted border border-[#D0D5DD] focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-light transition-all"
                    />
                  </div>

                  {error && (
                    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    variant="primary"
                    disabled={submitting}
                    className="w-full mt-3 font-bold"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Submitting…
                      </span>
                    ) : (
                      'Submit Booking'
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Booking Request Received */}
            {step === 'confirmed' && (
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Check className="h-7 w-7" />
                </div>

                <h3 className="mt-4 text-2xl font-black text-cream">Booking Request Received!</h3>
                <p className="mt-1 text-sm text-muted">
                  A confirmation has been sent to <span className="font-bold text-cream">{email}</span>. No payment has been taken. Our team will contact you to finalise your tickets.
                </p>

                {/* Clean E-Ticket Card */}
                <div className="mt-6 rounded-2xl bg-surface-2 p-5 border border-line text-left relative overflow-hidden border-t-4 border-t-blue shadow-xs">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue">
                        Booking Request
                      </span>
                      <h4 className="text-base font-bold text-cream leading-snug mt-0.5 line-clamp-2">
                        {event.title}
                      </h4>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                        <Pin className="h-3 w-3 text-blue" />
                        {event.venue}, {event.metro}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-muted">Booking Reference</span>
                      <p className="font-mono text-sm font-black text-cream">{orderId}</p>
                    </div>
                  </div>

                  <div className="my-4 border-t border-dashed border-line" />

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted">Customer Name:</span>
                      <p className="font-bold text-cream">{name}</p>
                    </div>
                    <div>
                      <span className="text-muted">Ticket Tier:</span>
                      <p className="font-bold text-cream">
                        {qty} × {tier.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted">Date & Time:</span>
                      <p className="font-bold text-cream">
                        {fmtDate(event.start)} · {fmtTime(event.start)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted">Total Due:</span>
                      <p className="font-black text-cream">{money(total)} AUD</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button variant="primary" size="md" onClick={handleClose} className="flex-1 font-bold">
                    Done
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
