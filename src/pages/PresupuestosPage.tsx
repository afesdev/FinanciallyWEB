import { useState, useEffect } from 'react'
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
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import PresupuestoFormModal from '../components/budgets/PresupuestoFormModal'
import Swal from 'sweetalert2'

const FILTERS = [
  { key: 'activos' as const, label: 'Activos' },
  { key: 'todos' as const, label: 'Todos' },
]

const PERIODO_LABEL: Record<string, string> = {
  SEMANAL: 'Semanal',
  MENSUAL: 'Mensual',
  ANUAL: 'Anual',
  PERSONALIZADO: 'Personalizado',
}

function PresupuestosPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSidebarCollapsed()
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [filterActivos, setFilterActivos] = useState<'activos' | 'todos'>('activos')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPresupuesto, setEditingPresupuesto] = useState<Presupuesto | null>(null)
  const [saving, setSaving] = useState(false)
  const [recalcId, setRecalcId] = useState<number | null>(null)

  const nombre = user?.nombre ?? 'Usuario'
  const moneda = user?.monedaPredeterminada ?? 'COP'

  const fetchData = async () => {
    try {
      setLoading(true)
      const activosSolo = filterActivos === 'activos'
      const [budgetsData, accountsData, categoriesData] = await Promise.all([
        getBudgets(activosSolo),
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
  }, [filterActivos])

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
      Swal.fire({ icon: 'success', title: 'Gasto actualizado', timer: 1200, showConfirmButton: false })
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
    else if (key === 'reports') navigate('/reports')
    else if (key === 'profile') navigate('/profile')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Presupuestos</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Controla tus gastos por categoría o período
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-400/60 transition-all hover:bg-emerald-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Nuevo presupuesto
            </button>
          </div>

          <div className="mb-6 flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterActivos(f.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  filterActivos === f.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

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
          ) : presupuestos.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {presupuestos.map((p) => {
                const gastado = p.monto_gastado ?? 0
                const limite = p.monto_limite || 1
                const progress = Math.min(100, Math.round((gastado / limite) * 100))
                const isOver = gastado > limite
                return (
                  <div
                    key={p.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className={`h-1 w-full ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{p.nombre}</h3>
                          <span className="mt-0.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {PERIODO_LABEL[p.periodo] ?? p.periodo}
                          </span>
                        </div>
                        {!p.activo && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <div className="mb-3">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Gastado</span>
                          <span
                            className={`font-semibold ${
                              isOver ? 'text-rose-600 dark:text-rose-300' : 'text-slate-700 dark:text-slate-100'
                            }`}
                          >
                            {progress}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                          {formatCurrency(gastado, moneda)} de {formatCurrency(limite, moneda)}
                        </p>
                        {p.fecha_inicio && p.fecha_fin && (
                          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                            {new Date(p.fecha_inicio).toLocaleDateString('es-CO')} – {new Date(p.fecha_fin).toLocaleDateString('es-CO')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleRecalc(p)}
                          disabled={recalcId === p.id}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                        >
                          {recalcId === p.id ? 'Actualizando...' : 'Actualizar gasto'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPresupuesto(p)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(p)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                        >
                          {p.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
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
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                  <line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>
                </svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-50">Sin presupuestos</h3>
              <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">
                {filterActivos === 'activos' ? 'No tienes presupuestos activos' : 'Crea tu primer presupuesto para controlar gastos'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Nuevo presupuesto
              </button>
            </div>
          )}
        </main>
      </div>

      <PresupuestoFormModal
        open={showCreateModal}
        accounts={accounts}
        categories={categories}
        loading={saving}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => handleCreate(data as CreatePresupuestoDto)}
      />
      <PresupuestoFormModal
        open={!!editingPresupuesto}
        presupuesto={editingPresupuesto ?? undefined}
        accounts={accounts}
        categories={categories}
        loading={saving}
        onClose={() => setEditingPresupuesto(null)}
        onSubmit={handleUpdate}
      />
    </div>
  )
}

export default PresupuestosPage
