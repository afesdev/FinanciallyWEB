import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { Account } from '../../services/api'
import { ACCOUNT_TYPE_LABELS } from '../../services/api'
import { formatCurrency } from '../../utils/format'

const TYPE_FALLBACK_COLOR: Record<Account['tipo'], string> = {
  BANCARIA: '#3B82F6',
  EFECTIVO: '#10B981',
  TARJETA_CREDITO: '#8B5CF6',
  TARJETA_DEBITO: '#06B6D4',
  DIGITAL: '#EC4899',
  AHORRO: '#F59E0B',
  INVERSION: '#6366F1',
}

const TYPE_ICON: Record<Account['tipo'], string> = {
  BANCARIA: 'account_balance',
  EFECTIVO: 'wallet',
  TARJETA_CREDITO: 'credit_card',
  TARJETA_DEBITO: 'credit_card',
  DIGITAL: 'payments',
  AHORRO: 'savings',
  INVERSION: 'trending_up',
}

const ICON_PATHS: Record<string, ReactNode> = {
  account_balance: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V9.8L12 5.5l7 4.3V21" />
      <path d="M9.5 21v-5.5h5V21" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 10.5h18" />
      <circle cx="17" cy="14.75" r="1.1" />
    </>
  ),
  savings: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 10.5h18" />
      <circle cx="12" cy="14.5" r="2.5" />
    </>
  ),
  credit_card: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 9.5h19" />
      <path d="M6 15h3.5" />
    </>
  ),
  payments: (
    <>
      <rect x="2.5" y="4.5" width="14" height="9.5" rx="2" />
      <path d="M7 19.5h12a2.5 2.5 0 0 0 2.5-2.5V8.5" />
      <circle cx="9.5" cy="9.25" r="2.25" />
    </>
  ),
  attach_money: (
    <>
      <path d="M12 3v18" />
      <path d="M16.5 7.2A3.4 3.4 0 0 0 13.2 4.8h-2.4a3.1 3.1 0 0 0 0 6.2h2.4a3.1 3.1 0 0 1 0 6.2h-2.4a3.4 3.4 0 0 1-3.3-2.4" />
    </>
  ),
  trending_up: (
    <>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
  account_balance_wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 10.5h18" />
      <path d="M16 12.5h5v5h-5a2.5 2.5 0 0 1 0-5Z" />
    </>
  ),
  monetization_on: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v10" />
      <path d="M14.5 9.4A2.2 2.2 0 0 0 12.6 8.4h-1.4a1.9 1.9 0 0 0 0 3.8h1.6a1.9 1.9 0 0 1 0 3.8h-1.4a2.2 2.2 0 0 1-1.9-1" />
    </>
  ),
  local_atm: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M12 8.5v7" />
      <path d="M13.8 10.2a1.6 1.6 0 0 0-1.4-.8h-1a1.4 1.4 0 0 0 0 2.8h1.2a1.4 1.4 0 0 1 0 2.8h-1a1.6 1.6 0 0 1-1.4-.8" />
    </>
  ),
  store: (
    <>
      <path d="M4 10v9.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V10" />
      <path d="M3 6.5 4.5 3h15L21 6.5a3 3 0 0 1-5.5 1.7 3 3 0 0 1-5 0A3 3 0 0 1 3 6.5Z" />
    </>
  ),
  receipt: (
    <>
      <path d="M5.5 3h13v18l-3-1.6-3 1.6-3-1.6-3 1.6V3Z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
    </>
  ),
}

function AccountIcon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICON_PATHS[name] ?? ICON_PATHS.wallet}
    </svg>
  )
}

type AccountCardProps = {
  account: Account
  index?: number
  compact?: boolean
  sharePct?: number
  onEdit?: (account: Account) => void
  onDelete?: (account: Account) => void
}

export default function AccountCard({
  account,
  index = 0,
  compact = false,
  sharePct,
  onEdit,
  onDelete,
}: AccountCardProps) {
  const reduceMotion = useReducedMotion()
  const color = account.color || TYPE_FALLBACK_COLOR[account.tipo] || '#1EB256'
  const saldo = Number(account.saldo_actual ?? account.saldo_inicial ?? 0) || 0
  const iconName = account.icono || TYPE_ICON[account.tipo] || 'wallet'
  const hasActions = Boolean(onEdit || onDelete)

  return (
    <motion.article
      initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -5 }}
      className={`group relative isolate flex flex-col justify-between overflow-hidden rounded-3xl p-5 text-white shadow-lg shadow-slate-900/10 transition-shadow hover:shadow-xl hover:shadow-slate-900/20 ${
        compact ? 'min-h-[150px]' : 'min-h-[210px]'
      } ${account.activa ? '' : 'opacity-70 saturate-50'}`}
      style={{
        background: `linear-gradient(140deg, ${color} 0%, color-mix(in oklab, ${color} 62%, #0b1220) 58%, color-mix(in oklab, ${color} 28%, #0b1220) 100%)`,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:38px_38px] [mask-image:linear-gradient(to_bottom_right,#000,transparent_70%)]"
      />
      <svg
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-8 h-44 w-44 text-white/25 transition-transform duration-500 group-hover:scale-110"
      >
        <circle cx="60" cy="60" r="59" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="60" cy="60" r="43" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="60" cy="60" r="27" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="60" cy="60" r="12" fill="currentColor" fillOpacity="0.35" />
      </svg>

      <header className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
            <AccountIcon name={iconName} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[0.95rem] font-semibold tracking-tight">{account.nombre}</h3>
            <p className="truncate text-xs text-white/60">{ACCOUNT_TYPE_LABELS[account.tipo]}</p>
          </div>
        </div>

        {hasActions && (
          <div className="flex shrink-0 gap-1.5 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(account)}
                aria-label={`Editar ${account.nombre}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/15 transition-colors hover:bg-white/20 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path d="M16.8 3.3a2.6 2.6 0 0 1 3.9 3.9L7.6 20.3 2.6 21.4l1.1-5Z" />
                  <path d="m14.5 5.5 4 4" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(account)}
                aria-label={`Eliminar ${account.nombre}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/15 transition-colors hover:bg-rose-500 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path d="M3.5 6.5h17" />
                  <path d="M18.5 6.5V20a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V6.5" />
                  <path d="M9 6.5V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5v2" />
                  <path d="M10.5 11v6M13.5 11v6" />
                </svg>
              </button>
            )}
          </div>
        )}
      </header>

      <div className="relative mt-6">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-white/50">
          Saldo actual
        </p>
        <p
          className={`mt-1 tabular-nums font-semibold tracking-tight ${
            compact ? 'text-xl' : 'text-[1.75rem]'
          }`}
        >
          {formatCurrency(saldo, account.moneda)}
        </p>
      </div>

      <footer className="relative mt-4">
        {sharePct !== undefined && (
          <div className="mb-3">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, sharePct))}%` }}
                transition={{ delay: 0.25 + Math.min(index, 8) * 0.06, duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-white/70"
              />
            </div>
            <p className="mt-1.5 text-[0.68rem] text-white/50">
              {sharePct.toFixed(0)}% de tu saldo total
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.65rem] font-medium tracking-wide text-white/70 ring-1 ring-white/10">
            {account.moneda}
          </span>
          {!account.activa && (
            <span className="rounded-full bg-slate-900/40 px-2.5 py-1 text-[0.65rem] font-medium text-white/70">
              Inactiva
            </span>
          )}
        </div>
      </footer>
    </motion.article>
  )
}
