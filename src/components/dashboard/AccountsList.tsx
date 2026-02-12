import { Icons } from './Icons'
import { formatCurrency } from '../../utils/format'

type AccountsListProps = {
  loading: boolean
  accounts: any[]
  moneda: string
  onNavigate: (section: string) => void
}

const ACCOUNT_COLORS = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-sky-600',
]

export default function AccountsList({ loading, accounts, moneda, onNavigate }: AccountsListProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Tus cuentas</h3>
        <button
          onClick={() => onNavigate('accounts')}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
        >
          Ver todas
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
              <div className="mb-2 h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-5 w-28 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      ) : accounts.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.slice(0, 6).map((account, i) => (
            <div
              key={account.id ?? i}
              className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-slate-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-500"
            >
              <div className={`absolute -right-3 -top-3 h-12 w-12 rounded-full bg-gradient-to-br ${ACCOUNT_COLORS[i % ACCOUNT_COLORS.length]} opacity-20`} />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-300">{account.nombre}</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">
                {formatCurrency(
                  Number(account.saldo_actual ?? account.saldo_inicial ?? 0) || 0,
                  account.moneda || moneda,
                )}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{account.tipo || 'Cuenta'}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="mb-3 rounded-full bg-emerald-50 p-3 text-emerald-500">{Icons.wallet}</div>
          <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-100">Sin cuentas aun</p>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Crea tu primera cuenta para comenzar a organizar tus finanzas</p>
          <button
            onClick={() => onNavigate('accounts')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            {Icons.plus}
            Crear cuenta
          </button>
        </div>
      )}
    </div>
  )
}
