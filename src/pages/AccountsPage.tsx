import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAccounts, createAccount, updateAccount, deleteAccount, type Account, type CreateAccountDto, type UpdateAccountDto } from '../services/api'
import { formatCurrency } from '../utils/format'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import AccountFormModal from '../components/accounts/AccountFormModal'
import Swal from 'sweetalert2'

const ACCOUNT_TYPE_LABELS: Record<Account['tipo'], string> = {
  BANCARIA: 'Bancaria',
  EFECTIVO: 'Efectivo',
  TARJETA_CREDITO: 'Tarjeta de crédito',
  TARJETA_DEBITO: 'Tarjeta de débito',
  DIGITAL: 'Digital',
  AHORRO: 'Ahorro',
  INVERSION: 'Inversión',
}

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
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar cuentas',
        text: error?.message || 'No se pudieron cargar las cuentas.',
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
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear cuenta',
        text: error?.message || 'No se pudo crear la cuenta.',
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
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar cuenta',
        text: error?.message || 'No se pudo actualizar la cuenta.',
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
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar cuenta',
        text: error?.message || 'No se pudo eliminar la cuenta.',
      })
    }
  }

  const totalBalance = accounts.reduce(
    (sum, a) => sum + (Number(a.saldo_actual ?? a.saldo_inicial ?? 0) || 0),
    0,
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Mis cuentas</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Administra todas tus cuentas financieras en un solo lugar
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-400/60 transition-all hover:bg-emerald-600 hover:shadow-emerald-400/90"
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
            </button>
          </div>

          {/* Resumen */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Saldo total
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {loading ? '...' : formatCurrency(totalBalance, moneda)}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {accounts.length} {accounts.length === 1 ? 'cuenta' : 'cuentas'} registradas
                </p>
              </div>
              <div className="rounded-full bg-emerald-50 p-4 dark:bg-emerald-900/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-600"
                >
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Lista de cuentas */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="mb-3 h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mb-2 h-6 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          ) : accounts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => {
                const saldo = Number(account.saldo_actual ?? account.saldo_inicial ?? 0)
                const accountColor = account.color || '#10B981'
                return (
                  <div
                    key={account.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                  >
                    {/* Barra de color superior */}
                    <div
                      className="absolute left-0 top-0 h-1 w-full"
                      style={{ backgroundColor: accountColor }}
                    />

                    {/* Header de la tarjeta */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{account.nombre}</h3>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {ACCOUNT_TYPE_LABELS[account.tipo]}
                        </p>
                      </div>
                      {!account.activa && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Inactiva
                        </span>
                      )}
                    </div>

                    {/* Saldo */}
                    <div className="mb-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Saldo actual
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {formatCurrency(saldo, account.moneda)}
                      </p>
                    </div>

                    {/* Descripción si existe */}
                    {account.descripcion && (
                      <p className="mb-4 text-xs text-slate-600 dark:text-slate-400">{account.descripcion}</p>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setEditingAccount(account)}
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
                        onClick={() => handleDelete(account)}
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
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-16 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 rounded-full bg-emerald-50 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-600"
                >
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                </svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-50">Sin cuentas aún</h3>
              <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">
                Crea tu primera cuenta para comenzar a organizar tus finanzas
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-400/60 transition-all hover:bg-emerald-600"
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
