import json from '@/data/equipos.json'
import type { Equipo } from '@/data/tipos'

import { Coleccion } from './almacen'

export const equiposService = new Coleccion<Equipo>('equipos', json as unknown as Equipo[])
