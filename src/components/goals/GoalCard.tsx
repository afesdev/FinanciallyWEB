import { motion, useReducedMotion } from 'motion/react'
import type { Meta } from '../../services/api'
import { formatCurrency } from '../../utils/format'
import { aporteMensualSugerido, diasRestantes, metaProgreso } from '../../utils/metas'

const RADIO = 19
const CIRCUNFERENCIA = 2 * Math.PI * RADIO

export function ProgressRing({
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

type GoalCardProps = {
  meta: Meta
  moneda: string
  index?: number
  compact?: boolean
  onAportar?: (meta: Meta) => void
  onHistorial?: (meta: Meta) => void
  onEdit?: (meta: Meta) => void
  onToggle?: (meta: Meta) => void
  onDelete?: (meta: Meta) => void
}

export default function GoalCard({
  meta,
  moneda,
  index = 0,
  compact = false,
  onAportar,
  onHistorial,
  onEdit,
  onToggle,
  onDelete,
}: GoalCardProps) {
  const reduceMotion = useReducedMotion()
  const color = meta.color || '#1EB256'
  const { objetivo, actual, pct, restante, completada } = metaProgreso(meta)
  const dias = diasRestantes(meta.fecha_objetivo)
  const vencida = dias !== null && dias < 0 && !completada

  const aporteMensual = completada ? null : aporteMensualSugerido(restante, dias)

  const estado = completada
    ? { label: 'Completada', tone: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' }
    : vencida
      ? { label: 'Vencida', tone: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' }
      : !meta.activa
        ? { label: 'Pausada', tone: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' }
        : null

  const plazo =
    dias === null
      ? null
      : completada
        ? 'Objetivo alcanzado'
        : dias < 0
          ? `Venció hace ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'día' : 'días'}`
          : dias === 0
            ? 'Vence hoy'
            : dias === 1
              ? 'Queda 1 día'
              : dias < 45
                ? `Quedan ${dias} días`
                : `Quedan ${Math.round(dias / 30)} meses`

  return (
    <motion.article
      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion || compact ? undefined : { y: -4 }}
      className={`group relative isolate flex flex-col overflow-hidden rounded-2xl border border-slate-900/5 bg-white transition-shadow hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:shadow-none ${
        compact ? 'p-4' : 'p-5'
      } ${meta.activa || completada ? '' : 'opacity-75'}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-[0.07] transition-transform duration-500 group-hover:scale-125"
        style={{ backgroundColor: color }}
      />

      <div className="relative flex items-start gap-4">
        <ProgressRing pct={pct} color={color} size={compact ? 48 : 56} index={index} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`truncate font-semibold tracking-tight text-slate-900 dark:text-slate-50 ${
                compact ? 'text-sm' : 'text-base'
              }`}
            >
              {meta.nombre}
            </h3>
            {estado && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${estado.tone}`}
              >
                {estado.label}
              </span>
            )}
          </div>

          {!compact && meta.descripcion && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
              {meta.descripcion}
            </p>
          )}

          <p
            className={`mt-2 font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-50 ${
              compact ? 'text-sm' : 'text-lg'
            }`}
          >
            {formatCurrency(actual, moneda)}
            <span className="ml-1.5 text-xs font-normal text-slate-400 dark:text-slate-500">
              de {formatCurrency(objetivo, moneda)}
            </span>
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {plazo && (
          <span
            className={`rounded-full px-2.5 py-1 text-[0.68rem] ${
              vencida
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300'
                : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {plazo}
          </span>
        )}
        {!completada && restante > 0 && (
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[0.68rem] tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Faltan {formatCurrency(restante, moneda)}
          </span>
        )}
        {!compact && !completada && aporteMensual !== null && (
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[0.68rem] tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            ≈ {formatCurrency(aporteMensual, moneda)}/mes
          </span>
        )}
      </div>

      {(onAportar || onHistorial || onEdit || onToggle || onDelete) && (
        <div className="relative mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          {onAportar && meta.activa && !completada && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onAportar(meta)}
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
              Aportar
            </motion.button>
          )}

          <div className="ml-auto flex gap-1">
            {onHistorial && (
              <button
                type="button"
                onClick={() => onHistorial(meta)}
                aria-label={`Ver aportes de ${meta.nombre}`}
                title="Historial de aportes"
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
                onClick={() => onEdit(meta)}
                aria-label={`Editar ${meta.nombre}`}
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
                onClick={() => onToggle(meta)}
                aria-label={meta.activa ? `Pausar ${meta.nombre}` : `Activar ${meta.nombre}`}
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
                  {meta.activa ? (
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
                onClick={() => onDelete(meta)}
                aria-label={`Eliminar ${meta.nombre}`}
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
