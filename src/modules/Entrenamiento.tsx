import { useState } from 'react'
import dayjs from 'dayjs'
import { useAppData } from '../store/DataContext'
import { newId } from '../lib/id'
import type { BodyLogEntry, Exercise, RoutineDay, TrainingDay } from '../lib/types'
import { Header, Card, Section, Button, Field, Input, Select, EmptyState } from '../components/ui'
import { SimpleLineChart } from '../components/SimpleChart'

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function Entrenamiento() {
  const { data, setData } = useAppData()
  const { training } = data

  const update = (fn: (t: typeof training) => typeof training) => {
    setData((prev) => ({ ...prev, training: fn(prev.training) }))
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header title="Entrenamiento" />
      <div className="flex flex-col gap-5 p-4 pb-10">
        <ScheduleSection schedule={training.schedule} onChange={(fn) => update((t) => ({ ...t, schedule: fn(t.schedule) }))} />
        <RoutineSection routines={training.routines} onChange={(fn) => update((t) => ({ ...t, routines: fn(t.routines) }))} />
        <BodyLogSection bodyLog={training.bodyLog} onChange={(fn) => update((t) => ({ ...t, bodyLog: fn(t.bodyLog) }))} />
      </div>
    </div>
  )
}

function ScheduleSection({ schedule, onChange }: { schedule: TrainingDay[]; onChange: (fn: (s: TrainingDay[]) => TrainingDay[]) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [weekday, setWeekday] = useState(1)
  const [startTime, setStartTime] = useState('07:00')
  const [endTime, setEndTime] = useState('08:00')
  const [label, setLabel] = useState('')

  const add = () => {
    onChange((s) => [...s, { id: newId(), weekday, startTime, endTime, label: label.trim() || 'Entrenamiento' }])
    setLabel('')
    setShowForm(false)
  }

  const sorted = [...schedule].sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime))

  return (
    <Section
      title="Horarios y días"
      action={
        <button onClick={() => setShowForm((v) => !v)} className="text-xs text-violet-300">
          + Agregar
        </button>
      }
    >
      {sorted.length === 0 && !showForm ? (
        <EmptyState text="Definí tus días y horarios de entrenamiento." />
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((d) => (
            <Card key={d.id} className="flex items-center justify-between !py-2.5">
              <div>
                <p className="text-sm font-medium text-white">{d.label}</p>
                <p className="text-xs text-white/40">
                  {WEEKDAYS[d.weekday]} · {d.startTime} - {d.endTime}
                </p>
              </div>
              <button onClick={() => onChange((s) => s.filter((x) => x.id !== d.id))} className="text-white/30">
                ✕
              </button>
            </Card>
          ))}
        </div>
      )}
      {showForm && (
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 p-3">
          <Field label="Nombre">
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ej: Piernas" />
          </Field>
          <Field label="Día">
            <Select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))}>
              {WEEKDAYS.map((w, i) => (
                <option key={i} value={i}>
                  {w}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Desde">
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </Field>
            <Field label="Hasta">
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </Field>
          </div>
          <Button onClick={add}>Guardar</Button>
        </div>
      )}
    </Section>
  )
}

function RoutineSection({ routines, onChange }: { routines: RoutineDay[]; onChange: (fn: (r: RoutineDay[]) => RoutineDay[]) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')

  const addRoutine = () => {
    if (!name.trim()) return
    onChange((r) => [...r, { id: newId(), name: name.trim(), exercises: [] }])
    setName('')
    setShowForm(false)
  }

  return (
    <Section
      title="Rutina de entrenamiento"
      action={
        <button onClick={() => setShowForm((v) => !v)} className="text-xs text-violet-300">
          + Día de rutina
        </button>
      }
    >
      {routines.length === 0 && !showForm ? (
        <EmptyState text="Arma tu rutina por día (ej: Push, Pull, Piernas)." />
      ) : (
        <div className="flex flex-col gap-3">
          {routines.map((r) => (
            <RoutineCard key={r.id} routine={r} onChange={(fn) => onChange((rs) => rs.map((x) => (x.id === r.id ? fn(x) : x)))} onDelete={() => onChange((rs) => rs.filter((x) => x.id !== r.id))} />
          ))}
        </div>
      )}
      {showForm && (
        <div className="flex gap-2">
          <Input autoFocus placeholder="Ej: Día de piernas" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addRoutine()} />
          <Button onClick={addRoutine}>Crear</Button>
        </div>
      )}
    </Section>
  )
}

function RoutineCard({ routine, onChange, onDelete }: { routine: RoutineDay; onChange: (fn: (r: RoutineDay) => RoutineDay) => void; onDelete: () => void }) {
  const [ex, setEx] = useState({ name: '', sets: 3, reps: '10-12', weight: '' })

  const addExercise = () => {
    if (!ex.name.trim()) return
    const exercise: Exercise = { id: newId(), name: ex.name.trim(), sets: ex.sets, reps: ex.reps, weight: ex.weight || undefined }
    onChange((r) => ({ ...r, exercises: [...r.exercises, exercise] }))
    setEx({ name: '', sets: 3, reps: '10-12', weight: '' })
  }

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <p className="font-medium text-white">{routine.name}</p>
        <button onClick={onDelete} className="text-white/30">
          ✕
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {routine.exercises.map((e) => (
          <div key={e.id} className="flex items-center justify-between text-sm text-white/80">
            <span>{e.name}</span>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span>
                {e.sets}x{e.reps}
                {e.weight ? ` · ${e.weight}` : ''}
              </span>
              <button onClick={() => onChange((r) => ({ ...r, exercises: r.exercises.filter((x) => x.id !== e.id) }))} className="text-white/20">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        <Input className="col-span-2" placeholder="Ejercicio" value={ex.name} onChange={(e) => setEx({ ...ex, name: e.target.value })} />
        <Input placeholder="Series" type="number" value={ex.sets} onChange={(e) => setEx({ ...ex, sets: Number(e.target.value) })} />
        <Input placeholder="Reps" value={ex.reps} onChange={(e) => setEx({ ...ex, reps: e.target.value })} />
      </div>
      <Button variant="secondary" className="mt-2 w-full" onClick={addExercise}>
        + Agregar ejercicio
      </Button>
    </Card>
  )
}

function BodyLogSection({ bodyLog, onChange }: { bodyLog: BodyLogEntry[]; onChange: (fn: (b: BodyLogEntry[]) => BodyLogEntry[]) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [weightKg, setWeightKg] = useState('')
  const [muscleMassKg, setMuscleMassKg] = useState('')
  const [bodyFatPct, setBodyFatPct] = useState('')

  const sorted = [...bodyLog].sort((a, b) => a.date.localeCompare(b.date))

  const add = () => {
    const entry: BodyLogEntry = {
      id: newId(),
      date,
      weightKg: weightKg ? Number(weightKg) : undefined,
      muscleMassKg: muscleMassKg ? Number(muscleMassKg) : undefined,
      bodyFatPct: bodyFatPct ? Number(bodyFatPct) : undefined,
    }
    onChange((b) => [...b, entry])
    setWeightKg('')
    setMuscleMassKg('')
    setBodyFatPct('')
    setShowForm(false)
  }

  return (
    <Section
      title="Evolución"
      action={
        <button onClick={() => setShowForm((v) => !v)} className="text-xs text-violet-300">
          + Registrar
        </button>
      }
    >
      {sorted.length > 1 && (
        <Card>
          <p className="mb-1 text-xs text-white/50">Peso (kg)</p>
          <SimpleLineChart points={sorted.filter((e) => e.weightKg != null).map((e) => ({ date: e.date, value: e.weightKg! }))} unit="kg" />
        </Card>
      )}

      {sorted.length === 0 && !showForm ? (
        <EmptyState text="Registra tu peso y masa muscular para ver tu evolución." />
      ) : (
        <div className="flex flex-col gap-1.5">
          {[...sorted].reverse().map((e) => (
            <Card key={e.id} className="flex items-center justify-between !py-2.5">
              <span className="text-xs text-white/40">{dayjs(e.date).format('D MMM YYYY')}</span>
              <div className="flex gap-3 text-sm text-white/80">
                {e.weightKg != null && <span>{e.weightKg} kg</span>}
                {e.muscleMassKg != null && <span>{e.muscleMassKg} kg músculo</span>}
                {e.bodyFatPct != null && <span>{e.bodyFatPct}% grasa</span>}
              </div>
              <button onClick={() => onChange((b) => b.filter((x) => x.id !== e.id))} className="text-white/20">
                ✕
              </button>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 p-3">
          <Field label="Fecha">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Peso (kg)">
              <Input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </Field>
            <Field label="Masa musc. (kg)">
              <Input type="number" step="0.1" value={muscleMassKg} onChange={(e) => setMuscleMassKg(e.target.value)} />
            </Field>
            <Field label="% Grasa">
              <Input type="number" step="0.1" value={bodyFatPct} onChange={(e) => setBodyFatPct(e.target.value)} />
            </Field>
          </div>
          <Button onClick={add}>Guardar</Button>
        </div>
      )}
    </Section>
  )
}
