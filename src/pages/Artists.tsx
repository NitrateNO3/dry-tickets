import { Link } from 'react-router-dom'
import { allArtists, liveEvents } from '../data/events'
import { fmtDateShort } from '../lib/format'
import { Eyebrow, Reveal } from '../components/Primitives'
import { Arrow } from '../components/Icons'

const alumni = [
  'Arijit Singh', 'Sonu Nigam', 'A R Rahman', 'Kapil Sharma', 'Gurdas Maan',
  'Sunidhi Chauhan', 'Karan Aujla', 'AP Dhillon', 'Atif Aslam', 'Udit Narayan',
  'Salim–Sulaiman', 'Rahat Fateh Ali Khan', 'Ilaiyaraaja', 'Kanika Kapoor',
  'Usha Uthup', 'Garry Sandhu', 'Tarsem Jassar', 'Sunil Grover', 'Salman Khan',
  'Bombay Vikings', 'Yuvan Shankar Raja', 'Arjan Dhillon', 'Nisha Bano', 'Jassi Khan',
]

export default function Artists() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-36 sm:px-8 lg:pt-44">
      <div className="mb-16 max-w-3xl">
        <Eyebrow className="mb-5">The roster</Eyebrow>
        <h1 className="text-[clamp(2.6rem,6vw,4.6rem)] font-extrabold">
          Six hundred artists.{' '}
          <em className="font-serif italic font-normal text-gradient">One stage door.</em>
        </h1>
        <p className="mt-6 text-[16px] leading-relaxed text-muted">
          From playback legends to the Punjabi acts filling arenas right now — these are the artists
          currently on tour with us across Australia and New Zealand.
        </p>
      </div>

      {/* On tour now */}
      <h2 className="mb-6 text-[13px] font-bold uppercase tracking-[0.22em] text-saffron">
        On tour now
      </h2>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {allArtists.map((a, i) => {
          const dates = liveEvents.filter((e) => e.artists.some((x) => x.name === a.name))
          return (
            <Reveal key={a.name} delay={0.04 * (i % 4)}>
              <Link
                to={`/events?q=${encodeURIComponent(a.name)}`}
                className="group block overflow-hidden rounded-2xl bg-surface hairline transition-colors hover:bg-surface-2"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={a.image}
                    alt={a.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-bold text-cream transition-colors group-hover:text-saffron">
                      {a.name}
                    </h3>
                    <p className="mt-0.5 truncate text-[12px] text-muted">
                      {dates.length > 0
                        ? `${dates.length} ${dates.length === 1 ? 'date' : 'dates'} · next ${fmtDateShort(dates[0].start)}`
                        : 'Dates to be announced'}
                    </p>
                  </div>
                  <Arrow className="h-4 w-4 shrink-0 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-saffron" />
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>

      {/* Alumni */}
      <h2 className="mb-6 mt-24 text-[13px] font-bold uppercase tracking-[0.22em] text-saffron">
        Previously on a Dry Tickets stage
      </h2>
      <div className="flex flex-wrap gap-2.5">
        {alumni.map((n) => (
          <span
            key={n}
            className="rounded-full bg-surface px-4 py-2.5 text-[14px] font-semibold text-muted hairline transition-colors hover:text-cream"
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  )
}
