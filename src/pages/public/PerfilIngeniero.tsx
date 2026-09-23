import { ArrowLeft, BadgeCheck, CalendarCheck, MapPin, Star, Wrench } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { PublicFooter, PublicHeader } from '@/components/site/PublicLayout'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/misc'
import { useData } from '@/lib/store'

export function PerfilIngeniero() {
  const { slug } = useParams()
  const { ingenieros } = useData()
  const ingeniero = ingenieros.find((ing) => ing.slug === slug)

  if (!ingeniero) {
    return (
      <div className="bg-background text-foreground">
        <PublicHeader />
        <main className="mx-auto max-w-3xl px-5 py-32 text-center">
          <h1 className="font-display text-3xl font-bold">Este perfil no existe</h1>
          <p className="mt-3 text-muted-foreground">Vuelve al directorio para ver la red completa de profesionales.</p>
          <Link to="/consultorio/ingenieros" className={`${buttonVariants()} mt-7`}>
            Ir a la red de ingenieros
          </Link>
        </main>
        <PublicFooter />
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground">
      <PublicHeader />
      <main className="pt-16">
        <section className="ocean-band py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <Link
              to="/consultorio/ingenieros"
              className="inline-flex items-center gap-2 text-sm text-hero-muted hover:text-hero-foreground"
            >
              <ArrowLeft className="size-4" /> Red de ingenieros
            </Link>
            <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="animate-fade-in">
                {ingeniero.verificado && (
                  <Badge className="glass-badge border-glass-border bg-glass text-hero-foreground hover:bg-glass">
                    <BadgeCheck /> Credenciales verificadas
                  </Badge>
                )}
                <h1 className="font-display mt-5 text-4xl font-bold text-hero-foreground sm:text-5xl">
                  {ingeniero.nombre}
                </h1>
                <p className="mt-3 text-lg text-hero-muted">{ingeniero.titulo}</p>
                <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-hero-muted">
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-seafoam" /> {ingeniero.ciudad}
                  </span>
                  <span className="flex items-center gap-2">
                    <Star className="size-4 text-seafoam" /> {ingeniero.calificacion.toFixed(1)} ·{' '}
                    {ingeniero.servicios} servicios
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarCheck className="size-4 text-seafoam" /> {ingeniero.experiencia} años de experiencia
                  </span>
                </p>
              </div>
              <Link to="/registro" className={`${buttonVariants({ size: 'lg' })} h-12`}>
                Solicitar atención
              </Link>
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 lg:grid-cols-[1.4fr_1fr] lg:px-8">
            <div className="space-y-6">
              <Card className="border-border/80 bg-card/90">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Reseña profesional</CardTitle>
                </CardHeader>
                <CardContent className="leading-7 text-muted-foreground">{ingeniero.resena}</CardContent>
              </Card>

              <Card className="border-border/80 bg-card/90">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Equipos que atiende</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {ingeniero.equipos.map((equipo) => (
                    <p key={equipo} className="flex items-center gap-3 text-sm">
                      <span className="check-dot">
                        <Wrench />
                      </span>
                      {equipo}
                    </p>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/80 bg-card/90">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Opiniones de consultorios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {ingeniero.opiniones.length === 0 && (
                    <p className="text-sm text-muted-foreground">Aún no hay opiniones registradas.</p>
                  )}
                  {ingeniero.opiniones.map((op, index) => (
                    <div key={op.autor}>
                      {index > 0 && <Separator className="mb-5" />}
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <Star className="size-4 text-primary" /> {op.calificacion.toFixed(1)} · {op.autor}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{op.texto}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-border/80 bg-card/90">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Datos verificados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Inscripción INVIMA</span>
                    <span className="font-semibold">{ingeniero.registroInvima}</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Tarjeta COPNIA</span>
                    <span className="font-semibold">{ingeniero.tarjetaCopnia}</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Estado</span>
                    <span className="font-semibold">{ingeniero.estadoVerificacion}</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Zonas de atención</span>
                    <span className="text-right font-semibold">{ingeniero.zonas.join(', ')}</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/80 bg-card/90">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Especialidades</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {ingeniero.especialidades.map((esp) => (
                    <Badge key={esp} variant="secondary">
                      {esp}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/80 bg-card/90">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Certificaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {ingeniero.certificaciones.map((cert) => (
                    <div key={cert.nombre}>
                      <p className="font-semibold">{cert.nombre}</p>
                      <p className="text-muted-foreground">
                        {cert.entidad} · vigente hasta {cert.vigencia}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
