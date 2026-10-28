import type { Prestamo } from '../services/api'

export const TONO = {
  DEUDA: '#F43F5E',
  PRESTAMO: '#1EB256',
}

export function prestamoProgreso(prestamo: Prestamo) {
  const total = Number(prestamo.monto_total) || 0
  const pendiente = Math.max(
    0,
    Number(prestamo.saldo_pendiente ?? total - (prestamo.monto_pagado ?? 0)) || 0,
  )
  const pagado = Math.max(0, Number(prestamo.monto_pagado ?? total - pendiente) || 0)
  const pct = total > 0 ? Math.min(100, Math.round((pagado / total) * 100)) : 0
  return { total, pendiente, pagado, pct, saldado: pendiente <= 0 }
}

export function diasHasta(fecha?: string | null) {
  if (!fecha) return null
  const objetivo = new Date(fecha)
  if (Number.isNaN(objetivo.getTime())) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  objetivo.setHours(0, 0, 0, 0)
  return Math.round((objetivo.getTime() - hoy.getTime()) / 86_400_000)
}

export function cuotaSugerida(pendiente: number, dias: number | null) {
  if (pendiente <= 0 || dias === null || dias <= 0) return null
  return Math.ceil(pendiente / Math.max(1, Math.ceil(dias / 30)))
}

export function etiquetaPlazo(prestamo: Prestamo) {
  const { saldado } = prestamoProgreso(prestamo)
  if (saldado) return { texto: 'Saldado', vencido: false }

  const dias = diasHasta(prestamo.fecha_fin)
  if (dias === null) return null

  if (dias < 0) {
    const abs = Math.abs(dias)
    return { texto: `Vencido hace ${abs} ${abs === 1 ? 'día' : 'días'}`, vencido: true }
  }
  if (dias === 0) return { texto: 'Vence hoy', vencido: true }
  if (dias === 1) return { texto: 'Queda 1 día', vencido: false }
  if (dias < 45) return { texto: `Quedan ${dias} días`, vencido: false }
  return { texto: `Quedan ${Math.round(dias / 30)} meses`, vencido: false }
}
