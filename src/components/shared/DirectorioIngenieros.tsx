import { ArrowRight, BadgeCheck, MapPin, Search, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Select } from '@/components/ui/field'
import { Switch } from '@/components/ui/misc'
import { ciudades, especialidades } from '@/lib/mock/data'
import { useData } from '@/lib/store'

export function DirectorioIngenieros() {
  const { ingenieros } = useData()
  const [texto, setTexto] = useState('')
  const [ciudad, setCiudad] = useState('todas')
  const [especialidad, setEspecialidad] = useState('todas')
  const [soloVerificados, setSoloVerificados] = useState(true)

  const resultados = useMemo(
    () =>
      ingenieros.filter((ing) => {
        const coincideTexto =
          texto.trim() === '' ||
          `${ing.nombre} ${ing.equipos.join(' ')} ${ing.especialidades.join(' ')}`
            .toLowerCase()
            .includes(texto.toLowerCase())
        const coincideCiudad = ciudad === 'todas' || ing.ciudad === ciudad
        const coincideEsp = especialidad === 'todas' || ing.especialidades.includes(especialidad)
        const coincideVerif = !soloVerificados || ing.verificado
        return coincideTexto && coincideCiudad && coincideEsp && coincideVerif
      }),
    [ingenieros, texto, ciudad, especialidad, soloVerificados],
  )

  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-card/90">
        <CardContent className="grid gap-5 p-6 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="buscar">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="buscar"
                className="pl-9"
                placeholder="Nombre, equipo o especialidad"
                value={texto}
                onChange={(event) => setTexto(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Select id="ciudad" value={ciudad} onChange={(event) => setCiudad(event.target.value)}>
              <option value="todas">Todas las ciudades</option>
              {ciudades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="especialidad">Especialidad</Label>
            <Select id="especialidad" value={especialidad} onChange={(event) => setEspecialidad(event.target.value)}>
              <option value="todas">Todas</option>
              {especialidades.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-3 pb-2">
            <Switch id="verificados" checked={soloVerificados} onCheckedChange={setSoloVerificados} />
            <Label htmlFor="verificados">Solo verificados</Label>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        {resultados.length} {resultados.length === 1 ? 'profesional' : 'profesionales'} en la red
      </p>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {resultados.map((ing) => (
          <Card key={ing.slug} className="feature-card flex flex-col border-border/80 bg-card/90">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="font-display text-xl">{ing.nombre}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{ing.titulo}</p>
                </div>
                {ing.verificado ? (
                  <Badge variant="good">
                    <BadgeCheck /> Verificado
                  </Badge>
                ) : (
                  <Badge variant="outline">En verificación</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-5">
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 text-primary" /> {ing.ciudad} · {ing.zonas.slice(0, 2).join(', ')}
                </p>
                <p className="flex items-center gap-2">
                  <Star className="size-4 text-primary" /> {ing.calificacion.toFixed(1)}
                  <span className="text-muted-foreground">· {ing.servicios} servicios</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {ing.especialidades.slice(0, 3).map((esp) => (
                    <Badge key={esp} variant="secondary">
                      {esp}
                    </Badge>
                  ))}
                </div>
              </div>
              <Link to={`/ingenieros/${ing.slug}`} className={buttonVariants({ variant: 'outline' })}>
                Ver perfil <ArrowRight />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {resultados.length === 0 && (
        <Card className="border-dashed bg-card/60">
          <CardContent className="p-10 text-center text-muted-foreground">
            No encontramos profesionales con esos filtros. Prueba ampliando la ciudad o la especialidad.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
