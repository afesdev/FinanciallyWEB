import { motion, useReducedMotion } from 'motion/react'
import { Icons } from './Icons'
import { formatCurrency } from '../../utils/format'

type TransactionItem = {
  id?: number
  tipo_nombre?: string
  fecha_transaccion?: string
  titulo?: string
  descripcion?: string
  categoria_nombre?: string
  categoria_color?: string
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

const TYPE_COLOR = {
  INGRESO: '#1EB256',
  GASTO: '#F43F5E',
  TRANSFERENCIA: '#64748B',
}

function dayKey(value?: string) {
  if (!value) return 'sin-fecha'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'sin-fecha'
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function dayLabel(value?: string) {
  if (!value) return 'Sin fecha'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Sin fecha'

  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(hoy.getDate() - 1)
  const mismoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString()

  if (mismoDia(d, hoy)) return 'Hoy'
  if (mismoDia(d, ayer)) return 'Ayer'

  const esteAno = d.getFullYear() === hoy.getFullYear()
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(esteAno ? {} : { year: 'numeric' }),
  }).format(d)
}

function hourLabel(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' }).format(d)
}

export default function RecentTransactions({
  loading,
  transactions,
  moneda,
  onNavigate,
}: RecentTransactionsProps) {
  const reduceMotion = useReducedMotion()

  const recent = [...transactions]
    .filter((t) => t.activa !== false)
    .sort(
      (a, b) =>
        new Date(b.fecha_transaccion || 0).getTime() -
        new Date(a.fecha_transaccion || 0).getTime(),
    )
    .slice(0, 7)

  type Grupo = { key: string; label: string; items: { txn: TransactionItem; orden: number }[] }

  const grupos = recent.reduce<Grupo[]>((acc, txn, orden) => {
    const key = dayKey(txn.fecha_transaccion)
    const ultimo = acc[acc.length - 1]
    if (ultimo && ultimo.key === key) ultimo.items.push({ txn, orden })
    else acc.push({ key, label: dayLabel(txn.fecha_transaccion), items: [{ txn, orden }] })
    return acc
  }, [])

  const ingresos = recent
    .filter((t) => (t.tipo_nombre || '').toUpperCase() === 'INGRESO')
    .reduce((s, t) => s + Math.abs(Number(t.monto) || 0), 0)
  const gastos = recent
    .filter((t) => (t.tipo_nombre || '').toUpperCase() === 'GASTO')
    .reduce((s, t) => s + Math.abs(Number(t.monto) || 0), 0)
  const totalFlujo = ingresos + gastos

  return (
    <div className="rounded-2xl border border-slate-900/5 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Últimos movimientos
          </h3>
          {!loading && recent.length > 0 && (
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {recent.length} {recent.length === 1 ? 'registro reciente' : 'registros recientes'}
            </p>
          )}
        </div>
        <button
          onClick={() => onNavigate('transactions')}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:hover:bg-brand-900/30"
        >
          Ver todos
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {!loading && totalFlujo > 0 && (
        <div className="mb-5">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${(ingresos / totalFlujo) * 100}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="h-full bg-brand-500"
            />
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${(gastos / totalFlujo) * 100}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="h-full bg-rose-400"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem]">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              Ingresos
              <span className="tabular-nums font-medium text-slate-700 dark:text-slate-200">
                {formatCurrency(ingresos, moneda)}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              Gastos
              <span className="tabular-nums font-medium text-slate-700 dark:text-slate-200">
                {formatCurrency(gastos, moneda)}
              </span>
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-slate-800" />
              <div className="flex-1">
                <div className="mb-1.5 h-3 w-32 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-2 w-20 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : recent.length > 0 ? (
        <div className="space-y-5">
          {grupos.map((grupo) => (
            <section key={grupo.key}>
              <div className="mb-1.5 flex items-center gap-3">
                <h4 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-400 first-letter:uppercase dark:text-slate-500">
                  {grupo.label}
                </h4>
                <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
              </div>

              <ul>
                {grupo.items.map(({ txn, orden }) => {
                  const tipo = (txn.tipo_nombre || '').toUpperCase()
                  const isIncome = tipo === 'INGRESO'
                  const isTransfer = tipo === 'TRANSFERENCIA'
                  const tone = isIncome
                    ? TYPE_COLOR.INGRESO
                    : isTransfer
                      ? TYPE_COLOR.TRANSFERENCIA
                      : TYPE_COLOR.GASTO
                  const dotColor = txn.categoria_color || tone
                  const concept =
                    txn.titulo ||
                    txn.descripcion ||
                    txn.categoria_nombre ||
                    (isIncome ? 'Ingreso' : isTransfer ? 'Transferencia' : 'Gasto')
                  const detalles = [txn.categoria_nombre, txn.cuenta_nombre, hourLabel(txn.fecha_transaccion)]
                    .filter(Boolean)
                    .join(' · ')

                  return (
                    <motion.li
                      key={txn.id ?? `${grupo.key}-${orden}`}
                      initial={{ opacity: 0, x: reduceMotion ? 0 : -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: Math.min(orden, 8) * 0.05,
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onNavigate('transactions')}
                        className="group flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70"
                      >
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: `color-mix(in oklab, ${dotColor} 14%, transparent)`,
                            color: dotColor,
                            boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${dotColor} 22%, transparent)`,
                          }}
                        >
                          {isIncome ? Icons.trendUp : isTransfer ? Icons.arrowUpDown : Icons.trendDown}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                            {concept}
                          </span>
                          <span className="mt-0.5 block truncate text-[0.7rem] text-slate-400 dark:text-slate-500">
                            {detalles || '—'}
                          </span>
                        </span>

                        <span
                          className={`shrink-0 text-sm font-semibold tabular-nums ${
                            isTransfer ? 'text-slate-500 dark:text-slate-400' : ''
                          }`}
                          style={isTransfer ? undefined : { color: tone }}
                        >
                          {isIncome ? '+' : isTransfer ? '' : '−'}
                          {formatCurrency(Math.abs(Number(txn.monto) || 0), txn.moneda || moneda)}
                        </span>
                      </button>
                    </motion.li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="relative isolate flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 dark:border-slate-700 dark:bg-slate-900/60">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)]"
          />
          <div className="relative mb-3 rounded-2xl bg-brand-50 p-3 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-800/50">
            {Icons.arrowUpDown}
          </div>
          <p className="relative mb-1 text-sm font-medium text-slate-700 dark:text-slate-100">
            Sin movimientos
          </p>
          <p className="relative mb-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Registra tu primer ingreso o gasto para empezar
          </p>
          <button
            onClick={() => onNavigate('transactions')}
            className="relative inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-600"
          >
            {Icons.plus}
            Registrar movimiento
          </button>
        </div>
      )}
    </div>
  )
}
