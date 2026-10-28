import { Icons } from './Icons'
import AccountCard from '../accounts/AccountCard'
import type { Account } from '../../services/api'

type AccountsListProps = {
  loading: boolean
  accounts: Account[]
  moneda: string
  onNavigate: (section: string) => void
  featured?: boolean
}

export default function AccountsList({
  loading,
  accounts,
  onNavigate,
  featured = false,
}: AccountsListProps) {
  const limite = featured ? 6 : 4
  const visibles = accounts.slice(0, limite)
  const gridCols = featured ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2'

  return (
    <div className="rounded-2xl border border-slate-900/5 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3
            className={`font-semibold tracking-tight text-slate-900 dark:text-slate-100 ${
              featured ? 'text-lg' : 'text-base'
            }`}
          >
            Tus cuentas
          </h3>
          {!loading && accounts.length > 0 && (
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {accounts.length} {accounts.length === 1 ? 'registrada' : 'registradas'}
              {accounts.length > limite && ` · mostrando ${limite}`}
            </p>
          )}
        </div>
        <button
          onClick={() => onNavigate('accounts')}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:hover:bg-brand-900/30"
        >
          Ver todas
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {loading ? (
        <div className={`grid gap-3 ${gridCols}`}>
          {Array.from({ length: limite }, (_, i) => (
            <div
              key={i}
              className="min-h-[150px] animate-pulse rounded-3xl bg-slate-200/70 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : visibles.length > 0 ? (
        <div className={`grid gap-3 ${gridCols}`}>
          {visibles.map((account, i) => (
            <AccountCard key={account.id ?? i} account={account} index={i} compact />
          ))}
        </div>
      ) : (
        <div className="relative isolate flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 dark:border-slate-700 dark:bg-slate-900/60">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)]"
          />
          <div className="relative mb-3 rounded-2xl bg-brand-50 p-3 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-800/50">
            {Icons.wallet}
          </div>
          <p className="relative mb-1 text-sm font-medium text-slate-700 dark:text-slate-100">
            Sin cuentas aún
          </p>
          <p className="relative mb-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Crea tu primera cuenta para comenzar a organizar tus finanzas
          </p>
          <button
            onClick={() => onNavigate('accounts')}
            className="relative inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-600"
          >
            {Icons.plus}
            Crear cuenta
          </button>
        </div>
      )}
    </div>
  )
}
