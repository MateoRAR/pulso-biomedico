import { Save } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '@/components/shared/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Select } from '@/components/ui/field'
import { Switch } from '@/components/ui/misc'
import { toast } from '@/components/ui/toast'
import { cop } from '@/lib/format'
import { useData } from '@/lib/store'

export function ConsultorioPerfil() {
  const { consultorio, planes } = useData()
  const [datos, setDatos] = useState(consultorio)
  const [avisosCorreo, setAvisosCorreo] = useState(true)
  const [avisosVencimiento, setAvisosVencimiento] = useState(true)

  const plan = planes.find((p) => p.id === datos.planId)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Configuración"
        titulo="Perfil del consultorio"
        descripcion="Datos de la sede, plan contratado y preferencias de notificación."
        acciones={
          <Button className="shadow-ocean" onClick={() => toast.success('Cambios guardados', { description: 'Datos del consultorio actualizados.' })}>
            <Save /> Guardar cambios
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Datos de la sede</CardTitle>
            <CardDescription>Información usada para la asignación por cercanía y la documentación.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nombre">Nombre del prestador</Label>
              <Input id="nombre" value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nit">NIT</Label>
              <Input id="nit" value={datos.nit} onChange={(e) => setDatos({ ...datos, nit: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hab">Código de habilitación</Label>
              <Input id="hab" value={datos.codigoHabilitacion} onChange={(e) => setDatos({ ...datos, codigoHabilitacion: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input id="ciudad" value={datos.ciudad} onChange={(e) => setDatos({ ...datos, ciudad: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zona">Zona</Label>
              <Select id="zona" value={datos.zona} onChange={(e) => setDatos({ ...datos, zona: e.target.value })}>
                {['Sur', 'Norte', 'Centro', 'Oeste', 'Este'].map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" value={datos.direccion} onChange={(e) => setDatos({ ...datos, direccion: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contacto">Contacto administrativo</Label>
              <Input id="contacto" value={datos.contacto} onChange={(e) => setDatos({ ...datos, contacto: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" value={datos.telefono} onChange={(e) => setDatos({ ...datos, telefono: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Plan contratado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{plan?.nombre}</span>
                <Badge variant="good">Activo</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{plan?.rangoEquipos}</p>
              <p className="font-display text-2xl font-bold text-primary">
                {plan ? (plan.precioTexto ?? cop(plan.precioCOP)) : '—'}
              </p>
              <div className="space-y-2">
                <Label htmlFor="plan">Cambiar de plan</Label>
                <Select
                  id="plan"
                  value={datos.planId}
                  onChange={(e) => {
                    setDatos({ ...datos, planId: e.target.value })
                    toast.info('Plan actualizado', { description: 'El cambio aplica desde el próximo ciclo (simulado).' })
                  }}
                >
                  {planes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} — {p.precioTexto ?? cop(p.precioCOP)}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Notificaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="avisos-correo">Recibir avisos por correo</Label>
                <Switch id="avisos-correo" checked={avisosCorreo} onCheckedChange={setAvisosCorreo} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="avisos-vencimiento">Alertas de vencimiento</Label>
                <Switch id="avisos-vencimiento" checked={avisosVencimiento} onCheckedChange={setAvisosVencimiento} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Usuarios de la cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-md border border-border bg-background p-3">
                <p className="font-semibold">{datos.contacto}</p>
                <p className="text-muted-foreground">{datos.cargoContacto} · Administrador</p>
              </div>
              <p className="text-xs text-muted-foreground">La gestión de usuarios adicionales está en el siguiente bloque.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
