import { useState } from 'react'
import dayjs from 'dayjs'
import { useAppData } from '../store/DataContext'
import { newId } from '../lib/id'
import type { Evaluation, StudyTask, Subject, Topic } from '../lib/types'
import { defaultReminder } from '../lib/types'
import { generateStudyPlan, defaultStudyPlanOptions } from '../lib/studyPlan'
import { Header, Card, Section, Button, Field, Input, Select, Checkbox, EmptyState, Badge } from '../components/ui'
import { ReminderEditor } from '../components/ReminderEditor'

const SUBJECT_COLORS = ['#3730a3', '#166534', '#9a3412', '#a21caf', '#0e7490', '#7c2d12']

export default function Educacion() {
  const { data, setData } = useAppData()
  const { education } = data
  const [addingSemester, setAddingSemester] = useState(false)
  const [newSemesterName, setNewSemesterName] = useState('')
  const [addingSubject, setAddingSubject] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showPlan, setShowPlan] = useState(false)

  const activeSemesterId = education.activeSemesterId ?? education.semesters[0]?.id
  const subjects = education.subjects.filter((s) => s.semesterId === activeSemesterId)

  const updateEducation = (fn: (e: typeof education) => typeof education) => {
    setData((prev) => ({ ...prev, education: fn(prev.education) }))
  }

  const addSemester = () => {
    if (!newSemesterName.trim()) return
    const id = newId()
    updateEducation((e) => ({
      ...e,
      semesters: [...e.semesters, { id, name: newSemesterName.trim() }],
      activeSemesterId: id,
    }))
    setNewSemesterName('')
    setAddingSemester(false)
  }

  const addSubject = () => {
    if (!newSubjectName.trim() || !activeSemesterId) return
    const subject: Subject = {
      id: newId(),
      semesterId: activeSemesterId,
      name: newSubjectName.trim(),
      color: SUBJECT_COLORS[education.subjects.length % SUBJECT_COLORS.length],
      topics: [],
      evaluations: [],
      tasks: [],
    }
    updateEducation((e) => ({ ...e, subjects: [...e.subjects, subject] }))
    setNewSubjectName('')
    setAddingSubject(false)
    setExpandedId(subject.id)
  }

  const updateSubject = (id: string, fn: (s: Subject) => Subject) => {
    updateEducation((e) => ({ ...e, subjects: e.subjects.map((s) => (s.id === id ? fn(s) : s)) }))
  }

  const deleteSubject = (id: string) => {
    if (!confirm('¿Eliminar esta asignatura y todo su contenido?')) return
    updateEducation((e) => ({ ...e, subjects: e.subjects.filter((s) => s.id !== id) }))
  }

  const plan = showPlan ? generateStudyPlan(education, defaultStudyPlanOptions) : []
  const planByDate = groupBy(plan, (p) => p.date)

  return (
    <div className="flex flex-1 flex-col">
      <Header title="Educación" subtitle={education.semesters.find((s) => s.id === activeSemesterId)?.name} />
      <div className="flex flex-col gap-5 p-4 pb-10">
        <Section
          title="Semestre"
          action={
            <button onClick={() => setAddingSemester((v) => !v)} className="text-xs text-violet-300">
              + Nuevo semestre
            </button>
          }
        >
          {education.semesters.length === 0 && !addingSemester ? (
            <EmptyState text="Todavía no creaste un semestre. Agrega uno para empezar." />
          ) : (
            <Select
              value={activeSemesterId ?? ''}
              onChange={(e) => updateEducation((ed) => ({ ...ed, activeSemesterId: e.target.value }))}
            >
              {education.semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          )}
          {addingSemester && (
            <div className="flex gap-2">
              <Input
                autoFocus
                placeholder="Ej: 2026 - Semestre 1"
                value={newSemesterName}
                onChange={(e) => setNewSemesterName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSemester()}
              />
              <Button onClick={addSemester}>Crear</Button>
            </div>
          )}
        </Section>

        {activeSemesterId && (
          <>
            <Section
              title="Asignaturas"
              action={
                <button onClick={() => setAddingSubject((v) => !v)} className="text-xs text-violet-300">
                  + Agregar
                </button>
              }
            >
              {addingSubject && (
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    placeholder="Nombre de la asignatura"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                  />
                  <Button onClick={addSubject}>Crear</Button>
                </div>
              )}

              {subjects.length === 0 && !addingSubject ? (
                <EmptyState text="Agrega tus asignaturas de este semestre." />
              ) : (
                <div className="flex flex-col gap-3">
                  {subjects.map((s) => (
                    <SubjectCard
                      key={s.id}
                      subject={s}
                      expanded={expandedId === s.id}
                      onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                      onChange={(fn) => updateSubject(s.id, fn)}
                      onDelete={() => deleteSubject(s.id)}
                    />
                  ))}
                </div>
              )}
            </Section>

            <Section
              title="Plan de estudio personalizado"
              action={
                <button onClick={() => setShowPlan((v) => !v)} className="text-xs text-violet-300">
                  {showPlan ? 'Ocultar' : 'Generar'}
                </button>
              }
            >
              {showPlan && (
                plan.length === 0 ? (
                  <EmptyState text="Agrega evaluaciones con fecha a tus asignaturas para generar un plan." />
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-white/40">
                      Distribuido según ponderación de evaluaciones, cercanía de la fecha y temas marcados como prioritarios.
                    </p>
                    {Object.entries(planByDate).map(([date, sessions]) => (
                      <Card key={date}>
                        <p className="mb-2 text-sm font-semibold text-white">{dayjs(date).format('dddd D MMM')}</p>
                        <ul className="flex flex-col gap-2">
                          {sessions.map((s, i) => (
                            <li key={i} className="text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-white/90">{s.subjectName}{s.topicTitle ? ` · ${s.topicTitle}` : ''}</span>
                                <Badge>{s.minutes} min</Badge>
                              </div>
                              <p className="text-xs text-white/40">{s.reason}</p>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}
                  </div>
                )
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  )
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const k = key(item)
    ;(acc[k] ??= []).push(item)
    return acc
  }, {} as Record<string, T[]>)
}

function SubjectCard({
  subject,
  expanded,
  onToggle,
  onChange,
  onDelete,
}: {
  subject: Subject
  expanded: boolean
  onToggle: () => void
  onChange: (fn: (s: Subject) => Subject) => void
  onDelete: () => void
}) {
  const [newTopic, setNewTopic] = useState('')
  const [showEvalForm, setShowEvalForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)

  const totalWeight = subject.evaluations.reduce((sum, e) => sum + e.weight, 0)

  const addTopic = () => {
    if (!newTopic.trim()) return
    const topic: Topic = { id: newId(), title: newTopic.trim(), priority: 'normal', done: false }
    onChange((s) => ({ ...s, topics: [...s.topics, topic] }))
    setNewTopic('')
  }

  return (
    <Card>
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-2 text-left">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: subject.color }} />
          <span className="truncate font-medium text-white">{subject.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {totalWeight > 0 && <Badge tone={totalWeight === 100 ? 'ok' : 'default'}>{totalWeight}%</Badge>}
          <span className="text-white/40">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 flex flex-col gap-5">
          <Field label="Profesor (opcional)">
            <Input
              value={subject.professor ?? ''}
              onChange={(e) => onChange((s) => ({ ...s, professor: e.target.value }))}
              placeholder="Nombre del profesor"
            />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-white/50">Temario</p>
              <p className="text-[11px] text-white/30">Marca los temas a los que hay que dedicar más tiempo</p>
            </div>
            <div className="flex flex-col gap-1">
              {subject.topics.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={t.done}
                    onChange={() =>
                      onChange((s) => ({ ...s, topics: s.topics.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)) }))
                    }
                    label={t.title}
                  />
                  <button
                    onClick={() =>
                      onChange((s) => ({
                        ...s,
                        topics: s.topics.map((x) => (x.id === t.id ? { ...x, priority: x.priority === 'alta' ? 'normal' : 'alta' } : x)),
                      }))
                    }
                    className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] ${t.priority === 'alta' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-white/30'}`}
                  >
                    {t.priority === 'alta' ? '⭐ prioritario' : 'marcar prioritario'}
                  </button>
                  <button
                    onClick={() => onChange((s) => ({ ...s, topics: s.topics.filter((x) => x.id !== t.id) }))}
                    className="shrink-0 text-white/20"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Agregar tema del temario"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTopic()}
              />
              <Button variant="secondary" onClick={addTopic}>
                +
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-white/50">Evaluaciones</p>
              <button onClick={() => setShowEvalForm((v) => !v)} className="text-xs text-violet-300">
                + Agregar
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {subject.evaluations.map((ev) => (
                <EvaluationRow
                  key={ev.id}
                  evaluation={ev}
                  onChange={(fn) => onChange((s) => ({ ...s, evaluations: s.evaluations.map((x) => (x.id === ev.id ? fn(x) : x)) }))}
                  onDelete={() => onChange((s) => ({ ...s, evaluations: s.evaluations.filter((x) => x.id !== ev.id) }))}
                />
              ))}
              {showEvalForm && (
                <NewEvaluationForm
                  onAdd={(ev) => {
                    onChange((s) => ({ ...s, evaluations: [...s.evaluations, ev] }))
                    setShowEvalForm(false)
                  }}
                />
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-white/50">Tareas y actividades</p>
              <button onClick={() => setShowTaskForm((v) => !v)} className="text-xs text-violet-300">
                + Agregar
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {subject.tasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onChange={(fn) => onChange((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === t.id ? fn(x) : x)) }))}
                  onDelete={() => onChange((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== t.id) }))}
                />
              ))}
              {showTaskForm && (
                <NewTaskForm
                  onAdd={(t) => {
                    onChange((s) => ({ ...s, tasks: [...s.tasks, t] }))
                    setShowTaskForm(false)
                  }}
                />
              )}
            </div>
          </div>

          <Button variant="danger" onClick={onDelete}>
            Eliminar asignatura
          </Button>
        </div>
      )}
    </Card>
  )
}

function NewEvaluationForm({ onAdd }: { onAdd: (ev: Evaluation) => void }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [weight, setWeight] = useState(20)
  const [type, setType] = useState<Evaluation['type']>('prueba')
  const [reminder, setReminder] = useState(defaultReminder())

  const submit = () => {
    if (!name.trim() || !date) return
    onAdd({ id: newId(), name: name.trim(), date, weight, type, reminder, done: false })
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 p-3">
      <Field label="Nombre">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Prueba 1" />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Fecha">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Ponderación %">
          <Input type="number" min={0} max={100} value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
        </Field>
      </div>
      <Field label="Tipo">
        <Select value={type} onChange={(e) => setType(e.target.value as Evaluation['type'])}>
          <option value="prueba">Prueba</option>
          <option value="examen">Examen</option>
          <option value="trabajo">Trabajo</option>
          <option value="presentacion">Presentación</option>
          <option value="otro">Otro</option>
        </Select>
      </Field>
      <ReminderEditor value={reminder} onChange={setReminder} mode="anticipation" />
      <Button onClick={submit}>Guardar evaluación</Button>
    </div>
  )
}

function EvaluationRow({
  evaluation,
  onChange,
  onDelete,
}: {
  evaluation: Evaluation
  onChange: (fn: (e: Evaluation) => Evaluation) => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-white/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <Checkbox checked={evaluation.done} onChange={() => onChange((e) => ({ ...e, done: !e.done }))} label={evaluation.name} />
        <div className="flex shrink-0 items-center gap-2 text-xs text-white/50">
          <span>{dayjs(evaluation.date).format('D MMM')}</span>
          <Badge>{evaluation.weight}%</Badge>
          <button onClick={() => setOpen((v) => !v)} className="text-white/30">
            {open ? '▲' : '▼'}
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-3 flex flex-col gap-2">
          <ReminderEditor value={evaluation.reminder} onChange={(r) => onChange((e) => ({ ...e, reminder: r }))} mode="anticipation" />
          <Button variant="danger" onClick={onDelete}>
            Eliminar
          </Button>
        </div>
      )}
    </div>
  )
}

function NewTaskForm({ onAdd }: { onAdd: (t: StudyTask) => void }) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [reminder, setReminder] = useState(defaultReminder())

  const submit = () => {
    if (!title.trim()) return
    onAdd({ id: newId(), title: title.trim(), dueDate: dueDate || undefined, done: false, reminder })
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 p-3">
      <Field label="Título">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Guía de ejercicios cap. 3" />
      </Field>
      <Field label="Fecha de entrega (opcional)">
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </Field>
      <ReminderEditor value={reminder} onChange={setReminder} mode="anticipation" />
      <Button onClick={submit}>Guardar tarea</Button>
    </div>
  )
}

function TaskRow({ task, onChange, onDelete }: { task: StudyTask; onChange: (fn: (t: StudyTask) => StudyTask) => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 p-3">
      <Checkbox checked={task.done} onChange={() => onChange((t) => ({ ...t, done: !t.done }))} label={task.title} />
      <div className="flex shrink-0 items-center gap-2 text-xs text-white/50">
        {task.dueDate && <span>{dayjs(task.dueDate).format('D MMM')}</span>}
        <button onClick={onDelete} className="text-white/20">
          ✕
        </button>
      </div>
    </div>
  )
}
