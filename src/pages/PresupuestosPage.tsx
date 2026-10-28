import { useState, useEffect, useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getBudgets,
  getAccounts,
  getCategories,
  createPresupuesto,
  updatePresupuesto,
  deletePresupuesto,
  togglePresupuesto,
  recalcPresupuesto,
  type Presupuesto,
  type CreatePresupuestoDto,
  type UpdatePresupuestoDto,
  type Account,
  type Categoria,
} from '../services/api'
import { formatCurrency } from '../utils/format'
import { presupuestoResumen } from '../utils/presupuestos'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { AnimatedCurrency } from '../components/dashboard/StatsCards'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import BudgetCard from '../components/budgets/BudgetCard'
import PresupuestoFormModal from '../components/budgets/PresupuestoFormModal'
import Swal from 'sweetalert2'

const FILTERS = [
  { key: 'activos', label: 'Activos' },
  { key: 'riesgo', label: 'En riesgo' },
  { key: 'excedidos', label: 'Excedidos' },
  { key: 'todos', label: 'Todos' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

function PresupuestosPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSidebarCollapsed()
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<FilterKey>('activos')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPresupuesto, setEditingPresupuesto] = useState<Presupuesto | null>(null)
  const [saving, setSaving] = useState(false)
  const [recalcId, setRecalcId] = useState<number | null>(null)
  const reduceMotion = useReducedMotion()

  const nombre = user?.nombre ?? 'Usuario'
  const moneda = user?.monedaPredeterminada ?? 'COP'

  const fetchData = async () => {
    try {
      setLoading(true)
      const [budgetsData, accountsData, categoriesData] = await Promise.all([
        getBudgets(filtro === 'todos' ? undefined : true),
        getAccounts(),
        getCategories(),
      ])
      setPresupuestos(budgetsData)
      setAccounts(accountsData)
      setCategories(categoriesData)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudieron cargar los presupuestos.'
      Swal.fire({ icon: 'error', title: 'Error al cargar presupuestos', text: msg })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filtro])

  const handleCreate = async (data: CreatePresupuestoDto) => {
    try {
      setSaving(true)
      await createPresupuesto(data)
      Swal.fire({ icon: 'success', title: 'Presupuesto creado', timer: 1500, showConfirmButton: false })
      setShowCreateModal(false)
      fetchData()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo crear el presupuesto.'
      Swal.fire({ icon: 'error', title: 'Error al crear', text: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (data: UpdatePresupuestoDto) => {
    if (!editingPresupuesto) return
    try {
      setSaving(true)
      await updatePresupuesto(editingPresupuesto.id, data)
      Swal.fire({ icon: 'success', title: 'Presupuesto actualizado', timer: 1500, showConfirmButton: false })
      setEditingPresupuesto(null)
      fetchData()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo actualizar.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p: Presupuesto) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar presupuesto?',
      text: `¿Estás seguro de eliminar "${p.nombre}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    })
    if (!result.isConfirmed) return
    try {
      await deletePresupuesto(p.id)
      Swal.fire({ icon: 'success', title: 'Presupuesto eliminado', timer: 1500, showConfirmButton: false })
      fetchData()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo eliminar.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    }
  }

  const handleToggle = async (p: Presupuesto) => {
    try {
      await togglePresupuesto(p.id, !p.activo)
      fetchData()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al cambiar estado.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    }
  }

  const handleRecalc = async (p: Presupuesto) => {
    try {
      setRecalcId(p.id)
      await recalcPresupuesto(p.id)
      fetchData()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo recalcular.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    } finally {
      setRecalcId(null)
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

  const categoriaPorId = useMemo(() => {
    const mapa = new Map<number, Categoria>()
    categories.forEach((c) => mapa.set(c.id, c))
    return mapa
  }, [categories])

  const cuentaPorId = useMemo(() => {
    const mapa = new Map<number, Account>()
    accounts.forEach((a) => mapa.set(a.id, a))
    return mapa
  }, [accounts])

  const totalLimite = presupuestos.reduce((s, p) => s + (Number(p.monto_limite) || 0), 0)
  const totalGastado = presupuestos.reduce((s, p) => s + (Number(p.monto_gastado) || 0), 0)
  const totalDisponible = Math.max(0, totalLimite - totalGastado)
  const pctGlobal = totalLimite > 0 ? Math.min(100, (totalGastado / totalLimite) * 100) : 0

  const excedidos = presupuestos.filter((p) => presupuestoResumen(p).estado === 'EXCEDIDO').length
  const enRiesgo = presupuestos.filter((p) => presupuestoResumen(p).estado === 'EN_RIESGO').length

  const visibles = presupuestos.filter((p) => {
    if (filtro === 'excedidos') return presupuestoResumen(p).estado === 'EXCEDIDO'
    if (filtro === 'riesgo') return presupuestoResumen(p).estado === 'EN_RIESGO'
    return true
  })

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        activeNav="budgets"
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
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">
                Presupuestos
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Cuánto puedes gastar y cómo vas frente al ritmo del periodo
              </p>
            </div>
            <motion.button
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 self-start rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 sm:self-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Nuevo presupuesto
            </motion.button>
          </div>

          {!loading && presupuestos.length > 0 && (
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
                style={{
                  backgroundColor: excedidos > 0 ? 'rgba(244,63,94,0.22)' : 'rgba(30,178,86,0.25)',
                }}
              />

              <div className="relative flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/50">
                    Disponible en total
                  </p>
                  <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
                    <AnimatedCurrency value={totalDisponible} moneda={moneda} />
                  </p>
                  <p className="mt-2 text-sm tabular-nums text-white/50">
                    Llevas {formatCurrency(totalGastado, moneda)} de{' '}
                    {formatCurrency(totalLimite, moneda)}
                  </p>
                </div>

                <div className="flex gap-5">
                  <div className="text-right">
                    <p className="text-2xl font-semibold tabular-nums">{presupuestos.length}</p>
                    <p className="text-xs text-white/50">
                      {presupuestos.length === 1 ? 'presupuesto' : 'presupuestos'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold tabular-nums text-amber-300">{enRiesgo}</p>
                    <p className="text-xs text-white/50">en riesgo</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold tabular-nums text-rose-300">{excedidos}</p>
                    <p className="text-xs text-white/50">
                      {excedidos === 1 ? 'excedido' : 'excedidos'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative mt-7">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${pctGlobal}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                    className="block h-full rounded-full"
                    style={{ backgroundColor: excedidos > 0 ? '#F43F5E' : '#45c184' }}
                  />
                </div>
                <p className="mt-2 text-xs tabular-nums text-white/50">
                  {Math.round(pctGlobal)}% del total presupuestado
                </p>
              </div>
            </motion.div>
          )}

          <div className="mb-5 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const count =
                f.key === 'excedidos' ? excedidos : f.key === 'riesgo' ? enRiesgo : null
              return (
                <button
                  key={f.key}
                  onClick={() => setFiltro(f.key)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                    filtro === f.key
                      ? 'bg-slate-900 font-medium text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {f.label}
                  {count !== null && count > 0 && (
                    <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
                  )}
                </button>
              )
            })}
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                />
              ))}
            </div>
          ) : visibles.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibles.map((p, i) => {
                const categoria = p.categoria_id ? categoriaPorId.get(p.categoria_id) : undefined
                const cuenta = p.cuenta_id ? cuentaPorId.get(p.cuenta_id) : undefined
                return (
                  <BudgetCard
                    key={p.id}
                    presupuesto={p}
                    moneda={moneda}
                    index={i}
                    categoriaNombre={categoria?.nombre}
                    categoriaColor={categoria?.color}
                    cuentaNombre={cuenta?.nombre}
                    recalculando={recalcId === p.id}
                    onRecalc={handleRecalc}
                    onEdit={setEditingPresupuesto}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                )
              })}
            </div>
          ) : (
            <div className="relative isolate flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-16 dark:border-slate-700 dark:bg-slate-900">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)]"
              />
              <div className="relative mb-4 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:ring-brand-800/50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-brand-600 dark:text-brand-400"
                >
                  <path d="M3 20h18" />
                  <path d="M6.5 20v-6" />
                  <path d="M12 20V5" />
                  <path d="M17.5 20v-9" />
                </svg>
              </div>
              <h3 className="relative mb-1 text-base font-semibold text-slate-900 dark:text-slate-50">
                {presupuestos.length === 0 ? 'Sin presupuestos' : 'Nada con ese filtro'}
              </h3>
              <p className="relative mb-5 text-center text-sm text-slate-500 dark:text-slate-400">
                {presupuestos.length === 0
                  ? 'Define un límite de gasto y te avisamos antes de que te pases'
                  : filtro === 'excedidos'
                    ? 'Ningún presupuesto se ha excedido. Buena señal.'
                    : 'Ningún presupuesto va a ritmo alto ahora mismo.'}
              </p>
              {presupuestos.length === 0 ? (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="relative inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Nuevo presupuesto
                </button>
              ) : (
                <button
                  onClick={() => setFiltro('activos')}
                  className="relative text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Ver activos
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      <PresupuestoFormModal
        open={showCreateModal}
        accounts={accounts}
        categories={categories}
        moneda={moneda}
        loading={saving}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => handleCreate(data as CreatePresupuestoDto)}
      />
      <PresupuestoFormModal
        open={!!editingPresupuesto}
        presupuesto={editingPresupuesto}
        accounts={accounts}
        categories={categories}
        moneda={moneda}
        loading={saving}
        onClose={() => setEditingPresupuesto(null)}
        onSubmit={handleUpdate}
      />
    </div>
  )
}

export default PresupuestosPage
