import { useState } from 'react'
import { Button, Eyebrow, Reveal, SectionHead } from '../components/Primitives'
import { Arrow, Bolt, Check, Phone, Pin, Shield, Ticket } from '../components/Icons'

const services = [
  {
    Icon: Ticket,
    title: 'Online & offline ticketing',
    body: 'Sell Australia-wide from your own event page, plus over-the-counter and agent sales for the audience that still pays cash.',
  },
  {
    Icon: Pin,
    title: 'Seating & seat maps',
    body: 'Reserved seating, allocated tables and GA zones — mapped to your venue and priced by tier.',
  },
  {
    Icon: Bolt,
    title: 'Barcode scanning & printing',
    body: 'Thermal or standard ticket printing, scanners on the door and live entry counts through the night.',
  },
  {
    Icon: Shield,
    title: 'Marketing that fills rooms',
    body: 'Paid social across Facebook and Instagram to 200,000+ registered desi ticket buyers, plus EDM campaigns.',
  },
]

const steps = [
  { n: '01', title: 'Tell us about the show', body: 'Artist, venue, date, capacity. A quick call is usually enough.' },
  { n: '02', title: 'We build your event page', body: 'Poster design, seat map, ticket tiers and payment setup — live within 48 hours.' },
  { n: '03', title: 'We market and sell', body: 'Campaigns go out to our audience while you focus on production.' },
  { n: '04', title: 'Door, scan, settle', body: 'Scanners on the night, live reporting, funds settled after the event.' },
]

const stats = [
  { value: '800+', label: 'Events ticketed' },
  { value: '350+', label: 'Organisers served' },
  { value: '320+', label: 'Venues' },
  { value: '13 yrs', label: 'In market' },
]

export default function Sell() {
  const [sent, setSent] = useState(false)

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-ember/12 blur-[130px]"
      />

      <div className="relative mx-auto max-w-[1400px] px-5 pt-36 sm:px-8 lg:pt-44">
        {/* Hero */}
        <div className="max-w-3xl">
          <Eyebrow className="mb-5">For organisers & promoters</Eyebrow>
          <h1 className="text-[clamp(2.6rem,6.4vw,5rem)] font-extrabold">
            You bring the artist.{' '}
            <em className="font-serif italic font-normal text-gradient">We'll fill the room.</em>
          </h1>
          <p className="mt-7 max-w-xl text-[16.5px] leading-relaxed text-muted">
            Dry Tickets has been the box office behind desi live entertainment in Australia since
            2013 — ticketing, seat maps, scanning, printing, design and paid social under one roof.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="#enquire" size="lg">
              Get a quote
              <Arrow className="h-4 w-4" />
            </Button>
            <Button href="tel:0452337387" variant="outline" size="lg">
              <Phone className="h-4 w-4" />
              0452 337 387
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={0.06 * i}>
              <div className="rounded-2xl bg-surface p-7 hairline">
                <p className="text-[clamp(1.9rem,3.6vw,2.8rem)] font-extrabold tracking-[-0.04em] text-gradient">
                  {s.value}
                </p>
                <p className="mt-1.5 text-[13px] font-medium text-muted">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Services */}
        <section className="pt-32">
          <Reveal>
            <SectionHead
              eyebrow="What we handle"
              title="A full box office,"
              accent="not just a checkout"
            />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={0.06 * i}>
                <div className="h-full rounded-3xl bg-surface p-8 hairline transition-colors duration-300 hover:bg-surface-2">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-saffron/12 text-saffron">
                    <s.Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 text-[19px] font-bold text-cream">{s.title}</h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="pt-32">
          <Reveal>
            <SectionHead eyebrow="How it works" title="From idea to" accent="doors open" />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={0.07 * i}>
                <div className="relative h-full rounded-3xl bg-surface p-7 hairline">
                  <span className="font-serif text-[2.6rem] italic leading-none text-gradient">
                    {s.n}
                  </span>
                  <h3 className="mt-5 text-[16.5px] font-bold text-cream">{s.title}</h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Enquiry form */}
        <section id="enquire" className="scroll-mt-28 pt-32">
          <div className="overflow-hidden rounded-4xl bg-surface hairline">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative border-b border-line p-8 sm:p-12 lg:border-b-0 lg:border-r">
                <Eyebrow className="mb-5">Let's talk</Eyebrow>
                <h2 className="text-[clamp(1.8rem,3.6vw,2.8rem)] font-extrabold">
                  Tell us about your event
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">
                  We'll come back within one business day with pricing, timelines and a plan for
                  getting your show in front of the right audience.
                </p>

                <ul className="mt-9 space-y-3.5">
                  {[
                    'No setup fee — we earn on tickets sold',
                    'Event page live within 48 hours',
                    'Dedicated account manager on the night',
                    'Settlement within 5 business days',
                  ].map((p) => (
                    <li key={p} className="flex items-start gap-3 text-[14.5px] text-cream/85">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint/15 text-mint">
                        <Check className="h-3 w-3" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>

                <div className="mt-10 border-t border-line pt-7">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-faint">
                    Or reach us directly
                  </p>
                  <a
                    href="tel:0452337387"
                    className="mt-3 inline-flex items-center gap-2.5 text-[17px] font-bold text-cream transition-colors hover:text-saffron"
                  >
                    <Phone className="h-4 w-4 text-saffron" />
                    0452 337 387
                  </a>
                  <p className="mt-1.5 text-[12.5px] text-faint">
                    Blacktown, NSW · Mon–Fri 9:00am – 5:30pm AEST
                  </p>
                </div>
              </div>

              <div className="p-8 sm:p-12">
                {sent ? (
                  <div className="flex h-full min-h-[380px] flex-col items-center justify-center text-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-mint/15 text-mint">
                      <Check className="h-7 w-7" />
                    </span>
                    <h3 className="mt-6 text-2xl font-extrabold text-cream">Enquiry received</h3>
                    <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-muted">
                      Thanks — we'll be in touch within one business day. For anything urgent, call
                      0452 337 387.
                    </p>
                    <Button variant="outline" onClick={() => setSent(false)} className="mt-8">
                      Send another
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      setSent(true)
                    }}
                    className="space-y-5"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Your name" name="name" placeholder="Ravi Sharma" required />
                      <Field
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Phone" name="phone" type="tel" placeholder="04XX XXX XXX" />
                      <Field label="Event name" name="event" placeholder="Artist / show title" required />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="City" name="city" placeholder="Sydney" />
                      <Field label="Expected capacity" name="capacity" placeholder="1,200" />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-faint"
                      >
                        Tell us more
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        placeholder="Venue, proposed dates, ticket tiers, anything else we should know…"
                        className="w-full resize-none rounded-2xl bg-ink px-5 py-4 text-[14px] text-cream placeholder:text-faint hairline focus:outline-none focus:ring-1 focus:ring-saffron/60"
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      Send enquiry
                      <Arrow className="h-4 w-4" />
                    </Button>
                    <p className="text-center text-[12px] text-faint">
                      We reply within one business day.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-faint"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-12 w-full rounded-full bg-ink px-5 text-[14px] text-cream placeholder:text-faint hairline focus:outline-none focus:ring-1 focus:ring-saffron/60"
      />
    </div>
  )
}
