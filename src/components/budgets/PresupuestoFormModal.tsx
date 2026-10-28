import { useMemo, useState, type FormEvent } from 'react'
import type {
  Presupuesto,
  CreatePresupuestoDto,
  UpdatePresupuestoDto,
  Account,
  Categoria,
} from '../../services/api'
import { formatCurrency } from '../../utils/format'
import Modal from '../ui/Modal'

type Periodo = 'SEMANAL' | 'MENSUAL' | 'ANUAL' | 'PERSONALIZADO'

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'MENSUAL', label: 'Mensual' },
  { value: 'ANUAL', label: 'Anual' },
  { value: 'PERSONALIZADO', label: 'A medida' },
]

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'

const labelClass =
  'mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400'

function getEndDateFromStart(periodo: string, startStr: string): string {
  if (!startStr) return ''
  const start = new Date(`${startStr}T00:00:00`)
  if (Number.isNaN(start.getTime())) return ''
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
  moneda?: string
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreatePresupuestoDto | UpdatePresupuestoDto) => Promise<void> | void
}

export default function PresupuestoFormModal({
  open,
  presupuesto,
  accounts,
  categories,
  moneda = 'COP',
  loading,
  onClose,
  onSubmit,
}: PresupuestoFormModalProps) {
  return (
    <Modal
      open={open}
      title={presupuesto ? 'Editar presupuesto' : 'Nuevo presupuesto'}
      subtitle={
        presupuesto
          ? 'Ajusta el límite, el periodo o su alcance'
          : 'Define cuánto puedes gastar y en qué'
      }
      locked={loading}
      onClose={onClose}
    >
      <PresupuestoForm
        key={presupuesto?.id ?? 'nuevo'}
        presupuesto={presupuesto}
        accounts={accounts}
        categories={categories}
        moneda={moneda}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}

type PresupuestoFormProps = {
  presupuesto?: Presupuesto | null
  accounts: Account[]
  categories: Categoria[]
  moneda: string
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreatePresupuestoDto | UpdatePresupuestoDto) => Promise<void> | void
}

function PresupuestoForm({
  presupuesto,
  accounts,
  categories,
  moneda,
  loading,
  onClose,
  onSubmit,
}: PresupuestoFormProps) {
  const inicioPorDefecto = (() => {
    const hoy = new Date()
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10)
  })()

  const [nombre, setNombre] = useState(presupuesto?.nombre ?? '')
  const [periodo, setPeriodo] = useState<Periodo>(presupuesto?.periodo ?? 'MENSUAL')
  const [fechaInicio, setFechaInicio] = useState(
    presupuesto?.fecha_inicio ? presupuesto.fecha_inicio.slice(0, 10) : inicioPorDefecto,
  )
  const [fechaFin, setFechaFin] = useState(
    presupuesto?.fecha_fin
      ? presupuesto.fecha_fin.slice(0, 10)
      : getEndDateFromStart('MENSUAL', inicioPorDefecto),
  )
  const [montoLimite, setMontoLimite] = useState(
    presupuesto ? String(presupuesto.monto_limite || 0) : '',
  )
  const [categoriaId, setCategoriaId] = useState<number | ''>(presupuesto?.categoria_id ?? '')
  const [cuentaId, setCuentaId] = useState<number | ''>(presupuesto?.cuenta_id ?? '')
  const [notas, setNotas] = useState(presupuesto?.notas ?? '')
  const [activa, setActiva] = useState(presupuesto?.activo ?? true)

  const isEdit = !!presupuesto
  const isPersonalizado = periodo === 'PERSONALIZADO'

  const gastoCategorias = useMemo(
    () => categories.filter((c) => c.tipo === 'GASTO' || c.tipo === 'AMBOS'),
    [categories],
  )

  const autoFechaFin = !isEdit

  const cambiarPeriodo = (nuevo: Periodo) => {
    setPeriodo(nuevo)
    if (autoFechaFin && nuevo !== 'PERSONALIZADO' && fechaInicio) {
      setFechaFin(getEndDateFromStart(nuevo, fechaInicio))
    }
  }

  const cambiarFechaInicio = (nueva: string) => {
    setFechaInicio(nueva)
    if (autoFechaFin && periodo !== 'PERSONALIZADO' && nueva) {
      setFechaFin(getEndDateFromStart(periodo, nueva))
    }
  }

  const monto = Number(montoLimite) || 0
  const fechaInvalida = Boolean(fechaFin && fechaInicio && fechaFin < fechaInicio)

  const diasPeriodo = (() => {
    if (!fechaInicio || !fechaFin || fechaInvalida) return null
    const inicio = new Date(`${fechaInicio}T00:00:00`)
    const fin = new Date(`${fechaFin}T00:00:00`)
    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return null
    return Math.max(1, Math.round((fin.getTime() - inicio.getTime()) / 86_400_000) + 1)
  })()

  const porDia = diasPeriodo && monto > 0 ? Math.floor(monto / diasPeriodo) : null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (monto <= 0 || fechaInvalida) return
    const data: CreatePresupuestoDto | UpdatePresupuestoDto = {
      nombre: nombre.trim(),
      periodo,
      montoLimite: monto,
      fechaInicio: fechaInicio ? `${fechaInicio}T00:00:00` : undefined,
      fechaFin: fechaFin ? `${fechaFin}T23:59:59` : undefined,
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="presupuesto-nombre" className={labelClass}>
          Nombre <span className="text-rose-500">*</span>
        </label>
        <input
          id="presupuesto-nombre"
          type="text"
          required
          autoFocus
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={inputClass}
          placeholder="Ej: Mercado del mes"
        />
      </div>

      <div>
        <span className={labelClass}>Periodo</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PERIODOS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => cambiarPeriodo(p.value)}
              aria-pressed={periodo === p.value}
              className={`rounded-2xl border px-3 py-2.5 text-xs font-medium transition-colors ${
                periodo === p.value
                  ? 'border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="presupuesto-monto" className={labelClass}>
          Límite de gasto <span className="text-rose-500">*</span>
        </label>
        <input
          id="presupuesto-monto"
          type="number"
          required
          min="1"
          value={montoLimite}
          onChange={(e) => setMontoLimite(e.target.value)}
          className={`${inputClass} tabular-nums`}
          placeholder="0"
        />
        {monto > 0 && (
          <p className="mt-1.5 text-xs tabular-nums text-slate-400 dark:text-slate-500">
            {formatCurrency(monto, moneda)}
            {porDia !== null && ` · ${formatCurrency(porDia, moneda)} por día`}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="presupuesto-inicio" className={labelClass}>
            Desde
          </label>
          <input
            id="presupuesto-inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => cambiarFechaInicio(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="presupuesto-fin" className={labelClass}>
            Hasta
          </label>
          <input
            id="presupuesto-fin"
            type="date"
            value={fechaFin}
            min={fechaInicio || undefined}
            disabled={!isPersonalizado && !isEdit}
            onChange={(e) => setFechaFin(e.target.value)}
            className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
          />
          {!isPersonalizado && !isEdit && (
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
              Se calcula según el periodo.
            </p>
          )}
          {fechaInvalida && (
            <p className="mt-1.5 text-xs text-rose-500">La fecha final es anterior al inicio.</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="presupuesto-categoria" className={labelClass}>
            Categoría
          </label>
          <select
            id="presupuesto-categoria"
            value={categoriaId === '' ? '' : categoriaId}
            onChange={(e) => setCategoriaId(e.target.value === '' ? '' : Number(e.target.value))}
            className={inputClass}
          >
            <option value="">Todas las categorías</option>
            {gastoCategorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="presupuesto-cuenta" className={labelClass}>
            Cuenta
          </label>
          <select
            id="presupuesto-cuenta"
            value={cuentaId === '' ? '' : cuentaId}
            onChange={(e) => setCuentaId(e.target.value === '' ? '' : Number(e.target.value))}
            className={inputClass}
          >
            <option value="">Todas las cuentas</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        {categoriaId === '' && cuentaId === ''
          ? 'Sin filtros cuenta todos tus gastos del periodo.'
          : categoriaId !== '' && cuentaId !== ''
            ? 'Solo cuenta los gastos de esa categoría hechos desde esa cuenta.'
            : categoriaId !== ''
              ? 'Solo cuenta los gastos de esa categoría.'
              : 'Solo cuenta los gastos hechos desde esa cuenta.'}
      </p>

      <div>
        <label htmlFor="presupuesto-notas" className={labelClass}>
          Notas
        </label>
        <textarea
          id="presupuesto-notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
          placeholder="Notas..."
        />
      </div>

      {isEdit && (
        <label
          htmlFor="presupuesto-activo"
          className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700"
        >
          <span>
            <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
              Presupuesto activo
            </span>
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              Los inactivos dejan de acumular gasto
            </span>
          </span>
          <input
            type="checkbox"
            id="presupuesto-activo"
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
          disabled={loading || monto <= 0 || !nombre.trim() || fechaInvalida}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
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
          {loading ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear presupuesto'}
        </button>
      </div>
    </form>
  )
}
