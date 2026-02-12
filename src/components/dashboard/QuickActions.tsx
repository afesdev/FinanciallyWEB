import { Icons } from './Icons'

type QuickActionsProps = {
  onNavigate: (section: string) => void
}

const ACTIONS = [
  { label: 'Nueva cuenta', icon: Icons.wallet, section: 'accounts' },
  { label: 'Transaccion', icon: Icons.arrowUpDown, section: 'transactions' },
  { label: 'Nueva meta', icon: Icons.target, section: 'goals' },
  { label: 'Presupuesto', icon: Icons.chartBar, section: 'budgets' },
]

export default function QuickActions({ onNavigate }: QuickActionsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-white">Acciones rapidas</h3>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((item) => (
          <button
            key={item.section}
            onClick={() => onNavigate(item.section)}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-white/5 p-3 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            {item.icon}
            <span className="text-[11px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
