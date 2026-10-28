import { useState, type FormEvent } from 'react'
import type { Meta, CreateMetaDto, UpdateMetaDto } from '../../services/api'
import { formatCurrency } from '../../utils/format'
import { aporteMensualSugerido, metaProgreso } from '../../utils/metas'
import Modal from '../ui/Modal'
import { ProgressRing } from './GoalCard'

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

const PLAZOS = [
  { meses: 3, label: '3 meses' },
  { meses: 6, label: '6 meses' },
  { meses: 12, label: '1 año' },
  { meses: 24, label: '2 años' },
]

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'

const labelClass =
  'mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400'

function fechaEnMeses(meses: number) {
  const d = new Date()
  d.setMonth(d.getMonth() + meses)
  return d.toISOString().slice(0, 10)
}

type MetaFormModalProps = {
  open: boolean
  meta?: Meta | null
  moneda?: string
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreateMetaDto | UpdateMetaDto) => Promise<void> | void
}

function MetaFormModal({ open, meta, moneda = 'COP', loading, onClose, onSubmit }: MetaFormModalProps) {
  return (
    <Modal
      open={open}
      title={meta ? 'Editar meta' : 'Nueva meta'}
      subtitle={
        meta
          ? 'Ajusta el objetivo, el plazo o el color'
          : 'Define cuánto quieres ahorrar y para cuándo'
      }
      accentColor={meta?.color || '#10B981'}
      locked={loading}
      onClose={onClose}
    >
      <MetaForm
        key={meta?.id ?? 'nueva'}
        meta={meta}
        moneda={moneda}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}

type MetaFormProps = {
  meta?: Meta | null
  moneda: string
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreateMetaDto | UpdateMetaDto) => Promise<void> | void
}

function MetaForm({ meta, moneda, loading, onClose, onSubmit }: MetaFormProps) {
  const [nombre, setNombre] = useState(meta?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(meta?.descripcion ?? '')
  const [montoObjetivo, setMontoObjetivo] = useState(
    meta ? String(meta.monto_objetivo || 0) : '',
  )
  const [fechaObjetivo, setFechaObjetivo] = useState(
    meta?.fecha_objetivo ? meta.fecha_objetivo.slice(0, 10) : fechaEnMeses(12),
  )
  const [color, setColor] = useState(meta?.color || '#10B981')
  const [icono] = useState(meta?.icono || '')
  const [activa, setActiva] = useState(meta?.activa ?? true)

  const isEdit = !!meta

  const monto = Number(montoObjetivo.replace(/\D/g, '')) || 0
  const progresoActual = meta ? metaProgreso(meta).pct : 0

  const diasHastaObjetivo = (() => {
    if (!fechaObjetivo) return null
    const objetivo = new Date(`${fechaObjetivo}T00:00:00`)
    if (Number.isNaN(objetivo.getTime())) return null
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return Math.round((objetivo.getTime() - hoy.getTime()) / 86_400_000)
  })()

  const restante = meta ? Math.max(0, monto - Number(meta.monto_actual || 0)) : monto
  const aporteMensual = aporteMensualSugerido(restante, diasHastaObjetivo)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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
    <>
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
        <ProgressRing pct={progresoActual} color={color} size={52} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
            {nombre.trim() || 'Tu nueva meta'}
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {monto > 0 ? formatCurrency(monto, moneda) : 'Sin monto objetivo'}
            {aporteMensual !== null && monto > 0 && ` · ≈ ${formatCurrency(aporteMensual, moneda)}/mes`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="meta-nombre" className={labelClass}>
            Nombre de la meta <span className="text-rose-500">*</span>
          </label>
          <input
            id="meta-nombre"
            type="text"
            required
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={inputClass}
            placeholder="Ej: Viaje a Europa"
          />
        </div>

        <div>
          <label htmlFor="meta-descripcion" className={labelClass}>
            Descripción (opcional)
          </label>
          <textarea
            id="meta-descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            className={`${inputClass} resize-none`}
            placeholder="Describe tu meta..."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="meta-monto" className={labelClass}>
              Monto objetivo <span className="text-rose-500">*</span>
            </label>
            <input
              id="meta-monto"
              type="number"
              required
              min="1"
              value={montoObjetivo}
              onChange={(e) => setMontoObjetivo(e.target.value)}
              className={`${inputClass} tabular-nums`}
              placeholder="0"
            />
            {monto > 0 && (
              <p className="mt-1.5 text-xs tabular-nums text-slate-400 dark:text-slate-500">
                {formatCurrency(monto, moneda)}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="meta-fecha" className={labelClass}>
              Fecha objetivo <span className="text-rose-500">*</span>
            </label>
            <input
              id="meta-fecha"
              type="date"
              required
              value={fechaObjetivo}
              onChange={(e) => setFechaObjetivo(e.target.value)}
              className={inputClass}
            />
            {diasHastaObjetivo !== null && (
              <p
                className={`mt-1.5 text-xs ${
                  diasHastaObjetivo < 0
                    ? 'text-rose-500'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {diasHastaObjetivo < 0
                  ? 'La fecha ya pasó'
                  : diasHastaObjetivo === 0
                    ? 'Vence hoy'
                    : `En ${diasHastaObjetivo} ${diasHastaObjetivo === 1 ? 'día' : 'días'}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PLAZOS.map((plazo) => (
            <button
              key={plazo.meses}
              type="button"
              onClick={() => setFechaObjetivo(fechaEnMeses(plazo.meses))}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {plazo.label}
            </button>
          ))}
        </div>

        <div>
          <span className={labelClass}>Color</span>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                aria-label={c.label}
                aria-pressed={color === c.value}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform ${
                  color === c.value ? 'scale-110' : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: c.value,
                  boxShadow:
                    color === c.value ? `0 0 0 2px #fff, 0 0 0 4px ${c.value}` : undefined,
                }}
              >
                {color === c.value && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-4 w-4"
                  >
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {isEdit && (
          <label
            htmlFor="meta-activa"
            className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700"
          >
            <span>
              <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                Meta activa
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                Las metas pausadas no admiten aportes
              </span>
            </span>
            <input
              type="checkbox"
              id="meta-activa"
              checked={activa}
              onChange={(e) => setActiva(e.target.checked)}
              className="h-5 w-5 rounded-md border-slate-300 text-brand-500 focus:ring-brand-400"
            />
          </label>
        )}

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
            disabled={loading || monto <= 0 || !nombre.trim()}
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
            {loading ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear meta'}
          </button>
        </div>
      </form>
    </>
  )
}

export default MetaFormModal
