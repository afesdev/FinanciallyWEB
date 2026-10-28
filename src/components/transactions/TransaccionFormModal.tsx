import { useState, useEffect, useMemo, type FormEvent } from 'react'
import type { CreateTransaccionDto } from '../../services/api'
import type { Account } from '../../services/api'
import type { Categoria } from '../../services/api'
import { TIPO_TRANSACCION } from '../../services/api'

// Fecha de hoy en zona local, no en UTC. Con .toISOString() la tarde en
// Colombia (UTC-5) ya cae en el día siguiente y la transacción se fechaba mal.
function hoyLocal(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

type Frecuencia = 'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'BIMESTRAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL'

const FRECUENCIAS: { key: Frecuencia; label: string }[] = [
  { key: 'DIARIO', label: 'Diario' },
  { key: 'SEMANAL', label: 'Semanal' },
  { key: 'MENSUAL', label: 'Mensual' },
  { key: 'BIMESTRAL', label: 'Bimestral' },
  { key: 'TRIMESTRAL', label: 'Trimestral' },
  { key: 'SEMESTRAL', label: 'Semestral' },
  { key: 'ANUAL', label: 'Anual' },
]

type TransaccionFormModalProps = {
  open: boolean
  accounts: Account[]
  categories: Categoria[]
  moneda?: string
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreateTransaccionDto) => Promise<void> | void
}

export default function TransaccionFormModal({
  open,
  accounts,
  categories,
  moneda = 'COP',
  loading,
  onClose,
  onSubmit,
}: TransaccionFormModalProps) {
  const [tipoId, setTipoId] = useState<number>(TIPO_TRANSACCION.GASTO)
  const [cuentaId, setCuentaId] = useState<number | ''>('')
  const [categoriaId, setCategoriaId] = useState<number | ''>('')
  const [monto, setMonto] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaTransaccion, setFechaTransaccion] = useState(hoyLocal())
  const [notas, setNotas] = useState('')
  const [repetir, setRepetir] = useState(false)
  const [frecuencia, setFrecuencia] = useState<Frecuencia>('MENSUAL')

  const isIngreso = tipoId === TIPO_TRANSACCION.INGRESO

  const categoriasFiltradas = useMemo(() => {
    return categories.filter((c) =>
      isIngreso ? (c.tipo === 'INGRESO' || c.tipo === 'AMBOS') : (c.tipo === 'GASTO' || c.tipo === 'AMBOS')
    )
  }, [categories, isIngreso])

  useEffect(() => {
    if (open) {
      setTipoId(TIPO_TRANSACCION.GASTO)
      setCuentaId('')
      setCategoriaId('')
      setMonto('')
      setTitulo('')
      setDescripcion('')
      setFechaTransaccion(hoyLocal())
      setNotas('')
      setRepetir(false)
      setFrecuencia('MENSUAL')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = Number(monto) || 0
    if (value <= 0) return
    const data: CreateTransaccionDto = {
      tipoTransaccionId: tipoId,
      monto: value,
      moneda,
      titulo: titulo.trim() || undefined,
      descripcion: descripcion.trim() || undefined,
      fechaTransaccion: fechaTransaccion ? `${fechaTransaccion}T12:00:00` : undefined,
      notas: repetir
        ? [notas.trim(), `[frecuencia:${frecuencia}]`].filter(Boolean).join(' ')
        : notas.trim() || undefined,
      repetir,
    }
    if (cuentaId !== '') data.cuentaId = Number(cuentaId)
    if (categoriaId !== '') data.categoriaId = Number(categoriaId)
    await onSubmit(data)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Nueva transacción</h2>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            onClick={onClose}
            disabled={!!loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto px-6 py-5">
          {/* Tipo */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Tipo *</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipoId(TIPO_TRANSACCION.INGRESO)}
                className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-medium transition-all ${
                  tipoId === TIPO_TRANSACCION.INGRESO
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500'
                }`}
              >
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => setTipoId(TIPO_TRANSACCION.GASTO)}
                className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-medium transition-all ${
                  tipoId === TIPO_TRANSACCION.GASTO
                    ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500'
                }`}
              >
                Gasto
              </button>
            </div>
          </div>

          {/* Two-column grid for cuenta + categoría */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            {accounts.length > 0 && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Cuenta</label>
                <select
                  value={cuentaId === '' ? '' : cuentaId}
                  onChange={(e) => setCuentaId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">Sin cuenta</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {categoriasFiltradas.length > 0 && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Categoría</label>
                <select
                  value={categoriaId === '' ? '' : categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">Sin categoría</option>
                  {categoriasFiltradas.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Two-column: monto + fecha */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Monto *</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Fecha</label>
              <input
                type="date"
                value={fechaTransaccion}
                onChange={(e) => setFechaTransaccion(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Título */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Título / concepto</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Ej: Supermercado, Salario"
            />
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Opcional"
            />
          </div>

          {/* Notas */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Notas</label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Opcional"
            />
          </div>

          {/* Pago recurrente toggle */}
          <div
            className={`mb-4 rounded-xl border transition-all ${
              repetir
                ? 'border-violet-200 bg-violet-50/50 dark:border-violet-500/60 dark:bg-violet-950/40'
                : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={repetir ? 'text-violet-600' : 'text-slate-400'}>
                  <path d="M17 2l4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-100">Pago recurrente</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Se repite automáticamente</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={repetir}
                onClick={() => setRepetir(!repetir)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  repetir ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    repetir ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Frecuencia selector */}
            {repetir && (
              <div className="border-t border-violet-200 px-4 py-3 dark:border-violet-500/40">
                <label className="mb-2 block text-xs font-medium text-violet-700 dark:text-violet-200">Frecuencia</label>
                <div className="flex flex-wrap gap-2">
                  {FRECUENCIAS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFrecuencia(f.key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                        frecuencia === f.key
                          ? 'bg-violet-500 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-700 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:border-violet-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
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
              disabled={!!loading || !monto || Number(monto) <= 0}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-60 ${
                isIngreso ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
              }`}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
