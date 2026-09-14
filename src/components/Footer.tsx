import { Link } from 'react-router-dom'
import { Logo } from './Nav'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface-2 text-cream">
      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 pb-10 border-b border-line">
          {/* Brand Info */}
          <div className="max-w-md">
            <Logo />
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Australia's trusted marketplace to discover and book concerts, festivals, comedy, theatre, sports and cultural events with verified e-tickets.
            </p>
          </div>

          {/* Core Navigation Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-muted">
            <Link to="/events" className="hover:text-blue transition-colors">
              Explore Events
            </Link>
            <Link to="/sell" className="hover:text-blue transition-colors">
              Sell Tickets
            </Link>
            <Link to="/about" className="hover:text-blue transition-colors">
              About
            </Link>
            <Link to="/about" className="hover:text-blue transition-colors">
              Contact
            </Link>
            <Link to="/about" className="hover:text-blue transition-colors">
              Terms
            </Link>
            <Link to="/about" className="hover:text-blue transition-colors">
              Privacy
            </Link>
          </nav>
        </div>

        {/* Bottom Details & Compliance */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted">
          <p>© {new Date().getFullYear()} DryTickets Australia. All rights reserved. ABN 15 162 645 856.</p>

          <div className="flex items-center gap-6">
            <a href="tel:0452337387" className="hover:text-blue transition-colors">
              Sydney Support: 0452 337 387
            </a>
            <span>All ticket prices in Australian Dollars (AUD)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
