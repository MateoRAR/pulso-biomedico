import ciudadesJson from '@/data/ciudades.json'
import type { Consultorio, Equipo, IngenieroRegistro, Notificacion, Servicio, Usuario } from '@/data/tipos'

/** Utilidades para crear registros nuevos: cuentas, consultorios, ingenieros y datos de ejemplo. */

export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function enDias(dias: number): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

function slugify(texto: string): string {
  return (
    texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'ingeniero'
  )
}

/** Id corto y único con prefijo, p. ej. "con-m3x9k2ab". Los de registro nunca chocan con los de los JSON. */
export function idNuevo(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 4)}`
}

export function crearNotificacion(
  para: Notificacion['para'],
  tipo: Notificacion['tipo'],
  mensaje: string,
  refId?: string,
  minutosAtras = 0,
): Notificacion {
  return {
    id: `not-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    para,
    tipo,
    mensaje,
    refId,
    fecha: new Date(Date.now() - minutosAtras * 60_000).toISOString(),
    leida: false,
  }
}

export interface DatosRegistro {
  rol: 'consultorio' | 'ingeniero'
  nombre: string
  email: string
  password: string
  organizacion: string
  ciudad: string
  zona: string
  /** Consultorio: tipo de atención. Ingeniero: especialidades. */
  especialidades: string[]
  /** Consultorio: número de equipos estimado. Ingeniero: años de experiencia. */
  cifra: number
}

const DESPLAZAMIENTO_ZONA: Record<string, [number, number]> = {
  Sur: [-0.018, 0],
  Norte: [0.018, 0],
  Centro: [0, 0],
  Oeste: [0, -0.018],
  Este: [0, 0.018],
}

export function bienvenidaConsultorio(nombre: string, organizacion: string, consultorioId: string): Notificacion[] {
  const primero = nombre.split(' ')[0]
  return [
    crearNotificacion('consultorio', 'Sistema', `${primero}, tu espacio de ${organizacion} ya está listo. Empecemos por tus equipos.`, consultorioId, 1),
    crearNotificacion('consultorio', 'Sistema', 'Registra tus equipos o carga un inventario de ejemplo para ver el estado de tu dotación.', consultorioId, 1),
  ]
}

export function bienvenidaIngeniero(nombre: string, ingenieroId: string): Notificacion[] {
  const primero = nombre.split(' ')[0]
  return [
    crearNotificacion('ingeniero', 'Sistema', `${primero}, tu perfil ya existe. Sube tu tarjeta COPNIA e INVIMA para aparecer en la red.`, ingenieroId, 1),
    crearNotificacion('ingeniero', 'Visita', 'Revisa la cola: puede haber solicitudes abiertas cerca de ti.', ingenieroId, 1),
  ]
}

/** Registros que se crean al abrir una cuenta (el usuario y su consultorio o perfil de ingeniero). */
export function construirRegistro(datos: DatosRegistro): {
  usuario: Usuario
  consultorio?: Consultorio
  ingeniero?: IngenieroRegistro
  notificaciones: Notificacion[]
} {
  const ciudad = ciudadesJson.find((c) => c.nombre === datos.ciudad) ?? ciudadesJson[0]
  const email = datos.email.trim().toLowerCase()
  const base = {
    id: idNuevo('usr'),
    email,
    password: datos.password,
    nombre: datos.nombre,
    activo: true,
    origen: 'registro' as const,
    creado: hoyISO(),
  }

  if (datos.rol === 'consultorio') {
    const [dLat, dLng] = DESPLAZAMIENTO_ZONA[datos.zona] ?? [0, 0]
    const consultorio: Consultorio = {
      id: idNuevo('con'),
      nombre: datos.organizacion,
      nit: '',
      tipo: datos.especialidades[0] ? `Consultorio de ${datos.especialidades[0].toLowerCase()}` : 'Prestador ambulatorio de baja complejidad',
      segmento: datos.cifra > 15 ? 'A2' : 'A1',
      ciudad: ciudad.nombre,
      ciudadId: ciudad.id,
      direccion: '',
      zona: datos.zona,
      sedes: 1,
      empleados: 1,
      contacto: datos.nombre,
      cargoContacto: 'Responsable',
      telefono: '',
      email,
      planId: '',
      codigoHabilitacion: '',
      lat: ciudad.lat + dLat + (Math.random() - 0.5) * 0.006,
      lng: ciudad.lng + dLng + (Math.random() - 0.5) * 0.006,
      activo: true,
      creado: hoyISO(),
      especialidad: datos.especialidades[0],
    }
    return {
      usuario: { ...base, rol: 'consultorio', organizacion: consultorio.nombre, consultorioId: consultorio.id },
      consultorio,
      notificaciones: bienvenidaConsultorio(datos.nombre, consultorio.nombre, consultorio.id),
    }
  }

  const ingeniero: IngenieroRegistro = {
    id: idNuevo('ing'),
    slug: `${slugify(datos.nombre)}-${Date.now().toString(36).slice(-4)}`,
    nombre: datos.nombre,
    titulo: `Ingeniero(a) biomédico(a) · ${datos.especialidades.join(', ') || 'Equipos de consultorio'}`,
    ciudad: ciudad.nombre,
    ciudadId: ciudad.id,
    especialidades: datos.especialidades,
    equipos: [],
    experiencia: datos.cifra,
    verificado: false,
    estadoVerificacion: 'Pendiente',
    registroInvima: 'Pendiente de carga',
    tarjetaCopnia: 'COPNIA en trámite',
    resena: '',
    certificaciones: [],
    segmento: 'B1',
    disponible: true,
    activo: true,
  }
  return {
    usuario: { ...base, rol: 'ingeniero', organizacion: ciudad.nombre, ingenieroId: ingeniero.id },
    ingeniero,
    notificaciones: bienvenidaIngeniero(datos.nombre, ingeniero.id),
  }
}

// -- inventario de ejemplo para un consultorio nuevo ------------------------------

const PLANTILLAS_EQUIPOS: Omit<Equipo, 'id' | 'consultorioId' | 'proximoMantenimiento' | 'proximaCalibracion'>[] = [
  { nombre: 'Unidad odontológica completa', tipo: 'Odontología', marca: 'Dentsply Sirona', modelo: 'Intego', serie: 'INT-', sede: 'Sede principal', criticidad: 'Crítica', estado: 'Operativo', registroSanitario: 'Por registrar', responsable: 'Odontología' },
  { nombre: 'Autoclave de mesa', tipo: 'Esterilización', marca: 'Tuttnauer', modelo: '3870M', serie: 'TT-', sede: 'Sede principal', criticidad: 'Alta', estado: 'Requiere calibración', registroSanitario: 'Por registrar', responsable: 'Auxiliar' },
  { nombre: 'Equipo de rayos X periapical', tipo: 'Imágenes diagnósticas', marca: 'Carestream', modelo: 'CS 2100', serie: 'CR-', sede: 'Sede principal', criticidad: 'Alta', estado: 'Operativo', registroSanitario: 'Por registrar', responsable: 'Odontología' },
  { nombre: 'Monitor de signos vitales', tipo: 'Consulta externa', marca: 'Mindray', modelo: 'uMEC 12', serie: 'MD-', sede: 'Sede principal', criticidad: 'Media', estado: 'Operativo', registroSanitario: 'Por registrar', responsable: 'Enfermería' },
  { nombre: 'Compresor de aire dental', tipo: 'Odontología', marca: 'Air Techniques', modelo: 'AirStar', serie: 'AT-', sede: 'Sede principal', criticidad: 'Media', estado: 'Operativo', registroSanitario: 'Por registrar', responsable: 'Mantenimiento' },
]
const DIAS_MANT = [28, 9, 52, 96, 14]
const DIAS_CAL = [140, -6, 52, 96, 180]

/** Cinco equipos típicos, con vencimientos variados para que el estado de la dotación tenga qué mostrar. */
export function inventarioEjemplo(consultorioId: string): Equipo[] {
  const sufijo = Date.now().toString(36).toUpperCase()
  return PLANTILLAS_EQUIPOS.map((plantilla, i) => ({
    ...plantilla,
    id: `eq-${Date.now().toString(36)}-${i}`,
    consultorioId,
    serie: `${plantilla.serie}${sufijo}${i}`,
    proximoMantenimiento: enDias(DIAS_MANT[i]),
    proximaCalibracion: enDias(DIAS_CAL[i]),
  }))
}

// -- solicitudes entrantes simuladas para ingenieros -------------------------------

const NOVEDADES: { tipo: Servicio['tipo']; criticidad: Servicio['criticidad']; texto: string }[] = [
  { tipo: 'Correctivo', criticidad: 'Alta', texto: 'El equipo se apaga a mitad del ciclo; sospechan de la fuente de poder.' },
  { tipo: 'Calibración', criticidad: 'Media', texto: 'Necesitan un certificado de calibración vigente antes de la visita de habilitación.' },
  { tipo: 'Preventivo', criticidad: 'Programada', texto: 'Mantenimiento preventivo del cronograma anual.' },
  { tipo: 'Correctivo', criticidad: 'Crítica', texto: 'Equipo fuera de servicio: no pueden atender pacientes hasta repararlo.' },
  { tipo: 'Diagnóstico exprés', criticidad: 'Media', texto: 'Quieren una revisión rápida del estado general de la dotación.' },
]

/** Una solicitud nueva de un consultorio de la misma ciudad (o `undefined` si no hay ninguno con equipos). */
export function solicitudEntrante(consultorio: Consultorio, equipos: Equipo[], indice: number): Servicio | undefined {
  const equipo = equipos[indice % Math.max(equipos.length, 1)]
  if (!equipo) return undefined
  const hoy = hoyISO()
  const novedad = NOVEDADES[indice % NOVEDADES.length]
  return {
    id: `ser-sim-${Date.now()}`,
    consultorioId: consultorio.id,
    equipoId: equipo.id,
    ingenieroId: null,
    tipo: novedad.tipo,
    criticidad: novedad.criticidad,
    estado: 'Programada',
    fecha: enDias(novedad.criticidad === 'Crítica' ? 1 : novedad.criticidad === 'Alta' ? 2 : 6),
    franja: indice % 2 ? '14:00 - 16:00' : '08:00 - 10:00',
    zona: consultorio.zona,
    descripcion: novedad.texto,
    evidencia: [],
    creado: hoy,
    historial: [{ estado: 'Programada', fecha: hoy }],
  }
}
