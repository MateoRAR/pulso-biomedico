import { BadgeCheck, Boxes, MapPin, Users, Wrench } from 'lucide-react'

import { PageHeader } from '@/components/shared/ui'
import { TarjetaDato } from '@/components/shared/TarjetaDato'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTiempoEnPagina } from '@/lib/analytics'
import { semaforoEquipo } from '@/lib/format'
import { useData } from '@/lib/store'

/**
 * Resumen de la operación. Todas las cifras se calculan en este momento a partir de los datos
 * (consultorios, ingenieros, equipos y servicios); no hay números escritos a mano.
 */
export function AdminMetricas() {
  const { consultorios, ingenieros, equipos, servicios, aliados, ciudades } = useData()
  useTiempoEnPagina('portal_admin', { rol: 'admin' })

  const activos = consultorios.filter((c) => c.activo)
  const verificados = ingenieros.filter((i) => i.verificado)
  const enCurso = servicios.filter((s) => ['Programada', 'Asignada', 'Confirmada', 'En ejecución'].includes(s.estado))
  const cerrados = servicios.filter((s) => ['Ejecutada', 'Cerrada'].includes(s.estado))
  const porVencer = equipos.filter((e) => semaforoEquipo(e) !== 'verde').length

  const porCiudad = ciudades.map((ciudad) => ({
    ciudad,
    consultorios: activos.filter((c) => c.ciudadId === ciudad.id).length,
    ingenieros: ingenieros.filter((i) => i.ciudadId === ciudad.id).length,
    equipos: equipos.filter((e) => activos.some((c) => c.id === e.consultorioId && c.ciudadId === ciudad.id)).length,
  }))

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administración Pulso"
        titulo="Resumen de la operación"
        descripcion="Cifras calculadas con los datos que hay hoy en la plataforma: consultorios, ingenieros, equipos y servicios."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TarjetaDato etiqueta="Consultorios activos" valor={activos.length} nota={`${consultorios.length - activos.length} desactivados`} icono={<Users />} />
        <TarjetaDato etiqueta="Ingenieros" valor={ingenieros.length} nota={`${verificados.length} verificados`} icono={<BadgeCheck />} tono="bueno" />
        <TarjetaDato etiqueta="Equipos registrados" valor={equipos.length} nota={`${porVencer} con algo por atender`} icono={<Boxes />} />
        <TarjetaDato etiqueta="Servicios" valor={servicios.length} nota={`${enCurso.length} en curso · ${cerrados.length} terminados`} icono={<Wrench />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Presencia por ciudad</CardTitle>
            <CardDescription>Dónde están los consultorios y los ingenieros registrados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Consultorios</TableHead>
                  <TableHead>Ingenieros</TableHead>
                  <TableHead>Equipos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {porCiudad.map((fila) => (
                  <TableRow key={fila.ciudad.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <MapPin className="size-4 text-primary" /> {fila.ciudad.nombre}
                      </span>
                    </TableCell>
                    <TableCell>{fila.consultorios}</TableCell>
                    <TableCell>{fila.ingenieros}</TableCell>
                    <TableCell>{fila.equipos}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Red y aliados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="flex justify-between">
              <span className="text-muted-foreground">Ingenieros por verificar</span>
              <span className="font-semibold">{ingenieros.length - verificados.length}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Ingenieros disponibles ahora</span>
              <span className="font-semibold">{ingenieros.filter((i) => i.disponible && i.activo).length}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Solicitudes sin ingeniero</span>
              <span className="font-semibold">{servicios.filter((s) => s.ingenieroId === null && s.estado === 'Programada').length}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Aliados</span>
              <span className="font-semibold">{aliados.length}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
