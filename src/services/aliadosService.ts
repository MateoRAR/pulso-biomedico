import json from '@/data/aliados.json'
import type { Aliado } from '@/data/tipos'

import { Coleccion } from './almacen'

export const aliadosService = new Coleccion<Aliado>('aliados', json as unknown as Aliado[])
