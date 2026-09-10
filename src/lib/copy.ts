import type { EventItem } from '../data/events'
import { fmtDate } from './format'

/**
 * Source descriptions all follow one template:
 *   "<Presenter> Presents <title> [<artists> Performing Live On Stage]."
 * We pull the presenter out of it and rebuild a sentence worth reading,
 * rather than echoing the title back at the reader.
 */
export function presenterOf(event: EventItem): string | undefined {
  const m = event.description.match(/^(.*?)\s+Presents\s+/i)
  const name = m?.[1]?.trim().replace(/[.,]$/, '')
  return name && name.length < 70 ? name : undefined
}

const list = (names: string[]) =>
  names.length <= 1
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`

export function blurbOf(event: EventItem): string {
  const presenter = presenterOf(event)
  const names = event.artists.map((a) => a.name)
  const parts: string[] = []

  if (presenter) parts.push(`Presented by ${presenter}.`)

  if (event.presale) {
    parts.push(
      names.length > 0
        ? `${list(names)} ${names.length > 1 ? 'tour' : 'tours'} Australia and New Zealand — dates and venues to be announced.`
        : 'Dates and venues to be announced. Register for presale access below.',
    )
    return parts.join(' ')
  }

  const where = event.venue ? `${event.venue}, ${event.metro}` : event.metro
  parts.push(
    names.length > 0
      ? `${list(names)} ${names.length > 1 ? 'perform' : 'performs'} live at ${where} on ${fmtDate(event.start)}.`
      : `Live at ${where} on ${fmtDate(event.start)}.`,
  )

  return parts.join(' ')
}

/** "1 review" / "4 reviews" */
export const plural = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many)
