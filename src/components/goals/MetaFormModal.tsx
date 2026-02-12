import { useState, useEffect, type FormEvent } from 'react'
import type { Meta, CreateMetaDto, UpdateMetaDto } from '../../services/api'

const COLORS = [
  { value: '#10B981', label: 'Verde' },
  { value: '#3B82F6', label: 'Azul' },
  { value: '#8B5CF6', label: 'Violeta' },
  { value: '#F59E0B', label: 'Ámbar' },
  { value: '#EF4444', label: 'Rojo' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#6366F1', label: 'Índigo' },
]

type MetaFormModalProps = {
  open: boolean
  meta?: Meta | null
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreateMetaDto | UpdateMetaDto) => Promise<void> | void
}

function MetaFormModal({ open, meta, loading, onClose, onSubmit }: MetaFormModalProps) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [montoObjetivo, setMontoObjetivo] = useState('')
  const [fechaObjetivo, setFechaObjetivo] = useState('')
  const [color, setColor] = useState('#10B981')
  const [icono, setIcono] = useState('')
  const [activa, setActiva] = useState(true)

  const isEdit = !!meta

  useEffect(() => {
    if (meta) {
      setNombre(meta.nombre)
      setDescripcion(meta.descripcion || '')
      setMontoObjetivo(String(meta.monto_objetivo || 0))
      setFechaObjetivo(meta.fecha_objetivo ? meta.fecha_objetivo.slice(0, 10) : '')
      setColor(meta.color || '#10B981')
      setIcono(meta.icono || '')
      setActiva(meta.activa)
    } else {
      setNombre('')
      setDescripcion('')
      setMontoObjetivo('')
      const nextYear = new Date()
      nextYear.setFullYear(nextYear.getFullYear() + 1)
      setFechaObjetivo(nextYear.toISOString().slice(0, 10))
      setColor('#10B981')
      setIcono('')
      setActiva(true)
    }
  }, [meta, open])

  if (!open) return null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const monto = montoObjetivo ? Number(montoObjetivo.replace(/\D/g, '')) || 0 : 0
    if (monto <= 0) return
    const data: CreateMetaDto | UpdateMetaDto = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      montoObjetivo: monto,
      fechaObjetivo: fechaObjetivo,
      color: color.trim() || undefined,
      icono: icono.trim() || undefined,
    }
    if (isEdit) {
      ;(data as UpdateMetaDto).activa = activa
    }
    await onSubmit(data)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {isEdit ? 'Editar meta' : 'Nueva meta'}
          </h2>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-100"
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Nombre de la meta <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Ej: Viaje a Europa"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Descripción (opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Describe tu meta..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Monto objetivo <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={montoObjetivo}
                onChange={(e) => setMontoObjetivo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Fecha objetivo <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={fechaObjetivo}
                onChange={(e) => setFechaObjetivo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`h-8 w-8 rounded-lg border-2 transition-all ${
                    color === c.value ? 'border-slate-900 scale-110 dark:border-slate-50' : 'border-slate-200 dark:border-slate-600'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {isEdit && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="meta-activa"
                checked={activa}
                onChange={(e) => setActiva(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
              />
              <label htmlFor="meta-activa" className="text-sm text-slate-700 dark:text-slate-300">
                Meta activa
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-emerald-400/90 disabled:opacity-60"
            >
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MetaFormModal
