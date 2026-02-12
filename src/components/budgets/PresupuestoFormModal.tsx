import { useState, useEffect, useMemo, type FormEvent } from 'react'
import type { Presupuesto, CreatePresupuestoDto, UpdatePresupuestoDto } from '../../services/api'
import type { Account } from '../../services/api'
import type { Categoria } from '../../services/api'

const PERIODOS: { value: 'SEMANAL' | 'MENSUAL' | 'ANUAL' | 'PERSONALIZADO'; label: string }[] = [
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'MENSUAL', label: 'Mensual' },
  { value: 'ANUAL', label: 'Anual' },
  { value: 'PERSONALIZADO', label: 'Personalizado' },
]

function getEndDateFromStart(periodo: string, startStr: string): string {
  if (!startStr) return ''
  const start = new Date(startStr)
  if (periodo === 'SEMANAL') {
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return end.toISOString().slice(0, 10)
  }
  if (periodo === 'MENSUAL') {
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
    return end.toISOString().slice(0, 10)
  }
  if (periodo === 'ANUAL') {
    return `${start.getFullYear()}-12-31`
  }
  return startStr
}

type PresupuestoFormModalProps = {
  open: boolean
  presupuesto?: Presupuesto | null
  accounts: Account[]
  categories: Categoria[]
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreatePresupuestoDto | UpdatePresupuestoDto) => Promise<void> | void
}

export default function PresupuestoFormModal({
  open,
  presupuesto,
  accounts,
  categories,
  loading,
  onClose,
  onSubmit,
}: PresupuestoFormModalProps) {
  const [nombre, setNombre] = useState('')
  const [periodo, setPeriodo] = useState<'SEMANAL' | 'MENSUAL' | 'ANUAL' | 'PERSONALIZADO'>('MENSUAL')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [montoLimite, setMontoLimite] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | ''>('')
  const [cuentaId, setCuentaId] = useState<number | ''>('')
  const [notas, setNotas] = useState('')
  const [activa, setActiva] = useState(true)

  const isEdit = !!presupuesto
  const isPersonalizado = periodo === 'PERSONALIZADO'

  const gastoCategorias = useMemo(() => categories.filter((c) => c.tipo === 'GASTO' || c.tipo === 'AMBOS'), [categories])

  useEffect(() => {
    if (presupuesto) {
      setNombre(presupuesto.nombre)
      setPeriodo(presupuesto.periodo)
      setFechaInicio(presupuesto.fecha_inicio ? presupuesto.fecha_inicio.slice(0, 10) : '')
      setFechaFin(presupuesto.fecha_fin ? presupuesto.fecha_fin.slice(0, 10) : '')
      setMontoLimite(String(presupuesto.monto_limite || 0))
      setCategoriaId(presupuesto.categoria_id ?? '')
      setCuentaId(presupuesto.cuenta_id ?? '')
      setNotas(presupuesto.notas || '')
      setActiva(presupuesto.activo)
    } else {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      setNombre('')
      setPeriodo('MENSUAL')
      setFechaInicio(start.toISOString().slice(0, 10))
      setFechaFin(getEndDateFromStart('MENSUAL', start.toISOString().slice(0, 10)))
      setMontoLimite('')
      setCategoriaId('')
      setCuentaId('')
      setNotas('')
      setActiva(true)
    }
  }, [presupuesto, open])

  useEffect(() => {
    if (!open || isEdit) return
    if (periodo !== 'PERSONALIZADO' && fechaInicio) {
      setFechaFin(getEndDateFromStart(periodo, fechaInicio))
    }
  }, [periodo, fechaInicio, open, isEdit])

  if (!open) return null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const monto = Number(montoLimite) || 0
    if (monto <= 0) return
    const data: CreatePresupuestoDto | UpdatePresupuestoDto = {
      nombre: nombre.trim(),
      periodo,
      montoLimite: monto,
      fechaInicio: fechaInicio ? `${fechaInicio}T00:00:00` : undefined,
      fechaFin: isPersonalizado && fechaFin ? `${fechaFin}T23:59:59` : periodo !== 'PERSONALIZADO' && fechaFin ? `${fechaFin}T23:59:59` : undefined,
      categoriaId: categoriaId === '' ? undefined : Number(categoriaId),
      cuentaId: cuentaId === '' ? undefined : Number(cuentaId),
      notas: notas.trim() || undefined,
    }
    if (isEdit) {
      ;(data as UpdatePresupuestoDto).activo = activa
    }
    await onSubmit(data)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4">
      <div className="flex w-full max-w-lg max-h-[90vh] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {isEdit ? 'Editar presupuesto' : 'Nuevo presupuesto'}
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
              placeholder="Ej: Gastos de comida"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Período *</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as typeof periodo)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {PERIODOS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
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
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Fecha fin {isPersonalizado ? '' : '(calculada)'}
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                disabled={!isPersonalizado}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Monto límite *</label>
            <input
              type="number"
              required
              min="1"
              value={montoLimite}
              onChange={(e) => setMontoLimite(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="0"
            />
          </div>

          {gastoCategorias.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Categoría (opcional)</label>
              <select
                value={categoriaId === '' ? '' : categoriaId}
                onChange={(e) => setCategoriaId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Todas las categorías</option>
                {gastoCategorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {accounts.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Cuenta (opcional)</label>
              <select
                value={cuentaId === '' ? '' : cuentaId}
                onChange={(e) => setCuentaId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Todas las cuentas</option>
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
              placeholder="Ej: Solo restaurantes"
            />
          </div>

          {isEdit && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="presupuesto-activo"
                checked={activa}
                onChange={(e) => setActiva(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
              />
              <label htmlFor="presupuesto-activo" className="text-sm text-slate-700 dark:text-slate-300">Presupuesto activo</label>
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
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear presupuesto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
