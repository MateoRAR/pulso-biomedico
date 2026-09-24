import { ArrowLeft, Camera, CheckCircle2, FileCheck2, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { EstadoBadge, PageHeader, TriageBadge } from '@/components/shared/ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Select, Textarea } from '@/components/ui/field'
import { toast } from '@/components/ui/toast'
import { fechaCorta } from '@/lib/format'
import { EVENTOS, track } from '@/lib/analytics'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

const TAREAS_PREVENTIVO = [
  'Inspección visual y limpieza del equipo',
  'Verificación de parámetros y ajustes',
  'Revisión de cableado y conexiones',
  'Prueba funcional de operación',
]

const TAREAS_CALIBRACION = [
  'Verificación de patrones trazables',
  'Medición de parámetros contra patrón',
  'Ajuste y corrección de desviaciones',
  'Emisión de certificado con laboratorio acreditado',
]

export function IngenieroServicioDetalle() {
  const { id } = useParams()
  const { servicios, equipos, consultorio, actualizarServicio, agregarDocumento } = useData()
  const servicio = servicios.find((s) => s.id === id)

  const [hechas, setHechas] = useState<string[]>([])
  const [evidencias, setEvidencias] = useState<string[]>(servicio?.evidencia ?? [])
  const [resultado, setResultado] = useState('Operativo')
  const [tema, setTema] = useState('Cuidado preventivo del autoclave')
  const [asistentes, setAsistentes] = useState(2)

  if (!servicio) {
    return (
      <div className="space-y-6">
        <PageHeader titulo="Servicio no encontrado" />
        <Link to="/ingeniero/solicitudes" className={buttonVariantsSafe()}>
          <ArrowLeft /> Volver
        </Link>
      </div>
    )
  }

  const equipo = equipos.find((e) => e.id === servicio.equipoId)
  const tareas = servicio.tipo === 'Calibración' ? TAREAS_CALIBRACION : TAREAS_PREVENTIVO

  function agregarEvidencia() {
    const nombre = `Foto ${evidencias.length + 1} (${new Date().toLocaleTimeString('es-CO')})`
    setEvidencias([...evidencias, nombre])
    toast.info('Evidencia capturada', { description: nombre })
  }

  function cerrar() {
    if (!servicio) return
    const hoy = new Date().toISOString().slice(0, 10)
    const garantia = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10)
    actualizarServicio(servicio.id, {
      estado: 'Ejecutada',
      evidencia: evidencias,
      garantiaHasta: garantia,
      historial: [...servicio.historial, { estado: 'Ejecutada', fecha: hoy }],
      capacitacion: { tema, duracion: '15 min', asistentes },
    })
    agregarDocumento({
      id: `doc-${Date.now()}`,
      equipoId: servicio.equipoId,
      tipo: servicio.tipo === 'Calibración' ? 'Certificado de calibración' : 'Informe de mantenimiento',
      nombre: `${servicio.tipo} ${equipo?.nombre} — ${hoy}`,
      fecha: hoy,
      vigencia: garantia,
    })
    toast.success('Servicio cerrado', { description: 'Se generó el documento y quedó en el expediente.' })
    track(EVENTOS.servicioCerrado, { tipo: servicio.tipo, resultado, evidencias: evidencias.length })
  }

  return (
    <div className="space-y-8">
      <Link to="/ingeniero/solicitudes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Solicitudes
      </Link>

      <PageHeader
        eyebrow="Ejecución de servicio"
        titulo={`${servicio.tipo} · ${equipo?.nombre}`}
        descripcion={`${consultorio.nombre} · Zona ${servicio.zona} · ${fechaCorta(servicio.fecha)} ${servicio.franja}`}
        acciones={
          <>
            <TriageBadge criticidad={servicio.criticidad} />
            <EstadoBadge estado={servicio.estado} />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Checklist de la intervención</CardTitle>
            <CardDescription>Protocolo estandarizado según el tipo de servicio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {tareas.map((tarea) => {
              const activa = hechas.includes(tarea)
              return (
                <button
                  key={tarea}
                  type="button"
                  onClick={() => setHechas(activa ? hechas.filter((t) => t !== tarea) : [...hechas, tarea])}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md border p-3 text-left text-sm transition',
                    activa ? 'border-primary bg-accent' : 'border-border bg-background hover:bg-accent/50',
                  )}
                >
                  <CheckCircle2 className={cn('size-5', activa ? 'text-primary' : 'text-muted-foreground')} />
                  {tarea}
                </button>
              )
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Evidencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {evidencias.map((e) => (
                <p key={e} className="rounded-md border border-border bg-background p-2 text-sm">
                  {e}
                </p>
              ))}
              <Button variant="outline" className="w-full" onClick={agregarEvidencia}>
                <Camera /> Capturar evidencia
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Resultado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resultado">Estado del equipo</Label>
                <Select id="resultado" value={resultado} onChange={(event) => setResultado(event.target.value)}>
                  <option>Operativo</option>
                  <option>Requiere repuesto</option>
                  <option>Requiere reemplazo</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obs">Observaciones</Label>
                <Textarea id="obs" placeholder="Notas de la intervención" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Capacitación al personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tema">Tema</Label>
                <Input id="tema" value={tema} onChange={(event) => setTema(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asistentes">Asistentes</Label>
                <Input
                  id="asistentes"
                  type="number"
                  min={1}
                  value={asistentes}
                  onChange={(event) => setAsistentes(Number(event.target.value))}
                />
              </div>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <GraduationCap className="size-4" /> Minutos de cuidado preventivo en cada visita.
              </p>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full shadow-ocean" onClick={cerrar} disabled={servicio.estado === 'Ejecutada' || servicio.estado === 'Cerrada'}>
            <FileCheck2 /> Cerrar servicio y emitir documento
          </Button>
        </div>
      </div>
    </div>
  )
}

function buttonVariantsSafe() {
  return 'inline-flex h-10 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-semibold'
}
