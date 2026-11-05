import tarifas from '@/data/tarifas.json'
import type { Criticidad, Equipo, Semaforo } from '@/data/tipos'

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

/**
 * Valor de referencia de cada servicio (COP, sin IVA) y comisión de Pulso: vienen de
 * `src/data/tarifas.json`. El consultorio paga el servicio por la plataforma; Pulso retiene su
 * comisión y gira el resto al ingeniero.
 */
export const COMISION_PULSO: number = tarifas.comisionPulso

export const VALOR_SERVICIO: Record<string, number> = tarifas.servicios

export function valorServicio(tipo: string): number {
  return VALOR_SERVICIO[tipo] ?? 200000
}

export function comisionIngeniero(tipo: string): number {
  return Math.round(valorServicio(tipo) * (1 - COMISION_PULSO))
}

/** "hace 5 min", "hace 2 h", "ayer"… Acepta fecha ISO con o sin hora. */
export function haceCuanto(iso: string): string {
  const fecha = iso.length <= 10 ? new Date(iso + 'T12:00:00') : new Date(iso)
  const ms = Date.now() - fecha.getTime()
  if (Number.isNaN(ms)) return ''
  const min = Math.round(ms / 60_000)
  if (iso.length > 10) {
    if (min < 1) return 'ahora mismo'
    if (min < 60) return `hace ${min} min`
    const h = Math.round(min / 60)
    if (h < 24) return `hace ${h} h`
  }
  const dias = Math.max(0, Math.round(ms / 86_400_000))
  if (dias === 0) return 'hoy'
  if (dias === 1) return 'ayer'
  return `hace ${dias} días`
}

export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
}

/** "4.8" o "Sin calificaciones" cuando todavía no hay ninguna (el puntaje se calcula de las reseñas). */
export function textoCalificacion(ing: { calificacion: number; opiniones: unknown[] }): string {
  return ing.opiniones.length ? ing.calificacion.toFixed(1) : 'Sin calificaciones'
}
