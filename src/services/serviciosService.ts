import json from '@/data/servicios.json'
import type { Servicio } from '@/data/tipos'

import { Coleccion } from './almacen'

export const serviciosService = new Coleccion<Servicio>('servicios', json as unknown as Servicio[])
