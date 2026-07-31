import { useState } from 'react'
import dayjs from 'dayjs'
import { useAppData } from '../store/DataContext'
import { newId } from '../lib/id'
import type { Chore, ChoreCategory } from '../lib/types'
import { defaultReminder } from '../lib/types'
import { Header, Card, Section, Button, Field, Input, Select, Checkbox, EmptyState } from '../components/ui'
import { ReminderEditor } from '../components/ReminderEditor'

export default function Deberes() {
  const { data, setData } = useAppData()
  const { chores } = data
  const [showForm, setShowForm] = useState(false)

  const update = (fn: (c: Chore[]) => Chore[]) => {
    setData((prev) => ({ ...prev, chores: { chores: fn(prev.chores.chores) } }))
  }

  const hogar = chores.chores.filter((c) => c.category === 'hogar')
  const externo = chores.chores.filter((c) => c.category === 'externo')

  return (
    <div className="flex flex-1 flex-col">
      <Header title="Deberes" />
      <div className="flex flex-col gap-5 p-4 pb-10">
        <Section
          title="Lista de deberes"
          action={
            <button onClick={() => setShowForm((v) => !v)} className="text-xs text-violet-300">
              + Agregar
            </button>
          }
        >
          {showForm && <NewChoreForm onAdd={(c) => { update((cs) => [...cs, c]); setShowForm(false) }} />}
        </Section>

        {chores.chores.length === 0 && !showForm && <EmptyState text="Agrega deberes del hogar o externos, totalmente personalizables." />}

        <ChoreGroup title="🏠 Hogar" chores={hogar} onChange={update} />
        <ChoreGroup title="📌 Externos" chores={externo} onChange={update} />
      </div>
    </div>
  )
}

function ChoreGroup({ title, chores, onChange }: { title: string; chores: Chore[]; onChange: (fn: (c: Chore[]) => Chore[]) => void }) {
  if (chores.length === 0) return null
  const pending = chores.filter((c) => !c.done)
  const done = chores.filter((c) => c.done)

  return (
    <Section title={title}>
      <div className="flex flex-col gap-1.5">
        {[...pending, ...done].map((c) => (
          <ChoreRow key={c.id} chore={c} onChange={(fn) => onChange((cs) => cs.map((x) => (x.id === c.id ? fn(x) : x)))} onDelete={() => onChange((cs) => cs.filter((x) => x.id !== c.id))} />
        ))}
      </div>
    </Section>
  )
}

function ChoreRow({ chore, onChange, onDelete }: { chore: Chore; onChange: (fn: (c: Chore) => Chore) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <Card className="!py-2.5">
      <div className="flex items-center justify-between gap-2">
        <Checkbox checked={chore.done} onChange={() => onChange((c) => ({ ...c, done: !c.done }))} label={chore.title} />
        <div className="flex shrink-0 items-center gap-2">
          {chore.dueDate && <span className="text-xs text-white/40">{dayjs(chore.dueDate).format('D MMM')}</span>}
          <button onClick={() => setOpen((v) => !v)} className="text-white/30">
            {open ? '▲' : '▼'}
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-3 flex flex-col gap-2">
          <ReminderEditor value={chore.reminder} onChange={(r) => onChange((c) => ({ ...c, reminder: r }))} mode="repeat" />
          <Button variant="danger" onClick={onDelete}>
            Eliminar
          </Button>
        </div>
      )}
    </Card>
  )
}

function NewChoreForm({ onAdd }: { onAdd: (c: Chore) => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ChoreCategory>('hogar')
  const [dueDate, setDueDate] = useState('')
  const [reminder, setReminder] = useState(defaultReminder())

  const submit = () => {
    if (!title.trim()) return
    onAdd({ id: newId(), title: title.trim(), category, done: false, dueDate: dueDate || undefined, reminder })
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 p-3">
      <Field label="Deber">
        <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Lavar ropa" onKeyDown={(e) => e.key === 'Enter' && submit()} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Categoría">
          <Select value={category} onChange={(e) => setCategory(e.target.value as ChoreCategory)}>
            <option value="hogar">Hogar</option>
            <option value="externo">Externo</option>
          </Select>
        </Field>
        <Field label="Fecha límite (opcional)">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      </div>
      <ReminderEditor value={reminder} onChange={setReminder} mode="repeat" />
      <Button onClick={submit}>Guardar</Button>
    </div>
  )
}
