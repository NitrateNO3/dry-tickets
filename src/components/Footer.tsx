import { Link } from 'react-router-dom'
import { Logo } from './Nav'
import { Button } from './Primitives'
import { Facebook, Insta, Phone, YouTube } from './Icons'

const columns = [
  {
    title: 'Buy tickets',
    links: [
      { label: 'Now on sale', to: '/events' },
      { label: 'Presale access', to: '/events?filter=presale' },
      { label: 'Browse artists', to: '/artists' },
      { label: 'Past events', to: '/events?filter=past' },
      { label: 'Promo & coupon codes', to: '/about' },
    ],
  },
  {
    title: 'Sell tickets',
    links: [
      { label: 'List your event', to: '/sell' },
      { label: 'Box office & scanning', to: '/sell' },
      { label: 'Marketing & design', to: '/sell' },
      { label: 'Organiser FAQs', to: '/about' },
      { label: 'Careers', to: '/about' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Contact', to: '/about' },
      { label: 'Privacy policy', to: '/about' },
      { label: 'Exchange & refunds', to: '/about' },
      { label: 'Terms & conditions', to: '/about' },
    ],
  },
]

const categories = [
  'Live music concerts',
  'Club nights',
  'Comedy',
  'Garba & Navratri',
  'Sufi & qawwali',
  'Conferences & workshops',
  'Travel & activities',
  'Charities & non-profits',
]

export function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-line bg-ink-2">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-saffron/10 blur-[110px]"
      />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* Newsletter */}
        <div className="grid gap-10 border-b border-line py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
          <div>
            <h3 className="text-[clamp(1.7rem,3vw,2.5rem)] font-extrabold">
              Be first through{' '}
              <em className="font-serif italic font-normal text-gradient">the door</em>
            </h3>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
              Presale codes, tour announcements and members-only discounts — sent before tickets hit
              general sale. No spam, unsubscribe anytime.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              aria-label="Email address"
              className="h-13 flex-1 rounded-full bg-surface px-6 text-sm text-cream placeholder:text-faint hairline focus:outline-none focus:ring-1 focus:ring-saffron/60"
            />
            <Button type="submit" size="lg">
              Get presale access
            </Button>
          </form>
        </div>

        {/* Link columns */}
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-muted">
              Australia and New Zealand's home for desi live entertainment since 2013. Over 800 shows,
              600 artists and 200,000 ticket holders.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              {[
                { Icon: Insta, href: 'https://instagram.com/drytickets', label: 'Instagram' },
                { Icon: Facebook, href: 'https://facebook.com/drytickets', label: 'Facebook' },
                { Icon: YouTube, href: 'https://youtube.com/@drytickets', label: 'YouTube' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full hairline text-muted transition-all duration-200 hover:border-saffron/40 hover:text-saffron"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>

            <a
              href="tel:0452337387"
              className="mt-6 inline-flex items-center gap-2.5 text-[13.5px] font-bold text-cream transition-colors hover:text-saffron"
            >
              <Phone className="h-4 w-4 text-saffron" />
              0452 337 387
            </a>
            <p className="mt-1.5 text-[12px] text-faint">Mon–Fri, 9:00am – 5:30pm AEST</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-faint">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-[13.5px] text-muted transition-colors duration-200 hover:text-cream"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 border-t border-line py-8">
          {categories.map((c) => (
            <Link
              key={c}
              to="/events"
              className="rounded-full bg-surface px-3.5 py-1.5 text-[12px] font-medium text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-cream"
            >
              {c}
            </Link>
          ))}
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-4 border-t border-line py-8 text-[12px] text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© 2013–2026 Dryfa Group Pty Ltd T/As Dry Tickets · ABN 15 162 645 856</p>
          <div className="flex items-center gap-3">
            <span>Secure payments</span>
            <div className="flex gap-1.5">
              {['VISA', 'MC', 'AMEX', 'DISC'].map((p) => (
                <span
                  key={p}
                  className="rounded bg-surface px-2 py-1 text-[9px] font-bold tracking-wider text-muted hairline"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
