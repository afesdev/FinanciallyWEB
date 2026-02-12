import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getCategories,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  type Categoria,
  type CreateCategoriaDto,
  type UpdateCategoriaDto,
} from '../services/api'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import CategoriaFormModal from '../components/categories/CategoriaFormModal'
import Swal from 'sweetalert2'

const TIPO_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  GASTO: { label: 'Gasto', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  INGRESO: { label: 'Ingreso', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  AMBOS: { label: 'Ambos', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
}

const FILTERS = [
  { key: 'ALL', label: 'Todas' },
  { key: 'GASTO', label: 'Gastos' },
  { key: 'INGRESO', label: 'Ingresos' },
  { key: 'AMBOS', label: 'Ambos' },
]

function CategoriasPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSidebarCollapsed()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('ALL')

  const nombre = user?.nombre ?? 'Usuario'

  useEffect(() => {
    fetchCategorias()
  }, [])

  const fetchCategorias = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategorias(data)
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar categorias',
        text: error?.message || 'No se pudieron cargar las categorias.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: CreateCategoriaDto) => {
    try {
      setSaving(true)
      await createCategoria(data)
      Swal.fire({ icon: 'success', title: 'Categoria creada', timer: 1500, showConfirmButton: false })
      setShowCreateModal(false)
      fetchCategorias()
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error al crear', text: error?.message })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (data: UpdateCategoriaDto) => {
    if (!editingCategoria) return
    try {
      setSaving(true)
      await updateCategoria(editingCategoria.id, data)
      Swal.fire({ icon: 'success', title: 'Categoria actualizada', timer: 1500, showConfirmButton: false })
      setEditingCategoria(null)
      fetchCategorias()
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error al actualizar', text: error?.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (categoria: Categoria) => {
    if (categoria.usuarioId == null) {
      Swal.fire({ icon: 'error', title: 'No se puede eliminar', text: 'Las categorías del sistema no se pueden eliminar.' })
      return
    }
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar categoría?',
      text: `¿Estás seguro de eliminar "${categoria.nombre}"? Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    })
    if (!result.isConfirmed) return
    try {
      await deleteCategoria(Number(categoria.id))
      Swal.fire({ icon: 'success', title: 'Categoría eliminada', timer: 1500, showConfirmButton: false })
      fetchCategorias()
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error al eliminar', text: error?.message })
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

  const filtered = filter === 'ALL' ? categorias : categorias.filter((c) => c.tipo === filter)
  const countGasto = categorias.filter((c) => c.tipo === 'GASTO').length
  const countIngreso = categorias.filter((c) => c.tipo === 'INGRESO').length
  const countAmbos = categorias.filter((c) => c.tipo === 'AMBOS').length

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        activeNav="categories"
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
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Categorias</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Organiza tus ingresos y gastos con categorias personalizadas
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-400/60 transition-all hover:bg-emerald-600 hover:shadow-emerald-400/90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Nueva categoria
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Gastos</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{loading ? '...' : countGasto}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Ingresos</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{loading ? '...' : countIngreso}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Ambos</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{loading ? '...' : countAmbos}</p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-5 flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  filter === f.key
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                {f.label}
                {!loading && (
                  <span className="ml-1.5 opacity-70">
                    {f.key === 'ALL' ? categorias.length : categorias.filter((c) => c.tipo === f.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1">
                      <div className="mb-1.5 h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((cat) => {
                const tipo = TIPO_CONFIG[cat.tipo] ?? TIPO_CONFIG.AMBOS
                const catColor = cat.color || '#94a3b8'
                return (
                  <div
                    key={cat.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                  >
                    {/* Color accent */}
                    <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl" style={{ backgroundColor: catColor }} />

                    {/* Content */}
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-sm font-bold"
                        style={{ backgroundColor: catColor }}
                      >
                        {cat.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">{cat.nombre}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tipo.bg} ${tipo.text}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${tipo.dot}`} />
                            {tipo.label}
                          </span>
                          {!cat.activo && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                              Inactiva
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                      {cat.usuarioId != null && (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingCategoria(cat)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-100"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                              <path d="m15 5 4 4"/>
                            </svg>
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-100"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"/>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                              <line x1="10" x2="10" y1="11" y2="17"/>
                              <line x1="14" x2="14" y1="11" y2="17"/>
                            </svg>
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-16 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 rounded-full bg-emerald-50 p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z"/><path d="M7 7h.01"/></svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-50">
                {filter === 'ALL' ? 'Sin categorias aun' : 'Sin categorias de este tipo'}
              </h3>
              <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">
                {filter === 'ALL'
                  ? 'Crea tu primera categoria para organizar tus finanzas'
                  : 'No hay categorias que coincidan con el filtro seleccionado'}
              </p>
              {filter === 'ALL' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-400/60 transition-all hover:bg-emerald-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Crear categoria
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      <CategoriaFormModal
        open={showCreateModal}
        loading={saving}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => handleCreate(data as CreateCategoriaDto)}
      />
      <CategoriaFormModal
        open={!!editingCategoria}
        categoria={editingCategoria}
        loading={saving}
        onClose={() => setEditingCategoria(null)}
        onSubmit={handleUpdate}
      />
    </div>
  )
}

export default CategoriasPage
