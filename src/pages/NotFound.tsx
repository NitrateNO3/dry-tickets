import { Button, Meta } from '../components/Primitives'

export default function NotFound() {
  return (
    <div className="wrap page-top flex min-h-[70vh] flex-col items-center justify-center text-center">
      <Meta title="Page not found" description="This page doesn't exist. Browse current events on Dry Tickets." />
      <p className="t-display text-blue">404</p>
      <h1 className="t-h2 mt-4 text-ink">This page doesn't exist</h1>
      <p className="mt-3 max-w-md text-muted">
        The event may have finished or the link may be out of date. Current shows are listed on the events page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button to="/events" size="lg">
          Browse events
        </Button>
        <Button to="/" variant="outline" size="lg">
          Home
        </Button>
      </div>
    </div>
  )
}
