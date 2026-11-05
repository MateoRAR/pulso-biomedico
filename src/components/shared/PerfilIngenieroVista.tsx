import { ArrowLeft, Award, BadgeCheck, Briefcase, CalendarCheck, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, ExternalLink, GraduationCap, MapPin, Pause, Play, Quote, Star, Wrench } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import type { Ingeniero, Opinion } from '@/data/tipos'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { haceCuanto, iniciales, textoCalificacion } from '@/lib/format'
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

/** Dato destacado de la tarjeta de presentación: icono, número grande y qué significa. */
function Cifra({ icono, valor, etiqueta, tono }: { icono: ReactNode; valor: string; etiqueta: string; tono: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-2 text-center sm:flex-row sm:gap-3 sm:px-5 sm:text-left">
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl [&_svg]:size-5', tono)}>{icono}</span>
      <div className="min-w-0">
        <p className="font-display text-xl font-bold leading-none sm:text-2xl">{valor}</p>
        <p className="mt-1 text-xs text-muted-foreground">{etiqueta}</p>
      </div>
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
/** Segundos que se queda cada opinión antes de pasar a la siguiente. */
const SEGUNDOS_OPINION = 6

/**
 * Carrusel de opiniones: avanza solo (con una barra de progreso en el punto activo), se pausa al
 * pasar el cursor o al enfocarlo, se desliza con el dedo y tiene flechas y puntos. Con "reducir
 * movimiento" no avanza solo. Muestra una opinión en celulares y dos en pantallas anchas.
 */
function CarruselOpiniones({ opiniones: todas }: { opiniones: Opinion[] }) {
  // La más reciente primero.
  const opiniones = [...todas].sort((a, b) => b.fecha.localeCompare(a.fecha))
  const [porVista, setPorVista] = useState(1)
  const [indice, setIndice] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [detenido, setDetenido] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const toque = useRef<number | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const medir = () => setPorVista(mq.matches ? 2 : 1)
    medir()
    mq.addEventListener('change', medir)
    return () => mq.removeEventListener('change', medir)
  }, [])

  const paginas = Math.max(1, opiniones.length - porVista + 1)
  const actual = Math.min(indice, paginas - 1)
  const ir = (i: number) => setIndice(((i % paginas) + paginas) % paginas)

  return (
    <div
      className="space-y-4"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Opiniones de consultorios"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') ir(actual + 1)
        if (e.key === 'ArrowLeft') ir(actual - 1)
      }}
    >
      <div
        className="-mx-2 overflow-hidden"
        onPointerDown={(e) => {
          toque.current = e.clientX
        }}
        onPointerUp={(e) => {
          if (toque.current === null) return
          const dx = e.clientX - toque.current
          toque.current = null
          if (Math.abs(dx) > 45) ir(actual + (dx < 0 ? 1 : -1))
        }}
        style={{ touchAction: 'pan-y' }}
      >
        <ul
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(-${(actual * 100) / porVista}%)` }}
        >
          {opiniones.map((op, i) => {
            const visible = i >= actual && i < actual + porVista
            return (
              <li
                key={`${op.autor}-${op.fecha}-${i}`}
                className="shrink-0 px-2"
                style={{ flexBasis: `${100 / porVista}%` }}
                aria-hidden={!visible}
                aria-roledescription="opinión"
              >
                <figure
                  className={cn(
                    'relative flex h-full flex-col rounded-2xl border bg-background/60 p-5 transition-all duration-700',
                    visible ? 'border-primary/30 opacity-100 shadow-md' : 'border-border/70 opacity-40',
                  )}
                >
                  <Quote className="absolute right-4 top-4 size-8 text-primary/15" aria-hidden="true" />
                  <Estrellas key={visible ? `v${actual}` : 'o'} valor={op.calificacion} />
                  <blockquote className="mt-3 flex-1 text-[15px] leading-7 text-foreground/90">“{op.texto}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-seafoam text-xs font-bold text-primary-foreground">
                      {iniciales(op.autor)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{op.autor}</span>
                      <span className="block text-xs text-muted-foreground">{haceCuanto(op.fecha)}</span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            )
          })}
        </ul>
      </div>

      {paginas > 1 && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Elegir opinión">
            {Array.from({ length: paginas }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === actual}
                aria-label={`Opinión ${i + 1} de ${paginas}`}
                onClick={() => ir(i)}
                className={cn('relative h-2 overflow-hidden rounded-full transition-all duration-500', i === actual ? 'w-10 bg-primary/25' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50')}
              >
                {i === actual && !detenido && (
                  <span
                    key={actual}
                    className="carrusel-progreso absolute inset-0 origin-left rounded-full bg-primary"
                    style={{ animationDuration: `${SEGUNDOS_OPINION}s`, animationPlayState: pausado ? 'paused' : 'running' }}
                    onAnimationEnd={() => ir(actual + 1)}
                  />
                )}
                {i === actual && detenido && <span className="absolute inset-0 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDetenido((d) => !d)}
              aria-label={detenido ? 'Reanudar el carrusel' : 'Detener el carrusel'}
              className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {detenido ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => ir(actual - 1)}
              aria-label="Opinión anterior"
              className="grid size-9 place-items-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => ir(actual + 1)}
              aria-label="Opinión siguiente"
              className="grid size-9 place-items-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

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
      {/* Banner con la tarjeta de presentación montada encima. */}
      <section className="ocean-band pb-40 pt-8 sm:pb-48 lg:pt-10">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          {enPortal ? (
            <Link to="/consultorio/ingenieros" className="animate-fade-up inline-flex min-h-10 items-center gap-2 text-sm text-hero-muted transition-colors hover:text-hero-foreground">
              <ArrowLeft className="size-4" /> Volver a Encontrar ingeniero
            </Link>
          ) : (
            <p className="animate-fade-up text-sm text-hero-muted">Perfil de ingeniero</p>
          )}
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-5 sm:-mt-20 lg:px-8">
        <div className="animate-fade-up rounded-2xl border border-border/70 bg-card p-5 shadow-xl sm:p-7" style={{ '--delay': '80ms' } as CSSProperties}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span
              aria-hidden="true"
              className="font-display -mt-14 grid size-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-seafoam text-3xl font-bold text-primary-foreground shadow-lg ring-4 ring-card sm:-mt-16 sm:size-28 sm:text-4xl"
            >
              {iniciales(ingeniero.nombre)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {ingeniero.verificado ? (
                  <Badge variant="good">
                    <BadgeCheck /> Credenciales verificadas
                  </Badge>
                ) : (
                  <Badge variant="outline">En verificación</Badge>
                )}
                {ingeniero.disponible && (
                  <Badge variant="secondary">
                    <span className="relative flex size-2">
                      <span className="animate-ping-soft absolute inline-flex size-full rounded-full bg-emerald-500" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    Disponible para servicios
                  </Badge>
                )}
              </div>
              <h1 className="font-display mt-3 text-3xl font-bold leading-tight sm:text-4xl">{ingeniero.nombre}</h1>
              <p className="mt-1 text-base text-muted-foreground sm:text-lg">{ingeniero.titulo}</p>
              <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> {ingeniero.ciudad}
              </p>
            </div>
            <Link to={destino} className={cn(buttonVariants({ size: 'lg' }), 'shadow-ocean h-12 shrink-0 px-6 text-base sm:self-center')}>
              <Wrench /> {enPortal ? 'Pedirle un servicio' : 'Solicitar atención'}
            </Link>
          </div>

          <div className="cascada mt-6 grid grid-cols-3 divide-x divide-border border-t border-border pt-5">
            <Cifra icono={<Star />} etiqueta="Calificación" valor={hayOpiniones ? ingeniero.calificacion.toFixed(1) : '—'} tono="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" />
            <Cifra icono={<ClipboardCheck />} etiqueta="Servicios" valor={String(ingeniero.servicios)} tono="bg-primary/10 text-primary" />
            <Cifra icono={<CalendarCheck />} etiqueta="Experiencia" valor={ingeniero.experiencia > 0 ? `${ingeniero.experiencia} años` : 'Por confirmar'} tono="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" />
          </div>
        </div>
      </div>

      <section className="py-8 lg:py-10">
        <div className="cascada mx-auto grid max-w-6xl gap-6 px-5 lg:grid-cols-[1.45fr_1fr] lg:px-8">
          <div className="space-y-6">
            <Seccion titulo="Presentación">
              <p className="whitespace-pre-line text-base leading-7 text-muted-foreground">{ingeniero.resena || 'Este profesional todavía no ha escrito su presentación.'}</p>
              {ingeniero.linkedin && (
                <a
                  href={ingeniero.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  Ver perfil profesional en LinkedIn <ExternalLink className="size-4" />
                </a>
              )}
            </Seccion>

            <Seccion titulo="Tipos de equipos que atiende">
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

            {Boolean(ingeniero.trayectoria?.length) && (
              <Seccion titulo="Trayectoria">
                <ol className="relative space-y-5 border-l-2 border-border pl-6">
                  {ingeniero.trayectoria?.map((t) => (
                    <li key={`${t.cargo}-${t.periodo}`} className="relative">
                      <span className="absolute -left-[2.05rem] top-0 grid size-7 place-items-center rounded-full bg-primary/10 text-primary ring-4 ring-card">
                        <Briefcase className="size-3.5" />
                      </span>
                      <p className="text-sm font-semibold leading-5">{t.cargo}</p>
                      <p className="text-sm text-muted-foreground">{t.organizacion}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t.periodo}
                        {t.lugar ? ` · ${t.lugar}` : ''}
                      </p>
                      {t.descripcion && <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.descripcion}</p>}
                    </li>
                  ))}
                </ol>
              </Seccion>
            )}

            {Boolean(ingeniero.formacion?.length) && (
              <Seccion titulo="Formación">
                <ul className="space-y-3">
                  {ingeniero.formacion?.map((f) => (
                    <li key={`${f.titulo}-${f.institucion}`} className="flex items-start gap-3">
                      <span className="check-dot mt-0.5">
                        <GraduationCap />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-5">{f.titulo}</p>
                        <p className="text-sm text-muted-foreground">{f.institucion}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Seccion>
            )}

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

                  <CarruselOpiniones opiniones={ingeniero.opiniones} />
                </div>
              )}
            </Seccion>
          </div>

          <div className="space-y-6">
            <Seccion titulo="Ciudad">
              <p className="flex items-center gap-2 text-base font-semibold">
                <MapPin className="size-4 text-primary" /> {ingeniero.ciudad}
              </p>
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
                    <dd className={cn('break-all text-right', v ? 'font-semibold' : 'text-muted-foreground')}>{v || 'Por registrar'}</dd>
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
                {ingeniero.especialidades.length === 0 && <p className="text-sm text-muted-foreground">Aún no ha indicado sus especialidades.</p>}
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
