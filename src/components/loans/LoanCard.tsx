import { motion, useReducedMotion } from 'motion/react'
import type { Prestamo } from '../../services/api'
import { formatCurrency } from '../../utils/format'
import { TONO, cuotaSugerida, diasHasta, etiquetaPlazo, prestamoProgreso } from '../../utils/prestamos'

const RADIO = 19
const CIRCUNFERENCIA = 2 * Math.PI * RADIO

export function LoanRing({
  pct,
  color,
  size = 56,
  index = 0,
}: {
  pct: number
  color: string
  size?: number
  index?: number
}) {
  const reduceMotion = useReducedMotion()
  const offset = CIRCUNFERENCIA * (1 - Math.min(100, Math.max(0, pct)) / 100)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 44 44" className="h-full w-full -rotate-90">
        <circle
          cx="22"
          cy="22"
          r={RADIO}
          fill="none"
          strokeWidth="4"
          className="stroke-slate-100 dark:stroke-slate-800"
        />
        <motion.circle
          cx="22"
          cy="22"
          r={RADIO}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={CIRCUNFERENCIA}
          initial={{ strokeDashoffset: reduceMotion ? offset : CIRCUNFERENCIA }}
          animate={{ strokeDashoffset: offset }}
          transition={{ delay: 0.15 + Math.min(index, 8) * 0.06, duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200">
        {pct}%
      </span>
    </div>
  )
}

type LoanCardProps = {
  prestamo: Prestamo
  moneda: string
  index?: number
  compact?: boolean
  onPagar?: (prestamo: Prestamo) => void
  onPagos?: (prestamo: Prestamo) => void
  onEdit?: (prestamo: Prestamo) => void
  onToggle?: (prestamo: Prestamo) => void
  onDelete?: (prestamo: Prestamo) => void
}

export default function LoanCard({
  prestamo,
  moneda,
  index = 0,
  compact = false,
  onPagar,
  onPagos,
  onEdit,
  onToggle,
  onDelete,
}: LoanCardProps) {
  const reduceMotion = useReducedMotion()
  const esDeuda = prestamo.tipo === 'DEUDA'
  const color = esDeuda ? TONO.DEUDA : TONO.PRESTAMO
  const { total, pendiente, pagado, pct, saldado } = prestamoProgreso(prestamo)
  const plazo = etiquetaPlazo(prestamo)
  const dias = diasHasta(prestamo.fecha_fin)
  const cuota = saldado ? null : cuotaSugerida(pendiente, dias)

  const estado = saldado
    ? { label: 'Saldado', tone: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' }
    : plazo?.vencido
      ? { label: 'Vencido', tone: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' }
      : !prestamo.activa
        ? { label: 'Inactivo', tone: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' }
        : null

  return (
    <motion.article
      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion || compact ? undefined : { y: -4 }}
      className={`group relative isolate flex flex-col overflow-hidden rounded-2xl border border-slate-900/5 bg-white transition-shadow hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:shadow-none ${
        compact ? 'p-4' : 'p-5'
      } ${prestamo.activa || saldado ? '' : 'opacity-75'}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-[0.07] transition-transform duration-500 group-hover:scale-125"
        style={{ backgroundColor: color }}
      />

      <div className="relative flex items-start gap-4">
        <LoanRing pct={pct} color={color} size={compact ? 48 : 56} index={index} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`truncate font-semibold tracking-tight text-slate-900 dark:text-slate-50 ${
                compact ? 'text-sm' : 'text-base'
              }`}
            >
              {prestamo.nombre}
            </h3>
            {estado && (
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${estado.tone}`}>
                {estado.label}
              </span>
            )}
          </div>

          <span
            className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.68rem] font-medium"
            style={{
              backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
              color,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-3 w-3"
            >
              {esDeuda ? <path d="M12 5v14M5 12l7 7 7-7" /> : <path d="M12 19V5M5 12l7-7 7 7" />}
            </svg>
            {esDeuda ? 'Yo debo' : 'Me deben'}
          </span>

          <p
            className={`mt-2 font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-50 ${
              compact ? 'text-sm' : 'text-lg'
            }`}
          >
            {formatCurrency(pendiente, moneda)}
            <span className="ml-1.5 text-xs font-normal text-slate-400 dark:text-slate-500">
              pendiente
            </span>
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-slate-400 dark:text-slate-500">
            {formatCurrency(pagado, moneda)} pagado de {formatCurrency(total, moneda)}
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {plazo && (
          <span
            className={`rounded-full px-2.5 py-1 text-[0.68rem] ${
              plazo.vencido
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300'
                : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {plazo.texto}
          </span>
        )}
        {!compact && cuota !== null && (
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[0.68rem] tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            ≈ {formatCurrency(cuota, moneda)}/mes
          </span>
        )}
        {!compact && prestamo.tasa_interes != null && prestamo.tasa_interes > 0 && (
          <span
            title="Tasa de referencia: no está incluida en los montos"
            className="rounded-full bg-slate-50 px-2.5 py-1 text-[0.68rem] tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          >
            {prestamo.tasa_interes}% anual (ref.)
          </span>
        )}
      </div>

      {(onPagar || onPagos || onEdit || onToggle || onDelete) && (
        <div className="relative mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          {onPagar && prestamo.activa && !saldado && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onPagar(prestamo)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: color }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                aria-hidden="true"
                className="h-3.5 w-3.5"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Registrar pago
            </motion.button>
          )}

          <div className="ml-auto flex gap-1">
            {onPagos && (
              <button
                type="button"
                onClick={() => onPagos(prestamo)}
                aria-label={`Ver pagos de ${prestamo.nombre}`}
                title="Historial de pagos"
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
                  <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
                  <path d="M3 4.5V9h4.5" />
                  <path d="M12 8v4.3l3 1.7" />
                </svg>
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(prestamo)}
                aria-label={`Editar ${prestamo.nombre}`}
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
                onClick={() => onToggle(prestamo)}
                aria-label={prestamo.activa ? `Desactivar ${prestamo.nombre}` : `Activar ${prestamo.nombre}`}
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
                  {prestamo.activa ? (
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
                onClick={() => onDelete(prestamo)}
                aria-label={`Eliminar ${prestamo.nombre}`}
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
