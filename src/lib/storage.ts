import { emptyAppData, type AppData } from './types'

const STORAGE_KEY = 'isis-app-data-v1'

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyAppData()
    const parsed = JSON.parse(raw)
    // merge con default para tolerar campos nuevos agregados en actualizaciones
    return { ...emptyAppData(), ...parsed }
  } catch {
    return emptyAppData()
  }
}

export function saveAppData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportAppDataJson(data: AppData): string {
  return JSON.stringify(data, null, 2)
}

export function importAppDataJson(json: string): AppData {
  const parsed = JSON.parse(json)
  return { ...emptyAppData(), ...parsed }
}
