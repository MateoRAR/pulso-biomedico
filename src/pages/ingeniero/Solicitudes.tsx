import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState, PageHeader, TriageBadge } from '@/components/shared/ui'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import { fechaCorta } from '@/lib/format'
import { useSession } from '@/lib/session'
import { useData } from '@/lib/store'
import type { Servicio } from '@/lib/mock/data'
import { SLA as SLA_MAP } from '@/lib/mock/data'

const ORDEN = { Crítica: 0, Alta: 1, Media: 2, Programada: 3 } as const

export function IngenieroSolicitudes() {
  const { sesion } = useSession()
  const { ingenieros, servicios, equipos, consultorio, actualizarServicio } = useData()
  const yo = ingenieros.find((i) => i.nombre === sesion?.nombre) ?? ingenieros[0]

  const [filtro, setFiltro] = useState('pendientes')
  const [detalle, setDetalle] = useState<Servicio | null>(null)

  const lista = servicios
    .filter((s) => s.ingenieroId === yo.id || (s.ingenieroId === null && yo.zonas.includes(s.zona)))
    .filter((s) => {
      if (filtro === 'pendientes') return ['Asignada', 'Programada'].includes(s.estado)
      if (filtro === 'activos') return ['Confirmada', 'En ejecución'].includes(s.estado)
      return true
    })
    .sort((a, b) => ORDEN[a.criticidad] - ORDEN[b.criticidad])

  function aceptar(s: Servicio) {
    actualizarServicio(s.id, {
      ingenieroId: yo.id,
      estado: 'Confirmada',
      historial: [...s.historial, { estado: 'Confirmada', fecha: new Date().toISOString().slice(0, 10) }],
    })
    toast.success('Servicio aceptado', { description: `Confirmado para el ${fechaCorta(s.fecha)}.` })
    setDetalle(null)
  }

  function rechazar(s: Servicio) {
    actualizarServicio(s.id, { ingenieroId: null, estado: 'Programada' })
    toast.info('Asignación rechazada', { description: 'La plataforma reasignará a otro ingeniero de la zona.' })
    setDetalle(null)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Solicitudes"
        titulo="Cola de servicios"
        descripcion="Ordenada por criticidad y cercanía, no por orden de llegada. Revisa el SLA comprometido antes de aceptar."
        acciones={
          <Select value={filtro} onChange={(event) => setFiltro(event.target.value)} className="w-48">
            <option value="pendientes">Pendientes</option>
            <option value="activos">En curso</option>
            <option value="todas">Todas</option>
          </Select>
        }
      />

      {lista.length === 0 ? (
        <EmptyState titulo="Sin solicitudes" descripcion="No hay servicios que coincidan con el filtro." />
      ) : (
        <Card className="overflow-hidden border-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio</TableHead>
                <TableHead>Consultorio</TableHead>
                <TableHead>Triage / SLA</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-medium">{s.tipo}</p>
                    <p className="text-xs text-muted-foreground">{equipos.find((e) => e.id === s.equipoId)?.nombre}</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {consultorio.nombre}
                    <span className="block text-xs text-muted-foreground">Zona {s.zona}</span>
                  </TableCell>
                  <TableCell>
                    <TriageBadge criticidad={s.criticidad} />
                    <span className="mt-1 block text-xs text-muted-foreground">{SLA_MAP[s.criticidad]}</span>
                  </TableCell>
                  <TableCell className="text-sm">{fechaCorta(s.fecha)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setDetalle(s)}>
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
          detalle && ['Asignada', 'Programada'].includes(detalle.estado) ? (
            <>
              <Button variant="outline" onClick={() => rechazar(detalle)}>
                <X /> Rechazar
              </Button>
              <Button onClick={() => aceptar(detalle)}>
                <Check /> Aceptar
              </Button>
            </>
          ) : detalle ? (
            <Link to={`/ingeniero/servicios/${detalle.id}`} className={buttonVariants()}>
              Abrir ejecución
            </Link>
          ) : null
        }
      >
        {detalle && (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <TriageBadge criticidad={detalle.criticidad} conSla />
            </div>
            <p className="rounded-md border border-border bg-background p-3">
              <span className="text-muted-foreground">Fecha propuesta:</span> {fechaCorta(detalle.fecha)} ·{' '}
              {detalle.franja}
            </p>
            <p className="rounded-md border border-border bg-background p-3">
              <span className="text-muted-foreground">Zona:</span> {detalle.zona} · {SLA_MAP[detalle.criticidad]}
            </p>
          </div>
        )}
      </Dialog>
    </div>
  )
}
