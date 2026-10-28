import { Icons } from './Icons'
import type { Prestamo } from '../../services/api'
import { formatCurrency } from '../../utils/format'

type LoansSummaryProps = {
  loading: boolean
  prestamos: Prestamo[]
  moneda: string
  onNavigate: (section: string) => void
}

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase()
}

export default function LoansSummary({
  loading,
  prestamos,
  moneda,
  onNavigate,
}: LoansSummaryProps) {
  const activos = prestamos.filter((p) => Number(p.saldo_pendiente) > 0)
  const porCobrar = activos.filter((p) => p.tipo === 'PRESTAMO')
  const porPagar = activos.filter((p) => p.tipo === 'DEUDA')
  const totalCobrar = porCobrar.reduce((sum, p) => sum + (Number(p.saldo_pendiente) || 0), 0)
  const totalPagar = porPagar.reduce((sum, p) => sum + (Number(p.saldo_pendiente) || 0), 0)

  const destacado = [...activos].sort(
    (a, b) => (Number(b.saldo_pendiente) || 0) - (Number(a.saldo_pendiente) || 0),
  )[0]

  return (
    <div className="rounded-2xl border border-slate-900/5 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Préstamos
        </h3>
        <button
          onClick={() => onNavigate('loans')}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:hover:bg-brand-900/30"
        >
          Ver todos
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : activos.length > 0 ? (
        <>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-brand-50 p-3.5 dark:bg-brand-900/30">
              <span>
                <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-brand-700 dark:text-brand-300">
                  Por cobrar
                </span>
                <span className="mt-1 block text-[0.7rem] text-brand-700/80 dark:text-brand-400">
                  {porCobrar.length} {porCobrar.length === 1 ? 'préstamo' : 'préstamos'}
                </span>
              </span>
              <span className="text-lg font-bold tabular-nums tracking-tight text-brand-800 dark:text-brand-200">
                {formatCurrency(totalCobrar, moneda)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-rose-50 p-3.5 dark:bg-rose-950/50">
              <span>
                <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-rose-600 dark:text-rose-300">
                  Por pagar
                </span>
                <span className="mt-1 block text-[0.7rem] text-rose-600/80 dark:text-rose-400">
                  {porPagar.length} {porPagar.length === 1 ? 'deuda' : 'deudas'}
                </span>
              </span>
              <span className="text-lg font-bold tabular-nums tracking-tight text-rose-800 dark:text-rose-200">
                {formatCurrency(totalPagar, moneda)}
              </span>
            </div>
          </div>

          {destacado && (
            <div className="mt-3.5 flex items-center gap-3 border-t border-slate-100 pt-3.5 dark:border-slate-800">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[0.7rem] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {iniciales(destacado.nombre)}
              </span>
              <span className="min-w-0 grow">
                <span className="block truncate text-[0.8rem] font-medium text-slate-800 dark:text-slate-100">
                  {destacado.nombre}
                </span>
                <span className="mt-0.5 block text-[0.7rem] text-slate-500 dark:text-slate-400">
                  {destacado.tipo === 'PRESTAMO' ? 'Saldo por cobrar' : 'Saldo por pagar'}
                </span>
              </span>
              <span
                className={`shrink-0 text-[0.8rem] font-semibold tabular-nums ${
                  destacado.tipo === 'PRESTAMO'
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(Number(destacado.saldo_pendiente) || 0, moneda)}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
          <div className="mb-3 rounded-2xl bg-brand-50 p-3 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-800/50">
            {Icons.loans}
          </div>
          <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-100">
            Sin préstamos activos
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registra lo que prestas o lo que debes para no perderle el rastro
          </p>
        </div>
      )}
    </div>
  )
}
