import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProfile, type UpdateProfileDto } from '../services/api'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import Swal from 'sweetalert2'

const MONEDAS = [
  'COP', 'USD', 'EUR', 'MXN', 'ARS', 'CLP', 'PEN', 'BOB', 'CRC', 'GTQ', 'HNL', 'NIO', 'PAB', 'PYG', 'DOP', 'UYU', 'VES', 'CUP',
]

function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, refreshUser } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSidebarCollapsed()
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [monedaPredeterminada, setMonedaPredeterminada] = useState('COP')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '')
      setTelefono(user.telefono || '')
      setFechaNacimiento(user.fechaNacimiento ? user.fechaNacimiento.slice(0, 10) : '')
      setMonedaPredeterminada(user.monedaPredeterminada || 'COP')
    }
  }, [user])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    const payload: UpdateProfileDto = {
      nombre: nombre.trim(),
      telefono: telefono.trim() || undefined,
      fechaNacimiento: fechaNacimiento || undefined,
      monedaPredeterminada: monedaPredeterminada || undefined,
    }
    try {
      setSaving(true)
      await updateProfile(payload)
      await refreshUser()
      Swal.fire({ icon: 'success', title: 'Perfil actualizado', timer: 1500, showConfirmButton: false })
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo actualizar el perfil.'
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

  const nombreUsuario = user?.nombre ?? 'Usuario'
  const initial = (user?.nombre || 'U').charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 dark:from-slate-950 dark:to-slate-900">
      <Sidebar
        activeNav="profile"
        sidebarOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
        nombre={nombreUsuario}
        email={user?.email}
        onNavChange={handleNavigate}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className={`flex min-h-screen flex-1 flex-col transition-[margin] duration-200 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Navbar nombre={nombreUsuario} email={user?.email} onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-6 lg:px-8">
          {/* Header con gradiente y avatar */}
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-cyan-600 px-6 pb-16 pt-8 shadow-xl shadow-emerald-500/20 lg:px-10">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/10 to-transparent" />
            <div className="relative flex flex-col items-center text-center sm:flex-row sm:items-end sm:justify-start sm:text-left">
              <div className="relative mb-4 sm:mb-0 sm:mr-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/95 text-4xl font-bold text-emerald-600 shadow-xl ring-4 ring-white/50">
                  {initial}
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
              </div>
              <div className="sm:pb-1">
                <h1 className="text-2xl font-bold text-white drop-shadow-sm">Mi perfil</h1>
                <p className="mt-0.5 text-sm text-emerald-100">Actualiza tu información personal</p>
              </div>
            </div>
          </div>

          {/* Card del formulario (superpuesta al header) */}
          <div className="relative z-10 mx-auto -mt-10 max-w-xl px-2 sm:px-0">
            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-slate-900/50 dark:ring-slate-800"
            >
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  Datos personales
                </h2>
              </div>
              <div className="space-y-5 p-6">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                    <span className="text-emerald-500">*</span> Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                    Correo electrónico
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-100/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-slate-400 dark:text-slate-500">
                      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a5 5 0 0 1-6.06 0L2 7"/>
                    </svg>
                    <span className="text-sm text-slate-600 dark:text-slate-100">{user?.email ?? '—'}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">El correo no se puede modificar</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                      Fecha de nacimiento
                    </label>
                    <input
                      type="date"
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                    Moneda predeterminada
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">💱</span>
                    <select
                      value={monedaPredeterminada}
                      onChange={(e) => setMonedaPredeterminada(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-900"
                    >
                      {MONEDAS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={saving}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:brightness-105 disabled:opacity-60"
                  >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ProfilePage
