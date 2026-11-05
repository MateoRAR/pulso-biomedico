import { ArrowLeft, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { PageHeader, TriageBadge } from '@/components/shared/ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Select, Textarea } from '@/components/ui/field'
import { toast } from '@/components/ui/toast'
import { NOMBRE_CRITICIDAD, SLA, type Criticidad, type Servicio } from '@/data/tipos'
import { EVENTOS, track } from '@/lib/analytics'
import { useData } from '@/lib/store'

const tipos: Servicio['tipo'][] = ['Correctivo', 'Preventivo', 'Calibración', 'Diagnóstico exprés', 'Capacitación']
const criticidades: Criticidad[] = ['Crítica', 'Alta', 'Media', 'Programada']

export function ConsultorioSolicitudNueva() {
  const { equipos, consultorio, ingenieros, agregarServicio } = useData()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [equipoId, setEquipoId] = useState(equipos[0]?.id ?? '')
  const [tipo, setTipo] = useState<Servicio['tipo']>('Correctivo')
  const [criticidad, setCriticidad] = useState<Criticidad>('Alta')
  const [descripcion, setDescripcion] = useState('')
  const [evidencia, setEvidencia] = useState('')

  const equipo = equipos.find((e) => e.id === equipoId)
  // '' = que Pulso asigne al más cercano; si no, el id del ingeniero elegido.
  const [ingenieroElegido, setIngenieroElegido] = useState(params.get('ingeniero') ?? '')

  const candidatos = useMemo(() => {
    const verificados = ingenieros.filter((i) => i.verificado && i.disponible)
    const enCiudad = verificados.filter((i) => i.ciudadId === consultorio.ciudadId)
    const lista = enCiudad.length ? enCiudad : verificados
    // los de su zona primero
    return [...lista].sort((a, b) => Number(b.zonas.includes(consultorio.zona)) - Number(a.zonas.includes(consultorio.zona)))
  }, [ingenieros, consultorio.ciudadId, consultorio.zona])

  const elegido = candidatos.find((i) => i.id === ingenieroElegido) ?? null

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
      ingenieroId: elegido?.id ?? null,
      tipo,
      criticidad,
      estado: elegido ? 'Asignada' : 'Programada',
      fecha,
      franja: '08:00 - 10:00',
      zona: consultorio.zona,
      descripcion: descripcion.trim(),
      evidencia: evidencia.trim() ? [evidencia.trim()] : [],
      creado: hoy,
      historial: elegido
        ? [
            { estado: 'Programada', fecha: hoy },
            { estado: 'Asignada', fecha: hoy },
          ]
        : [{ estado: 'Programada', fecha: hoy }],
    }
    agregarServicio(servicio)
    track(EVENTOS.solicitudCreada, { tipo, criticidad, zona: consultorio.zona, asignado: Boolean(elegido) })
    toast.success('Solicitud creada', {
      description: `${elegido ? `Enviada a ${elegido.nombre}` : 'Buscaremos al ingeniero más cercano'} · ${SLA[criticidad]}.`,
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
              <Label htmlFor="criticidad">¿Qué tan urgente es?</Label>
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
              <CardTitle className="font-display text-xl">Urgencia y tiempo de respuesta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <TriageBadge criticidad={criticidad} conSla />
              <p className="text-muted-foreground">{NOMBRE_CRITICIDAD[criticidad]}</p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">¿Con qué ingeniero?</CardTitle>
              <CardDescription>
                Ingenieros verificados de {consultorio.ciudad}. Puedes elegir uno o dejar que Pulso busque al más cercano.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-border bg-background p-3 has-[:checked]:border-primary has-[:checked]:bg-accent">
                <input type="radio" name="ingeniero" className="size-5 accent-[var(--primary)]" checked={!ingenieroElegido} onChange={() => setIngenieroElegido('')} />
                <span>
                  <span className="block text-sm font-semibold">Que Pulso elija al más cercano</span>
                  <span className="text-xs text-muted-foreground">Recomendado si no tienes preferencia</span>
                </span>
              </label>
              {candidatos.map((ing) => (
                <label key={ing.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-border bg-background p-3 has-[:checked]:border-primary has-[:checked]:bg-accent">
                  <input type="radio" name="ingeniero" className="size-5 accent-[var(--primary)]" checked={ingenieroElegido === ing.id} onChange={() => setIngenieroElegido(ing.id)} />
                  <span>
                    <span className="block text-sm font-semibold">{ing.nombre}</span>
                    <span className="text-xs text-muted-foreground">
                      {ing.zonas.join(', ')} · {ing.opiniones.length ? `★ ${ing.calificacion.toFixed(1)}` : 'Sin calificaciones'}
                    </span>
                  </span>
                </label>
              ))}
              {candidatos.length === 0 && <p className="text-sm text-muted-foreground">No hay ingenieros disponibles por ahora.</p>}
              <Link to="/consultorio/ingenieros" className="inline-block text-sm font-semibold text-primary hover:underline">
                Ver toda la red de ingenieros
              </Link>
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
