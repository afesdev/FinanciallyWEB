import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import logo from '../assets/logo.svg'
import { register } from '../services/api'
import { useAuth } from '../context/AuthContext'

const steps = [
  { n: '01', text: 'Crea tu cuenta con tu correo' },
  { n: '02', text: 'Define tus cuentas y categorías' },
  { n: '03', text: 'Registra tu primer movimiento' },
]

const strengthLabels = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte']

function passwordScore(value: string) {
  if (!value) return 0
  let score = 0
  if (value.length >= 6) score++
  if (value.length >= 10) score++
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++
  return score
}

function RegisterPage() {
  const navigate = useNavigate()
  const { saveAuth } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const score = passwordScore(password)
  const scoreTone = score <= 1 ? 'bg-rose-400' : score === 2 ? 'bg-amber-400' : 'bg-brand-500'

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    try {
      setLoading(true)
      const auth = await register({ name: name.trim(), email: email.trim(), password })
      saveAuth(auth)
      Swal.fire({
        icon: 'success',
        title: 'Cuenta creada',
        text: `Bienvenido a Financially, ${auth.user.nombre}.`,
        timer: 1800,
        showConfirmButton: false,
      })
      navigate('/home')
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Revisa la información e inténtalo de nuevo.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased md:grid md:grid-cols-2">
      <aside className="relative isolate hidden overflow-hidden bg-brand-700 p-12 text-white [background-image:radial-gradient(ellipse_70%_90%_at_50%_-10%,#23a85f,rgba(35,168,95,0)_70%)] md:flex md:flex-col md:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:64px_64px]"
        />

        <button
          onClick={() => navigate('/')}
          className="relative inline-flex w-fit items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
            <img src={logo} alt="Financially" className="h-8 w-auto" />
          </span>
          <span className="text-base font-bold tracking-tight">Financially</span>
        </button>

        <div className="relative">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-brand-200">
            Empieza gratis
          </span>
          <h2 className="mt-5 max-w-sm text-[2.6rem] font-bold leading-[1.04] tracking-[-0.035em]">
            Diez minutos hoy,
            <br />
            claridad todo el año.
          </h2>

          <ol className="mt-10 space-y-5">
            {steps.map((step) => (
              <li key={step.n} className="flex items-center gap-4">
                <span className="text-xs font-bold tracking-[0.2em] text-brand-200">{step.n}</span>
                <span className="h-px w-6 bg-white/25" />
                <span className="text-sm text-white/85">{step.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="relative text-xs text-white/60">
          Sin tarjeta de crédito · Sin publicidad · Tus datos son solo tuyos
        </p>
      </aside>

      <main className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden px-6 py-12 sm:px-12 lg:px-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-16 h-40 w-40 [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:14px_14px] opacity-[0.08] [mask-image:radial-gradient(circle,#000,transparent_70%)] md:hidden"
        />

        <button
          onClick={() => navigate('/')}
          className="mb-10 inline-flex w-fit items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <path d="M19 12H4" />
            <path d="m10.5 6-6 6 6 6" />
          </svg>
          Volver al inicio
        </button>

        <div className="mb-9 flex items-center gap-2.5 md:hidden">
          <img src={logo} alt="Financially" className="h-9 w-auto" />
          <span className="text-base font-bold tracking-tight">Financially</span>
        </div>

        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-900 sm:text-4xl">
            Crear cuenta
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Gratis, sin costos ocultos y sin letra pequeña.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7.5v5" />
                  <path d="M12 16.2h.01" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
              >
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                required
                autoFocus
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[0.95rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
                placeholder="Andrés Espitia"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[0.95rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
                placeholder="tucorreo@ejemplo.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  aria-describedby="password-hint"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-12 text-[0.95rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-4.5 w-4.5"
                  >
                    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    {showPassword && <path d="m4 20 16-16" />}
                  </svg>
                </button>
              </div>

              <div id="password-hint" className="mt-3">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        password && i < score ? scoreTone : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {password
                    ? `Seguridad: ${strengthLabels[score]}`
                    : 'Usa al menos 6 caracteres. Mezcla mayúsculas, números y símbolos.'}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 animate-spin">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="opacity-30"
                  />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {loading ? 'Creando cuenta…' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p className="mt-8 text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-brand-600 underline-offset-4 transition-colors hover:text-brand-700 hover:underline"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}

export default RegisterPage
