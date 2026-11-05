import { ArrowRight, BadgeCheck, CalendarDays, CircleCheck, ClipboardList, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import { saludoHora } from '@/components/shared/efectos'
import { TarjetaDato } from '@/components/shared/TarjetaDato'
import { TriageBadge } from '@/components/shared/ui'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { comisionIngeniero, cop, diasHasta, fechaCorta, textoCalificacion } from '@/lib/format'
import { useTiempoEnPagina } from '@/lib/analytics'
import { useData, useIngenieroActual } from '@/lib/store'
import { cn } from '@/lib/utils'

const ORDEN_URGENCIA = { Crítica: 0, Alta: 1, Media: 2, Programada: 3 } as const

function Seccion({ titulo, ayuda, accion }: { titulo: string; ayuda?: string; accion?: { a: string; texto: string } }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-lg font-bold">{titulo}</h2>
        {ayuda && <p className="text-sm text-muted-foreground">{ayuda}</p>}
      </div>
      {accion && (
        <Link to={accion.a} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
          {accion.texto} <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  )
}

export function IngenieroDashboard() {
  const { servicios, equipos, consultorios } = useData()
  useTiempoEnPagina('portal_ingeniero', { rol: 'ingeniero' })
  const yo = useIngenieroActual()

  const nombreConsultorio = (id: string) => consultorios.find((c) => c.id === id)?.nombre ?? 'Consultorio'
  const mios = servicios.filter((s) => s.ingenieroId === yo.id)
  const terminados = mios.filter((s) => ['Ejecutada', 'Cerrada'].includes(s.estado))
  const ingresos = terminados.reduce((suma, s) => suma + comisionIngeniero(s.tipo), 0)

  const enAgenda = mios
    .filter((s) => ['Asignada', 'Confirmada', 'Programada', 'En ejecución'].includes(s.estado))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  const porResponder = mios
    .filter((s) => s.estado === 'Asignada' || s.estado === 'Programada')
    .sort((a, b) => ORDEN_URGENCIA[a.criticidad] - ORDEN_URGENCIA[b.criticidad])
    .slice(0, 4)

  const abiertas = servicios.filter(
    (s) =>
      s.ingenieroId === null &&
      s.estado === 'Programada' &&
      yo.zonas.includes(s.zona) &&
      consultorios.find((c) => c.id === s.consultorioId)?.ciudadId === yo.ciudadId,
  ).length

  const siguiente = enAgenda[0]
  const diasSiguiente = siguiente ? diasHasta(siguiente.fecha) : null
  const calificacion = textoCalificacion(yo)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            Zona {yo.zonas.join(' · ')} · {yo.ciudad}
          </p>
          <h1 className="font-display text-2xl font-bold">
            {saludoHora()}, {yo.nombre.split(' ')[0]}
          </h1>
        </div>
        <Link to="/ingeniero/solicitudes" className={buttonVariants({ size: 'lg' })}>
          <ClipboardList /> Ver trabajos disponibles
        </Link>
      </div>

      <section className="space-y-3">
        <Seccion titulo="Tu actividad" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <TarjetaDato etiqueta="Abiertos en tu zona" valor={abiertas} nota="Esperando a un ingeniero" icono={<ClipboardList />} tono={abiertas > 0 ? 'aviso' : 'neutro'} />
          <TarjetaDato etiqueta="En tu agenda" valor={enAgenda.length} icono={<CalendarDays />} />
          <TarjetaDato etiqueta="Terminados" valor={terminados.length} icono={<CircleCheck />} tono="bueno" />
          <TarjetaDato
            etiqueta="Calificación"
            valor={calificacion === 'Sin calificaciones' ? '—' : calificacion}
            nota={yo.opiniones.length ? `${yo.opiniones.length} ${yo.opiniones.length === 1 ? 'opinión' : 'opiniones'}` : 'Aún sin opiniones'}
            icono={<Star />}
          />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <section className="space-y-3">
            <Seccion titulo="Por responder" ayuda="Los más urgentes primero." accion={{ a: '/ingeniero/solicitudes', texto: 'Ver todos' }} />
            <Card className="border-border/80">
              <CardContent className="p-2">
                {porResponder.length === 0 ? (
                  <p className="flex items-center gap-3 px-3 py-6 text-sm text-muted-foreground">
                    <CircleCheck className="size-5 text-primary" /> No tienes nada pendiente. Te avisamos cuando llegue algo cerca de ti.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {porResponder.map((s) => (
                      <li key={s.id}>
                        <Link to="/ingeniero/solicitudes" className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-accent">
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                              {s.tipo} · {equipos.find((e) => e.id === s.equipoId)?.nombre}
                            </span>
                            <span className="block truncate text-sm text-muted-foreground">
                              {nombreConsultorio(s.consultorioId)} · {fechaCorta(s.fecha)}
                            </span>
                          </span>
                          <TriageBadge criticidad={s.criticidad} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="space-y-3">
            <Seccion titulo="Próxima visita" accion={{ a: '/ingeniero/agenda', texto: 'Ver agenda' }} />
            <Card className="border-border/80">
              <CardContent className="px-5 py-4 text-sm">
                {siguiente ? (
                  <>
                    <p className="font-semibold">
                      {siguiente.tipo} · {equipos.find((e) => e.id === siguiente.equipoId)?.nombre}
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                      {nombreConsultorio(siguiente.consultorioId)} · {diasSiguiente === 0 ? 'hoy' : diasSiguiente === 1 ? 'mañana' : `el ${fechaCorta(siguiente.fecha)}`} · {siguiente.franja}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">No tienes visitas agendadas.</p>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        <aside className="space-y-8">
          {!yo.verificado && (
            <section className="space-y-3">
              <Seccion titulo="Verificación" />
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{yo.estadoVerificacion}</CardTitle>
                  <CardDescription>Con tu tarjeta COPNIA e inscripción INVIMA verificadas apareces en la red.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/ingeniero/verificacion" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
                    <BadgeCheck /> Completar documentos
                  </Link>
                </CardContent>
              </Card>
            </section>
          )}

          <section className="space-y-3">
            <Seccion titulo="Ingresos estimados" />
            <Card className="border-border/80">
              <CardContent className="space-y-1 px-5 py-4">
                <p className="font-display text-2xl font-bold">{cop(ingresos)}</p>
                <p className="text-sm text-muted-foreground">De los servicios que has terminado, después de la comisión de Pulso.</p>
                <Link to="/ingeniero/historial" className="inline-block pt-2 text-sm font-semibold text-primary hover:underline">
                  Ver historial
                </Link>
              </CardContent>
            </Card>
          </section>
        </aside>
      </div>
    </div>
  )
}
