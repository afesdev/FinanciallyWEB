import { useState, useEffect, useMemo } from 'react'
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
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import TransaccionFormModal from '../components/transactions/TransaccionFormModal'
import TransferModal from '../components/transactions/TransferModal'
import TransaccionDetailModal from '../components/transactions/TransaccionDetailModal'
import Swal from 'sweetalert2'

/* ─── Helpers ──────────────────────────────────────────── */

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
  const diffMs = today.getTime() - date.getTime()
  const diffDays = Math.round(diffMs / 86400000)

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  return date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^\w/, (c) => c.toUpperCase())
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

type FilterType = 'all' | 'ingreso' | 'gasto' | 'transferencia'
type ViewMode = 'active' | 'archived'

/* ─── Component ────────────────────────────────────────── */

function TransaccionesPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
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

  // Search, filter & view state
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

  // Reset filters on month change
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
    else if (key === 'reports') navigate('/reports')
    else if (key === 'profile') navigate('/profile')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const prevMonth = () => setDateRange((r) => {
    const d = new Date(r.start + 'T12:00:00')
    d.setMonth(d.getMonth() - 1)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    return { start: toLocalDateStr(start), end: toLocalDateStr(end) }
  })
  const nextMonth = () => setDateRange((r) => {
    const d = new Date(r.start + 'T12:00:00')
    d.setMonth(d.getMonth() + 1)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    return { start: toLocalDateStr(start), end: toLocalDateStr(end) }
  })

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

    // Filter by type
    if (activeFilter === 'ingreso') filtered = filtered.filter((t) => t.tipo_transaccion_id === TIPO_TRANSACCION.INGRESO)
    else if (activeFilter === 'gasto') filtered = filtered.filter((t) => t.tipo_transaccion_id === TIPO_TRANSACCION.GASTO)
    else if (activeFilter === 'transferencia') filtered = filtered.filter((t) => t.tipo_transaccion_id === TIPO_TRANSACCION.TRANSFERENCIA)

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((t) =>
        (t.titulo?.toLowerCase().includes(q)) ||
        (t.descripcion?.toLowerCase().includes(q)) ||
        (t.categoria_nombre?.toLowerCase().includes(q))
      )
    }

    // Sort by date desc
    filtered.sort((a, b) => new Date(b.fecha_transaccion).getTime() - new Date(a.fecha_transaccion).getTime())

    // Group by date (YYYY-MM-DD)
    const map = new Map<string, Transaccion[]>()
    for (const tx of filtered) {
      const key = tx.fecha_transaccion.slice(0, 10)
      const arr = map.get(key)
      if (arr) arr.push(tx)
      else map.set(key, [tx])
    }

    return { groups: Array.from(map.entries()), filteredCount: filtered.length }
  }, [baseTransactions, searchQuery, activeFilter])

  /* ─── Filter chips config ──────────────────────────── */

  const filters: { key: FilterType; label: string; activeBg: string; activeText: string }[] = [
    { key: 'all', label: 'Todos', activeBg: 'bg-slate-900', activeText: 'text-white' },
    { key: 'ingreso', label: 'Ingresos', activeBg: 'bg-emerald-500', activeText: 'text-white' },
    { key: 'gasto', label: 'Gastos', activeBg: 'bg-rose-500', activeText: 'text-white' },
    { key: 'transferencia', label: 'Transferencias', activeBg: 'bg-cyan-500', activeText: 'text-white' },
  ]

  /* ─── Summary cards config ─────────────────────────── */

  const summaryCards = summary
    ? [
        {
          label: 'Ingresos',
          value: summary.total_ingresos ?? 0,
          count: txCounts.ingresos,
          countLabel: 'transacciones',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 15-6-6-6 6" />
            </svg>
          ),
          valueColor: 'text-emerald-600',
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
          blobColor: 'bg-emerald-500/5 group-hover:bg-emerald-500/10',
          countColor: 'text-emerald-600',
        },
        {
          label: 'Gastos',
          value: summary.total_gastos ?? 0,
          count: txCounts.gastos,
          countLabel: 'transacciones',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          ),
          valueColor: 'text-rose-600',
          iconBg: 'bg-rose-50',
          iconColor: 'text-rose-600',
          blobColor: 'bg-rose-500/5 group-hover:bg-rose-500/10',
          countColor: 'text-rose-600',
        },
        {
          label: 'Balance',
          value: summary.balance ?? 0,
          count: txCounts.ingresos + txCounts.gastos + txCounts.transferencias,
          countLabel: 'en total',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18" /><path d="m8 8 4-5 4 5" /><path d="m8 16 4 5 4-5" />
            </svg>
          ),
          valueColor: (summary.balance ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600',
          iconBg: 'bg-violet-50',
          iconColor: 'text-violet-600',
          blobColor: 'bg-violet-500/5 group-hover:bg-violet-500/10',
          countColor: 'text-slate-500',
        },
      ]
    : []

  /* ─── Render helpers ───────────────────────────────── */

  function getTxColor(tx: Transaccion) {
    if (tx.tipo_transaccion_id === TIPO_TRANSACCION.INGRESO) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-900/40',
        text: 'text-emerald-600 dark:text-emerald-300',
      }
    }
    if (tx.tipo_transaccion_id === TIPO_TRANSACCION.TRANSFERENCIA) {
      return {
        bg: 'bg-cyan-50 dark:bg-cyan-900/40',
        text: 'text-cyan-600 dark:text-cyan-300',
      }
    }
    return {
      bg: 'bg-rose-50 dark:bg-rose-900/40',
      text: 'text-rose-600 dark:text-rose-300',
    }
  }

  function getTxIcon(tx: Transaccion) {
    if (tx.tipo_transaccion_id === TIPO_TRANSACCION.INGRESO) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 15-6-6-6 6" />
        </svg>
      )
    }
    if (tx.tipo_transaccion_id === TIPO_TRANSACCION.TRANSFERENCIA) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" />
        </svg>
      )
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    )
  }

  function getTxAmountPrefix(tx: Transaccion) {
    if (tx.tipo_transaccion_id === TIPO_TRANSACCION.INGRESO) return '+'
    if (tx.tipo_transaccion_id === TIPO_TRANSACCION.GASTO) return '-'
    return ''
  }

  function getDaySubtotal(txs: Transaccion[]): number {
    return txs.reduce((sum, tx) => {
      if (tx.tipo_transaccion_id === TIPO_TRANSACCION.INGRESO) return sum + tx.monto
      if (tx.tipo_transaccion_id === TIPO_TRANSACCION.GASTO) return sum - tx.monto
      return sum
    }, 0)
  }

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
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Transacciones</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ingresos, gastos y transferencias</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowTransferModal(true)}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-500 bg-white px-4 py-2.5 text-sm font-semibold text-cyan-600 transition-all hover:bg-cyan-50 dark:bg-slate-950 dark:text-cyan-300 dark:hover:bg-slate-900"
              >
                Transferir
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                Nueva transacción
              </button>
            </div>
          </div>

          {/* Month navigator */}
          <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={prevMonth}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <span className="font-medium text-slate-800 dark:text-slate-100">
              {new Date(dateRange.start + 'T12:00:00').toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>

          {/* Summary cards */}
          {!loading && summary && viewMode === 'active' && (
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full transition-all ${card.blobColor}`} />
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {card.label}
                    </span>
                    <div className={`rounded-lg p-2 ${card.iconBg} ${card.iconColor}`}>
                      {card.icon}
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${card.valueColor} dark:text-slate-50`}>
                    {formatCurrency(card.value, moneda)}
                  </p>
                  <p className={`mt-1 flex items-center gap-1 text-xs ${card.countColor}`}>
                    <span className="font-medium">{card.count}</span> {card.countLabel}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Search + filter chips + view tabs */}
          {!loading && (
            <div className="mb-6 space-y-3">
              {/* Search input */}
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título, descripción o categoría..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </button>
                )}
              </div>

              {/* Filter chips + view toggle */}
              <div className="flex flex-wrap items-center gap-2">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setActiveFilter(f.key)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      activeFilter === f.key
                        ? `${f.activeBg} ${f.activeText} shadow-sm`
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}

                {/* Separator */}
                <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

                {/* Active / Archived tabs */}
                <button
                  type="button"
                  onClick={() => setViewMode('active')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    viewMode === 'active'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  Activas
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('archived')}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    viewMode === 'archived'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" />
                  </svg>
                  Archivadas
                  {archivedTransactions.length > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                      viewMode === 'archived' ? 'bg-white/20' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {archivedTransactions.length}
                    </span>
                  )}
                </button>

                {(searchQuery || activeFilter !== 'all') && (
                  <span className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    {filteredCount} resultado{filteredCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Transaction list */}
        {loading ? (
          /* Skeleton */
          <div className="space-y-4">
              {[1, 2, 3].map((g) => (
                <div key={g}>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-4">
                        <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
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
              {groups.map(([dateKey, txs]) => {
                const daySubtotal = getDaySubtotal(txs)
                return (
                  <div key={dateKey}>
                    {/* Date group header */}
                    <div className="mb-2 flex items-center justify-between px-1">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatDateLabel(dateKey)}</h3>
                      {viewMode === 'active' && (
                        <span className={`text-sm font-semibold ${daySubtotal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {daySubtotal >= 0 ? '+' : ''}{formatCurrency(daySubtotal, moneda)}
                        </span>
                      )}
                    </div>

                    {/* Grouped card */}
                    <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
                      {txs.map((tx) => {
                        const color = getTxColor(tx)
                        return (
                          <div
                            key={tx.id}
                            onClick={() => setDetailTransaccion(tx)}
                            className="group/row flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            {/* Icon */}
                            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${color.bg} ${color.text} ${viewMode === 'archived' ? 'opacity-50' : ''}`}>
                              {getTxIcon(tx)}
                            </div>

                            {/* Center: title + meta */}
                            <div className="min-w-0 flex-1">
                              <p className={`flex items-center gap-1.5 text-sm font-medium ${
                                viewMode === 'archived'
                                  ? 'text-slate-500 dark:text-slate-400'
                                  : 'text-slate-900 dark:text-slate-50'
                              }`}>
                                <span className="truncate">{tx.titulo || tx.descripcion || 'Sin concepto'}</span>
                                {tx.repetir && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="flex-shrink-0 text-violet-500"
                                  >
                                    <title>Recurrente</title>
                                    <path d="M17 2l4 4-4 4" />
                                    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                                    <path d="M7 22l-4-4 4-4" />
                                    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                                  </svg>
                                )}
                              </p>
                              <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                {tx.categoria_nombre && (
                                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 font-medium dark:bg-slate-800 dark:text-slate-200">
                                    {tx.categoria_nombre}
                                  </span>
                                )}
                                {tx.cuenta_nombre && <span>{tx.cuenta_nombre}</span>}
                                <span className="text-slate-400 dark:text-slate-500">{formatTime(tx.fecha_transaccion)}</span>
                              </p>
                            </div>

                            {/* Right: amount + action */}
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold whitespace-nowrap ${
                                viewMode === 'archived'
                                  ? 'text-slate-400 dark:text-slate-500'
                                  : color.text
                              }`}>
                                {getTxAmountPrefix(tx)}{formatCurrency(tx.monto, moneda)}
                              </span>

                              {viewMode === 'active' ? (
                                /* Archive button */
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleArchive(tx) }}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 sm:opacity-0 sm:group-hover/row:opacity-100 sm:transition-opacity dark:hover:bg-amber-900/30"
                                  title="Archivar"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" />
                                  </svg>
                                </button>
                              ) : (
                                /* Permanent delete button */
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handlePermanentDelete(tx) }}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover/row:opacity-100 sm:transition-opacity dark:hover:bg-rose-900/30"
                                  title="Eliminar permanentemente"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : baseTransactions.length > 0 ? (
            /* No results from filters/search */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-16 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 p-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-50">Sin resultados</h3>
              <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No se encontraron transacciones con los filtros aplicados
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setActiveFilter('all') }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Limpiar filtros
              </button>
            </div>
          ) : viewMode === 'archived' ? (
            /* No archived transactions */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-16 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 p-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                  <rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" />
                </svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-50">Sin transacciones archivadas</h3>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Las transacciones que archives aparecerán aquí
              </p>
            </div>
          ) : (
            /* No transactions at all */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-16 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 p-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                  <line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" />
                </svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-50">Sin transacciones en este período</h3>
              <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">
                Registra tu primera transacción para comenzar a organizar tus finanzas
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                Nueva transacción
              </button>
            </div>
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

export default TransaccionesPage
