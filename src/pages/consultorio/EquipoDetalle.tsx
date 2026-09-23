import { ArrowLeft, Package, Wrench } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { EstadoBadge, PageHeader, SemaforoBadge, TriageBadge } from '@/components/shared/ui'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fechaCorta, semaforoEquipo } from '@/lib/format'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

export function ConsultorioEquipoDetalle() {
  const { id } = useParams()
  const { equipos, servicios, documentos } = useData()
  const equipo = equipos.find((e) => e.id === id)

  if (!equipo) {
    return (
      <div className="space-y-6">
        <PageHeader titulo="Equipo no encontrado" descripcion="El equipo solicitado no está en tu inventario." />
        <Link to="/consultorio/equipos" className={buttonVariants({ variant: 'outline' })}>
          <ArrowLeft /> Volver al inventario
        </Link>
      </div>
    )
  }

  const historial = servicios.filter((s) => s.equipoId === equipo.id).sort((a, b) => b.fecha.localeCompare(a.fecha))
  const docs = documentos.filter((d) => d.equipoId === equipo.id)

  return (
    <div className="space-y-8">
      <Link to="/consultorio/equipos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Inventario
      </Link>

      <PageHeader
        eyebrow={`${equipo.marca} ${equipo.modelo}`}
        titulo={equipo.nombre}
        descripcion={`Serie ${equipo.serie} · ${equipo.sede} · Registro sanitario ${equipo.registroSanitario}`}
        acciones={
          <>
            <Link to="/consultorio/solicitudes/nueva" className={cn(buttonVariants(), 'shadow-ocean')}>
              <Wrench /> Solicitar servicio
            </Link>
            <Link to="/consultorio/repuestos" className={buttonVariants({ variant: 'outline' })}>
              <Package /> Pedir repuesto
            </Link>
          </>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Semáforo</p>
          <div className="mt-3">
            <SemaforoBadge semaforo={semaforoEquipo(equipo)} />
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Criticidad</p>
          <div className="mt-3">
            <TriageBadge criticidad={equipo.criticidad} />
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Próximo mantenimiento</p>
          <p className="font-display mt-2 text-lg font-bold">{fechaCorta(equipo.proximoMantenimiento)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Próxima calibración</p>
          <p className="font-display mt-2 text-lg font-bold">{fechaCorta(equipo.proximaCalibracion)}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Historial de intervenciones</CardTitle>
          </CardHeader>
          <CardContent>
            {historial.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay intervenciones registradas.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Garantía</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historial.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{fechaCorta(s.fecha)}</TableCell>
                      <TableCell className="text-sm">{s.tipo}</TableCell>
                      <TableCell>
                        <EstadoBadge estado={s.estado} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.garantiaHasta ? `Hasta ${fechaCorta(s.garantiaHasta)}` : '—'}
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
            <CardTitle className="font-display text-xl">Documentos del equipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {docs.length === 0 && <p className="text-sm text-muted-foreground">Sin documentos asociados.</p>}
            {docs.map((d) => (
              <div key={d.id} className="rounded-md border border-border bg-background p-3">
                <p className="text-sm font-medium">{d.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {d.tipo} · {fechaCorta(d.fecha)}
                  {d.laboratorio ? ` · ${d.laboratorio}` : ''}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
