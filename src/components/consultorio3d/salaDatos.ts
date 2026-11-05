import type { TipoModelo } from './catalogo'

/** Datos de la sala (lugares, zonas y reparto de equipos) sin nada de Three.js, para poder usarlos sin cargar el 3D. */

export type PuntoVista = 'general' | 'atencion' | 'laboratorio' | 'imagenes' | 'recepcion'
export type EstadoSala = 'verde' | 'amarillo' | 'rojo'

export interface EquipoSala {
  id: string
  nombre: string
  tipo: TipoModelo
  estado: EstadoSala
}

export type Zona = Exclude<PuntoVista, 'general'>

export interface DefPunto {
  id: PuntoVista
  nombre: string
  descripcion: string
  ojo: [number, number, number]
  mira: [number, number, number]
}

/** Lugares a los que se puede ir. El primero es la vista aérea de todo el consultorio. */
export const PUNTOS: DefPunto[] = [
  { id: 'general', nombre: 'Vista general', descripcion: 'Todo el consultorio desde arriba', ojo: [6.5, 6.8, 8.2], mira: [0, 0.3, 0.3] },
  { id: 'recepcion', nombre: 'Recepción', descripcion: 'Entrada y sala de espera', ojo: [-3, 2.4, 6.2], mira: [-3, 0.6, 1.8] },
  { id: 'atencion', nombre: 'Sala de atención', descripcion: 'Consulta y procedimientos', ojo: [-3, 2.6, 2.2], mira: [-3, 0.5, -2.4] },
  { id: 'laboratorio', nombre: 'Esterilización y laboratorio', descripcion: 'Autoclaves, centrífugas y microscopios', ojo: [3, 2.6, 2.2], mira: [3, 0.5, -2.4] },
  { id: 'imagenes', nombre: 'Imágenes diagnósticas', descripcion: 'Rayos X y ecografía', ojo: [3, 2.4, 6.2], mira: [3, 0.6, 1.8] },
]

export const LIMITES: Record<Zona, { x0: number; x1: number; z0: number; z1: number }> = {
  atencion: { x0: -6, x1: 0, z0: -4, z1: 0 },
  laboratorio: { x0: 0, x1: 6, z0: -4, z1: 0 },
  imagenes: { x0: 0, x1: 6, z0: 0, z1: 4 },
  recepcion: { x0: -6, x1: 0, z0: 0, z1: 4 },
}

/** Cada tipo de equipo se ubica en la zona que le corresponde. */
function zonaDe(tipo: TipoModelo): Zona {
  if (tipo === 'autoclave' || tipo === 'centrifuga' || tipo === 'microscopio' || tipo === 'balanza') return 'laboratorio'
  if (tipo === 'rayos-x' || tipo === 'ecografo') return 'imagenes'
  return 'atencion'
}

const ANCHO: Partial<Record<TipoModelo, number>> = { 'unidad-odontologica': 2.5, 'rayos-x': 1.9, camilla: 1.5, ecografo: 1.2, compresor: 1.2 }

export interface Colocado {
  equipo: EquipoSala
  zona: Zona
  pos: [number, number, number]
}

/** Reparte los equipos por filas dentro de su zona. */
export function colocarEquipos(equipos: EquipoSala[]): Colocado[] {
  const cursores = new Map<Zona, { x: number; fila: number }>()
  return equipos.map((equipo) => {
    const zona = zonaDe(equipo.tipo)
    const lim = LIMITES[zona]
    const c = cursores.get(zona) ?? { x: lim.x0 + 0.7, fila: 0 }
    const ancho = ANCHO[equipo.tipo] ?? 1.1
    if (c.x + ancho > lim.x1 - 0.3) {
      c.x = lim.x0 + 0.7
      c.fila += 1
    }
    const z = lim.z0 + 1.1 + (c.fila % 2) * 1.9
    const x = c.x + ancho / 2 + (c.fila >= 2 ? 0.4 : 0)
    c.x += ancho + 0.25
    cursores.set(zona, c)
    return { equipo, zona, pos: [x, 0, z] as [number, number, number] }
  })
}

