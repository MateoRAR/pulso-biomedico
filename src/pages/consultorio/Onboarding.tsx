import { ArrowLeft, ArrowRight, Check, ClipboardList, FileWarning, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { PageHeader, SemaforoBadge } from '@/components/shared/ui'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Select } from '@/components/ui/field'
import { toast } from '@/components/ui/toast'
import { cop, semaforoEquipo } from '@/lib/format'
import { EVENTOS, track } from '@/lib/analytics'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

const PASOS = ['Sede', 'Dotación', 'Resultado']

export function ConsultorioOnboarding() {
  const { consultorio, equipos, documentos, planes, agregarServicio } = useData()
  const navigate = useNavigate()
  const [paso, setPaso] = useState(0)
  const [datos, setDatos] = useState(consultorio)

  const brechas = useMemo(() => {
    const sinCertificado = equipos.filter(
      (e) => !documentos.some((d) => d.equipoId === e.id && d.tipo === 'Certificado de calibración'),
    )
    const porSemaforo = equipos.map((e) => ({ equipo: e, semaforo: semaforoEquipo(e) }))
    return {
      sinCertificado,
      alerta: porSemaforo.filter((e) => e.semaforo === 'rojo').length,
      preventivo: porSemaforo.filter((e) => e.semaforo === 'amarillo').length,
    }
  }, [equipos, documentos])

  const planRecomendado = useMemo(() => {
    if (equipos.length > 15) return planes.find((p) => p.id === 'custom')
    return planes.find((p) => p.id === 'basico')
  }, [equipos.length, planes])

  function contratar() {
    const hoy = new Date().toISOString().slice(0, 10)
    const proximo = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)
    agregarServicio({
      id: `ser-${Date.now()}`,
      consultorioId: consultorio.id,
      equipoId: equipos[0]?.id ?? '',
      ingenieroId: null,
      tipo: 'Preventivo',
      criticidad: 'Programada',
      estado: 'Programada',
      fecha: proximo,
      franja: '08:00 - 10:00',
      zona: consultorio.zona,
      descripcion: `Incorporación inicial del plan ${planRecomendado?.nombre}.`,
      evidencia: [],
      creado: hoy,
      historial: [{ estado: 'Programada', fecha: hoy }],
    })
    toast.success('Plan contratado', { description: 'Generamos tu cronograma anual y el expediente inicial (simulado).' })
    track(EVENTOS.planContratado, { plan: planRecomendado?.id ?? 'ninguno', equipos: equipos.length })
    navigate('/consultorio')
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Onboarding"
        titulo="Diagnóstico inicial de dotación"
        descripcion="Al vincularte levantamos tu inventario real y calculamos las brechas frente a los estándares de habilitación."
      />

      <div className="flex items-center gap-3">
        {PASOS.map((nombre, index) => (
          <div key={nombre} className="flex items-center gap-3">
            <span
              className={cn(
                'grid size-8 place-items-center rounded-full text-sm font-bold',
                index <= paso ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              {index < paso ? <Check className="size-4" /> : index + 1}
            </span>
            <span className={cn('text-sm font-semibold', index <= paso ? 'text-foreground' : 'text-muted-foreground')}>
              {nombre}
            </span>
            {index < PASOS.length - 1 && <span className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {paso === 0 && (
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Datos de la sede</CardTitle>
            <CardDescription>Confirma la información para dimensionar tu plan.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="onb-nombre">Nombre del prestador</Label>
              <Input id="onb-nombre" value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onb-tipo">Tipo de prestador</Label>
              <Input id="onb-tipo" value={datos.tipo} onChange={(e) => setDatos({ ...datos, tipo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onb-segmento">Segmento</Label>
              <Select id="onb-segmento" value={datos.segmento} onChange={(e) => setDatos({ ...datos, segmento: e.target.value as 'A1' | 'A2' })}>
                <option value="A1">A1 · Microprestador unipersonal</option>
                <option value="A2">A2 · Dotación intensiva</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="onb-ciudad">Ciudad</Label>
              <Input id="onb-ciudad" value={datos.ciudad} onChange={(e) => setDatos({ ...datos, ciudad: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onb-zona">Zona</Label>
              <Select id="onb-zona" value={datos.zona} onChange={(e) => setDatos({ ...datos, zona: e.target.value })}>
                {['Sur', 'Norte', 'Centro', 'Oeste', 'Este'].map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button onClick={() => setPaso(1)}>
                Continuar <ArrowRight />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {paso === 1 && (
        <Card className="border-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-xl">Inventario de equipos ({equipos.length})</CardTitle>
                <CardDescription>Estos equipos forman la línea base de tu expediente.</CardDescription>
              </div>
              <Link to="/consultorio/equipos" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                Agregar equipos
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {equipos.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-md border border-border bg-background p-3">
                <div>
                  <p className="text-sm font-semibold">{e.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.marca} {e.modelo} · {e.tipo}
                  </p>
                </div>
                <SemaforoBadge semaforo={semaforoEquipo(e)} />
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setPaso(0)}>
                <ArrowLeft /> Atrás
              </Button>
              <Button onClick={() => setPaso(2)}>
                Ver resultado <ArrowRight />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {paso === 2 && (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Equipos registrados</p>
              <p className="font-display mt-2 text-3xl font-bold">{equipos.length}</p>
            </Card>
            <Card className="border-warning bg-warning/30 p-5">
              <p className="text-sm text-warning-foreground">Por vencer</p>
              <p className="font-display mt-2 text-3xl font-bold">{brechas.preventivo}</p>
            </Card>
            <Card className="border-alert bg-alert/30 p-5">
              <p className="text-sm text-alert-foreground">Requieren acción</p>
              <p className="font-display mt-2 text-3xl font-bold">{brechas.alerta}</p>
            </Card>
          </div>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Brechas frente a la habilitación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <FileWarning className="size-4 text-warning-foreground" />
                {brechas.sinCertificado.length} equipos sin certificado de calibración vigente.
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Recomendación: plan <strong>{planRecomendado?.nombre}</strong> para {equipos.length} equipos.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/60 bg-card/95 shadow-ocean">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="font-display text-2xl">{planRecomendado?.nombre}</CardTitle>
                  <CardDescription className="text-base">{planRecomendado?.segmento}</CardDescription>
                </div>
                <Badge>Recomendado</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <p>
                <span className="font-display text-4xl font-bold text-primary">
                  {planRecomendado ? (planRecomendado.precioTexto ?? cop(planRecomendado.precioCOP)) : '—'}
                </span>{' '}
                {planRecomendado && !planRecomendado.precioTexto && (
                  <span className="text-sm text-muted-foreground">/ mes</span>
                )}
              </p>
              <ul className="space-y-2 text-sm">
                {planRecomendado?.incluye.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="check-dot mt-0.5">
                      <Check />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setPaso(1)}>
                  <ArrowLeft /> Atrás
                </Button>
                <Button size="lg" className="shadow-ocean" onClick={contratar}>
                  <ClipboardList /> Contratar plan y generar cronograma
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
