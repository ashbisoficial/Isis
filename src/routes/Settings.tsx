import { useState } from 'react'
import { Header, Card, Button, Section } from '../components/ui'
import { useAppData } from '../store/DataContext'
import { useAuth, firebaseConfigured } from '../store/AuthContext'
import { requestNotificationPermission } from '../store/useNotificationEngine'
import { exportAppDataJson, importAppDataJson } from '../lib/storage'
import { emptyAppData } from '../lib/types'

export default function Settings() {
  const { data, setData, syncing } = useAppData()
  const { user, signOut } = useAuth()
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )
  const [status, setStatus] = useState<string | null>(null)

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission()
    setPermission(result)
  }

  const handleExport = () => {
    const blob = new Blob([exportAppDataJson(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `isis-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    file.text().then((text) => {
      try {
        setData(importAppDataJson(text))
        setStatus('✅ Datos importados correctamente.')
      } catch {
        setStatus('❌ El archivo no es un backup válido.')
      }
    })
    e.target.value = ''
  }

  const handleReset = () => {
    if (confirm('¿Borrar todos los datos de la app? Esta acción no se puede deshacer.')) {
      setData(emptyAppData())
      setStatus('🗑️ Datos borrados.')
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header title="Ajustes" />
      <div className="flex flex-col gap-6 p-4 pb-8">
        {firebaseConfigured && user && (
          <Section title="Cuenta">
            <Card className="flex flex-col gap-2">
              <p className="text-sm text-white">{user.displayName || user.email}</p>
              {user.displayName && <p className="text-xs text-white/40">{user.email}</p>}
              <p className="text-xs text-white/40">
                {syncing ? '🔄 Sincronizando...' : '✅ Sincronizado — tus datos están disponibles en cualquier dispositivo donde inicies sesión.'}
              </p>
              <Button variant="secondary" onClick={signOut}>
                Cerrar sesión
              </Button>
            </Card>
          </Section>
        )}

        {!firebaseConfigured && (
          <Section title="Cuenta">
            <Card className="text-sm text-white/60">
              Sincronización entre dispositivos no configurada todavía — la app está usando modo local en
              este dispositivo. Configurá las variables <code className="text-white/80">VITE_FIREBASE_*</code>{' '}
              (ver README) para activar cuentas y sincronización.
            </Card>
          </Section>
        )}

        <Section title="Notificaciones">
          <Card className="flex flex-col gap-2">
            <p className="text-sm text-white/70">
              Estado: <b className="text-white">{permission === 'granted' ? 'Activadas' : permission === 'denied' ? 'Bloqueadas' : 'No configuradas'}</b>
            </p>
            {permission !== 'granted' && (
              <Button onClick={handleEnableNotifications}>Activar notificaciones</Button>
            )}
            <p className="text-xs leading-relaxed text-white/40">
              Los recordatorios funcionan mientras la app esté abierta (o instalada y minimizada, según tu
              dispositivo). Los navegadores no permiten programar notificaciones que despierten el
              dispositivo con la app completamente cerrada — para eso hace falta la versión nativa (fase 2).
            </p>
          </Card>
        </Section>

        <Section title="Widget de pantalla de inicio">
          <Card className="flex flex-col gap-2 text-sm text-white/70">
            <p>
              Esta app es una PWA: no puede crear un widget nativo de Android/iOS. Como alternativa, instalá
              la app y usá el atajo <b>"Widget de hoy"</b> (mantené presionado el ícono instalado) para
              acceder directo a la vista compacta de pendientes de hoy, o agregala como acceso directo.
            </p>
          </Card>
        </Section>

        <Section title="Mis datos">
          <Card className="flex flex-col gap-2">
            <p className="text-xs text-white/40">
              {firebaseConfigured && user
                ? 'Tus datos viven en tu cuenta. Igual conviene tener un backup propio de vez en cuando.'
                : 'Todo se guarda solo en este dispositivo. Hacé backup para no perder tu información.'}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleExport} className="flex-1">
                Exportar backup
              </Button>
              <label className="flex-1">
                <span className="block cursor-pointer rounded-xl bg-white/10 px-4 py-2.5 text-center text-sm font-medium text-white active:bg-white/20">
                  Importar backup
                </span>
                <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
              </label>
            </div>
            <Button variant="danger" onClick={handleReset}>
              Borrar todos los datos
            </Button>
            {status && <p className="text-xs text-white/60">{status}</p>}
          </Card>
        </Section>
      </div>
    </div>
  )
}
