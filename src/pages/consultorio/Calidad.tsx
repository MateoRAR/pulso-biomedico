import { ShieldCheck, Star } from 'lucide-react'
import { useState } from 'react'

import { EstadoBadge, PageHeader } from '@/components/shared/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Label, Select, Textarea } from '@/components/ui/field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import { fechaCorta } from '@/lib/format'
import { useData } from '@/lib/store'
import type { Reclamo, Servicio } from '@/lib/mock/data'
import { cn } from '@/lib/utils'

export function ConsultorioCalidad() {
  const { servicios, equipos, ingenieros, calificaciones, reclamos, consultorio, agregarCalificacion, agregarReclamo } = useData()

  const [calificar, setCalificar] = useState<Servicio | null>(null)
  const [estrellas, setEstrellas] = useState(5)
  const [comentario, setComentario] = useState('')

  const [reclamar, setReclamar] = useState<Servicio | null>(null)
  const [motivo, setMotivo] = useState('')

  const cerrables = servicios.filter((s) => ['Ejecutada', 'Cerrada'].includes(s.estado))
  const yaCalificados = new Set(calificaciones.map((c) => c.servicioId))

  function enviarCalificacion() {
    if (!calificar) return
    agregarCalificacion({
      id: `cal-${Date.now()}`,
      servicioId: calificar.id,
      ingenieroId: calificar.ingenieroId ?? '',
      autor: consultorio.nombre,
      estrellas,
      comentario: comentario.trim() || 'Servicio conforme.',
      fecha: new Date().toISOString().slice(0, 10),
    })
    toast.success('Calificación enviada', { description: 'Alimenta el perfil público del ingeniero.' })
    setCalificar(null)
    setComentario('')
    setEstrellas(5)
  }

  function enviarReclamo() {
    if (!reclamar || !motivo.trim()) {
      toast.error('Describe el motivo del reclamo')
      return
    }
    const plazo = new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10)
    const nuevo: Reclamo = {
      id: `rec-${Date.now()}`,
      servicioId: reclamar.id,
      consultorioId: consultorio.id,
      motivo: motivo.trim(),
      estado: 'Radicado',
      plazo,
      resolucion: '',
      fecha: new Date().toISOString().slice(0, 10),
    }
    agregarReclamo(nuevo)
    toast.success('Reclamo radicado', { description: `Plazo de respuesta: ${fechaCorta(plazo)}.` })
    setReclamar(null)
    setMotivo('')
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Calidad y garantías"
        titulo="Califica, reclama y haz valer tu garantía"
        descripcion="Cada servicio tiene un periodo de garantía. Tu calificación alimenta el perfil público del ingeniero y la prioridad de asignación futura."
      />

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="font-display text-xl">Servicios por calificar</CardTitle>
          <CardDescription>Califica la atención recibida al finalizar cada servicio.</CardDescription>
        </CardHeader>
        <CardContent>
          {cerrables.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no tienes servicios ejecutados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Ingeniero</TableHead>
                  <TableHead>Garantía</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cerrables.map((s) => {
                  const ingeniero = ingenieros.find((i) => i.id === s.ingenieroId)
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <p className="font-medium">{s.tipo}</p>
                        <p className="text-xs text-muted-foreground">{equipos.find((e) => e.id === s.equipoId)?.nombre}</p>
                      </TableCell>
                      <TableCell className="text-sm">{ingeniero?.nombre}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.garantiaHasta ? `Hasta ${fechaCorta(s.garantiaHasta)}` : '—'}
                      </TableCell>
                      <TableCell>
                        {yaCalificados.has(s.id) ? <Badge variant="good">Calificado</Badge> : <EstadoBadge estado={s.estado} />}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" disabled={yaCalificados.has(s.id)} onClick={() => setCalificar(s)}>
                            <Star /> Calificar
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setReclamar(s)}>
                            <ShieldCheck /> Reclamar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {reclamos.length > 0 && (
        <Card className="overflow-hidden border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Reclamos y garantías</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Plazo</TableHead>
                  <TableHead>Resolución</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reclamos.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.motivo}</TableCell>
                    <TableCell>
                      <Badge variant={r.estado === 'Resuelto' ? 'good' : 'warning'}>{r.estado}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{fechaCorta(r.plazo)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.resolucion || 'En proceso'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={Boolean(calificar)}
        onClose={() => setCalificar(null)}
        title="Calificar servicio"
        description={calificar ? `${calificar.tipo} · ${equipos.find((e) => e.id === calificar.equipoId)?.nombre}` : ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setCalificar(null)}>
              Cancelar
            </Button>
            <Button onClick={enviarCalificacion}>Enviar calificación</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Calificación</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setEstrellas(n)} aria-label={`${n} estrellas`}>
                  <Star className={cn('size-7', n <= estrellas ? 'fill-primary text-primary' : 'text-muted-foreground')} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comentario">Comentario</Label>
            <Textarea
              id="comentario"
              value={comentario}
              onChange={(event) => setComentario(event.target.value)}
              placeholder="¿Cómo fue la atención?"
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(reclamar)}
        onClose={() => setReclamar(null)}
        title="Radicar reclamo"
        description="Queda trazado con un procedimiento formal y plazos establecidos."
        footer={
          <>
            <Button variant="outline" onClick={() => setReclamar(null)}>
              Cancelar
            </Button>
            <Button onClick={enviarReclamo}>Radicar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo del reclamo</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              placeholder="Describe lo ocurrido con el servicio."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo-reclamo">Tipo</Label>
            <Select id="tipo-reclamo">
              <option>Reintervención dentro de garantía</option>
              <option>Documentación incompleta</option>
              <option>Incumplimiento de la visita</option>
              <option>Otro</option>
            </Select>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
