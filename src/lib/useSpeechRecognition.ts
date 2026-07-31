import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: any) => void) | null
  onend: (() => void) | null
  onerror: ((event: any) => void) | null
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as any
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export const speechRecognitionSupported = !!getSpeechRecognitionCtor()

/**
 * Reconocimiento de voz 100% gratis usando la Web Speech API del propio
 * navegador (sin backend, sin costo por uso). Funciona bien en Chrome/
 * Android; en iOS Safari puede no estar disponible.
 */
export function useSpeechRecognition() {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      setError('Tu navegador no soporta reconocimiento de voz.')
      return
    }
    setError(null)
    setTranscript('')

    const recognition = new Ctor()
    recognition.lang = 'es-CL'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
      let combined = ''
      for (let i = 0; i < event.results.length; i++) {
        combined += event.results[i][0].transcript
      }
      setTranscript(combined)
    }
    recognition.onerror = (event: any) => {
      const code = event?.error
      const messages: Record<string, string> = {
        'no-speech': 'No escuché nada. Probá de nuevo.',
        'not-allowed': 'Necesito permiso para usar el micrófono.',
        'audio-capture': 'No encontré un micrófono disponible.',
      }
      setError(messages[code] ?? 'Hubo un problema con el reconocimiento de voz.')
      setListening(false)
    }
    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  return { listening, transcript, error, start, stop, supported: speechRecognitionSupported }
}
