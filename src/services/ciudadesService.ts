import json from '@/data/ciudades.json'
import type { Ciudad } from '@/data/tipos'

import { Coleccion } from './almacen'

export const ciudadesService = new Coleccion<Ciudad>('ciudades', json as Ciudad[])
