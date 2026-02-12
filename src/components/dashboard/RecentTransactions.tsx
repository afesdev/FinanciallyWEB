import { Icons } from './Icons'
import { formatCurrency } from '../../utils/format'

type TransactionItem = {
  id?: number
  tipo_nombre?: string
  fecha_transaccion?: string
  titulo?: string
  descripcion?: string
  categoria_nombre?: string
  cuenta_nombre?: string
  monto?: number
  moneda?: string
  activa?: boolean
}

type RecentTransactionsProps = {
  loading: boolean
  transactions: TransactionItem[]
  moneda: string
  onNavigate: (section: string) => void
}

export default function RecentTransactions({ loading, transactions, moneda, onNavigate }: RecentTransactionsProps) {
  const recent = [...transactions]
    .filter((t) => t.activa !== false)
    .sort((a, b) => new Date(b.fecha_transaccion || 0).getTime() - new Date(a.fecha_transaccion || 0).getTime())
    .slice(0, 5)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Últimos movimientos</h3>
        <button
          onClick={() => onNavigate('transactions')}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
        >
          Ver todos
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="flex-1">
                <div className="mb-1 h-3 w-32 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-2 w-20 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="h-4 w-16 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : recent.length > 0 ? (
        <div className="space-y-2">
          {recent.map((txn, i) => {
            const isIncome = txn.tipo_nombre === 'INGRESO'
            const concept = txn.titulo || txn.descripcion || txn.categoria_nombre || (isIncome ? 'Ingreso' : 'Gasto')
            return (
              <div
                key={txn.id ?? i}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {isIncome ? Icons.trendUp : Icons.trendDown}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {concept}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {txn.fecha_transaccion
                      ? new Date(txn.fecha_transaccion).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
                      : ''}
                    {txn.cuenta_nombre ? ` · ${txn.cuenta_nombre}` : ''}
                  </p>
                </div>
                <span className={`shrink-0 text-sm font-semibold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(Number(txn.monto) || 0, txn.moneda || moneda)}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="mb-3 rounded-full bg-blue-50 p-3 text-blue-500">{Icons.arrowUpDown}</div>
          <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-100">Sin movimientos</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Registra tu primer ingreso o gasto para empezar</p>
        </div>
      )}
    </div>
  )
}
