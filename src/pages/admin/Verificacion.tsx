import { BadgeCheck, X } from 'lucide-react'
import { useState } from 'react'

import { PageHeader, VerificadoBadge } from '@/components/shared/ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import { useData } from '@/lib/store'
import type { Ingeniero } from '@/lib/mock/data'

export function AdminVerificacion() {
  const { ingenieros } = useData()
  const [estados, setEstados] = useState<Record<string, Ingeniero['estadoVerificacion']>>(
    Object.fromEntries(ingenieros.map((i) => [i.id, i.estadoVerificacion])),
  )

  function cambiar(id: string, estado: Ingeniero['estadoVerificacion']) {
    setEstados((prev) => ({ ...prev, [id]: estado }))
    toast.success(`Ingeniero ${estado.toLowerCase()}`, { description: 'El sello público se actualiza de inmediato.' })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administración"
        titulo="Verificación de ingenieros"
        descripcion="Revisión de RUT, diploma, tarjeta COPNIA e inscripción INVIMA antes de publicar el sello de verificación."
      />

      <Card className="overflow-hidden border-border/80">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingeniero</TableHead>
              <TableHead>Ciudad / zonas</TableHead>
              <TableHead>INVIMA</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingenieros.map((ing) => {
              const estado = estados[ing.id]
              return (
                <TableRow key={ing.id}>
                  <TableCell>
                    <p className="font-medium">{ing.nombre}</p>
                    <p className="text-xs text-muted-foreground">{ing.titulo}</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {ing.ciudad}
                    <span className="block text-xs text-muted-foreground">{ing.zonas.join(', ')}</span>
                  </TableCell>
                  <TableCell className="text-sm">{ing.registroInvima}</TableCell>
                  <TableCell>
                    <VerificadoBadge verificado={estado === 'Verificado'} />
                    {estado !== 'Verificado' && <span className="ml-2 text-xs text-muted-foreground">{estado}</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => cambiar(ing.id, 'Verificado')}>
                        <BadgeCheck /> Verificar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => cambiar(ing.id, 'Rechazado')}>
                        <X /> Rechazar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      <Card className="border-dashed bg-card/60">
        <CardContent className="p-6 text-sm text-muted-foreground">
          La verificación se renueva periódicamente. Los vencimientos de credenciales generan alertas automáticas para
          solicitar la actualización antes de suspender el sello.
        </CardContent>
      </Card>
    </div>
  )
}
