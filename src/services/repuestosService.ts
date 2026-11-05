import json from '@/data/repuestos.json'
import type { PedidoRepuesto } from '@/data/tipos'

import { Coleccion } from './almacen'

export const repuestosService = new Coleccion<PedidoRepuesto>('repuestos', json as unknown as PedidoRepuesto[])
