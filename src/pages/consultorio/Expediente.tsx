import { Download, FileCheck2, FileWarning } from 'lucide-react'

import { EmptyState, PageHeader, StatCard } from '@/components/shared/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import { diasHasta, fechaCorta } from '@/lib/format'
import { useData } from '@/lib/store'

export function ConsultorioExpediente() {
  const { documentos, equipos, consultorio } = useData()

  const vigentes = documentos.filter((d) => !d.vigencia || (diasHasta(d.vigencia) ?? 999) > 30)
  const porVencer = documentos.filter((d) => d.vigencia && (diasHasta(d.vigencia) ?? 999) <= 30)

  const equiposSinCertificado = equipos.filter(
    (e) => !documentos.some((d) => d.equipoId === e.id && d.tipo === 'Certificado de calibración'),
  )

  function descargar(nombre: string) {
    toast.success('Descarga simulada', { description: `${nombre} (PDF de demostración).` })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Expediente documental"
        titulo="Documentación lista para auditoría"
        descripcion="Certificados, informes y hojas de vida consolidados. La generación es automática al cierre de cada servicio."
        acciones={
          <Button
            className="shadow-ocean"
            onClick={() =>
              toast.success('Expediente exportado', {
                description: `Se generó el paquete documental de ${consultorio.nombre} (simulado).`,
              })
            }
          >
            <Download /> Descargar expediente completo
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Documentos vigentes" value={vigentes.length} icon={<FileCheck2 />} tone="good" />
        <StatCard label="Por vencer o vencidos" value={porVencer.length} icon={<FileWarning />} tone="warning" />
        <StatCard label="Equipos sin certificado" value={equiposSinCertificado.length} hint="Requieren calibración" tone="alert" />
      </div>

      {documentos.length === 0 ? (
        <EmptyState icon={<FileCheck2 />} titulo="Aún no hay documentos" descripcion="Se generan al cerrar cada servicio." />
      ) : (
        <Card className="overflow-hidden border-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.map((d) => {
                const equipo = equipos.find((e) => e.id === d.equipoId)
                const dias = diasHasta(d.vigencia)
                const vencido = d.vigencia && (dias ?? 0) < 0
                const porVencerDoc = d.vigencia && (dias ?? 999) <= 30 && !vencido
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <p className="font-medium">{d.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.tipo}
                        {d.laboratorio ? ` · ${d.laboratorio}` : ''}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">{equipo?.nombre}</TableCell>
                    <TableCell className="text-sm">{fechaCorta(d.fecha)}</TableCell>
                    <TableCell className="text-sm">{d.vigencia ? fechaCorta(d.vigencia) : 'Permanente'}</TableCell>
                    <TableCell>
                      <Badge variant={vencido ? 'alert' : porVencerDoc ? 'warning' : 'good'}>
                        {vencido ? 'Vencido' : porVencerDoc ? 'Por vencer' : 'Vigente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => descargar(d.nombre)}>
                        <Download /> PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {equiposSinCertificado.length > 0 && (
        <Card className="border-dashed border-alert/60 bg-alert/20">
          <CardContent className="p-6">
            <p className="font-display font-bold">Documentación faltante</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Estos equipos no tienen certificado de calibración vigente en el expediente:
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {equiposSinCertificado.map((e) => (
                <li key={e.id}>• {e.nombre} ({e.sede})</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
