import { useState, type FormEvent } from 'react'
import type { Meta, CreateAporteDto } from '../../services/api'
import type { Account } from '../../services/api'
import { formatCurrency } from '../../utils/format'

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
  const [montoAporte, setMontoAporte] = useState('')
  const [cuentaId, setCuentaId] = useState<number | ''>('')
  const [notas, setNotas] = useState('')

  if (!open || !meta) return null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const monto = Number(montoAporte) || 0
    if (monto <= 0) return
    await onSubmit({
      montoAporte: monto,
      cuentaId: cuentaId === '' ? undefined : Number(cuentaId),
      notas: notas.trim() || undefined,
    })
    setMontoAporte('')
    setCuentaId('')
    setNotas('')
  }

  const handleClose = () => {
    setMontoAporte('')
    setCuentaId('')
    setNotas('')
    onClose()
  }

  const restante = Math.max(0, meta.monto_objetivo - meta.monto_actual)
  const progress = meta.monto_objetivo > 0
    ? Math.min(100, Math.round((meta.monto_actual / meta.monto_objetivo) * 100))
    : 0

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Agregar aporte</h2>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-100"
            onClick={handleClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{meta.nombre}</p>
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Progreso</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-300">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Faltan {formatCurrency(restante, moneda)} para tu meta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Monto del aporte *</label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={montoAporte}
              onChange={(e) => setMontoAporte(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="0"
            />
          </div>
          {accounts.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Cuenta (opcional)</label>
              <select
                value={cuentaId === '' ? '' : cuentaId}
                onChange={(e) => setCuentaId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Notas (opcional)</label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Ej: Aporte mensual"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !montoAporte || Number(montoAporte) <= 0}
              className="flex-1 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-600 disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Agregar aporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
