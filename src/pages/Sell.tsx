import { useState } from 'react'
import { Button, Field, Input, Meta, Reveal, SectionHead, Textarea } from '../components/Primitives'
import { Arrow, Bolt, Check, Phone, Pin, Shield, Ticket } from '../components/Icons'

const services = [
  {
    Icon: Ticket,
    title: 'Online and counter sales',
    body: 'Your own event page for online sales, plus over-the-counter and agent sales for buyers who pay in cash.',
  },
  {
    Icon: Pin,
    title: 'Seating maps',
    body: 'Reserved seats, allocated tables and general admission zones, mapped to your venue and priced by tier.',
  },
  {
    Icon: Bolt,
    title: 'Scanning and printing',
    body: 'Printed or e-tickets, scanners on the door and live entry counts through the night.',
  },
  {
    Icon: Shield,
    title: 'Promotion',
    body: 'Paid social on Facebook and Instagram and email campaigns to our registered ticket buyers.',
  },
]

const steps = [
  { n: '1', title: 'Tell us about the show', body: 'Artist, venue, date and capacity. A short call is usually enough.' },
  { n: '2', title: 'We build the event page', body: 'Poster, seat map, ticket tiers and payments, ready for your sign-off.' },
  { n: '3', title: 'Tickets go on sale', body: 'Campaigns go out to our audience while you focus on production.' },
  { n: '4', title: 'Doors, scanning, settlement', body: 'Scanners on the night, live reporting, and funds settled after the event.' },
]

const stats = [
  { value: '800+', label: 'Events ticketed' },
  { value: '350+', label: 'Organisers' },
  { value: '320+', label: 'Venues' },
  { value: '2013', label: 'Founded' },
]

export default function Sell() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  return (
    <div className="wrap page-top">
      <Meta
        title="Sell tickets"
        description="Ticketing, seating maps, door scanning and promotion for event organisers in Australia and New Zealand. Send an enquiry or call 0452 337 387."
      />

      <div className="max-w-3xl">
        <span className="t-label text-blue">For organisers</span>
        <h1 className="t-h1 mt-3 text-ink">Ticketing, seating and door scanning for your event</h1>
        <p className="t-lede mt-4 max-w-xl">
          Dry Tickets has run box offices for promoters in Australia since 2013 — sales, seat maps, scanning, printing
          and promotion, handled by one team.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="#enquire" size="lg">
            Send an enquiry
            <Arrow className="h-4 w-4" />
          </Button>
          <Button href="tel:0452337387" variant="outline" size="lg">
            <Phone className="h-4 w-4" />
            0452 337 387
          </Button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-surface p-6">
            <p className="t-h2 text-ink">{s.value}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="section">
        <Reveal>
          <SectionHead eyebrow="What we handle" title="The whole box office, not just checkout" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {services.map((s) => (
              <div key={s.title} className="card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-light text-blue">
                  <s.Icon className="h-5 w-5" />
                </span>
                <h3 className="t-h3 mt-4 text-ink">{s.title}</h3>
                <p className="mt-2 text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section">
        <Reveal>
          <SectionHead eyebrow="How it works" title="From first call to doors open" />
          <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n} className="card p-6">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue text-sm font-semibold text-white">{s.n}</span>
                <h3 className="mt-4 text-base font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section id="enquire" className="section scroll-mt-16">
        <div className="card grid grid-cols-1 overflow-hidden lg:grid-cols-2">
          <div className="border-b border-line p-8 sm:p-12 lg:border-b-0 lg:border-r">
            <span className="t-label text-blue">Enquire</span>
            <h2 className="t-h2 mt-3 text-ink">Tell us about your event</h2>
            <p className="mt-4 text-muted">
              We reply within one business day with pricing, timelines and a sales plan for your show.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'No setup fee — we earn on tickets sold',
                'Event page live within 48 hours',
                'Account manager on the night',
                'Settlement within 5 business days',
              ].map((p) => (
                <li key={p} className="flex items-start gap-3 text-ink">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-light text-success">
                    <Check className="h-3 w-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-line pt-6">
              <p className="t-label text-faint">Or call us</p>
              <a href="tel:0452337387" className="mt-3 inline-flex items-center gap-2 text-lg font-semibold text-ink hover:text-blue">
                <Phone className="h-5 w-5 text-blue" />
                0452 337 387
              </a>
              <p className="mt-1 text-sm text-muted">Blacktown, NSW · Mon–Fri 9:00am – 5:30pm AEST</p>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            {status === 'sent' ? (
              <div className="flex h-full min-h-96 flex-col items-center justify-center text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-success-light text-success">
                  <Check className="h-6 w-6" />
                </span>
                <h3 className="t-h3 mt-4 text-ink">Enquiry received</h3>
                <p className="mt-2 max-w-sm text-muted">
                  We'll reply within one business day. For anything urgent, call 0452 337 387.
                </p>
                <Button variant="outline" onClick={() => setStatus('idle')} className="mt-8">
                  Send another enquiry
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setStatus('sending')
                  // ponytail: mocked — post to the enquiry endpoint.
                  setTimeout(() => setStatus('sent'), 800)
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Your name" id="name">
                    <Input id="name" name="name" required autoComplete="name" />
                  </Field>
                  <Field label="Email" id="email">
                    <Input id="email" name="email" type="email" required autoComplete="email" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Phone" id="phone">
                    <Input id="phone" name="phone" type="tel" autoComplete="tel" />
                  </Field>
                  <Field label="Event or artist" id="event">
                    <Input id="event" name="event" required />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="City" id="city">
                    <Input id="city" name="city" />
                  </Field>
                  <Field label="Expected capacity" id="capacity">
                    <Input id="capacity" name="capacity" inputMode="numeric" />
                  </Field>
                </div>
                <Field label="Anything else" id="message" hint="Venue, proposed dates, ticket tiers.">
                  <Textarea id="message" name="message" rows={4} />
                </Field>
                <Button type="submit" size="lg" loading={status === 'sending'} className="w-full">
                  Send enquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
