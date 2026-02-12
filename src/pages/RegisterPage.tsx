import logo from '../assets/logo.svg'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { register } from '../services/api'
import { useAuth } from '../context/AuthContext'

function RegisterPage() {
  const navigate = useNavigate()
  const { saveAuth } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setLoading(true)
      const auth = await register({ name, email, password })
      saveAuth(auth)
      Swal.fire({
        icon: 'success',
        title: 'Cuenta creada',
        text: `Bienvenido a Financially, ${auth.user.nombre}.`,
        timer: 1800,
        showConfirmButton: false,
      })
      navigate('/home')
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'No pudimos registrarte',
        text: error?.message || 'Revisa la informacion e intentalo de nuevo.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-12 md:flex-row md:items-stretch md:gap-20">
        {/* Columna izquierda */}
        <div className="mb-12 flex w-full flex-col justify-center md:mb-0 md:w-1/2">
          <button
            onClick={() => navigate('/')}
            className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600"
          >
            ← Volver al inicio
          </button>
          <div className="mb-8 flex items-center gap-4">
            <img src={logo} alt="Logo Financially" className="h-12 w-auto" />
            <span className="text-lg font-semibold text-slate-500">Financially</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Crea tu cuenta gratis
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
            Registra tus cuentas, transacciones y metas en pocos pasos. Sin costos, sin letras pequenas.
          </p>
          <p className="mt-8 text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Inicia sesion
            </button>
            .
          </p>
        </div>

        {/* Formulario */}
        <div className="flex w-full items-center md:w-1/2">
          <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200 md:p-10">
            <div className="pointer-events-none absolute inset-x-10 -top-24 h-40 rounded-full bg-emerald-500/10 blur-3xl" />
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Crear cuenta</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Andres Espitia"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Correo electronico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Contrasena
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Minimo 6 caracteres"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-emerald-400/60 transition-all hover:shadow-lg hover:shadow-emerald-400/90 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
