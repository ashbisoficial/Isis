import { useState } from 'react'
import { useAppData } from '../store/DataContext'
import { newId } from '../lib/id'
import type { Meal, NutritionGoal } from '../lib/types'
import { defaultReminder } from '../lib/types'
import { Header, Card, Section, Button, Field, Input, Select, EmptyState } from '../components/ui'
import { ReminderEditor } from '../components/ReminderEditor'

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function Alimentacion() {
  const { data, setData } = useAppData()
  const { nutrition } = data
  const [showMealForm, setShowMealForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)

  const update = (fn: (n: typeof nutrition) => typeof nutrition) => {
    setData((prev) => ({ ...prev, nutrition: fn(prev.nutrition) }))
  }

  const sortedMeals = [...nutrition.meals].sort((a, b) => a.weekday - b.weekday || a.time.localeCompare(b.time))

  return (
    <div className="flex flex-1 flex-col">
      <Header title="Alimentación" />
      <div className="flex flex-col gap-5 p-4 pb-10">
        <Section
          title="Comidas de la semana"
          action={
            <button onClick={() => setShowMealForm((v) => !v)} className="text-xs text-[var(--link)]">
              + Agregar
            </button>
          }
        >
          {sortedMeals.length === 0 && !showMealForm ? (
            <EmptyState text="Arma tu horario de comidas." />
          ) : (
            <div className="flex flex-col gap-1.5">
              {sortedMeals.map((m) => (
                <MealRow key={m.id} meal={m} onChange={(fn) => update((n) => ({ ...n, meals: n.meals.map((x) => (x.id === m.id ? fn(x) : x)) }))} onDelete={() => update((n) => ({ ...n, meals: n.meals.filter((x) => x.id !== m.id) }))} />
              ))}
            </div>
          )}
          {showMealForm && <NewMealForm onAdd={(m) => { update((n) => ({ ...n, meals: [...n.meals, m] })); setShowMealForm(false) }} />}
        </Section>

        <Section
          title="Objetivos / notas nutricionales"
          action={
            <button onClick={() => setShowGoalForm((v) => !v)} className="text-xs text-[var(--link)]">
              + Agregar
            </button>
          }
        >
          {nutrition.goals.length === 0 && !showGoalForm ? (
            <EmptyState text="Ej: Proteína diaria, agua, suplementos." />
          ) : (
            <div className="flex flex-col gap-1.5">
              {nutrition.goals.map((g: NutritionGoal) => (
                <Card key={g.id} className="flex items-center justify-between !py-2.5">
                  <span className="text-sm text-[var(--text-100)]">{g.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--text-50)]">{g.value}</span>
                    <button onClick={() => update((n) => ({ ...n, goals: n.goals.filter((x) => x.id !== g.id) }))} className="text-[var(--text-20)]">
                      ✕
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {showGoalForm && <NewGoalForm onAdd={(g) => { update((n) => ({ ...n, goals: [...n.goals, g] })); setShowGoalForm(false) }} />}
        </Section>
      </div>
    </div>
  )
}

function NewMealForm({ onAdd }: { onAdd: (m: Meal) => void }) {
  const [name, setName] = useState('')
  const [weekday, setWeekday] = useState(1)
  const [time, setTime] = useState('08:00')
  const [reminder, setReminder] = useState(defaultReminder())

  const submit = () => {
    if (!name.trim()) return
    onAdd({ id: newId(), name: name.trim(), weekday, time, reminder })
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-10)] p-3">
      <Field label="Comida">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Desayuno" />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Día">
          <Select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))}>
            {WEEKDAYS.map((w, i) => (
              <option key={i} value={i}>
                {w}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Hora">
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
      <ReminderEditor value={reminder} onChange={setReminder} mode="time" />
      <Button onClick={submit}>Guardar</Button>
    </div>
  )
}

function MealRow({ meal, onChange, onDelete }: { meal: Meal; onChange: (fn: (m: Meal) => Meal) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <Card className="!py-2.5">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between">
        <span className="text-sm text-[var(--text-100)]">{meal.name}</span>
        <span className="text-xs text-[var(--text-40)]">
          {WEEKDAYS[meal.weekday].slice(0, 3)} · {meal.time}
        </span>
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-2">
          <ReminderEditor value={meal.reminder} onChange={(r) => onChange((m) => ({ ...m, reminder: r }))} mode="time" />
          <Button variant="danger" onClick={onDelete}>
            Eliminar
          </Button>
        </div>
      )}
    </Card>
  )
}

function NewGoalForm({ onAdd }: { onAdd: (g: NutritionGoal) => void }) {
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const submit = () => {
    if (!label.trim()) return
    onAdd({ id: newId(), label: label.trim(), value: value.trim() })
  }
  return (
    <div className="flex gap-2">
      <Input placeholder="Ej: Proteína" value={label} onChange={(e) => setLabel(e.target.value)} />
      <Input placeholder="Ej: 120g/día" value={value} onChange={(e) => setValue(e.target.value)} />
      <Button onClick={submit}>+</Button>
    </div>
  )
}
