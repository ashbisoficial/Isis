// ---------- Compartido ----------

export type ReminderConfig = {
  enabled: boolean
  /** Días de anticipación en los que avisar (ej: [14, 7, 1] = avisar 2 semanas, 1 semana y 1 día antes) */
  anticipationDays?: number[]
  /** Repetir varias veces al día hasta marcarlo como hecho */
  repeatUntilDone?: boolean
  /** Cada cuántas horas repetir (si repeatUntilDone) */
  repeatEveryHours?: number
  /** Ventana horaria en la que se permite notificar, formato "HH:mm" */
  windowStart?: string
  windowEnd?: string
}

export const defaultReminder = (): ReminderConfig => ({
  enabled: false,
  anticipationDays: [7, 1],
  repeatUntilDone: false,
  repeatEveryHours: 4,
  windowStart: '09:00',
  windowEnd: '21:00',
})

export type NotificationLogEntry = {
  itemId: string
  firedAt: string // ISO
}

// ---------- Educación ----------

export type Semester = {
  id: string
  name: string
  startDate?: string
  endDate?: string
}

export type TopicPriority = 'normal' | 'alta'

export type Topic = {
  id: string
  title: string
  priority: TopicPriority
  done: boolean
}

export type Evaluation = {
  id: string
  name: string
  date: string // ISO date
  weight: number // ponderación %
  type: 'prueba' | 'examen' | 'trabajo' | 'presentacion' | 'otro'
  reminder: ReminderConfig
  done: boolean
}

export type StudyTask = {
  id: string
  title: string
  dueDate?: string
  done: boolean
  reminder: ReminderConfig
}

export type Subject = {
  id: string
  semesterId: string
  name: string
  professor?: string
  color: string
  topics: Topic[]
  evaluations: Evaluation[]
  tasks: StudyTask[]
}

export type EducationData = {
  semesters: Semester[]
  subjects: Subject[]
  activeSemesterId?: string
}

export type StudyPlanSession = {
  date: string // ISO date
  subjectId: string
  subjectName: string
  topicId?: string
  topicTitle?: string
  evaluationId?: string
  evaluationName?: string
  minutes: number
  reason: string
}

// ---------- Entrenamiento ----------

export type TrainingDay = {
  id: string
  weekday: number // 0=domingo .. 6=sábado
  startTime: string
  endTime: string
  label: string
}

export type Exercise = {
  id: string
  name: string
  sets: number
  reps: string
  weight?: string
  notes?: string
}

export type RoutineDay = {
  id: string
  name: string
  weekday?: number
  exercises: Exercise[]
}

export type BodyLogEntry = {
  id: string
  date: string
  weightKg?: number
  muscleMassKg?: number
  bodyFatPct?: number
  notes?: string
}

export type TrainingData = {
  schedule: TrainingDay[]
  routines: RoutineDay[]
  bodyLog: BodyLogEntry[]
}

// ---------- Alimentación ----------

export type Meal = {
  id: string
  weekday: number
  time: string
  name: string
  notes?: string
  reminder: ReminderConfig
}

export type NutritionGoal = {
  id: string
  label: string
  value: string
}

export type NutritionData = {
  meals: Meal[]
  goals: NutritionGoal[]
}

// ---------- Hobbies ----------

export type Hobby = {
  id: string
  name: string
  weekday?: number
  time?: string
  goal?: string
  notes?: string
  reminder: ReminderConfig
}

export type HobbiesData = {
  hobbies: Hobby[]
}

// ---------- Deberes ----------

export type ChoreCategory = 'hogar' | 'externo'

export type Chore = {
  id: string
  title: string
  category: ChoreCategory
  done: boolean
  dueDate?: string
  recurring?: 'diario' | 'semanal' | 'ninguno'
  reminder: ReminderConfig
}

export type ChoresData = {
  chores: Chore[]
}

// ---------- Viajes ----------

export type PackingItem = {
  id: string
  label: string
  done: boolean
}

export type ItineraryItem = {
  id: string
  date: string
  time?: string
  activity: string
}

export type Trip = {
  id: string
  destination: string
  startDate: string
  endDate: string
  budget?: number
  notes?: string
  packingList: PackingItem[]
  itinerary: ItineraryItem[]
  reminder: ReminderConfig
}

export type TravelData = {
  trips: Trip[]
}

// ---------- Raíz ----------

export type AppData = {
  education: EducationData
  training: TrainingData
  nutrition: NutritionData
  hobbies: HobbiesData
  chores: ChoresData
  travel: TravelData
  notificationLog: NotificationLogEntry[]
}

export const emptyAppData = (): AppData => ({
  education: { semesters: [], subjects: [], activeSemesterId: undefined },
  training: { schedule: [], routines: [], bodyLog: [] },
  nutrition: { meals: [], goals: [] },
  hobbies: { hobbies: [] },
  chores: { chores: [] },
  travel: { trips: [] },
  notificationLog: [],
})

export type DueReminder = {
  key: string
  itemId: string
  module: 'educacion' | 'entrenamiento' | 'alimentacion' | 'hobbies' | 'deberes' | 'viajes'
  title: string
  detail: string
  dueDate?: string
  severity: 'info' | 'urgente'
  href: string
}
