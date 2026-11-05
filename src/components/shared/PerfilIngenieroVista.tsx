import { ArrowLeft, Award, BadgeCheck, CalendarCheck, CheckCircle2, ClipboardCheck, MapPin, Quote, Star, Wrench } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'

import type { Ingeniero } from '@/data/tipos'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { iniciales, textoCalificacion } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Fila de estrellas (de 0 a 5) que aparecen una tras otra. */
function Estrellas({ valor, className }: { valor: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`${valor.toFixed(1)} de 5 estrellas`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          style={{ '--delay': `${i * 70}ms` } as CSSProperties}
          className={cn('animate-star size-4', i < Math.round(valor) ? 'fill-current text-amber-400' : 'text-muted-foreground/40')}
        />
      ))}
    </span>
  )
}

/** Dato destacado del encabezado: número grande y qué significa. */
function Cifra({ icono, valor, etiqueta }: { icono: ReactNode; valor: string; etiqueta: string }) {
  return (
    <div className="rounded-xl border border-glass-border bg-glass px-4 py-3 backdrop-blur transition-transform duration-300 hover:-translate-y-0.5">
      <span className="flex items-center gap-2 text-xs font-medium text-hero-muted [&_svg]:size-4 [&_svg]:text-seafoam">
        {icono} {etiqueta}
      </span>
      <p className="font-display mt-1.5 text-2xl font-bold leading-none text-hero-foreground">{valor}</p>
    </div>
  )
}

function Seccion({ titulo, children, className }: { titulo: string; children: ReactNode; className?: string }) {
  return (
    <Card className={cn('border-border/70 bg-card/95', className)}>
      <CardHeader>
        <CardTitle className="font-display text-xl">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

/**
 * Perfil de un ingeniero. Se usa en dos sitios:
 *  - página pública (`/ingenieros/:slug`), con la barra del sitio;
 *  - dentro del espacio del consultorio (`/consultorio/ingenieros/:slug`), para no salir de él.
 */
export function PerfilIngenieroVista({ ingeniero, enPortal }: { ingeniero: Ingeniero; enPortal: boolean }) {
  const destino = enPortal ? `/consultorio/solicitudes/nueva?ingeniero=${ingeniero.id}` : '/registro'
  const hayOpiniones = ingeniero.opiniones.length > 0
  const mesActual = new Date().toISOString().slice(0, 7)

  // Cuántas opiniones tiene cada puntaje (solo con lo registrado).
  const reparto = [5, 4, 3, 2, 1].map((n) => ({
    n,
    cuenta: ingeniero.opiniones.filter((o) => Math.round(o.calificacion) === n).length,
  }))

  return (
    <>
      <section className="ocean-band py-10 lg:py-14">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          {enPortal && (
            <Link to="/consultorio/ingenieros" className="animate-fade-up inline-flex min-h-10 items-center gap-2 text-sm text-hero-muted transition-colors hover:text-hero-foreground">
              <ArrowLeft className="size-4" /> Volver a Encontrar ingeniero
            </Link>
          )}

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4 sm:gap-5">
              <span
                aria-hidden="true"
                style={{ '--delay': '60ms' } as CSSProperties }
                className="animate-fade-up font-display grid size-16 shrink-0 place-items-center rounded-2xl border border-glass-border bg-glass text-2xl font-bold text-hero-foreground shadow-lg backdrop-blur sm:size-20 sm:text-3xl"
              >
                {iniciales(ingeniero.nombre)}
              </span>
              <div className="min-w-0">
                <div className="animate-fade-up flex flex-wrap items-center gap-2" style={{ '--delay': '100ms' } as CSSProperties}>
                  {ingeniero.verificado ? (
                    <Badge className="border-glass-border bg-glass text-hero-foreground hover:bg-glass">
                      <BadgeCheck /> Credenciales verificadas
                    </Badge>
                  ) : (
                    <Badge className="border-glass-border bg-glass text-hero-foreground hover:bg-glass">En verificación</Badge>
                  )}
                  {ingeniero.disponible && (
                    <Badge className="border-glass-border bg-glass text-hero-foreground hover:bg-glass">
                      <span className="relative flex size-2">
                        <span className="animate-ping-soft absolute inline-flex size-full rounded-full bg-seafoam" />
                        <span className="relative inline-flex size-2 rounded-full bg-seafoam" />
                      </span>
                      Disponible para nuevos servicios
                    </Badge>
                  )}
                </div>
                <h1 className="font-display animate-fade-up mt-3 text-3xl font-bold text-hero-foreground sm:text-4xl" style={{ '--delay': '150ms' } as CSSProperties}>
                  {ingeniero.nombre}
                </h1>
                <p className="animate-fade-up mt-1.5 text-base text-hero-muted sm:text-lg" style={{ '--delay': '200ms' } as CSSProperties}>
                  {ingeniero.titulo}
                </p>
                <p className="animate-fade-up mt-2 flex items-center gap-2 text-sm text-hero-muted" style={{ '--delay': '250ms' } as CSSProperties}>
                  <MapPin className="size-4 text-seafoam" /> {ingeniero.ciudad} · {ingeniero.zonas.join(', ')}
                </p>
              </div>
            </div>
            <Link
              to={destino}
              style={{ '--delay': '300ms' } as CSSProperties}
              className={cn(buttonVariants({ size: 'lg' }), 'animate-fade-up shadow-ocean h-12 shrink-0 px-6 text-base')}
            >
              {enPortal ? 'Pedirle un servicio' : 'Solicitar atención'}
            </Link>
          </div>

          <div className="cascada mt-7 grid grid-cols-3 gap-3 sm:max-w-2xl">
            <Cifra icono={<Star />} etiqueta="Calificación" valor={hayOpiniones ? ingeniero.calificacion.toFixed(1) : '—'} />
            <Cifra icono={<ClipboardCheck />} etiqueta="Servicios" valor={String(ingeniero.servicios)} />
            <Cifra icono={<CalendarCheck />} etiqueta="Experiencia" valor={`${ingeniero.experiencia} años`} />
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="cascada mx-auto grid max-w-6xl gap-6 px-5 lg:grid-cols-[1.45fr_1fr] lg:px-8">
          <div className="space-y-6">
            <Seccion titulo="Presentación">
              <p className="text-base leading-7 text-muted-foreground">{ingeniero.resena || 'Este profesional todavía no ha escrito su presentación.'}</p>
            </Seccion>

            <Seccion titulo="Equipos que atiende">
              {ingeniero.equipos.length === 0 ? (
                <p className="text-base text-muted-foreground">Aún no ha indicado los equipos que atiende.</p>
              ) : (
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {ingeniero.equipos.map((equipo) => (
                    <li
                      key={equipo}
                      className="group flex items-center gap-3 rounded-xl border border-border/70 bg-background/60 px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-accent/60"
                    >
                      <span className="check-dot transition-transform duration-200 group-hover:scale-110">
                        <Wrench />
                      </span>
                      <span className="min-w-0">{equipo}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Seccion>

            <Seccion titulo="Opiniones de consultorios">
              {!hayOpiniones ? (
                <p className="text-base text-muted-foreground">Aún no hay opiniones registradas.</p>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-5 rounded-xl border border-border/70 bg-background/60 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
                    <div className="text-center sm:px-4">
                      <p className="font-display text-4xl font-bold leading-none">{textoCalificacion(ingeniero)}</p>
                      <Estrellas valor={ingeniero.calificacion} className="mt-2" />
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {ingeniero.opiniones.length} {ingeniero.opiniones.length === 1 ? 'opinión' : 'opiniones'}
                      </p>
                    </div>
                    <div className="space-y-1.5" aria-label="Reparto de las opiniones por puntaje">
                      {reparto.map(({ n, cuenta }, i) => (
                        <div key={n} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="w-3 text-right tabular-nums">{n}</span>
                          <Star className="size-3 text-amber-400" />
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <span
                              style={{ width: `${(cuenta / ingeniero.opiniones.length) * 100}%`, '--delay': `${200 + i * 90}ms` } as CSSProperties}
                              className="animate-grow-x block h-full rounded-full bg-primary"
                            />
                          </span>
                          <span className="w-4 tabular-nums">{cuenta}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {ingeniero.opiniones.map((op, index) => (
                      <li key={`${op.autor}-${op.fecha}-${index}`} className="relative rounded-xl border border-border/70 p-4 transition-colors duration-200 hover:border-primary/40">
                        <Quote className="absolute right-4 top-4 size-5 text-primary/20" aria-hidden="true" />
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">{iniciales(op.autor)}</span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{op.autor}</p>
                            <Estrellas valor={op.calificacion} />
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{op.texto}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Seccion>
          </div>

          <div className="space-y-6">
            <Seccion titulo="Zonas de atención">
              <div className="flex flex-wrap gap-2">
                {ingeniero.zonas.map((zona) => (
                  <Badge key={zona} variant="secondary" className="text-sm">
                    <MapPin /> {zona}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Ciudad base: {ingeniero.ciudad}.</p>
              <Link to={destino} className={cn(buttonVariants({ size: 'lg' }), 'mt-4 w-full')}>
                {enPortal ? 'Pedirle un servicio' : 'Solicitar atención'}
              </Link>
            </Seccion>

            <Seccion titulo="Datos verificados">
              <dl className="space-y-3 text-sm">
                {[
                  ['Inscripción INVIMA', ingeniero.registroInvima],
                  ['Tarjeta COPNIA', ingeniero.tarjetaCopnia],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="break-all text-right font-semibold">{v}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Estado</dt>
                  <dd>
                    <Badge variant={ingeniero.verificado ? 'good' : 'outline'}>
                      {ingeniero.verificado && <CheckCircle2 />} {ingeniero.estadoVerificacion}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </Seccion>

            <Seccion titulo="Especialidades">
              <div className="flex flex-wrap gap-2">
                {ingeniero.especialidades.map((esp) => (
                  <Badge key={esp} variant="secondary" className="text-sm">
                    {esp}
                  </Badge>
                ))}
              </div>
            </Seccion>

            <Seccion titulo="Certificaciones">
              {ingeniero.certificaciones.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin certificaciones registradas.</p>
              ) : (
                <ul className="space-y-3">
                  {ingeniero.certificaciones.map((cert) => {
                    const vigente = cert.vigencia >= mesActual
                    return (
                      <li key={cert.nombre} className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
                        <span className="check-dot mt-0.5">
                          <Award />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-5">{cert.nombre}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{cert.entidad}</p>
                          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant={vigente ? 'good' : 'alert'}>{vigente ? 'Vigente' : 'Vencida'}</Badge>
                            hasta {cert.vigencia}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Seccion>
          </div>
        </div>
      </section>
    </>
  )
}
