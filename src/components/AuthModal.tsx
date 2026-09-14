import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './Primitives'
import { Check, Close, Phone, Shield, Ticket } from './Icons'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: Props) {
  const [tab, setTab] = useState<'lookup' | 'signin'>('lookup')
  const [contact, setContact] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contact.trim()) return
    setSubmitted(true)
  }

  const handleReset = () => {
    setSubmitted(false)
    setContact('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/80 backdrop-blur-md"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface p-7 hairline shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] z-10"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-cream transition-colors"
            >
              <Close className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue/15 text-blue-bright">
                <Ticket className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-cream">DryTickets Account</h3>
                <p className="text-[12.5px] text-muted">Australia's live event marketplace</p>
              </div>
            </div>

            {/* Tab switch */}
            <div className="mt-6 flex rounded-xl bg-ink p-1 hairline">
              <button
                type="button"
                onClick={() => {
                  setTab('lookup')
                  handleReset()
                }}
                className={`flex-1 py-2 text-[12.5px] font-bold rounded-lg transition-all ${
                  tab === 'lookup'
                    ? 'bg-surface-2 text-cream shadow-sm'
                    : 'text-muted hover:text-cream'
                }`}
              >
                Find My Tickets
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signin')
                  handleReset()
                }}
                className={`flex-1 py-2 text-[12.5px] font-bold rounded-lg transition-all ${
                  tab === 'signin'
                    ? 'bg-surface-2 text-cream shadow-sm'
                    : 'text-muted hover:text-cream'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Content */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-[0.14em] text-muted mb-2">
                    {tab === 'lookup' ? 'Email or Mobile Number' : 'Email Address'}
                  </label>
                  <input
                    type={tab === 'lookup' ? 'text' : 'email'}
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={
                      tab === 'lookup'
                        ? 'e.g. 0412 345 678 or name@email.com'
                        : 'your.name@email.com'
                    }
                    className="h-12 w-full rounded-2xl bg-ink px-4 text-[14px] text-cream placeholder:text-faint hairline focus:outline-none focus:ring-1 focus:ring-blue"
                  />
                  <p className="mt-2 text-[11.5px] text-faint">
                    {tab === 'lookup'
                      ? 'We will locate all tickets linked to your Australian mobile or email.'
                      : 'We will send a 6-digit one-time login code to your inbox.'}
                  </p>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  {tab === 'lookup' ? 'Search Tickets' : 'Send Login Code'}
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[11.5px] text-faint">
                  <Shield className="h-3.5 w-3.5 text-mint" />
                  <span>256-bit encrypted · Privacy protected</span>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 text-center space-y-4"
              >
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mint/15 text-mint">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-cream">
                  {tab === 'lookup' ? 'Ticket Search Sent!' : 'Login Code Sent!'}
                </h4>
                <p className="text-[13px] text-muted leading-relaxed">
                  {tab === 'lookup'
                    ? `We searched for bookings matching "${contact}". An SMS/email with your secure download links has been dispatched.`
                    : `A one-time verification link has been sent to "${contact}". Click it to access your account.`}
                </p>

                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
                    Try Another Contact
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Support footer */}
            <div className="mt-6 border-t border-line pt-4 text-center">
              <a
                href="tel:0452337387"
                className="inline-flex items-center gap-2 text-[12px] font-semibold text-muted hover:text-blue-bright transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-blue" />
                Need help? Call Sydney support: 0452 337 387
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
