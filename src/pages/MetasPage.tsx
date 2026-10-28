import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getGoals,
  getAccounts,
  createMeta,
  updateMeta,
  deleteMeta,
  toggleMetaActiva,
  createAporte,
  type Meta,
  type CreateMetaDto,
  type UpdateMetaDto,
  type CreateAporteDto,
  type MetaFiltro,
  type Account,
} from '../services/api'
import { motion, useReducedMotion } from 'motion/react'
import { formatCurrency } from '../utils/format'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { AnimatedCurrency } from '../components/dashboard/StatsCards'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import GoalCard, { ProgressRing } from '../components/goals/GoalCard'
import { metaProgreso } from '../utils/metas'
import MetaFormModal from '../components/goals/MetaFormModal'
import AporteModal from '../components/goals/AporteModal'
import AportesModal from '../components/goals/AportesModal'
import Swal from 'sweetalert2'

const FILTERS: { key: MetaFiltro; label: string }[] = [
  { key: 'TODAS', label: 'Todas' },
  { key: 'ACTIVAS', label: 'Activas' },
  { key: 'COMPLETADAS', label: 'Completadas' },
  { key: 'PAUSADAS', label: 'Pausadas' },
]

function MetasPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSidebarCollapsed()
  const [metas, setMetas] = useState<Meta[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<MetaFiltro>('ACTIVAS')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null)
  const [aporteMeta, setAporteMeta] = useState<Meta | null>(null)
  const [historialMeta, setHistorialMeta] = useState<Meta | null>(null)
  const [saving, setSaving] = useState(false)
  const reduceMotion = useReducedMotion()

  const nombre = user?.nombre ?? 'Usuario'
  const moneda = user?.monedaPredeterminada ?? 'COP'

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [goalsData, accountsData] = await Promise.all([
        getGoals(filter),
        getAccounts(),
      ])
      setMetas(goalsData)
      setAccounts(accountsData)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar metas',
        text: error instanceof Error ? error.message : 'No se pudieron cargar las metas.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: CreateMetaDto) => {
    try {
      setSaving(true)
      await createMeta(data)
      Swal.fire({
        icon: 'success',
        title: 'Meta creada',
        text: 'La meta se creó correctamente.',
        timer: 1500,
        showConfirmButton: false,
      })
      setShowCreateModal(false)
      fetchData()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear meta',
        text: error instanceof Error ? error.message : 'No se pudo crear la meta.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (data: UpdateMetaDto) => {
    if (!editingMeta) return
    try {
      setSaving(true)
      await updateMeta(editingMeta.id, data)
      Swal.fire({
        icon: 'success',
        title: 'Meta actualizada',
        timer: 1500,
        showConfirmButton: false,
      })
      setEditingMeta(null)
      fetchData()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: error instanceof Error ? error.message : 'Ocurrio un error inesperado.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (meta: Meta) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar meta?',
      text: `¿Estás seguro de eliminar "${meta.nombre}"? Se perderán los aportes asociados.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    })
    if (!result.isConfirmed) return
    try {
      await deleteMeta(meta.id)
      Swal.fire({
        icon: 'success',
        title: 'Meta eliminada',
        timer: 1500,
        showConfirmButton: false,
      })
      fetchData()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: error instanceof Error ? error.message : 'Ocurrio un error inesperado.',
      })
    }
  }

  const handleToggleActiva = async (meta: Meta) => {
    try {
      await toggleMetaActiva(meta.id, !meta.activa)
      fetchData()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Ocurrio un error inesperado.',
      })
    }
  }

  const handleAporte = async (payload: CreateAporteDto) => {
    if (!aporteMeta) return
    try {
      setSaving(true)
      await createAporte(aporteMeta.id, payload)
      Swal.fire({
        icon: 'success',
        title: 'Aporte registrado',
        timer: 1500,
        showConfirmButton: false,
      })
      setAporteMeta(null)
      fetchData()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al agregar aporte',
        text: error instanceof Error ? error.message : 'Ocurrio un error inesperado.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
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

  const totalObjetivo = metas.reduce((s, m) => s + (m.monto_objetivo || 0), 0)
  const totalActual = metas.reduce((s, m) => s + (m.monto_actual || 0), 0)
  const progresoGlobal =
    totalObjetivo > 0 ? Math.min(100, Math.round((totalActual / totalObjetivo) * 100)) : 0
  const completadas = metas.filter((m) => metaProgreso(m).completada).length
  const porAhorrar = Math.max(0, totalObjetivo - totalActual)

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        activeNav="goals"
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
                Mis metas
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Define metas de ahorro y haz seguimiento a tu progreso
              </p>
            </div>
            <motion.button
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 self-start rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 sm:self-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Nueva meta
            </motion.button>
          </div>

          {/* Resumen */}
          {!loading && metas.length > 0 && (
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
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl"
              />

              <div className="relative flex flex-wrap items-center justify-between gap-6">
                <div>
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/50">
                    Total ahorrado
                  </p>
                  <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
                    <AnimatedCurrency value={totalActual} moneda={moneda} />
                  </p>
                  <p className="mt-2 text-sm tabular-nums text-white/50">
                    de {formatCurrency(totalObjetivo, moneda)} · faltan{' '}
                    {formatCurrency(porAhorrar, moneda)}
                  </p>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <p className="text-2xl font-semibold tabular-nums">{metas.length}</p>
                    <p className="text-xs text-white/50">
                      {metas.length === 1 ? 'meta' : 'metas'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold tabular-nums text-brand-400">
                      {completadas}
                    </p>
                    <p className="text-xs text-white/50">
                      {completadas === 1 ? 'completada' : 'completadas'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-2 ring-1 ring-white/10">
                    <ProgressRing pct={progresoGlobal} color="#45c184" size={64} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Filtros */}
          <div className="mb-5 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  filter === f.key
                    ? 'bg-slate-900 font-medium text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Lista de metas */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                />
              ))}
            </div>
          ) : metas.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {metas.map((meta, i) => (
                <GoalCard
                  key={meta.id}
                  meta={meta}
                  moneda={moneda}
                  index={i}
                  onAportar={setAporteMeta}
                  onHistorial={setHistorialMeta}
                  onEdit={setEditingMeta}
                  onToggle={handleToggleActiva}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="relative isolate flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-16 dark:border-slate-700 dark:bg-slate-900">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)]"
              />
              <div className="relative mb-4 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:ring-brand-800/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600 dark:text-brand-400">
                  <circle cx="12" cy="12" r="8.5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="12" cy="12" r="0.6" />
                </svg>
              </div>
              <h3 className="relative mb-1 text-base font-semibold text-slate-900 dark:text-slate-50">
                {filter === 'TODAS' ? 'Sin metas' : `Sin metas ${filter.toLowerCase()}`}
              </h3>
              <p className="relative mb-5 text-center text-sm text-slate-500 dark:text-slate-400">
                {filter === 'TODAS'
                  ? 'Crea tu primera meta de ahorro para comenzar'
                  : 'No hay metas que coincidan con el filtro'}
              </p>
              {filter === 'TODAS' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="relative inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  Crear meta
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      <MetaFormModal
        open={showCreateModal}
        moneda={moneda}
        loading={saving}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => handleCreate(data as CreateMetaDto)}
      />
      <MetaFormModal
        open={!!editingMeta}
        meta={editingMeta}
        moneda={moneda}
        loading={saving}
        onClose={() => setEditingMeta(null)}
        onSubmit={handleUpdate}
      />
      <AportesModal
        open={!!historialMeta}
        meta={historialMeta}
        moneda={moneda}
        onClose={() => setHistorialMeta(null)}
        onChanged={fetchData}
      />
      <AporteModal
        open={!!aporteMeta}
        meta={aporteMeta}
        accounts={accounts}
        moneda={moneda}
        loading={saving}
        onClose={() => setAporteMeta(null)}
        onSubmit={handleAporte}
      />
    </div>
  )
}

export default MetasPage
