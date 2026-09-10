import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cx } from '../lib/format'
import { Button } from './Primitives'
import { Close, Menu, Search, Ticket } from './Icons'

const links = [
  { to: '/events', label: 'Now on sale' },
  { to: '/events?filter=presale', label: 'Presale' },
  { to: '/artists', label: 'Artists' },
  { to: '/sell', label: 'Sell tickets' },
  { to: '/about', label: 'About' },
]

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Dry Tickets home">
      <span className="relative grid h-9 w-9 place-items-center rounded-[11px] accent-bg text-ink transition-transform duration-300 group-hover:rotate-[-8deg]">
        <Ticket className="h-[18px] w-[18px]" />
      </span>
      {!compact && (
        <span className="text-[17px] font-extrabold tracking-[-0.04em] text-cream">
          Dry<span className="text-gradient">Tickets</span>
        </span>
      )}
    </Link>
  )
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(q.trim() ? `/events?q=${encodeURIComponent(q.trim())}` : '/events')
    setQ('')
  }

  return (
    <>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'glass border-b border-line py-2.5' : 'py-4',
        )}
      >
        <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-5 sm:px-8">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cx(
                    'relative rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition-colors duration-200',
                    isActive && l.to !== '/events?filter=presale'
                      ? 'text-cream'
                      : 'text-muted hover:text-cream',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <form onSubmit={submit} className="hidden md:block">
              <div className="group relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint transition-colors group-focus-within:text-saffron" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search artists, cities…"
                  aria-label="Search events"
                  className="h-10 w-52 rounded-full bg-surface/80 pl-10 pr-4 text-[13px] text-cream placeholder:text-faint hairline transition-all duration-300 focus:w-64 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-saffron/50 xl:w-60 xl:focus:w-72"
                />
              </div>
            </form>

            <Button to="/sell" size="sm" className="hidden sm:inline-flex">
              List your event
            </Button>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center rounded-full hairline text-cream transition-colors hover:bg-surface lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-ink lg:hidden"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full hairline text-cream"
              >
                <Close className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col px-5 pt-6">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i + 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={l.to}
                    className="block border-b border-line py-5 text-[28px] font-extrabold tracking-[-0.04em] text-cream"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="px-5 pt-8">
              <Button to="/sell" size="lg" className="w-full">
                List your event
              </Button>
              <a
                href="tel:0452337387"
                className="mt-4 block text-center text-[13px] font-semibold text-muted"
              >
                Talk to us — 0452 337 387
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
