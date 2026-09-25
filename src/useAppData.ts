import { useCallback, useEffect, useState } from 'react'
import type { AppData } from './types'
import { loadData, saveData } from './storage'

/**
 * Holds the app's data and saves it automatically whenever it changes.
 *
 * `saveFailed` is surfaced rather than swallowed: if the browser refuses to
 * store data (private browsing, or blocked site data) the owner needs to know
 * immediately, because their work is not being kept.
 */
export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadData())
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    setSaveFailed(!saveData(data))
  }, [data])

  const update = useCallback((change: (current: AppData) => AppData) => {
    setData(change)
  }, [])

  return { data, update, saveFailed }
}
