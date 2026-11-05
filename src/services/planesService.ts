import json from '@/data/planes.json'
import type { Plan } from '@/data/tipos'

import { Coleccion } from './almacen'

export const planesService = new Coleccion<Plan>('planes', json as unknown as Plan[])
