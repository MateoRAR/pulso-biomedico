import { ArrowUp, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { saludoHora } from '@/components/shared/efectos'
import { toast } from '@/components/ui/toast'
import { diasHasta, fechaCorta, semaforoEquipo } from '@/lib/format'
import { inventarioEjemplo } from '@/lib/registro'
import { useSession } from '@/lib/session'
import { useData, useIngenieroActual } from '@/lib/store'
import { pct, resumenPlanes, TARIFAS } from '@/lib/planes'
import { cn } from '@/lib/utils'

interface Accion {
  etiqueta: string
  /** Ruta a la que lleva, o acción interna. */
  ir?: string
  cargarEjemplo?: boolean
  pregunta?: string
}

interface Mensaje {
  id: number
  de: 'pulso' | 'yo'
  texto: string
  acciones?: Accion[]
}

const ESCRIBIENDO_MS = 650

/**
 * Compañero conversacional de la plataforma. No usa un modelo de lenguaje: lee los datos
 * de la sesión y habla de lo que realmente está pasando en el espacio de la persona.
 */
export function AsistentePulso() {
  const { sesion } = useSession()
  const datos = useData()
  const yo = useIngenieroActual()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [escribiendo, setEscribiendo] = useState(false)
  const [entrada, setEntrada] = useState('')
  const contador = useRef(0)
  const fin = useRef<HTMLDivElement>(null)
  const temporizadores = useRef<number[]>([])
  const iniciado = useRef(false)

  const rol = sesion?.rol
  const primerNombre = sesion?.nombre.split(' ')[0] ?? ''

  // -- lectura del estado del espacio ------------------------------------------------

  const resumen = useMemo(() => {
    const conSemaforo = datos.equipos.map((equipo) => ({ equipo, semaforo: semaforoEquipo(equipo) }))
    const rojos = conSemaforo.filter((e) => e.semaforo === 'rojo')
    const amarillos = conSemaforo
      .filter((e) => e.semaforo === 'amarillo')
      .sort((a, b) => (diasHasta(a.equipo.proximaCalibracion) ?? 999) - (diasHasta(b.equipo.proximaCalibracion) ?? 999))
    const proximas = datos.servicios
      .filter((s) => ['Programada', 'Asignada', 'Confirmada', 'En ejecución'].includes(s.estado))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
    const abiertas = datos.servicios.filter(
      (s) =>
        s.ingenieroId === null &&
        s.estado === 'Programada' &&
        datos.consultorios.find((c) => c.id === s.consultorioId)?.ciudadId === yo.ciudadId,
    )
    const misProximas = proximas.filter((s) => s.ingenieroId === yo.id)
    const pendientesAdmin = datos.ingenieros.filter((i) => i.estadoVerificacion === 'En revisión' || i.estadoVerificacion === 'Pendiente')
    return { rojos, amarillos, proximas, abiertas, misProximas, pendientesAdmin, total: datos.equipos.length }
  }, [datos.equipos, datos.servicios, datos.ingenieros, datos.consultorios, yo.id, yo.ciudadId])

  // -- generación de mensajes ----------------------------------------------------------

  const ideas = useCallback((): { texto: string; acciones?: Accion[] }[] => {
    const lista: { texto: string; acciones?: Accion[] }[] = []
    if (rol === 'consultorio') {
      const plan = datos.planes.find((p) => p.id === datos.consultorio.planId)
      if (resumen.total === 0) {
        lista.push({
          texto: `Aún no hay equipos en ${datos.consultorio.nombre}. Apenas los registres te muestro el estado de cada uno y te aviso antes de que algo venza.`,
          acciones: [
            { etiqueta: 'Cargar un inventario de ejemplo', cargarEjemplo: true },
            { etiqueta: 'Registrar mis equipos', ir: '/consultorio/equipos' },
          ],
        })
      } else {
        if (resumen.rojos.length) {
          const critico = resumen.rojos[0].equipo
          lista.push({
            texto: `Ojo: ${resumen.rojos.length === 1 ? 'hay 1 equipo' : `hay ${resumen.rojos.length} equipos`} que necesita${resumen.rojos.length === 1 ? '' : 'n'} acción. El más urgente es ${critico.nombre}.`,
            acciones: [{ etiqueta: 'Pedir un servicio ahora', ir: '/consultorio/solicitudes/nueva' }],
          })
        }
        if (resumen.amarillos.length) {
          const proximo = resumen.amarillos[0].equipo
          const dias = diasHasta(proximo.proximaCalibracion)
          lista.push({
            texto: `${resumen.amarillos.length === 1 ? 'Un equipo' : `${resumen.amarillos.length} equipos`} se acercan a su vencimiento. Primero: ${proximo.nombre}${dias !== null ? ` (${dias < 0 ? `venció hace ${-dias} días` : `en ${dias} días`})` : ''}.`,
            acciones: [{ etiqueta: 'Ver cronograma', ir: '/consultorio/cronograma' }],
          })
        }
        if (!resumen.rojos.length && !resumen.amarillos.length) {
          lista.push({ texto: 'Todo tu inventario está al día. Así da gusto una auditoría.' })
        }
      }
      const siguiente = resumen.proximas[0]
      if (siguiente) {
        const eq = datos.equipos.find((e) => e.id === siguiente.equipoId)
        lista.push({ texto: `Tu próxima visita es el ${fechaCorta(siguiente.fecha)}: ${siguiente.tipo.toLowerCase()} de ${eq?.nombre ?? 'un equipo'} (${siguiente.estado.toLowerCase()}).` })
      }
      if (!plan) {
        lista.push({
          texto: `Aún no tienes plan. La cuota mensual cubre la gestión (cronograma, expediente, semáforo y asignación); cada visita se paga aparte por la plataforma. Planes: ${resumenPlanes(datos.planes)}.`,
          acciones: [{ etiqueta: 'Ver planes', ir: '/consultorio/perfil' }],
        })
      }
    } else if (rol === 'ingeniero') {
      if (!yo.verificado) {
        lista.push({
          texto: 'Tu perfil aún no aparece en el directorio: falta validar tu tarjeta COPNIA y tu inscripción INVIMA. Son dos minutos.',
          acciones: [{ etiqueta: 'Completar verificación', ir: '/ingeniero/verificacion' }],
        })
      }
      if (resumen.abiertas.length) {
        const u = resumen.abiertas[0]
        lista.push({
          texto: `Hay ${resumen.abiertas.length} ${resumen.abiertas.length === 1 ? 'solicitud abierta' : 'solicitudes abiertas'} en tu ciudad. La primera: ${u.tipo.toLowerCase()} (${u.criticidad}) el ${fechaCorta(u.fecha)}.`,
          acciones: [{ etiqueta: 'Ver la cola', ir: '/ingeniero/solicitudes' }],
        })
      }
      if (resumen.misProximas.length) {
        lista.push({ texto: `Tienes ${resumen.misProximas.length} ${resumen.misProximas.length === 1 ? 'visita' : 'visitas'} en tu agenda.`, acciones: [{ etiqueta: 'Abrir agenda', ir: '/ingeniero/agenda' }] })
      }
      if (!resumen.abiertas.length && !resumen.misProximas.length) {
        lista.push({ texto: 'Por ahora no hay nada pendiente. En cuanto llegue una solicitud cerca de ti te aviso.' })
      }
    } else {
      lista.push({
        texto: resumen.pendientesAdmin.length
          ? `Hay ${resumen.pendientesAdmin.length} ingenieros esperando verificación.`
          : 'La red está al día: no hay verificaciones pendientes.',
        acciones: [{ etiqueta: 'Ir a verificación', ir: '/admin/verificacion' }],
      })
    }
    return lista
  }, [rol, datos.planes, datos.consultorio, datos.equipos, resumen, yo.verificado])

  const sugerencias = useCallback((): Accion[] => {
    if (rol === 'consultorio') {
      return [
        { etiqueta: '¿Qué vence pronto?', pregunta: 'vence' },
        { etiqueta: 'Resumen de mi semana', pregunta: 'resumen' },
        { etiqueta: 'Necesito un servicio', ir: '/consultorio/solicitudes/nueva' },
      ]
    }
    if (rol === 'ingeniero') {
      return [
        { etiqueta: '¿Qué hay en mi ciudad?', pregunta: 'solicitudes' },
        { etiqueta: 'Resumen de mi semana', pregunta: 'resumen' },
        { etiqueta: 'Abrir mi agenda', ir: '/ingeniero/agenda' },
      ]
    }
    return [{ etiqueta: 'Resumen de la red', pregunta: 'resumen' }]
  }, [rol])

  // -- conversación --------------------------------------------------------------------

  const hablar = useCallback((texto: string, acciones?: Accion[], espera = ESCRIBIENDO_MS) => {
    setEscribiendo(true)
    const id = window.setTimeout(() => {
      setEscribiendo(false)
      setMensajes((prev) => [...prev, { id: ++contador.current, de: 'pulso', texto, acciones }])
    }, espera)
    temporizadores.current.push(id)
  }, [])

  const abrir = useCallback(() => {
    setAbierto(true)
    if (iniciado.current) return
    iniciado.current = true
    const saludo = `${saludoHora()}, ${primerNombre}. Soy Pulso, y estoy mirando tu espacio mientras trabajas.`
    hablar(saludo, undefined, 350)
    const lista = ideas().slice(0, 3)
    lista.forEach((idea, i) => {
      const id = window.setTimeout(() => hablar(idea.texto, idea.acciones, 800), 1000 + i * 1700)
      temporizadores.current.push(id)
    })
    const id = window.setTimeout(() => hablar('¿Qué quieres hacer?', sugerencias(), 600), 1200 + lista.length * 1700)
    temporizadores.current.push(id)
  }, [hablar, ideas, primerNombre, sugerencias])

  const responder = useCallback(
    (texto: string) => {
      const q = texto.toLowerCase()
      const hay = (...claves: string[]) => claves.some((c) => q.includes(c))

      if (hay('hola', 'buenas', 'hey')) return hablar(`¡Hola, ${primerNombre}! Cuéntame qué necesitas.`, sugerencias())
      if (hay('gracias')) return hablar('Con gusto. Aquí sigo por si algo cambia.')
      if (hay('vence', 'venc', 'calibr', 'semaforo', 'semáforo')) {
        const todos = [...resumen.rojos, ...resumen.amarillos]
        if (!todos.length) return hablar(rol === 'consultorio' ? 'Nada por vencer en los próximos 60 días.' : 'Eso lo ve cada consultorio; en tu agenda no hay vencimientos.')
        const lineas = todos.slice(0, 3).map(({ equipo }) => {
          const d = diasHasta(equipo.proximaCalibracion)
          return `${equipo.nombre}: ${d === null ? 'sin fecha' : d < 0 ? `vencida hace ${-d} días` : `en ${d} días`}`
        })
        return hablar(`Esto es lo que viene: ${lineas.join(' · ')}.`, [{ etiqueta: 'Pedir un servicio', ir: '/consultorio/solicitudes/nueva' }])
      }
      if (hay('solicitud', 'zona', 'ciudad', 'cola')) {
        return hablar(
          resumen.abiertas.length
            ? `Hay ${resumen.abiertas.length} abiertas en tu ciudad, ordenadas por criticidad.`
            : 'No hay solicitudes abiertas en tu ciudad ahora mismo.',
          [{ etiqueta: 'Abrir la cola', ir: '/ingeniero/solicitudes' }],
        )
      }
      if (hay('resumen', 'semana', 'estado')) {
        if (rol === 'consultorio') {
          return hablar(
            `${resumen.total} equipos · ${resumen.rojos.length} requieren acción · ${resumen.amarillos.length} por vencer · ${resumen.proximas.length} servicios en curso o programados.`,
          )
        }
        if (rol === 'ingeniero') {
          return hablar(`${resumen.misProximas.length} visitas en tu agenda · ${resumen.abiertas.length} solicitudes abiertas en tu ciudad.`)
        }
        return hablar(`${datos.ingenieros.length} ingenieros en la red · ${resumen.pendientesAdmin.length} por verificar.`)
      }
      if (hay('plan', 'precio', 'cuesta')) {
        return hablar(`Planes: ${resumenPlanes(datos.planes)}, sin IVA. La cuota cubre la gestión; cada visita del ingeniero se paga aparte por la plataforma y Pulso retiene el ${pct(TARIFAS.comisionPulso)}.`, [
          { etiqueta: 'Ver mi plan', ir: rol === 'consultorio' ? '/consultorio/perfil' : '/' },
        ])
      }
      if (hay('equipo', 'inventario')) {
        return hablar(resumen.total ? `Tienes ${resumen.total} equipos registrados.` : 'Todavía no hay equipos. ¿Cargo un inventario de ejemplo?', [
          { etiqueta: 'Ir a equipos', ir: '/consultorio/equipos' },
          ...(resumen.total ? [] : [{ etiqueta: 'Cargar ejemplo', cargarEjemplo: true }]),
        ])
      }
      return hablar('Todavía no entiendo eso, pero puedo ayudarte con vencimientos, solicitudes, tu plan o un resumen.', sugerencias())
    },
    [datos.ingenieros.length, hablar, primerNombre, resumen, rol, sugerencias],
  )

  const ejecutar = useCallback(
    (accion: Accion) => {
      if (accion.cargarEjemplo) {
        setMensajes((prev) => [...prev, { id: ++contador.current, de: 'yo', texto: accion.etiqueta }])
        datos.agregarEquipos(inventarioEjemplo(datos.consultorio.id))
        toast.success('Inventario de ejemplo cargado', { description: 'Mira cómo se mueve tu constelación.' })
        hablar('Listo: cinco equipos con vencimientos variados. Ya puedes ver su estado en tu inicio.', [{ etiqueta: 'Ir al inicio', ir: '/consultorio' }])
        return
      }
      if (accion.ir) {
        setMensajes((prev) => [...prev, { id: ++contador.current, de: 'yo', texto: accion.etiqueta }])
        navigate(accion.ir)
        hablar('Te llevo. Si te pierdes, aquí estoy.', undefined, 450)
        return
      }
      if (accion.pregunta) {
        setMensajes((prev) => [...prev, { id: ++contador.current, de: 'yo', texto: accion.etiqueta }])
        responder(accion.pregunta)
      }
    },
    [datos, hablar, navigate, responder],
  )

  function enviar(event: React.FormEvent) {
    event.preventDefault()
    const texto = entrada.trim()
    if (!texto) return
    setEntrada('')
    setMensajes((prev) => [...prev, { id: ++contador.current, de: 'yo', texto }])
    responder(texto)
  }

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensajes, escribiendo])

  useEffect(() => {
    const pendientes = temporizadores.current
    return () => pendientes.forEach((id) => window.clearTimeout(id))
  }, [])

  // Si cambia la cuenta, la conversación empieza de nuevo.
  useEffect(() => {
    iniciado.current = false
    setMensajes([])
    setEscribiendo(false)
    temporizadores.current.forEach((id) => window.clearTimeout(id))
    temporizadores.current = []
  }, [datos.espacio, rol])

  if (!sesion) return null

  return (
    <div className="fixed bottom-20 right-4 z-[60] flex flex-col items-end gap-3 lg:bottom-4">
      {abierto && (
        <div className="animate-pop flex h-[min(32rem,calc(100svh-10rem))] w-[min(23rem,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center gap-3 border-b border-border bg-sidebar px-4 py-3 text-sidebar-foreground">
            <span className="relative grid size-9 place-items-center rounded-full bg-primary/25">
              <Sparkles className="size-4 text-seafoam" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight">Pulso</p>
              <p className="text-xs text-sidebar-foreground/70">Pregúntame lo que necesites</p>
            </div>
            <button
              type="button"
              aria-label="Cerrar asistente"
              onClick={() => setAbierto(false)}
              className="rounded-md p-1.5 text-sidebar-foreground/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {mensajes.map((m) => (
              <div key={m.id} className={cn('animate-rise flex flex-col gap-2', m.de === 'yo' && 'items-end')}>
                <div className={cn('burbuja', m.de === 'yo' && 'burbuja-yo')}>{m.texto}</div>
                {m.acciones && (
                  <div className="flex flex-wrap gap-2">
                    {m.acciones.map((a) => (
                      <button
                        key={a.etiqueta}
                        type="button"
                        onClick={() => ejecutar(a)}
                        className="rounded-full border border-primary/40 bg-background px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                      >
                        {a.etiqueta}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {escribiendo && (
              <div className="burbuja typing-dots w-fit text-muted-foreground" aria-label="Pulso está escribiendo">
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={fin} />
          </div>

          <form onSubmit={enviar} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder="Pregúntame algo…"
              aria-label="Escribe tu mensaje a Pulso"
              className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              aria-label="Enviar"
              disabled={!entrada.trim()}
              className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
            >
              <ArrowUp className="size-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-label={abierto ? 'Cerrar ayuda' : 'Abrir ayuda'}
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        className="flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-base font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
      >
        {abierto ? <X className="size-5" /> : <Sparkles className="size-5" />}
        {abierto ? 'Cerrar' : 'Ayuda'}
      </button>
    </div>
  )
}
