import { AlertTriangle, ArrowRight, CalendarDays, FileCheck2, Gauge, Package, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageHeader, SemaforoBadge, StatCard, TriageBadge } from '@/components/shared/ui'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/misc'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { diasHasta, fechaCorta, semaforoEquipo } from '@/lib/format'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

export function ConsultorioDashboard() {
  const { consultorio, equipos, servicios, documentos, planes, calificaciones } = useData()
  const plan = planes.find((p) => p.id === consultorio.planId)

  const conSemaforo = equipos.map((equipo) => ({ equipo, semaforo: semaforoEquipo(equipo) }))
  const verde = conSemaforo.filter((e) => e.semaforo === 'verde').length
  const amarillo = conSemaforo.filter((e) => e.semaforo === 'amarillo').length
  const rojo = conSemaforo.filter((e) => e.semaforo === 'rojo').length
  const cumplimiento = equipos.length ? Math.round((verde / equipos.length) * 100) : 0

  const proximos = servicios
    .filter((s) => ['Programada', 'Asignada', 'Confirmada', 'En ejecución'].includes(s.estado))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 5)

  const alertas = [
    ...conSemaforo
      .filter((e) => e.semaforo !== 'verde')
      .map(({ equipo, semaforo }) => ({
        id: equipo.id,
        tono: semaforo,
        texto: `${equipo.nombre}: ${semaforo === 'rojo' ? 'calibración vencida o equipo fuera de servicio' : 'calibración próxima a vencer'}`,
        detalle: `Próxima calibración: ${fechaCorta(equipo.proximaCalibracion)}`,
      })),
    ...documentos
      .filter((d) => d.vigencia && (diasHasta(d.vigencia) ?? 999) <= 30)
      .map((d) => ({
        id: d.id,
        tono: (diasHasta(d.vigencia) ?? 0) < 0 ? ('rojo' as const) : ('amarillo' as const),
        texto: `${d.tipo} ${diasHasta(d.vigencia)! < 0 ? 'vencido' : 'por vencer'}: ${d.nombre}`,
        detalle: `Vigencia: ${fechaCorta(d.vigencia)}`,
      })),
  ].slice(0, 5)

  const promedio = calificaciones.length
    ? (calificaciones.reduce((sum, c) => sum + c.estrellas, 0) / calificaciones.length).toFixed(1)
    : '—'

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Portal del consultorio"
        titulo={consultorio.nombre}
        descripcion={`${consultorio.tipo} · ${consultorio.ciudad} · Segmento ${consultorio.segmento} · ${equipos.length} equipos`}
        acciones={
          <>
            <Link to="/consultorio/solicitudes/nueva" className={cn(buttonVariants(), 'shadow-ocean')}>
              <Wrench /> Solicitar servicio
            </Link>
            <Link to="/consultorio/diagnostico-expres" className={buttonVariants({ variant: 'outline' })}>
              Diagnóstico exprés
            </Link>
          </>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Semáforo de habilitación" value={`${cumplimiento}%`} hint="Equipos al día" icon={<Gauge />} tone="good" />
        <StatCard label="Por vencer" value={amarillo} hint="Próximos 60 días" icon={<CalendarDays />} tone="warning" />
        <StatCard label="Requieren acción" value={rojo} hint="Vencidos o fuera de servicio" icon={<AlertTriangle />} tone="alert" />
        <StatCard label="Calificación recibida" value={promedio} hint={`${calificaciones.length} reseñas`} icon={<FileCheck2 />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-xl">Próximas visitas</CardTitle>
                <CardDescription>Servicios programados y confirmados en tu cronograma.</CardDescription>
              </div>
              <Link to="/consultorio/cronograma" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Ver cronograma <ArrowRight />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {proximos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes visitas programadas.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Triage</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proximos.map((s) => {
                    const equipo = equipos.find((e) => e.id === s.equipoId)
                    return (
                      <TableRow key={s.id}>
                        <TableCell>
                          <p className="font-medium">{s.tipo}</p>
                          <p className="text-xs text-muted-foreground">{equipo?.nombre}</p>
                        </TableCell>
                        <TableCell>
                          <p>{fechaCorta(s.fecha)}</p>
                          <p className="text-xs text-muted-foreground">{s.franja}</p>
                        </TableCell>
                        <TableCell>
                          <TriageBadge criticidad={s.criticidad} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{s.estado}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Estado del plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{plan?.nombre ?? 'Sin plan'}</span>
                <Badge variant="good">Activo</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{plan?.rangoEquipos}</p>
              <Progress value={cumplimiento} />
              <p className="text-xs text-muted-foreground">
                {verde} de {equipos.length} equipos con documentación vigente.
              </p>
              <Link to="/consultorio/perfil" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}>
                Gestionar plan
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Alertas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alertas.length === 0 && <p className="text-sm text-muted-foreground">Sin alertas pendientes.</p>}
              {alertas.map((alerta) => (
                <div key={alerta.id} className="flex items-start gap-3 rounded-md border border-border bg-background p-3">
                  <SemaforoBadge semaforo={alerta.tono} />
                  <div>
                    <p className="text-sm font-medium leading-5">{alerta.texto}</p>
                    <p className="text-xs text-muted-foreground">{alerta.detalle}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="font-display text-xl">Accesos rápidos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/consultorio/equipos', label: 'Inventario y hojas de vida', icon: Gauge },
            { to: '/consultorio/expediente', label: 'Expediente documental', icon: FileCheck2 },
            { to: '/consultorio/repuestos', label: 'Repuestos', icon: Package },
            { to: '/consultorio/calidad', label: 'Calificar un servicio', icon: Wrench },
          ].map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-md border border-border bg-background px-4 py-4 text-sm font-medium transition hover:border-primary hover:bg-accent"
            >
              <Icon className="size-5 text-primary" /> {label}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
