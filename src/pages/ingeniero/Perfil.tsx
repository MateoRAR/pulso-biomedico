import { ExternalLink, Save } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { PageHeader, VerificadoBadge } from '@/components/shared/ui'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Select, Textarea } from '@/components/ui/field'
import { Switch } from '@/components/ui/misc'
import { toast } from '@/components/ui/toast'
import { useSession } from '@/lib/session'
import { useData } from '@/lib/store'

export function IngenieroPerfil() {
  const { sesion } = useSession()
  const { ingenieros } = useData()
  const yo = ingenieros.find((i) => i.nombre === sesion?.nombre) ?? ingenieros[0]

  const [perfil, setPerfil] = useState(yo)
  const [disponible, setDisponible] = useState(yo.disponible)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Perfil público"
        titulo="Edita tu perfil"
        descripcion="Así te ven los consultorios en el directorio de la red. Tu sello de verificación y calificación son visibles."
        acciones={
          <Button
            className="shadow-ocean"
            onClick={() => toast.success('Perfil actualizado', { description: 'Los cambios se reflejan en el directorio.' })}
          >
            <Save /> Guardar
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">Datos profesionales</CardTitle>
            <CardDescription>Ciudad, zonas de atención y especialidades.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={perfil.nombre} onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="titulo">Título profesional</Label>
              <Input id="titulo" value={perfil.titulo} onChange={(e) => setPerfil({ ...perfil, titulo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input id="ciudad" value={perfil.ciudad} onChange={(e) => setPerfil({ ...perfil, ciudad: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="segmento">Segmento</Label>
              <Select id="segmento" value={perfil.segmento} onChange={(e) => setPerfil({ ...perfil, segmento: e.target.value as 'B1' | 'B2' | 'B3' })}>
                <option value="B1">B1 · Independiente consolidado</option>
                <option value="B2">B2 · En etapa inicial</option>
                <option value="B3">B3 · Con contrato indefinido</option>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="resena">Reseña profesional</Label>
              <Textarea id="resena" value={perfil.resena} onChange={(e) => setPerfil({ ...perfil, resena: e.target.value })} />
            </div>
            <div className="flex items-center justify-between sm:col-span-2">
              <Label htmlFor="disponible">Disponible para nuevos servicios</Label>
              <Switch id="disponible" checked={disponible} onCheckedChange={setDisponible} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Vista previa pública</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{perfil.nombre}</p>
                  <p className="text-xs text-muted-foreground">{perfil.ciudad}</p>
                </div>
                <VerificadoBadge verificado={perfil.verificado} />
              </div>
              <div className="flex flex-wrap gap-2">
                {perfil.especialidades.map((esp) => (
                  <Badge key={esp} variant="secondary">
                    {esp}
                  </Badge>
                ))}
              </div>
              <Link to={`/ingenieros/${perfil.slug}`} className={`${buttonVariants({ variant: 'outline', size: 'sm' })} w-full`}>
                <ExternalLink /> Ver en el directorio
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Zonas de atención</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {perfil.zonas.map((zona) => (
                <Badge key={zona} variant="outline">
                  {zona}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-xl">Certificaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {perfil.certificaciones.map((cert) => (
                <div key={cert.nombre} className="rounded-md border border-border bg-background p-3">
                  <p className="font-semibold">{cert.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {cert.entidad} · vigente hasta {cert.vigencia}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
