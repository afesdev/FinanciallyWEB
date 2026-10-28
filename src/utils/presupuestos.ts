import type { Presupuesto } from '../services/api'

export const PERIODO_LABEL: Record<string, string> = {
  SEMANAL: 'Semanal',
  MENSUAL: 'Mensual',
  ANUAL: 'Anual',
  PERSONALIZADO: 'Personalizado',
}

export type EstadoPresupuesto = 'EXCEDIDO' | 'EN_RIESGO' | 'AL_DIA' | 'TERMINADO'

export function presupuestoResumen(p: Presupuesto) {
  const limite = Number(p.monto_limite) || 0
  const gastado = Math.max(0, Number(p.monto_gastado) || 0)
  const restante = limite - gastado
  const pctGasto = limite > 0 ? (gastado / limite) * 100 : 0
  const excedido = gastado > limite

  const inicio = new Date(p.fecha_inicio)
  const fin = new Date(p.fecha_fin)
  const ahora = new Date()

  const fechasValidas = !Number.isNaN(inicio.getTime()) && !Number.isNaN(fin.getTime())
  const duracion = fechasValidas ? fin.getTime() - inicio.getTime() : 0
  const transcurrido = fechasValidas ? ahora.getTime() - inicio.getTime() : 0

  const pctTiempo =
    duracion > 0 ? Math.min(100, Math.max(0, (transcurrido / duracion) * 100)) : 0

  const diasRestantes = fechasValidas
    ? Math.ceil((fin.getTime() - ahora.getTime()) / 86_400_000)
    : null

  const terminado = fechasValidas && ahora > fin
  const noEmpezado = fechasValidas && ahora < inicio

  // A este ritmo, cuanto habras gastado al cerrar el periodo
  const proyeccion =
    duracion > 0 && transcurrido > 0 && !terminado
      ? Math.round(gastado / (transcurrido / duracion))
      : null

  const disponiblePorDia =
    restante > 0 && diasRestantes !== null && diasRestantes > 0
      ? Math.floor(restante / diasRestantes)
      : null

  // Gastar mas rapido de lo que avanza el periodo es la senal temprana
  const enRiesgo = !excedido && !terminado && pctTiempo > 5 && pctGasto > pctTiempo + 10

  const estado: EstadoPresupuesto = excedido
    ? 'EXCEDIDO'
    : terminado
      ? 'TERMINADO'
      : enRiesgo
        ? 'EN_RIESGO'
        : 'AL_DIA'

  return {
    limite,
    gastado,
    restante,
    pctGasto,
    pctGastoBarra: Math.min(100, pctGasto),
    pctTiempo,
    diasRestantes,
    terminado,
    noEmpezado,
    excedido,
    proyeccion,
    disponiblePorDia,
    estado,
  }
}

export function etiquetaPeriodo(p: Presupuesto) {
  const { diasRestantes, terminado, noEmpezado } = presupuestoResumen(p)
  if (noEmpezado) return 'Aún no empieza'
  if (terminado) return 'Periodo cerrado'
  if (diasRestantes === null) return null
  if (diasRestantes <= 0) return 'Último día'
  if (diasRestantes === 1) return 'Queda 1 día'
  if (diasRestantes < 45) return `Quedan ${diasRestantes} días`
  return `Quedan ${Math.round(diasRestantes / 30)} meses`
}
