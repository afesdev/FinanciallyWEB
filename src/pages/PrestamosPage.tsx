import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'motion/react'
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
  type Prestamo,
  type CreatePrestamoDto,
  type UpdatePrestamoDto,
  type CreatePagoPrestamoDto,
  type PrestamoFiltro,
  type Account,
} from '../services/api'
import { formatCurrency } from '../utils/format'
import { prestamoProgreso } from '../utils/prestamos'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { AnimatedCurrency } from '../components/dashboard/StatsCards'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import LoanCard from '../components/loans/LoanCard'
import PrestamoFormModal from '../components/loans/PrestamoFormModal'
import PagoPrestamoModal from '../components/loans/PagoPrestamoModal'
import PagosPrestamoModal from '../components/loans/PagosPrestamoModal'
import Swal from 'sweetalert2'

const FILTERS = [
  { key: 'ACTIVOS', label: 'Activos' },
  { key: 'debo', label: 'Yo debo' },
  { key: 'medeben', label: 'Me deben' },
  { key: 'SALDADOS', label: 'Saldados' },
  { key: 'TODOS', label: 'Todos' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

function filtroServidor(filtro: FilterKey): PrestamoFiltro {
  if (filtro === 'SALDADOS') return 'SALDADOS'
  if (filtro === 'TODOS') return 'TODOS'
  return 'ACTIVOS'
}

function PrestamosPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSidebarCollapsed()
  const [prestamos, setPrestamos] = useState<Prestamo[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<FilterKey>('ACTIVOS')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPrestamo, setEditingPrestamo] = useState<Prestamo | null>(null)
  const [pagoPrestamo, setPagoPrestamo] = useState<Prestamo | null>(null)
  const [historialPrestamo, setHistorialPrestamo] = useState<Prestamo | null>(null)
  const [saving, setSaving] = useState(false)
  const reduceMotion = useReducedMotion()

  const nombre = user?.nombre ?? 'Usuario'
  const moneda = user?.monedaPredeterminada ?? 'COP'

  const fetchPrestamos = async () => {
    try {
      setLoading(true)
      const [data, accountsData] = await Promise.all([
        getPrestamos(filtroServidor(filtro)),
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
  }, [filtro])

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
      if (historialPrestamo?.id === p.id) setHistorialPrestamo(null)
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
    else if (key === 'dashboard') navigate('/dashboard')
    else if (key === 'reports') navigate('/reports')
    else if (key === 'profile') navigate('/profile')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const totalDebo = prestamos
    .filter((p) => p.tipo === 'DEUDA')
    .reduce((s, p) => s + prestamoProgreso(p).pendiente, 0)
  const totalMeDeben = prestamos
    .filter((p) => p.tipo === 'PRESTAMO')
    .reduce((s, p) => s + prestamoProgreso(p).pendiente, 0)
  const neto = totalMeDeben - totalDebo
  const maximo = Math.max(totalDebo, totalMeDeben, 1)

  const visibles = prestamos.filter((p) => {
    if (filtro === 'debo') return p.tipo === 'DEUDA'
    if (filtro === 'medeben') return p.tipo === 'PRESTAMO'
    return true
  })

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
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">
                Préstamos
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Lo que debes y lo que te deben, con su historial de pagos
              </p>
            </div>
            <motion.button
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 self-start rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 sm:self-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Nuevo préstamo
            </motion.button>
          </div>

          {!loading && prestamos.length > 0 && (
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
                style={{ backgroundColor: neto >= 0 ? 'rgba(30,178,86,0.25)' : 'rgba(244,63,94,0.22)' }}
              />

              <div className="relative">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/50">
                  Posición neta
                </p>
                <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
                  <span className={neto >= 0 ? 'text-brand-400' : 'text-rose-400'}>
                    {neto < 0 && '−'}
                    <AnimatedCurrency value={Math.abs(neto)} moneda={moneda} />
                  </span>
                </p>
                <p className="mt-2 text-sm text-white/50">
                  {neto > 0
                    ? 'A tu favor: te deben más de lo que debes'
                    : neto < 0
                      ? 'En contra: debes más de lo que te deben'
                      : 'Estás en equilibrio'}
                </p>
              </div>

              <div className="relative mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-white/60">Yo debo</span>
                    <span className="text-sm font-semibold tabular-nums text-rose-300">
                      {formatCurrency(totalDebo, moneda)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: `${(totalDebo / maximo) * 100}%` }}
                      transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
                      className="block h-full rounded-full bg-rose-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-white/60">Me deben</span>
                    <span className="text-sm font-semibold tabular-nums text-brand-300">
                      {formatCurrency(totalMeDeben, moneda)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: `${(totalMeDeben / maximo) * 100}%` }}
                      transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
                      className="block h-full rounded-full bg-brand-400"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mb-5 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
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
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                />
              ))}
            </div>
          ) : visibles.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibles.map((p, i) => (
                <LoanCard
                  key={p.id}
                  prestamo={p}
                  moneda={moneda}
                  index={i}
                  onPagar={setPagoPrestamo}
                  onPagos={setHistorialPrestamo}
                  onEdit={setEditingPrestamo}
                  onToggle={handleToggle}
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
                  <circle cx="9" cy="8" r="3.25" />
                  <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
                  <path d="M16 5.4a3.25 3.25 0 0 1 0 5.2" />
                  <path d="M18.5 20a5.6 5.6 0 0 0-2.6-4.7" />
                </svg>
              </div>
              <h3 className="relative mb-1 text-base font-semibold text-slate-900 dark:text-slate-50">
                {prestamos.length === 0 ? 'Sin préstamos' : 'Nada con ese filtro'}
              </h3>
              <p className="relative mb-5 text-center text-sm text-slate-500 dark:text-slate-400">
                {prestamos.length === 0
                  ? 'Registra lo que debes o lo que te deben para no perderle el rastro'
                  : 'Prueba con otro filtro para ver el resto'}
              </p>
              {prestamos.length === 0 ? (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="relative inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Nuevo préstamo
                </button>
              ) : (
                <button
                  onClick={() => setFiltro('TODOS')}
                  className="relative text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Ver todos
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      <PrestamoFormModal
        open={showCreateModal}
        accounts={accounts}
        moneda={moneda}
        loading={saving}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => handleCreate(data as CreatePrestamoDto)}
      />
      <PrestamoFormModal
        open={!!editingPrestamo}
        prestamo={editingPrestamo}
        accounts={accounts}
        moneda={moneda}
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
      <PagosPrestamoModal
        open={!!historialPrestamo}
        prestamo={historialPrestamo}
        moneda={moneda}
        onClose={() => setHistorialPrestamo(null)}
        onChanged={fetchPrestamos}
      />
    </div>
  )
}

export default PrestamosPage
