import { Icons } from './Icons'

type WelcomeBannerProps = {
  nombre: string
  onNavigate: (section: string) => void
}

export default function WelcomeBanner({ nombre, onNavigate }: WelcomeBannerProps) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white lg:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
            {Icons.sparkles}
            Panel financiero
          </div>
          <h2 className="text-2xl font-bold lg:text-3xl">
            Bienvenido de vuelta, {nombre.split(' ')[0]}
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Aqui tienes un resumen de tu actividad financiera. Mantente al dia con tus finanzas.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('accounts')}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400"
          >
            {Icons.plus}
            Nueva cuenta
          </button>
          <button
            onClick={() => onNavigate('transactions')}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            {Icons.arrowUpDown}
            Registrar movimiento
          </button>
        </div>
      </div>
    </div>
  )
}
