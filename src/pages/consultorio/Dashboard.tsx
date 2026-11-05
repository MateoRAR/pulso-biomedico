import { AlertTriangle, ArrowRight, Boxes, CalendarDays, Check, CircleCheck, PlusCircle, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { saludoHora } from '@/components/shared/efectos'
import { TarjetaDato } from '@/components/shared/TarjetaDato'
import { EstadoBadge } from '@/components/shared/ui'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/misc'
import { diasHasta, fechaCorta, semaforoEquipo } from '@/lib/format'
import { useTiempoEnPagina } from '@/lib/analytics'
import { useSession } from '@/lib/session'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

/** Un título de sección con una línea de apoyo: separa bien lo que el usuario debe mirar. */
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

export function ConsultorioDashboard() {
  const { sesion } = useSession()
  const { consultorio, equipos, servicios, documentos, planes, ingenieros } = useData()
  useTiempoEnPagina('portal_consultorio', { rol: 'consultorio' })
  const plan = planes.find((p) => p.id === consultorio.planId)
  const disponibles = ingenieros.filter((i) => i.verificado && i.disponible && i.ciudadId === consultorio.ciudadId).length

  const conEstado = equipos.map((equipo) => ({ equipo, estado: semaforoEquipo(equipo) }))
  const alDia = conEstado.filter((e) => e.estado === 'verde').length
  const porVencer = conEstado.filter((e) => e.estado === 'amarillo').length
  const atencion = conEstado.filter((e) => e.estado === 'rojo').length

  // Lo primero que conviene atender: lo vencido, luego lo que está por vencer.
  const pendientes = [
    ...conEstado
      .filter((e) => e.estado !== 'verde')
      .sort((a, b) => (a.estado === 'rojo' ? 0 : 1) - (b.estado === 'rojo' ? 0 : 1))
      .map(({ equipo, estado }) => ({
        id: equipo.id,
        a: `/consultorio/equipos/${equipo.id}`,
        grave: estado === 'rojo',
        titulo: equipo.nombre,
        detalle:
          estado === 'rojo'
            ? equipo.estado === 'Fuera de servicio'
              ? 'Fuera de servicio'
              : `Calibración vencida (${fechaCorta(equipo.proximaCalibracion)})`
            : `Calibración el ${fechaCorta(equipo.proximaCalibracion)}`,
      })),
    ...documentos
      .filter((d) => d.vigencia && (diasHasta(d.vigencia) ?? 999) <= 30)
      .map((d) => ({
        id: d.id,
        a: '/consultorio/expediente',
        grave: (diasHasta(d.vigencia) ?? 0) < 0,
        titulo: d.nombre,
        detalle: `${d.tipo} ${(diasHasta(d.vigencia) ?? 0) < 0 ? 'vencido' : 'vence'} el ${fechaCorta(d.vigencia)}`,
      })),
  ].slice(0, 4)

  const proximas = servicios
    .filter((s) => ['Programada', 'Asignada', 'Confirmada', 'En ejecución'].includes(s.estado))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 3)

  const siguiente = proximas[0]
  const pasos = [
    { hecho: equipos.length > 0, texto: 'Registra tus equipos', ir: '/consultorio/equipos' },
    { hecho: Boolean(consultorio.planId), texto: 'Haz la revisión inicial', ir: '/consultorio/onboarding' },
    { hecho: servicios.some((s) => /^ser-\d{13}$/.test(s.id)), texto: 'Pide tu primer servicio', ir: '/consultorio/solicitudes/nueva' },
    { hecho: Boolean(consultorio.nit && consultorio.codigoHabilitacion), texto: 'Completa tus datos', ir: '/consultorio/perfil' },
  ]
  const hechos = pasos.filter((p) => p.hecho).length

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">{consultorio.nombre}</p>
          <h1 className="font-display text-2xl font-bold">
            {saludoHora()}, {sesion?.nombre.split(' ')[0]}
          </h1>
        </div>
        <Link to="/consultorio/solicitudes/nueva" className={buttonVariants({ size: 'lg' })}>
          <PlusCircle /> Pedir un servicio
        </Link>
      </div>

      {/* 1 · Cómo están tus equipos */}
      <section className="space-y-3">
        <Seccion titulo="Tus equipos" ayuda="Un vistazo al estado de lo que tienes registrado." accion={{ a: '/consultorio/equipos', texto: 'Ver todos' }} />
        <div className="cascada grid grid-cols-2 gap-3 lg:grid-cols-4">
          <TarjetaDato etiqueta="Registrados" valor={equipos.length} icono={<Boxes />} />
          <TarjetaDato etiqueta="Al día" valor={alDia} icono={<CircleCheck />} tono="bueno" />
          <TarjetaDato etiqueta="Por vencer" valor={porVencer} nota="En los próximos 60 días" icono={<CalendarDays />} tono="aviso" />
          <TarjetaDato etiqueta="Requieren atención" valor={atencion} icono={<AlertTriangle />} tono="alerta" />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          {/* 2 · Qué atender */}
          <section className="space-y-3">
            <Seccion titulo="Qué atender ahora" ayuda="Lo más importante, en orden." />
            <Card className="border-border/80">
              <CardContent className="p-2">
                {pendientes.length === 0 ? (
                  <p className="flex items-center gap-3 px-3 py-6 text-sm text-muted-foreground">
                    <CircleCheck className="size-5 text-primary" />
                    {equipos.length === 0 ? 'Cuando registres tus equipos, aquí verás qué necesita atención.' : 'Todo está en orden. No hay nada urgente.'}
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {pendientes.map((p) => (
                      <li key={p.id}>
                        <Link to={p.a} className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-accent">
                          <span className={cn('size-2.5 shrink-0 rounded-full', p.grave ? 'bg-rose-500' : 'bg-amber-500')} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{p.titulo}</span>
                            <span className="block truncate text-sm text-muted-foreground">{p.detalle}</span>
                          </span>
                          <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>

          {/* 3 · Próximas visitas */}
          <section className="space-y-3">
            <Seccion titulo="Próximas visitas" ayuda={siguiente ? undefined : 'Aquí aparecerán tus servicios agendados.'} accion={{ a: '/consultorio/cronograma', texto: 'Ver calendario' }} />
            {proximas.length > 0 && (
              <Card className="border-border/80">
                <CardContent className="p-2">
                  <ul className="divide-y divide-border">
                    {proximas.map((s) => {
                      const equipo = equipos.find((e) => e.id === s.equipoId)
                      return (
                        <li key={s.id} className="flex items-center gap-3 px-3 py-3">
                          <span className="grid w-12 shrink-0 text-center leading-tight">
                            <span className="text-lg font-bold">{fechaCorta(s.fecha).split(' ')[0]}</span>
                            <span className="text-xs uppercase text-muted-foreground">{fechaCorta(s.fecha).split(' ')[1]?.replace('.', '')}</span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{s.tipo}</span>
                            <span className="block truncate text-sm text-muted-foreground">{equipo?.nombre ?? 'Equipo'} · {s.franja}</span>
                          </span>
                          <EstadoBadge estado={s.estado} />
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>
            )}
          </section>
        </div>

        {/* Columna lateral: acciones con calma */}
        <aside className="space-y-8">
          <section className="space-y-3">
            <Seccion titulo="Ingenieros" />
            <Link to="/consultorio/ingenieros" className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">Encontrar ingeniero</span>
                <span className="block text-sm text-muted-foreground">
                  {disponibles > 0 ? `${disponibles} ${disponibles === 1 ? 'disponible' : 'disponibles'} en ${consultorio.ciudad}` : 'Mira la red de ingenieros'}
                </span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition group-hover:text-primary" />
            </Link>
          </section>

          {hechos < pasos.length && (
            <section className="space-y-3">
              <Seccion titulo="Primeros pasos" ayuda={`${hechos} de ${pasos.length} listos`} />
              <Card className="border-border/80">
                <CardHeader className="pb-2">
                  <Progress value={(hechos / pasos.length) * 100} />
                </CardHeader>
                <CardContent className="space-y-1 pt-0">
                  {pasos.map((p) => (
                    <Link key={p.texto} to={p.ir} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition hover:bg-accent">
                      <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border', p.hecho ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>
                        {p.hecho && <Check className="size-3" />}
                      </span>
                      <span className={cn(p.hecho && 'text-muted-foreground line-through')}>{p.texto}</span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </section>
          )}

          <section className="space-y-3">
            <Seccion titulo="Mi plan" />
            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{plan?.nombre ?? 'Sin plan'}</CardTitle>
                <CardDescription>{plan ? plan.rangoEquipos : 'Pagas solo la comisión de cada servicio.'}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/consultorio/perfil" className="text-sm font-semibold text-primary hover:underline">
                  {plan ? 'Ver o cambiar mi plan' : 'Ver los planes'}
                </Link>
              </CardContent>
            </Card>
          </section>
        </aside>
      </div>
    </div>
  )
}
