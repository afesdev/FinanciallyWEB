import { Icons } from './Icons'
import { formatCurrency } from '../../utils/format'

type GoalsCardProps = {
  loading: boolean
  goals: any[]
  moneda: string
  onNavigate: (section: string) => void
}

export default function GoalsCard({ loading, goals, moneda, onNavigate }: GoalsCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Metas activas</h3>
        <button
          onClick={() => onNavigate('goals')}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
        >
          Ver todas
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
              <div className="mb-2 h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      ) : goals.length > 0 ? (
        <div className="space-y-3">
          {goals.slice(0, 3).map((goal, i) => {
            const current = Number(goal.monto_actual) ?? 0
            const target = Number(goal.monto_objetivo) || 1
            const percent = Math.min(100, Math.round((current / target) * 100))
            return (
              <div key={goal.id ?? i} className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-100">{goal.nombre}</span>
                  <span className="text-[11px] font-semibold text-emerald-600">{percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  {formatCurrency(current, moneda)} de {formatCurrency(target, moneda)}
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center dark:border-slate-700 dark:bg-slate-900/60">
          <div className="mb-2 rounded-full bg-violet-50 p-2.5 text-violet-500">{Icons.target}</div>
          <p className="mb-1 text-xs font-medium text-slate-700 dark:text-slate-100">Sin metas definidas</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-400">Define una meta de ahorro para motivarte</p>
        </div>
      )}
    </div>
  )
}
