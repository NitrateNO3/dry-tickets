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
        <Eyebrow className="mb-4">The roster</Eyebrow>
        <h1 className="text-[clamp(2.4rem,5.5vw,4.2rem)] font-extrabold text-cream tracking-tight">
          Six hundred artists.{' '}
          <span className="text-blue">One stage door.</span>
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-muted">
          From playback legends to the acts filling arenas right now — these are the artists
          currently on tour with us across Australia and New Zealand.
        </p>
      </div>

      {/* On tour now */}
      <h2 className="mb-6 text-xs font-bold uppercase tracking-wider text-blue">
        On tour now
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {allArtists.map((a, i) => {
          const dates = liveEvents.filter((e) => e.artists.some((x) => x.name === a.name))
          return (
            <Reveal key={a.name} delay={0.04 * (i % 4)}>
              <Link
                to={`/events?q=${encodeURIComponent(a.name)}`}
                className="group block overflow-hidden rounded-2xl bg-white border border-line shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
                  <img
                    src={a.image}
                    alt={a.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-bold text-cream transition-colors group-hover:text-blue">
                      {a.name}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {dates.length > 0
                        ? `${dates.length} ${dates.length === 1 ? 'date' : 'dates'} · next ${fmtDateShort(dates[0].start)}`
                        : 'Dates to be announced'}
                    </p>
                  </div>
                  <Arrow className="h-4 w-4 shrink-0 text-muted transition-all group-hover:translate-x-0.5 group-hover:text-blue" />
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>

      {/* Alumni */}
      <h2 className="mb-6 mt-20 text-xs font-bold uppercase tracking-wider text-blue">
        Previously on a Dry Tickets stage
      </h2>
      <div className="flex flex-wrap gap-2.5 pb-20">
        {alumni.map((n) => (
          <span
            key={n}
            className="rounded-full bg-surface-2 px-4 py-2 text-xs font-semibold text-muted border border-line transition-colors hover:text-cream hover:border-gray-300"
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  )
}
