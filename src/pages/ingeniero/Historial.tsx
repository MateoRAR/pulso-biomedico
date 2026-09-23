import { Download, Star } from 'lucide-react'

import { EstadoBadge, PageHeader, StatCard } from '@/components/shared/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import { comisionIngeniero, cop, fechaCorta } from '@/lib/format'
import { useSession } from '@/lib/session'
import { useData } from '@/lib/store'

export function IngenieroHistorial() {
  const { sesion } = useSession()
  const { ingenieros, servicios, equipos, consultorio, calificaciones } = useData()
  const yo = ingenieros.find((i) => i.nombre === sesion?.nombre) ?? ingenieros[0]

  const mios = servicios.filter((s) => s.ingenieroId === yo.id)
  const completados = mios.filter((s) => ['Ejecutada', 'Cerrada'].includes(s.estado))
  const ingresos = completados.reduce((sum, s) => sum + comisionIngeniero(s.tipo), 0)
  const misCalificaciones = calificaciones.filter((c) => c.ingenieroId === yo.id)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Historial e ingresos"
        titulo="Tu producción en la red"
        descripcion="Servicios ejecutados, comisión neta estimada y la reputación que construyes con cada intervención."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Servicios completados" value={completados.length} tone="good" />
        <StatCard label="Ingresos netos estimados" value={cop(ingresos)} hint="80 % del valor del servicio" />
        <StatCard label="Calificación promedio" value={yo.calificacion.toFixed(1)} icon={<Star />} />
        <StatCard label="Servicios totales" value={yo.servicios} hint="Histórico en la red" />
      </div>

      <Card className="overflow-hidden border-border/80">
        <CardHeader>
          <CardTitle className="font-display text-xl">Servicios ejecutados</CardTitle>
        </CardHeader>
        <CardContent>
          {completados.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no has cerrado servicios.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Consultorio</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Comisión neta</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {completados.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium">{s.tipo}</p>
                      <p className="text-xs text-muted-foreground">{equipos.find((e) => e.id === s.equipoId)?.nombre}</p>
                    </TableCell>
                    <TableCell className="text-sm">{consultorio.nombre}</TableCell>
                    <TableCell className="text-sm">{fechaCorta(s.fecha)}</TableCell>
                    <TableCell>
                      <EstadoBadge estado={s.estado} />
                    </TableCell>
                    <TableCell className="text-sm font-semibold">{cop(comisionIngeniero(s.tipo))}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success('Documento descargado', { description: 'Certificado de demostración.' })}
                      >
                        <Download /> Certificado
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="font-display text-xl">Calificaciones recibidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {misCalificaciones.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay calificaciones.</p>}
          {misCalificaciones.map((c) => (
            <div key={c.id} className="rounded-md border border-border bg-background p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Star className="size-4 text-primary" /> {c.estrellas.toFixed(1)} · {c.autor}
                <Badge variant="outline">{fechaCorta(c.fecha)}</Badge>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{c.comentario}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
