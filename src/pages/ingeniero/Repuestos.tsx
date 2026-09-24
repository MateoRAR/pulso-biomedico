import { Package, Plus } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '@/components/shared/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input, Label, Select, Textarea } from '@/components/ui/field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import { cop, fechaCorta } from '@/lib/format'
import { EVENTOS, track } from '@/lib/analytics'
import { useSession } from '@/lib/session'
import { useData } from '@/lib/store'

export function IngenieroRepuestos() {
  const { sesion } = useSession()
  const { ingenieros, servicios, equipos, repuestos, agregarPedido } = useData()
  const yo = ingenieros.find((i) => i.nombre === sesion?.nombre) ?? ingenieros[0]

  const ordenes = servicios.filter((s) => s.ingenieroId === yo.id && s.estado !== 'Cancelada')

  const [dialogo, setDialogo] = useState(false)
  const [servicioId, setServicioId] = useState(ordenes[0]?.id ?? '')
  const [repuesto, setRepuesto] = useState('')
  const [cantidad, setCantidad] = useState(1)

  const misPedidos = repuestos

  function solicitar() {
    const servicio = servicios.find((s) => s.id === servicioId)
    if (!servicio || !repuesto.trim()) {
      toast.error('Completa el pedido', { description: 'Selecciona la orden y describe el repuesto.' })
      return
    }
    agregarPedido({
      id: `rep-${Date.now()}`,
      equipoId: servicio.equipoId,
      consultorioId: servicio.consultorioId,
      repuesto: `${repuesto.trim()} (x${cantidad})`,
      distribuidor: 'Distribuidor autorizado asignado por Pulso',
      estado: 'Solicitado',
      precio: 150000 * cantidad,
      fecha: new Date().toISOString().slice(0, 10),
    })
    toast.success('Repuesto solicitado', { description: 'La plataforma lo enrutó al distribuidor autorizado.' })
    track(EVENTOS.repuestoSolicitado, { origen: 'ingeniero', repuesto: repuesto.trim(), cantidad })
    setDialogo(false)
    setRepuesto('')
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Repuestos"
        titulo="Solicitud de repuestos"
        descripcion="Solicita el repuesto desde la orden de servicio y la plataforma lo canaliza al distribuidor autorizado con precio negociado."
        acciones={
          <Button onClick={() => setDialogo(true)} className="shadow-ocean">
            <Plus /> Solicitar repuesto
          </Button>
        }
      />

      <Card className="overflow-hidden border-border/80">
        <CardHeader>
          <CardTitle className="font-display text-xl">Pedidos canalizados</CardTitle>
          <CardDescription>Ingreso por comisión o margen pactado con el distribuidor.</CardDescription>
        </CardHeader>
        <CardContent>
          {misPedidos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no has solicitado repuestos.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repuesto</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Distribuidor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {misPedidos.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.repuesto}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {equipos.find((e) => e.id === r.equipoId)?.nombre}
                    </TableCell>
                    <TableCell className="text-sm">{r.distribuidor}</TableCell>
                    <TableCell>
                      <Badge variant={r.estado === 'Entregado' ? 'good' : r.estado === 'En tránsito' ? 'warning' : 'secondary'}>
                        {r.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{cop(r.precio)}</TableCell>
                    <TableCell className="text-sm">{fechaCorta(r.fecha)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogo}
        onClose={() => setDialogo(false)}
        title="Solicitar repuesto"
        description="Desde la orden de servicio, sin asumir el rol de importador."
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogo(false)}>
              Cancelar
            </Button>
            <Button onClick={solicitar}>Enviar solicitud</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orden">Orden de servicio</Label>
            <Select id="orden" value={servicioId} onChange={(event) => setServicioId(event.target.value)}>
              {ordenes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tipo} · {equipos.find((e) => e.id === s.equipoId)?.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="repuesto">Repuesto</Label>
            <Textarea
              id="repuesto"
              value={repuesto}
              onChange={(event) => setRepuesto(event.target.value)}
              placeholder="Ej.: empaques de puerta de autoclave"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              type="number"
              min={1}
              value={cantidad}
              onChange={(event) => setCantidad(Number(event.target.value))}
            />
          </div>
        </div>
      </Dialog>

      <Card className="border-dashed bg-card/60">
        <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
          <Package className="size-5 text-primary" />
          Fase 2 (opcional): kit de repuestos de alta rotación preposicionado contigo, activable cuando el volumen lo
          justifique.
        </CardContent>
      </Card>
    </div>
  )
}
