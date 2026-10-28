import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'
import playStoreLogo from '../assets/google-play.svg'

type IconName =
  | 'wallet'
  | 'chart'
  | 'target'
  | 'layers'
  | 'repeat'
  | 'users'
  | 'report'
  | 'check'
  | 'arrow'
  | 'trend'
  | 'bell'
  | 'swap'
  | 'globe'
  | 'phone'
  | 'lock'
  | 'home'
  | 'plus'
  | 'cart'
  | 'profile'

const iconPaths: Record<IconName, ReactNode> = {
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 10.5h18" />
      <circle cx="17" cy="14.75" r="1.1" />
    </>
  ),
  chart: (
    <>
      <path d="M3 20h18" />
      <path d="M6.5 20v-6" />
      <path d="M12 20V5" />
      <path d="M17.5 20v-9" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 8.5 4.75L12 12.5 3.5 7.75 12 3Z" />
      <path d="m3.5 12.75 8.5 4.75 8.5-4.75" />
    </>
  ),
  repeat: (
    <>
      <path d="m17 3 3.5 3.5L17 10" />
      <path d="M3.5 11V9.5a3 3 0 0 1 3-3h14" />
      <path d="m7 21-3.5-3.5L7 14" />
      <path d="M20.5 13v1.5a3 3 0 0 1-3 3h-14" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.4a3.25 3.25 0 0 1 0 5.2" />
      <path d="M18.5 20a5.6 5.6 0 0 0-2.6-4.7" />
    </>
  ),
  report: (
    <>
      <path d="M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 16.5h4" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrow: (
    <>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  trend: (
    <>
      <path d="m4 15 5.5-5.5 3.5 3.5L20 6" />
      <path d="M15 6h5v5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Z" />
      <path d="M10.5 18a1.8 1.8 0 0 0 3 0" />
    </>
  ),
  swap: (
    <>
      <path d="M4 8.5h13" />
      <path d="m13.5 5 3.5 3.5-3.5 3.5" />
      <path d="M20 15.5H7" />
      <path d="M10.5 12 7 15.5l3.5 3.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M3.25 12h17.5" />
      <path d="M12 3.25a13 13 0 0 1 0 17.5 13 13 0 0 1 0-17.5" />
    </>
  ),
  phone: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="3" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  home: (
    <>
      <path d="m3.5 10.5 8.5-6.5 8.5 6.5" />
      <path d="M6 10v10h12V10" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  cart: (
    <>
      <path d="M4 7h16l-1.5 12.5H5.5L4 7Z" />
      <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
}

function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  )
}

function GridOverlay({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:64px_64px] ${className}`}
    />
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-brand-600">
      {children}
    </span>
  )
}

const sidebarItems: { icon: IconName; label: string }[] = [
  { icon: 'home', label: 'Inicio' },
  { icon: 'wallet', label: 'Cuentas' },
  { icon: 'repeat', label: 'Transacciones' },
  { icon: 'chart', label: 'Presupuestos' },
  { icon: 'target', label: 'Metas' },
  { icon: 'users', label: 'Préstamos' },
  { icon: 'layers', label: 'Categorías' },
  { icon: 'report', label: 'Reportes' },
]

const stats = [
  { label: 'Balance', value: '$3.240.000', hint: '+12,4% vs. mayo', accent: true },
  { label: 'Ingresos', value: '$4.100.000', hint: '3 cuentas activas', accent: false },
  { label: 'Gastos', value: '$1.947.300', hint: '76% del presupuesto', accent: false },
]

const movements: { icon: IconName; title: string; meta: string; amount: string; positive?: boolean }[] = [
  { icon: 'cart', title: 'Mercado del mes', meta: 'Bancolombia · 14 jun', amount: '-$482.000' },
  { icon: 'trend', title: 'Nómina', meta: 'Cuenta principal · 30 may', amount: '+$4.100.000', positive: true },
  { icon: 'repeat', title: 'Arriendo (recurrente)', meta: 'Automático · 1 jun', amount: '-$1.150.000' },
]

const trustItems: { icon: IconName; label: string }[] = [
  { icon: 'lock', label: 'Datos cifrados en tránsito' },
  { icon: 'report', label: 'Reportes en PDF por periodo' },
  { icon: 'globe', label: 'Multimoneda por cuenta' },
  { icon: 'phone', label: 'Web y Android sincronizados' },
]

const features: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'wallet',
    title: 'Cuentas ilimitadas',
    text: 'Bancos, efectivo y billeteras digitales en un solo saldo consolidado, con transferencias entre ellas.',
  },
  {
    icon: 'layers',
    title: 'Categorías propias',
    text: 'Clasifica cada movimiento con tus categorías, ícono y color. Sin listas rígidas que no encajan contigo.',
  },
  {
    icon: 'users',
    title: 'Préstamos y cobros',
    text: 'Registra lo que prestas y lo que debes, con abonos parciales y saldo pendiente siempre actualizado.',
  },
  {
    icon: 'repeat',
    title: 'Pagos recurrentes',
    text: 'Arriendo, suscripciones y cuotas se registran solos en la fecha que definas.',
  },
]

const extras: { icon: IconName; label: string }[] = [
  { icon: 'report', label: 'Reportes en PDF' },
  { icon: 'swap', label: 'Transferencias entre cuentas' },
  { icon: 'globe', label: 'Multimoneda' },
  { icon: 'bell', label: 'Alertas de límite' },
  { icon: 'phone', label: 'Web y Android' },
  { icon: 'lock', label: 'Datos cifrados' },
]

const steps = [
  {
    n: '01',
    title: 'Crea tu cuenta',
    text: 'Define tu moneda, tus cuentas principales y las categorías que usas cada día.',
  },
  {
    n: '02',
    title: 'Registra tus movimientos',
    text: 'Ingresos, gastos, metas y deudas. Cada uno con su cuenta y su categoría.',
  },
  {
    n: '03',
    title: 'Ajusta y cumple',
    text: 'Tu panel te muestra si vas por buen camino y qué corregir a tiempo.',
  },
]

const panelChecks = [
  'Balance general del mes',
  'Gasto por categoría',
  'Progreso de metas',
  'Pagos próximos',
]

const appHighlights = [
  'Registro en dos toques desde el botón central',
  'Mismos presupuestos y metas que en la web',
  'Reportes en PDF que puedes compartir al instante',
]

const bars = [
  { label: 'Ene', height: 'h-[74px]', tone: 'bg-brand-100' },
  { label: 'Feb', height: 'h-[96px]', tone: 'bg-brand-200' },
  { label: 'Mar', height: 'h-[62px]', tone: 'bg-brand-100' },
  { label: 'Abr', height: 'h-[114px]', tone: 'bg-brand-300' },
  { label: 'May', height: 'h-[88px]', tone: 'bg-brand-200' },
  { label: 'Jun', height: 'h-[134px]', tone: 'bg-brand-500' },
]

const navItems = [
  { id: 'top', label: 'Inicio' },
  { id: 'features', label: 'Funcionalidades' },
  { id: 'how-it-works', label: 'Cómo funciona' },
  { id: 'app', label: 'App móvil' },
]

function Navbar() {
  const navigate = useNavigate()
  const [active, setActive] = useState('top')
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 8)

      const probe = y + 140
      let current = 'top'
      for (const item of navItems) {
        if (item.id === 'top') continue
        const el = document.getElementById(item.id)
        if (el && el.offsetTop <= probe) current = item.id
      }
      if (y + window.innerHeight >= document.documentElement.scrollHeight - 8) {
        current = navItems[navItems.length - 1].id
      }
      setActive(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const measure = useCallback(() => {
    const el = itemRefs.current[active]
    const list = listRef.current
    if (!el || !list) return
    const item = el.getBoundingClientRect()
    const box = list.getBoundingClientRect()
    setIndicator({ left: item.left - box.left, width: item.width, ready: true })
  }, [active])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure).catch(() => undefined)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const goTo = (id: string) => {
    setOpen(false)
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const solid = scrolled || open

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        solid ? 'border-b border-slate-900/5 bg-white/90 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav
        aria-label="Principal"
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 transition-[padding] duration-300 sm:px-8 ${
          solid ? 'py-2.5' : 'py-4'
        }`}
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            goTo('top')
          }}
          className="flex shrink-0 items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-[0.7rem] transition-colors duration-300 ${
              solid ? 'bg-transparent' : 'bg-white'
            }`}
          >
            <img src={logo} alt="Financially" className="h-7 w-auto" />
          </span>
          <span
            className={`text-base font-bold tracking-tight transition-colors duration-300 ${
              solid ? 'text-slate-900' : 'text-white'
            }`}
          >
            Financially
          </span>
        </a>

        <div
          ref={listRef}
          className={`relative hidden items-center rounded-full p-1 transition-colors duration-300 md:flex ${
            solid ? 'border border-slate-900/5 bg-slate-50/80' : 'border border-white/15 bg-white/10'
          }`}
        >
          <span
            aria-hidden="true"
            className={`absolute inset-y-1 rounded-full transition-all duration-300 ease-out ${
              solid ? 'bg-white shadow-sm ring-1 ring-slate-900/5' : 'bg-white/20'
            } ${indicator.ready ? 'opacity-100' : 'opacity-0'}`}
            style={{ left: indicator.left, width: indicator.width }}
          />
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              ref={(el) => {
                itemRefs.current[item.id] = el
              }}
              aria-current={active === item.id ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault()
                goTo(item.id)
              }}
              className={`relative rounded-full px-4 py-1.5 text-sm transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
                solid
                  ? active === item.id
                    ? 'font-medium text-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                  : active === item.id
                    ? 'font-medium text-white'
                    : 'text-white/75 hover:text-white'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            className={`hidden rounded-full px-4 py-2 text-sm transition-colors sm:inline-flex ${
              solid ? 'text-slate-600 hover:text-slate-900' : 'text-white/85 hover:text-white'
            }`}
            onClick={() => navigate('/login')}
          >
            Entrar
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              solid
                ? 'bg-brand-500 text-white hover:bg-brand-600'
                : 'bg-white text-brand-700 hover:bg-brand-50'
            }`}
            onClick={() => navigate('/register')}
          >
            Crear cuenta
          </button>

          <button
            type="button"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className={`ml-1 flex h-11 w-11 items-center justify-center rounded-xl border transition-colors md:hidden ${
              solid ? 'border-slate-900/10 text-slate-700' : 'border-white/30 text-white'
            }`}
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 block h-px w-full bg-current transition-transform duration-300 ${
                  open ? 'top-1/2 rotate-45' : 'top-0.5'
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-full bg-current transition-transform duration-300 ${
                  open ? 'top-1/2 -rotate-45' : 'top-[calc(100%-2px)]'
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        inert={!open}
        className={`overflow-hidden bg-white transition-all duration-300 ease-out md:hidden ${
          open ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-slate-900/5 px-5 pb-6 pt-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    goTo(item.id)
                  }}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm transition-colors ${
                    active === item.id
                      ? 'bg-brand-50 font-medium text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                  <Icon name="arrow" className="h-4 w-4 opacity-40" />
                </a>
              </li>
            ))}
          </ul>

          <button
            className="mt-4 w-full rounded-full border border-slate-200 py-3.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 sm:hidden"
            onClick={() => {
              setOpen(false)
              navigate('/login')
            }}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </header>
  )
}

function DashboardPreview() {
  return (
    <div className="relative -mt-24 overflow-hidden rounded-3xl border border-slate-900/8 bg-white shadow-[0_40px_90px_-40px_rgba(15,23,42,0.45)] sm:-mt-32 md:-mt-40">
      <div className="grid md:grid-cols-[216px_1fr]">
        <div className="hidden border-r border-slate-900/5 bg-slate-50/70 p-4 md:block">
          <p className="mb-4 ml-2.5 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-500">
            Menú
          </p>
          <div className="flex flex-col gap-0.5">
            {sidebarItems.map((item, i) => (
              <span
                key={item.label}
                className={`flex items-center gap-2.5 rounded-[0.7rem] px-3 py-2.5 text-sm ${
                  i === 0 ? 'bg-brand-500 font-semibold text-white' : 'text-slate-500'
                }`}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">Hola, Andrés</p>
              <p className="mt-1 text-sm text-slate-500">Este es tu resumen de junio</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-[0.8rem] font-semibold text-white">
              <Icon name="plus" className="h-3.5 w-3.5" />
              Nuevo movimiento
            </span>
          </div>

          <div className="mt-5 grid gap-3.5 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-900/7 p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2.5 text-2xl font-bold tracking-tight tabular-nums text-slate-900">
                  {stat.value}
                </p>
                <p
                  className={`mt-2 text-xs ${
                    stat.accent ? 'font-semibold text-brand-600' : 'text-slate-500'
                  }`}
                >
                  {stat.hint}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3.5 grid gap-3.5 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-slate-900/7 p-4">
              <p className="mb-4 text-sm font-semibold text-slate-900">Movimientos recientes</p>
              <div className="flex flex-col gap-3">
                {movements.map((m) => (
                  <div key={m.title} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] bg-brand-50 text-brand-600">
                      <Icon name={m.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 grow">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {m.title}
                      </span>
                      <span className="block text-xs text-slate-500">{m.meta}</span>
                    </span>
                    <span
                      className={`shrink-0 text-sm font-semibold tabular-nums ${
                        m.positive ? 'text-brand-600' : 'text-slate-900'
                      }`}
                    >
                      {m.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-900/7 bg-slate-50/70 p-4">
              <p className="mb-4 text-sm font-semibold text-slate-900">Meta · Viaje</p>
              <div className="flex items-center gap-3.5">
                <svg viewBox="0 0 44 44" className="h-14 w-14 -rotate-90">
                  <circle cx="22" cy="22" r="19" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                  <circle
                    cx="22"
                    cy="22"
                    r="19"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="119.4"
                    strokeDashoffset="26.3"
                    className="text-brand-500"
                  />
                </svg>
                <div>
                  <p className="text-2xl font-bold tracking-tight text-slate-900">78%</p>
                  <p className="mt-0.5 text-xs text-slate-500">$3.900.000 de $5.000.000</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                Te faltan $1.100.000. Al ritmo actual la cumples en septiembre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PhoneMockup() {
  return (
    <div className="w-[300px] rounded-[2.5rem] bg-slate-900 p-2.5 shadow-[0_40px_90px_-40px_rgba(15,23,42,0.6)]">
      <div className="overflow-hidden rounded-[2rem] bg-slate-50">
        <div className="bg-brand-700 px-5 pb-6 pt-14 text-white">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-white/70">Balance total</p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">$3.240.000</p>
          <p className="mt-1.5 text-xs font-semibold text-brand-200">+12,4% frente a mayo</p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-slate-900/7 bg-white p-3.5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Ingresos
              </p>
              <p className="mt-1.5 text-base font-bold tracking-tight tabular-nums">$4.100.000</p>
            </div>
            <div className="rounded-2xl border border-slate-900/7 bg-white p-3.5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Gastos
              </p>
              <p className="mt-1.5 text-base font-bold tracking-tight tabular-nums">$1.947.300</p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-slate-900/7 bg-white p-4">
            <p className="mb-3.5 text-[0.8rem] font-semibold">Últimos movimientos</p>
            <div className="flex flex-col gap-3.5">
              {movements.map((m) => (
                <div key={m.title} className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.6rem] bg-brand-50 text-brand-600">
                    <Icon name={m.icon} className="h-3.5 w-3.5" />
                  </span>
                  <span className="grow truncate text-xs text-slate-900">
                    {m.title.split(' (')[0]}
                  </span>
                  <span
                    className={`shrink-0 text-xs font-semibold tabular-nums ${
                      m.positive ? 'text-brand-600' : 'text-slate-900'
                    }`}
                  >
                    {m.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-slate-900/7 bg-white px-5 py-3.5">
            <Icon name="home" className="h-5 w-5 text-brand-500" />
            <Icon name="chart" className="h-5 w-5 text-slate-400" />
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white">
              <Icon name="plus" className="h-5 w-5" />
            </span>
            <Icon name="target" className="h-5 w-5 text-slate-400" />
            <Icon name="profile" className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 antialiased">
      <div className="relative isolate bg-brand-700 [background-image:radial-gradient(ellipse_70%_90%_at_50%_-10%,#23a85f,rgba(35,168,95,0)_70%)]">
        <GridOverlay />
        <Navbar />

        <section id="top" className="relative scroll-mt-24 px-5 pb-40 pt-10 text-center sm:px-8 sm:pb-48 md:pb-56 md:pt-16">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5">
              <Icon name="check" className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-semibold text-white">
                Gratis para empezar · Web y Android
              </span>
            </span>

            <h1 className="mx-auto mt-7 max-w-4xl text-[2.75rem] font-bold leading-[0.98] tracking-[-0.04em] text-white text-balance sm:text-6xl md:text-[4.9rem]">
              Todo tu dinero, una sola vista.
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/90 text-pretty sm:text-lg">
              Cuentas, gastos, presupuestos, metas y deudas en un mismo lugar. Registras el
              movimiento y el panel te dice, al instante, cómo vas.
            </p>

            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
              <button
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-7 py-4 text-[0.95rem] font-bold text-brand-800 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)] transition-colors hover:bg-brand-50"
                onClick={() => navigate('/register')}
              >
                Empezar gratis
                <Icon
                  name="arrow"
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                />
              </button>
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/35 px-6 py-4 text-[0.95rem] font-semibold text-white transition-colors hover:border-white/60"
              >
                <Icon name="phone" className="h-4 w-4" />
                Descargar para Android
              </a>
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <DashboardPreview />
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-10 sm:px-8 sm:py-11">
        {trustItems.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-600"
          >
            <Icon name={item.icon} className="h-4 w-4 text-brand-500" />
            {item.label}
          </span>
        ))}
      </div>

      <section
        id="features"
        className="scroll-mt-20 border-t border-slate-900/5 px-5 py-20 sm:px-8 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <Eyebrow>Funcionalidades</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold leading-[1.06] tracking-[-0.035em] text-balance sm:text-4xl md:text-[2.9rem]">
              Lo que ves cuando abres la app.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 text-pretty md:text-[1.05rem]">
              Ocho módulos que trabajan sobre los mismos datos: lo que registras en transacciones se
              refleja en presupuestos, metas y reportes sin que muevas un dedo.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-6">
            <article className="rounded-3xl border border-slate-900/7 bg-slate-50/70 p-7 md:col-span-4">
              <div className="flex flex-wrap items-start justify-between gap-8">
                <div className="max-w-xs">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon name="chart" className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold tracking-tight">Panel en tiempo real</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                    Flujo de caja, gasto por categoría y capacidad de ahorro mes a mes. Sin exportar
                    nada, sin armar hojas de cálculo.
                  </p>
                </div>

                <div className="flex h-[172px] items-end gap-3">
                  {bars.map((bar, i) => (
                    <div key={bar.label} className="flex flex-col items-center gap-2.5">
                      <div
                        className={`w-7 origin-bottom animate-grow-bar rounded-t-lg sm:w-8 ${bar.height} ${bar.tone}`}
                        style={{ animationDelay: `${i * 90}ms` }}
                      />
                      <span
                        className={`text-[0.7rem] ${
                          i === bars.length - 1 ? 'font-semibold text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="rounded-3xl bg-slate-900 p-7 text-white md:col-span-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                <Icon name="target" className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl font-bold tracking-tight">Metas y presupuestos</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                Define cuánto ahorrar y cuánto puedes gastar. Te avisamos antes de que te pases, no
                después.
              </p>

              <div className="mt-6 flex items-center gap-4">
                <svg viewBox="0 0 44 44" className="h-16 w-16 -rotate-90">
                  <circle
                    cx="22"
                    cy="22"
                    r="19"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-white/12"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r="19"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="119.4"
                    strokeDashoffset="26.3"
                    className="text-brand-400"
                  />
                </svg>
                <div>
                  <p className="text-3xl font-bold tracking-tight tabular-nums">78%</p>
                  <p className="mt-0.5 text-xs text-slate-400">de tu meta de ahorro</p>
                </div>
              </div>
            </article>

            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-slate-900/7 p-7 transition-colors hover:border-brand-200 hover:bg-brand-50/40 md:col-span-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon name={feature.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight">{feature.title}</h3>
                <p className="mt-2.5 max-w-md text-sm leading-relaxed text-slate-600">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5 rounded-3xl border border-slate-900/7 p-6">
            {extras.map((extra) => (
              <span
                key={extra.label}
                className="inline-flex items-center gap-2.5 rounded-full bg-slate-50 px-4 py-2.5 text-[0.8rem] font-medium text-slate-600"
              >
                <Icon name={extra.icon} className="h-4 w-4 text-brand-500" />
                {extra.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-20 border-y border-slate-900/5 bg-slate-50/70 px-5 py-20 sm:px-8 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-xl">
            <Eyebrow>Cómo funciona</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold leading-[1.06] tracking-[-0.035em] sm:text-4xl md:text-[2.9rem]">
              Tres pasos. Diez minutos.
            </h2>
          </div>

          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((step) => (
              <li key={step.n} className="relative border-t border-slate-900/12 pt-6">
                <span className="absolute -top-px left-0 h-0.5 w-14 bg-brand-500" />
                <span className="text-xs font-bold tracking-[0.2em] text-brand-600">{step.n}</span>
                <p className="mt-4 text-xl font-bold tracking-tight">{step.title}</p>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-11 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {panelChecks.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-slate-900/7 bg-white px-4 py-4"
              >
                <Icon name="check" className="h-4 w-4 shrink-0 text-brand-500" />
                <span className="text-sm text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="app" className="scroll-mt-20 px-5 py-20 sm:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2 md:gap-16">
          <div className="order-2 flex justify-center md:order-1">
            <PhoneMockup />
          </div>

          <div className="order-1 md:order-2">
            <Eyebrow>App móvil</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold leading-[1.06] tracking-[-0.035em] sm:text-4xl md:text-[2.9rem]">
              También en tu bolsillo.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600 text-pretty md:text-[1.05rem]">
              La misma cuenta y los mismos datos. Registra un gasto en el momento en que ocurre y
              revísalo después desde la web, sin volver a escribir nada.
            </p>

            <div className="mt-7 flex flex-col gap-3.5">
              {appHighlights.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Icon name="check" className="h-4 w-4 shrink-0 text-brand-500" />
                  <span className="text-sm text-slate-600">{item}</span>
                </div>
              ))}
            </div>

            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center rounded-2xl border border-slate-200 px-6 py-4 transition-colors hover:border-slate-300"
            >
              <img src={playStoreLogo} alt="Disponible en Google Play" className="h-10 w-auto" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand-700 px-6 py-16 text-center [background-image:radial-gradient(ellipse_60%_100%_at_50%_0%,#23a85f,rgba(35,168,95,0)_70%)] md:px-16 md:py-20">
          <GridOverlay />

          <h2 className="relative mx-auto max-w-2xl text-3xl font-bold leading-[1.06] tracking-[-0.035em] text-white text-balance sm:text-4xl md:text-[2.9rem]">
            Empieza a controlar tu dinero hoy.
          </h2>
          <p className="relative mx-auto mt-5 max-w-md text-base leading-relaxed text-white/85 md:text-[1.05rem]">
            Crea tu cuenta gratis y ten tu primer balance en menos de diez minutos.
          </p>

          <div className="relative mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <button
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-7 py-4 text-[0.95rem] font-bold text-brand-800 transition-colors hover:bg-brand-50"
              onClick={() => navigate('/register')}
            >
              Crear cuenta gratis
              <Icon
                name="arrow"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </button>
            <button
              className="rounded-full border border-white/35 px-7 py-4 text-[0.95rem] font-semibold text-white transition-colors hover:border-white/60"
              onClick={() => navigate('/login')}
            >
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-900/7">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="Financially" className="h-7 w-auto" />
              <span className="text-sm font-bold tracking-tight text-slate-700">Financially</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-slate-600">
              <a href="#features" className="transition-colors hover:text-slate-900">
                Funcionalidades
              </a>
              <a href="#how-it-works" className="transition-colors hover:text-slate-900">
                Cómo funciona
              </a>
              <a href="#app" className="transition-colors hover:text-slate-900">
                App móvil
              </a>
              <button
                className="transition-colors hover:text-slate-900"
                onClick={() => navigate('/login')}
              >
                Iniciar sesión
              </button>
            </div>
          </div>

          <p className="mt-8 border-t border-slate-900/7 pt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Financially. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
