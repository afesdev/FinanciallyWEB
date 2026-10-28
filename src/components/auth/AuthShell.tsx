import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.svg'

type AuthShellProps = {
  eyebrow: string
  asideTitle: ReactNode
  children: ReactNode
}

export default function AuthShell({ eyebrow, asideTitle, children }: AuthShellProps) {
  const navigate = useNavigate()

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
            {eyebrow}
          </span>
          <h2 className="mt-5 max-w-sm text-[2.6rem] font-bold leading-[1.04] tracking-[-0.035em]">
            {asideTitle}
          </h2>
        </div>

        <p className="relative text-xs text-white/60">© {new Date().getFullYear()} Financially</p>
      </aside>

      <main className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden px-6 py-12 sm:px-12 lg:px-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-16 h-40 w-40 [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:14px_14px] opacity-[0.08] [mask-image:radial-gradient(circle,#000,transparent_70%)] md:hidden"
        />

        <button
          onClick={() => navigate('/login')}
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
          Volver a iniciar sesión
        </button>

        <div className="mb-9 flex items-center gap-2.5 md:hidden">
          <img src={logo} alt="Financially" className="h-9 w-auto" />
          <span className="text-[0.95rem] font-semibold tracking-tight">Financially</span>
        </div>

        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
