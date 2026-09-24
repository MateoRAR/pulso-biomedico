// Datos de ejemplo de Pulso Biomédico, aterrizados al contexto colombiano:
// Resolución 1732 de 2026, REPS, INVIMA/COPNIA, red en Cali y área metropolitana.

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
  zonas: string[]
  especialidades: string[]
  equipos: string[]
  calificacion: number
  servicios: number
  experiencia: number
  verificado: boolean
  estadoVerificacion: 'Pendiente' | 'En revisión' | 'Verificado' | 'Rechazado'
  registroInvima: string
  tarjetaCopnia: string
  resena: string
  opiniones: Opinion[]
  certificaciones: { nombre: string; entidad: string; vigencia: string }[]
  segmento: 'B1' | 'B2' | 'B3'
  disponible: boolean
}

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
}

export interface Metricas {
  conversionRegistroContratacion: number
  cacPromedioCOP: number
  diasRegistroPrimeraVisita: number
  renovacionAnual: number
  consultoriosActivos: number
  ingenierosActivos: number
  serviciosMes: number
  coberturaZonas: number
}

// -- catálogos -----------------------------------------------------------------

export const ciudades = ['Santiago de Cali', 'Yumbo', 'Palmira', 'Bogotá D.C.', 'Medellín']

export const zonasCali = ['Sur', 'Norte', 'Centro', 'Oeste', 'Este']

export const especialidades = [
  'Odontología',
  'Laboratorio clínico',
  'Imágenes diagnósticas',
  'Consulta externa',
  'Rehabilitación',
  'Estética y dermatología',
]

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

// -- utilidades de fecha -------------------------------------------------------

function iso(diasDesdeHoy: number): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + diasDesdeHoy)
  return fecha.toISOString().slice(0, 10)
}

// -- semilla -------------------------------------------------------------------

export const CONSULTORIO_SEED: Consultorio = {
  id: 'con-1',
  nombre: 'Clínica Odontológica Sanare',
  nit: '901.458.772-3',
  tipo: 'Prestador ambulatorio de baja complejidad',
  segmento: 'A2',
  ciudad: 'Santiago de Cali',
  direccion: 'Calle 5 # 38-25, barrio San Fernando',
  zona: 'Sur',
  sedes: 2,
  empleados: 9,
  contacto: 'Diana Ramírez',
  cargoContacto: 'Administradora',
  telefono: '318 265 9719',
  email: 'consultorio@pulso.co',
  planId: 'basico',
  codigoHabilitacion: '760010012345',
}

export const EQUIPOS_SEED: Equipo[] = [
  {
    id: 'eq-1',
    consultorioId: 'con-1',
    nombre: 'Unidad odontológica completa',
    tipo: 'Odontología',
    marca: 'Dentsply Sirona',
    modelo: 'Intego',
    serie: 'INT-2291-COL',
    sede: 'Sede San Fernando',
    criticidad: 'Crítica',
    estado: 'Operativo',
    registroSanitario: 'INVIMA 2019DM-0019876',
    proximoMantenimiento: iso(21),
    proximaCalibracion: iso(140),
    responsable: 'Dra. Paula Ospina',
  },
  {
    id: 'eq-2',
    consultorioId: 'con-1',
    nombre: 'Autoclave de mesa 23 L',
    tipo: 'Esterilización',
    marca: 'Tuttnauer',
    modelo: '3870M',
    serie: 'TT-77421',
    sede: 'Sede San Fernando',
    criticidad: 'Alta',
    estado: 'Requiere calibración',
    registroSanitario: 'INVIMA 2020DM-0022331',
    proximoMantenimiento: iso(9),
    proximaCalibracion: iso(12),
    responsable: 'Diana Ramírez',
  },
  {
    id: 'eq-3',
    consultorioId: 'con-1',
    nombre: 'Equipo de rayos X periapical',
    tipo: 'Imágenes diagnósticas',
    marca: 'Carestream',
    modelo: 'CS 2100',
    serie: 'CR-55219',
    sede: 'Sede San Fernando',
    criticidad: 'Alta',
    estado: 'Operativo',
    registroSanitario: 'INVIMA 2018DM-0014509',
    proximoMantenimiento: iso(48),
    proximaCalibracion: iso(48),
    responsable: 'Dra. Paula Ospina',
  },
  {
    id: 'eq-4',
    consultorioId: 'con-1',
    nombre: 'Monitor de signos vitales',
    tipo: 'Consulta externa',
    marca: 'Mindray',
    modelo: 'uMEC 12',
    serie: 'MD-33214',
    sede: 'Sede Granada',
    criticidad: 'Media',
    estado: 'Operativo',
    registroSanitario: 'INVIMA 2021DM-0025600',
    proximoMantenimiento: iso(96),
    proximaCalibracion: iso(96),
    responsable: 'Enfermería',
  },
  {
    id: 'eq-5',
    consultorioId: 'con-1',
    nombre: 'Báscula digital con tallímetro',
    tipo: 'Consulta externa',
    marca: 'Seca',
    modelo: '799',
    serie: 'SC-11842',
    sede: 'Sede Granada',
    criticidad: 'Programada',
    estado: 'Operativo',
    registroSanitario: 'INVIMA 2017DM-0011233',
    proximoMantenimiento: iso(150),
    proximaCalibracion: iso(150),
    responsable: 'Enfermería',
  },
  {
    id: 'eq-6',
    consultorioId: 'con-1',
    nombre: 'Compresor de aire dental',
    tipo: 'Odontología',
    marca: 'Air Techniques',
    modelo: 'AirStar',
    serie: 'AT-90871',
    sede: 'Sede San Fernando',
    criticidad: 'Media',
    estado: 'En mantenimiento',
    registroSanitario: 'No aplica',
    proximoMantenimiento: iso(3),
    proximaCalibracion: iso(180),
    responsable: 'Dra. Paula Ospina',
  },
]

export const INGENIEROS_SEED: Ingeniero[] = [
  {
    id: 'ing-1',
    slug: 'laura-medina',
    nombre: 'Laura Medina',
    titulo: 'Ingeniera biomédica · Equipos odontológicos y esterilización',
    ciudad: 'Santiago de Cali',
    zonas: ['Sur', 'Centro', 'Oeste'],
    especialidades: ['Odontología', 'Esterilización'],
    equipos: ['Unidad odontológica', 'Autoclave', 'Compresor dental', 'Lámpara de fotocurado'],
    calificacion: 4.9,
    servicios: 128,
    experiencia: 7,
    verificado: true,
    estadoVerificacion: 'Verificado',
    registroInvima: 'INVIMA-ING-2026-04417',
    tarjetaCopnia: 'COPNIA 05123-274918 CAL',
    resena:
      'Ingeniera biomédica con énfasis en equipos odontológicos y ciclos de esterilización. Acompaña a consultorios pequeños en la organización de su cronograma de mantenimiento y calibración.',
    opiniones: [
      {
        autor: 'Clínica Odontológica Sanare',
        calificacion: 5,
        texto: 'Dejó el autoclave calibrado y explicó al personal cómo registrar el ciclo. La documentación llegó lista para la auditoría.',
        fecha: iso(-40),
      },
      {
        autor: 'Consultorio Dental Alameda',
        calificacion: 4.8,
        texto: 'Muy puntual y ordenada. Agrupó tres consultorios de la misma zona en una sola jornada.',
        fecha: iso(-72),
      },
    ],
    certificaciones: [
      { nombre: 'Mantenimiento de equipos odontológicos', entidad: 'ACIB · Asoc. Colombiana de Ing. Biomédica', vigencia: '2027-03' },
      { nombre: 'Calibración de autoclaves', entidad: 'Laboratorio acreditado ONAC', vigencia: '2026-11' },
    ],
    segmento: 'B1',
    disponible: true,
  },
  {
    id: 'ing-2',
    slug: 'andres-bueno',
    nombre: 'Andrés Bueno',
    titulo: 'Ingeniero biomédico · Imágenes diagnósticas',
    ciudad: 'Santiago de Cali',
    zonas: ['Sur', 'Este'],
    especialidades: ['Imágenes diagnósticas'],
    equipos: ['Rayos X', 'Ecógrafo', 'Reveladora', 'Densitómetro'],
    calificacion: 4.7,
    servicios: 86,
    experiencia: 5,
    verificado: true,
    estadoVerificacion: 'Verificado',
    registroInvima: 'INVIMA-ING-2026-03982',
    tarjetaCopnia: 'COPNIA 05123-274102 CAL',
    resena:
      'Especialista en rayos X odontológico y control de calidad de imagen. Trabaja con laboratorios acreditados ONAC para las calibraciones que lo requieren.',
    opiniones: [
      {
        autor: 'Centro Radiográfico Tequendama',
        calificacion: 4.7,
        texto: 'Control de calidad completo y acta clara para el registro sanitario.',
        fecha: iso(-30),
      },
    ],
    certificaciones: [
      { nombre: 'Protección radiológica', entidad: 'Secretaría de Salud del Valle', vigencia: '2027-01' },
      { nombre: 'Control de calidad en radiología', entidad: 'ACIB', vigencia: '2026-12' },
    ],
    segmento: 'B1',
    disponible: true,
  },
  {
    id: 'ing-3',
    slug: 'carolina-restrepo',
    nombre: 'Carolina Restrepo',
    titulo: 'Ingeniera biomédica · Laboratorio clínico',
    ciudad: 'Yumbo',
    zonas: ['Norte', 'Centro', 'Yumbo'],
    especialidades: ['Laboratorio clínico'],
    equipos: ['Centrífuga', 'Incubadora', 'Microscopio', 'Analizador de química'],
    calificacion: 4.8,
    servicios: 54,
    experiencia: 4,
    verificado: true,
    estadoVerificacion: 'Verificado',
    registroInvima: 'INVIMA-ING-2026-04551',
    tarjetaCopnia: 'COPNIA 05123-275033 VAL',
    resena:
      'Enfocada en laboratorios de toma de muestras y centros de diagnóstico básico. Organiza hojas de vida de equipos y verifica patrones trazables.',
    opiniones: [],
    certificaciones: [
      { nombre: 'Metrología aplicada a laboratorios', entidad: 'ONAC · curso avalado', vigencia: '2027-06' },
    ],
    segmento: 'B1',
    disponible: true,
  },
  {
    id: 'ing-4',
    slug: 'juan-camilo-melo',
    nombre: 'Juan Camilo Melo',
    titulo: 'Ingeniero biomédico · Rehabilitación y consulta externa',
    ciudad: 'Palmira',
    zonas: ['Sur', 'Palmira'],
    especialidades: ['Rehabilitación', 'Consulta externa'],
    equipos: ['Equipo de terapia física', 'Monitor de signos vitales', 'Electroestimulador', 'Báscula'],
    calificacion: 4.6,
    servicios: 41,
    experiencia: 3,
    verificado: true,
    estadoVerificacion: 'Verificado',
    registroInvima: 'INVIMA-ING-2026-04710',
    tarjetaCopnia: 'COPNIA 05123-275998 VAL',
    resena:
      'Acompaña unidades de rehabilitación y consulta externa. Ofrece capacitación breve al personal administrativo en cada visita.',
    opiniones: [
      {
        autor: 'Centro de Rehabilitación Vital',
        calificacion: 4.6,
        texto: 'Buena explicación al personal sobre el cuidado preventivo de los equipos.',
        fecha: iso(-15),
      },
    ],
    certificaciones: [
      { nombre: 'Seguridad eléctrica en equipos médicos', entidad: 'ACIB', vigencia: '2027-02' },
    ],
    segmento: 'B1',
    disponible: true,
  },
  {
    id: 'ing-5',
    slug: 'sofia-ortiz',
    nombre: 'Sofía Ortiz',
    titulo: 'Ingeniera biomédica en etapa inicial',
    ciudad: 'Santiago de Cali',
    zonas: ['Norte', 'Centro'],
    especialidades: ['Odontología'],
    equipos: ['Unidad odontológica', 'Lámpara de fotocurado'],
    calificacion: 4.5,
    servicios: 12,
    experiencia: 1,
    verificado: false,
    estadoVerificacion: 'En revisión',
    registroInvima: 'En trámite',
    tarjetaCopnia: 'COPNIA 05123-276441 CAL',
    resena:
      'Profesional en etapa inicial que realiza diagnósticos de dotación e inventarios bajo supervisión, y acompaña visitas de capacitación.',
    opiniones: [],
    certificaciones: [
      { nombre: 'Inventario y hoja de vida de equipos', entidad: 'Programa universitario', vigencia: '2026-12' },
    ],
    segmento: 'B2',
    disponible: true,
  },
]

export const PLANES_SEED: Plan[] = [
  {
    id: 'basico',
    nombre: 'Plan Básico',
    precioCOP: 249000,
    periodo: '/ mes',
    rangoEquipos: 'Consultorios y prestadores pequeños',
    segmento: 'Única cuota mensual',
    resumen:
      'La logística de ordenamiento y las funciones de seguimiento que nos competen: tú acuerdas el mantenimiento con el ingeniero y nosotros coordinamos el resto.',
    incluye: [
      'Inventario digital y hoja de vida por equipo',
      'Cronograma anual y rutas por zona',
      'Semáforo de habilitación con alertas de vencimiento',
      'Recordatorios y confirmación de cada visita por correo',
      'Expediente documental auditable generado automáticamente',
      'Soporte y gestión de garantías',
    ],
    destacado: true,
  },
  {
    id: 'custom',
    nombre: 'Plan Custom',
    precioCOP: 0,
    precioTexto: 'A convenir',
    periodo: '',
    rangoEquipos: 'Organizaciones con varias sedes o mayor dotación',
    segmento: 'Condiciones acordadas con el equipo',
    resumen:
      'Para organizaciones más grandes: cobertura de varias sedes, SLA propios y reportes, con condiciones acordadas caso a caso.',
    incluye: [
      'Todo lo del Plan Básico',
      'Cobertura para múltiples sedes',
      'SLA y condiciones a convenir',
      'Informe de indicadores de cumplimiento',
      'Acompañamiento dedicado',
    ],
  },
]

export const COMPARATIVO = [
  { caracteristica: 'Inventario y hojas de vida digital', valores: ['Sí', 'Sí'] },
  { caracteristica: 'Cronograma y rutas por zona', valores: ['Sí', 'Sí'] },
  { caracteristica: 'Semáforo de habilitación y alertas', valores: ['Sí', 'Sí'] },
  { caracteristica: 'Expediente documental auditable', valores: ['Sí', 'Sí'] },
  { caracteristica: 'Cobertura de múltiples sedes', valores: ['No', 'Sí'] },
  { caracteristica: 'SLA y condiciones a medida', valores: ['No', 'Sí'] },
  { caracteristica: 'Informe de indicadores', valores: ['No', 'Sí'] },
]

export const SERVICIOS_SEED: Servicio[] = [
  {
    id: 'ser-1',
    consultorioId: 'con-1',
    equipoId: 'eq-2',
    ingenieroId: 'ing-1',
    tipo: 'Calibración',
    criticidad: 'Alta',
    estado: 'Confirmada',
    fecha: iso(4),
    franja: '08:00 - 10:00',
    zona: 'Sur',
    descripcion: 'Calibración de ciclo de esterilización y verificación de indicadores biológicos.',
    evidencia: [],
    creado: iso(-3),
    historial: [
      { estado: 'Programada', fecha: iso(-3) },
      { estado: 'Asignada', fecha: iso(-2) },
      { estado: 'Confirmada', fecha: iso(-1) },
    ],
  },
  {
    id: 'ser-2',
    consultorioId: 'con-1',
    equipoId: 'eq-6',
    ingenieroId: 'ing-1',
    tipo: 'Correctivo',
    criticidad: 'Media',
    estado: 'En ejecución',
    fecha: iso(0),
    franja: '14:00 - 16:00',
    zona: 'Sur',
    descripcion: 'El compresor dental pierde presión; revisar válvula y acople.',
    evidencia: ['Foto del manómetro'],
    creado: iso(-1),
    historial: [
      { estado: 'Programada', fecha: iso(-1) },
      { estado: 'Asignada', fecha: iso(-1) },
      { estado: 'En ejecución', fecha: iso(0) },
    ],
  },
  {
    id: 'ser-3',
    consultorioId: 'con-1',
    equipoId: 'eq-1',
    ingenieroId: 'ing-4',
    tipo: 'Preventivo',
    criticidad: 'Programada',
    estado: 'Programada',
    fecha: iso(21),
    franja: '10:00 - 12:00',
    zona: 'Sur',
    descripcion: 'Mantenimiento preventivo de unidad odontológica (según cronograma).',
    evidencia: [],
    creado: iso(-20),
    historial: [{ estado: 'Programada', fecha: iso(-20) }],
  },
  {
    id: 'ser-4',
    consultorioId: 'con-1',
    equipoId: 'eq-3',
    ingenieroId: 'ing-2',
    tipo: 'Preventivo',
    criticidad: 'Alta',
    estado: 'Ejecutada',
    fecha: iso(-12),
    franja: '08:00 - 10:00',
    zona: 'Sur',
    descripcion: 'Mantenimiento preventivo y control de calidad de rayos X periapical.',
    evidencia: ['Informe firmado', 'Medición de kVp'],
    garantiaHasta: iso(78),
    creado: iso(-30),
    historial: [
      { estado: 'Programada', fecha: iso(-30) },
      { estado: 'Ejecutada', fecha: iso(-12) },
    ],
  },
  {
    id: 'ser-5',
    consultorioId: 'con-1',
    equipoId: 'eq-4',
    ingenieroId: 'ing-3',
    tipo: 'Calibración',
    criticidad: 'Media',
    estado: 'Cerrada',
    fecha: iso(-35),
    franja: '14:00 - 16:00',
    zona: 'Centro',
    descripcion: 'Calibración de monitor de signos vitales.',
    evidencia: ['Certificado ONAC'],
    garantiaHasta: iso(55),
    creado: iso(-50),
    historial: [
      { estado: 'Programada', fecha: iso(-50) },
      { estado: 'Ejecutada', fecha: iso(-35) },
      { estado: 'Cerrada', fecha: iso(-34) },
    ],
  },
  {
    id: 'ser-6',
    consultorioId: 'con-1',
    equipoId: 'eq-5',
    ingenieroId: null,
    tipo: 'Diagnóstico exprés',
    criticidad: 'Media',
    estado: 'Programada',
    fecha: iso(2),
    franja: '16:00 - 17:00',
    zona: 'Centro',
    descripcion: 'Visita corta para evaluar si la báscula amerita reparación.',
    evidencia: [],
    creado: iso(0),
    historial: [{ estado: 'Programada', fecha: iso(0) }],
  },
]

export const DOCUMENTOS_SEED: Documento[] = [
  { id: 'doc-1', equipoId: 'eq-3', tipo: 'Informe de mantenimiento', nombre: 'Informe preventivo rayos X — sep 2026', fecha: iso(-12), vigencia: iso(353) },
  { id: 'doc-2', equipoId: 'eq-4', tipo: 'Certificado de calibración', nombre: 'Certificado de calibración monitor uMEC 12', fecha: iso(-35), vigencia: iso(330), laboratorio: 'Lab. Metrológico Andino (ONAC)' },
  { id: 'doc-3', equipoId: 'eq-2', tipo: 'Certificado de calibración', nombre: 'Calibración autoclave 3870M — mar 2026', fecha: iso(-190), vigencia: iso(-10), laboratorio: 'Lab. Metrológico Andino (ONAC)' },
  { id: 'doc-4', equipoId: 'eq-1', tipo: 'Hoja de vida', nombre: 'Hoja de vida unidad odontológica Intego', fecha: iso(-200), vigencia: '' },
  { id: 'doc-5', equipoId: 'eq-3', tipo: 'Registro sanitario', nombre: 'Registro sanitario Carestream CS 2100', fecha: iso(-400), vigencia: iso(900) },
]

export const CALIFICACIONES_SEED: Calificacion[] = [
  {
    id: 'cal-1',
    servicioId: 'ser-5',
    ingenieroId: 'ing-3',
    autor: 'Clínica Odontológica Sanare',
    estrellas: 5,
    comentario: 'Calibración impecable y certificado entregado el mismo día.',
    fecha: iso(-34),
  },
]

export const RECLAMOS_SEED: Reclamo[] = []

export const REPUESTOS_SEED: PedidoRepuesto[] = [
  {
    id: 'rep-1',
    equipoId: 'eq-6',
    consultorioId: 'con-1',
    repuesto: 'Kit de válvula reguladora de presión',
    distribuidor: 'Dental Supply Colombia (distribuidor autorizado)',
    estado: 'En tránsito',
    precio: 185000,
    fecha: iso(-1),
  },
]

export const ALIADOS_SEED: Aliado[] = [
  {
    id: 'ali-1',
    tipo: 'Habilitante',
    nombre: 'Lab. Metrológico Andino (acreditado ONAC)',
    aporta: 'Patrones trazables y certificados con validez ante el ente verificador.',
    recibe: 'Flujo agregado y programado de trabajo.',
    acuerdo: 'Convenio marco con tarifas por volumen.',
  },
  {
    id: 'ali-2',
    tipo: 'Habilitante',
    nombre: 'Firma electrónica Andina',
    aporta: 'Validez jurídica de los certificados e informes.',
    recibe: 'Suscripción mensual.',
    acuerdo: 'Contrato de suministro.',
  },
  {
    id: 'ali-3',
    tipo: 'Acceso al mercado',
    nombre: 'Asesoría en Habilitación Valle',
    aporta: 'Consultorios en el momento de máxima urgencia normativa.',
    recibe: 'Solución a un requisito que su servicio no cubre.',
    acuerdo: 'Alianza de referenciación cruzada.',
  },
  {
    id: 'ali-4',
    tipo: 'Acceso al mercado',
    nombre: 'Distribuidora Dental del Pacífico',
    aporta: 'Acceso comercial y referenciación de prestadores.',
    recibe: 'Comisión por cliente convertido.',
    acuerdo: 'Acuerdo de referenciación con comisión sobre el primer ciclo.',
  },
  {
    id: 'ali-5',
    tipo: 'Sostenibilidad de la oferta',
    nombre: 'Programa de Ingeniería Biomédica — Universidad Icesi',
    aporta: 'Flujo continuo de talento y respaldo académico a los protocolos.',
    recibe: 'Escenarios de práctica y vinculación para egresados.',
    acuerdo: 'Convenio de práctica.',
  },
]

export const NOTIFICACIONES_SEED: Notificacion[] = [
  { id: 'not-1', para: 'consultorio', tipo: 'Visita', mensaje: 'Visita de calibración del autoclave confirmada para el ' + iso(4) + ' a las 08:00.', fecha: iso(-1), leida: false },
  { id: 'not-2', para: 'consultorio', tipo: 'Vencimiento', mensaje: 'La calibración del autoclave venció hace 10 días. Agenda la visita para evitar hallazgos.', fecha: iso(-2), leida: false },
  { id: 'not-3', para: 'consultorio', tipo: 'Certificado', mensaje: 'Certificado de calibración del monitor uMEC 12 disponible en tu expediente.', fecha: iso(-34), leida: true },
  { id: 'not-4', para: 'ingeniero', tipo: 'Visita', mensaje: 'Nueva solicitud asignada: correctivo de compresor dental (Sur, Cali).', fecha: iso(-1), leida: false },
  { id: 'not-5', para: 'ingeniero', tipo: 'Sistema', mensaje: 'Tu registro INVIMA sigue vigente. Próxima renovación: mar 2027.', fecha: iso(-5), leida: true },
]

export const METRICAS_SEED: Metricas = {
  conversionRegistroContratacion: 34,
  cacPromedioCOP: 96000,
  diasRegistroPrimeraVisita: 6,
  renovacionAnual: 82,
  consultoriosActivos: 112,
  ingenierosActivos: 11,
  serviciosMes: 268,
  coberturaZonas: 5,
}
