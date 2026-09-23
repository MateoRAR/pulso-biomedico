import { Activity, BadgeCheck, MapPin, TrendingUp, Users } from 'lucide-react'

import { PageHeader, StatCard } from '@/components/shared/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cop } from '@/lib/format'
import { useData } from '@/lib/store'

const CANALES = [
  { fuente: 'Socios comerciales y aliados', cac: 42000, conversion: 48 },
  { fuente: 'Buscadores y contenido digital', cac: 78000, conversion: 31 },
  { fuente: 'Voz a voz de la red', cac: 51000, conversion: 39 },
  { fuente: 'Directorio público de ingenieros', cac: 63000, conversion: 27 },
]

export function AdminMetricas() {
  const { metricas, ingenieros, equipos, servicios, aliados } = useData()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administración Pulso"
        titulo="Métricas de canal y operación"
        descripcion="Indicadores del modelo multilateral: conversión, costo de adquisición, tiempo de respuesta y renovación."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Conversión registro → contratación" value={`${metricas.conversionRegistroContratacion}%`} icon={<TrendingUp />} tone="good" />
        <StatCard label="CAC promedio" value={cop(metricas.cacPromedioCOP)} hint="Costo de adquisición" />
        <StatCard label="Registro → primera visita" value={`${metricas.diasRegistroPrimeraVisita} días`} icon={<Activity />} />
        <StatCard label="Renovación anual" value={`${metricas.renovacionAnual}%`} tone="good" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Consultorios activos" value={metricas.consultoriosActivos} icon={<Users />} />
        <StatCard label="Ingenieros activos" value={ingenieros.length} hint={`${ingenieros.filter((i) => i.verificado).length} verificados`} icon={<BadgeCheck />} />
        <StatCard label="Servicios del mes" value={metricas.serviciosMes} />
        <StatCard label="Zonas con cobertura" value={metricas.coberturaZonas} hint="Cali y área metropolitana" icon={<MapPin />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Eficiencia por canal</CardTitle>
            <CardDescription>Costo de adquisición y conversión por fuente de origen.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fuente</TableHead>
                  <TableHead>CAC</TableHead>
                  <TableHead>Conversión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CANALES.map((c) => (
                  <TableRow key={c.fuente}>
                    <TableCell className="font-medium">{c.fuente}</TableCell>
                    <TableCell className="text-sm">{cop(c.cac)}</TableCell>
                    <TableCell className="text-sm">{c.conversion}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Red y dotación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="flex justify-between">
              <span className="text-muted-foreground">Equipos gestionados</span>
              <span className="font-semibold">{equipos.length}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Servicios registrados</span>
              <span className="font-semibold">{servicios.length}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Aliados activos</span>
              <span className="font-semibold">{aliados.length}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Ingenieros por verificar</span>
              <span className="font-semibold">{ingenieros.filter((i) => !i.verificado).length}</span>
            </p>
            <div className="rounded-md border border-border bg-background p-4 text-xs text-muted-foreground">
              El recurso más difícil de replicar es la red verificada combinada con la base de hojas de vida de equipos:
              ambas crecen con el uso y generan efectos de red locales.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
