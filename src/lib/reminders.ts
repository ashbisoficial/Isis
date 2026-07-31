import dayjs from 'dayjs'
import type { AppData, DueReminder, ReminderConfig } from './types'

const WEEKDAY_LABEL = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

function withinWindow(now: dayjs.Dayjs, reminder: ReminderConfig): boolean {
  if (!reminder.windowStart || !reminder.windowEnd) return true
  const nowMinutes = now.hour() * 60 + now.minute()
  const [sh, sm] = reminder.windowStart.split(':').map(Number)
  const [eh, em] = reminder.windowEnd.split(':').map(Number)
  const start = sh * 60 + sm
  const end = eh * 60 + em
  return nowMinutes >= start && nowMinutes <= end
}

/** Notificaciones que corresponde disparar AHORA (para push del navegador). */
export function getDueNotifications(
  data: AppData,
  now: dayjs.Dayjs,
  lastFiredAt: (key: string) => string | undefined
): { key: string; title: string; body: string }[] {
  const out: { key: string; title: string; body: string }[] = []
  const today = now.format('YYYY-MM-DD')

  const checkAnticipation = (
    reminder: ReminderConfig,
    itemId: string,
    dueDate: string | undefined,
    title: string,
    body: string
  ) => {
    if (!reminder.enabled || !dueDate) return
    for (const offset of reminder.anticipationDays ?? []) {
      const target = dayjs(dueDate).subtract(offset, 'day').format('YYYY-MM-DD')
      if (target === today) {
        const key = `${itemId}:antic:${offset}`
        if (lastFiredAt(key) !== today && withinWindow(now, reminder)) {
          out.push({ key, title, body })
        }
      }
    }
  }

  const checkRepeat = (reminder: ReminderConfig, itemId: string, title: string, body: string, done: boolean) => {
    if (!reminder.enabled || !reminder.repeatUntilDone || done) return
    if (!withinWindow(now, reminder)) return
    const every = reminder.repeatEveryHours ?? 4
    const last = lastFiredAt(itemId)
    if (!last || now.diff(dayjs(last), 'hour', true) >= every) {
      out.push({ key: itemId, title, body })
    }
  }

  for (const s of data.education.subjects) {
    for (const ev of s.evaluations) {
      checkAnticipation(ev.reminder, ev.id, ev.date, `📚 ${s.name}: ${ev.name}`, `Ponderación ${ev.weight}% — ${dayjs(ev.date).format('D MMM')}`)
    }
    for (const t of s.tasks) {
      checkAnticipation(t.reminder, t.id, t.dueDate, `📝 ${s.name}: ${t.title}`, t.dueDate ? `Vence ${dayjs(t.dueDate).format('D MMM')}` : '')
    }
  }

  for (const c of data.chores.chores) {
    checkRepeat(c.reminder, c.id, c.category === 'hogar' ? '🏠 Deber del hogar' : '✅ Deber', c.title, c.done)
  }

  for (const h of data.hobbies.hobbies) {
    if (h.weekday === now.day() && h.time) {
      const key = `${h.id}:${today}`
      if (h.reminder.enabled && lastFiredAt(key) !== today) {
        const [hh, mm] = h.time.split(':').map(Number)
        const target = now.hour(hh).minute(mm)
        if (Math.abs(now.diff(target, 'minute')) <= 5) {
          out.push({ key, title: `🎨 ${h.name}`, body: `Hoy a las ${h.time}` })
        }
      }
    }
  }

  for (const m of data.nutrition.meals) {
    if (m.weekday === now.day() && m.time) {
      const key = `${m.id}:${today}`
      if (m.reminder.enabled && lastFiredAt(key) !== today) {
        const [hh, mm] = m.time.split(':').map(Number)
        const target = now.hour(hh).minute(mm)
        if (Math.abs(now.diff(target, 'minute')) <= 5) {
          out.push({ key, title: `🍽️ ${m.name}`, body: `Hoy a las ${m.time}` })
        }
      }
    }
  }

  for (const trip of data.travel.trips) {
    checkAnticipation(trip.reminder, trip.id, trip.startDate, `✈️ Viaje a ${trip.destination}`, `Sale ${dayjs(trip.startDate).format('D MMM')}`)
  }

  return out
}

/** Agenda de hoy, para el dashboard y el widget. */
export function getAgendaToday(data: AppData): DueReminder[] {
  const today = dayjs()
  const todayStr = today.format('YYYY-MM-DD')
  const items: DueReminder[] = []

  for (const s of data.education.subjects) {
    for (const ev of s.evaluations) {
      if (ev.date === todayStr && !ev.done) {
        items.push({ key: `ev-${ev.id}`, itemId: ev.id, module: 'educacion', title: `${s.name}: ${ev.name}`, detail: `Ponderación ${ev.weight}%`, dueDate: ev.date, severity: 'urgente', href: '/educacion' })
      }
    }
    for (const t of s.tasks) {
      if (t.dueDate === todayStr && !t.done) {
        items.push({ key: `task-${t.id}`, itemId: t.id, module: 'educacion', title: `${s.name}: ${t.title}`, detail: 'Vence hoy', dueDate: t.dueDate, severity: 'urgente', href: '/educacion' })
      }
    }
  }

  for (const c of data.chores.chores) {
    if (!c.done) {
      items.push({ key: `chore-${c.id}`, itemId: c.id, module: 'deberes', title: c.title, detail: c.category === 'hogar' ? 'Hogar' : 'Externo', severity: 'info', href: '/deberes' })
    }
  }

  for (const h of data.hobbies.hobbies) {
    if (h.weekday === today.day()) {
      items.push({ key: `hobby-${h.id}`, itemId: h.id, module: 'hobbies', title: h.name, detail: h.time ? `Hoy ${h.time}` : `Hoy (${WEEKDAY_LABEL[h.weekday]})`, severity: 'info', href: '/hobbies' })
    }
  }

  for (const m of data.nutrition.meals) {
    if (m.weekday === today.day()) {
      items.push({ key: `meal-${m.id}`, itemId: m.id, module: 'alimentacion', title: m.name, detail: `Hoy ${m.time}`, severity: 'info', href: '/alimentacion' })
    }
  }

  for (const t of data.training.schedule) {
    if (t.weekday === today.day()) {
      items.push({ key: `train-${t.id}`, itemId: t.id, module: 'entrenamiento', title: t.label || 'Entrenamiento', detail: `${t.startTime} - ${t.endTime}`, severity: 'info', href: '/entrenamiento' })
    }
  }

  for (const trip of data.travel.trips) {
    if (trip.startDate === todayStr) {
      items.push({ key: `trip-${trip.id}`, itemId: trip.id, module: 'viajes', title: `Viaje a ${trip.destination}`, detail: '¡Empieza hoy!', dueDate: trip.startDate, severity: 'urgente', href: '/viajes' })
    }
  }

  return items
}

/** Próximos eventos (evaluaciones, tareas, viajes) en los próximos N días. */
export function getUpcoming(data: AppData, days = 14): DueReminder[] {
  const today = dayjs().startOf('day')
  const limit = today.add(days, 'day')
  const items: DueReminder[] = []

  for (const s of data.education.subjects) {
    for (const ev of s.evaluations) {
      const d = dayjs(ev.date)
      if (!ev.done && d.isAfter(today.subtract(1, 'day')) && d.isBefore(limit)) {
        items.push({ key: `ev-${ev.id}`, itemId: ev.id, module: 'educacion', title: `${s.name}: ${ev.name}`, detail: `Ponderación ${ev.weight}%`, dueDate: ev.date, severity: d.diff(today, 'day') <= 2 ? 'urgente' : 'info', href: '/educacion' })
      }
    }
    for (const t of s.tasks) {
      if (!t.dueDate || t.done) continue
      const d = dayjs(t.dueDate)
      if (d.isAfter(today.subtract(1, 'day')) && d.isBefore(limit)) {
        items.push({ key: `task-${t.id}`, itemId: t.id, module: 'educacion', title: `${s.name}: ${t.title}`, detail: 'Tarea', dueDate: t.dueDate, severity: d.diff(today, 'day') <= 1 ? 'urgente' : 'info', href: '/educacion' })
      }
    }
  }

  for (const trip of data.travel.trips) {
    const d = dayjs(trip.startDate)
    if (d.isAfter(today.subtract(1, 'day')) && d.isBefore(limit)) {
      items.push({ key: `trip-${trip.id}`, itemId: trip.id, module: 'viajes', title: `Viaje a ${trip.destination}`, detail: d.format('D MMM'), dueDate: trip.startDate, severity: 'info', href: '/viajes' })
    }
  }

  return items.sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
}
