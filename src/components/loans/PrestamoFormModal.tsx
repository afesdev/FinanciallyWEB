import { useState, type FormEvent } from 'react'
import type { Prestamo, CreatePrestamoDto, UpdatePrestamoDto, Account } from '../../services/api'
import { formatCurrency } from '../../utils/format'
import { TONO } from '../../utils/prestamos'
import Modal from '../ui/Modal'


const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'

const labelClass =
  'mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400'

const TIPOS: {
  value: 'PRESTAMO' | 'DEUDA'
  label: string
  description: string
}[] = [
  {
    value: 'DEUDA',
    label: 'Yo debo',
    description: 'Le debo dinero a alguien',
  },
  {
    value: 'PRESTAMO',
    label: 'Me deben',
    description: 'Presté dinero y me lo deben',
  },
]

type PrestamoFormModalProps = {
  open: boolean
  prestamo?: Prestamo | null
  accounts: Account[]
  moneda?: string
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreatePrestamoDto | UpdatePrestamoDto) => Promise<void> | void
}

function PrestamoFormModal({
  open,
  prestamo,
  accounts,
  moneda = 'COP',
  loading,
  onClose,
  onSubmit,
}: PrestamoFormModalProps) {
  return (
    <Modal
      open={open}
      title={prestamo ? 'Editar préstamo' : 'Nuevo préstamo'}
      subtitle={
        prestamo ? 'Ajusta el monto, el plazo o las notas' : '¿Debes dinero o te deben a ti?'
      }
      accentColor={prestamo?.tipo === 'PRESTAMO' ? TONO.PRESTAMO : TONO.DEUDA}
      locked={loading}
      onClose={onClose}
    >
      <PrestamoForm
        key={prestamo?.id ?? 'nuevo'}
        prestamo={prestamo}
        accounts={accounts}
        moneda={moneda}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}

type PrestamoFormProps = {
  prestamo?: Prestamo | null
  accounts: Account[]
  moneda: string
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreatePrestamoDto | UpdatePrestamoDto) => Promise<void> | void
}

function PrestamoForm({
  prestamo,
  accounts,
  moneda,
  loading,
  onClose,
  onSubmit,
}: PrestamoFormProps) {
  const [nombre, setNombre] = useState(prestamo?.nombre ?? '')
  const [tipo, setTipo] = useState<'PRESTAMO' | 'DEUDA'>(prestamo?.tipo ?? 'DEUDA')
  const [montoTotal, setMontoTotal] = useState(prestamo ? String(prestamo.monto_total || 0) : '')
  const [tasaInteres, setTasaInteres] = useState(
    prestamo?.tasa_interes != null ? String(prestamo.tasa_interes) : '',
  )
  const [fechaInicio, setFechaInicio] = useState(
    prestamo?.fecha_inicio
      ? prestamo.fecha_inicio.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  )
  const [fechaFin, setFechaFin] = useState(prestamo?.fecha_fin ? prestamo.fecha_fin.slice(0, 10) : '')
  const [cuentaId, setCuentaId] = useState<number | ''>(prestamo?.cuenta_id ?? '')
  const [notas, setNotas] = useState(prestamo?.notas ?? '')
  const [activa, setActiva] = useState(prestamo?.activa ?? true)
  const [registrarMovimiento, setRegistrarMovimiento] = useState(true)

  const isEdit = !!prestamo
  const color = tipo === 'PRESTAMO' ? TONO.PRESTAMO : TONO.DEUDA
  const monto = Number(montoTotal) || 0

  const plazoMeses = (() => {
    if (!fechaFin || !fechaInicio) return null
    const inicio = new Date(`${fechaInicio}T00:00:00`)
    const fin = new Date(`${fechaFin}T00:00:00`)
    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return null
    const dias = Math.round((fin.getTime() - inicio.getTime()) / 86_400_000)
    if (dias <= 0) return null
    return Math.max(1, Math.ceil(dias / 30))
  })()

  const cuotaEstimada = plazoMeses && monto > 0 ? Math.ceil(monto / plazoMeses) : null
  const fechaInvalida = Boolean(fechaFin && fechaInicio && fechaFin < fechaInicio)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (monto <= 0 || fechaInvalida) return
    const data: CreatePrestamoDto | UpdatePrestamoDto = {
      nombre: nombre.trim(),
      tipo,
      montoTotal: monto,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      cuentaId: cuentaId === '' ? undefined : Number(cuentaId),
      notas: notas.trim() || undefined,
    }
    if (tasaInteres !== '' && !Number.isNaN(Number(tasaInteres))) {
      data.tasaInteres = Number(tasaInteres)
    }
    if (isEdit) {
      ;(data as UpdatePrestamoDto).activa = activa
    } else {
      ;(data as CreatePrestamoDto).registrarMovimiento =
        cuentaId !== '' && registrarMovimiento
    }
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <span className={labelClass}>Tipo</span>
        <div className="grid grid-cols-2 gap-3">
          {TIPOS.map((t) => {
            const seleccionado = tipo === t.value
            const tono = t.value === 'PRESTAMO' ? TONO.PRESTAMO : TONO.DEUDA
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTipo(t.value)}
                aria-pressed={seleccionado}
                className="rounded-2xl border p-3.5 text-left transition-colors"
                style={{
                  borderColor: seleccionado ? tono : undefined,
                  backgroundColor: seleccionado
                    ? `color-mix(in oklab, ${tono} 8%, transparent)`
                    : undefined,
                }}
              >
                <span
                  className="flex items-center gap-2 text-sm font-semibold"
                  style={{ color: seleccionado ? tono : undefined }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  >
                    {t.value === 'DEUDA' ? (
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    ) : (
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    )}
                  </svg>
                  {t.label}
                </span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  {t.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label htmlFor="prestamo-nombre" className={labelClass}>
          Nombre <span className="text-rose-500">*</span>
        </label>
        <input
          id="prestamo-nombre"
          type="text"
          required
          autoFocus
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={inputClass}
          placeholder={tipo === 'DEUDA' ? 'Ej: Crédito de vivienda' : 'Ej: Préstamo a Juan'}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="prestamo-monto" className={labelClass}>
            Monto total <span className="text-rose-500">*</span>
          </label>
          <input
            id="prestamo-monto"
            type="number"
            required
            min="1"
            value={montoTotal}
            onChange={(e) => setMontoTotal(e.target.value)}
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
          <label htmlFor="prestamo-tasa" className={labelClass}>
            Tasa de interés anual %
          </label>
          <input
            id="prestamo-tasa"
            type="number"
            min="0"
            step="0.01"
            value={tasaInteres}
            onChange={(e) => setTasaInteres(e.target.value)}
            className={`${inputClass} tabular-nums`}
            placeholder="0"
          />
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            Solo como referencia: no se suma al monto total.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="prestamo-inicio" className={labelClass}>
            Fecha inicio
          </label>
          <input
            id="prestamo-inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="prestamo-fin" className={labelClass}>
            Fecha límite
          </label>
          <input
            id="prestamo-fin"
            type="date"
            value={fechaFin}
            min={fechaInicio || undefined}
            onChange={(e) => setFechaFin(e.target.value)}
            className={inputClass}
          />
          {fechaInvalida && (
            <p className="mt-1.5 text-xs text-rose-500">La fecha límite es anterior al inicio.</p>
          )}
        </div>
      </div>

      {cuotaEstimada !== null && !fechaInvalida && (
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          En {plazoMeses} {plazoMeses === 1 ? 'mes' : 'meses'} son unos{' '}
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {formatCurrency(cuotaEstimada, moneda)}
          </span>{' '}
          al mes, sin contar intereses.
        </p>
      )}

      {accounts.length > 0 && (
        <div>
          <label htmlFor="prestamo-cuenta" className={labelClass}>
            Cuenta asociada
          </label>
          <select
            id="prestamo-cuenta"
            value={cuentaId === '' ? '' : cuentaId}
            onChange={(e) => setCuentaId(e.target.value === '' ? '' : Number(e.target.value))}
            className={inputClass}
          >
            <option value="">Ninguna</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.nombre}
              </option>
            ))}
          </select>

          {!isEdit && cuentaId !== '' && (
            <label
              htmlFor="prestamo-movimiento"
              className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700"
            >
              <input
                type="checkbox"
                id="prestamo-movimiento"
                checked={registrarMovimiento}
                onChange={(e) => setRegistrarMovimiento(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-slate-300 text-brand-500 focus:ring-brand-400"
              />
              <span>
                <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                  {tipo === 'DEUDA'
                    ? 'El dinero entra a esta cuenta ahora'
                    : 'El dinero sale de esta cuenta ahora'}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                  {monto > 0
                    ? tipo === 'DEUDA'
                      ? `Suma ${formatCurrency(monto, moneda)} al saldo y lo registra como movimiento.`
                      : `Descuenta ${formatCurrency(monto, moneda)} del saldo y lo registra como movimiento.`
                    : 'Genera el movimiento real en tu cuenta.'}{' '}
                  Desmárcala si estás registrando un préstamo antiguo.
                </span>
              </span>
            </label>
          )}
        </div>
      )}

      <div>
        <label htmlFor="prestamo-notas" className={labelClass}>
          Notas
        </label>
        <textarea
          id="prestamo-notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
          placeholder="Notas..."
        />
      </div>

      {isEdit && (
        <label
          htmlFor="prestamo-activa"
          className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700"
        >
          <span>
            <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
              Préstamo activo
            </span>
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              Los inactivos no admiten nuevos pagos
            </span>
          </span>
          <input
            type="checkbox"
            id="prestamo-activa"
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
          {loading ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear préstamo'}
        </button>
      </div>
    </form>
  )
}

export default PrestamoFormModal
