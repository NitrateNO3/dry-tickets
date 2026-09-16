import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { EventItem, Tier } from '../data/events'
import { cx, fmtDate, fmtTime, money } from '../lib/format'
import { Button, Field, Input, useDialog } from './Primitives'
import { Check, Close, CreditCard, QrCode, Shield } from './Icons'

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

type Step = 'details' | 'payment' | 'confirmed'
type Method = 'card' | 'apple' | 'google'

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
  const [method, setMethod] = useState<Method>('card')
  const [orderId, setOrderId] = useState('')
  const [processing, setProcessing] = useState(false)

  const close = () => {
    setStep('details')
    setName('')
    setEmail('')
    setPhone('')
    onClose()
  }
  useDialog(isOpen, close)

  const pay = (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    // ponytail: mocked gateway — replace with the real charge call.
    setTimeout(() => {
      setOrderId(`DT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`)
      setProcessing(false)
      setStep('confirmed')
    }, 900)
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
                  <Row label="Date" value={`${fmtDate(event.start)} · ${fmtTime(event.start)}`} />
                  <Row label="Venue" value={[event.venue, event.metro].filter(Boolean).join(', ')} />
                  <Row label="Booking fee" value={money(fee)} />
                  <div className="border-t border-line pt-2">
                    <Row label="Total" value={money(total)} strong />
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setStep('payment')
                  }}
                  className="mt-6 space-y-4"
                >
                  <p className="text-sm text-muted">Tickets are emailed and sent by SMS to these details.</p>
                  <Field label="Full name" id="co-name">
                    <Input id="co-name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                  </Field>
                  <Field label="Email" id="co-email">
                    <Input id="co-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  </Field>
                  <Field label="Mobile" id="co-phone">
                    <Input id="co-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
                  </Field>
                  <Button type="submit" size="lg" className="w-full">
                    Continue to payment
                  </Button>
                </form>
              </>
            )}

            {step === 'payment' && (
              <>
                <div className="flex items-baseline justify-between gap-4 pr-10">
                  <h2 id="checkout-title" className="t-h3 text-ink">
                    Payment
                  </h2>
                  <span className="text-base font-semibold text-ink">{money(total)}</span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2" role="group" aria-label="Payment method">
                  {(
                    [
                      { id: 'card', label: 'Card' },
                      { id: 'apple', label: 'Apple Pay' },
                      { id: 'google', label: 'Google Pay' },
                    ] as { id: Method; label: string }[]
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      aria-pressed={method === m.id}
                      className={cx(
                        'flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors duration-150 cursor-pointer',
                        method === m.id ? 'border-blue bg-blue-light text-blue' : 'border-line bg-white text-muted hover:border-line-strong',
                      )}
                    >
                      {m.id === 'card' && <CreditCard className="h-4 w-4" />}
                      {m.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={pay} className="mt-6 space-y-4">
                  {method === 'card' ? (
                    <>
                      <Field label="Card number" id="co-card">
                        <Input id="co-card" required inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" maxLength={19} />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Expiry" id="co-exp">
                          <Input id="co-exp" required autoComplete="cc-exp" placeholder="MM / YY" maxLength={7} />
                        </Field>
                        <Field label="CVC" id="co-cvc">
                          <Input id="co-cvc" required inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} />
                        </Field>
                      </div>
                    </>
                  ) : (
                    <p className="rounded-lg border border-line bg-surface p-4 text-sm text-muted">
                      You will confirm the payment on your device after pressing Pay.
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" size="lg" onClick={() => setStep('details')}>
                      Back
                    </Button>
                    <Button type="submit" size="lg" loading={processing} className="flex-1">
                      Pay {money(total)}
                    </Button>
                  </div>

                  <p className="flex items-center justify-center gap-2 text-xs text-muted">
                    <Shield className="h-4 w-4 text-success" />
                    Encrypted checkout · Official primary seller
                  </p>
                </form>
              </>
            )}

            {step === 'confirmed' && (
              <>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-success-light text-success">
                  <Check className="h-6 w-6" />
                </div>
                <h2 id="checkout-title" className="t-h2 mt-4 text-ink">
                  Booking confirmed
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Your e-ticket has been sent to <span className="font-medium text-ink">{email}</span>. Show the QR code at
                  the door.
                </p>

                <div className="mt-6 rounded-lg border border-line bg-surface p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="t-label text-blue">E-ticket</span>
                      <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-ink">{event.title}</h3>
                      <p className="mt-1 text-xs text-muted">
                        {fmtDate(event.start)} · {fmtTime(event.start)}
                      </p>
                      <p className="text-xs text-muted">{[event.venue, event.metro].filter(Boolean).join(', ')}</p>
                    </div>
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-line bg-white text-ink">
                      <QrCode className="h-10 w-10" />
                    </div>
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
                      <span className="text-muted">Paid</span>
                      <p className="font-semibold text-ink">{money(total)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button size="md" className="flex-1" onClick={() => window.print()}>
                    Print ticket
                  </Button>
                  <Button variant="outline" size="md" onClick={close} className="flex-1">
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
