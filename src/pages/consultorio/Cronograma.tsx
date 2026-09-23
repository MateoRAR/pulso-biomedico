import { CalendarDays, Clock, LayoutList, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Calendario, type EventoCalendario } from '@/components/shared/Calendario'
import { EmptyState, PageHeader, TriageBadge } from '@/components/shared/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'
import { fechaCorta } from '@/lib/format'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export function ConsultorioCronograma() {
  const { servicios, equipos, ingenieros } = useData()
  const [vista, setVista] = useState<'lista' | 'calendario'>('lista')

  const activos = useMemo(() => servicios.filter((s) => s.estado !== 'Cancelada'), [servicios])

  const porMes = useMemo(() => {
    const grupos = new Map<string, typeof servicios>()
    ;[...activos]
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .forEach((s) => {
        const fecha = new Date(s.fecha + 'T00:00:00')
        const clave = `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`
        grupos.set(clave, [...(grupos.get(clave) ?? []), s])
      })
    return [...grupos.entries()]
  }, [activos])

  const eventos: EventoCalendario[] = activos.map((s) => ({
    id: s.id,
    fecha: s.fecha,
    titulo: `${s.tipo} · ${equipos.find((e) => e.id === s.equipoId)?.nombre ?? ''}`,
    subtitulo: `${s.franja} · ${ingenieros.find((i) => i.id === s.ingenieroId)?.nombre ?? 'Por asignar'}`,
    criticidad: s.criticidad,
  }))

  const franjas = useMemo(() => [...new Set(activos.map((s) => s.franja))], [activos])

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cronograma anual"
        titulo="Tu agenda de mantenimiento y calibración"
        descripcion="Fechas priorizadas por criticidad y vencimiento. Las visitas se agrupan por zona para sostener una cuota baja."
        acciones={
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            <Button
              variant={vista === 'lista' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setVista('lista')}
            >
              <LayoutList /> Lista
            </Button>
            <Button
              variant={vista === 'calendario' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setVista('calendario')}
            >
              <CalendarDays /> Calendario
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Servicios programados</p>
          <p className="font-display mt-2 text-3xl font-bold">
            {activos.filter((s) => s.estado === 'Programada').length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Confirmados</p>
          <p className="font-display mt-2 text-3xl font-bold">
            {activos.filter((s) => s.estado === 'Confirmada' || s.estado === 'Asignada').length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Franjas fijas activas</p>
          <p className="font-display mt-2 text-3xl font-bold">{franjas.length}</p>
        </Card>
      </div>

      {vista === 'calendario' ? (
        <Calendario eventos={eventos} />
      ) : porMes.length === 0 ? (
        <EmptyState icon={<CalendarDays />} titulo="Sin servicios programados" />
      ) : (
        <div className="space-y-6">
          {porMes.map(([mes, lista]) => (
            <Card key={mes} className="border-border/80">
              <CardHeader>
                <CardTitle className="font-display text-xl">{mes}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lista.map((s) => {
                  const equipo = equipos.find((e) => e.id === s.equipoId)
                  const ingeniero = ingenieros.find((i) => i.id === s.ingenieroId)
                  return (
                    <div
                      key={s.id}
                      className={cn(
                        'flex flex-col gap-3 rounded-md border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between',
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center rounded-md bg-secondary px-3 py-2">
                          <span className="font-display text-lg font-bold">{fechaCorta(s.fecha).slice(0, 2)}</span>
                          <span className="text-[0.65rem] uppercase text-muted-foreground">
                            {fechaCorta(s.fecha).split(' ')[1]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">
                            {s.tipo} · {equipo?.nombre}
                          </p>
                          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3.5" /> {s.franja}
                            </span>
                            <span>{ingeniero ? ingeniero.nombre : 'Ingeniero por asignar'}</span>
                            <span>Zona {s.zona}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TriageBadge criticidad={s.criticidad} />
                        <Badge variant="secondary">{s.estado}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toast.info('Reprogramación solicitada', {
                              description: `Te confirmaremos una nueva fecha para ${equipo?.nombre} por correo.`,
                            })
                          }
                        >
                          <RefreshCw /> Reprogramar
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
