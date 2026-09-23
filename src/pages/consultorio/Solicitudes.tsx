import { ClipboardList, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState, EstadoBadge, PageHeader, TriageBadge } from '@/components/shared/ui'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fechaCorta } from '@/lib/format'
import { useData } from '@/lib/store'
import type { Servicio } from '@/lib/mock/data'

export function ConsultorioSolicitudes() {
  const { servicios, equipos, ingenieros, actualizarServicio } = useData()
  const [detalle, setDetalle] = useState<Servicio | null>(null)

  const solicitudes = [...servicios].sort((a, b) => b.creado.localeCompare(a.creado))

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Seguimiento"
        titulo="Solicitudes de servicio"
        descripcion="Cada solicitud queda trazada desde su creación hasta el cierre, con el ingeniero asignado y su tiempo de respuesta."
        acciones={
          <Link to="/consultorio/solicitudes/nueva" className={`${buttonVariants()} shadow-ocean`}>
            <Plus /> Nueva solicitud
          </Link>
        }
      />

      {solicitudes.length === 0 ? (
        <EmptyState icon={<ClipboardList />} titulo="Sin solicitudes" descripcion="Crea una solicitud cuando un equipo lo necesite." />
      ) : (
        <Card className="overflow-hidden border-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitud</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Triage</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ingeniero</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.map((s) => {
                const equipo = equipos.find((e) => e.id === s.equipoId)
                const ingeniero = ingenieros.find((i) => i.id === s.ingenieroId)
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium">{s.tipo}</p>
                      <p className="text-xs text-muted-foreground">Creada {fechaCorta(s.creado)}</p>
                    </TableCell>
                    <TableCell className="text-sm">{equipo?.nombre}</TableCell>
                    <TableCell>
                      <TriageBadge criticidad={s.criticidad} />
                    </TableCell>
                    <TableCell>
                      <EstadoBadge estado={s.estado} />
                    </TableCell>
                    <TableCell className="text-sm">{ingeniero ? ingeniero.nombre : 'Por asignar'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setDetalle(s)}>
                        Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog
        open={Boolean(detalle)}
        onClose={() => setDetalle(null)}
        title={detalle ? `${detalle.tipo} · ${equipos.find((e) => e.id === detalle.equipoId)?.nombre}` : ''}
        description={detalle?.descripcion}
        footer={
          detalle && detalle.estado !== 'Cancelada' && detalle.estado !== 'Cerrada' ? (
            <Button
              variant="outline"
              onClick={() => {
                actualizarServicio(detalle.id, {
                  estado: 'Cancelada',
                  historial: [...detalle.historial, { estado: 'Cancelada', fecha: new Date().toISOString().slice(0, 10) }],
                })
                setDetalle(null)
              }}
            >
              Cancelar solicitud
            </Button>
          ) : null
        }
      >
        {detalle && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <TriageBadge criticidad={detalle.criticidad} conSla />
              <EstadoBadge estado={detalle.estado} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Línea de tiempo</p>
              <ol className="mt-3 space-y-3 border-l border-border pl-4">
                {detalle.historial.map((paso, index) => (
                  <li key={index} className="relative">
                    <span className="absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full bg-primary" />
                    <p className="text-sm font-medium">{paso.estado}</p>
                    <p className="text-xs text-muted-foreground">{fechaCorta(paso.fecha)}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-md border border-border bg-background p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Fecha programada:</span> {fechaCorta(detalle.fecha)} ·{' '}
                {detalle.franja}
              </p>
              <p>
                <span className="text-muted-foreground">Zona:</span> {detalle.zona}
              </p>
              {detalle.evidencia.length > 0 && (
                <p>
                  <span className="text-muted-foreground">Evidencia:</span> {detalle.evidencia.join(', ')}
                </p>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
