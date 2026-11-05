import { BadgeCheck, X } from 'lucide-react'

import { PageHeader, VerificadoBadge } from '@/components/shared/ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import type { Ingeniero } from '@/data/tipos'
import { useData } from '@/lib/store'

/** Revisión rápida de credenciales. Los cambios se guardan en el ingeniero (y se ven en su perfil). */
export function AdminVerificacion() {
  const { ingenieros, actualizarIngeniero } = useData()

  function cambiar(ing: Ingeniero, estado: Ingeniero['estadoVerificacion']) {
    actualizarIngeniero(ing.id, { estadoVerificacion: estado, verificado: estado === 'Verificado' })
    toast.success(`${ing.nombre}: ${estado.toLowerCase()}`, { description: 'El sello público se actualiza de inmediato.' })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administración"
        titulo="Verificaciones"
        descripcion="Revisa los documentos profesionales (tarjeta COPNIA e inscripción INVIMA) antes de dar el sello de verificado."
      />

      <Card className="overflow-hidden border-border/80">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingeniero</TableHead>
              <TableHead>Ciudad y zonas</TableHead>
              <TableHead>INVIMA</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingenieros.map((ing) => (
              <TableRow key={ing.id}>
                <TableCell>
                  <p className="font-medium">{ing.nombre}</p>
                  <p className="text-sm text-muted-foreground">{ing.titulo}</p>
                </TableCell>
                <TableCell>
                  {ing.ciudad}
                  <span className="block text-sm text-muted-foreground">{ing.zonas.join(', ')}</span>
                </TableCell>
                <TableCell>{ing.registroInvima}</TableCell>
                <TableCell>
                  <VerificadoBadge verificado={ing.estadoVerificacion === 'Verificado'} />
                  {ing.estadoVerificacion !== 'Verificado' && <span className="ml-2 text-sm text-muted-foreground">{ing.estadoVerificacion}</span>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => cambiar(ing, 'Verificado')}>
                      <BadgeCheck /> Verificar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => cambiar(ing, 'Rechazado')}>
                      <X /> Rechazar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="border-dashed bg-card/60">
        <CardContent className="p-6 text-base text-muted-foreground">
          Para ver o editar todos los datos de un ingeniero, entra a la sección «Ingenieros».
        </CardContent>
      </Card>
    </div>
  )
}
