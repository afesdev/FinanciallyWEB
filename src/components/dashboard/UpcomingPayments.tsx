import { Icons } from './Icons'
import type { PagoRecurrente } from '../../services/api'
import { formatCurrency } from '../../utils/format'
import { pagosProximos } from '../../utils/recurrentes'

type UpcomingPaymentsProps = {
  loading: boolean
  pagos: PagoRecurrente[]
  moneda: string
  dias?: number
}

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const FRECUENCIA_LABEL: Record<string, string> = {
  DIARIO: 'Diario',
  SEMANAL: 'Semanal',
  MENSUAL: 'Mensual',
  BIMESTRAL: 'Bimestral',
  TRIMESTRAL: 'Trimestral',
  SEMESTRAL: 'Semestral',
  ANUAL: 'Anual',
}

export default function UpcomingPayments({
  loading,
  pagos,
  moneda,
  dias = 7,
}: UpcomingPaymentsProps) {
  const proximos = pagosProximos(pagos, dias).slice(0, 4)
  const comprometido = proximos.reduce((sum, item) => sum + (Number(item.pago.monto) || 0), 0)
  const hoy = new Date()
  const enTresDias = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 3)

  return (
    <div className="rounded-2xl border border-slate-900/5 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Próximos pagos
          </h3>
          {!loading && proximos.length > 0 && (
            <p className="mt-0.5 text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {formatCurrency(comprometido, moneda)} comprometidos
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.06em] text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          {dias} días
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : proximos.length > 0 ? (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {proximos.map(({ pago, fecha }) => {
            const urgente = fecha <= enTresDias
            const detalle = [FRECUENCIA_LABEL[pago.frecuencia] ?? pago.frecuencia, pago.cuenta_nombre]
              .filter(Boolean)
              .join(' · ')
            return (
              <li key={pago.id} className="flex items-center gap-3 py-2.5">
                <span
                  className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl ring-1 ${
                    urgente
                      ? 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-800'
                      : 'bg-slate-50 text-slate-900 ring-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700'
                  }`}
                >
                  <span className="text-[0.8rem] font-bold leading-none tabular-nums">
                    {fecha.getDate()}
                  </span>
                  <span className="text-[0.55rem] uppercase tracking-[0.06em] opacity-70">
                    {MESES_CORTOS[fecha.getMonth()]}
                  </span>
                </span>
                <span className="min-w-0 grow">
                  <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {pago.descripcion}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.7rem] text-slate-500 dark:text-slate-400">
                    {detalle}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                  {formatCurrency(Number(pago.monto) || 0, moneda)}
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
          <div className="mb-3 rounded-2xl bg-brand-50 p-3 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-800/50">
            {Icons.clock}
          </div>
          <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-100">
            Nada por pagar esta semana
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aquí aparecen tus pagos recurrentes de los próximos {dias} días
          </p>
        </div>
      )}
    </div>
  )
}
