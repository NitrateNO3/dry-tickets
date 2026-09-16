import { events } from '../data/events'
import { Button, Meta, Reveal, SectionHead } from '../components/Primitives'
import { Arrow, Insta, Phone } from '../components/Icons'

const timeline = [
  { year: '2013', title: 'The box office opens', body: 'A single Punjabi show in Western Sydney, sold entirely by hand.' },
  { year: '2016', title: 'Arena tours', body: "Salman Khan's Da-Bang The Tour, Sonu Nigam and Arijit Singh sell through the platform." },
  { year: '2019', title: 'Full-service production', body: 'Scanning, printing, seat maps and design brought in-house for organisers.' },
  { year: '2026', title: '800 events', body: '600 artists and 320 venues across Australia and New Zealand.' },
]

const faqs = [
  {
    q: 'How do I receive my tickets?',
    a: 'Your e-ticket is emailed as soon as payment clears. Show the code on your phone at the door — no printing needed. If you want a printed ticket, contact us and we will arrange one.',
  },
  {
    q: 'Can I get a refund or exchange?',
    a: 'Tickets are generally non-refundable unless the event is cancelled or rescheduled, in which case we contact every ticket holder with their options. Name changes and seat exchanges can usually be arranged up to 48 hours before the show.',
  },
  {
    q: 'Why is there a booking fee?',
    a: 'It covers payment processing, ticket issuing, door scanning staff and customer support. The fee is shown at checkout before you pay.',
  },
  {
    q: 'I am an organiser. How do I list an event?',
    a: 'Send an enquiry from the Sell tickets page or call 0452 337 387. There is no setup fee, and most event pages are live within 48 hours.',
  },
  {
    q: 'Are these tickets official?',
    a: 'Yes. Dry Tickets is a primary seller — every ticket is issued by us on behalf of the event organiser. We do not resell tickets, so you never pay above face value plus the stated booking fee.',
  },
]

const details = [
  { label: 'Office', value: 'Blacktown, NSW 2148' },
  { label: 'Support hours', value: 'Mon–Fri, 9:00am – 5:30pm AEST' },
  { label: 'ABN', value: '15 162 645 856' },
  { label: 'Company', value: 'Dryfa Group Pty Ltd' },
]

export default function About() {
  return (
    <div className="wrap page-top">
      <Meta
        title="About"
        description="Dry Tickets has sold tickets for live events in Australia and New Zealand since 2013. FAQs, contact details and company information."
      />

      <div className="max-w-3xl">
        <span className="t-label text-blue">About</span>
        <h1 className="t-h1 mt-3 text-ink">The box office behind live events in Australia since 2013</h1>
        <p className="t-lede mt-4">
          Dry Tickets sells tickets on behalf of promoters across Australia and New Zealand — from playback singers and
          Punjabi headliners to qawwali nights and stand-up tours. We handle the ticketing so organisers can run the show.
        </p>
      </div>

      <div className="no-scrollbar edge-fade mt-12 flex gap-4 overflow-hidden" aria-hidden>
        {events.slice(0, 12).map((e) => (
          <img
            key={e.slug}
            src={e.image}
            alt=""
            loading="lazy"
            className="aspect-[460/651] w-32 shrink-0 rounded-lg border border-line object-cover sm:w-40"
          />
        ))}
      </div>

      <section className="section">
        <Reveal>
          <SectionHead eyebrow="Our story" title="Thirteen years of ticketing" />
          <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {timeline.map((t) => (
              <li key={t.year} className="card p-6">
                <span className="t-h2 text-blue">{t.year}</span>
                <h3 className="mt-4 text-base font-semibold text-ink">{t.title}</h3>
                <p className="mt-2 text-sm text-muted">{t.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="section">
        <Reveal>
          <SectionHead eyebrow="FAQ" title="Common questions" />
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            {faqs.map((f) => (
              <details key={f.q} className="card group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-blue transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="contact" className="section scroll-mt-16">
        <Reveal>
          <div className="card grid grid-cols-1 gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="t-label text-blue">Contact</span>
              <h2 className="t-h2 mt-3 text-ink">Fastest reply: message us on Instagram</h2>
              <p className="mt-4 max-w-md text-muted">
                Messages sent during business hours are usually answered within the hour. Phone works too.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="https://instagram.com/drytickets" size="lg">
                  <Insta className="h-5 w-5" />
                  @drytickets
                </Button>
                <Button href="tel:0452337387" variant="outline" size="lg">
                  <Phone className="h-4 w-4" />
                  0452 337 387
                </Button>
              </div>
            </div>

            <div>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {details.map((c) => (
                  <div key={c.label} className="rounded-lg border border-line bg-surface p-4">
                    <dt className="t-label text-faint">{c.label}</dt>
                    <dd className="mt-2 text-sm font-semibold text-ink">{c.value}</dd>
                  </div>
                ))}
              </dl>
              <Button to="/sell" variant="ghost" className="mt-4">
                Organiser enquiries
                <Arrow className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
