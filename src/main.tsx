import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { EventsProvider } from './lib/events'
import { CityProvider } from './lib/city'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <EventsProvider>
        <CityProvider>
          <App />
        </CityProvider>
      </EventsProvider>
    </BrowserRouter>
  </StrictMode>,
)
