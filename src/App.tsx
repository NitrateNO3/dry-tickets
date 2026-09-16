import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Artists from './pages/Artists'
import Venues from './pages/Venues'
import Sell from './pages/Sell'
import About from './pages/About'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname, search, hash } = useLocation()
  useEffect(() => {
    const target = hash && document.getElementById(hash.slice(1))
    if (target) target.scrollIntoView()
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, search, hash])
  return null
}

export default function App() {
  const { search } = useLocation()
  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Keyed on the query so nav links to /events?city=… reset the filters. */}
          <Route path="/events" element={<Events key={search} />} />
          <Route path="/event/:slug" element={<EventDetail />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
