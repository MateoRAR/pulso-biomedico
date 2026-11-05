import json from '@/data/notificaciones.json'
import type { Notificacion } from '@/data/tipos'

import { Coleccion } from './almacen'

export const notificacionesService = new Coleccion<Notificacion>('notificaciones', json as unknown as Notificacion[])
