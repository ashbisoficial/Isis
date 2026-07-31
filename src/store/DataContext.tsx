import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react'
import { db } from '../lib/firebase'
import { loadAppData, saveAppData } from '../lib/storage'
import { emptyAppData, type AppData } from '../lib/types'
import { useAuth } from './AuthContext'

type DataContextValue = {
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
  syncing: boolean
}

const DataContext = createContext<DataContextValue | null>(null)

const WRITE_DEBOUNCE_MS = 600

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [data, setData] = useState<AppData>(() => loadAppData())
  const [ready, setReady] = useState(!db || !uid)
  const skipNextWrite = useRef(false)
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Suscripción en vivo al documento del usuario (sincroniza celular/tablet/PC).
  useEffect(() => {
    if (!db || !uid) {
      setReady(true)
      return
    }
    setReady(false)
    const ref = doc(db, 'users', uid)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        skipNextWrite.current = true
        setData(snap.exists() ? { ...emptyAppData(), ...snap.data() } : emptyAppData())
        setReady(true)
      },
      (err) => {
        console.error('Error sincronizando con Firestore:', err)
        setReady(true)
      }
    )
    return unsub
  }, [uid])

  // Backup local (funciona incluso sin cuenta configurada).
  useEffect(() => {
    saveAppData(data)
  }, [data])

  // Sincroniza los cambios locales a Firestore, con debounce para no escribir en cada tecla.
  useEffect(() => {
    const firestore = db
    if (!firestore || !uid) return
    if (skipNextWrite.current) {
      skipNextWrite.current = false
      return
    }
    if (writeTimer.current) clearTimeout(writeTimer.current)
    writeTimer.current = setTimeout(() => {
      setDoc(doc(firestore, 'users', uid), data).catch((err) => console.error('Error guardando en Firestore:', err))
    }, WRITE_DEBOUNCE_MS)
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current)
    }
  }, [data, uid])

  const value = useMemo(() => ({ data, setData, syncing: !ready }), [data, ready])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useAppData debe usarse dentro de <DataProvider>')
  return ctx
}
