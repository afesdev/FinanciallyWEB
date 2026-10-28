import type { FrecuenciaRecurrente, PagoRecurrente } from '../services/api'

const MESES_PASO: Record<FrecuenciaRecurrente, number> = {
  DIARIO: 0,
  SEMANAL: 0,
  MENSUAL: 1,
  BIMESTRAL: 2,
  TRIMESTRAL: 3,
  SEMESTRAL: 6,
  ANUAL: 12,
}

function soloFecha(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function ajustarDiaMes(year: number, month: number, dia: number) {
  const ultimo = new Date(year, month + 1, 0).getDate()
  return Math.min(dia, ultimo)
}

export function proximaEjecucion(pago: PagoRecurrente, desde = new Date()): Date | null {
  const hoy = soloFecha(desde)
  const inicio = soloFecha(new Date(pago.fecha_inicio))
  const fin = pago.fecha_fin ? soloFecha(new Date(pago.fecha_fin)) : null
  if (Number.isNaN(inicio.getTime())) return null

  const dentroDeVentana = (fecha: Date) => fecha >= inicio && (!fin || fecha <= fin)

  if (pago.frecuencia === 'DIARIO') {
    const candidato = hoy < inicio ? inicio : hoy
    return dentroDeVentana(candidato) ? candidato : null
  }

  if (pago.frecuencia === 'SEMANAL') {
    const objetivo = pago.dia_semana || 1
    const candidato = new Date(hoy)
    for (let i = 0; i < 7; i++) {
      const jsDay = candidato.getDay()
      const sqlDay = jsDay === 0 ? 7 : jsDay
      if (sqlDay === objetivo && dentroDeVentana(candidato)) return candidato
      candidato.setDate(candidato.getDate() + 1)
    }
    return null
  }

  const paso = MESES_PASO[pago.frecuencia] || 1
  const dia = pago.dia_vencimiento || 1
  const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1)

  for (let i = 0; i < 240; i++) {
    const candidato = new Date(
      cursor.getFullYear(),
      cursor.getMonth(),
      ajustarDiaMes(cursor.getFullYear(), cursor.getMonth(), dia),
    )
    if (candidato >= hoy && dentroDeVentana(candidato)) return candidato
    if (fin && candidato > fin) return null
    cursor.setMonth(cursor.getMonth() + paso)
  }
  return null
}

export type PagoProximo = {
  pago: PagoRecurrente
  fecha: Date
}

export function pagosProximos(pagos: PagoRecurrente[], dias = 7, desde = new Date()): PagoProximo[] {
  const hoy = soloFecha(desde)
  const limite = soloFecha(desde)
  limite.setDate(limite.getDate() + dias)

  return pagos
    .filter((pago) => pago.activo)
    .map((pago) => ({ pago, fecha: proximaEjecucion(pago, hoy) }))
    .filter((item): item is PagoProximo => item.fecha !== null && item.fecha <= limite)
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
}
