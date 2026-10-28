import { useState, type FormEvent } from 'react'
import type { Prestamo, CreatePagoPrestamoDto, Account } from '../../services/api'
import { formatCurrency } from '../../utils/format'
import { TONO, cuotaSugerida, diasHasta, prestamoProgreso } from '../../utils/prestamos'
import Modal from '../ui/Modal'
import { LoanRing } from './LoanCard'

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'

const labelClass =
  'mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400'

type PagoPrestamoModalProps = {
  open: boolean
  prestamo: Prestamo | null
  accounts: Account[]
  moneda?: string
  loading?: boolean
  onClose: () => void
  onSubmit: (payload: CreatePagoPrestamoDto) => Promise<void> | void
}

export default function PagoPrestamoModal({
  open,
  prestamo,
  accounts,
  moneda = 'COP',
  loading,
  onClose,
  onSubmit,
}: PagoPrestamoModalProps) {
  const esDeuda = prestamo?.tipo === 'DEUDA'

  return (
    <Modal
      open={open && Boolean(prestamo)}
      title={esDeuda ? 'Registrar pago' : 'Registrar cobro'}
      subtitle={prestamo?.nombre}
      accentColor={esDeuda ? TONO.DEUDA : TONO.PRESTAMO}
      locked={loading}
      maxWidth="max-w-md"
      onClose={onClose}
    >
      {prestamo && (
        <PagoForm
          key={prestamo.id}
          prestamo={prestamo}
          accounts={accounts}
          moneda={moneda}
          loading={loading}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  )
}

type PagoFormProps = {
  prestamo: Prestamo
  accounts: Account[]
  moneda: string
  loading?: boolean
  onClose: () => void
  onSubmit: (payload: CreatePagoPrestamoDto) => Promise<void> | void
}

function PagoForm({ prestamo, accounts, moneda, loading, onClose, onSubmit }: PagoFormProps) {
  const [monto, setMonto] = useState('')
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10))
  const [cuentaId, setCuentaId] = useState<number | ''>('')
  const [notas, setNotas] = useState('')

  const esDeuda = prestamo.tipo === 'DEUDA'
  const color = esDeuda ? TONO.DEUDA : TONO.PRESTAMO
  const { total, pendiente, pagado, pct } = prestamoProgreso(prestamo)

  const valor = Number(monto) || 0
  const nuevoPagado = pagado + valor
  const nuevoPct = total > 0 ? Math.min(100, Math.round((nuevoPagado / total) * 100)) : 0
  const excede = valor > pendiente && pendiente > 0
  const salda = valor > 0 && nuevoPagado >= total

  const dias = diasHasta(prestamo.fecha_fin)
  const cuota = cuotaSugerida(pendiente, dias)

  const atajos = [
    cuota ? { label: 'Cuota', valor: cuota } : null,
    pendiente > 0 ? { label: '25%', valor: Math.ceil(pendiente * 0.25) } : null,
    pendiente > 0 ? { label: '50%', valor: Math.ceil(pendiente * 0.5) } : null,
    pendiente > 0 ? { label: 'Saldar', valor: pendiente } : null,
  ].filter(Boolean) as { label: string; valor: number }[]

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (valor <= 0) return
    await onSubmit({
      monto: valor,
      fechaPago: fechaPago || undefined,
      cuentaId: cuentaId === '' ? undefined : Number(cuentaId),
      notas: notas.trim() || undefined,
    })
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
        <LoanRing pct={valor > 0 ? nuevoPct : pct} color={color} size={56} />
        <div className="min-w-0">
          <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-50">
            {formatCurrency(Math.max(0, pendiente - valor), moneda)}
            <span className="ml-1.5 text-xs font-normal text-slate-400 dark:text-slate-500">
              quedaría pendiente
            </span>
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {valor > 0 ? (
              salda ? (
                <span className="font-medium text-brand-600 dark:text-brand-400">
                  Con este {esDeuda ? 'pago' : 'cobro'} queda saldado
                </span>
              ) : (
                <>
                  Pasas de {pct}% a{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-200">{nuevoPct}%</span>
                </>
              )
            ) : (
              `${formatCurrency(pagado, moneda)} de ${formatCurrency(total, moneda)}`
            )}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="pago-monto" className={labelClass}>
            Monto del {esDeuda ? 'pago' : 'cobro'} <span className="text-rose-500">*</span>
          </label>
          <input
            id="pago-monto"
            type="number"
            required
            min="0.01"
            step="0.01"
            autoFocus
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className={`${inputClass} tabular-nums`}
            placeholder="0"
          />

          {atajos.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {atajos.map((atajo) => (
                <button
                  key={atajo.label}
                  type="button"
                  onClick={() => setMonto(String(atajo.valor))}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  {atajo.label}
                  <span className="ml-1.5 tabular-nums opacity-60">
                    {formatCurrency(atajo.valor, moneda)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {excede && (
            <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
              El monto supera lo pendiente ({formatCurrency(pendiente, moneda)}). Usa «Saldar»
              para cerrarlo exacto.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="pago-fecha" className={labelClass}>
            Fecha
          </label>
          <input
            id="pago-fecha"
            type="date"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
            className={inputClass}
          />
        </div>

        {accounts.length > 0 && (
          <div>
            <label htmlFor="pago-cuenta" className={labelClass}>
              {esDeuda ? 'Sale de la cuenta' : 'Entra a la cuenta'}
            </label>
            <select
              id="pago-cuenta"
              value={cuentaId === '' ? '' : cuentaId}
              onChange={(e) => setCuentaId(e.target.value === '' ? '' : Number(e.target.value))}
              className={inputClass}
            >
              <option value="">Sin cuenta</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.nombre} ({formatCurrency(acc.saldo_actual ?? acc.saldo_inicial ?? 0, acc.moneda)})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="pago-notas" className={labelClass}>
            Notas (opcional)
          </label>
          <input
            id="pago-notas"
            type="text"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className={inputClass}
            placeholder="Ej: Cuota de julio"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || valor <= 0 || excede}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: color }}
          >
            {loading && (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 animate-spin">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="opacity-30"
                />
                <path
                  d="M21 12a9 9 0 0 0-9-9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {loading ? 'Guardando…' : `Registrar ${esDeuda ? 'pago' : 'cobro'}`}
          </button>
        </div>
      </form>
    </>
  )
}
