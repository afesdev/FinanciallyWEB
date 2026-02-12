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
  type Account,
} from '../services/api'
import { formatCurrency } from '../utils/format'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import MetaFormModal from '../components/goals/MetaFormModal'
import AporteModal from '../components/goals/AporteModal'
import Swal from 'sweetalert2'

const FILTERS = [
  { key: 'TODAS' as const, label: 'Todas' },
  { key: 'ACTIVAS' as const, label: 'Activas' },
  { key: 'COMPLETADAS' as const, label: 'Completadas' },
]

function MetasPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSidebarCollapsed()
  const [metas, setMetas] = useState<Meta[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ACTIVAS' | 'COMPLETADAS' | 'TODAS'>('ACTIVAS')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null)
  const [aporteMeta, setAporteMeta] = useState<Meta | null>(null)
  const [saving, setSaving] = useState(false)

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
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar metas',
        text: error?.message || 'No se pudieron cargar las metas.',
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
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear meta',
        text: error?.message || 'No se pudo crear la meta.',
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
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: error?.message,
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
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: error?.message,
      })
    }
  }

  const handleToggleActiva = async (meta: Meta) => {
    try {
      await toggleMetaActiva(meta.id, !meta.activa)
      fetchData()
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message,
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
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al agregar aporte',
        text: error?.message,
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
    else if (key === 'reports') navigate('/reports')
    else if (key === 'profile') navigate('/profile')
  }

  const totalObjetivo = metas.reduce((s, m) => s + (m.monto_objetivo || 0), 0)
  const totalActual = metas.reduce((s, m) => s + (m.monto_actual || 0), 0)

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
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Mis metas</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Define metas de ahorro y haz seguimiento a tu progreso
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-400/60 transition-all hover:bg-emerald-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Nueva meta
            </button>
          </div>

          {/* Filtros */}
          <div className="mb-6 flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  filter === f.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Resumen */}
          {!loading && metas.length > 0 && (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Total ahorrado (metas visibles)</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">{formatCurrency(totalActual, moneda)}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">de {formatCurrency(totalObjetivo, moneda)} objetivo</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Lista de metas */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="mb-3 h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mb-2 h-6 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          ) : metas.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {metas.map((meta) => {
                const progress = meta.monto_objetivo > 0
                  ? Math.min(100, Math.round((meta.monto_actual / meta.monto_objetivo) * 100))
                  : 0
                const isComplete = progress >= 100
                const color = meta.color || '#10B981'
                return (
                  <div
                    key={meta.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="h-1 w-full" style={{ backgroundColor: color }} />
                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{meta.nombre}</h3>
                          {meta.descripcion && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{meta.descripcion}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {!meta.activa && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              Inactiva
                            </span>
                          )}
                          {isComplete && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              ¡Completada!
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Progreso</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-100">{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${progress}%`, backgroundColor: color }}
                          />
                        </div>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                          {formatCurrency(meta.monto_actual, moneda)} de {formatCurrency(meta.monto_objetivo, moneda)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Objetivo: {new Date(meta.fecha_objetivo).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {meta.activa && !isComplete && (
                          <button
                            type="button"
                            onClick={() => setAporteMeta(meta)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/60 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14" />
                              <path d="M12 5v14" />
                            </svg>
                            Aportar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingMeta(meta)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActiva(meta)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                        >
                          {meta.activa ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(meta)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-500/60 dark:bg-rose-900/30 dark:text-rose-200 dark:hover:bg-rose-900/50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-16 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 rounded-full bg-emerald-50 p-4 dark:bg-emerald-900/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-50">
                {filter === 'TODAS' ? 'Sin metas' : `Sin metas ${filter.toLowerCase()}`}
              </h3>
              <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">
                {filter === 'TODAS'
                  ? 'Crea tu primera meta de ahorro para comenzar'
                  : 'No hay metas que coincidan con el filtro'}
              </p>
              {filter === 'TODAS' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-600"
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
        loading={saving}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => handleCreate(data as CreateMetaDto)}
      />
      <MetaFormModal
        open={!!editingMeta}
        meta={editingMeta}
        loading={saving}
        onClose={() => setEditingMeta(null)}
        onSubmit={handleUpdate}
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
