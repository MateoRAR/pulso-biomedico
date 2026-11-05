import { useEffect, useRef } from 'react'

import { toast } from '@/components/ui/toast'
import { crearNotificacion, enDias, hoyISO, solicitudEntrante } from '@/lib/registro'
import { useSession } from '@/lib/session'
import { useData, useIngenieroActual } from '@/lib/store'

/**
 * Hace que la plataforma se sienta habitada: sin backend, simula a las personas del
 * otro lado. Los tiempos están acelerados a propósito para que se vea el ciclo completo
 * (asignada → confirmada → en ejecución → ejecutada) durante una demo.
 *
 *  - Consultorio: las solicitudes que crea el usuario avanzan solas y el ingeniero "responde".
 *  - Ingeniero: llegan solicitudes nuevas de consultorios cercanos mientras trabaja.
 */

// Solo avanzan las solicitudes creadas en esta sesión: su id es `ser-<Date.now()>`.
const SERVICIO_PROPIO = /^ser-(\d{13})$/

const SEGUNDOS_ASIGNA = 5
const SEGUNDOS_CONFIRMA = 12
const SEGUNDOS_EJECUCION = 28
const SEGUNDOS_CIERRE = 48

const MAX_ENTRANTES = 3
const PRIMERA_ENTRANTE_MS = 15_000
const ENTRE_ENTRANTES_MS = 50_000

export function MotorVivo() {
  const { sesion } = useSession()
  const datos = useData()
  const yo = useIngenieroActual()
  const ref = useRef(datos)
  ref.current = datos
  const yoRef = useRef(yo)
  yoRef.current = yo
  const rol = sesion?.rol
  const espacio = datos.espacio

  // Consultorio: el ingeniero asignado responde y avanza el servicio.
  useEffect(() => {
    if (rol !== 'consultorio') return
    const enCurso = new Set<string>()

    const id = window.setInterval(() => {
      const d = ref.current
      const ahora = Date.now()
      for (const s of d.servicios) {
        const coincide = SERVICIO_PROPIO.exec(s.id)
        if (!coincide) continue
        // La visita de incorporación del plan se agenda a una semana: no se simula.
        if (s.descripcion.startsWith('Incorporación inicial')) continue
        const edad = (ahora - Number(coincide[1])) / 1000
        const llave = `${s.id}:${s.estado}`
        if (enCurso.has(llave)) continue

        if (!s.ingenieroId) {
          // Solicitudes sin asignar (p. ej. diagnóstico exprés): la red busca al más cercano.
          if (s.estado !== 'Programada' || edad < SEGUNDOS_ASIGNA) continue
          const cliente = d.consultorios.find((c) => c.id === s.consultorioId)
          const delaCiudad = d.ingenieros.filter((i) => i.verificado && i.disponible && (!cliente || i.ciudadId === cliente.ciudadId))
          const verificados = delaCiudad.length ? delaCiudad : d.ingenieros.filter((i) => i.verificado && i.disponible)
          const cercanos = verificados.filter((i) => i.zonas.includes(s.zona))
          const elegido = [...(cercanos.length ? cercanos : verificados)].sort((a, b) => b.calificacion - a.calificacion)[0]
          if (!elegido) continue
          enCurso.add(llave)
          d.actualizarServicio(s.id, {
            ingenieroId: elegido.id,
            estado: 'Asignada',
            historial: [...s.historial, { estado: 'Asignada', fecha: hoyISO() }],
          })
          d.agregarNotificacion(crearNotificacion('consultorio', 'Visita', `Encontramos a ${elegido.nombre} cerca de ti para tu ${s.tipo.toLowerCase()}.`))
          toast.info(`${elegido.nombre.split(' ')[0]} tomó tu solicitud`, { description: 'Está revisando la fecha y te confirma en un momento.' })
          continue
        }

        const ingeniero = d.ingenieros.find((i) => i.id === s.ingenieroId)
        const equipo = d.equipos.find((e) => e.id === s.equipoId)
        const nombre = ingeniero?.nombre ?? 'Tu ingeniero'
        const primerNombre = nombre.split(' ')[0]
        const hoy = hoyISO()

        if (s.estado === 'Asignada' && edad >= SEGUNDOS_CONFIRMA) {
          enCurso.add(llave)
          d.actualizarServicio(s.id, { estado: 'Confirmada', historial: [...s.historial, { estado: 'Confirmada', fecha: hoy }] })
          d.agregarNotificacion(crearNotificacion('consultorio', 'Visita', `${nombre} confirmó la visita para ${equipo?.nombre ?? 'tu equipo'}.`))
          toast.info(`${primerNombre} confirmó tu visita`, { description: `${equipo?.nombre ?? 'Tu equipo'} · ${s.tipo.toLowerCase()}` })
        } else if (s.estado === 'Confirmada' && edad >= SEGUNDOS_EJECUCION) {
          enCurso.add(llave)
          d.actualizarServicio(s.id, { estado: 'En ejecución', historial: [...s.historial, { estado: 'En ejecución', fecha: hoy }] })
          d.agregarNotificacion(crearNotificacion('consultorio', 'Visita', `${primerNombre} ya está trabajando en ${equipo?.nombre ?? 'tu equipo'}.`))
          toast.info(`${primerNombre} está en sitio`, { description: 'Te aviso apenas cierre la intervención.' })
        } else if (s.estado === 'En ejecución' && edad >= SEGUNDOS_CIERRE) {
          enCurso.add(llave)
          const garantia = enDias(90)
          d.actualizarServicio(s.id, {
            estado: 'Ejecutada',
            garantiaHasta: garantia,
            evidencia: s.evidencia.length ? s.evidencia : ['Foto antes de la intervención', 'Foto después de la intervención'],
            historial: [...s.historial, { estado: 'Ejecutada', fecha: hoy }],
          })
          if (equipo) {
            d.actualizarEquipo(equipo.id, {
              estado: 'Operativo',
              ...(s.tipo === 'Calibración' ? { proximaCalibracion: enDias(365) } : {}),
              ...(s.tipo === 'Preventivo' || s.tipo === 'Correctivo' ? { proximoMantenimiento: enDias(180) } : {}),
            })
            d.agregarDocumento({
              id: `doc-${Date.now()}`,
              equipoId: equipo.id,
              tipo: s.tipo === 'Calibración' ? 'Certificado de calibración' : 'Informe de mantenimiento',
              nombre: `${s.tipo} ${equipo.nombre} — ${hoy}`,
              fecha: hoy,
              vigencia: s.tipo === 'Calibración' ? enDias(365) : garantia,
            })
          }
          d.agregarNotificacion(
            crearNotificacion('consultorio', 'Certificado', `${primerNombre} cerró el servicio. El informe ya está en tus documentos.`),
          )
          toast.success(`${primerNombre} terminó`, { description: 'Informe en tus documentos · cuéntanos cómo te fue en Opiniones y garantías.' })
        }
      }
    }, 1500)
    return () => window.clearInterval(id)
  }, [rol, espacio])

  // Ingeniero: llegan solicitudes nuevas mientras trabaja.
  useEffect(() => {
    if (rol !== 'ingeniero') return
    let temporizador = 0
    const entrantes = () => ref.current.servicios.filter((s) => s.id.startsWith('ser-sim-')).length

    const programar = (espera: number) => {
      temporizador = window.setTimeout(() => {
        const d = ref.current
        const total = entrantes()
        if (total >= MAX_ENTRANTES) return
        const yo = yoRef.current
        // Un consultorio activo de su ciudad (de su zona, si lo hay) con equipos registrados.
        const candidatos = d.consultorios.filter(
          (c) => c.activo && c.ciudadId === yo.ciudadId && d.equipos.some((e) => e.consultorioId === c.id),
        )
        const cliente = candidatos.find((c) => yo.zonas.includes(c.zona)) ?? candidatos[0]
        if (!cliente) return
        const zona = cliente.zona
        const nueva = solicitudEntrante(
          cliente,
          d.equipos.filter((e) => e.consultorioId === cliente.id),
          total,
        )
        if (!nueva) return
        const equipo = d.equipos.find((e) => e.id === nueva.equipoId)
        d.agregarServicio(nueva)
        d.agregarNotificacion(
          crearNotificacion('ingeniero', 'Visita', `Nueva solicitud en ${zona}: ${nueva.tipo.toLowerCase()} de ${equipo?.nombre ?? 'un equipo'} (${nueva.criticidad}).`),
        )
        toast.info('Llegó una solicitud cerca de ti', {
          description: `${nueva.tipo} · ${equipo?.nombre ?? 'equipo'} · zona ${zona}`,
        })
        programar(ENTRE_ENTRANTES_MS)
      }, espera)
    }

    programar(entrantes() === 0 ? PRIMERA_ENTRANTE_MS : ENTRE_ENTRANTES_MS)
    return () => window.clearTimeout(temporizador)
  }, [rol, espacio])

  return null
}
