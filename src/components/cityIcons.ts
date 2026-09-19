import {
  Drama,
  Grape,
  Landmark,
  MicVocal,
  Mountain,
  Music,
  PartyPopper,
  Piano,
  Plane,
  Sailboat,
  Sun,
  Tag,
  Theater,
  TramFront,
  TreePalm,
  Trophy,
  Waves,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** One line-art mark and a city-centre coordinate (for "Detect my location") per city. */
export const CITY_INFO: Record<string, { Icon: LucideIcon; lat: number; lng: number }> = {
  Sydney: { Icon: Sailboat, lat: -33.87, lng: 151.21 },
  Melbourne: { Icon: TramFront, lat: -37.81, lng: 144.96 },
  Brisbane: { Icon: Sun, lat: -27.47, lng: 153.03 },
  Perth: { Icon: Waves, lat: -31.95, lng: 115.86 },
  Adelaide: { Icon: Grape, lat: -34.93, lng: 138.6 },
  'Gold Coast': { Icon: TreePalm, lat: -28.02, lng: 153.4 },
  Canberra: { Icon: Landmark, lat: -35.28, lng: 149.13 },
  Hobart: { Icon: Mountain, lat: -42.88, lng: 147.33 },
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Classical: Piano,
  Comedy: Drama,
  Concert: Music,
  Festival: PartyPopper,
  Sports: Trophy,
  'Sufi & Qawwali': MicVocal,
  Theatre: Theater,
  'Tours & Travel': Plane,
}

/** Line icon for an event category; new categories fall back to a tag. */
export const categoryIcon = (name: string): LucideIcon => CATEGORY_ICONS[name] ?? Tag
