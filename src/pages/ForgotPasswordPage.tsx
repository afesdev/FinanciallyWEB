import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../services/api'
import AuthShell from '../components/auth/AuthShell'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setLoading(true)
      await forgotPassword(email)
      // La API responde igual exista o no el correo: mostramos éxito siempre.
      setEnviado(true)
    } catch {
      // Aun ante un error, no revelamos nada: mostramos el mismo mensaje.
      setEnviado(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Recuperar acceso"
      asideTitle={
        <>
          ¿Olvidaste
          <br />
          tu contraseña?
        </>
      }
    >
      {enviado ? (
        <div>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-6 w-6"
            >
              <rect x="3" y="5" width="18" height="14" rx="2.5" />
              <path d="m3.5 7 8.5 6 8.5-6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-900 sm:text-4xl">
            Revisa tu correo
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Si <span className="font-medium text-slate-700">{email}</span> está registrado, te
            enviamos un enlace para restablecer tu contraseña. Caduca en 1 hora.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            ¿No lo ves? Revisa spam o{' '}
            <button
              onClick={() => setEnviado(false)}
              className="font-semibold text-brand-600 underline-offset-4 transition-colors hover:text-brand-700 hover:underline"
            >
              inténtalo de nuevo
            </button>
            .
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-brand-500 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-brand-600"
          >
            Volver a iniciar sesión
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-900 sm:text-4xl">
            Recuperar contraseña
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Escribe tu correo y te enviaremos un enlace para elegir una nueva.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
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
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[0.95rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
                placeholder="tucorreo@ejemplo.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 animate-spin">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-30" />
                  <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              )}
              {loading ? 'Enviando…' : 'Enviar enlace'}
            </button>
          </form>

          <p className="mt-8 text-sm text-slate-500">
            ¿La recordaste?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-brand-600 underline-offset-4 transition-colors hover:text-brand-700 hover:underline"
            >
              Inicia sesión
            </button>
          </p>
        </>
      )}
    </AuthShell>
  )
}

export default ForgotPasswordPage
