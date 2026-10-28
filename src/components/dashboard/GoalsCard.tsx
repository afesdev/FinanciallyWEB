import { Icons } from './Icons'
import type { Meta } from '../../services/api'
import { formatCurrency } from '../../utils/format'
import GoalCard from '../goals/GoalCard'
import { metaProgreso } from '../../utils/metas'

type GoalsCardProps = {
  loading: boolean
  goals: Meta[]
  moneda: string
  onNavigate: (section: string) => void
}

export default function GoalsCard({ loading, goals, moneda, onNavigate }: GoalsCardProps) {
  const visibles = goals.slice(0, 3)
  const totalObjetivo = goals.reduce((s, m) => s + (Number(m.monto_objetivo) || 0), 0)
  const totalActual = goals.reduce((s, m) => s + (Number(m.monto_actual) || 0), 0)
  const completadas = goals.filter((m) => metaProgreso(m).completada).length

  return (
    <div className="rounded-2xl border border-slate-900/5 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Metas activas
          </h3>
          {!loading && goals.length > 0 && (
            <p className="mt-0.5 text-xs tabular-nums text-slate-400 dark:text-slate-500">
              {formatCurrency(totalActual, moneda)} de {formatCurrency(totalObjetivo, moneda)}
              {completadas > 0 && ` · ${completadas} completada${completadas === 1 ? '' : 's'}`}
            </p>
          )}
        </div>
        <button
          onClick={() => onNavigate('goals')}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:hover:bg-brand-900/30"
        >
          Ver todas
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : visibles.length > 0 ? (
        <div className="space-y-3">
          {visibles.map((meta, i) => (
            <GoalCard key={meta.id ?? i} meta={meta} moneda={moneda} index={i} compact />
          ))}
        </div>
      ) : (
        <div className="relative isolate flex flex-col items-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)]"
          />
          <div className="relative mb-3 rounded-2xl bg-brand-50 p-3 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-800/50">
            {Icons.target}
          </div>
          <p className="relative mb-1 text-sm font-medium text-slate-700 dark:text-slate-100">
            Sin metas definidas
          </p>
          <p className="relative mb-4 text-xs text-slate-500 dark:text-slate-400">
            Define una meta de ahorro para motivarte
          </p>
          <button
            onClick={() => onNavigate('goals')}
            className="relative inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-600"
          >
            {Icons.plus}
            Crear meta
          </button>
        </div>
      )}
    </div>
  )
}
