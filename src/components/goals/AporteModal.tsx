import { useState, type FormEvent } from 'react'
import type { Meta, CreateAporteDto, Account } from '../../services/api'
import { formatCurrency } from '../../utils/format'
import { aporteMensualSugerido, diasRestantes, metaProgreso } from '../../utils/metas'
import Modal from '../ui/Modal'
import { ProgressRing } from './GoalCard'

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'

const labelClass =
  'mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400'

type AporteModalProps = {
  open: boolean
  meta: Meta | null
  accounts: Account[]
  moneda?: string
  loading?: boolean
  onClose: () => void
  onSubmit: (payload: CreateAporteDto) => Promise<void> | void
}

export default function AporteModal({
  open,
  meta,
  accounts,
  moneda = 'COP',
  loading,
  onClose,
  onSubmit,
}: AporteModalProps) {
  return (
    <Modal
      open={open && Boolean(meta)}
      title="Agregar aporte"
      subtitle={meta?.nombre}
      accentColor={meta?.color || '#1EB256'}
      locked={loading}
      maxWidth="max-w-md"
      onClose={onClose}
    >
      {meta && (
        <AporteForm
          key={meta.id}
          meta={meta}
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

type AporteFormProps = {
  meta: Meta
  accounts: Account[]
  moneda: string
  loading?: boolean
  onClose: () => void
  onSubmit: (payload: CreateAporteDto) => Promise<void> | void
}

type Atajo = { label: string; valor: number }

function buildAtajos(restante: number, sugerido: number | null): Atajo[] {
  const list: Atajo[] = []
  if (sugerido !== null && sugerido > 0) list.push({ label: 'Sugerido', valor: sugerido })
  if (restante > 0) {
    list.push({ label: '25%', valor: Math.ceil(restante * 0.25) })
    list.push({ label: '50%', valor: Math.ceil(restante * 0.5) })
    list.push({ label: 'Completar', valor: restante })
  }
  return list
}

function AporteForm({ meta, accounts, moneda, loading, onClose, onSubmit }: AporteFormProps) {
  const [montoAporte, setMontoAporte] = useState('')
  const [cuentaId, setCuentaId] = useState<number | ''>('')
  const [notas, setNotas] = useState('')

  const color = meta.color || '#1EB256'
  const { objetivo, actual, pct, restante } = metaProgreso(meta)

  const monto = Number(montoAporte) || 0
  const nuevoTotal = actual + monto
  const nuevoPct = objetivo > 0 ? Math.min(100, Math.round((nuevoTotal / objetivo) * 100)) : 0
  const excede = monto > restante && restante > 0
  const completaMeta = monto > 0 && nuevoTotal >= objetivo

  const dias = diasRestantes(meta.fecha_objetivo)
  const sugerido = aporteMensualSugerido(restante, dias)
  const atajos = buildAtajos(restante, sugerido)

  const atajoSeleccionado = atajos.find((a) => a.valor === monto)?.label ?? null

  const cuentaSeleccionada = accounts.find((a) => a.id === cuentaId)
  const saldoCuenta =
    cuentaSeleccionada
      ? Number(cuentaSeleccionada.saldo_actual ?? cuentaSeleccionada.saldo_inicial ?? 0)
      : null
  const saldoInsuficiente = saldoCuenta !== null && monto > saldoCuenta

  const delta = monto > 0 ? nuevoPct - pct : 0

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (monto <= 0) return
    await onSubmit({
      montoAporte: monto,
      cuentaId: cuentaId === '' ? undefined : Number(cuentaId),
      notas: notas.trim() || undefined,
    })
  }

  return (
    <>
      <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-800/50">
        <div className="flex items-center gap-3 sm:gap-4">
          <ProgressRing
            pct={monto > 0 ? nuevoPct : pct}
            color={color}
            size={48}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-50">
              {formatCurrency(monto > 0 ? nuevoTotal : actual, moneda)}
              <span className="ml-1.5 text-xs font-normal text-slate-400 dark:text-slate-500">
                de {formatCurrency(objetivo, moneda)}
              </span>
            </p>
            <p className="mt-0.5 text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {monto > 0 ? (
                completaMeta ? (
                  <span className="font-medium text-brand-600 dark:text-brand-400">
                    Con este aporte completas la meta
                  </span>
                ) : (
                  <>
                    Pasas de {pct}% a{' '}
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {nuevoPct}%
                    </span>
                    {delta > 0 && (
                      <span className="ml-1 text-brand-500">(+{delta}%)</span>
                    )}
                  </>
                )
              ) : (
                `Faltan ${formatCurrency(restante, moneda)}`
              )}
            </p>
          </div>
        </div>

        {monto > 0 && !completaMeta && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${nuevoPct}%`,
                backgroundColor: color,
              }}
            />
          </div>
        )}

        {completaMeta && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
            >
              <circle cx="12" cy="12" r="8.5" />
              <path d="m8.5 12 2.5 2.5 4.5-5" />
            </svg>
            Meta completada al agregar este aporte
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <label htmlFor="aporte-monto" className={labelClass}>
            Monto del aporte <span className="text-rose-500">*</span>
          </label>
          <input
            id="aporte-monto"
            type="number"
            required
            min="1"
            step="0.01"
            autoFocus
            value={montoAporte}
            onChange={(e) => setMontoAporte(e.target.value)}
            className={`${inputClass} tabular-nums`}
            placeholder="0"
          />

          {atajos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
              {atajos.map((atajo) => {
                const activo = atajoSeleccionado === atajo.label
                return (
                  <button
                    key={atajo.label}
                    type="button"
                    onClick={() => setMontoAporte(String(atajo.valor))}
                    className={`truncate rounded-full border px-2.5 py-1.5 text-[0.68rem] tabular-nums transition-all sm:px-3 sm:text-xs ${
                      activo
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    {atajo.label}
                    <span className="ml-1 opacity-60">
                      {formatCurrency(atajo.valor, moneda)}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {excede && !completaMeta && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h0" />
              </svg>
              El aporte supera lo que falta ({formatCurrency(restante, moneda)}).
            </p>
          )}
        </div>

        {accounts.length > 0 && (
          <div>
            <label htmlFor="aporte-cuenta" className={labelClass}>
              Sale de la cuenta
            </label>
            <select
              id="aporte-cuenta"
              value={cuentaId === '' ? '' : cuentaId}
              onChange={(e) => setCuentaId(e.target.value === '' ? '' : Number(e.target.value))}
              className={inputClass}
            >
              <option value="">Sin cuenta (solo marcar progreso)</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.nombre} ({formatCurrency(acc.saldo_actual ?? acc.saldo_inicial ?? 0, acc.moneda)})
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              {cuentaId === ''
                ? 'Sin cuenta el aporte solo suma al progreso: ningún saldo cambia.'
                : 'El monto se descontará de esa cuenta y quedará registrado como movimiento.'}
            </p>
            {saldoInsuficiente && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h0" />
                </svg>
                El saldo de esa cuenta ({formatCurrency(saldoCuenta ?? 0, moneda)}) es menor al
                aporte.
              </p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="aporte-notas" className={labelClass}>
            Notas (opcional)
          </label>
          <textarea
            id="aporte-notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className={`${inputClass} min-h-[80px] resize-none`}
            placeholder="Ej: Aporte mensual de enero"
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="order-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 sm:order-1 sm:flex-1 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || monto <= 0}
            className="order-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:order-2 sm:flex-1"
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
            {loading
              ? 'Guardando…'
              : monto > 0
                ? `Aportar ${formatCurrency(monto, moneda)}`
                : 'Agregar aporte'}
          </button>
        </div>
      </form>
    </>
  )
}
