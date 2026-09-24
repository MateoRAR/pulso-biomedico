import { ArrowRight, CalendarDays, MapPin, Star, TrendingUp, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EstadoBadge, PageHeader, StatCard, TriageBadge } from '@/components/shared/ui'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { comisionIngeniero, cop, diasHasta, fechaCorta } from '@/lib/format'
import { useTiempoEnPagina } from '@/lib/analytics'
import { useSession } from '@/lib/session'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

const ORDEN_TRIAGE = { Crítica: 0, Alta: 1, Media: 2, Programada: 3 } as const

export function IngenieroDashboard() {
  const { sesion } = useSession()
  const { ingenieros, servicios, equipos, consultorio, calificaciones } = useData()
  useTiempoEnPagina('portal_ingeniero', { rol: 'ingeniero' })
  const yo = ingenieros.find((i) => i.nombre === sesion?.nombre) ?? ingenieros[0]

  const mios = servicios.filter((s) => s.ingenieroId === yo.id)
  const completados = mios.filter((s) => ['Ejecutada', 'Cerrada'].includes(s.estado))
  const ingresos = completados.reduce((sum, s) => sum + comisionIngeniero(s.tipo), 0)
  const calificacion = calificaciones.filter((c) => c.ingenieroId === yo.id)

  const proximos = mios
    .filter((s) => ['Asignada', 'Confirmada', 'Programada', 'En ejecución'].includes(s.estado))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  const cola = mios
    .filter((s) => s.estado === 'Asignada' || s.estado === 'Programada')
    .sort((a, b) => ORDEN_TRIAGE[a.criticidad] - ORDEN_TRIAGE[b.criticidad])

  const porZona = proximos.reduce<Record<string, number>>((acc, s) => {
    acc[s.zona] = (acc[s.zona] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Portal del ingeniero"
        titulo={`Hola, ${yo.nombre.split(' ')[0]}`}
        descripcion={`${yo.titulo} · ${yo.ciudad} · ${yo.zonas.join(', ')}`}
        acciones={
          <Link to="/ingeniero/solicitudes" className={cn(buttonVariants(), 'shadow-ocean')}>
            <Wrench /> Ver solicitudes
          </Link>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Servicios completados" value={completados.length} icon={<Wrench />} tone="good" />
        <StatCard label="Calificación" value={yo.calificacion.toFixed(1)} hint={`${calificacion.length} reseñas nuevas`} icon={<Star />} />
        <StatCard label="Ingresos estimados" value={cop(ingresos)} hint="Comisión neta (80 %)" icon={<TrendingUp />} />
        <StatCard label="En agenda" value={proximos.length} icon={<CalendarDays />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-xl">Cola priorizada por triage</CardTitle>
                <CardDescription>No por orden de llegada: primero lo crítico.</CardDescription>
              </div>
              <Link to="/ingeniero/solicitudes" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Ver todo <ArrowRight />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {cola.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes solicitudes pendientes.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Triage</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cola.slice(0, 5).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <p className="font-medium">{s.tipo}</p>
                        <p className="text-xs text-muted-foreground">{equipos.find((e) => e.id === s.equipoId)?.nombre}</p>
                      </TableCell>
                      <TableCell>
                        <TriageBadge criticidad={s.criticidad} />
                      </TableCell>
                      <TableCell className="text-sm">{fechaCorta(s.fecha)}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/ingeniero/servicios/${s.id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                          Abrir
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Agenda de la semana</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {proximos.length === 0 && <p className="text-sm text-muted-foreground">Sin servicios programados.</p>}
              {proximos.slice(0, 4).map((s) => (
                <div key={s.id} className="rounded-md border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{s.tipo}</p>
                    <span className="text-xs text-muted-foreground">{fechaCorta(s.fecha)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {s.franja} · {equipos.find((e) => e.id === s.equipoId)?.nombre}
                  </p>
                  <div className="mt-2">
                    <EstadoBadge estado={s.estado} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Rutas por zona</CardTitle>
              <CardDescription>Servicios agrupados para reducir desplazamientos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {Object.entries(porZona).map(([zona, n]) => (
                <p key={zona} className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" /> {zona}: {n} servicio(s)
                </p>
              ))}
              {Object.keys(porZona).length === 0 && <p className="text-muted-foreground">Sin rutas activas.</p>}
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Próximo servicio</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {proximos[0] ? (
                <>
                  <p className="font-semibold text-foreground">
                    {proximos[0].tipo} en {equipos.find((e) => e.id === proximos[0].equipoId)?.nombre}
                  </p>
                  <p>
                    {consultorio.nombre} · {diasHasta(proximos[0].fecha) === 0 ? 'hoy' : `en ${diasHasta(proximos[0].fecha)} días`}
                  </p>
                </>
              ) : (
                'Sin servicios próximos.'
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
