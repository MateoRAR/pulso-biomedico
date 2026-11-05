import json from '@/data/calificaciones.json'
import type { Calificacion } from '@/data/tipos'

import { Coleccion } from './almacen'

export const calificacionesService = new Coleccion<Calificacion>('calificaciones', json as unknown as Calificacion[])
