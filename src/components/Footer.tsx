import { Link } from 'react-router-dom'
import { Logo } from './Nav'
import { Insta, Phone } from './Icons'

const links = [
  { to: '/events', label: 'Events' },
  { to: '/artists', label: 'Artists' },
  { to: '/venues', label: 'Venues' },
  { to: '/sell', label: 'Sell tickets' },
  { to: '/about', label: 'About' },
  { to: '/about#contact', label: 'Contact' },
]

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="wrap py-12">
        <div className="flex flex-col gap-8 border-b border-line pb-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm text-muted">
              Primary ticketing for live events across Australia and New Zealand since 2013. Tickets are issued by
              us on behalf of the organiser — face value plus the booking fee shown at checkout.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="font-medium text-muted transition-colors hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Dryfa Group Pty Ltd · ABN 15 162 645 856 · Prices in AUD</p>
          <div className="flex items-center gap-6">
            <a href="tel:0452337387" className="inline-flex items-center gap-2 font-medium transition-colors hover:text-ink">
              <Phone className="h-4 w-4" />
              0452 337 387
            </a>
            <a
              href="https://instagram.com/drytickets"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-medium transition-colors hover:text-ink"
            >
              <Insta className="h-4 w-4" />
              @drytickets
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
