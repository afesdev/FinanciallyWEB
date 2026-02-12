import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type ThemeMode = 'light' | 'dark'

type ThemeState = {
  mode: ThemeMode
  sidebarColor: string
}

type ThemeContextValue = ThemeState & {
  setMode: (mode: ThemeMode) => void
  setSidebarColor: (color: string) => void
}

const STORAGE_KEY = 'financially.theme'

const DEFAULT_STATE: ThemeState = {
  mode: 'light',
  sidebarColor: '#0f172a', // slate-900
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function safeParse(json: string | null): Partial<ThemeState> | null {
  if (!json) return null
  try {
    return JSON.parse(json) as Partial<ThemeState>
  } catch {
    return null
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return DEFAULT_STATE.mode
    const stored = safeParse(localStorage.getItem(STORAGE_KEY))
    if (stored?.mode === 'light' || stored?.mode === 'dark') return stored.mode
    return DEFAULT_STATE.mode
  })

  const [sidebarColor, setSidebarColor] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_STATE.sidebarColor
    const stored = safeParse(localStorage.getItem(STORAGE_KEY))
    if (typeof stored?.sidebarColor === 'string' && stored.sidebarColor.trim()) {
      return stored.sidebarColor
    }
    return DEFAULT_STATE.sidebarColor
  })

  // Persist
  useEffect(() => {
    if (typeof window === 'undefined') return
    const next: ThemeState = { mode, sidebarColor }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [mode, sidebarColor])

  // Apply dark class to <html>
  useEffect(() => {
    const root = document.documentElement
    if (mode === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [mode])

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, sidebarColor, setMode, setSidebarColor }),
    [mode, sidebarColor]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return ctx
}

