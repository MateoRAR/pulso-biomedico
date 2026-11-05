import tarifas from '@/data/tarifas.json'
import type { Plan } from '@/data/tipos'
import { cop } from '@/lib/format'

/**
 * Textos y reglas de los planes y tarifas, calculados siempre desde `src/data/planes.json` y
 * `src/data/tarifas.json`: si cambia un precio o un rango allí, cambia en toda la plataforma.
 */

export const TARIFAS = tarifas

/** 0.15 → "15 %". */
export function pct(fraccion: number): string {
  return `${Math.round(fraccion * 100)} %`
}

/** Nombre corto: "Plan Esencial" → "Esencial". */
export function nombreCorto(plan: Plan): string {
  return plan.nombre.replace(/^Plan\s+/i, '')
}

/** Planes con precio de lista (sin los que se cotizan a la medida). */
export function planesConPrecio(planes: Plan[]): Plan[] {
  return planes.filter((p) => !p.precioTexto)
}

/** Plan que se cotiza a la medida, si existe. */
export function planALaMedida(planes: Plan[]): Plan | undefined {
  return planes.find((p) => p.precioTexto)
}

/** "$100.000 al mes" o el texto del plan ("Se cotiza"). */
export function precioPlan(plan: Plan): string {
  return plan.precioTexto ?? `${cop(plan.precioCOP)} al mes`
}

/** "1 a 6 equipos" o "más de 15 equipos". */
export function rangoPlan(plan: Plan): string {
  if (plan.maxEquipos === null) return `más de ${plan.minEquipos - 1} equipos`
  return `${plan.minEquipos} a ${plan.maxEquipos} equipos`
}

/** "1 a 6 equipos y 1 sede" / "7 a 15 equipos y hasta 3 sedes". */
export function alcancePlan(plan: Plan): string {
  if (plan.maxSedes === null) return rangoPlan(plan)
  return `${rangoPlan(plan)} y ${plan.maxSedes === 1 ? '1 sede' : `hasta ${plan.maxSedes} sedes`}`
}

/** El primer plan (en el orden del JSON) que cubre esa cantidad de equipos y sedes. */
export function planRecomendado(planes: Plan[], equipos: number, sedes = 1): Plan | undefined {
  return planes.find((p) => (p.maxEquipos === null || equipos <= p.maxEquipos) && (p.maxSedes === null || sedes <= p.maxSedes))
}

/** "Esencial ($100.000 al mes, 1 a 6 equipos y 1 sede) e Integral ($200.000 al mes, 7 a 15 equipos y hasta 3 sedes)". */
export function resumenPlanes(planes: Plan[]): string {
  const partes = planesConPrecio(planes).map((p) => `${nombreCorto(p)} (${precioPlan(p)}, ${alcancePlan(p)})`)
  if (partes.length <= 1) return partes.join('')
  const ultima = partes[partes.length - 1]
  return `${partes.slice(0, -1).join(', ')} ${/^i/i.test(ultima) ? 'e' : 'y'} ${ultima}`
}
