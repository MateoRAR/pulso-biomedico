import { Handshake } from 'lucide-react'

import { PageHeader } from '@/components/shared/ui'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useData } from '@/lib/store'
import type { Aliado } from '@/lib/mock/data'

const ORDEN: Aliado['tipo'][] = ['Habilitante', 'Acceso al mercado', 'Sostenibilidad de la oferta']

const DESCRIPCION: Record<Aliado['tipo'], string> = {
  Habilitante: 'Sostienen componentes que la operación propia no cubre: trazabilidad metrológica y validez jurídica.',
  'Acceso al mercado': 'Determinan el costo de adquisición en un mercado atomizado.',
  'Sostenibilidad de la oferta': 'Aseguran que la capacidad de respuesta crezca al ritmo de la demanda.',
}

export function AdminAliados() {
  const { aliados } = useData()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administración"
        titulo="Aliados y distribuidores"
        descripcion="El activo que Pulso ofrece a sus aliados no es dinero, sino demanda agregada y programada."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {ORDEN.map((tipo) => {
          const lista = aliados.filter((a) => a.tipo === tipo)
          return (
            <Card key={tipo} className="border-border/80">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  <Handshake /> {tipo}
                </Badge>
                <CardTitle className="font-display pt-2 text-lg">{lista.length} aliados</CardTitle>
                <CardDescription className="text-sm leading-6">{DESCRIPCION[tipo]}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {lista.map((a) => (
                  <div key={a.id} className="rounded-md border border-border bg-background p-3">
                    <p className="text-sm font-semibold">{a.nombre}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <strong>Aporta:</strong> {a.aporta}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Recibe:</strong> {a.recibe}
                    </p>
                    <p className="mt-1 text-xs font-medium text-primary">{a.acuerdo}</p>
                  </div>
                ))}
                {lista.length === 0 && <p className="text-sm text-muted-foreground">Sin aliados en esta categoría.</p>}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="font-display text-xl">Mapa de aliados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aliado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Aporta</TableHead>
                <TableHead>Recibe</TableHead>
                <TableHead>Acuerdo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aliados.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.nombre}</TableCell>
                  <TableCell className="text-sm">{a.tipo}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.aporta}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.recibe}</TableCell>
                  <TableCell className="text-sm">{a.acuerdo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
