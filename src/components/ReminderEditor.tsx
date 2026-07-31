import type { ReminderConfig } from '../lib/types'
import { Field, Input } from './ui'

const ANTICIPATION_OPTIONS = [
  { label: 'El día', value: 0 },
  { label: '1 día antes', value: 1 },
  { label: '3 días antes', value: 3 },
  { label: '1 semana antes', value: 7 },
  { label: '2 semanas antes', value: 14 },
  { label: '1 mes antes', value: 30 },
]

export function ReminderEditor({
  value,
  onChange,
  mode = 'anticipation',
}: {
  value: ReminderConfig
  onChange: (next: ReminderConfig) => void
  mode?: 'anticipation' | 'repeat' | 'time'
}) {
  const toggleDay = (day: number) => {
    const current = value.anticipationDays ?? []
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort((a, b) => a - b)
    onChange({ ...value, anticipationDays: next })
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <label className="flex items-center gap-2 text-sm font-medium text-white">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
          className="h-4 w-4 accent-violet-600"
        />
        🔔 Recordarme
      </label>

      {value.enabled && mode === 'anticipation' && (
        <div className="flex flex-wrap gap-1.5">
          {ANTICIPATION_OPTIONS.map((opt) => {
            const active = (value.anticipationDays ?? []).includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleDay(opt.value)}
                className={`rounded-full px-3 py-1 text-xs ${active ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/60'}`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )}

      {value.enabled && mode === 'repeat' && (
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              checked={value.repeatUntilDone ?? false}
              onChange={(e) => onChange({ ...value, repeatUntilDone: e.target.checked })}
              className="h-4 w-4 accent-violet-600"
            />
            Repetir varias veces al día hasta que lo marque como hecho
          </label>
          {value.repeatUntilDone && (
            <div className="grid grid-cols-3 gap-2">
              <Field label="Cada (hs)">
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={value.repeatEveryHours ?? 4}
                  onChange={(e) => onChange({ ...value, repeatEveryHours: Number(e.target.value) })}
                />
              </Field>
              <Field label="Desde">
                <Input type="time" value={value.windowStart ?? '09:00'} onChange={(e) => onChange({ ...value, windowStart: e.target.value })} />
              </Field>
              <Field label="Hasta">
                <Input type="time" value={value.windowEnd ?? '21:00'} onChange={(e) => onChange({ ...value, windowEnd: e.target.value })} />
              </Field>
            </div>
          )}
        </div>
      )}

      {value.enabled && mode === 'time' && (
        <p className="text-xs text-white/50">Te avisamos cerca de la hora programada, mientras la app esté abierta.</p>
      )}
    </div>
  )
}
