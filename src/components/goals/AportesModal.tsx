import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Swal from 'sweetalert2'
import type { Aporte, Meta } from '../../services/api'
import { deleteAporte, getAportes } from '../../services/api'
import { formatCurrency } from '../../utils/format'
import Modal from '../ui/Modal'

type AportesModalProps = {
  open: boolean
  meta: Meta | null
  moneda: string
  onClose: () => void
  onChanged: () => void
}

export default function AportesModal({
  open,
  meta,
  moneda,
  onClose,
  onChanged,
}: AportesModalProps) {
  return (
    <Modal
      open={open && Boolean(meta)}
      title="Historial de aportes"
      subtitle={meta?.nombre}
      accentColor={meta?.color || '#1EB256'}
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      {meta && (
        <AportesLista key={meta.id} meta={meta} moneda={moneda} onChanged={onChanged} />
      )}
    </Modal>
  )
}

function fechaLarga(valor: string) {
  const d = new Date(valor)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

function AportesLista({
  meta,
  moneda,
  onChanged,
}: {
  meta: Meta
  moneda: string
  onChanged: () => void
}) {
  const [aportes, setAportes] = useState<Aporte[]>([])
  const [loading, setLoading] = useState(true)
  const [eliminando, setEliminando] = useState<number | null>(null)

  useEffect(() => {
    let vigente = true

    getAportes(meta.id)
      .then((data) => {
        if (vigente) setAportes(data)
      })
      .catch((error) => {
        if (!vigente) return
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar aportes',
          text: error instanceof Error ? error.message : 'No se pudieron cargar los aportes.',
        })
      })
      .finally(() => {
        if (vigente) setLoading(false)
      })

    return () => {
      vigente = false
    }
  }, [meta.id])

  const handleDelete = async (aporte: Aporte) => {
    const devuelve = aporte.transaccion_id && aporte.cuenta_nombre
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar aporte?',
      html: devuelve
        ? `Se descontarán <b>${formatCurrency(aporte.monto_aporte, moneda)}</b> de la meta y el dinero volverá a <b>${aporte.cuenta_nombre}</b>.`
        : `Se descontarán <b>${formatCurrency(aporte.monto_aporte, moneda)}</b> de la meta.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    })
    if (!result.isConfirmed) return

    try {
      setEliminando(aporte.id)
      await deleteAporte(meta.id, aporte.id)
      setAportes((prev) => prev.filter((a) => a.id !== aporte.id))
      onChanged()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar aporte',
        text: error instanceof Error ? error.message : 'No se pudo eliminar el aporte.',
      })
    } finally {
      setEliminando(null)
    }
  }

  const total = aportes.reduce((s, a) => s + a.monto_aporte, 0)

  if (loading) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    )
  }

  if (aportes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center dark:border-slate-700">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-100">Sin aportes todavía</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Los aportes que registres aparecerán aquí
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-3 text-xs tabular-nums text-slate-500 dark:text-slate-400">
        {aportes.length} {aportes.length === 1 ? 'aporte' : 'aportes'} ·{' '}
        {formatCurrency(total, moneda)} en total
      </p>

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {aportes.map((aporte) => (
            <motion.li
              key={aporte.id}
              layout
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-3 overflow-hidden rounded-2xl border border-slate-100 px-4 py-3 dark:border-slate-800"
            >
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: aporte.cuenta_color || meta.color || '#1EB256' }}
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                  {formatCurrency(aporte.monto_aporte, moneda)}
                </p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                  {fechaLarga(aporte.fecha_aporte)}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {aporte.cuenta_nombre ? (
                    <>
                      Desde {aporte.cuenta_nombre}
                      {!aporte.transaccion_id && (
                        <span className="ml-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[0.65rem] text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          sin movimiento
                        </span>
                      )}
                    </>
                  ) : (
                    'Sin cuenta asociada'
                  )}
                </p>
                {aporte.notas && (
                  <p className="mt-1 truncate text-xs italic text-slate-400 dark:text-slate-500">
                    {aporte.notas}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(aporte)}
                disabled={eliminando === aporte.id}
                aria-label="Eliminar aporte"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-rose-900/30 dark:hover:text-rose-300"
              >
                {eliminando === aporte.id ? (
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
