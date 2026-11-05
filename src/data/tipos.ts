// Tipos y catálogos de Pulso Biomédico. Los datos viven en `src/data/*.json` y se consultan
// mediante los servicios de `src/services` (INVIMA/COPNIA, red en Cali y otras ciudades).

import ciudadesJson from './ciudades.json'
import especialidadesJson from './especialidades.json'

export type Rol = 'consultorio' | 'ingeniero' | 'admin'

export type Criticidad = 'Crítica' | 'Alta' | 'Media' | 'Programada'
export type Semaforo = 'verde' | 'amarillo' | 'rojo'
export type EstadoEquipo = 'Operativo' | 'En mantenimiento' | 'Fuera de servicio' | 'Requiere calibración'
export type EstadoServicio =
  | 'Programada'
  | 'Asignada'
  | 'Confirmada'
  | 'En ejecución'
  | 'Ejecutada'
  | 'Cerrada'
  | 'Cancelada'

export interface Consultorio {
  id: string
  nombre: string
  nit: string
  tipo: string
  segmento: 'A1' | 'A2'
  ciudad: string
  direccion: string
  zona: string
  sedes: number
  empleados: number
  contacto: string
  cargoContacto: string
  telefono: string
  email: string
  planId: string
  codigoHabilitacion: string
  ciudadId: string
  lat: number
  lng: number
  activo: boolean
  creado: string
  especialidad?: string
}

export interface Ciudad {
  id: string
  nombre: string
  corto: string
  lat: number
  lng: number
  zoom: number
}

export interface Usuario {
  id: string
  email: string
  /** Solo para la demostración: una base real guardaría un hash. */
  password: string
  nombre: string
  rol: Rol
  organizacion?: string
  consultorioId?: string
  ingenieroId?: string
  activo: boolean
  /** `demo` = viene de los JSON; `registro` = creada en esta sesión. */
  origen: 'demo' | 'registro'
  /** Cuenta de demostración publicada en la pantalla de ingreso (acceso rápido). */
  publica?: boolean
  creado: string
}

export interface Equipo {
  id: string
  consultorioId: string
  nombre: string
  tipo: string
  marca: string
  modelo: string
  serie: string
  sede: string
  criticidad: Criticidad
  estado: EstadoEquipo
  registroSanitario: string
  proximoMantenimiento: string
  proximaCalibracion: string
  responsable: string
}

export interface Opinion {
  autor: string
  calificacion: number
  texto: string
  fecha: string
}

export interface Ingeniero {
  id: string
  slug: string
  nombre: string
  titulo: string
  ciudad: string
  especialidades: string[]
  equipos: string[]
  /** Calculados desde las calificaciones y servicios registrados (no se guardan). */
  calificacion: number
  servicios: number
  experiencia: number
  verificado: boolean
  estadoVerificacion: 'Pendiente' | 'En revisión' | 'Verificado' | 'Rechazado'
  registroInvima: string
  tarjetaCopnia: string
  resena: string
  /** Calculadas desde las calificaciones registradas (no se guardan). */
  opiniones: Opinion[]
  certificaciones: { nombre: string; entidad: string; vigencia: string }[]
  segmento: 'B1' | 'B2' | 'B3'
  disponible: boolean
  ciudadId: string
  activo: boolean
  /** Perfil profesional público (opcional). */
  linkedin?: string
  /** Estudios (opcional). */
  formacion?: { titulo: string; institucion: string }[]
  /** Experiencia laboral, de la más reciente a la más antigua (opcional). */
  trayectoria?: { cargo: string; organizacion: string; periodo: string; lugar?: string; descripcion?: string }[]
}

/** Ingeniero tal como se guarda: puntaje, servicios y opiniones se calculan al leerlo. */
export type IngenieroRegistro = Omit<Ingeniero, 'calificacion' | 'servicios' | 'opiniones'>

export interface Servicio {
  id: string
  consultorioId: string
  equipoId: string
  ingenieroId: string | null
  tipo: 'Preventivo' | 'Calibración' | 'Correctivo' | 'Diagnóstico exprés' | 'Capacitación'
  criticidad: Criticidad
  estado: EstadoServicio
  fecha: string
  franja: string
  zona: string
  descripcion: string
  evidencia: string[]
  garantiaHasta?: string
  creado: string
  historial: { estado: EstadoServicio; fecha: string }[]
  capacitacion?: { tema: string; duracion: string; asistentes: number }
}

export interface Documento {
  id: string
  equipoId: string
  tipo: 'Certificado de calibración' | 'Informe de mantenimiento' | 'Registro sanitario' | 'Hoja de vida'
  nombre: string
  fecha: string
  vigencia: string
  laboratorio?: string
}

export interface Calificacion {
  id: string
  servicioId: string
  ingenieroId: string
  autor: string
  estrellas: number
  comentario: string
  fecha: string
}

export interface Reclamo {
  id: string
  servicioId: string
  consultorioId: string
  motivo: string
  estado: 'Radicado' | 'En revisión' | 'Resuelto'
  plazo: string
  resolucion: string
  fecha: string
}

export interface PedidoRepuesto {
  id: string
  equipoId: string
  consultorioId: string
  repuesto: string
  distribuidor: string
  estado: 'Solicitado' | 'Confirmado' | 'En tránsito' | 'Entregado'
  precio: number
  fecha: string
}

export interface Aliado {
  id: string
  tipo: 'Habilitante' | 'Acceso al mercado' | 'Sostenibilidad de la oferta'
  nombre: string
  aporta: string
  recibe: string
  acuerdo: string
}

export interface Notificacion {
  id: string
  para: Rol
  /** Id del consultorio o ingeniero destinatario (vacío = todo el rol). */
  refId?: string
  tipo: 'Visita' | 'Vencimiento' | 'Certificado' | 'Sistema'
  mensaje: string
  fecha: string
  leida: boolean
}

export interface Plan {
  id: string
  nombre: string
  precioCOP: number
  precioTexto?: string
  periodo: string
  rangoEquipos: string
  segmento: string
  resumen: string
  incluye: string[]
  destacado?: boolean
  /** Rango de equipos y sedes que cubre (null = sin tope). */
  minEquipos: number
  maxEquipos: number | null
  maxSedes: number | null
}

// -- catálogos -----------------------------------------------------------------

export const ciudades: string[] = ciudadesJson.map((c) => c.nombre)

export const zonasCali = ['Sur', 'Norte', 'Centro', 'Oeste', 'Este']

export const especialidades: string[] = especialidadesJson

export const SLA: Record<Criticidad, string> = {
  Crítica: 'Respuesta en 8 horas',
  Alta: 'Respuesta en 24 horas',
  Media: 'Respuesta en 72 horas',
  Programada: 'Fecha acordada',
}

export const NOMBRE_CRITICIDAD: Record<Criticidad, string> = {
  Crítica: 'Equipo fuera de servicio que detiene la atención',
  Alta: 'Falla que limita el uso o la exactitud del equipo',
  Media: 'Novedad que puede esperar la próxima visita programada',
  Programada: 'Mantenimiento o calibración del cronograma',
}

