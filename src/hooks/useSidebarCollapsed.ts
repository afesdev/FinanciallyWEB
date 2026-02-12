import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'financially_sidebar_collapsed'

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'false')
    } catch {
      return false
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed))
  }, [collapsed])

  const toggle = useCallback(() => {
    setCollapsed((prev: boolean) => !prev)
  }, [])

  return { collapsed, toggle, setCollapsed }
}
