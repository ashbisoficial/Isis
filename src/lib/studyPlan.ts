import dayjs from 'dayjs'
import type { EducationData, StudyPlanSession, Subject } from './types'

export type StudyPlanOptions = {
  dailyMinutes: number
  horizonDays: number
}

export const defaultStudyPlanOptions: StudyPlanOptions = {
  dailyMinutes: 120,
  horizonDays: 14,
}

type SubjectScore = {
  subject: Subject
  nearestEvalDate: dayjs.Dayjs
  nearestEvalName: string
  daysLeft: number
  weightScore: number
  score: number
}

/**
 * Genera un plan de estudio distribuyendo el tiempo diario disponible entre
 * las asignaturas con evaluaciones próximas, priorizando las de mayor
 * ponderación, mayor urgencia (fecha más cercana) y los temas marcados
 * como "alta prioridad" dentro de cada asignatura.
 */
export function generateStudyPlan(education: EducationData, options: StudyPlanOptions = defaultStudyPlanOptions): StudyPlanSession[] {
  const today = dayjs().startOf('day')
  const horizonEnd = today.add(options.horizonDays, 'day')

  const scores: SubjectScore[] = []
  for (const subject of education.subjects) {
    const upcoming = subject.evaluations
      .filter((e) => !e.done && dayjs(e.date).isAfter(today.subtract(1, 'day')))
      .sort((a, b) => a.date.localeCompare(b.date))
    if (upcoming.length === 0) continue

    const nearest = upcoming[0]
    const nearestEvalDate = dayjs(nearest.date)
    const daysLeft = Math.max(1, nearestEvalDate.diff(today, 'day'))
    const totalWeight = upcoming.reduce((sum, e) => sum + e.weight, 0)
    const urgency = 1 / daysLeft
    const priorityTopicBoost = 1 + subject.topics.filter((t) => t.priority === 'alta' && !t.done).length * 0.15

    scores.push({
      subject,
      nearestEvalDate,
      nearestEvalName: nearest.name,
      daysLeft,
      weightScore: totalWeight,
      score: totalWeight * urgency * priorityTopicBoost,
    })
  }

  if (scores.length === 0) return []

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
  const sessions: StudyPlanSession[] = []

  for (let d = 0; today.add(d, 'day').isBefore(horizonEnd); d++) {
    const date = today.add(d, 'day')
    const dateStr = date.format('YYYY-MM-DD')

    for (const s of scores) {
      if (date.isAfter(s.nearestEvalDate.subtract(0, 'day'))) continue // no seguir estudiando después de rendir
      const share = s.score / totalScore
      const minutesToday = Math.round(options.dailyMinutes * share)
      if (minutesToday < 15) continue

      const pendingTopics = s.subject.topics.filter((t) => !t.done)
      const orderedTopics = [
        ...pendingTopics.filter((t) => t.priority === 'alta'),
        ...pendingTopics.filter((t) => t.priority !== 'alta'),
      ]

      if (orderedTopics.length === 0) {
        sessions.push({
          date: dateStr,
          subjectId: s.subject.id,
          subjectName: s.subject.name,
          evaluationId: undefined,
          evaluationName: s.nearestEvalName,
          minutes: minutesToday,
          reason: `Repaso general — evaluación "${s.nearestEvalName}" (${s.weightScore}% de la nota) en ${s.nearestEvalDate.diff(date, 'day')} días`,
        })
        continue
      }

      // Rotar qué tema toca cada día según el índice del día, priorizando los de alta prioridad
      const topic = orderedTopics[d % orderedTopics.length]
      sessions.push({
        date: dateStr,
        subjectId: s.subject.id,
        subjectName: s.subject.name,
        topicId: topic.id,
        topicTitle: topic.title,
        evaluationName: s.nearestEvalName,
        minutes: minutesToday,
        reason: topic.priority === 'alta'
          ? `Tema prioritario — evaluación "${s.nearestEvalName}" (${s.weightScore}% de la nota)`
          : `Evaluación "${s.nearestEvalName}" (${s.weightScore}% de la nota) en ${s.nearestEvalDate.diff(date, 'day')} días`,
      })
    }
  }

  return sessions
}
