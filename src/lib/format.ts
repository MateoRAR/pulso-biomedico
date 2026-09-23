import type { Criticidad, Equipo, Semaforo } from '@/lib/mock/data'

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function cop(valor: number): string {
  return COP.format(valor)
}

export function fechaCorta(iso: string): string {
  if (!iso) return '—'
  const fecha = new Date(iso + 'T00:00:00')
  if (Number.isNaN(fecha.getTime())) return iso
  return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function diasHasta(iso: string): number | null {
  if (!iso) return null
  const fecha = new Date(iso + 'T00:00:00')
  if (Number.isNaN(fecha.getTime())) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Math.round((fecha.getTime() - hoy.getTime()) / 86_400_000)
}

export function semaforoEquipo(equipo: Equipo): Semaforo {
  const dias = diasHasta(equipo.proximaCalibracion)
  if (equipo.estado === 'Fuera de servicio' || (dias !== null && dias < 0)) return 'rojo'
  if (
    equipo.estado === 'Requiere calibración' ||
    equipo.estado === 'En mantenimiento' ||
    (dias !== null && dias <= 60)
  ) {
    return 'amarillo'
  }
  return 'verde'
}

export const ETIQUETA_SEMAFORO: Record<Semaforo, string> = {
  verde: 'Al día',
  amarillo: 'Por vencer',
  rojo: 'Requiere acción',
}

export function resumenCriticidad(criticidad: Criticidad): string {
  return criticidad
}

// Valor de referencia del servicio (COP) y comisión neta del ingeniero (80 %).
export const VALOR_SERVICIO: Record<string, number> = {
  Preventivo: 220000,
  Calibración: 260000,
  Correctivo: 300000,
  'Diagnóstico exprés': 89000,
  Capacitación: 120000,
}

export function valorServicio(tipo: string): number {
  return VALOR_SERVICIO[tipo] ?? 200000
}

export function comisionIngeniero(tipo: string): number {
  return Math.round(valorServicio(tipo) * 0.8)
}
