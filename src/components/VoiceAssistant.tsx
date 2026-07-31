import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useAppData } from '../store/DataContext'
import { useSpeechRecognition } from '../lib/useSpeechRecognition'
import { parseVoiceCommand, type VoiceCategory } from '../lib/voiceParser'
import { newId } from '../lib/id'
import { defaultReminder, type Chore, type Trip } from '../lib/types'
import { Button, Field, Input, Select } from './ui'

type Step = 'idle' | 'listening' | 'review' | 'saved'

export function VoiceAssistant() {
  const { setData } = useAppData()
  const { listening, transcript, error, start, stop, supported } = useSpeechRecognition()
  const [step, setStep] = useState<Step>('idle')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<VoiceCategory>('deberes')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [destination, setDestination] = useState('')

  useEffect(() => {
    if (!listening && step === 'listening' && transcript.trim()) {
      const parsed = parseVoiceCommand(transcript)
      setTitle(parsed.title)
      setCategory(parsed.category)
      setDate(parsed.date ?? '')
      setTime(parsed.time ?? '')
      setDestination(parsed.destination ?? '')
      setStep('review')
    } else if (!listening && step === 'listening' && !transcript.trim()) {
      setStep('idle')
    }
  }, [listening, transcript, step])

  const handleStart = () => {
    setStep('listening')
    start()
  }

  const handleCancel = () => {
    stop()
    setStep('idle')
  }

  const handleSave = () => {
    if (category === 'viajes') {
      const trip: Trip = {
        id: newId(),
        destination: destination.trim() || title,
        startDate: date || dayjs().format('YYYY-MM-DD'),
        endDate: date || dayjs().format('YYYY-MM-DD'),
        packingList: [],
        itinerary: [],
        reminder: { ...defaultReminder(), enabled: true },
      }
      setData((prev) => ({ ...prev, travel: { trips: [...prev.travel.trips, trip] } }))
    } else {
      const chore: Chore = {
        id: newId(),
        title: time ? `${title} (${time})` : title,
        category: 'externo',
        done: false,
        dueDate: date || undefined,
        reminder: date ? { ...defaultReminder(), enabled: true, anticipationDays: [0] } : defaultReminder(),
      }
      setData((prev) => ({ ...prev, chores: { chores: [...prev.chores.chores, chore] } }))
    }
    setStep('saved')
    setTimeout(() => setStep('idle'), 1800)
  }

  if (!supported) return null

  return (
    <>
      <button
        onClick={handleStart}
        disabled={step !== 'idle'}
        className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-2xl text-white shadow-lg active:bg-violet-700 disabled:opacity-60"
        aria-label="Agendar por voz"
      >
        {step === 'saved' ? '✅' : '🎤'}
      </button>

      {step === 'listening' && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-end bg-black/50 p-4" onClick={handleCancel}>
          <div className="w-full max-w-sm rounded-2xl bg-[var(--bg)] p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="mb-2 animate-pulse text-3xl">🎤</p>
            <p className="text-sm text-[var(--text-50)]">Escuchando... decí qué querés agendar</p>
            <p className="mt-3 min-h-6 text-sm text-[var(--text-100)]">{transcript}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={stop}>Listo</Button>
            </div>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--bg)] p-5">
            <p className="mb-3 text-sm font-semibold text-[var(--text-100)]">Revisá antes de guardar</p>
            <div className="flex flex-col gap-3">
              <Field label="Título">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Dónde lo agendo">
                <Select value={category} onChange={(e) => setCategory(e.target.value as VoiceCategory)}>
                  <option value="deberes">Deberes</option>
                  <option value="viajes">Viajes</option>
                </Select>
              </Field>
              {category === 'viajes' && (
                <Field label="Destino">
                  <Input value={destination} onChange={(e) => setDestination(e.target.value)} />
                </Field>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Field label="Fecha">
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>
                <Field label="Hora (opcional)">
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </Field>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setStep('idle')}>
                Descartar
              </Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </div>
        </div>
      )}

      {error && step === 'idle' && (
        <div className="fixed bottom-24 right-6 z-20 max-w-[260px] rounded-xl bg-[var(--danger-bg-10)] p-3 text-right text-xs text-[var(--danger-text)]">
          {error}
        </div>
      )}
    </>
  )
}
