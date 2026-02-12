import { useState } from 'react'
import { Icons } from './Icons'
import { getGreeting, getFormattedDate } from '../../utils/format'
import ThemeDrawer from './ThemeDrawer'

type NavbarProps = {
  nombre: string
  email?: string
  onOpenSidebar: () => void
}

export default function Navbar({ nombre, email, onOpenSidebar }: NavbarProps) {
  const hour = new Date().getHours()
  const isDay = hour >= 6 && hour < 18
  const [themeOpen, setThemeOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-xl lg:px-8 dark:border-slate-900 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {Icons.menu}
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            <span className="inline-flex items-center gap-2">
              <span>
                {getGreeting()}, {nombre.split(' ')[0]}
              </span>
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${
                  isDay ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}
                aria-label={isDay ? 'Día' : 'Noche'}
                title={isDay ? 'Día' : 'Noche'}
              >
                {isDay ? (
                  // Sol
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                ) : (
                  // Luna
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a7 7 0 1 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                )}
              </span>
            </span>
          </h1>
          <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{getFormattedDate()}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Botón de personalización */}
        <button
          type="button"
          onClick={() => setThemeOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          title="Personalizar"
          aria-label="Personalizar"
        >
          <span className="text-base">⚙</span>
          <span className="hidden sm:inline">Tema</span>
        </button>
        <div className="hidden h-9 w-px bg-slate-200 sm:block dark:bg-slate-800" />
        <div className="hidden items-center gap-2.5 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-sm font-bold text-white">
            {nombre.charAt(0).toUpperCase()}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{nombre}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-400">{email}</p>
          </div>
        </div>
      </div>
      </header>

      <ThemeDrawer open={themeOpen} onClose={() => setThemeOpen(false)} />
    </>
  )
}
