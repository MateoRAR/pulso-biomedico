import { Package, Plus } from 'lucide-react'
import { useState } from 'react'

import { EmptyState, PageHeader, StatCard } from '@/components/shared/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input, Label, Select } from '@/components/ui/field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import { cop, fechaCorta } from '@/lib/format'
import { useData } from '@/lib/store'
import type { PedidoRepuesto } from '@/lib/mock/data'

const CATALOGO = [
  { repuesto: 'Kit de válvula reguladora de presión', equipo: 'Compresor dental', distribuidor: 'Dental Supply Colombia', precio: 185000 },
  { repuesto: 'Empaques de puerta de autoclave', equipo: 'Autoclave 23 L', distribuidor: 'Esterilización Andina', precio: 96000 },
  { repuesto: 'Filtro de aire para compresor', equipo: 'Compresor dental', distribuidor: 'Dental Supply Colombia', precio: 42000 },
  { repuesto: 'Lámpara LED de fotocurado', equipo: 'Unidad odontológica', distribuidor: 'Dentsply Distribuidor Autorizado', precio: 320000 },
  { repuesto: 'Sensor intraoral (reemplazo)', equipo: 'Rayos X periapical', distribuidor: 'Imagenología Andina', precio: 1450000 },
]

export function ConsultorioRepuestos() {
  const { repuestos, equipos, consultorio, agregarPedido } = useData()
  const [dialogo, setDialogo] = useState(false)
  const [seleccion, setSeleccion] = useState(CATALOGO[0].repuesto)
  const [equipoId, setEquipoId] = useState(equipos[0]?.id ?? '')

  function pedir() {
    const item = CATALOGO.find((c) => c.repuesto === seleccion) ?? CATALOGO[0]
    const pedido: PedidoRepuesto = {
      id: `rep-${Date.now()}`,
      equipoId,
      consultorioId: consultorio.id,
      repuesto: item.repuesto,
      distribuidor: item.distribuidor,
      estado: 'Solicitado',
      precio: item.precio,
      fecha: new Date().toISOString().slice(0, 10),
    }
    agregarPedido(pedido)
    toast.success('Repuesto solicitado', {
      description: `Se enrutó a ${item.distribuidor} con precio negociado por volumen.`,
    })
    setDialogo(false)
  }

  const total = repuestos.reduce((sum, r) => sum + r.precio, 0)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Repuestos"
        titulo="Partes con distribuidores autorizados"
        descripcion="Pulso no importa ni posee stock: canaliza la demanda agregada de la red hacia distribuidores autorizados, con precio negociado por volumen."
        acciones={
          <Button onClick={() => setDialogo(true)} className="shadow-ocean">
            <Plus /> Solicitar repuesto
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Pedidos activos" value={repuestos.filter((r) => r.estado !== 'Entregado').length} icon={<Package />} />
        <StatCard label="Pedidos históricos" value={repuestos.length} />
        <StatCard label="Valor canalizado" value={cop(total)} />
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="font-display text-xl">Catálogo frecuente</CardTitle>
          <CardDescription>Precios de referencia negociados con distribuidores autorizados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repuesto</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Distribuidor</TableHead>
                <TableHead>Precio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CATALOGO.map((item) => (
                <TableRow key={item.repuesto}>
                  <TableCell className="font-medium">{item.repuesto}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.equipo}</TableCell>
                  <TableCell className="text-sm">{item.distribuidor}</TableCell>
                  <TableCell className="text-sm">{cop(item.precio)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {repuestos.length === 0 ? (
        <EmptyState icon={<Package />} titulo="Sin pedidos de repuestos" />
      ) : (
        <Card className="overflow-hidden border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Seguimiento de pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repuesto</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Distribuidor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repuestos.map((r) => (
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
                    <TableCell className="text-sm">{fechaCorta(r.fecha)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={dialogo}
        onClose={() => setDialogo(false)}
        title="Solicitar repuesto"
        description="La plataforma lo enruta al distribuidor autorizado correspondiente."
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogo(false)}>
              Cancelar
            </Button>
            <Button onClick={pedir}>Enviar pedido</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repuesto">Repuesto</Label>
            <Select id="repuesto" value={seleccion} onChange={(event) => setSeleccion(event.target.value)}>
              {CATALOGO.map((item) => (
                <option key={item.repuesto} value={item.repuesto}>
                  {item.repuesto} — {cop(item.precio)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="equipo-repuesto">Equipo</Label>
            <Select id="equipo-repuesto" value={equipoId} onChange={(event) => setEquipoId(event.target.value)}>
              {equipos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} · {e.marca} {e.modelo}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input id="cantidad" type="number" defaultValue={1} min={1} />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
