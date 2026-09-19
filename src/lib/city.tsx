import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export const ALL_CITIES = 'All Australia'

const KEY = 'dt-city'

const read = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

type Ctx = {
  /** The visitor's chosen city, or ALL_CITIES. */
  city: string
  setCity: (name: string) => void
  pickerOpen: boolean
  openPicker: () => void
  closePicker: () => void
}

const CityCtx = createContext<Ctx | null>(null)

/** Remembers the visitor's city. First-time visitors get the city picker on arrival. */
export function CityProvider({ children }: { children: ReactNode }) {
  const [saved] = useState(read)
  const [city, setCityState] = useState(saved ?? ALL_CITIES)
  const [pickerOpen, setPickerOpen] = useState(saved === null)

  const setCity = useCallback((name: string) => {
    setCityState(name)
    setPickerOpen(false)
    try {
      localStorage.setItem(KEY, name)
    } catch {
      // Private mode: the choice still holds for this visit.
    }
  }, [])

  const value = useMemo(
    () => ({
      city,
      setCity,
      pickerOpen,
      openPicker: () => setPickerOpen(true),
      closePicker: () => setPickerOpen(false),
    }),
    [city, setCity, pickerOpen],
  )

  return <CityCtx.Provider value={value}>{children}</CityCtx.Provider>
}

export function useCity() {
  const ctx = useContext(CityCtx)
  if (!ctx) throw new Error('useCity must be used inside <CityProvider>')
  return ctx
}
