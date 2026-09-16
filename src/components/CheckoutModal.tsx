import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { EventItem, Tier } from '../data/events'
import { BOOKINGS_INBOX, submitBooking } from '../lib/booking'
import { cx, fmtDate, fmtTime, money } from '../lib/format'
import { Button, Field, Input, useDialog } from './Primitives'
import { Check, Close } from './Icons'

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

type Step = 'details' | 'confirmed'

const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <div className={cx('flex justify-between gap-4', strong ? 'text-base font-semibold text-ink' : 'text-sm text-muted')}>
    <span>{label}</span>
    <span className={cx('text-right', !strong && 'font-medium text-ink')}>{value}</span>
  </div>
)

export function CheckoutModal({ isOpen, onClose, event, tier, qty, subtotal, fee, total }: Props) {
  const [step, setStep] = useState<Step>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [orderId, setOrderId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const when = `${fmtDate(event.start)} · ${fmtTime(event.start)}`
  const where = [event.venue, event.metro].filter(Boolean).join(', ')

  const close = () => {
    if (submitting) return
    setStep('details')
    setName('')
    setEmail('')
    setPhone('')
    setError('')
    onClose()
  }
  useDialog(isOpen, close)

  const submit = async (e: React.FormEvent) => {
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
        event_date: when,
        venue: where,
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-ink/40"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 my-8 w-full max-w-lg rounded-xl border border-line bg-white p-6 shadow-xl sm:p-8"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink cursor-pointer"
            >
              <Close className="h-4 w-4" />
            </button>

            {step === 'details' && (
              <>
                <h2 id="checkout-title" className="t-h3 text-ink">
                  Your order
                </h2>
                <p className="mt-1 truncate text-sm text-muted">{event.title}</p>

                <div className="mt-6 space-y-2 rounded-lg border border-line bg-surface p-4">
                  <Row label={`${qty} × ${tier.name}`} value={money(subtotal)} />
                  <Row label="Date" value={when} />
                  <Row label="Venue" value={where} />
                  <Row label="Booking fee" value={money(fee)} />
                  <div className="border-t border-line pt-2">
                    <Row label="Total" value={money(total)} strong />
                  </div>
                </div>

                <form onSubmit={submit} className="mt-6 space-y-4">
                  <p className="text-sm text-muted">
                    No payment needed now. We’ll email a confirmation and contact you to finalise your booking.
                  </p>
                  <Field label="Full name" id="co-name">
                    <Input id="co-name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                  </Field>
                  <Field label="Email" id="co-email">
                    <Input id="co-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  </Field>
                  <Field label="Mobile" id="co-phone">
                    <Input id="co-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="0412 345 678" />
                  </Field>

                  {error && (
                    <p role="alert" className="rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger">
                      {error}
                    </p>
                  )}

                  <Button type="submit" size="lg" loading={submitting} className="w-full">
                    Submit booking
                  </Button>
                </form>
              </>
            )}

            {step === 'confirmed' && (
              <>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-success-light text-success">
                  <Check className="h-6 w-6" />
                </div>
                <h2 id="checkout-title" className="t-h2 mt-4 text-ink">
                  Booking request received
                </h2>
                <p className="mt-2 text-sm text-muted">
                  A confirmation has been sent to <span className="font-medium text-ink">{email}</span>. No payment has
                  been taken. Our team will contact you to finalise your tickets.
                </p>

                <div className="mt-6 rounded-lg border border-line bg-surface p-4">
                  <div className="min-w-0">
                    <span className="t-label text-blue">Booking request</span>
                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-ink">{event.title}</h3>
                    <p className="mt-1 text-xs text-muted">{when}</p>
                    <p className="text-xs text-muted">{where}</p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-dashed border-line pt-4 text-xs">
                    <div>
                      <span className="text-muted">Reference</span>
                      <p className="font-mono font-semibold text-ink">{orderId}</p>
                    </div>
                    <div>
                      <span className="text-muted">Tickets</span>
                      <p className="font-semibold text-ink">
                        {qty} × {tier.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted">Name</span>
                      <p className="font-semibold text-ink">{name}</p>
                    </div>
                    <div>
                      <span className="text-muted">Total due</span>
                      <p className="font-semibold text-ink">{money(total)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button size="md" onClick={close} className="w-full">
                    Done
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
