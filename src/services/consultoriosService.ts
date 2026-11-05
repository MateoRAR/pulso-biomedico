import json from '@/data/consultorios.json'
import type { Consultorio } from '@/data/tipos'

import { Coleccion } from './almacen'

class ConsultoriosService extends Coleccion<Consultorio> {
  async porCiudad(ciudadId: string): Promise<Consultorio[]> {
    return (await this.listar()).filter((c) => c.ciudadId === ciudadId)
  }

  /** Se desactiva en vez de borrar: se puede reactivar. */
  desactivar(id: string) {
    return this.actualizar(id, { activo: false })
  }

  reactivar(id: string) {
    return this.actualizar(id, { activo: true })
  }
}

export const consultoriosService = new ConsultoriosService('consultorios', json as unknown as Consultorio[])
