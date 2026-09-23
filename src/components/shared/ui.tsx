import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ETIQUETA_SEMAFORO } from '@/lib/format'
import type { Criticidad, EstadoEquipo, EstadoServicio, Semaforo } from '@/lib/mock/data'
import { SLA } from '@/lib/mock/data'

export function SemaforoBadge({ semaforo, className }: { semaforo: Semaforo; className?: string }) {
  const variante = semaforo === 'verde' ? 'good' : semaforo === 'amarillo' ? 'warning' : 'alert'
  return (
    <Badge variant={variante} className={className}>
      {ETIQUETA_SEMAFORO[semaforo]}
    </Badge>
  )
}

export function TriageBadge({ criticidad, conSla = false }: { criticidad: Criticidad; conSla?: boolean }) {
  const variante = criticidad === 'Crítica' ? 'alert' : criticidad === 'Alta' ? 'warning' : criticidad === 'Media' ? 'secondary' : 'outline'
  return (
    <Badge variant={variante}>
      {criticidad}
      {conSla ? ` · ${SLA[criticidad]}` : ''}
    </Badge>
  )
}

export function EstadoBadge({ estado }: { estado: EstadoServicio | EstadoEquipo }) {
  const variante =
    estado === 'Ejecutada' || estado === 'Cerrada' || estado === 'Operativo'
      ? 'good'
      : estado === 'En ejecución' || estado === 'En mantenimiento' || estado === 'Confirmada'
        ? 'warning'
        : estado === 'Cancelada' || estado === 'Fuera de servicio'
          ? 'alert'
          : 'secondary'
  return <Badge variant={variante}>{estado}</Badge>
}

export function VerificadoBadge({ verificado }: { verificado: boolean }) {
  return verificado ? <Badge variant="good">Verificado</Badge> : <Badge variant="outline">En verificación</Badge>
}

export function PageHeader({
  eyebrow,
  titulo,
  descripcion,
  acciones,
}: {
  eyebrow?: string
  titulo: string
  descripcion?: string
  acciones?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="font-display mt-2 text-3xl font-bold leading-tight">{titulo}</h1>
        {descripcion && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'default',
  className,
}: {
  label: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
  tone?: 'default' | 'good' | 'warning' | 'alert'
  className?: string
}) {
  return (
    <Card
      className={cn(
        'p-5',
        tone === 'good' && 'border-good bg-good/40',
        tone === 'warning' && 'border-warning bg-warning/40',
        tone === 'alert' && 'border-alert bg-alert/40',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && <span className="text-primary [&_svg]:size-5">{icon}</span>}
      </div>
      <p className="font-display mt-3 text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  )
}

export function EmptyState({
  icon,
  titulo,
  descripcion,
  accion,
}: {
  icon?: ReactNode
  titulo: string
  descripcion?: string
  accion?: ReactNode
}) {
  return (
    <Card className="border-dashed bg-card/60">
      <div className="flex flex-col items-center gap-3 p-10 text-center">
        {icon && <span className="text-muted-foreground [&_svg]:size-8">{icon}</span>}
        <p className="font-display text-lg font-bold">{titulo}</p>
        {descripcion && <p className="max-w-md text-sm text-muted-foreground">{descripcion}</p>}
        {accion}
      </div>
    </Card>
  )
}
