import { useState, useEffect, useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAccounts, createAccount, updateAccount, deleteAccount, ACCOUNT_TYPE_LABELS, type Account, type CreateAccountDto, type UpdateAccountDto } from '../services/api'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { AnimatedCurrency } from '../components/dashboard/StatsCards'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import AccountCard from '../components/accounts/AccountCard'
import AccountFormModal from '../components/accounts/AccountFormModal'
import Swal from 'sweetalert2'

const FILTERS = [
  { key: 'todas', label: 'Todas' },
  { key: 'activas', label: 'Activas' },
  { key: 'inactivas', label: 'Inactivas' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

function AccountsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSidebarCollapsed()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<FilterKey>('todas')
  const reduceMotion = useReducedMotion()

  const nombre = user?.nombre ?? 'Usuario'
  const moneda = user?.monedaPredeterminada ?? 'COP'

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const data = await getAccounts()
      setAccounts(data)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar cuentas',
        text: error instanceof Error ? error.message : 'No se pudieron cargar las cuentas.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: CreateAccountDto) => {
    try {
      setSaving(true)
      await createAccount(data)
      Swal.fire({
        icon: 'success',
        title: 'Cuenta creada',
        text: 'La cuenta se creó correctamente.',
        timer: 1500,
        showConfirmButton: false,
      })
      setShowCreateModal(false)
      fetchAccounts()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear cuenta',
        text: error instanceof Error ? error.message : 'No se pudo crear la cuenta.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (data: UpdateAccountDto) => {
    if (!editingAccount) return
    try {
      setSaving(true)
      await updateAccount(editingAccount.id, data)
      Swal.fire({
        icon: 'success',
        title: 'Cuenta actualizada',
        text: 'Los cambios se guardaron correctamente.',
        timer: 1500,
        showConfirmButton: false,
      })
      setEditingAccount(null)
      fetchAccounts()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar cuenta',
        text: error instanceof Error ? error.message : 'No se pudo actualizar la cuenta.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (account: Account) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar cuenta?',
      text: `¿Estás seguro de eliminar "${account.nombre}"? Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    })

    if (!result.isConfirmed) return

    try {
      await deleteAccount(account.id)
      Swal.fire({
        icon: 'success',
        title: 'Cuenta eliminada',
        text: 'La cuenta se eliminó correctamente.',
        timer: 1500,
        showConfirmButton: false,
      })
      fetchAccounts()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar cuenta',
        text: error instanceof Error ? error.message : 'No se pudo eliminar la cuenta.',
      })
    }
  }

  const totalBalance = accounts.reduce(
    (sum, a) => sum + (Number(a.saldo_actual ?? a.saldo_inicial ?? 0) || 0),
    0,
  )

  const saldoDe = (a: Account) => Number(a.saldo_actual ?? a.saldo_inicial ?? 0) || 0

  const distribucion = useMemo(() => {
    const positivos = accounts.filter((a) => saldoDe(a) > 0)
    const suma = positivos.reduce((s, a) => s + saldoDe(a), 0)
    if (suma <= 0) return []
    return positivos
      .map((a) => ({
        id: a.id,
        nombre: a.nombre,
        color: a.color || '#1EB256',
        pct: (saldoDe(a) / suma) * 100,
      }))
      .sort((a, b) => b.pct - a.pct)
  }, [accounts])

  const porTipo = useMemo(() => {
    const mapa = new Map<Account['tipo'], number>()
    accounts.forEach((a) => mapa.set(a.tipo, (mapa.get(a.tipo) ?? 0) + 1))
    return [...mapa.entries()].sort((a, b) => b[1] - a[1])
  }, [accounts])

  const activas = accounts.filter((a) => a.activa).length
  const visibleAccounts = accounts.filter((a) =>
    filter === 'todas' ? true : filter === 'activas' ? a.activa : !a.activa,
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        activeNav="accounts"
        sidebarOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
        nombre={nombre}
        email={user?.email}
        onNavChange={(key) => {
          if (key === 'home') navigate('/home')
          else if (key === 'accounts') navigate('/accounts')
          else if (key === 'categories') navigate('/categories')
          else if (key === 'goals') navigate('/goals')
          else if (key === 'loans') navigate('/loans')
          else if (key === 'budgets') navigate('/budgets')
          else if (key === 'transactions') navigate('/transactions')
          else if (key === 'reports') navigate('/reports')
          else if (key === 'profile') navigate('/profile')
        }}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className={`flex min-h-screen flex-1 flex-col transition-[margin] duration-200 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Navbar nombre={nombre} email={user?.email} onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">
                Mis cuentas
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Administra todas tus cuentas financieras en un solo lugar
              </p>
            </div>
            <motion.button
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
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
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Nueva cuenta
            </motion.button>
          </div>

          {/* Resumen */}
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

            <div className="relative flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/50">
                  Saldo total
                </p>
                <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
                  {loading ? (
                    <span className="inline-block h-10 w-56 animate-pulse rounded-lg bg-white/10" />
                  ) : (
                    <AnimatedCurrency value={totalBalance} moneda={moneda} />
                  )}
                </p>
                <p className="mt-2 text-sm text-white/50">
                  {accounts.length} {accounts.length === 1 ? 'cuenta' : 'cuentas'} · {activas}{' '}
                  {activas === 1 ? 'activa' : 'activas'}
                </p>
              </div>

              {porTipo.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {porTipo.map(([tipo, count]) => (
                    <span
                      key={tipo}
                      className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10"
                    >
                      {ACCOUNT_TYPE_LABELS[tipo]} · {count}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {distribucion.length > 1 && (
              <div className="relative mt-7">
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/10">
                  {distribucion.map((item, i) => (
                    <motion.span
                      key={item.id}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.7, ease: 'easeOut' }}
                      style={{ backgroundColor: item.color }}
                      className="h-full first:rounded-l-full last:rounded-r-full"
                    />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  {distribucion.slice(0, 5).map((item) => (
                    <span key={item.id} className="flex items-center gap-2 text-xs text-white/60">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.nombre}
                      <span className="tabular-nums text-white/40">{item.pct.toFixed(0)}%</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Filtros */}
          {!loading && accounts.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {FILTERS.map((item) => {
                const count =
                  item.key === 'todas'
                    ? accounts.length
                    : item.key === 'activas'
                      ? activas
                      : accounts.length - activas
                return (
                  <button
                    key={item.key}
                    onClick={() => setFilter(item.key)}
                    className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                      filter === item.key
                        ? 'bg-slate-900 font-medium text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    {item.label}
                    <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Lista de cuentas */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="min-h-[210px] animate-pulse rounded-3xl bg-slate-200/70 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : visibleAccounts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleAccounts.map((account, i) => {
                const share = distribucion.find((d) => d.id === account.id)
                return (
                  <AccountCard
                    key={account.id}
                    account={account}
                    index={i}
                    sharePct={share?.pct}
                    onEdit={setEditingAccount}
                    onDelete={handleDelete}
                  />
                )
              })}
            </div>
          ) : accounts.length > 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-14 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No tienes cuentas {filter === 'activas' ? 'activas' : 'inactivas'}.
              </p>
              <button
                onClick={() => setFilter('todas')}
                className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Ver todas
              </button>
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
                  <rect x="3" y="6" width="18" height="13" rx="3" />
                  <path d="M3 10.5h18" />
                  <circle cx="17" cy="14.75" r="1.1" />
                </svg>
              </div>
              <h3 className="relative mb-1 text-base font-semibold text-slate-900 dark:text-slate-50">
                Sin cuentas aún
              </h3>
              <p className="relative mb-5 text-center text-sm text-slate-500 dark:text-slate-400">
                Crea tu primera cuenta para comenzar a organizar tus finanzas
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="relative inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
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
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Crear cuenta
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modales */}
      <AccountFormModal
        open={showCreateModal}
        defaultMoneda={moneda}
        loading={saving}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => handleCreate(data as CreateAccountDto)}
      />

      <AccountFormModal
        open={!!editingAccount}
        account={editingAccount}
        defaultMoneda={moneda}
        loading={saving}
        onClose={() => setEditingAccount(null)}
        onSubmit={handleUpdate}
      />
    </div>
  )
}

export default AccountsPage
