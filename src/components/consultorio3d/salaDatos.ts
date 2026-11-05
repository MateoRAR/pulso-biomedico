import { MODELOS, type TipoModelo } from './catalogo'

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
  /** Dónde se dibuja el círculo que lleva a esta zona (x, z). */
  marcador?: [number, number]
}

/** Tamaño de cada zona (metros). Son cuatro: atención, laboratorio, imágenes y recepción. */
export const ZONA_ANCHO = 8
export const ZONA_FONDO = 5.6

/**
 * Lugares a los que se puede ir. El primero es la vista aérea de todo el consultorio; en cada zona la
 * cámara queda sobre el centro de la sala, alta y mirando hacia abajo, para ver todos los equipos sin
 * que las divisiones de las otras salas estorben.
 */
export const PUNTOS: DefPunto[] = [
  { id: 'general', nombre: 'Vista general', descripcion: 'Todo el consultorio desde arriba', ojo: [9.5, 10, 12.5], mira: [0, 0.2, 0.3] },
  { id: 'recepcion', nombre: 'Recepción', descripcion: 'Entrada y sala de espera', ojo: [-4, 6.2, 7.2], mira: [-4, 0.2, 2.5], marcador: [-4, 0.55] },
  { id: 'atencion', nombre: 'Sala de atención', descripcion: 'Consulta y procedimientos', ojo: [-4, 6.2, 1.6], mira: [-4, 0.2, -3.1], marcador: [-4, -0.55] },
  { id: 'laboratorio', nombre: 'Esterilización y laboratorio', descripcion: 'Autoclaves, centrífugas y microscopios', ojo: [4, 6.2, 1.6], mira: [4, 0.2, -3.1], marcador: [4, -0.55] },
  { id: 'imagenes', nombre: 'Imágenes diagnósticas', descripcion: 'Rayos X y ecografía', ojo: [4, 6.2, 7.2], mira: [4, 0.2, 2.5], marcador: [4, 0.55] },
]

export const LIMITES: Record<Zona, { x0: number; x1: number; z0: number; z1: number }> = {
  atencion: { x0: -ZONA_ANCHO, x1: 0, z0: -ZONA_FONDO, z1: 0 },
  laboratorio: { x0: 0, x1: ZONA_ANCHO, z0: -ZONA_FONDO, z1: 0 },
  imagenes: { x0: 0, x1: ZONA_ANCHO, z0: 0, z1: ZONA_FONDO },
  recepcion: { x0: -ZONA_ANCHO, x1: 0, z0: 0, z1: ZONA_FONDO },
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

/** Reparte los equipos por filas dentro de su zona (hasta tres filas; después se vuelve a empezar desplazado). */
export function colocarEquipos(equipos: EquipoSala[]): Colocado[] {
  const cursores = new Map<Zona, { x: number; fila: number }>()
  return equipos.map((equipo) => {
    const zona = zonaDe(equipo.tipo)
    const lim = LIMITES[zona]
    const c = cursores.get(zona) ?? { x: lim.x0 + 1, fila: 0 }
    const ancho = ANCHO[equipo.tipo] ?? 1.1
    if (c.x + ancho > lim.x1 - 0.6) {
      c.x = lim.x0 + 1
      c.fila += 1
    }
    const z = lim.z0 + 1.7 + (c.fila % 3) * 1.65
    const x = c.x + ancho / 2 + (c.fila >= 3 ? 0.5 : 0)
    c.x += ancho + 0.55
    cursores.set(zona, c)
    return { equipo, zona, pos: [x, 0, z] as [number, number, number] }
  })
}

/** Punto sobre el equipo donde se ancla su nota flotante (la parte más alta del modelo). */
export function anclaDeEquipo(c: Colocado): [number, number, number] {
  const def = MODELOS[c.equipo.tipo]
  return [c.pos[0], (def.enMesa ? 0.8 : 0) + def.altura + 0.12, c.pos[2]]
}
