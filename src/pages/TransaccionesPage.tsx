import { useState, useEffect, useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getTransactions,
  getAccounts,
  getCategories,
  getTransactionsSummary,
  createTransaction,
  deleteTransaction,
  createTransfer,
  type Transaccion,
  type CreateTransaccionDto,
  type CreateTransferDto,
  type Account,
  type Categoria,
  TIPO_TRANSACCION,
} from '../services/api'
import { formatCurrency } from '../utils/format'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { AnimatedCurrency } from '../components/dashboard/StatsCards'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import TransaccionFormModal from '../components/transactions/TransaccionFormModal'
import TransferModal from '../components/transactions/TransferModal'
import TransaccionDetailModal from '../components/transactions/TransaccionDetailModal'
import Swal from 'sweetalert2'

/* ─── Helpers ──────────────────────────────────────────── */

const TONO = {
  INGRESO: '#1EB256',
  GASTO: '#F43F5E',
  TRANSFERENCIA: '#64748B',
}

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getMonthRange(offset: number): { start: string; end: string } {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return { start: toLocalDateStr(start), end: toLocalDateStr(end) }
}

function formatDateLabel(dateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr + 'T12:00:00')
  date.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today.getTime() - date.getTime()) / 86400000)

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  return date
    .toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^\w/, (c) => c.toUpperCase())
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function tipoTono(tx: Transaccion): string {
  if (tx.tipo_transaccion_id === TIPO_TRANSACCION.INGRESO) return TONO.INGRESO
  if (tx.tipo_transaccion_id === TIPO_TRANSACCION.TRANSFERENCIA) return TONO.TRANSFERENCIA
  return TONO.GASTO
}

function TxIcon({ tx }: { tx: Transaccion }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-[18px] w-[18px]',
    'aria-hidden': true,
  }
  if (tx.tipo_transaccion_id === TIPO_TRANSACCION.INGRESO) {
    return (
      <svg {...common}>
        <path d="M12 19V5" />
        <path d="m6 11 6-6 6 6" />
      </svg>
    )
  }
  if (tx.tipo_transaccion_id === TIPO_TRANSACCION.TRANSFERENCIA) {
    return (
      <svg {...common}>
        <path d="M4 8.5h13" />
        <path d="m13.5 5 3.5 3.5-3.5 3.5" />
        <path d="M20 15.5H7" />
        <path d="M10.5 12 7 15.5l3.5 3.5" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  )
}

type FilterType = 'all' | 'ingreso' | 'gasto' | 'transferencia'
type ViewMode = 'active' | 'archived'

/* ─── Component ────────────────────────────────────────── */

function TransaccionesPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const reduceMotion = useReducedMotion()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSidebarCollapsed()
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [summary, setSummary] = useState<{ total_ingresos?: number; total_gastos?: number; balance?: number } | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [detailTransaccion, setDetailTransaccion] = useState<Transaccion | null>(null)
  const [dateRange, setDateRange] = useState(() => getMonthRange(0))

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('active')

  const nombre = user?.nombre ?? 'Usuario'
  const moneda = user?.monedaPredeterminada ?? 'COP'

  const fetchData = async () => {
    try {
      setLoading(true)
      const [txList, summaryRes, accountsData, categoriesData] = await Promise.all([
        getTransactions(dateRange.start, dateRange.end),
        getTransactionsSummary(dateRange.start, dateRange.end),
        getAccounts(),
        getCategories(),
      ])
      setTransacciones(txList)
      const sumArray = Array.isArray(summaryRes) ? summaryRes : [summaryRes]
      const first = sumArray[0]
      if (first && (first.total_ingresos != null || first.total_gastos != null)) {
        setSummary({
          total_ingresos: Number(first.total_ingresos ?? 0),
          total_gastos: Number(first.total_gastos ?? 0),
          balance: Number(first.balance ?? 0),
        })
      } else {
        setSummary(null)
      }
      setAccounts(accountsData)
      setCategories(categoriesData)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudieron cargar las transacciones.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange.start, dateRange.end])

  useEffect(() => {
    setSearchQuery('')
    setActiveFilter('all')
  }, [dateRange.start])

  /* ─── Handlers ──────────────────────────────────────── */

  const handleCreate = async (data: CreateTransaccionDto) => {
    try {
      setSaving(true)
      await createTransaction(data)
      Swal.fire({ icon: 'success', title: 'Transacción creada', timer: 1500, showConfirmButton: false })
      setShowCreateModal(false)
      fetchData()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo crear.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleTransfer = async (payload: CreateTransferDto) => {
    try {
      setSaving(true)
      await createTransfer(payload)
      Swal.fire({ icon: 'success', title: 'Transferencia realizada', timer: 1500, showConfirmButton: false })
      setShowTransferModal(false)
      fetchData()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo realizar la transferencia.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async (tx: Transaccion) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Archivar transacción?',
      text: `"${tx.titulo || tx.descripcion || 'Transacción'}" se moverá a archivadas.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, archivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#F59E0B',
    })
    if (!result.isConfirmed) return
    try {
      await deleteTransaction(tx.id)
      Swal.fire({ icon: 'success', title: 'Archivada', timer: 1500, showConfirmButton: false })
      fetchData()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo archivar.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    }
  }

  const handlePermanentDelete = async (tx: Transaccion) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar permanentemente?',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    })
    if (!result.isConfirmed) return
    try {
      await deleteTransaction(tx.id, true)
      Swal.fire({ icon: 'success', title: 'Eliminada permanentemente', timer: 1500, showConfirmButton: false })
      fetchData()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo eliminar.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    }
  }

  const handleNavigate = (key: string) => {
    if (key === 'home') navigate('/home')
    else if (key === 'accounts') navigate('/accounts')
    else if (key === 'categories') navigate('/categories')
    else if (key === 'goals') navigate('/goals')
    else if (key === 'loans') navigate('/loans')
    else if (key === 'budgets') navigate('/budgets')
    else if (key === 'transactions') navigate('/transactions')
    else if (key === 'dashboard') navigate('/dashboard')
    else if (key === 'reports') navigate('/reports')
    else if (key === 'profile') navigate('/profile')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const shiftMonth = (delta: number) =>
    setDateRange((r) => {
      const d = new Date(r.start + 'T12:00:00')
      d.setMonth(d.getMonth() + delta)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      return { start: toLocalDateStr(start), end: toLocalDateStr(end) }
    })

  const esMesActual = dateRange.start === getMonthRange(0).start

  /* ─── Filtering & grouping ──────────────────────────── */

  const activeTransactions = useMemo(() => transacciones.filter((t) => t.activa), [transacciones])
  const archivedTransactions = useMemo(() => transacciones.filter((t) => !t.activa), [transacciones])

  const baseTransactions = viewMode === 'active' ? activeTransactions : archivedTransactions

  const txCounts = useMemo(() => {
    let ingresos = 0, gastos = 0, transferencias = 0
    for (const tx of activeTransactions) {
      if (tx.tipo_transaccion_id === TIPO_TRANSACCION.INGRESO) ingresos++
      else if (tx.tipo_transaccion_id === TIPO_TRANSACCION.GASTO) gastos++
      else if (tx.tipo_transaccion_id === TIPO_TRANSACCION.TRANSFERENCIA) transferencias++
    }
    return { ingresos, gastos, transferencias }
  }, [activeTransactions])

  const { groups, filteredCount } = useMemo(() => {
    let filtered = [...baseTransactions]

    if (activeFilter === 'ingreso') filtered = filtered.filter((t) => t.tipo_transaccion_id === TIPO_TRANSACCION.INGRESO)
    else if (activeFilter === 'gasto') filtered = filtered.filter((t) => t.tipo_transaccion_id === TIPO_TRANSACCION.GASTO)
    else if (activeFilter === 'transferencia') filtered = filtered.filter((t) => t.tipo_transaccion_id === TIPO_TRANSACCION.TRANSFERENCIA)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((t) =>
        t.titulo?.toLowerCase().includes(q) ||
        t.descripcion?.toLowerCase().includes(q) ||
        t.categoria_nombre?.toLowerCase().includes(q),
      )
    }

    filtered.sort((a, b) => new Date(b.fecha_transaccion).getTime() - new Date(a.fecha_transaccion).getTime())

    const map = new Map<string, Transaccion[]>()
    for (const tx of filtered) {
      const key = tx.fecha_transaccion.slice(0, 10)
      const arr = map.get(key)
      if (arr) arr.push(tx)
      else map.set(key, [tx])
    }

    return { groups: Array.from(map.entries()), filteredCount: filtered.length }
  }, [baseTransactions, searchQuery, activeFilter])

  const filters: { key: FilterType; label: string; count: number | null; tone: string }[] = [
    { key: 'all', label: 'Todos', count: null, tone: '#0f172a' },
    { key: 'ingreso', label: 'Ingresos', count: txCounts.ingresos, tone: TONO.INGRESO },
    { key: 'gasto', label: 'Gastos', count: txCounts.gastos, tone: TONO.GASTO },
    { key: 'transferencia', label: 'Transferencias', count: txCounts.transferencias, tone: TONO.TRANSFERENCIA },
  ]

  function getDaySubtotal(txs: Transaccion[]): number {
    return txs.reduce((sum, tx) => {
      if (tx.tipo_transaccion_id === TIPO_TRANSACCION.INGRESO) return sum + tx.monto
      if (tx.tipo_transaccion_id === TIPO_TRANSACCION.GASTO) return sum - tx.monto
      return sum
    }, 0)
  }

  const ingresos = summary?.total_ingresos ?? 0
  const gastos = summary?.total_gastos ?? 0
  const balance = summary?.balance ?? ingresos - gastos
  const flujo = ingresos + gastos

  /* ─── Render ───────────────────────────────────────── */

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        activeNav="transactions"
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
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">
                Transacciones
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Ingresos, gastos y transferencias mes a mes
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowTransferModal(true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M4 8.5h13" /><path d="m13.5 5 3.5 3.5-3.5 3.5" /><path d="M20 15.5H7" /><path d="M10.5 12 7 15.5l3.5 3.5" />
                </svg>
                Transferir
              </button>
              <motion.button
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                Nueva transacción
              </motion.button>
            </div>
          </div>

          {/* Summary panel + month navigator */}
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

            <div className="relative flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Mes anterior"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <p className="text-sm font-medium capitalize text-white/80">
                {new Date(dateRange.start + 'T12:00:00').toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
              </p>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                disabled={esMesActual}
                aria-label="Mes siguiente"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>

            <div className="relative mt-5 text-center">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/50">
                Balance del mes
              </p>
              <p className="mt-1.5 text-4xl font-semibold tabular-nums tracking-tight">
                {loading ? (
                  <span className="inline-block h-10 w-52 animate-pulse rounded-lg bg-white/10" />
                ) : (
                  <span className={balance >= 0 ? 'text-brand-400' : 'text-rose-400'}>
                    {balance < 0 && '−'}
                    <AnimatedCurrency value={Math.abs(balance)} moneda={moneda} />
                  </span>
                )}
              </p>
            </div>

            {!loading && flujo > 0 && (
              <div className="relative mt-6">
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <span className="h-full bg-brand-500" style={{ width: `${(ingresos / flujo) * 100}%` }} />
                  <span className="h-full bg-rose-400" style={{ width: `${(gastos / flujo) * 100}%` }} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs text-white/50">
                      <span className="h-2 w-2 rounded-full bg-brand-500" /> Ingresos · {txCounts.ingresos}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-brand-300">
                      {formatCurrency(ingresos, moneda)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center justify-end gap-1.5 text-xs text-white/50">
                      Gastos · {txCounts.gastos} <span className="h-2 w-2 rounded-full bg-rose-400" />
                    </p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-rose-300">
                      {formatCurrency(gastos, moneda)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Search + filters + view */}
          {!loading && (
            <div className="mb-5 space-y-3">
              <div className="relative">
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                >
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título, descripción o categoría…"
                  className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {filters.map((f) => {
                  const active = activeFilter === f.key
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setActiveFilter(f.key)}
                      className="rounded-full border px-4 py-1.5 text-sm transition-colors"
                      style={
                        active
                          ? { backgroundColor: f.tone, borderColor: f.tone, color: '#fff' }
                          : undefined
                      }
                    >
                      <span className={active ? 'font-medium' : 'text-slate-500 dark:text-slate-400'}>
                        {f.label}
                      </span>
                      {f.count !== null && (
                        <span className={`ml-1.5 tabular-nums ${active ? 'opacity-70' : 'opacity-50'}`}>
                          {f.count}
                        </span>
                      )}
                    </button>
                  )
                })}

                <div className="mx-1 hidden h-5 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

                <div className="inline-flex rounded-full border border-slate-200 p-0.5 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setViewMode('active')}
                    className={`rounded-full px-3.5 py-1 text-sm transition-colors ${
                      viewMode === 'active'
                        ? 'bg-slate-900 font-medium text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    Activas
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('archived')}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-sm transition-colors ${
                      viewMode === 'archived'
                        ? 'bg-slate-900 font-medium text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    Archivadas
                    {archivedTransactions.length > 0 && (
                      <span className="tabular-nums opacity-60">{archivedTransactions.length}</span>
                    )}
                  </button>
                </div>

                {(searchQuery || activeFilter !== 'all') && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {filteredCount} resultado{filteredCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Transaction list */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((g) => (
                <div key={g}>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-900/5 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-4">
                        <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-4 w-3/5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                          <div className="h-3 w-2/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                        </div>
                        <div className="h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : groups.length > 0 ? (
            <div className="space-y-5">
              {groups.map(([dateKey, txs], gi) => {
                const daySubtotal = getDaySubtotal(txs)
                return (
                  <motion.div
                    key={dateKey}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(gi, 6) * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="mb-2 flex items-center justify-between px-1">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                        {formatDateLabel(dateKey)}
                      </h3>
                      {viewMode === 'active' && daySubtotal !== 0 && (
                        <span
                          className="text-xs font-semibold tabular-nums"
                          style={{ color: daySubtotal >= 0 ? TONO.INGRESO : TONO.GASTO }}
                        >
                          {daySubtotal >= 0 ? '+' : '−'}
                          {formatCurrency(Math.abs(daySubtotal), moneda)}
                        </span>
                      )}
                    </div>

                    <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-900/5 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
                      {txs.map((tx) => {
                        const tono = tipoTono(tx)
                        const dot = tx.categoria_color || tono
                        const esIngreso = tx.tipo_transaccion_id === TIPO_TRANSACCION.INGRESO
                        const esTransfer = tx.tipo_transaccion_id === TIPO_TRANSACCION.TRANSFERENCIA
                        const archivada = viewMode === 'archived'
                        return (
                          <div
                            key={tx.id}
                            onClick={() => setDetailTransaccion(tx)}
                            className="group/row flex cursor-pointer items-center gap-3 p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70"
                          >
                            <span
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${archivada ? 'opacity-50' : ''}`}
                              style={{
                                backgroundColor: `color-mix(in oklab, ${dot} 14%, transparent)`,
                                color: dot,
                                boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${dot} 22%, transparent)`,
                              }}
                            >
                              <TxIcon tx={tx} />
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className={`flex items-center gap-1.5 text-sm font-medium ${archivada ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                <span className="truncate">{tx.titulo || tx.descripcion || 'Sin concepto'}</span>
                                {tx.repetir && (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-slate-400">
                                    <title>Recurrente</title>
                                    <path d="M17 2l4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />
                                  </svg>
                                )}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                                {[tx.categoria_nombre, tx.cuenta_nombre, formatTime(tx.fecha_transaccion)]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            </div>

                            <div className="flex items-center gap-1">
                              <span
                                className={`whitespace-nowrap text-sm font-semibold tabular-nums ${archivada ? 'text-slate-400 dark:text-slate-500' : esTransfer ? 'text-slate-500 dark:text-slate-400' : ''}`}
                                style={!archivada && !esTransfer ? { color: tono } : undefined}
                              >
                                {esIngreso ? '+' : esTransfer ? '' : '−'}
                                {formatCurrency(tx.monto, moneda)}
                              </span>

                              {viewMode === 'active' ? (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleArchive(tx) }}
                                  aria-label="Archivar"
                                  title="Archivar"
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-amber-50 hover:text-amber-600 sm:opacity-0 sm:transition-opacity sm:group-hover/row:opacity-100 dark:hover:bg-amber-900/30"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" />
                                  </svg>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handlePermanentDelete(tx) }}
                                  aria-label="Eliminar permanentemente"
                                  title="Eliminar permanentemente"
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:transition-opacity sm:group-hover/row:opacity-100 dark:hover:bg-rose-900/30"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <path d="M3.5 6.5h17" /><path d="M18.5 6.5V20a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V6.5" /><path d="M9 6.5V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5v2" /><path d="M10.5 11v6M13.5 11v6" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              variant={
                baseTransactions.length > 0
                  ? 'no-results'
                  : viewMode === 'archived'
                    ? 'no-archived'
                    : 'no-tx'
              }
              onReset={() => { setSearchQuery(''); setActiveFilter('all') }}
              onCreate={() => setShowCreateModal(true)}
            />
          )}
        </main>
      </div>

      <TransaccionFormModal
        open={showCreateModal}
        accounts={accounts}
        categories={categories}
        moneda={moneda}
        loading={saving}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />
      <TransferModal
        open={showTransferModal}
        accounts={accounts}
        moneda={moneda}
        loading={saving}
        onClose={() => setShowTransferModal(false)}
        onSubmit={handleTransfer}
      />
      <TransaccionDetailModal
        open={!!detailTransaccion}
        transaccion={detailTransaccion}
        moneda={moneda}
        onClose={() => setDetailTransaccion(null)}
      />
    </div>
  )
}

function EmptyState({
  variant,
  onReset,
  onCreate,
}: {
  variant: 'no-results' | 'no-archived' | 'no-tx'
  onReset: () => void
  onCreate: () => void
}) {
  const config = {
    'no-results': {
      icon: (
        <>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </>
      ),
      title: 'Sin resultados',
      text: 'No se encontraron transacciones con los filtros aplicados.',
    },
    'no-archived': {
      icon: (
        <>
          <rect width="20" height="5" x="2" y="3" rx="1" />
          <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
          <path d="M10 12h4" />
        </>
      ),
      title: 'Sin transacciones archivadas',
      text: 'Las transacciones que archives aparecerán aquí.',
    },
    'no-tx': {
      icon: (
        <>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </>
      ),
      title: 'Sin transacciones este mes',
      text: 'Registra tu primera transacción para comenzar a organizar tus finanzas.',
    },
  }[variant]

  return (
    <div className="relative isolate flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-16 dark:border-slate-700 dark:bg-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)]"
      />
      <div className="relative mb-4 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:ring-brand-800/50">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-brand-600 dark:text-brand-400">
          {config.icon}
        </svg>
      </div>
      <h3 className="relative mb-1 text-base font-semibold text-slate-900 dark:text-slate-50">{config.title}</h3>
      <p className="relative mb-5 max-w-xs text-center text-sm text-slate-500 dark:text-slate-400">{config.text}</p>
      {variant === 'no-results' ? (
        <button
          type="button"
          onClick={onReset}
          className="relative rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 dark:border-slate-700 dark:text-slate-100"
        >
          Limpiar filtros
        </button>
      ) : variant === 'no-tx' ? (
        <button
          type="button"
          onClick={onCreate}
          className="relative inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          Nueva transacción
        </button>
      ) : null}
    </div>
  )
}

export default TransaccionesPage
