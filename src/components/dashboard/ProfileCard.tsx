type ProfileCardProps = {
  nombre: string
  email?: string
  moneda?: string
  onNavigate?: (key: string) => void
}

export default function ProfileCard({ nombre, email, moneda, onNavigate }: ProfileCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 blur-2xl" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-2xl font-bold text-white shadow-lg shadow-emerald-500/20">
          {nombre.charAt(0).toUpperCase()}
        </div>
        <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{nombre}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">{email}</p>
        {moneda && (
          <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            Moneda: {moneda}
          </span>
        )}
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="mt-3 text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            Editar perfil
          </button>
        )}
      </div>
    </div>
  )
}
