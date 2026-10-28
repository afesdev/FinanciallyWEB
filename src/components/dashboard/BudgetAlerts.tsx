import { Icons } from './Icons'
import type { DashboardResponse } from '../../services/api'
import { formatCurrency } from '../../utils/format'

type BudgetAlertsProps = {
  loading: boolean
  presupuestos: DashboardResponse['presupuestos']
  moneda: string
  onNavigate: (section: string) => void
}

const ALERTA = 80

export default function BudgetAlerts({
  loading,
  presupuestos,
  moneda,
  onNavigate,
}: BudgetAlertsProps) {
  const ordenados = [...presupuestos].sort((a, b) => (b.porcentaje || 0) - (a.porcentaje || 0))
  const criticos = ordenados.filter((p) => (p.porcentaje || 0) >= ALERTA)
  const estables = ordenados.filter((p) => (p.porcentaje || 0) < ALERTA)
  const diasRestantes = ordenados[0]?.dias_restantes

  return (
    <div className="rounded-2xl border border-slate-900/5 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              criticos.length > 0
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                : 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
            }`}
          >
            {Icons.chartBar}
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {criticos.length > 0 ? 'Necesitan tu atención' : 'Tus presupuestos'}
            </h3>
            {!loading && presupuestos.length > 0 && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {presupuestos.length} {presupuestos.length === 1 ? 'activo' : 'activos'}
                {typeof diasRestantes === 'number' &&
                  ` · quedan ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'} del periodo`}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => onNavigate('budgets')}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:hover:bg-brand-900/30"
        >
          Ver todos
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : presupuestos.length > 0 ? (
        <div className="space-y-3">
          {criticos.map((presupuesto) => {
            const porcentaje = presupuesto.porcentaje || 0
            const excedido = porcentaje > 100
            const restante = (presupuesto.monto_limite || 0) - (presupuesto.monto_gastado || 0)
            return (
              <div
                key={presupuesto.id}
                className={`rounded-2xl border p-4 ${
                  excedido
                    ? 'border-rose-100 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/50'
                    : 'border-amber-100 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50'
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span
                    className={`flex items-center gap-2 text-sm font-semibold ${
                      excedido
                        ? 'text-rose-800 dark:text-rose-200'
                        : 'text-amber-800 dark:text-amber-200'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${excedido ? 'bg-rose-500' : 'bg-amber-500'}`}
                    />
                    {presupuesto.nombre}
                  </span>
                  <span
                    className={`text-xs tabular-nums ${
                      excedido
                        ? 'text-rose-800 dark:text-rose-200'
                        : 'text-amber-800 dark:text-amber-200'
                    }`}
                  >
                    {formatCurrency(presupuesto.monto_gastado || 0, moneda)} de{' '}
                    {formatCurrency(presupuesto.monto_limite || 0, moneda)}
                  </span>
                </div>

                <div
                  className={`mt-2.5 h-2 overflow-hidden rounded-full ${
                    excedido ? 'bg-rose-100 dark:bg-rose-900' : 'bg-amber-100 dark:bg-amber-900'
                  }`}
                >
                  <div
                    className={`h-full rounded-full ${excedido ? 'bg-rose-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(porcentaje, 100)}%` }}
                  />
                </div>

                <p
                  className={`mt-2 text-xs font-semibold ${
                    excedido
                      ? 'text-rose-600 dark:text-rose-300'
                      : 'text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {excedido
                    ? `Excedido en ${formatCurrency(Math.abs(restante), moneda)}`
                    : `${Math.round(porcentaje)}% consumido · te quedan ${formatCurrency(restante, moneda)}`}
                </p>
              </div>
            )
          })}

          {estables.map((presupuesto) => {
            const porcentaje = presupuesto.porcentaje || 0
            return (
              <div key={presupuesto.id} className="flex items-center gap-3 px-0.5 py-1">
                <span className="flex w-32 shrink-0 items-center gap-2 truncate text-sm text-slate-700 dark:text-slate-200">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                  {presupuesto.nombre}
                </span>
                <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-brand-500"
                    style={{ width: `${Math.min(porcentaje, 100)}%` }}
                  />
                </span>
                <span className="shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  {Math.round(porcentaje)}% ·{' '}
                  {formatCurrency(presupuesto.monto_gastado || 0, moneda)} de{' '}
                  {formatCurrency(presupuesto.monto_limite || 0, moneda)}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="relative isolate flex flex-col items-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
          <div className="mb-3 rounded-2xl bg-brand-50 p-3 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-800/50">
            {Icons.chartBar}
          </div>
          <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-100">
            Sin presupuestos activos
          </p>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            Define un límite por categoría y te avisamos antes de que te pases
          </p>
          <button
            onClick={() => onNavigate('budgets')}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-600"
          >
            {Icons.plus}
            Crear presupuesto
          </button>
        </div>
      )}
    </div>
  )
}
