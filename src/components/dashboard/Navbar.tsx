import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icons, NAV_ITEMS } from './Icons'
import { getFormattedDate } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import ThemeDrawer from './ThemeDrawer'

type NavbarProps = {
  nombre: string
  email?: string
  onOpenSidebar: () => void
}

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase()
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase()
}

export default function Navbar({ nombre, email, onOpenSidebar }: NavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const { mode, setMode } = useTheme()
  const reduceMotion = useReducedMotion()

  const [themeOpen, setThemeOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const sectionKey = location.pathname.replace('/', '') || 'home'
  const section = NAV_ITEMS.find((item) => item.key === sectionKey)
  const esInicio = sectionKey === 'home'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }

    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [menuOpen])

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <>
      <header
        className={`sticky top-0 z-30 flex items-center justify-between gap-4 px-4 py-3 transition-colors duration-300 lg:px-8 ${
          scrolled
            ? 'border-b border-slate-900/5 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80'
            : 'border-b border-transparent bg-white dark:bg-slate-950'
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onOpenSidebar}
            aria-label="Abrir menú"
            className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {Icons.menu}
          </button>

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-800">
            {section?.icon ?? Icons.home}
          </span>

          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {section?.label ?? 'Financially'}
            </h1>
            {!esInicio && (
              <p className="truncate text-xs capitalize text-slate-400 dark:text-slate-500">
                {getFormattedDate()}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            title={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-4.5 w-4.5"
            >
              {mode === 'dark' ? (
                <>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M6 18l-1.4 1.4M19.4 4.6 18 6" />
                </>
              ) : (
                <path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5a8.5 8.5 0 1 0 10.8 10.8Z" />
              )}
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setThemeOpen(true)}
            title="Personalizar"
            aria-label="Personalizar"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              aria-hidden="true"
              className="h-4.5 w-4.5"
            >
              <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
              <circle cx="15" cy="7" r="2" />
              <circle cx="9" cy="17" r="2" />
            </svg>
          </button>

          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-800" />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
                {iniciales(nombre)}
              </span>
              <span className="hidden text-left lg:block">
                <span className="block max-w-[10rem] truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {nombre}
                </span>
                <span className="block max-w-[10rem] truncate text-[0.7rem] text-slate-400 dark:text-slate-500">
                  {email}
                </span>
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`hidden h-3.5 w-3.5 text-slate-400 transition-transform duration-200 lg:block ${
                  menuOpen ? 'rotate-180' : ''
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : -8, scale: reduceMotion ? 1 : 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -6, scale: reduceMotion ? 1 : 0.97 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-[calc(100%+0.5rem)] w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-900/5 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                      {iniciales(nombre)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {nombre}
                      </p>
                      <p className="truncate text-xs text-slate-400 dark:text-slate-500">{email}</p>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        navigate('/profile')
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                      <span className="text-slate-400">{Icons.user}</span>
                      Mi perfil
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        setThemeOpen(true)
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        aria-hidden="true"
                        className="h-4.5 w-4.5 text-slate-400"
                      >
                        <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
                        <circle cx="15" cy="7" r="2" />
                        <circle cx="9" cy="17" r="2" />
                      </svg>
                      Personalizar
                    </button>
                  </div>

                  <div className="border-t border-slate-100 p-1.5 dark:border-slate-800">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30"
                    >
                      <span className="opacity-70">{Icons.logout}</span>
                      Cerrar sesión
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <ThemeDrawer open={themeOpen} onClose={() => setThemeOpen(false)} />
    </>
  )
}
