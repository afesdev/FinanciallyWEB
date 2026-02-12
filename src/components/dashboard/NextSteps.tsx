import { Icons } from './Icons'

type NextStepsProps = {
  hasAccounts: boolean
  hasTransactions: boolean
  hasGoals: boolean
}

export default function NextSteps({ hasAccounts, hasTransactions, hasGoals }: NextStepsProps) {
  const steps = [
    { text: 'Crea tus primeras cuentas', done: hasAccounts },
    { text: 'Registra un ingreso o gasto', done: hasTransactions },
    { text: 'Define una meta de ahorro', done: hasGoals },
  ]

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/80">
      <h3 className="mb-3 text-sm font-semibold text-emerald-800 dark:text-emerald-100">Proximos pasos</h3>
      <ul className="space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-100">
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              step.done ? 'bg-emerald-500 text-white' : 'border border-emerald-300 bg-white dark:bg-transparent'
            }`}>
              {step.done && Icons.check}
            </div>
            <span className={step.done ? 'line-through opacity-60' : ''}>{step.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
