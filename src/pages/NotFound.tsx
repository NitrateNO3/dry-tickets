import { Button } from '../components/Primitives'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 pt-32 text-center">
      <p className="font-serif text-[clamp(5rem,18vw,10rem)] italic leading-none text-gradient">404</p>
      <h1 className="mt-4 text-3xl font-extrabold">This show has moved on</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        The page you're after isn't here. It may have sold out, or the tour dates may have changed.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button to="/events" size="lg">
          Browse events
        </Button>
        <Button to="/" variant="outline" size="lg">
          Back home
        </Button>
      </div>
    </div>
  )
}
