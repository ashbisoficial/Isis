import { Link } from 'react-router-dom'
import { useAppData } from '../store/DataContext'
import { getAgendaToday, getUpcoming } from '../lib/reminders'
import { IconTile, Card, Badge } from '../components/ui'
import dayjs from 'dayjs'

const TILES = [
  { to: '/educacion', emoji: '📚', label: 'Educación', color: '#3730a3' },
  { to: '/entrenamiento', emoji: '🏋️', label: 'Entrenamiento', color: '#9a3412' },
  { to: '/alimentacion', emoji: '🥗', label: 'Alimentación', color: '#166534' },
  { to: '/hobbies', emoji: '🎨', label: 'Hobbies', color: '#a21caf' },
  { to: '/deberes', emoji: '✅', label: 'Deberes', color: '#1d4ed8' },
  { to: '/viajes', emoji: '✈️', label: 'Viajes', color: '#0e7490' },
]

export default function Home() {
  const { data } = useAppData()
  const today = getAgendaToday(data)
  const upcoming = getUpcoming(data, 14).slice(0, 5)

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pb-8">
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-sm text-white/50">{dayjs().format('dddd D [de] MMMM')}</p>
          <h1 className="text-2xl font-bold text-white">Hola 👋</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/widget" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg" aria-label="Widget de hoy">
            🔳
          </Link>
          <Link to="/ajustes" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg" aria-label="Ajustes">
            ⚙️
          </Link>
        </div>
      </div>

      {today.length > 0 && (
        <Card className="!bg-violet-500/10 !border-violet-400/30">
          <p className="mb-2 text-sm font-semibold text-white">Hoy</p>
          <ul className="flex flex-col gap-1.5">
            {today.map((item) => (
              <li key={item.key}>
                <Link to={item.href} className="flex items-center justify-between gap-2 text-sm text-white/80">
                  <span className="truncate">{item.title}</span>
                  <Badge tone={item.severity === 'urgente' ? 'urgent' : 'default'}>{item.detail}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        {TILES.map((t) => (
          <IconTile key={t.to} {...t} />
        ))}
      </div>

      {upcoming.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-semibold text-white">Próximamente</p>
          <ul className="flex flex-col gap-2">
            {upcoming.map((item) => (
              <li key={item.key}>
                <Link to={item.href} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-white/80">{item.title}</span>
                  <span className="shrink-0 text-xs text-white/40">{dayjs(item.dueDate).format('D MMM')}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
