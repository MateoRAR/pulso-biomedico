import json from '@/data/documentos.json'
import type { Documento } from '@/data/tipos'

import { Coleccion } from './almacen'

export const documentosService = new Coleccion<Documento>('documentos', json as unknown as Documento[])
