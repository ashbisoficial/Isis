import { createContext, useContext, useEffect, useMemo, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react'
import { loadAppData, saveAppData } from '../lib/storage'
import type { AppData } from '../lib/types'

type DataContextValue = {
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData())

  useEffect(() => {
    saveAppData(data)
  }, [data])

  const value = useMemo(() => ({ data, setData }), [data])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useAppData debe usarse dentro de <DataProvider>')
  return ctx
}
