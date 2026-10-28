import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Swal from 'sweetalert2'
import type { PagoPrestamo, Prestamo } from '../../services/api'
import { deletePagoPrestamo, getPagosPrestamo } from '../../services/api'
import { formatCurrency } from '../../utils/format'
import { TONO } from '../../utils/prestamos'
import Modal from '../ui/Modal'


type PagosPrestamoModalProps = {
  open: boolean
  prestamo: Prestamo | null
  moneda: string
  onClose: () => void
  onChanged: () => void
}

export default function PagosPrestamoModal({
  open,
  prestamo,
  moneda,
  onClose,
  onChanged,
}: PagosPrestamoModalProps) {
  const esDeuda = prestamo?.tipo === 'DEUDA'

  return (
    <Modal
      open={open && Boolean(prestamo)}
      title={esDeuda ? 'Historial de pagos' : 'Historial de cobros'}
      subtitle={prestamo?.nombre}
      accentColor={esDeuda ? TONO.DEUDA : TONO.PRESTAMO}
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      {prestamo && (
        <PagosLista
          key={prestamo.id}
          prestamo={prestamo}
          moneda={moneda}
          onChanged={onChanged}
        />
      )}
    </Modal>
  )
}

function fechaLarga(valor?: string) {
  if (!valor) return 'Sin fecha'
  const d = new Date(valor)
  if (Number.isNaN(d.getTime())) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

function PagosLista({
  prestamo,
  moneda,
  onChanged,
}: {
  prestamo: Prestamo
  moneda: string
  onChanged: () => void
}) {
  const [pagos, setPagos] = useState<PagoPrestamo[]>([])
  const [loading, setLoading] = useState(true)
  const [eliminando, setEliminando] = useState<number | null>(null)

  const esDeuda = prestamo.tipo === 'DEUDA'
  const color = esDeuda ? TONO.DEUDA : TONO.PRESTAMO

  useEffect(() => {
    let vigente = true

    getPagosPrestamo(prestamo.id)
      .then((data) => {
        if (vigente) setPagos(Array.isArray(data) ? data : [])
      })
      .catch((error) => {
        if (!vigente) return
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar pagos',
          text: error instanceof Error ? error.message : 'No se pudieron cargar los pagos.',
        })
      })
      .finally(() => {
        if (vigente) setLoading(false)
      })

    return () => {
      vigente = false
    }
  }, [prestamo.id])

  const handleDelete = async (pago: PagoPrestamo) => {
    const valor = pago.monto ?? pago.monto_pago ?? 0
    const result = await Swal.fire({
      icon: 'warning',
      title: `¿Eliminar ${esDeuda ? 'pago' : 'cobro'}?`,
      html: `Se sumarán <b>${formatCurrency(valor, moneda)}</b> de vuelta al saldo pendiente.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    })
    if (!result.isConfirmed) return

    try {
      setEliminando(pago.id)
      await deletePagoPrestamo(pago.id)
      setPagos((prev) => prev.filter((p) => p.id !== pago.id))
      onChanged()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: error instanceof Error ? error.message : 'No se pudo eliminar el registro.',
      })
    } finally {
      setEliminando(null)
    }
  }

  const total = pagos.reduce((s, p) => s + (p.monto ?? p.monto_pago ?? 0), 0)

  if (loading) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    )
  }

  if (pagos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center dark:border-slate-700">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-100">
          Sin {esDeuda ? 'pagos' : 'cobros'} todavía
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Los registros que hagas aparecerán aquí
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-3 text-xs tabular-nums text-slate-500 dark:text-slate-400">
        {pagos.length} {pagos.length === 1 ? 'registro' : 'registros'} ·{' '}
        {formatCurrency(total, moneda)} en total
      </p>

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {pagos.map((pago) => (
            <motion.li
              key={pago.id}
              layout
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-3 overflow-hidden rounded-2xl border border-slate-100 px-4 py-3 dark:border-slate-800"
            >
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                  {formatCurrency(pago.monto ?? pago.monto_pago ?? 0, moneda)}
                </p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                  {fechaLarga(pago.fecha_pago)}
                </p>
                {pago.notas && (
                  <p className="mt-1 truncate text-xs italic text-slate-400 dark:text-slate-500">
                    {pago.notas}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(pago)}
                disabled={eliminando === pago.id}
                aria-label="Eliminar registro"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-rose-900/30 dark:hover:text-rose-300"
              >
                {eliminando === pago.id ? (
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
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-4 w-4"
                  >
                    <path d="M3.5 6.5h17" />
                    <path d="M18.5 6.5V20a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V6.5" />
                    <path d="M9 6.5V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5v2" />
                    <path d="M10.5 11v6M13.5 11v6" />
                  </svg>
                )}
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
