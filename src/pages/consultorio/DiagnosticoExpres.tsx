import { CheckCircle2, Zap } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/shared/ui'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Select, Textarea } from '@/components/ui/field'
import { toast } from '@/components/ui/toast'
import { cop } from '@/lib/format'
import { useData } from '@/lib/store'
import type { Servicio } from '@/lib/mock/data'

const PRECIO_EXPRES = 89000

export function ConsultorioDiagnosticoExpres() {
  const { equipos, consultorio, agregarServicio } = useData()
  const [equipoId, setEquipoId] = useState(equipos[0]?.id ?? '')
  const [sintoma, setSintoma] = useState('')
  const [enviado, setEnviado] = useState(false)

  const equipo = equipos.find((e) => e.id === equipoId)

  function solicitar(event: React.FormEvent) {
    event.preventDefault()
    if (!equipo || !sintoma.trim()) {
      toast.error('Completa el formulario', { description: 'Selecciona el equipo y describe el síntoma.' })
      return
    }
    const hoy = new Date().toISOString().slice(0, 10)
    const fecha = new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10)
    const servicio: Servicio = {
      id: `ser-${Date.now()}`,
      consultorioId: consultorio.id,
      equipoId: equipo.id,
      ingenieroId: null,
      tipo: 'Diagnóstico exprés',
      criticidad: 'Media',
      estado: 'Programada',
      fecha,
      franja: '16:00 - 17:00',
      zona: consultorio.zona,
      descripcion: `Diagnóstico exprés: ${sintoma.trim()}`,
      evidencia: [],
      creado: hoy,
      historial: [{ estado: 'Programada', fecha: hoy }],
    }
    agregarServicio(servicio)
    setEnviado(true)
    toast.success('Diagnóstico exprés agendado', { description: `Visita corta para ${equipo.nombre}.` })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Puerta de entrada"
        titulo="Diagnóstico exprés"
        descripcion="Visita corta de bajo costo para evaluar si un equipo amerita reparación, sin comprometerte a un plan completo."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Solicita tu diagnóstico</CardTitle>
            <CardDescription>Elige el equipo y describe el síntoma. Te confirmamos la visita por correo.</CardDescription>
          </CardHeader>
          <CardContent>
            {enviado ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <CheckCircle2 className="size-10 text-good-foreground" />
                <p className="font-display text-lg font-bold">Diagnóstico agendado</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Un ingeniero de la red revisará {equipo?.nombre} y te entregará una recomendación: reparar, incluir en
                  plan o reemplazar.
                </p>
                <div className="flex gap-2">
                  <Link to="/consultorio/solicitudes" className={buttonVariants({ variant: 'outline' })}>
                    Ver seguimiento
                  </Link>
                  <a href="/#planes" className={buttonVariants()}>
                    Ver planes
                  </a>
                </div>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={solicitar}>
                <div className="space-y-2">
                  <Label htmlFor="equipo-expres">Equipo</Label>
                  <Select id="equipo-expres" value={equipoId} onChange={(event) => setEquipoId(event.target.value)}>
                    {equipos.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre} · {e.marca} {e.modelo}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sintoma">¿Qué está pasando?</Label>
                  <Textarea
                    id="sintoma"
                    value={sintoma}
                    onChange={(event) => setSintoma(event.target.value)}
                    placeholder="Ej.: la unidad odontológica pierde presión de aire."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto">Contacto</Label>
                  <Input id="contacto" defaultValue={consultorio.telefono} readOnly />
                </div>
                <Button type="submit" size="lg" className="w-full shadow-ocean">
                  <Zap /> Agendar diagnóstico exprés
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/90">
          <CardHeader>
            <CardTitle className="font-display text-xl">Qué incluye</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3">
              <span>Visita corta de evaluación</span>
              <span className="font-display text-lg font-bold text-primary">{cop(PRECIO_EXPRES)}</span>
            </p>
            <ul className="space-y-2">
              <li>• Revisión del equipo y del entorno de operación.</li>
              <li>• Recomendación clara: reparar, incluir en plan o reemplazar.</li>
              <li>• Registro en la hoja de vida del equipo.</li>
              <li>• Si contratas un plan, el valor se abona a tu primera cuota.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
