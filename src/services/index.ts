import type { Notificacion } from '@/data/tipos'

import { aliadosService } from './aliadosService'
import { calificacionesService } from './calificacionesService'
import { ciudadesService } from './ciudadesService'
import { consultoriosService } from './consultoriosService'
import { documentosService } from './documentosService'
import { equiposService } from './equiposService'
import { ingenierosService } from './ingenierosService'
import { notificacionesService } from './notificacionesService'
import { planesService } from './planesService'
import { reclamosService } from './reclamosService'
import { repuestosService } from './repuestosService'
import { serviciosService } from './serviciosService'
import { usuariosService } from './usuariosService'

export {
  aliadosService,
  calificacionesService,
  ciudadesService,
  consultoriosService,
  documentosService,
  equiposService,
  ingenierosService,
  notificacionesService,
  planesService,
  reclamosService,
  repuestosService,
  serviciosService,
  usuariosService,
}
export { enriquecerIngenieros } from './estadisticas'

/** Carga todas las colecciones de una vez (como una consulta inicial a la base). */
export async function cargarBase() {
  const [ciudades, consultorios, usuarios, ingenieros, equipos, servicios, documentos, calificaciones, reclamos, repuestos, aliados, notificaciones, planes] =
    await Promise.all([
      ciudadesService.listar(),
      consultoriosService.listar(),
      usuariosService.listar(),
      ingenierosService.listar(),
      equiposService.listar(),
      serviciosService.listar(),
      documentosService.listar(),
      calificacionesService.listar(),
      reclamosService.listar(),
      repuestosService.listar(),
      aliadosService.listar(),
      notificacionesService.listar(),
      planesService.listar(),
    ])
  return { ciudades, consultorios, usuarios, ingenieros, equipos, servicios, documentos, calificaciones, reclamos, repuestos, aliados, notificaciones, planes }
}

export type Base = Awaited<ReturnType<typeof cargarBase>>

// Los registros creados al registrarse llevan ids como "con-m3x9k2a" (prefijo + base 36).
const CREADO_AL_REGISTRARSE = /^(usr|con|ing)-[a-z0-9]{6,}$/

/**
 * "Restaurar demo": todo vuelve a los JSON, salvo lo que se creó al registrarse
 * (cuentas, consultorios e ingenieros nuevos), que se conserva.
 */
export async function restaurarDemo(): Promise<Base> {
  const propio = (x: { id: string }) => CREADO_AL_REGISTRARSE.test(x.id)
  await Promise.all([
    equiposService.restaurar(),
    serviciosService.restaurar(),
    documentosService.restaurar(),
    calificacionesService.restaurar(),
    reclamosService.restaurar(),
    repuestosService.restaurar(),
    notificacionesService.restaurar(),
    consultoriosService.restaurar(propio),
    ingenierosService.restaurar(propio),
    usuariosService.restaurar(propio),
  ])
  return cargarBase()
}

/** Reinicia el espacio de una cuenta registrada: borra sus datos y deja el aviso de bienvenida. */
export async function reiniciarCuenta(
  ref: { consultorioId?: string; ingenieroId?: string },
  bienvenida: Notificacion[],
): Promise<Base> {
  const { consultorioId, ingenieroId } = ref
  if (consultorioId) {
    const todos = await equiposService.listar()
    const suyos = todos.filter((e) => e.consultorioId === consultorioId).map((e) => e.id)
    await equiposService.reemplazar(todos.filter((e) => e.consultorioId !== consultorioId))
    await serviciosService.reemplazar((await serviciosService.listar()).filter((s) => s.consultorioId !== consultorioId))
    await documentosService.reemplazar((await documentosService.listar()).filter((d) => !suyos.includes(d.equipoId)))
    await repuestosService.reemplazar((await repuestosService.listar()).filter((r) => r.consultorioId !== consultorioId))
    await reclamosService.reemplazar((await reclamosService.listar()).filter((r) => r.consultorioId !== consultorioId))
  }
  if (ingenieroId) {
    await serviciosService.reemplazar(
      (await serviciosService.listar()).map((s) =>
        s.ingenieroId === ingenieroId ? { ...s, ingenieroId: null, estado: 'Programada' as const } : s,
      ),
    )
  }
  const refId = consultorioId ?? ingenieroId
  await notificacionesService.reemplazar([
    ...bienvenida,
    ...(await notificacionesService.listar()).filter((n) => n.refId !== refId),
  ])
  return cargarBase()
}
