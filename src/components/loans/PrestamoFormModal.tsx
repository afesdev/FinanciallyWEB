import { useState, useEffect, type FormEvent } from 'react'
import type { Prestamo, CreatePrestamoDto, UpdatePrestamoDto } from '../../services/api'
import type { Account } from '../../services/api'

type PrestamoFormModalProps = {
  open: boolean
  prestamo?: Prestamo | null
  accounts: Account[]
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreatePrestamoDto | UpdatePrestamoDto) => Promise<void> | void
}

const TIPOS: { value: 'PRESTAMO' | 'DEUDA'; label: string; shortLabel: string; description: string }[] = [
  {
    value: 'PRESTAMO',
    label: 'Yo presté',
    shortLabel: 'Me deben',
    description: 'Alguien me debe dinero (yo le presté)',
  },
  {
    value: 'DEUDA',
    label: 'Yo debo',
    shortLabel: 'Debo',
    description: 'Yo le debo dinero a alguien',
  },
]

function PrestamoFormModal({
  open,
  prestamo,
  accounts,
  loading,
  onClose,
  onSubmit,
}: PrestamoFormModalProps) {
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<'PRESTAMO' | 'DEUDA'>('DEUDA')
  const [montoTotal, setMontoTotal] = useState('')
  const [tasaInteres, setTasaInteres] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [cuentaId, setCuentaId] = useState<number | ''>('')
  const [notas, setNotas] = useState('')
  const [activa, setActiva] = useState(true)

  const isEdit = !!prestamo

  useEffect(() => {
    if (prestamo) {
      setNombre(prestamo.nombre)
      setTipo(prestamo.tipo)
      setMontoTotal(String(prestamo.monto_total || 0))
      setTasaInteres(prestamo.tasa_interes != null ? String(prestamo.tasa_interes) : '')
      setFechaInicio(prestamo.fecha_inicio ? prestamo.fecha_inicio.slice(0, 10) : '')
      setFechaFin(prestamo.fecha_fin ? prestamo.fecha_fin.slice(0, 10) : '')
      setCuentaId(prestamo.cuenta_id ?? '')
      setNotas(prestamo.notas || '')
      setActiva(prestamo.activa)
    } else {
      setNombre('')
      setTipo('DEUDA')
      setMontoTotal('')
      setTasaInteres('')
      const today = new Date().toISOString().slice(0, 10)
      setFechaInicio(today)
      setFechaFin('')
      setCuentaId('')
      setNotas('')
      setActiva(true)
    }
  }, [prestamo, open])

  if (!open) return null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const monto = Number(montoTotal) || 0
    if (monto <= 0) return
    const data: CreatePrestamoDto | UpdatePrestamoDto = {
      nombre: nombre.trim(),
      tipo,
      montoTotal: monto,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      cuentaId: cuentaId === '' ? undefined : Number(cuentaId),
      notas: notas.trim() || undefined,
    }
    if (tasaInteres !== '' && !isNaN(Number(tasaInteres))) {
      data.tasaInteres = Number(tasaInteres)
    }
    if (isEdit) {
      ;(data as UpdatePrestamoDto).activa = activa
    }
    await onSubmit(data)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4">
      <div className="flex w-full max-w-2xl max-h-[90vh] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {isEdit ? 'Editar préstamo' : 'Nuevo préstamo'}
          </h2>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-100"
            onClick={onClose}
            disabled={!!loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto pr-1">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Nombre *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Ej: Préstamo banco / Deuda con Juan"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300">¿Qué tipo es? *</label>
            <div className="grid grid-cols-2 gap-3">
              {TIPOS.map((t) => {
                const isPrestamo = t.value === 'PRESTAMO'
                const selected = tipo === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTipo(t.value)}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      selected
                        ? isPrestamo
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200 dark:bg-emerald-900/40'
                          : 'border-amber-500 bg-amber-50 ring-2 ring-amber-200 dark:bg-amber-900/40'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-500'
                    }`}
                  >
                    <span
                      className={`block text-sm font-semibold ${
                        selected
                          ? isPrestamo
                            ? 'text-emerald-800 dark:text-emerald-200'
                            : 'text-amber-800 dark:text-amber-200'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {t.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{t.description}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Monto total *</label>
              <input
                type="number"
                required
                min="1"
                value={montoTotal}
                onChange={(e) => setMontoTotal(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Tasa interes % (opcional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={tasaInteres}
                onChange={(e) => setTasaInteres(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Fecha fin (opcional)</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {accounts.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Cuenta asociada (opcional)</label>
              <select
                value={cuentaId === '' ? '' : cuentaId}
                onChange={(e) => setCuentaId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Ninguna</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.nombre}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Notas (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Notas..."
            />
          </div>

          {isEdit && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="prestamo-activa"
                checked={activa}
                onChange={(e) => setActiva(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
              />
              <label htmlFor="prestamo-activa" className="text-sm text-slate-700 dark:text-slate-300">Préstamo activo</label>
            </div>
          )}

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
              disabled={!!loading}
              className="flex-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-emerald-400/90 disabled:opacity-60"
            >
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear préstamo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PrestamoFormModal
