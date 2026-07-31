import { useState } from 'react'
import dayjs from 'dayjs'
import { useAppData } from '../store/DataContext'
import { newId } from '../lib/id'
import type { ItineraryItem, PackingItem, Trip } from '../lib/types'
import { defaultReminder } from '../lib/types'
import { Header, Card, Section, Button, Field, Input, Textarea, Checkbox, EmptyState, Badge } from '../components/ui'
import { ReminderEditor } from '../components/ReminderEditor'

export default function Viajes() {
  const { data, setData } = useAppData()
  const { travel } = data
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const update = (fn: (t: Trip[]) => Trip[]) => {
    setData((prev) => ({ ...prev, travel: { trips: fn(prev.travel.trips) } }))
  }

  const sorted = [...travel.trips].sort((a, b) => a.startDate.localeCompare(b.startDate))

  return (
    <div className="flex flex-1 flex-col">
      <Header title="Viajes" />
      <div className="flex flex-col gap-5 p-4 pb-10">
        <Section
          title="Mis viajes"
          action={
            <button onClick={() => setShowForm((v) => !v)} className="text-xs text-violet-300">
              + Agregar
            </button>
          }
        >
          {sorted.length === 0 && !showForm ? (
            <EmptyState text="Agregá tu próximo viaje." />
          ) : (
            <div className="flex flex-col gap-3">
              {sorted.map((t) => (
                <TripCard
                  key={t.id}
                  trip={t}
                  expanded={expandedId === t.id}
                  onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)}
                  onChange={(fn) => update((ts) => ts.map((x) => (x.id === t.id ? fn(x) : x)))}
                  onDelete={() => update((ts) => ts.filter((x) => x.id !== t.id))}
                />
              ))}
            </div>
          )}
          {showForm && (
            <NewTripForm
              onAdd={(t) => {
                update((ts) => [...ts, t])
                setShowForm(false)
                setExpandedId(t.id)
              }}
            />
          )}
        </Section>
      </div>
    </div>
  )
}

function NewTripForm({ onAdd }: { onAdd: (t: Trip) => void }) {
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const submit = () => {
    if (!destination.trim() || !startDate) return
    onAdd({
      id: newId(),
      destination: destination.trim(),
      startDate,
      endDate: endDate || startDate,
      packingList: [],
      itinerary: [],
      reminder: { ...defaultReminder(), enabled: true },
    })
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 p-3">
      <Field label="Destino">
        <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ej: Bariloche" />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Salida">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Field>
        <Field label="Vuelta">
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </Field>
      </div>
      <Button onClick={submit}>Guardar</Button>
    </div>
  )
}

function TripCard({
  trip,
  expanded,
  onToggle,
  onChange,
  onDelete,
}: {
  trip: Trip
  expanded: boolean
  onToggle: () => void
  onChange: (fn: (t: Trip) => Trip) => void
  onDelete: () => void
}) {
  const [newItem, setNewItem] = useState('')
  const [itAct, setItAct] = useState('')
  const [itDate, setItDate] = useState(trip.startDate)

  const packed = trip.packingList.filter((p) => p.done).length

  const addPackingItem = () => {
    if (!newItem.trim()) return
    const item: PackingItem = { id: newId(), label: newItem.trim(), done: false }
    onChange((t) => ({ ...t, packingList: [...t.packingList, item] }))
    setNewItem('')
  }

  const addItineraryItem = () => {
    if (!itAct.trim()) return
    const item: ItineraryItem = { id: newId(), date: itDate, activity: itAct.trim() }
    onChange((t) => ({ ...t, itinerary: [...t.itinerary, item].sort((a, b) => a.date.localeCompare(b.date)) }))
    setItAct('')
  }

  return (
    <Card>
      <button onClick={onToggle} className="flex w-full items-center justify-between text-left">
        <div>
          <p className="font-medium text-white">{trip.destination}</p>
          <p className="text-xs text-white/40">
            {dayjs(trip.startDate).format('D MMM')} - {dayjs(trip.endDate).format('D MMM YYYY')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {trip.packingList.length > 0 && (
            <Badge tone={packed === trip.packingList.length ? 'ok' : 'default'}>
              {packed}/{trip.packingList.length}
            </Badge>
          )}
          <span className="text-white/30">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 flex flex-col gap-5">
          <Field label="Presupuesto (opcional)">
            <Input
              type="number"
              value={trip.budget ?? ''}
              onChange={(e) => onChange((t) => ({ ...t, budget: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </Field>
          <Field label="Notas">
            <Textarea rows={2} value={trip.notes ?? ''} onChange={(e) => onChange((t) => ({ ...t, notes: e.target.value }))} />
          </Field>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-white/50">Lista de equipaje</p>
            <div className="flex flex-col gap-1">
              {trip.packingList.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <Checkbox checked={p.done} onChange={() => onChange((t) => ({ ...t, packingList: t.packingList.map((x) => (x.id === p.id ? { ...x, done: !x.done } : x)) }))} label={p.label} />
                  <button onClick={() => onChange((t) => ({ ...t, packingList: t.packingList.filter((x) => x.id !== p.id) }))} className="ml-auto text-white/20">
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input placeholder="Agregar ítem" value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addPackingItem()} />
              <Button variant="secondary" onClick={addPackingItem}>
                +
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-white/50">Itinerario</p>
            <div className="flex flex-col gap-1">
              {trip.itinerary.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{it.activity}</span>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>{dayjs(it.date).format('D MMM')}</span>
                    <button onClick={() => onChange((t) => ({ ...t, itinerary: t.itinerary.filter((x) => x.id !== it.id) }))} className="text-white/20">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Input className="col-span-2" placeholder="Actividad" value={itAct} onChange={(e) => setItAct(e.target.value)} />
              <Input type="date" value={itDate} onChange={(e) => setItDate(e.target.value)} />
            </div>
            <Button variant="secondary" className="mt-2 w-full" onClick={addItineraryItem}>
              + Agregar al itinerario
            </Button>
          </div>

          <ReminderEditor value={trip.reminder} onChange={(r) => onChange((t) => ({ ...t, reminder: r }))} mode="anticipation" />

          <Button variant="danger" onClick={onDelete}>
            Eliminar viaje
          </Button>
        </div>
      )}
    </Card>
  )
}
