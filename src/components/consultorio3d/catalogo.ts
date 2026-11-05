/**
 * Catálogo de equipos de la biblioteca 3D: nombres, descripciones y partes (sin nada de Three.js, para poder
 * usarlo en cualquier página sin cargar el 3D). La geometría vive en `modelos.tsx`.
 * Son representaciones ILUSTRATIVAS del tipo de equipo, no del modelo comercial exacto.
 */

export type TipoModelo =
  | 'unidad-odontologica'
  | 'autoclave'
  | 'rayos-x'
  | 'compresor'
  | 'monitor'
  | 'bascula'
  | 'centrifuga'
  | 'microscopio'
  | 'ecografo'
  | 'camilla'
  | 'balanza'
  | 'generico'

export interface ParteModelo {
  id: string
  nombre: string
  descripcion: string
  /** Posición del punto de interés sobre el modelo. */
  pos: [number, number, number]
}

export interface DefModelo {
  id: TipoModelo
  nombre: string
  resumen: string
  /** Se apoya sobre una mesa (en la sala se le pone una debajo). */
  enMesa: boolean
  /** Altura aproximada, para encuadrar la cámara. */
  altura: number
  partes: ParteModelo[]
}

// -- catálogo ---------------------------------------------------------------------

const AVISO = 'Descripción general de este tipo de equipo; el funcionamiento exacto depende de la marca y el modelo.'

export const MODELOS: Record<TipoModelo, DefModelo> = {
  autoclave: {
    id: 'autoclave', nombre: 'Autoclave', enMesa: true, altura: 0.45,
    resumen: 'Esteriliza instrumental con vapor a presión. Es un equipo clave para la seguridad de pacientes y personal. ' + AVISO,
    partes: [
      { id: 'camara', nombre: 'Cámara de esterilización', descripcion: 'Donde se colocan los instrumentos. El vapor a presión y la temperatura eliminan los microorganismos.', pos: [0, 0.2, 0.27] },
      { id: 'panel', nombre: 'Panel de control', descripcion: 'Permite elegir el ciclo y ver temperatura, presión y tiempo del proceso.', pos: [0, 0.37, 0.26] },
      { id: 'puerta', nombre: 'Puerta con cierre', descripcion: 'Sella la cámara durante el ciclo. Un sello en mal estado puede impedir que alcance la presión.', pos: [0.17, 0.33, 0.26] },
    ],
  },
  'unidad-odontologica': {
    id: 'unidad-odontologica', nombre: 'Unidad odontológica', enMesa: false, altura: 1.6,
    resumen: 'Sillón del paciente con lámpara y módulo de instrumentos para la atención odontológica. ' + AVISO,
    partes: [
      { id: 'sillon', nombre: 'Sillón del paciente', descripcion: 'Se reclina y sube o baja para que el odontólogo trabaje con comodidad.', pos: [0, 0.6, 0.1] },
      { id: 'lampara', nombre: 'Lámpara de luz', descripcion: 'Ilumina la boca del paciente sin generar sombras sobre la zona de trabajo.', pos: [-0.08, 1.46, -0.35] },
      { id: 'instrumentos', nombre: 'Módulo de instrumentos', descripcion: 'Reúne las piezas de mano (por ejemplo, turbina y micromotor) conectadas al aire comprimido y al agua.', pos: [0.62, 0.95, 0.15] },
    ],
  },
  'rayos-x': {
    id: 'rayos-x', nombre: 'Equipo de rayos X', enMesa: false, altura: 1.7,
    resumen: 'Genera la radiación para tomar radiografías. Requiere controles de seguridad radiológica. ' + AVISO,
    partes: [
      { id: 'cabezal', nombre: 'Cabezal emisor', descripcion: 'Contiene el tubo que produce los rayos X y apunta hacia la zona a radiografiar.', pos: [0.88, 1.5, 0] },
      { id: 'brazo', nombre: 'Brazo articulado', descripcion: 'Permite acomodar el cabezal en la posición correcta frente al paciente.', pos: [0.35, 1.5, 0] },
      { id: 'panel', nombre: 'Panel de exposición', descripcion: 'Donde se ajusta el tiempo de exposición según el tipo de toma.', pos: [0.1, 1.12, 0.1] },
    ],
  },
  compresor: {
    id: 'compresor', nombre: 'Compresor de aire', enMesa: false, altura: 0.9,
    resumen: 'Entrega aire comprimido a los equipos que lo necesitan, como la unidad odontológica. ' + AVISO,
    partes: [
      { id: 'tanque', nombre: 'Tanque de aire', descripcion: 'Almacena el aire comprimido para que el suministro sea estable.', pos: [0, 0.42, 0.2] },
      { id: 'motor', nombre: 'Motor y cabezal', descripcion: 'Comprime el aire que entra y lo envía al tanque.', pos: [0, 0.78, 0] },
      { id: 'manometro', nombre: 'Manómetro', descripcion: 'Indica la presión del tanque. Si cae de forma anormal, puede haber una fuga.', pos: [0.24, 0.68, 0.14] },
    ],
  },
  monitor: {
    id: 'monitor', nombre: 'Monitor de signos vitales', enMesa: false, altura: 1.4,
    resumen: 'Muestra signos vitales del paciente, por ejemplo oxigenación, tensión arterial y ritmo del corazón. ' + AVISO,
    partes: [
      { id: 'pantalla', nombre: 'Pantalla', descripcion: 'Muestra los valores y las curvas de cada signo vital.', pos: [0, 1.2, 0.06] },
      { id: 'sensores', nombre: 'Cables y sensores', descripcion: 'Se conectan al paciente para medir. Su estado afecta la exactitud de la lectura.', pos: [0.26, 0.85, 0.06] },
      { id: 'soporte', nombre: 'Soporte con ruedas o base', descripcion: 'Mantiene el monitor estable y a la altura adecuada.', pos: [0, 0.3, 0] },
    ],
  },
  bascula: {
    id: 'bascula', nombre: 'Báscula con tallímetro', enMesa: false, altura: 1.5,
    resumen: 'Mide el peso y la estatura del paciente. Necesita calibración periódica para ser confiable. ' + AVISO,
    partes: [
      { id: 'plataforma', nombre: 'Plataforma de pesaje', descripcion: 'Donde se para el paciente; contiene los sensores de peso.', pos: [0, 0.07, 0.05] },
      { id: 'tallimetro', nombre: 'Tallímetro', descripcion: 'Regla vertical con un tope que baja hasta la cabeza para medir la estatura.', pos: [0, 1.1, -0.1] },
      { id: 'pantalla', nombre: 'Pantalla', descripcion: 'Muestra el peso medido.', pos: [0, 1.4, -0.09] },
    ],
  },
  centrifuga: {
    id: 'centrifuga', nombre: 'Centrífuga de laboratorio', enMesa: true, altura: 0.4,
    resumen: 'Separa los componentes de una muestra (por ejemplo, de la sangre) girando a alta velocidad. ' + AVISO,
    partes: [
      { id: 'tapa', nombre: 'Tapa', descripcion: 'Debe quedar bien cerrada antes de girar; muchas centrífugas tienen bloqueo de seguridad.', pos: [0, 0.35, 0] },
      { id: 'rotor', nombre: 'Rotor', descripcion: 'Pieza interna donde se colocan los tubos; las muestras deben estar balanceadas.', pos: [0, 0.3, 0] },
      { id: 'panel', nombre: 'Panel de control', descripcion: 'Se ajustan la velocidad y el tiempo de centrifugado.', pos: [0, 0.1, 0.22] },
    ],
  },
  microscopio: {
    id: 'microscopio', nombre: 'Microscopio', enMesa: true, altura: 0.5,
    resumen: 'Permite observar muestras muy pequeñas, como células o microorganismos. ' + AVISO,
    partes: [
      { id: 'oculares', nombre: 'Oculares', descripcion: 'Los lentes por donde mira quien observa la muestra.', pos: [0, 0.45, 0.07] },
      { id: 'objetivos', nombre: 'Objetivos', descripcion: 'Lentes que se acercan a la muestra y definen cuánto se amplía la imagen.', pos: [0.015, 0.27, 0.03] },
      { id: 'platina', nombre: 'Platina', descripcion: 'Plataforma donde se coloca la lámina con la muestra.', pos: [0, 0.2, 0.02] },
    ],
  },
  ecografo: {
    id: 'ecografo', nombre: 'Ecógrafo', enMesa: false, altura: 1.4,
    resumen: 'Genera imágenes del interior del cuerpo con ultrasonido, sin radiación. ' + AVISO,
    partes: [
      { id: 'pantalla', nombre: 'Pantalla', descripcion: 'Muestra la imagen en tiempo real mientras se explora al paciente.', pos: [-0.02, 1.15, 0.02] },
      { id: 'sonda', nombre: 'Sonda (transductor)', descripcion: 'Se apoya sobre la piel; emite y recibe el ultrasonido. Es una pieza delicada.', pos: [0.28, 0.86, 0.14] },
      { id: 'teclado', nombre: 'Panel de mandos', descripcion: 'Permite ajustar la imagen y registrar mediciones.', pos: [0, 0.82, 0.12] },
    ],
  },
  camilla: {
    id: 'camilla', nombre: 'Camilla de terapia', enMesa: false, altura: 1,
    resumen: 'Superficie ajustable donde se acuesta o se sienta al paciente durante una terapia o examen. ' + AVISO,
    partes: [
      { id: 'superficie', nombre: 'Superficie acolchada', descripcion: 'Donde se acomoda al paciente. Debe estar limpia y sin roturas.', pos: [0, 0.7, 0.2] },
      { id: 'respaldo', nombre: 'Respaldo elevable', descripcion: 'Se inclina para cambiar la posición del paciente.', pos: [0, 0.82, -0.72] },
      { id: 'base', nombre: 'Base', descripcion: 'Sostiene la camilla; en algunos modelos eleva o baja la superficie.', pos: [0, 0.3, 0.2] },
    ],
  },
  balanza: {
    id: 'balanza', nombre: 'Balanza analítica', enMesa: true, altura: 0.3,
    resumen: 'Mide masas muy pequeñas con alta exactitud. Es sensible a corrientes de aire y vibraciones. ' + AVISO,
    partes: [
      { id: 'plato', nombre: 'Plato de pesaje', descripcion: 'Donde se coloca la muestra a pesar.', pos: [0, 0.09, -0.04] },
      { id: 'cabina', nombre: 'Cabina de protección', descripcion: 'Evita que las corrientes de aire alteren la lectura.', pos: [0, 0.17, -0.04] },
      { id: 'pantalla', nombre: 'Pantalla', descripcion: 'Muestra el valor medido.', pos: [0, 0.05, 0.15] },
    ],
  },
  generico: {
    id: 'generico', nombre: 'Equipo biomédico', enMesa: true, altura: 0.35,
    resumen: 'Representación genérica de un equipo biomédico de consultorio. ' + AVISO,
    partes: [
      { id: 'cuerpo', nombre: 'Cuerpo del equipo', descripcion: 'Carcasa que protege los componentes internos.', pos: [0, 0.14, 0] },
      { id: 'pantalla', nombre: 'Pantalla o indicadores', descripcion: 'Muestran el estado y los valores de funcionamiento.', pos: [0, 0.2, 0.18] },
      { id: 'controles', nombre: 'Controles', descripcion: 'Botones o perillas para manejar el equipo.', pos: [0, 0.08, 0.18] },
    ],
  },
}

export const ORDEN_BIBLIOTECA: TipoModelo[] = [
  'unidad-odontologica', 'autoclave', 'rayos-x', 'compresor', 'monitor', 'bascula', 'ecografo', 'centrifuga', 'microscopio', 'balanza', 'camilla', 'generico',
]

function normalizar(t: string): string {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** Elige el modelo 3D que mejor representa a un equipo, según su nombre. */
export function tipoModeloDe(equipo: { nombre: string; tipo?: string }): TipoModelo {
  const n = normalizar(`${equipo.nombre} ${equipo.tipo ?? ''}`)
  if (/unidad odontol|sillon/.test(n)) return 'unidad-odontologica'
  if (/autoclave|esteriliz/.test(n)) return 'autoclave'
  if (/rayos/.test(n)) return 'rayos-x'
  if (/compresor/.test(n)) return 'compresor'
  if (/monitor/.test(n)) return 'monitor'
  if (/bascula|tallimetro/.test(n)) return 'bascula'
  if (/centrifug/.test(n)) return 'centrifuga'
  if (/microscop/.test(n)) return 'microscopio'
  if (/ecograf/.test(n)) return 'ecografo'
  if (/camilla/.test(n)) return 'camilla'
  if (/balanza/.test(n)) return 'balanza'
  return 'generico'
}
