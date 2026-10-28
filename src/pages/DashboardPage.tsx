import { useState, useEffect, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboard, type DashboardResponse } from '../services/api'
import { formatCurrency } from '../utils/format'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { AnimatedCurrency } from '../components/dashboard/StatsCards'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import Swal from 'sweetalert2'

const BRAND = '#1EB256'
const ROSE = '#F43F5E'

type Month = { label: string; value: string }
const MONTHS: Month[] = Array.from({ length: 12 }, (_, i) => {
  const d = new Date()
  d.setMonth(d.getMonth() - i)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const label = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  return { label, value: `${y}-${m}` }
})

function Reveal({ delay = 0, children }: { delay?: number; children: ReactNode }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const reduceMotion = useReducedMotion()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSidebarCollapsed()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0].value)

  const nombre = user?.nombre ?? 'Usuario'
  const moneda = user?.monedaPredeterminada ?? 'COP'

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true)
        const res = await getDashboard(selectedMonth)
        setData(res)
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'No se pudo cargar el dashboard.'
        Swal.fire({ icon: 'error', title: 'Error', text: msg })
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [selectedMonth])

  const handleNavigate = (key: string) => {
    const map: Record<string, string> = {
      home: '/home', accounts: '/accounts', categories: '/categories',
      goals: '/goals', loans: '/loans', budgets: '/budgets',
      transactions: '/transactions', reports: '/reports', profile: '/profile',
      dashboard: '/dashboard',
    }
    navigate(map[key] || '/home')
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const rm = data?.resumen_mensual
  const ingresos = rm?.ingresos ?? 0
  const gastos = rm?.gastos ?? 0
  const balance = rm?.balance ?? 0
  const flujo = ingresos + gastos

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        activeNav="dashboard"
        sidebarOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
        nombre={nombre}
        email={user?.email}
        onNavChange={handleNavigate}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className={`flex min-h-screen flex-1 flex-col transition-[margin] duration-200 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Navbar nombre={nombre} email={user?.email} onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-6 lg:px-8">
          {/* Panel resumen */}
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative isolate mb-6 overflow-hidden rounded-3xl bg-slate-900 p-6 text-white lg:p-7"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top_right,#000,transparent_70%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full blur-3xl"
              style={{ backgroundColor: balance >= 0 ? 'rgba(30,178,86,0.25)' : 'rgba(244,63,94,0.22)' }}
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.02em]">Dashboard</h1>
                <p className="mt-0.5 text-sm text-white/50">Panorama de tus finanzas mes a mes</p>
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium capitalize text-white outline-none ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/15 focus:ring-brand-400"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value} className="text-slate-900">{m.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="relative mt-7 grid gap-5 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/10" />
                ))}
              </div>
            ) : (
              <>
                <div className="relative mt-7 grid gap-5 sm:grid-cols-3">
                  <Kpi label="Ingresos" value={ingresos} moneda={moneda} tone={BRAND} variacion={rm?.variacion_ingresos} goodWhenUp />
                  <Kpi label="Gastos" value={gastos} moneda={moneda} tone={ROSE} variacion={rm?.variacion_gastos} goodWhenUp={false} />
                  <Kpi
                    label="Balance"
                    value={balance}
                    moneda={moneda}
                    tone={balance >= 0 ? BRAND : ROSE}
                    signed
                  />
                </div>

                {flujo > 0 && (
                  <div className="relative mt-6 flex h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <span className="h-full bg-brand-500" style={{ width: `${(ingresos / flujo) * 100}%` }} />
                    <span className="h-full bg-rose-400" style={{ width: `${(gastos / flujo) * 100}%` }} />
                  </div>
                )}
              </>
            )}
          </motion.div>

          {loading ? (
            <div className="space-y-6">
              <div className="h-72 w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="grid gap-6 lg:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                ))}
              </div>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Evolución */}
              {data.evolucion_mensual.length > 0 && (
                <Reveal>
                  <Panel title="Evolución mensual" icon={<path d="M3 3v18h18" />}>
                    <EvolutionChart data={data.evolucion_mensual} moneda={moneda} />
                  </Panel>
                </Reveal>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Gastos por categoría */}
                <Reveal delay={0.05}>
                  <Panel title="Gastos por categoría" tone={ROSE} icon={<><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></>}>
                    {data.gastos_por_categoria.length > 0 ? (
                      <div className="space-y-4">
                        <DonutChart items={data.gastos_por_categoria} />
                        <CategoryList items={data.gastos_por_categoria} tone={ROSE} moneda={moneda} />
                      </div>
                    ) : (
                      <Empty text="Sin gastos en este mes" />
                    )}
                  </Panel>
                </Reveal>

                {/* Ingresos por categoría */}
                <Reveal delay={0.1}>
                  <Panel title="Ingresos por categoría" tone={BRAND} icon={<><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></>}>
                    {data.ingresos_por_categoria.length > 0 ? (
                      <div className="space-y-4">
                        <DonutChart items={data.ingresos_por_categoria} />
                        <CategoryList items={data.ingresos_por_categoria} tone={BRAND} moneda={moneda} />
                      </div>
                    ) : (
                      <Empty text="Sin ingresos en este mes" />
                    )}
                  </Panel>
                </Reveal>

                {/* Presupuestos */}
                {data.presupuestos.length > 0 && (
                  <Reveal delay={0.15}>
                    <Panel title="Presupuestos activos" icon={<><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 2v4" /><path d="M16 2v4" /></>}>
                      <div className="space-y-4">
                        {data.presupuestos.map((p) => {
                          const pct = Math.min(p.porcentaje, 100)
                          const color = p.porcentaje > 100 ? ROSE : p.porcentaje > 80 ? '#F59E0B' : BRAND
                          return (
                            <div key={p.id}>
                              <div className="mb-1.5 flex items-center justify-between gap-2">
                                <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.categoria_color || '#94a3b8' }} />
                                  <span className="truncate">{p.nombre}</span>
                                </span>
                                <span className="shrink-0 text-sm tabular-nums text-slate-500 dark:text-slate-400">
                                  {formatCurrency(p.monto_gastado, moneda)} / {formatCurrency(p.monto_limite, moneda)}
                                </span>
                              </div>
                              <Bar pct={pct} color={color} />
                              <div className="mt-1 flex justify-between text-[0.68rem] text-slate-400 dark:text-slate-500">
                                <span>{p.dias_restantes} días restantes</span>
                                <span className="tabular-nums">{p.porcentaje}%</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </Panel>
                  </Reveal>
                )}

                {/* Metas */}
                {data.metas.length > 0 && (
                  <Reveal delay={0.2}>
                    <Panel title="Metas activas" icon={<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.5" /></>}>
                      <div className="space-y-4">
                        {data.metas.map((m) => (
                          <div key={m.id}>
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                              <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: m.color || '#94a3b8' }} />
                                <span className="truncate">{m.nombre}</span>
                              </span>
                              <span className="shrink-0 text-sm tabular-nums text-slate-500 dark:text-slate-400">
                                {formatCurrency(m.monto_actual, moneda)} / {formatCurrency(m.monto_objetivo, moneda)}
                              </span>
                            </div>
                            <Bar pct={Math.min(m.porcentaje, 100)} color={m.color || BRAND} />
                            <div className="mt-1 flex justify-end text-[0.68rem] tabular-nums text-slate-400 dark:text-slate-500">{m.porcentaje}%</div>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </Reveal>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-20">
              <p className="text-slate-500 dark:text-slate-400">No hay datos disponibles</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

/* ─── KPI (dentro del panel oscuro) ─── */
function Kpi({ label, value, moneda, tone, variacion, goodWhenUp, signed }: {
  label: string; value: number; moneda: string; tone: string
  variacion?: number; goodWhenUp?: boolean; signed?: boolean
}) {
  const subimos = (variacion ?? 0) >= 0
  const bueno = goodWhenUp ? subimos : !subimos
  return (
    <div>
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-white/50">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight" style={{ color: tone }}>
        {signed && value < 0 && '−'}
        <AnimatedCurrency value={Math.abs(value)} moneda={moneda} />
      </p>
      {variacion !== undefined && (
        <p className={`mt-1 flex items-center gap-1 text-xs ${bueno ? 'text-brand-300' : 'text-rose-300'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-3.5">
            {subimos ? <path d="m6 15 6-6 6 6" /> : <path d="m6 9 6 6 6-6" />}
          </svg>
          <span className="tabular-nums">{Math.abs(variacion)}%</span>
          <span className="text-white/40">vs mes anterior</span>
        </p>
      )}
    </div>
  )
}

/* ─── Panel (tarjeta blanca con cabecera) ─── */
function Panel({ title, icon, tone = '#64748B', children }: {
  title: string; icon: ReactNode; tone?: string; children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-900/5 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ backgroundColor: `color-mix(in oklab, ${tone} 12%, transparent)`, color: tone }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">{icon}</svg>
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">{text}</p>
}

type Cat = { nombre: string; total: number; porcentaje: number; color?: string; transacciones: number }

function CategoryList({ items, tone, moneda }: { items: Cat[]; tone: string; moneda: string }) {
  return (
    <div className="space-y-3.5">
      {items.map((cat, i) => (
        <div key={i}>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cat.color || '#94a3b8' }} />
              <span className="truncate">{cat.nombre}</span>
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums" style={{ color: tone }}>
              {formatCurrency(cat.total, moneda)}
            </span>
          </div>
          <Bar pct={cat.porcentaje} color={cat.color || tone} />
          <div className="mt-1 flex justify-between text-[0.68rem] text-slate-400 dark:text-slate-500">
            <span>{cat.transacciones} {cat.transacciones === 1 ? 'transacción' : 'transacciones'}</span>
            <span className="tabular-nums">{cat.porcentaje}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Donut (SVG) ─── */
function DonutChart({ items }: { items: Cat[] }) {
  const total = items.reduce((s, i) => s + i.total, 0)
  const totalTx = items.reduce((s, i) => s + i.transacciones, 0)
  if (total === 0) return null

  const cx = 80, cy = 80, r = 60, sw = 18
  const circumference = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex justify-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={sw} className="stroke-slate-100 dark:stroke-slate-800" />
        {items.map((item, i) => {
          const length = circumference * (item.total / total)
          const dash = `${length} ${circumference - length}`
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={item.color || '#94a3b8'}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          )
          offset += length
          return el
        })}
        <text x={cx} y={cy - 2} textAnchor="middle" className="fill-slate-900 text-lg font-semibold tabular-nums dark:fill-slate-100">
          {totalTx}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-slate-400 text-[10px]">
          movimientos
        </text>
      </svg>
    </div>
  )
}

/* ─── Evolución (SVG líneas) ─── */
function EvolutionChart({ data, moneda }: { data: Array<{ mes: string; ingresos: number; gastos: number }>; moneda: string }) {
  const pad = 44
  const w = 700, h = 220
  const drawW = w - pad * 2
  const drawH = h - pad * 2
  const maxVal = Math.max(...data.flatMap((d) => [d.ingresos, d.gastos]), 1)
  const scaleY = (v: number) => drawH - (v / maxVal) * drawH + pad
  const stepX = drawW / (data.length - 1 || 1)

  const ingLine = data.map((d, i) => `${i * stepX + pad},${scaleY(d.ingresos)}`).join(' ')
  const gasLine = data.map((d, i) => `${i * stepX + pad},${scaleY(d.gastos)}`).join(' ')

  const monthLabels = data.map((d) => {
    const [y, m] = d.mes.split('-')
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('es-CO', { month: 'short' })
  })

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[500px]">
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = scaleY(maxVal * pct)
          return (
            <g key={pct}>
              <line x1={pad} y1={y} x2={w - pad} y2={y} className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" />
              <text x={pad - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
                {formatCurrency(maxVal * pct, moneda)}
              </text>
            </g>
          )
        })}

        {data.length > 1 && (
          <>
            <polyline points={ingLine} fill="none" stroke={BRAND} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            <polyline points={gasLine} fill="none" stroke={ROSE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}

        {data.map((d, i) => (
          <g key={i}>
            <circle cx={i * stepX + pad} cy={scaleY(d.ingresos)} r="3.5" fill={BRAND} stroke="white" strokeWidth="2" />
            <circle cx={i * stepX + pad} cy={scaleY(d.gastos)} r="3.5" fill={ROSE} stroke="white" strokeWidth="2" />
            <text x={i * stepX + pad} y={h - 8} textAnchor="middle" className="fill-slate-400 text-[10px] capitalize">
              {monthLabels[i]}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-3 flex justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Ingresos</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Gastos</span>
      </div>
    </div>
  )
}

export default DashboardPage
