import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../services/api'
import AuthShell from '../components/auth/AuthShell'

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-12 text-[0.95rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [listo, setListo] = useState(false)

  const tokenAusente = !token

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    try {
      setLoading(true)
      await resetPassword(token, password)
      setListo(true)
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'No se pudo restablecer la contraseña.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Nueva contraseña"
      asideTitle={
        <>
          Elige una
          <br />
          contraseña nueva.
        </>
      }
    >
      {listo ? (
        <div>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-6 w-6">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-900 sm:text-4xl">
            Contraseña actualizada
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Ya puedes iniciar sesión con tu nueva contraseña. Por seguridad, cerramos las demás
            sesiones abiertas.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-brand-500 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-brand-600"
          >
            Iniciar sesión
          </button>
        </div>
      ) : tokenAusente ? (
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-900 sm:text-4xl">
            Enlace inválido
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Este enlace no es válido o está incompleto. Solicita uno nuevo desde la pantalla de
            recuperación.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-brand-500 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-brand-600"
          >
            Solicitar enlace
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-900 sm:text-4xl">
            Nueva contraseña
          </h1>
          <p className="mt-3 text-sm text-slate-500">Elige una contraseña de al menos 6 caracteres.</p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7.5v5" />
                  <path d="M12 16.2h.01" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  required
                  autoFocus
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4.5 w-4.5">
                    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    {show && <path d="m4 20 16-16" />}
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                Repite la contraseña
              </label>
              <input
                id="confirm"
                type={show ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[0.95rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
                placeholder="••••••••"
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
              {loading ? 'Guardando…' : 'Cambiar contraseña'}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  )
}

export default ResetPasswordPage
