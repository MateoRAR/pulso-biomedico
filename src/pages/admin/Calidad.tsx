import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { PageHeader, StatCard } from '@/components/shared/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Label, Textarea } from '@/components/ui/field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import { fechaCorta } from '@/lib/format'
import { useData } from '@/lib/store'
import type { Reclamo } from '@/lib/mock/data'

export function AdminCalidad() {
  const { reclamos, calificaciones, ingenieros, servicios } = useData()
  const [estados, setEstados] = useState<Record<string, Reclamo['estado']>>(
    Object.fromEntries(reclamos.map((r) => [r.id, r.estado])),
  )
  const [resolver, setResolver] = useState<Reclamo | null>(null)
  const [resolucion, setResolucion] = useState('')

  const ranking = [...ingenieros].sort((a, b) => b.calificacion - a.calificacion)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administración"
        titulo="Control de calidad y reclamos"
        descripcion="Auditoría de la documentación, gestión de garantías y monitoreo de la calificación que condiciona la prioridad de asignación."
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Reclamos abiertos" value={reclamos.filter((r) => (estados[r.id] ?? r.estado) !== 'Resuelto').length} tone="warning" />
        <StatCard label="Calificaciones registradas" value={calificaciones.length} />
        <StatCard label="Servicios auditables" value={servicios.filter((s) => ['Ejecutada', 'Cerrada'].includes(s.estado)).length} tone="good" />
      </div>

      <Card className="overflow-hidden border-border/80">
        <CardHeader>
          <CardTitle className="font-display text-xl">Reclamos y garantías</CardTitle>
        </CardHeader>
        <CardContent>
          {reclamos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay reclamos radicados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Plazo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {reclamos.map((r) => {
                  const estado = estados[r.id] ?? r.estado
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.motivo}</TableCell>
                      <TableCell className="text-sm">{fechaCorta(r.plazo)}</TableCell>
                      <TableCell>
                        <Badge variant={estado === 'Resuelto' ? 'good' : 'warning'}>{estado}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setResolver(r)}>
                          <ShieldCheck /> Resolver
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="font-display text-xl">Ranking de ingenieros</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingeniero</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead>Verificación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map((ing) => (
                <TableRow key={ing.id}>
                  <TableCell className="font-medium">{ing.nombre}</TableCell>
                  <TableCell className="text-sm">★ {ing.calificacion.toFixed(1)}</TableCell>
                  <TableCell className="text-sm">{ing.servicios}</TableCell>
                  <TableCell className="text-sm">{ing.estadoVerificacion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(resolver)}
        onClose={() => setResolver(null)}
        title="Resolver reclamo"
        description={resolver?.motivo}
        footer={
          <>
            <Button variant="outline" onClick={() => setResolver(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (resolver) setEstados((prev) => ({ ...prev, [resolver.id]: 'Resuelto' }))
                toast.success('Reclamo resuelto', { description: resolucion || 'Cerrado conforme al procedimiento.' })
                setResolver(null)
                setResolucion('')
              }}
            >
              Marcar como resuelto
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <Label htmlFor="resolucion">Resolución</Label>
          <Textarea
            id="resolucion"
            value={resolucion}
            onChange={(event) => setResolucion(event.target.value)}
            placeholder="Describe la resolución y la reintervención si aplica."
          />
        </div>
      </Dialog>
    </div>
  )
}
