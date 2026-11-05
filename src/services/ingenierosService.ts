import json from '@/data/ingenieros.json'
import type { IngenieroRegistro } from '@/data/tipos'

import { Coleccion } from './almacen'

class IngenierosService extends Coleccion<IngenieroRegistro> {
  async porCiudad(ciudadId: string): Promise<IngenieroRegistro[]> {
    return (await this.listar()).filter((i) => i.ciudadId === ciudadId)
  }
}

export const ingenierosService = new IngenierosService('ingenieros', json as unknown as IngenieroRegistro[])
