import { Link } from 'react-router-dom'
import { useEvents } from '../lib/events'
import { fmtDateShort } from '../lib/format'
import { plural } from '../lib/copy'
import { Img, Meta, Reveal, SectionHead, SkeletonCard } from '../components/Primitives'
import { Arrow } from '../components/Icons'

const alumni = [
  'Arijit Singh', 'Sonu Nigam', 'A R Rahman', 'Kapil Sharma', 'Gurdas Maan',
  'Sunidhi Chauhan', 'Karan Aujla', 'AP Dhillon', 'Atif Aslam', 'Udit Narayan',
  'Salim–Sulaiman', 'Rahat Fateh Ali Khan', 'Ilaiyaraaja', 'Kanika Kapoor',
  'Usha Uthup', 'Garry Sandhu', 'Tarsem Jassar', 'Sunil Grover', 'Salman Khan',
  'Bombay Vikings', 'Yuvan Shankar Raja', 'Arjan Dhillon', 'Nisha Bano', 'Jassi Khan',
]

export default function Artists() {
  const { artists, live, loading } = useEvents()
  return (
    <div className="wrap page-top">
      <Meta
        title="Artists"
        description={`${artists.length} artists touring Australia and New Zealand with tickets on Dry Tickets, and the names who have played our stages before.`}
      />

      <div className="max-w-3xl">
        <span className="t-label text-blue">Artists</span>
        <h1 className="t-h1 mt-3 text-ink">Who's touring with us</h1>
        <p className="t-lede mt-4">
          Artists with dates on sale across Australia and New Zealand. Select an artist to see every show.
        </p>
      </div>

      <section className="section">
        <Reveal>
          <SectionHead title="On tour now" />
          <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            {artists.map((a) => {
              const dates = live.filter((e) => e.artists.some((x) => x.name === a.name))
              return (
                <Link key={a.name} to={`/events?q=${encodeURIComponent(a.name)}`} className="card card-hover group block overflow-hidden">
                  <Img src={a.image!} alt={a.name} loading="lazy" className="aspect-[4/5] bg-surface" />
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-ink transition-colors group-hover:text-blue">{a.name}</h3>
                      <p className="truncate text-sm text-muted">
                        {dates.length > 0
                          ? `${dates.length} ${plural(dates.length, 'date')} · next ${fmtDateShort(dates[0].start)}`
                          : 'Dates to be announced'}
                      </p>
                    </div>
                    <Arrow className="h-4 w-4 shrink-0 text-faint transition-colors group-hover:text-blue" />
                  </div>
                </Link>
              )
            })}
          </div>
        </Reveal>
      </section>

      <section className="section">
        <Reveal>
          <SectionHead title="Previously on our stages" />
          <ul className="flex flex-wrap gap-2">
            {alumni.map((n) => (
              <li key={n} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted">
                {n}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </div>
  )
}
