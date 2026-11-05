import type { Calificacion, Ingeniero, IngenieroRegistro, Servicio } from '@/data/tipos'

/**
 * Puntaje, número de servicios y opiniones de cada ingeniero se calculan a partir de los
 * registros (calificaciones y servicios); nunca se escriben a mano.
 */
export function enriquecerIngenieros(
  ingenieros: IngenieroRegistro[],
  calificaciones: Calificacion[],
  servicios: Servicio[],
): Ingeniero[] {
  return ingenieros.map((ing) => {
    const propias = calificaciones.filter((c) => c.ingenieroId === ing.id)
    const promedio = propias.length ? propias.reduce((suma, c) => suma + c.estrellas, 0) / propias.length : 0
    return {
      ...ing,
      calificacion: Math.round(promedio * 10) / 10,
      servicios: servicios.filter((s) => s.ingenieroId === ing.id && ['Ejecutada', 'Cerrada'].includes(s.estado)).length,
      opiniones: propias.map((c) => ({ autor: c.autor, calificacion: c.estrellas, texto: c.comentario, fecha: c.fecha })),
    }
  })
}
