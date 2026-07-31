import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { useAppData } from '../store/DataContext'
import { getAgendaToday, getUpcoming } from '../lib/reminders'
import { Badge, EmptyState } from '../components/ui'

/**
 * Vista compacta pensada para abrirse rápido (atajo instalado en la pantalla
 * de inicio) a modo de "widget". Los navegadores no permiten widgets nativos
 * reales de sistema operativo, esta es la alternativa más cercana en web.
 */
export default function Widget() {
  const { data } = useAppData()
  const today = getAgendaToday(data)
  const upcoming = getUpcoming(data, 7).filter((u) => !today.some((t) => t.itemId === u.itemId))

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50">{dayjs().format('dddd D MMM')}</p>
          <h1 className="text-lg font-bold text-white">Pendientes de hoy</h1>
        </div>
        <Link to="/" className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/70">
          Abrir app
        </Link>
      </div>

      {today.length === 0 ? (
        <EmptyState text="Nada pendiente por hoy 🎉" />
      ) : (
        <ul className="flex flex-col gap-2">
          {today.map((item) => (
            <li key={item.key}>
              <Link to={item.href} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="truncate text-sm text-white">{item.title}</span>
                <Badge tone={item.severity === 'urgente' ? 'urgent' : 'default'}>{item.detail}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {upcoming.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Esta semana</p>
          <ul className="flex flex-col gap-2">
            {upcoming.map((item) => (
              <li key={item.key}>
                <Link to={item.href} className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-sm">
                  <span className="truncate text-white/70">{item.title}</span>
                  <span className="shrink-0 text-xs text-white/40">{dayjs(item.dueDate).format('D MMM')}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
