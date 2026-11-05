import { MODELOS, type TipoModelo } from './catalogo'

/**
 * Datos de la sala (planos, zonas, lugares y reparto de equipos) sin nada de Three.js, para poder
 * usarlos sin cargar el 3D. Cada tipo de prestador tiene su propio plano:
 *  - general: consultorio de baja complejidad (odontología, laboratorio, imágenes).
 *  - oncologia: unidad ambulatoria de oncología (quimioterapia, servicio farmacéutico, consulta y procedimientos).
 */

export type PlanoId = 'general' | 'oncologia'
/** 'general' es la vista aérea; el resto son los id de las zonas del plano. */
export type PuntoVista = string
export type EstadoSala = 'verde' | 'amarillo' | 'rojo'

export interface EquipoSala {
  id: string
  nombre: string
  tipo: TipoModelo
  estado: EstadoSala
}

type V3 = [number, number, number]

/** Lugar fijo para un equipo dentro de una zona (por ejemplo, junto a un sillón de quimioterapia). */
export interface Puesto {
  x: number
  z: number
  /** Giro del equipo sobre el piso (radianes); 0 = mirando hacia el frente (+z). */
  rot?: number
  /** Si se indica, el puesto solo recibe estos tipos de equipo. */
  tipos?: TipoModelo[]
}

export interface DefZona {
  id: string
  nombre: string
  descripcion: string
  x0: number
  x1: number
  z0: number
  z1: number
  color: string
  ojo?: V3
  mira?: V3
  /** Dónde se dibuja el círculo que lleva a esta zona (x, z). */
  marcador?: [number, number]
  puestos?: Puesto[]
}

export interface DefPlano {
  id: PlanoId
  general: { ojo: V3; mira: V3 }
  /** Límites del piso. */
  piso: { x0: number; x1: number; z0: number; z1: number }
  zonas: DefZona[]
  /** Zona a la que va cada tipo de equipo. */
  zonaDe: (tipo: TipoModelo) => string
}

export interface DefPunto {
  id: PuntoVista
  nombre: string
  descripcion: string
  ojo: V3
  mira: V3
  marcador?: [number, number]
}

// -- plano general (consultorio de baja complejidad) -------------------------------

/** Tamaño de cada zona del plano general (metros): cuatro salas de 8 × 5,6 m. */
export const ZONA_ANCHO = 8
export const ZONA_FONDO = 5.6

const GENERAL: DefPlano = {
  id: 'general',
  general: { ojo: [9.5, 10, 12.5], mira: [0, 0.2, 0.3] },
  piso: { x0: -ZONA_ANCHO - 0.2, x1: ZONA_ANCHO + 0.2, z0: -ZONA_FONDO - 0.2, z1: ZONA_FONDO + 0.2 },
  zonas: [
    { id: 'recepcion', nombre: 'Recepción', descripcion: 'Entrada y sala de espera', x0: -ZONA_ANCHO, x1: 0, z0: 0, z1: ZONA_FONDO, color: '#f0f2e8', ojo: [-4, 6.2, 7.2], mira: [-4, 0.2, 2.5], marcador: [-4, 0.55] },
    { id: 'atencion', nombre: 'Sala de atención', descripcion: 'Consulta y procedimientos', x0: -ZONA_ANCHO, x1: 0, z0: -ZONA_FONDO, z1: 0, color: '#e6f0f2', ojo: [-4, 6.2, 1.6], mira: [-4, 0.2, -3.1], marcador: [-4, -0.55] },
    { id: 'laboratorio', nombre: 'Esterilización y laboratorio', descripcion: 'Autoclaves, centrífugas y microscopios', x0: 0, x1: ZONA_ANCHO, z0: -ZONA_FONDO, z1: 0, color: '#e7eef5', ojo: [4, 6.2, 1.6], mira: [4, 0.2, -3.1], marcador: [4, -0.55] },
    { id: 'imagenes', nombre: 'Imágenes diagnósticas', descripcion: 'Rayos X y ecografía', x0: 0, x1: ZONA_ANCHO, z0: 0, z1: ZONA_FONDO, color: '#ebe9f3', ojo: [4, 6.2, 7.2], mira: [4, 0.2, 2.5], marcador: [4, 0.55] },
  ],
  zonaDe: (tipo) => {
    if (['autoclave', 'centrifuga', 'microscopio', 'balanza', 'cabina-bioseguridad', 'refrigerador'].includes(tipo)) return 'laboratorio'
    if (tipo === 'rayos-x' || tipo === 'ecografo') return 'imagenes'
    return 'atencion'
  },
}

// -- plano de oncología ambulatoria --------------------------------------------------
//
// Distribución típica de una unidad de oncología ambulatoria (como la sede de Inoos en Cali):
//  - Fondo, con luz natural: sala de quimioterapia (sillones reclinables con su bomba, estación de
//    enfermería con vista a todos los puestos y carro de paro) y servicio farmacéutico (almacenamiento
//    con cadena de frío y central de mezclas en sala limpia, con cabina de seguridad biológica).
//  - Pasillo de circulación.
//  - Frente: recepción y sala de espera, consultorios de consulta externa y sala de procedimientos.

/** Sillones de quimioterapia: fila del fondo (mirando al frente) y fila delantera (mirando al fondo). */
export const SILLONES_QUIMIO: { x: number; z: number; rot: number }[] = [
  ...[-10, -8.1, -6.2, -4.3, -2.4, -0.5].map((x) => ({ x, z: -6.05, rot: 0 })),
  ...[-10, -8.1, -2.4, -0.5].map((x) => ({ x, z: -1.75, rot: Math.PI })),
]

const ONCOLOGIA: DefPlano = {
  id: 'oncologia',
  general: { ojo: [11, 12.5, 15], mira: [0, 0.2, 0.2] },
  piso: { x0: -11.2, x1: 11.2, z0: -7.2, z1: 7.2 },
  zonas: [
    {
      id: 'recepcion',
      nombre: 'Recepción y espera',
      descripcion: 'Admisión de pacientes y sala de espera',
      x0: -11, x1: -3, z0: 1, z1: 7,
      color: '#f0f2e8',
      marcador: [-8.2, 1.9],
    },
    {
      id: 'quimioterapia',
      nombre: 'Sala de quimioterapia',
      descripcion: 'Sillones de infusión, estación de enfermería y carro de paro',
      x0: -11, x1: 1, z0: -7, z1: -0.6,
      color: '#e6f0f2',
      marcador: [-5.5, -1.3],
      puestos: [
        // una bomba al lado de cada sillón
        ...SILLONES_QUIMIO.map((s) => ({ x: s.x + (s.rot === 0 ? -0.72 : 0.72), z: s.z + (s.rot === 0 ? 0.15 : -0.15), rot: s.rot, tipos: ['bomba-infusion'] as TipoModelo[] })),
        { x: -3.2, z: -4.3, rot: 0, tipos: ['desfibrilador'] },
        { x: -8.3, z: -4.3, rot: 0, tipos: ['monitor'] },
        { x: -1.5, z: -4.3, rot: 0, tipos: ['monitor'] },
        { x: -9.6, z: -4.3, rot: 0, tipos: ['monitor', 'electrocardiografo'] },
      ],
    },
    {
      id: 'farmacia',
      nombre: 'Servicio farmacéutico',
      descripcion: 'Cadena de frío y central de mezclas (cabina de seguridad biológica)',
      x0: 1, x1: 11, z0: -7, z1: -0.6,
      color: '#e7eef5',
      marcador: [2.2, -1.3],
      puestos: [
        { x: 7.0, z: -6.25, rot: 0, tipos: ['cabina-bioseguridad'] },
        { x: 9.5, z: -6.25, rot: 0, tipos: ['cabina-bioseguridad'] },
        { x: 1.75, z: -6.45, rot: 0, tipos: ['refrigerador'] },
        { x: 2.6, z: -6.45, rot: 0, tipos: ['refrigerador'] },
        { x: 3.45, z: -6.45, rot: 0, tipos: ['refrigerador'] },
        { x: 4.3, z: -6.45, rot: 0, tipos: ['refrigerador'] },
        { x: 2.3, z: -3.6, rot: 0, tipos: ['balanza', 'centrifuga', 'microscopio', 'generico'] },
        { x: 3.8, z: -3.6, rot: 0 },
      ],
    },
    {
      id: 'consulta',
      nombre: 'Consulta externa',
      descripcion: 'Consultorios de oncología clínica',
      x0: -3, x1: 5, z0: 1, z1: 7,
      color: '#eef0f6',
      marcador: [-1.1, 1.9],
      puestos: [
        { x: -2.35, z: 2.1, rot: Math.PI / 2, tipos: ['bascula'] },
        { x: 1.65, z: 2.1, rot: Math.PI / 2, tipos: ['bascula', 'electrocardiografo', 'monitor'] },
        { x: 4.3, z: 2.4, rot: -Math.PI / 2 },
        { x: 0.3, z: 2.4, rot: -Math.PI / 2 },
      ],
    },
    {
      id: 'procedimientos',
      nombre: 'Sala de procedimientos',
      descripcion: 'Camilla, monitoreo y electrocardiografía',
      x0: 5, x1: 11, z0: 1, z1: 7,
      color: '#ebe9f3',
      marcador: [6.7, 1.9],
      puestos: [
        { x: 8.2, z: 4.4, rot: Math.PI, tipos: ['camilla'] },
        { x: 6.4, z: 3.2, rot: Math.PI / 2, tipos: ['electrocardiografo', 'monitor'] },
        { x: 9.9, z: 3.2, rot: -Math.PI / 2, tipos: ['monitor', 'desfibrilador'] },
        { x: 6.4, z: 5.6, rot: Math.PI / 2 },
        { x: 9.9, z: 5.6, rot: -Math.PI / 2 },
      ],
    },
  ],
  zonaDe: (tipo) => {
    if (tipo === 'bomba-infusion' || tipo === 'desfibrilador') return 'quimioterapia'
    if (['cabina-bioseguridad', 'refrigerador', 'balanza', 'centrifuga', 'microscopio', 'autoclave'].includes(tipo)) return 'farmacia'
    if (tipo === 'bascula') return 'consulta'
    if (['camilla', 'electrocardiografo', 'ecografo', 'rayos-x', 'generico'].includes(tipo)) return 'procedimientos'
    return 'quimioterapia'
  },
}

export const PLANOS: Record<PlanoId, DefPlano> = { general: GENERAL, oncologia: ONCOLOGIA }

/** Plano que corresponde a un consultorio según su especialidad. */
export function planoPara(especialidad?: string): PlanoId {
  return especialidad && /oncolog/i.test(especialidad) ? 'oncologia' : 'general'
}

/** Lugares a los que se puede ir: la vista aérea y una vista de cada zona (alta y mirando hacia abajo). */
export function puntosDe(plano: DefPlano): DefPunto[] {
  return [
    { id: 'general', nombre: 'Vista general', descripcion: 'Todo el consultorio desde arriba', ...plano.general },
    ...plano.zonas.map((z) => {
      const cx = (z.x0 + z.x1) / 2
      const cz = (z.z0 + z.z1) / 2
      const f = Math.max((z.x1 - z.x0) / 8, (z.z1 - z.z0) / 5.6)
      return {
        id: z.id,
        nombre: z.nombre,
        descripcion: z.descripcion,
        ojo: z.ojo ?? ([cx, 0.2 + 7 * f, cz + 4.4 * f] as V3),
        mira: z.mira ?? ([cx, 0.2, cz] as V3),
        marcador: z.marcador,
      }
    }),
  ]
}

const ANCHO: Partial<Record<TipoModelo, number>> = {
  'unidad-odontologica': 2.5,
  'rayos-x': 1.9,
  camilla: 1.5,
  ecografo: 1.2,
  compresor: 1.2,
  'cabina-bioseguridad': 1.5,
  refrigerador: 0.8,
  desfibrilador: 0.8,
  'bomba-infusion': 0.6,
}

export interface Colocado {
  equipo: EquipoSala
  zona: string
  pos: V3
  /** Giro del equipo sobre el piso (radianes). */
  rot: number
}

/**
 * Ubica cada equipo en la zona que le corresponde. Si la zona tiene puestos (por ejemplo, al lado de
 * cada sillón), usa primero el puesto libre que acepte ese tipo; si no queda ninguno, lo reparte por
 * filas dentro de la zona (hasta tres filas; después vuelve a empezar desplazado).
 */
export function colocarEquipos(equipos: EquipoSala[], plano: DefPlano): Colocado[] {
  const cursores = new Map<string, { x: number; fila: number }>()
  const ocupados = new Set<Puesto>()
  return equipos.map((equipo) => {
    const idZona = plano.zonaDe(equipo.tipo)
    const zona = plano.zonas.find((z) => z.id === idZona) ?? plano.zonas[0]
    const libres = (zona.puestos ?? []).filter((p) => !ocupados.has(p))
    const puesto = libres.find((p) => p.tipos?.includes(equipo.tipo)) ?? libres.find((p) => !p.tipos)
    if (puesto) {
      ocupados.add(puesto)
      return { equipo, zona: zona.id, pos: [puesto.x, 0, puesto.z], rot: puesto.rot ?? 0 }
    }
    const c = cursores.get(zona.id) ?? { x: zona.x0 + 1, fila: 0 }
    const ancho = ANCHO[equipo.tipo] ?? 1.1
    if (c.x + ancho > zona.x1 - 0.6) {
      c.x = zona.x0 + 1
      c.fila += 1
    }
    const z = zona.z0 + 1.7 + (c.fila % 3) * 1.65
    const x = c.x + ancho / 2 + (c.fila >= 3 ? 0.5 : 0)
    c.x += ancho + 0.55
    cursores.set(zona.id, c)
    return { equipo, zona: zona.id, pos: [x, 0, z], rot: 0 }
  })
}

export interface AnclasEquipo {
  /** Punto al costado del equipo, para la nota al lado (pantallas anchas). */
  lateral: V3
  /** Punto sobre el equipo, para la nota arriba (celulares). */
  arriba: V3
  /** Altura total del equipo (con su mesa), para encuadrarlo. */
  alto: number
}

/** Puntos donde se ancla la nota flotante de un equipo. */
export function anclasDeEquipo(c: Colocado): AnclasEquipo {
  const def = MODELOS[c.equipo.tipo]
  const base = def.enMesa ? 0.8 : 0
  const semiancho = (ANCHO[c.equipo.tipo] ?? 1.1) * 0.4 + 0.1
  return {
    lateral: [c.pos[0] + semiancho, base + def.altura * 0.6, c.pos[2]],
    arriba: [c.pos[0], base + def.altura + 0.12, c.pos[2]],
    alto: base + def.altura,
  }
}

/** Pantalla táctil angosta: se baja la resolución de sombras y de dibujo para que el 3D vaya fluido. */
export function esMovil(): boolean {
  try {
    return window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
  } catch {
    return false
  }
}
