import { TIPO_TRANSACCION, type Transaccion } from '../../services/api'
import { formatCurrency } from '../../utils/format'

type TransaccionDetailModalProps = {
  open: boolean
  transaccion: Transaccion | null
  moneda: string
  onClose: () => void
}

export default function TransaccionDetailModal({ open, transaccion, moneda, onClose }: TransaccionDetailModalProps) {
  if (!open || !transaccion) return null

  const tx = transaccion
  const isIngreso = tx.tipo_transaccion_id === TIPO_TRANSACCION.INGRESO
  const isTransferencia = tx.tipo_transaccion_id === TIPO_TRANSACCION.TRANSFERENCIA

  const tipoBadge = isIngreso
    ? {
        label: 'Ingreso',
        bg: 'bg-emerald-50 dark:bg-emerald-900/40',
        text: 'text-emerald-700 dark:text-emerald-200',
        border: 'border-emerald-200 dark:border-emerald-500/60',
      }
    : isTransferencia
      ? {
          label: 'Transferencia',
          bg: 'bg-cyan-50 dark:bg-cyan-900/40',
          text: 'text-cyan-700 dark:text-cyan-200',
          border: 'border-cyan-200 dark:border-cyan-500/60',
        }
      : {
          label: 'Gasto',
          bg: 'bg-rose-50 dark:bg-rose-900/40',
          text: 'text-rose-700 dark:text-rose-200',
          border: 'border-rose-200 dark:border-rose-500/60',
        }

  const amountColor = isIngreso
    ? 'text-emerald-600 dark:text-emerald-300'
    : isTransferencia
      ? 'text-cyan-600 dark:text-cyan-300'
      : 'text-rose-600 dark:text-rose-300'
  const amountPrefix = isIngreso ? '+' : isTransferencia ? '' : '-'

  const fechaTx = new Date(tx.fecha_transaccion).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const horaTx = new Date(tx.fecha_transaccion).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const fechaCreacion = tx.fecha_creacion
    ? new Date(tx.fecha_creacion).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  type DetailRow = { label: string; value: string | null | undefined; alwaysShow?: boolean; badge?: { bg: string; text: string } }

  const rows: DetailRow[] = [
    { label: 'Título', value: tx.titulo },
    { label: 'Descripción', value: tx.descripcion },
    { label: 'Categoría', value: tx.categoria_nombre },
    { label: 'Cuenta', value: tx.cuenta_nombre },
    { label: 'Método de pago', value: tx.metodo_pago_nombre },
    { label: 'Fecha', value: `${fechaTx} a las ${horaTx}`, alwaysShow: true },
    { label: 'Notas', value: tx.notas },
    { label: 'Archivo adjunto', value: tx.archivo_adjunto },
    {
      label: 'Recurrente',
      value: tx.repetir ? 'Sí' : 'No',
      alwaysShow: true,
      badge: tx.repetir ? { bg: 'bg-emerald-50', text: 'text-emerald-700' } : undefined,
    },
    {
      label: 'Estado',
      value: tx.activa ? 'Activa' : 'Archivada',
      alwaysShow: true,
      badge: tx.activa ? { bg: 'bg-emerald-50', text: 'text-emerald-700' } : { bg: 'bg-amber-50', text: 'text-amber-700' },
    },
    { label: 'Fecha de creación', value: fechaCreacion },
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Detalle de transacción</h2>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        {/* Amount + type badge + recurrente indicator */}
        <div className="flex flex-col items-center gap-2 px-6 py-5">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tipoBadge.bg} ${tipoBadge.text} ${tipoBadge.border}`}
            >
              {tipoBadge.label}
            </span>
            {tx.repetir && (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-500/60 dark:bg-violet-950/40 dark:text-violet-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 2l4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />
                </svg>
                Recurrente
              </span>
            )}
          </div>
          <p className={`text-3xl font-bold ${amountColor}`}>
            {amountPrefix}{formatCurrency(tx.monto, moneda)}
          </p>
        </div>

        {/* Detail rows */}
        <div className="max-h-[50vh] overflow-y-auto border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <dl className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => {
              if (!row.value && !row.alwaysShow) return null
              if (!row.value) return null
              return (
                <div key={row.label} className="flex items-start justify-between gap-4 py-3">
                  <dt className="flex-shrink-0 text-sm text-slate-500 dark:text-slate-400">{row.label}</dt>
                  <dd className="text-right text-sm font-medium text-slate-900 dark:text-slate-100">
                    {row.badge ? (
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${row.badge.bg} ${row.badge.text}`}>
                        {row.value}
                      </span>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
