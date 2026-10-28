import { useEffect } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { Icons } from './Icons'
import { formatCurrency } from '../../utils/format'

type StatsCardsProps = {
  loading: boolean
  totalBalance: number
  incomeThisMonth: number
  expensesThisMonth: number
  moneda: string
  variacionIngresos?: number | null
  variacionGastos?: number | null
}

export function AnimatedCurrency({ value, moneda }: { value: number; moneda: string }) {
  const reduceMotion = useReducedMotion()
  const count = useMotionValue(0)
  const text = useTransform(count, (latest) => formatCurrency(Math.round(latest), moneda))

  useEffect(() => {
    if (reduceMotion) {
      count.set(value)
      return
    }
    const controls = animate(count, value, { duration: 1.1, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [value, count, reduceMotion])

  return <motion.span>{text}</motion.span>
}

function variacionTexto(valor: number, esGasto: boolean) {
  const magnitud = Math.abs(valor).toLocaleString('es-CO', { maximumFractionDigits: 1 })
  if (esGasto) {
    return valor <= 0
      ? `${magnitud}% menos que el mes pasado`
      : `${magnitud}% más que el mes pasado`
  }
  return `${valor >= 0 ? '+' : '-'}${magnitud}% vs. mes pasado`
}

export default function StatsCards({
  loading,
  totalBalance,
  incomeThisMonth,
  expensesThisMonth,
  moneda,
  variacionIngresos,
  variacionGastos,
}: StatsCardsProps) {
  const reduceMotion = useReducedMotion()
  const netBalance = incomeThisMonth - expensesThisMonth
  const savingsRate =
    incomeThisMonth > 0 ? Math.round((netBalance / incomeThisMonth) * 100) : null

  const buenaNoticia = 'text-brand-600 dark:text-brand-400'
  const malaNoticia = 'text-rose-600 dark:text-rose-400'
  const neutro = 'text-slate-500 dark:text-slate-400'

  const cards = [
    {
      label: 'Saldo total',
      value: totalBalance,
      subtitle: 'Todas tus cuentas',
      subtitleIcon: Icons.shield,
      icon: Icons.wallet,
      ring: 'bg-slate-50 text-slate-600 ring-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
      valueColor: 'text-slate-900 dark:text-slate-50',
      subtitleColor: neutro,
    },
    {
      label: 'Ingresos del mes',
      value: incomeThisMonth,
      subtitle:
        typeof variacionIngresos === 'number'
          ? variacionTexto(variacionIngresos, false)
          : 'Ingreso acumulado',
      subtitleIcon: Icons.trendUp,
      icon: Icons.trendUp,
      ring: 'bg-brand-50 text-brand-600 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-800/50',
      valueColor: 'text-brand-600 dark:text-brand-400',
      subtitleColor:
        typeof variacionIngresos === 'number'
          ? variacionIngresos >= 0
            ? buenaNoticia
            : malaNoticia
          : neutro,
    },
    {
      label: 'Gastos del mes',
      value: expensesThisMonth,
      subtitle:
        typeof variacionGastos === 'number'
          ? variacionTexto(variacionGastos, true)
          : 'Gasto acumulado',
      subtitleIcon: Icons.trendDown,
      icon: Icons.trendDown,
      ring: 'bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:ring-rose-800/50',
      valueColor: 'text-rose-600 dark:text-rose-400',
      subtitleColor:
        typeof variacionGastos === 'number'
          ? variacionGastos <= 0
            ? buenaNoticia
            : malaNoticia
          : neutro,
    },
    {
      label: 'Balance neto',
      value: netBalance,
      subtitle:
        savingsRate === null
          ? 'Este mes'
          : `${savingsRate >= 0 ? 'Ahorras' : 'Gastas'} ${Math.abs(savingsRate)}% de tus ingresos`,
      subtitleIcon: Icons.clock,
      icon: Icons.chartBar,
      ring: 'bg-slate-50 text-slate-600 ring-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
      valueColor: netBalance >= 0 ? 'text-slate-900 dark:text-slate-50' : malaNoticia,
      subtitleColor: neutro,
    },
  ]

  return (
    <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileHover={reduceMotion ? undefined : { y: -3 }}
          className="group relative overflow-hidden rounded-2xl border border-slate-900/5 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:shadow-none"
        >
          <div className="relative mb-4 flex items-start justify-between">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              {card.label}
            </span>
            <div className={`rounded-xl p-2 ring-1 ${card.ring}`}>{card.icon}</div>
          </div>

          {loading ? (
            <div className="relative">
              <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ) : (
            <div className="relative">
              <p className={`text-2xl font-semibold tabular-nums tracking-tight ${card.valueColor}`}>
                <AnimatedCurrency value={card.value} moneda={moneda} />
              </p>
              <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${card.subtitleColor}`}>
                {card.subtitleIcon}
                {card.subtitle}
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
