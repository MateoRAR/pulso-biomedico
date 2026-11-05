import json from '@/data/reclamos.json'
import type { Reclamo } from '@/data/tipos'

import { Coleccion } from './almacen'

export const reclamosService = new Coleccion<Reclamo>('reclamos', json as unknown as Reclamo[])
