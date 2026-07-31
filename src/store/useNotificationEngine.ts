import { useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import { useAppData } from './DataContext'
import { getDueNotifications } from '../lib/reminders'

const CHECK_INTERVAL_MS = 60_000

/**
 * Corre en segundo plano MIENTRAS la app está abierta y revisa cada minuto
 * si hay recordatorios que disparar. Los navegadores no permiten programar
 * notificaciones futuras sin un servidor push, así que esto es "mejor
 * esfuerzo": funciona perfecto con la app abierta (o instalada y minimizada
 * en algunos sistemas), pero no despierta al dispositivo si la app está
 * completamente cerrada.
 */
export function useNotificationEngine() {
  const { data, setData } = useAppData()
  const dataRef = useRef(data)
  dataRef.current = data

  useEffect(() => {
    const check = () => {
      const current = dataRef.current
      const lastFiredAt = (key: string) => current.notificationLog.find((n) => n.itemId === key)?.firedAt
      const due = getDueNotifications(current, dayjs(), lastFiredAt)
      if (due.length === 0) return

      const now = dayjs().toISOString()
      for (const item of due) {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            new Notification(item.title, { body: item.body, tag: item.key })
          } catch {
            // algunos navegadores móviles requieren Service Worker registration.showNotification
            navigator.serviceWorker?.getRegistration().then((reg) => {
              reg?.showNotification(item.title, { body: item.body, tag: item.key })
            })
          }
        }
      }

      setData((prev) => ({
        ...prev,
        notificationLog: [
          ...prev.notificationLog.filter((n) => !due.some((d) => d.key === n.itemId)),
          ...due.map((d) => ({ itemId: d.key, firedAt: now })),
        ].slice(-500),
      }))
    }

    check()
    const id = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [setData])
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return Promise.resolve('denied')
  return Notification.requestPermission()
}
