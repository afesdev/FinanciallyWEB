import { motion, useReducedMotion } from 'motion/react'
import type { Presupuesto } from '../../services/api'
import { formatCurrency } from '../../utils/format'
import { PERIODO_LABEL, etiquetaPeriodo, presupuestoResumen } from '../../utils/presupuestos'

const TONO = {
  EXCEDIDO: '#F43F5E',
  EN_RIESGO: '#F59E0B',
  AL_DIA: '#1EB256',
  TERMINADO: '#64748B',
}

const ESTADO_LABEL = {
  EXCEDIDO: 'Excedido',
  EN_RIESGO: 'Ritmo alto',
  AL_DIA: 'Al día',
  TERMINADO: 'Cerrado',
}

type BudgetCardProps = {
  presupuesto: Presupuesto
  moneda: string
  index?: number
  categoriaNombre?: string | null
  categoriaColor?: string | null
  cuentaNombre?: string | null
  onEdit?: (p: Presupuesto) => void
  onToggle?: (p: Presupuesto) => void
  onRecalc?: (p: Presupuesto) => void
  onDelete?: (p: Presupuesto) => void
  recalculando?: boolean
}

export default function BudgetCard({
  presupuesto,
  moneda,
  index = 0,
  categoriaNombre,
  categoriaColor,
  cuentaNombre,
  onEdit,
  onToggle,
  onRecalc,
  onDelete,
  recalculando = false,
}: BudgetCardProps) {
  const reduceMotion = useReducedMotion()
  const r = presupuestoResumen(presupuesto)
  const color = TONO[r.estado]
  const plazo = etiquetaPeriodo(presupuesto)

  return (
    <motion.article
      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className={`group relative isolate flex flex-col overflow-hidden rounded-2xl border border-slate-900/5 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:shadow-none ${
        presupuesto.activo ? '' : 'opacity-75'
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-[0.07] transition-transform duration-500 group-hover:scale-125"
        style={{ backgroundColor: color }}
      />

      <header className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {presupuesto.nombre}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[0.65rem] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {PERIODO_LABEL[presupuesto.periodo] ?? presupuesto.periodo}
            </span>
            {categoriaNombre && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.65rem]"
                style={{
                  backgroundColor: `color-mix(in oklab, ${categoriaColor || '#64748B'} 12%, transparent)`,
                  color: categoriaColor || '#64748B',
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: categoriaColor || '#64748B' }}
                />
                {categoriaNombre}
              </span>
            )}
            {cuentaNombre && (
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[0.65rem] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {cuentaNombre}
              </span>
            )}
          </div>
        </div>

        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
          style={{
            backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
            color,
          }}
        >
          {ESTADO_LABEL[r.estado]}
        </span>
      </header>

      <div className="relative mt-5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-50">
            {formatCurrency(r.gastado, moneda)}
          </p>
          <p className="text-xs tabular-nums text-slate-400 dark:text-slate-500">
            de {formatCurrency(r.limite, moneda)}
          </p>
        </div>

        <div className="relative mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: `${r.pctGastoBarra}%` }}
            transition={{ delay: 0.2 + Math.min(index, 8) * 0.05, duration: 0.8, ease: 'easeOut' }}
            className="block h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Marca de por donde va el periodo: si el gasto la rebasa, vas rapido */}
        {!r.terminado && !r.noEmpezado && r.pctTiempo > 0 && (
          <div className="relative h-4">
            <span
              className="absolute top-0 -translate-x-1/2"
              style={{ left: `${r.pctTiempo}%` }}
              title={`El periodo va por el ${Math.round(r.pctTiempo)}%`}
            >
              <span className="block h-2 w-px bg-slate-300 dark:bg-slate-600" />
              <span className="mt-0.5 block whitespace-nowrap text-[0.6rem] text-slate-400 dark:text-slate-500">
                hoy
              </span>
            </span>
          </div>
        )}

        <p className="mt-1.5 text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {r.excedido ? (
            <span className="font-medium text-rose-600 dark:text-rose-400">
              Te pasaste {formatCurrency(Math.abs(r.restante), moneda)}
            </span>
          ) : (
            <>
              Te quedan{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {formatCurrency(r.restante, moneda)}
              </span>
              {' · '}
              {Math.round(r.pctGasto)}% usado
            </>
          )}
        </p>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {plazo && (
          <span
            className={`rounded-full px-2.5 py-1 text-[0.68rem] ${
              r.terminado
                ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {plazo}
          </span>
        )}
        {r.disponiblePorDia !== null && (
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[0.68rem] tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {formatCurrency(r.disponiblePorDia, moneda)}/día disponible
          </span>
        )}
        {r.proyeccion !== null && r.proyeccion > r.limite && !r.excedido && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[0.68rem] tabular-nums text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            A este ritmo: {formatCurrency(r.proyeccion, moneda)}
          </span>
        )}
        {!presupuesto.activo && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.68rem] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Inactivo
          </span>
        )}
      </div>

      {(onEdit || onToggle || onRecalc || onDelete) && (
        <div className="relative mt-4 flex items-center gap-1 border-t border-slate-100 pt-4 dark:border-slate-800">
          {onRecalc && (
            <button
              type="button"
              onClick={() => onRecalc(presupuesto)}
              disabled={recalculando}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`h-3.5 w-3.5 ${recalculando ? 'animate-spin' : ''}`}
              >
                <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
                <path d="M21 3v4.5h-4.5" />
              </svg>
              {recalculando ? 'Actualizando…' : 'Actualizar gasto'}
            </button>
          )}

          <div className="ml-auto flex gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(presupuesto)}
                aria-label={`Editar ${presupuesto.nombre}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
            {onToggle && (
              <button
                type="button"
                onClick={() => onToggle(presupuesto)}
                aria-label={presupuesto.activo ? `Pausar ${presupuesto.nombre}` : `Activar ${presupuesto.nombre}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
                  {presupuesto.activo ? (
                    <>
                      <path d="M9.5 5v14" />
                      <path d="M14.5 5v14" />
                    </>
                  ) : (
                    <path d="M7 4.5v15l12-7.5Z" />
                  )}
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(presupuesto)}
                aria-label={`Eliminar ${presupuesto.nombre}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-300"
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
        </div>
      )}
    </motion.article>
  )
}
