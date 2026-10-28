import type { DashboardResponse } from '../../services/api'
import { formatCurrency } from '../../utils/format'

type CategoryBreakdownProps = {
  loading: boolean
  categorias: DashboardResponse['gastos_por_categoria']
  moneda: string
  onNavigate: (section: string) => void
}

const TONOS = ['#334155', '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0']
const RADIO = 54
const CIRCUNFERENCIA = 2 * Math.PI * RADIO

export default function CategoryBreakdown({
  loading,
  categorias,
  moneda,
  onNavigate,
}: CategoryBreakdownProps) {
  const visibles = categorias.slice(0, 5)
  const total = visibles.reduce((sum, c) => sum + (Number(c.total) || 0), 0)

  const fracciones = visibles.map((c) => (total > 0 ? (Number(c.total) || 0) / total : 0))
  const segmentos = visibles.map((categoria, i) => {
    const valor = Number(categoria.total) || 0
    const fraccion = fracciones[i]
    const largo = fraccion * CIRCUNFERENCIA
    const offset = -fracciones.slice(0, i).reduce((sum, f) => sum + f, 0) * CIRCUNFERENCIA
    return {
      key: categoria.categoria_id ?? i,
      color: TONOS[i % TONOS.length],
      largo,
      offset,
      porcentaje: Math.round(fraccion * 100),
      nombre: categoria.nombre,
      total: valor,
    }
  })

  return (
    <div className="rounded-2xl border border-slate-900/5 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Gasto por categoría
          </h3>
          {!loading && visibles.length > 0 && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Este mes · {visibles.length}{' '}
              {visibles.length === 1 ? 'categoría con movimiento' : 'categorías con movimiento'}
            </p>
          )}
        </div>
        <button
          onClick={() => onNavigate('reports')}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:hover:bg-brand-900/30"
        >
          Ver reporte
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {loading ? (
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      ) : visibles.length > 0 ? (
        <div className="flex flex-wrap items-center gap-8">
          <div className="relative shrink-0">
            <svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={RADIO}
                fill="none"
                strokeWidth="17"
                className="stroke-slate-100 dark:stroke-slate-800"
              />
              {segmentos.map((segmento) => (
                <circle
                  key={segmento.key}
                  cx="64"
                  cy="64"
                  r={RADIO}
                  fill="none"
                  stroke={segmento.color}
                  strokeWidth="17"
                  strokeDasharray={`${segmento.largo} ${CIRCUNFERENCIA - segmento.largo}`}
                  strokeDashoffset={segmento.offset}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[0.62rem] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                Total
              </span>
              <span className="mt-0.5 text-sm font-bold tabular-nums tracking-tight text-slate-900 dark:text-slate-100">
                {formatCurrency(total, moneda)}
              </span>
            </div>
          </div>

          <ul className="min-w-[240px] flex-1 space-y-3.5">
            {segmentos.map((segmento) => (
              <li key={segmento.key} className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: segmento.color }}
                />
                <span className="w-28 shrink-0 truncate text-sm text-slate-700 dark:text-slate-200">
                  {segmento.nombre}
                </span>
                <span className="relative hidden h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 sm:block dark:bg-slate-800">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${segmento.porcentaje}%`, backgroundColor: segmento.color }}
                  />
                </span>
                <span className="shrink-0 text-sm tabular-nums text-slate-900 dark:text-slate-100">
                  {formatCurrency(segmento.total, moneda)}
                </span>
                <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {segmento.porcentaje}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
          Sin gastos registrados este mes
        </div>
      )}
    </div>
  )
}
