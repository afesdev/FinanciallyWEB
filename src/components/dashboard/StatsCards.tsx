import { Icons } from './Icons'
import { formatCurrency } from '../../utils/format'

type StatsCardsProps = {
  loading: boolean
  totalBalance: number
  incomeThisMonth: number
  expensesThisMonth: number
  moneda: string
}

export default function StatsCards({ loading, totalBalance, incomeThisMonth, expensesThisMonth, moneda }: StatsCardsProps) {
  const netBalance = incomeThisMonth - expensesThisMonth

  const cards = [
    {
      label: 'Saldo total',
      value: totalBalance,
      subtitle: 'Todas tus cuentas',
      subtitleIcon: Icons.shield,
      icon: Icons.wallet,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      subtitleColor: 'text-emerald-600',
      blobColor: 'bg-emerald-500/5 group-hover:bg-emerald-500/10',
    },
    {
      label: 'Ingresos del mes',
      value: incomeThisMonth,
      subtitle: 'Ingreso acumulado',
      subtitleIcon: Icons.trendUp,
      icon: Icons.trendUp,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      subtitleColor: 'text-blue-600',
      blobColor: 'bg-blue-500/5 group-hover:bg-blue-500/10',
    },
    {
      label: 'Gastos del mes',
      value: expensesThisMonth,
      subtitle: 'Gasto acumulado',
      subtitleIcon: Icons.trendDown,
      icon: Icons.trendDown,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      subtitleColor: 'text-rose-600',
      blobColor: 'bg-rose-500/5 group-hover:bg-rose-500/10',
    },
    {
      label: 'Balance neto',
      value: netBalance,
      subtitle: 'Este mes',
      subtitleIcon: Icons.clock,
      icon: Icons.chartBar,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      subtitleColor: 'text-slate-500',
      blobColor: 'bg-violet-500/5 group-hover:bg-violet-500/10',
      valueColor: netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600',
    },
  ]

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full transition-all ${card.blobColor}`} />
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {card.label}
            </span>
            <div className={`rounded-lg p-2 ${card.iconBg} ${card.iconColor}`}>
              {card.icon}
            </div>
          </div>
          <p className={`text-2xl font-bold ${card.valueColor ?? 'text-slate-900'} dark:text-slate-50`}>
            {loading ? '...' : formatCurrency(card.value, moneda)}
          </p>
          <p className={`mt-1 flex items-center gap-1 text-xs ${card.subtitleColor}`}>
            {card.subtitleIcon}
            {card.subtitle}
          </p>
        </div>
      ))}
    </div>
  )
}
