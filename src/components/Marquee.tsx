import { allArtists } from '../data/events'

/** Continuous artist ticker — doubles as social proof for the roster. */
export function Marquee() {
  const names = [
    ...allArtists.map((a) => a.name),
    'Arijit Singh',
    'Sonu Nigam',
    'A R Rahman',
    'Kapil Sharma',
    'Gurdas Maan',
    'Sunidhi Chauhan',
    'Karan Aujla',
    'AP Dhillon',
    'Atif Aslam',
    'Udit Narayan',
    'Salim–Sulaiman',
    'Rahat Fateh Ali Khan',
  ]

  return (
    <div className="relative border-y border-line bg-ink-2 py-5">
      <div className="edge-fade flex overflow-hidden">
        <div className="marquee-track flex shrink-0 items-center gap-10 pr-10">
          {[...names, ...names].map((n, i) => (
            <span key={`${n}-${i}`} className="flex shrink-0 items-center gap-10">
              <span className="whitespace-nowrap text-[15px] font-bold tracking-[-0.02em] text-cream/45 transition-colors hover:text-cream">
                {n}
              </span>
              <span className="h-1 w-1 shrink-0 rounded-full bg-blue/50" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
