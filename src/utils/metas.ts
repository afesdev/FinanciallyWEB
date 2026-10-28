import type { Meta } from '../services/api'

export function metaProgreso(meta: Meta) {
  const objetivo = Number(meta.monto_objetivo) || 0
  const actual = Number(meta.monto_actual) || 0
  const pct = objetivo > 0 ? Math.min(100, Math.round((actual / objetivo) * 100)) : 0
  return { objetivo, actual, pct, restante: Math.max(0, objetivo - actual), completada: pct >= 100 }
}

export function diasRestantes(fecha?: string) {
  if (!fecha) return null
  const objetivo = new Date(fecha)
  if (Number.isNaN(objetivo.getTime())) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  objetivo.setHours(0, 0, 0, 0)
  return Math.round((objetivo.getTime() - hoy.getTime()) / 86_400_000)
}

export function aporteMensualSugerido(restante: number, dias: number | null) {
  if (restante <= 0 || dias === null || dias <= 0) return null
  return Math.ceil(restante / Math.max(1, Math.ceil(dias / 30)))
}
