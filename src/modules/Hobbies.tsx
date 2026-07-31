import { useState } from 'react'
import { useAppData } from '../store/DataContext'
import { newId } from '../lib/id'
import type { Hobby } from '../lib/types'
import { defaultReminder } from '../lib/types'
import { Header, Card, Section, Button, Field, Input, Select, EmptyState, Textarea } from '../components/ui'
import { ReminderEditor } from '../components/ReminderEditor'

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function Hobbies() {
  const { data, setData } = useAppData()
  const { hobbies } = data
  const [showForm, setShowForm] = useState(false)

  const update = (fn: (h: Hobby[]) => Hobby[]) => {
    setData((prev) => ({ ...prev, hobbies: { hobbies: fn(prev.hobbies.hobbies) } }))
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header title="Hobbies" />
      <div className="flex flex-col gap-5 p-4 pb-10">
        <Section
          title="Mis hobbies"
          action={
            <button onClick={() => setShowForm((v) => !v)} className="text-xs text-[var(--link)]">
              + Agregar
            </button>
          }
        >
          {hobbies.hobbies.length === 0 && !showForm ? (
            <EmptyState text="Agrega tus hobbies y cuándo quieres dedicarles tiempo." />
          ) : (
            <div className="flex flex-col gap-2">
              {hobbies.hobbies.map((h) => (
                <HobbyCard key={h.id} hobby={h} onChange={(fn) => update((hs) => hs.map((x) => (x.id === h.id ? fn(x) : x)))} onDelete={() => update((hs) => hs.filter((x) => x.id !== h.id))} />
              ))}
            </div>
          )}
          {showForm && <NewHobbyForm onAdd={(h) => { update((hs) => [...hs, h]); setShowForm(false) }} />}
        </Section>
      </div>
    </div>
  )
}

function NewHobbyForm({ onAdd }: { onAdd: (h: Hobby) => void }) {
  const [name, setName] = useState('')
  const [weekday, setWeekday] = useState<number | ''>('')
  const [time, setTime] = useState('')
  const [goal, setGoal] = useState('')
  const [reminder, setReminder] = useState(defaultReminder())

  const submit = () => {
    if (!name.trim()) return
    onAdd({ id: newId(), name: name.trim(), weekday: weekday === '' ? undefined : Number(weekday), time: time || undefined, goal: goal || undefined, reminder })
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-10)] p-3">
      <Field label="Hobby">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Guitarra" />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Día (opcional)">
          <Select value={weekday} onChange={(e) => setWeekday(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">Sin día fijo</option>
            {WEEKDAYS.map((w, i) => (
              <option key={i} value={i}>
                {w}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Hora (opcional)">
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
      <Field label="Meta (opcional)">
        <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Ej: 2 hs por semana" />
      </Field>
      {weekday !== '' && time && <ReminderEditor value={reminder} onChange={setReminder} mode="time" />}
      <Button onClick={submit}>Guardar</Button>
    </div>
  )
}

function HobbyCard({ hobby, onChange, onDelete }: { hobby: Hobby; onChange: (fn: (h: Hobby) => Hobby) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <Card>
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <div>
          <p className="text-sm font-medium text-[var(--text-100)]">{hobby.name}</p>
          {(hobby.weekday !== undefined || hobby.goal) && (
            <p className="text-xs text-[var(--text-40)]">
              {hobby.weekday !== undefined ? `${WEEKDAYS[hobby.weekday]}${hobby.time ? ` ${hobby.time}` : ''}` : ''}
              {hobby.weekday !== undefined && hobby.goal ? ' · ' : ''}
              {hobby.goal}
            </p>
          )}
        </div>
        <span className="text-[var(--text-30)]">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-2">
          <Field label="Notas">
            <Textarea rows={2} value={hobby.notes ?? ''} onChange={(e) => onChange((h) => ({ ...h, notes: e.target.value }))} />
          </Field>
          {hobby.weekday !== undefined && hobby.time && (
            <ReminderEditor value={hobby.reminder} onChange={(r) => onChange((h) => ({ ...h, reminder: r }))} mode="time" />
          )}
          <Button variant="danger" onClick={onDelete}>
            Eliminar
          </Button>
        </div>
      )}
    </Card>
  )
}
