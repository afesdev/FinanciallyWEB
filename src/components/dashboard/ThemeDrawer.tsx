import { useEffect, useMemo } from 'react'
import { useTheme } from '../../context/ThemeContext'

type ThemeDrawerProps = {
  open: boolean
  onClose: () => void
}

const SIDEBAR_COLORS: { name: string; value: string }[] = [
  { name: 'Slate', value: '#0f172a' }, // slate-900
  { name: 'Zinc', value: '#18181b' }, // zinc-900
  { name: 'Emerald', value: '#064e3b' }, // emerald-950-ish
  { name: 'Indigo', value: '#1e1b4b' }, // indigo-950
  { name: 'Violet', value: '#2e1065' }, // violet-950
  { name: 'Rose', value: '#4c0519' }, // rose-950
  { name: 'Cyan', value: '#083344' }, // cyan-950
  { name: 'Blanco', value: '#ffffff' }, // blanco
]

export default function ThemeDrawer({ open, onClose }: ThemeDrawerProps) {
  const { mode, setMode, sidebarColor, setSidebarColor } = useTheme()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const selectedName = useMemo(() => {
    return SIDEBAR_COLORS.find((c) => c.value.toLowerCase() === sidebarColor.toLowerCase())?.name ?? 'Personalizado'
  }, [sidebarColor])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Personalización</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">Apariencia</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Cerrar panel"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 p-5">
          {/* Tema */}
          <section>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Modo</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Elige entre modo claro u oscuro.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('light')}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                  mode === 'light'
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                } dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800`}
              >
                <div className="flex items-center justify-between">
                  <span>Claro</span>
                  <span className="text-lg">☀</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMode('dark')}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                  mode === 'dark'
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                } dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800`}
              >
                <div className="flex items-center justify-between">
                  <span>Oscuro</span>
                  <span className="text-lg">🌙</span>
                </div>
              </button>
            </div>
          </section>

          {/* Sidebar */}
          <section>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Color del sidebar</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Seleccionado: <span className="font-semibold">{selectedName}</span>
            </p>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {SIDEBAR_COLORS.map((c) => {
                const selected = c.value.toLowerCase() === sidebarColor.toLowerCase()
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSidebarColor(c.value)}
                    className={`relative h-10 rounded-xl ring-1 transition-all ${
                      selected ? 'ring-emerald-400 ring-2' : 'ring-slate-200 hover:ring-slate-300'
                    } dark:ring-slate-700 dark:hover:ring-slate-600`}
                    style={{ backgroundColor: c.value }}
                    aria-label={`Color ${c.name}`}
                    title={c.name}
                  >
                    {selected && (
                      <span className="absolute inset-0 flex items-center justify-center text-white">
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}

