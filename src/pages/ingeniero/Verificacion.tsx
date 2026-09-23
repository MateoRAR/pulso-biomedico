import { BadgeCheck, FileText, ShieldCheck } from 'lucide-react'

import { PageHeader, VerificadoBadge } from '@/components/shared/ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'
import { useSession } from '@/lib/session'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

export function IngenieroVerificacion() {
  const { sesion } = useSession()
  const { ingenieros } = useData()
  const yo = ingenieros.find((i) => i.nombre === sesion?.nombre) ?? ingenieros[0]

  const requisitos = [
    { nombre: 'Cédula y RUT', cumple: true },
    { nombre: 'Diploma de ingeniería biomédica', cumple: true },
    { nombre: 'Tarjeta profesional COPNIA', cumple: Boolean(yo.tarjetaCopnia && !yo.tarjetaCopnia.includes('trámite')) },
    { nombre: 'Inscripción INVIMA para el alcance declarado', cumple: yo.verificado },
    { nombre: 'Certificaciones técnicas vigentes', cumple: yo.certificaciones.length > 0 },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Credenciales"
        titulo="Estado de verificación"
        descripcion="Pulso verifica tu inscripción INVIMA y tu tarjeta COPNIA. El sello público sustituye la referencia informal."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Sello de verificación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4 rounded-lg border border-border bg-background p-5">
              <span
                className={cn(
                  'grid size-14 place-items-center rounded-full',
                  yo.verificado ? 'bg-good text-good-foreground' : 'bg-warning text-warning-foreground',
                )}
              >
                <BadgeCheck className="size-7" />
              </span>
              <div>
                <p className="font-display text-lg font-bold">{yo.estadoVerificacion}</p>
                <p className="text-sm text-muted-foreground">
                  {yo.verificado ? 'Apareces en el directorio público.' : 'Completa los requisitos para publicarte.'}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between gap-4">
                <span className="text-muted-foreground">Inscripción INVIMA</span>
                <span className="font-semibold">{yo.registroInvima}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-muted-foreground">Tarjeta COPNIA</span>
                <span className="font-semibold">{yo.tarjetaCopnia}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-muted-foreground">Segmento</span>
                <span className="font-semibold">{yo.segmento}</span>
              </p>
            </div>
            <VerificadoBadge verificado={yo.verificado} />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Requisitos</CardTitle>
            <CardDescription>Documentos revisados por el equipo de Pulso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {requisitos.map((r) => (
              <div key={r.nombre} className="flex items-center justify-between rounded-md border border-border bg-background p-3">
                <span className="flex items-center gap-3 text-sm">
                  <ShieldCheck className={cn('size-4', r.cumple ? 'text-good-foreground' : 'text-warning-foreground')} />
                  {r.nombre}
                </span>
                <span className={cn('text-xs font-bold uppercase', r.cumple ? 'text-good-foreground' : 'text-warning-foreground')}>
                  {r.cumple ? 'Cumple' : 'Pendiente'}
                </span>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => toast.info('Carga simulada', { description: 'Selecciona un archivo para actualizar tu credencial.' })}
              >
                <FileText /> Actualizar documento
              </Button>
              <Button
                className="shadow-ocean"
                onClick={() => toast.success('Renovación solicitada', { description: 'El equipo de Pulso revisará tus credenciales.' })}
              >
                <BadgeCheck /> Solicitar verificación
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
