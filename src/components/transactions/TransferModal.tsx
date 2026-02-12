import { useState, type FormEvent } from 'react'
import type { Account } from '../../services/api'
import type { CreateTransferDto } from '../../services/api'

type TransferModalProps = {
  open: boolean
  accounts: Account[]
  moneda?: string
  loading?: boolean
  onClose: () => void
  onSubmit: (payload: CreateTransferDto) => Promise<void> | void
}

export default function TransferModal({
  open,
  accounts,
  moneda = 'COP',
  loading,
  onClose,
  onSubmit,
}: TransferModalProps) {
  const [cuentaOrigenId, setCuentaOrigenId] = useState<number | ''>('')
  const [cuentaDestinoId, setCuentaDestinoId] = useState<number | ''>('')
  const [monto, setMonto] = useState('')
  const [titulo, setTitulo] = useState('')
  const [fechaTransaccion, setFechaTransaccion] = useState(new Date().toISOString().slice(0, 10))
  const [notas, setNotas] = useState('')

  if (!open) return null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = Number(monto) || 0
    if (value <= 0) return
    const origin = Number(cuentaOrigenId)
    const dest = Number(cuentaDestinoId)
    if (origin === dest) return
    await onSubmit({
      cuentaOrigenId: origin,
      cuentaDestinoId: dest,
      monto: value,
      moneda,
      titulo: titulo.trim() || undefined,
      fechaTransaccion: fechaTransaccion ? `${fechaTransaccion}T12:00:00` : undefined,
      notas: notas.trim() || undefined,
    })
    setMonto('')
    setTitulo('')
    setNotas('')
  }

  const restAccounts = accounts.filter((a) => Number(a.id) !== Number(cuentaDestinoId))
  const destAccounts = accounts.filter((a) => Number(a.id) !== Number(cuentaOrigenId))

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Transferencia entre cuentas</h2>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-100"
            onClick={onClose}
            disabled={!!loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cuentas origen/destino en dos columnas */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Desde (origen) *</label>
              <select
                required
                value={cuentaOrigenId === '' ? '' : cuentaOrigenId}
                onChange={(e) => setCuentaOrigenId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Seleccionar cuenta</option>
                {restAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Hacia (destino) *</label>
              <select
                required
                value={cuentaDestinoId === '' ? '' : cuentaDestinoId}
                onChange={(e) => setCuentaDestinoId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Seleccionar cuenta</option>
                {destAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Separador visual */}
          <div className="flex justify-center">
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200">
              ↓
            </span>
          </div>

          {/* Monto y fecha en dos columnas */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Monto *</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Fecha</label>
              <input
                type="date"
                value={fechaTransaccion}
                onChange={(e) => setFechaTransaccion(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Concepto */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Concepto</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Ej: Traslado a ahorros"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Notas</label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Opcional"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={!!loading}
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!!loading || !monto || Number(monto) <= 0 || cuentaOrigenId === cuentaDestinoId}
              className="flex-1 rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cyan-600 disabled:opacity-60"
            >
              {loading ? 'Enviando...' : 'Transferir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
