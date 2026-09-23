import { ArrowLeft, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { PageHeader, TriageBadge } from '@/components/shared/ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Select, Textarea } from '@/components/ui/field'
import { toast } from '@/components/ui/toast'
import { NOMBRE_CRITICIDAD, SLA, type Criticidad, type Servicio } from '@/lib/mock/data'
import { useData } from '@/lib/store'

const tipos: Servicio['tipo'][] = ['Correctivo', 'Preventivo', 'Calibración', 'Diagnóstico exprés', 'Capacitación']
const criticidades: Criticidad[] = ['Crítica', 'Alta', 'Media', 'Programada']

export function ConsultorioSolicitudNueva() {
  const { equipos, consultorio, ingenieros, agregarServicio } = useData()
  const navigate = useNavigate()

  const [equipoId, setEquipoId] = useState(equipos[0]?.id ?? '')
  const [tipo, setTipo] = useState<Servicio['tipo']>('Correctivo')
  const [criticidad, setCriticidad] = useState<Criticidad>('Alta')
  const [descripcion, setDescripcion] = useState('')
  const [evidencia, setEvidencia] = useState('')

  const equipo = equipos.find((e) => e.id === equipoId)

  const candidatos = useMemo(() => {
    if (!equipo) return ingenieros.filter((i) => i.verificado)
    const porZona = ingenieros.filter((i) => i.verificado && i.zonas.includes(consultorio.zona))
    return (porZona.length ? porZona : ingenieros.filter((i) => i.verificado)).slice(0, 3)
  }, [ingenieros, equipo, consultorio.zona])

  function enviar(event: React.FormEvent) {
    event.preventDefault()
    if (!equipo || !descripcion.trim()) {
      toast.error('Completa la solicitud', { description: 'Selecciona el equipo y describe la novedad.' })
      return
    }
    const hoy = new Date().toISOString().slice(0, 10)
    const fecha = new Date(Date.now() + (criticidad === 'Crítica' ? 1 : criticidad === 'Alta' ? 2 : 5) * 86_400_000)
      .toISOString()
      .slice(0, 10)
    const servicio: Servicio = {
      id: `ser-${Date.now()}`,
      consultorioId: consultorio.id,
      equipoId: equipo.id,
      ingenieroId: candidatos[0]?.id ?? null,
      tipo,
      criticidad,
      estado: 'Asignada',
      fecha,
      franja: '08:00 - 10:00',
      zona: consultorio.zona,
      descripcion: descripcion.trim(),
      evidencia: evidencia.trim() ? [evidencia.trim()] : [],
      creado: hoy,
      historial: [
        { estado: 'Programada', fecha: hoy },
        { estado: 'Asignada', fecha: hoy },
      ],
    }
    agregarServicio(servicio)
    toast.success('Solicitud creada', {
      description: `Asignada a ${candidatos[0]?.nombre ?? 'la red'} · ${SLA[criticidad]}.`,
    })
    navigate('/consultorio/solicitudes')
  }

  return (
    <div className="space-y-8">
      <Link
        to="/consultorio/solicitudes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Solicitudes
      </Link>

      <PageHeader
        eyebrow="Nueva solicitud"
        titulo="Solicitar un servicio"
        descripcion="La criticidad define el tiempo de respuesta comprometido (SLA) y el orden de asignación en la red."
      />

      <form onSubmit={enviar} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Datos de la novedad</CardTitle>
            <CardDescription>Cuéntanos qué equipo necesita atención y qué está pasando.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="equipo">Equipo</Label>
              <Select id="equipo" value={equipoId} onChange={(event) => setEquipoId(event.target.value)}>
                {equipos.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} · {e.marca} {e.modelo} ({e.sede})
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de servicio</Label>
              <Select id="tipo" value={tipo} onChange={(event) => setTipo(event.target.value as Servicio['tipo'])}>
                {tipos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="criticidad">Criticidad</Label>
              <Select id="criticidad" value={criticidad} onChange={(event) => setCriticidad(event.target.value as Criticidad)}>
                {criticidades.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descripcion">Descripción de la falla o solicitud</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                placeholder="Ej.: el autoclave no alcanza la temperatura de esterilización."
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="evidencia">Evidencia (opcional)</Label>
              <Input
                id="evidencia"
                value={evidencia}
                onChange={(event) => setEvidencia(event.target.value)}
                placeholder="Ej.: foto del panel de control"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Triage y SLA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <TriageBadge criticidad={criticidad} conSla />
              <p className="text-muted-foreground">{NOMBRE_CRITICIDAD[criticidad]}</p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Asignación sugerida</CardTitle>
              <CardDescription>Ingenieros verificados por cercanía a la zona {consultorio.zona}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidatos.map((ing) => (
                <div key={ing.id} className="rounded-md border border-border bg-background p-3">
                  <p className="text-sm font-semibold">{ing.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {ing.zonas.join(', ')} · ★ {ing.calificacion.toFixed(1)}
                  </p>
                </div>
              ))}
              {candidatos.length === 0 && <p className="text-sm text-muted-foreground">No hay ingenieros disponibles.</p>}
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full shadow-ocean">
            <Send /> Enviar solicitud
          </Button>
        </div>
      </form>
    </div>
  )
}
