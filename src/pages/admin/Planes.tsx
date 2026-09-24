import { Save } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '@/components/shared/ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Select } from '@/components/ui/field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import { cop } from '@/lib/format'
import { useData } from '@/lib/store'

const SLA = [
  { nivel: 'Crítica', horas: 8 },
  { nivel: 'Alta', horas: 24 },
  { nivel: 'Media', horas: 72 },
  { nivel: 'Programada', horas: 168 },
]

export function AdminPlanes() {
  const { planes } = useData()
  const [precios, setPrecios] = useState<Record<string, number>>(Object.fromEntries(planes.map((p) => [p.id, p.precioCOP])))
  const [comision, setComision] = useState(15)
  const [zonaDefecto, setZonaDefecto] = useState('Sur')

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administración"
        titulo="Planes y tarifas"
        descripcion="Parametriza precios, SLA por criticidad, comisión por servicio y reglas de ruteo por zona."
        acciones={
          <Button className="shadow-ocean" onClick={() => toast.success('Parámetros guardados', { description: 'Aplican a las nuevas cargas y cotizaciones.' })}>
            <Save /> Guardar
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Planes</CardTitle>
            <CardDescription>Precio mensual de referencia en COP.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {planes.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between gap-4 rounded-md border border-border bg-background p-3">
                <div>
                  <p className="text-sm font-semibold">{plan.nombre}</p>
                  <p className="text-xs text-muted-foreground">{plan.rangoEquipos}</p>
                </div>
                {plan.precioTexto ? (
                  <span className="text-sm font-semibold text-primary">{plan.precioTexto}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-32"
                      value={precios[plan.id]}
                      onChange={(event) => setPrecios({ ...precios, [plan.id]: Number(event.target.value) })}
                    />
                    <span className="text-xs text-muted-foreground">{cop(precios[plan.id] ?? 0)}</span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">SLA por criticidad</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Tiempo de respuesta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SLA.map((s) => (
                    <TableRow key={s.nivel}>
                      <TableCell className="font-medium">{s.nivel}</TableCell>
                      <TableCell className="text-sm">{s.horas} horas</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Comisión y ruteo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comision">Comisión por servicio (%)</Label>
                <Input
                  id="comision"
                  type="number"
                  value={comision}
                  onChange={(event) => setComision(Number(event.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zona">Zona de ruteo por defecto</Label>
                <Select id="zona" value={zonaDefecto} onChange={(event) => setZonaDefecto(event.target.value)}>
                  {['Sur', 'Norte', 'Centro', 'Oeste', 'Este'].map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
