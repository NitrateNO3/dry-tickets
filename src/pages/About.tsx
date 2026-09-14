import { events } from '../data/events'
import { Button, Eyebrow, Reveal, SectionHead } from '../components/Primitives'
import { Arrow, Facebook, Insta, Phone, YouTube } from '../components/Icons'

const timeline = [
  { year: '2013', title: 'Dryfa Group opens the box office', body: 'A single Punjabi show in Western Sydney, sold entirely by hand.' },
  { year: '2016', title: 'Arena-scale tours', body: 'Salman Khan\'s Da-Bang The Tour, Sonu Nigam and Arijit Singh come through the platform.' },
  { year: '2019', title: 'Full-service production', body: 'Scanning, printing, seat maps and design brought in-house for organisers.' },
  { year: '2026', title: '800 events on', body: 'Six hundred artists, 320 venues and 200,000 registered ticket holders across AU & NZ.' },
]

const faqs = [
  {
    q: 'How do I receive my tickets?',
    a: 'Your e-ticket is emailed the moment payment clears. Show the barcode on your phone at the door — there is no need to print anything. If you would rather have a physical ticket, contact us and we will arrange thermal printing.',
  },
  {
    q: 'Can I get a refund or exchange?',
    a: 'Tickets are generally non-refundable unless the event is cancelled or rescheduled, in which case we contact every ticket holder directly with your options. Name changes and seat exchanges can usually be arranged up to 48 hours before the show.',
  },
  {
    q: 'Why is there a booking fee?',
    a: 'The booking fee covers payment processing, barcode issuing, on-the-night scanning staff and customer support. It is shown clearly at checkout before you pay — never added as a surprise.',
  },
  {
    q: 'I am an organiser. How do I list an event?',
    a: 'Head to the Sell Tickets page and send us an enquiry, or call 0452 337 387. There is no setup fee — we earn on tickets sold, and most event pages are live within 48 hours.',
  },
  {
    q: 'Are these tickets official?',
    a: 'Yes. Dry Tickets is a primary seller — every ticket is issued by us on behalf of the event organiser. We are not a resale marketplace, so you never pay above face value plus the stated booking fee.',
  },
]

export default function About() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-36 sm:px-8 lg:pt-44">
      {/* Hero */}
      <div className="max-w-3xl">
        <Eyebrow className="mb-4">About us</Eyebrow>
        <h1 className="text-[clamp(2.4rem,5.5vw,4.2rem)] font-extrabold text-cream tracking-tight">
          For our customers to forget about work{' '}
          <span className="text-blue">and enjoy life.</span>
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-muted">
          That has been the point since 2013. Dry Tickets is the box office behind desi live
          entertainment in Australia and New Zealand — Bollywood playback legends, Punjabi headliners,
          qawwali nights, Garba floors and stand-up tours. We handle the ticket so you can enjoy
          the show.
        </p>
      </div>

      {/* Poster wall */}
      <div className="no-scrollbar edge-fade mt-14 flex gap-4 overflow-hidden">
        {events.slice(0, 12).map((e) => (
          <img
            key={e.slug}
            src={e.image}
            alt=""
            aria-hidden
            loading="lazy"
            className="aspect-[460/651] w-[128px] shrink-0 rounded-xl object-cover border border-line sm:w-[152px]"
          />
        ))}
      </div>

      {/* Timeline */}
      <section className="pt-28">
        <Reveal>
          <SectionHead eyebrow="Our story" title="Thirteen years of" accent="full rooms" />
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {timeline.map((t, i) => (
            <Reveal key={t.year} delay={0.05 * i}>
              <div className="h-full rounded-2xl bg-surface-2 p-6 border border-line">
                <span className="text-[2.2rem] font-black leading-none text-blue">
                  {t.year}
                </span>
                <h3 className="mt-4 text-base font-bold text-cream">{t.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{t.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="pt-32">
        <Reveal>
          <SectionHead eyebrow="Good to know" title="Questions," accent="answered" />
        </Reveal>
        <div className="grid gap-3 lg:grid-cols-2">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={0.05 * i}>
              <details className="group rounded-2xl bg-surface p-6 hairline transition-colors hover:bg-surface-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-bold text-cream marker:hidden">
                  {f.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-blue transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[14.5px] leading-relaxed text-muted">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="pt-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl bg-surface p-8 hairline sm:p-14 lg:p-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-blue/10 blur-[120px]"
            />
            <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <Eyebrow className="mb-5">Get in touch</Eyebrow>
                <h2 className="text-[clamp(2rem,4.2vw,3.2rem)] font-extrabold">
                  We answer fastest{' '}
                  <em className="font-serif italic font-normal text-gradient">on Instagram.</em>
                </h2>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
                  DM us and you'll usually hear back within the hour during business hours. Phone
                  and email work too — we're a small team and we read everything.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <Button href="https://instagram.com/drytickets" size="lg">
                    <Insta className="h-[18px] w-[18px]" />
                    @drytickets
                  </Button>
                  <Button href="tel:0452337387" variant="outline" size="lg">
                    <Phone className="h-4 w-4" />
                    0452 337 387
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Office', value: 'Blacktown, NSW 2148, Australia' },
                  { label: 'Support hours', value: 'Mon–Fri, 9:00am – 5:30pm AEST' },
                  { label: 'ABN', value: '15 162 645 856' },
                  { label: 'Trading as', value: 'Dryfa Group Pty Ltd' },
                ].map((c) => (
                  <div key={c.label} className="rounded-2xl bg-surface-2 p-6 border border-line">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                      {c.label}
                    </p>
                    <p className="mt-1.5 text-sm font-bold text-cream">{c.value}</p>
                  </div>
                ))}

                <div className="flex items-center gap-2.5 sm:col-span-2">
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
                      className="grid h-11 w-11 place-items-center rounded-full hairline text-muted transition-all hover:border-blue/40 hover:text-blue"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </a>
                  ))}
                  <Button to="/sell" variant="ghost" className="ml-auto">
                    Organiser enquiries
                    <Arrow className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
