import * as chrono from 'chrono-node'
import dayjs from 'dayjs'

export type VoiceCategory = 'deberes' | 'viajes'

export type ParsedVoiceCommand = {
  title: string
  date?: string // YYYY-MM-DD
  time?: string // HH:mm, si se detectó una hora específica
  category: VoiceCategory
  destination?: string // solo si category === 'viajes'
  rawText: string
}

const TRIGGER_PHRASES = [
  /^isis[,:]?\s*/i,
  /^(agénd|agend)ame\s*/i,
  /^recuérdame\s*/i,
  /^recuerdame\s*/i,
  /^anótame\s*/i,
  /^anotame\s*/i,
  /^agrega(?:r)?\s*/i,
  /^anota\s*/i,
  /^crea(?:r)?\s*(?:un|una)?\s*/i,
]

const TRIP_PATTERN = /\bviaje\s+a\s+([a-záéíóúñü\s]+?)(?=\s+(?:el|para|desde|,|$))/i

function stripTriggerPhrases(text: string): string {
  let result = text.trim()
  let changed = true
  while (changed) {
    changed = false
    for (const re of TRIGGER_PHRASES) {
      const next = result.replace(re, '')
      if (next !== result) {
        result = next.trim()
        changed = true
      }
    }
  }
  return result
}

function capitalize(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const CONNECTOR_WORDS = /^(el|la|los|las|de|del|al|a|en|un|una)$/i

/** Saca conectores sueltos que quedan colgando en las puntas después de sacar las fechas (ej: "comprar pan el" → "comprar pan"). */
function trimDanglingConnectors(text: string): string {
  let words = text.split(/\s+/).filter(Boolean)
  let changed = true
  while (changed && words.length > 0) {
    changed = false
    if (CONNECTOR_WORDS.test(words[0])) {
      words = words.slice(1)
      changed = true
    } else if (words.length > 0 && CONNECTOR_WORDS.test(words[words.length - 1])) {
      words = words.slice(0, -1)
      changed = true
    }
  }
  return words.join(' ')
}

/**
 * Interpreta un comando de voz tipo "agéndame examen de cálculo el 20 de
 * agosto a las 10" sin IA: usa chrono-node (offline) para la fecha/hora y
 * reglas simples para decidir a qué módulo mandarlo.
 */
export function parseVoiceCommand(rawText: string): ParsedVoiceCommand {
  const withoutTrigger = stripTriggerPhrases(rawText)

  const chronoResults = chrono.es.parse(withoutTrigger, new Date(), { forwardDate: true })
  const primary = chronoResults[0]

  let date: string | undefined
  let time: string | undefined
  let title = withoutTrigger

  if (primary) {
    const d = primary.start.date()
    date = dayjs(d).format('YYYY-MM-DD')
    if (primary.start.isCertain('hour')) {
      time = dayjs(d).format('HH:mm')
    }
    // Quita todos los fragmentos de fecha/hora detectados del título (pueden ser varios, ej. "mañana" ambiguo).
    for (const r of chronoResults) {
      title = title.split(r.text).join(' ')
    }
  }

  let category: VoiceCategory = 'deberes'
  let destination: string | undefined
  const tripMatch = withoutTrigger.match(TRIP_PATTERN)
  if (tripMatch) {
    category = 'viajes'
    destination = capitalize(tripMatch[1].trim())
    title = title.split(tripMatch[0]).join(' ')
  }

  title = title
    .replace(/\s+/g, ' ')
    .replace(/^[,.\s]+|[,.\s]+$/g, '')
    .trim()
  title = trimDanglingConnectors(title)

  if (!title) title = category === 'viajes' ? `Viaje a ${destination}` : 'Recordatorio'

  return { title: capitalize(title), date, time, category, destination, rawText }
}
