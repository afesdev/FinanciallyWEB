import { motion, useReducedMotion } from 'motion/react'
import type { DashboardResponse } from '../../services/api'
import { formatCurrency } from '../../utils/format'

type MonthlyFlowProps = {
  loading: boolean
  evolucion: DashboardResponse['evolucion_mensual']
  moneda: string
}

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function etiquetaMes(mes: string) {
  const partes = mes.split('-')
  if (partes.length >= 2) {
    const indice = Number(partes[1]) - 1
    if (indice >= 0 && indice < 12) return MESES_CORTOS[indice]
  }
  const fecha = new Date(mes)
  if (!Number.isNaN(fecha.getTime())) return MESES_CORTOS[fecha.getMonth()]
  return mes.slice(0, 3)
}

export default function MonthlyFlow({ loading, evolucion, moneda }: MonthlyFlowProps) {
  const reduceMotion = useReducedMotion()
  const meses = evolucion.slice(-6)
  const maximo = meses.reduce(
    (max, m) => Math.max(max, Number(m.ingresos) || 0, Number(m.gastos) || 0),
    0,
  )
  const ahorroPromedio = meses.length
    ? meses.reduce((sum, m) => sum + ((Number(m.ingresos) || 0) - (Number(m.gastos) || 0)), 0) /
      meses.length
    : 0

  return (
    <div className="rounded-2xl border border-slate-900/5 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Flujo de los últimos 6 meses
          </h3>
          {!loading && meses.length > 0 && (
            <p className="mt-0.5 text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {ahorroPromedio >= 0 ? 'Ahorras' : 'Gastas de más'} en promedio{' '}
              {formatCurrency(Math.abs(Math.round(ahorroPromedio)), moneda)} al mes
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-brand-500" />
            Ingresos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
            Gastos
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-[172px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      ) : meses.length > 0 ? (
        <>
          <div className="flex h-[172px] items-end justify-between gap-2 border-b border-slate-100 pt-2 dark:border-slate-800">
            {meses.map((mes, i) => {
              const ingresos = Number(mes.ingresos) || 0
              const gastos = Number(mes.gastos) || 0
              const esActual = i === meses.length - 1
              const altoIngresos = maximo > 0 ? Math.max((ingresos / maximo) * 150, 2) : 2
              const altoGastos = maximo > 0 ? Math.max((gastos / maximo) * 150, 2) : 2
              return (
                <div key={mes.mes} className="flex flex-1 items-end justify-center gap-1">
                  <motion.div
                    initial={{ height: reduceMotion ? altoIngresos : 2 }}
                    animate={{ height: altoIngresos }}
                    transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    title={`Ingresos ${formatCurrency(ingresos, moneda)}`}
                    className={`w-full max-w-[26px] rounded-t-md ${
                      esActual ? 'bg-brand-500' : 'bg-brand-200 dark:bg-brand-800'
                    }`}
                  />
                  <motion.div
                    initial={{ height: reduceMotion ? altoGastos : 2 }}
                    animate={{ height: altoGastos }}
                    transition={{ delay: 0.05 * i + 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    title={`Gastos ${formatCurrency(gastos, moneda)}`}
                    className={`w-full max-w-[26px] rounded-t-md ${
                      esActual ? 'bg-rose-500' : 'bg-rose-200 dark:bg-rose-900'
                    }`}
                  />
                </div>
              )
            })}
          </div>

          <div className="mt-2.5 flex justify-between gap-2">
            {meses.map((mes, i) => (
              <span
                key={mes.mes}
                className={`flex-1 text-center text-[0.7rem] ${
                  i === meses.length - 1
                    ? 'font-semibold text-slate-900 dark:text-slate-100'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {etiquetaMes(mes.mes)}
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="flex h-[172px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
          Aún no hay meses con movimientos para comparar
        </div>
      )}
    </div>
  )
}
