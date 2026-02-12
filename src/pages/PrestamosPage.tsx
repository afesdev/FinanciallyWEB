import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getPrestamos,
  getAccounts,
  createPrestamo,
  updatePrestamo,
  deletePrestamo,
  togglePrestamo,
  createPagoPrestamo,
  getPagosPrestamo,
  type Prestamo,
  type CreatePrestamoDto,
  type UpdatePrestamoDto,
  type CreatePagoPrestamoDto,
  type PagoPrestamo,
  type Account,
} from '../services/api'
import { formatCurrency } from '../utils/format'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import PrestamoFormModal from '../components/loans/PrestamoFormModal'
import PagoPrestamoModal from '../components/loans/PagoPrestamoModal'
import Swal from 'sweetalert2'

const FILTERS = [
  { key: 'activos' as const, label: 'Activos' },
  { key: 'todos' as const, label: 'Todos' },
]

function PrestamosPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSidebarCollapsed()
  const [prestamos, setPrestamos] = useState<Prestamo[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [filterActivos, setFilterActivos] = useState<'activos' | 'todos'>('activos')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPrestamo, setEditingPrestamo] = useState<Prestamo | null>(null)
  const [pagoPrestamo, setPagoPrestamo] = useState<Prestamo | null>(null)
  const [pagosPrestamo, setPagosPrestamo] = useState<Prestamo | null>(null)
  const [pagosList, setPagosList] = useState<PagoPrestamo[]>([])
  const [saving, setSaving] = useState(false)

  const nombre = user?.nombre ?? 'Usuario'
  const moneda = user?.monedaPredeterminada ?? 'COP'

  const fetchPrestamos = async () => {
    try {
      setLoading(true)
      const activosSolo = filterActivos === 'activos'
      const [data, accountsData] = await Promise.all([
        getPrestamos(activosSolo),
        getAccounts(),
      ])
      setPrestamos(data)
      setAccounts(accountsData)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudieron cargar los préstamos.'
      Swal.fire({ icon: 'error', title: 'Error al cargar préstamos', text: msg })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrestamos()
  }, [filterActivos])

  const loadPagos = async (prestamo: Prestamo) => {
    try {
      const list = await getPagosPrestamo(prestamo.id)
      setPagosList(Array.isArray(list) ? list : [])
      setPagosPrestamo(prestamo)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudieron cargar los pagos.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    }
  }

  const handleCreate = async (data: CreatePrestamoDto) => {
    try {
      setSaving(true)
      await createPrestamo(data)
      Swal.fire({ icon: 'success', title: 'Préstamo creado', timer: 1500, showConfirmButton: false })
      setShowCreateModal(false)
      fetchPrestamos()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo crear el préstamo.'
      Swal.fire({ icon: 'error', title: 'Error al crear', text: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (data: UpdatePrestamoDto) => {
    if (!editingPrestamo) return
    try {
      setSaving(true)
      await updatePrestamo(editingPrestamo.id, data)
      Swal.fire({ icon: 'success', title: 'Préstamo actualizado', timer: 1500, showConfirmButton: false })
      setEditingPrestamo(null)
      fetchPrestamos()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo actualizar.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p: Prestamo) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar préstamo?',
      text: `¿Estás seguro de eliminar "${p.nombre}"? Los pagos asociados también se eliminarán.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    })
    if (!result.isConfirmed) return
    try {
      await deletePrestamo(p.id)
      Swal.fire({ icon: 'success', title: 'Préstamo eliminado', timer: 1500, showConfirmButton: false })
      fetchPrestamos()
      if (pagosPrestamo?.id === p.id) setPagosPrestamo(null)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo eliminar.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    }
  }

  const handleToggle = async (p: Prestamo) => {
    try {
      await togglePrestamo(p.id, !p.activa)
      fetchPrestamos()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al cambiar estado.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    }
  }

  const handlePago = async (payload: CreatePagoPrestamoDto) => {
    if (!pagoPrestamo) return
    try {
      setSaving(true)
      await createPagoPrestamo(pagoPrestamo.id, payload)
      Swal.fire({ icon: 'success', title: 'Pago registrado', timer: 1500, showConfirmButton: false })
      setPagoPrestamo(null)
      fetchPrestamos()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo registrar el pago.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    } finally {
      setSaving(false)
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
        activeNav="loans"
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
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Préstamos</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gestiona préstamos y deudas, y registra pagos</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-400/60 transition-all hover:bg-emerald-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Nuevo préstamo
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
          ) : prestamos.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {prestamos.map((p) => {
                const pendiente = p.saldo_pendiente ?? (p.monto_total - (p.monto_pagado ?? 0))
                const pagado = p.monto_pagado ?? (p.monto_total - pendiente)
                const progress = p.monto_total > 0 ? Math.min(100, Math.round((pagado / p.monto_total) * 100)) : 0
                const isDeuda = p.tipo === 'DEUDA'
                const tipoLabel = isDeuda ? 'Debo' : 'Me deben'
                return (
                  <div
                    key={p.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className={`h-1 w-full ${isDeuda ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{p.nombre}</h3>
                          <span
                            className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              isDeuda
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                            }`}
                          >
                            {isDeuda ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M12 19V5M5 12l7 7 7-7"/></svg>
                                {tipoLabel}
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                                {tipoLabel}
                              </>
                            )}
                          </span>
                        </div>
                        {!p.activa && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <div className="mb-3">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Progreso</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-100">{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div className={`h-full rounded-full transition-all ${isDeuda ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${progress}%` }} />
                        </div>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                          {formatCurrency(pagado, moneda)} de {formatCurrency(p.monto_total, moneda)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Pendiente: {formatCurrency(pendiente, moneda)}</p>
                        {p.fecha_inicio && (
                          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                            Inicio: {new Date(p.fecha_inicio).toLocaleDateString('es-CO')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {p.activa && pendiente > 0 && (
                          <button
                            type="button"
                            onClick={() => setPagoPrestamo(p)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/60 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
                          >
                            Registrar pago
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => loadPagos(p)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                        >
                          Ver pagos
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPrestamo(p)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(p)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                        >
                          {p.activa ? 'Desactivar' : 'Activar'}
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
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-50">Sin préstamos</h3>
              <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">
                {filterActivos === 'activos' ? 'No tienes préstamos activos' : 'Crea tu primer préstamo o deuda'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Nuevo préstamo
              </button>
            </div>
          )}

          {/* Modal lista de pagos */}
          {pagosPrestamo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Pagos: {pagosPrestamo.nombre}</h2>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-100"
                    onClick={() => { setPagosPrestamo(null); setPagosList([]) }}
                  >
                    ✕
                  </button>
                </div>
                <ul className="max-h-80 space-y-2 overflow-y-auto">
                  {pagosList.length === 0 ? (
                    <li className="text-sm text-slate-500 dark:text-slate-400">No hay pagos registrados</li>
                  ) : (
                    pagosList.map((pag) => (
                      <li
                        key={pag.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                      >
                        <span className="text-slate-900 dark:text-slate-50">
                          {formatCurrency(pag.monto ?? (pag as any).monto_pago ?? 0, moneda)}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {pag.fecha_pago ? new Date(pag.fecha_pago).toLocaleDateString('es-CO') : '-'}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>

      <PrestamoFormModal
        open={showCreateModal}
        accounts={accounts}
        loading={saving}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => handleCreate(data as CreatePrestamoDto)}
      />
      <PrestamoFormModal
        open={!!editingPrestamo}
        prestamo={editingPrestamo ?? undefined}
        accounts={accounts}
        loading={saving}
        onClose={() => setEditingPrestamo(null)}
        onSubmit={handleUpdate}
      />
      <PagoPrestamoModal
        open={!!pagoPrestamo}
        prestamo={pagoPrestamo}
        accounts={accounts}
        moneda={moneda}
        loading={saving}
        onClose={() => setPagoPrestamo(null)}
        onSubmit={handlePago}
      />
    </div>
  )
}

export default PrestamosPage
