import { CalendarDays, Clock, LayoutList, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Calendario, type EventoCalendario } from '@/components/shared/Calendario'
import { EmptyState, EstadoBadge, PageHeader, TriageBadge } from '@/components/shared/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'
import { fechaCorta } from '@/lib/format'
import { useSession } from '@/lib/session'
import { useData } from '@/lib/store'

const FRANJAS = ['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 17:00']

export function IngenieroAgenda() {
  const { sesion } = useSession()
  const { ingenieros, servicios, equipos, consultorio } = useData()
  const yo = ingenieros.find((i) => i.nombre === sesion?.nombre) ?? ingenieros[0]
  const [vista, setVista] = useState<'lista' | 'calendario'>('lista')

  const mios = useMemo(
    () =>
      servicios
        .filter((s) => s.ingenieroId === yo.id && s.estado !== 'Cancelada')
        .sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [servicios, yo.id],
  )

  const porDia = mios.reduce<Record<string, typeof mios>>((acc, s) => {
    acc[s.fecha] = [...(acc[s.fecha] ?? []), s]
    return acc
  }, {})

  const eventos: EventoCalendario[] = mios.map((s) => ({
    id: s.id,
    fecha: s.fecha,
    titulo: `${s.tipo} · ${equipos.find((e) => e.id === s.equipoId)?.nombre ?? ''}`,
    subtitulo: `${s.franja} · ${consultorio.nombre} · Zona ${s.zona}`,
    criticidad: s.criticidad,
  }))

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Agenda"
        titulo="Agenda y franjas horarias"
        descripcion="Organiza tu semana por franjas fijas y agrupa los servicios por zona para optimizar tus rutas."
        acciones={
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            <Button variant={vista === 'lista' ? 'default' : 'ghost'} size="sm" onClick={() => setVista('lista')}>
              <LayoutList /> Lista
            </Button>
            <Button variant={vista === 'calendario' ? 'default' : 'ghost'} size="sm" onClick={() => setVista('calendario')}>
              <CalendarDays /> Calendario
            </Button>
          </div>
        }
      />

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="font-display text-xl">Franjas fijas recurrentes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {FRANJAS.map((franja) => (
            <Badge key={franja} variant="secondary">
              {franja}
            </Badge>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Disponibilidad actualizada', { description: 'Tu franja quedó marcada como disponible.' })}
          >
            Editar disponibilidad
          </Button>
        </CardContent>
      </Card>

      {vista === 'calendario' ? (
        <Calendario eventos={eventos} />
      ) : Object.keys(porDia).length === 0 ? (
        <EmptyState titulo="Sin servicios en agenda" descripcion="Cuando te asignen servicios aparecerán aquí." />
      ) : (
        <div className="space-y-5">
          {Object.entries(porDia).map(([dia, lista]) => (
            <Card key={dia} className="border-border/80">
              <CardHeader>
                <CardTitle className="font-display text-lg">{fechaCorta(dia)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lista.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col gap-2 rounded-md border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {s.tipo} · {equipos.find((e) => e.id === s.equipoId)?.nombre}
                      </p>
                      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" /> {s.franja}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" /> {consultorio.nombre} · Zona {s.zona}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TriageBadge criticidad={s.criticidad} />
                      <EstadoBadge estado={s.estado} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
