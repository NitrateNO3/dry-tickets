import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { EventItem, Tier } from '../data/events'
import { fmtDate, fmtTime, money } from '../lib/format'
import { Button } from './Primitives'
import { Check, Close, CreditCard, Pin, QrCode, Shield, Ticket } from './Icons'

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
  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'google'>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [orderId, setOrderId] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !phone) return
    setStep('payment')
  }

  const handleProcessOrder = (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setTimeout(() => {
      const randomNum = Math.floor(10000 + Math.random() * 90000)
      setOrderId(`DT-2026-${randomNum}`)
      setProcessing(false)
      setStep('confirmed')
    }, 1000)
  }

  const handleClose = () => {
    setStep('details')
    setName('')
    setEmail('')
    setPhone('')
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
                <form onSubmit={handleNextToPayment} className="mt-6 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                      Your Details
                    </h4>
                    <p className="text-[11px] text-muted">
                      Tickets will be emailed and SMS-delivered directly to these details.
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

                  <Button type="submit" size="lg" variant="primary" className="w-full mt-3 font-bold">
                    Continue to Payment — {money(total)} AUD
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Payment Selection */}
            {step === 'payment' && (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="text-xs font-bold text-blue hover:underline cursor-pointer"
                    >
                      ← Back
                    </button>
                    <span className="text-muted">|</span>
                    <h3 className="text-lg font-extrabold text-cream">Payment</h3>
                  </div>
                  <span className="text-base font-black text-cream">{money(total)} AUD</span>
                </div>

                {/* Payment Methods */}
                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'card', label: 'Credit Card', icon: CreditCard },
                    { id: 'apple', label: 'Apple Pay', icon: Shield },
                    { id: 'google', label: 'Google Pay', icon: Shield },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as typeof paymentMethod)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-blue-light border-blue text-blue font-bold shadow-xs'
                          : 'bg-white border-line text-muted hover:text-cream hover:bg-surface-2'
                      }`}
                    >
                      <m.icon className="h-5 w-5 mb-1" />
                      <span className="text-xs">{m.label}</span>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleProcessOrder} className="mt-6 space-y-4">
                  {paymentMethod === 'card' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-cream mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4532 •••• •••• 8921"
                          maxLength={19}
                          className="h-11 w-full rounded-xl bg-white px-4 text-sm text-cream placeholder:text-muted border border-[#D0D5DD] focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-light"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-cream mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM / YY"
                            maxLength={5}
                            className="h-11 w-full rounded-xl bg-white px-4 text-sm text-cream placeholder:text-muted border border-[#D0D5DD] focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-light"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-cream mb-1">
                            CVV / CVC
                          </label>
                          <input
                            type="text"
                            required
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="123"
                            maxLength={4}
                            className="h-11 w-full rounded-xl bg-white px-4 text-sm text-cream placeholder:text-muted border border-[#D0D5DD] focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-light"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl bg-surface-2 p-6 text-center border border-line space-y-1.5">
                      <p className="text-sm font-bold text-cream">
                        Pay with {paymentMethod === 'apple' ? 'Apple Pay' : 'Google Pay'}
                      </p>
                      <p className="text-xs text-muted">
                        Confirm purchase using your device biometrics.
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      variant="primary"
                      disabled={processing}
                      className="w-full font-bold shadow-xs"
                    >
                      {processing ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Processing Payment…
                        </span>
                      ) : (
                        `Confirm & Pay ${money(total)} AUD`
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    <span>256-bit encrypted checkout · Official Australian Seller</span>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Booking Confirmed */}
            {step === 'confirmed' && (
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Check className="h-7 w-7" />
                </div>

                <h3 className="mt-4 text-2xl font-black text-cream">Booking Confirmed!</h3>
                <p className="mt-1 text-sm text-muted">
                  Your ticket has been successfully booked and sent to <span className="font-bold text-cream">{email}</span>.
                </p>

                {/* Clean E-Ticket Card */}
                <div className="mt-6 rounded-2xl bg-surface-2 p-5 border border-line text-left relative overflow-hidden border-t-4 border-t-blue shadow-xs">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue">
                        Official E-Ticket
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
                      <span className="text-muted">Total Paid:</span>
                      <p className="font-black text-cream">{money(total)} AUD</p>
                    </div>
                  </div>

                  {/* Barcode & QR Code simulation */}
                  <div className="mt-5 rounded-xl bg-white p-3 border border-line flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="h-9 w-40 flex items-center justify-between opacity-90">
                        {Array.from({ length: 32 }).map((_, i) => (
                          <span
                            key={i}
                            className={`h-full bg-gray-900 ${
                              i % 3 === 0 ? 'w-1' : i % 2 === 0 ? 'w-0.5' : 'w-1.5'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="font-mono text-[9px] text-muted tracking-widest text-center">
                        *{orderId.replace('-', '')}*
                      </p>
                    </div>
                    <div className="grid h-12 w-12 place-items-center rounded-lg bg-surface-2 text-cream border border-line shrink-0">
                      <QrCode className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button
                    size="md"
                    variant="primary"
                    className="flex-1 font-bold"
                    onClick={() => {
                      window.print()
                    }}
                  >
                    Print / Download Ticket
                  </Button>
                  <Button variant="outline" size="md" onClick={handleClose} className="flex-1 font-bold">
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
