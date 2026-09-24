import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  ClipboardList,
  Handshake,
  MapPin,
  Sparkles,
  Stethoscope,
  Users,
  Wrench,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { PublicFooter, PublicHeader } from '@/components/site/PublicLayout'
import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cop } from '@/lib/format'
import { EVENTOS, track, useTiempoEnPagina } from '@/lib/analytics'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

const datos = [
  ['59.092', 'prestadores de salud en Colombia (REPS, 2025)'],
  ['~7.400', 'sedes en el Valle del Cauca, tu mercado cercano'],
  ['8 a 15', 'ingenieros verificados en la red inicial'],
  ['12 meses', 'de transición de la Resolución 1732 de 2026'],
]

const pasos = [
  ['01', 'Conocemos tu dotación', 'Levantamos el inventario real de equipos con marca, modelo, serie y estado.'],
  ['02', 'Armamos tu ruta', 'Cronograma anual priorizado por criticidad, vencimientos y zona geográfica.'],
  ['03', 'Coordinamos la visita', 'Asignamos al ingeniero verificado más cercano y confirmamos por correo.'],
  ['04', 'Dejamos todo trazado', 'Actualizamos hoja de vida, certificados y semáforo de habilitación.'],
]

const criticidad = [
  ['Crítica', 'Equipo fuera de servicio', '8 horas'],
  ['Alta', 'Falla que limita el uso', '24 horas'],
  ['Media', 'Puede esperar la próxima visita', '72 horas'],
  ['Programada', 'Mantenimiento del cronograma', 'Fecha acordada'],
]

export function Home() {
  const { planes } = useData()
  useTiempoEnPagina('landing')

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return
    const objetivo = document.getElementById(hash)
    if (objetivo) window.setTimeout(() => objetivo.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }, [])

  return (
    <main id="inicio" className="overflow-hidden bg-background text-foreground">
      <PublicHeader />

      {/* Hero */}
      <section className="relative flex min-h-[88svh] items-center pt-16">
        <div className="ocean-band absolute inset-0" />
        <div className="wave-grid absolute inset-0 opacity-40" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 lg:px-8 lg:py-28">
          <div className="max-w-2xl animate-fade-in">
            <Badge className="glass-badge mb-7 border-glass-border bg-glass text-hero-foreground hover:bg-glass">
              <Sparkles /> Ingeniería clínica para consultorios en Colombia
            </Badge>
            <h1 className="font-display text-5xl font-bold leading-[1.04] text-hero-foreground sm:text-6xl lg:text-7xl">
              El pulso de tus equipos, <span className="text-seafoam">siempre al día.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-hero-muted sm:text-xl">
              Tú acuerdas el mantenimiento con el ingeniero y Pulso media entre los dos. Si quieres delegar toda la
              logística y el seguimiento, un único plan mensual lo resuelve.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/registro"
                onClick={() => track(EVENTOS.ctaDiagnostico, { origen: 'hero' })}
                className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-6 text-base shadow-ocean')}
              >
                Solicitar diagnóstico <ArrowRight />
              </Link>
              <a
                href="#planes"
                onClick={() => track(EVENTOS.ctaVerPlanes, { origen: 'hero' })}
                className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'glass-button h-12 px-6 text-base')}
              >
                Ver planes
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-hero-muted">
              <span className="flex items-center gap-2">
                <Check className="text-seafoam" /> Sin ingeniero de planta
              </span>
              <span className="flex items-center gap-2">
                <Check className="text-seafoam" /> Atención por cercanía
              </span>
              <span className="flex items-center gap-2">
                <Check className="text-seafoam" /> Evidencia auditable
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Datos */}
      <section className="border-b border-border bg-background py-6">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-5 md:grid-cols-4 lg:px-8">
          {datos.map(([value, label]) => (
            <div key={label} className="border-l-2 border-primary/30 pl-4">
              <strong className="font-display block text-2xl text-primary">{value}</strong>
              <span className="text-xs text-muted-foreground sm:text-sm">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="section-space scroll-mt-20 bg-secondary/55">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <span className="eyebrow">Cómo funciona</span>
            <h2 className="section-title mt-4">Nos ocupamos del proceso completo.</h2>
            <p className="section-copy mt-5">
              Del inventario inicial al expediente listo para la visita de habilitación, sin que tengas que coordinar
              nada por tu cuenta.
            </p>
          </div>

          <div className="relative mt-14 grid gap-8 md:grid-cols-4">
            <div className="step-rail" aria-hidden="true" />
            {pasos.map(([number, title, description]) => (
              <div key={number} className="relative text-center md:text-left">
                <span className="step-number">{number}</span>
                <h3 className="font-display mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-lg border border-border bg-card/90 p-6">
            <p className="eyebrow">Triage por criticidad</p>
            <div className="mt-4 divide-y divide-border">
              {criticidad.map(([nivel, descripcion, tiempo]) => (
                <div key={nivel} className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr_9rem] sm:items-center">
                  <span className="font-display text-sm font-bold text-primary">{nivel}</span>
                  <span className="text-sm text-muted-foreground">{descripcion}</span>
                  <span className="text-sm font-semibold">{tiempo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Para consultorios: mediación vs plan */}
      <section id="consultorios" className="section-space wave-grid scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <span className="eyebrow">Para consultorios y prestadores</span>
            <h2 className="section-title mt-4">Tú decides cuánto delegar.</h2>
            <p className="section-copy mt-5">
              El mantenimiento normalmente se acuerda entre el ingeniero y el consultorio; Pulso media entre ambos. El
              plan mensual es opcional y solo cubre la logística y el seguimiento.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Card className="feature-card border-border/80 bg-card/90">
              <CardHeader>
                <div className="icon-well">
                  <Handshake />
                </div>
                <CardTitle className="font-display pt-4 text-2xl">Acuerdo directo con el ingeniero</CardTitle>
                <CardDescription className="text-base leading-7">
                  Tú y el ingeniero acuerdan el mantenimiento. Pulso conecta, asigna por cercanía y respalda cada
                  intervención con documentación trazable.
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm">
                  {[
                    'Comisión por servicio, sin mensualidad',
                    'Ingenieros verificados (INVIMA y COPNIA)',
                    'Expediente y certificados en tu portal',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="check-dot">
                        <Check />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardHeader>
            </Card>

            <Card className="feature-card border-primary/60 bg-card/95 shadow-ocean">
              <CardHeader>
                <div className="icon-well">
                  <ClipboardList />
                </div>
                <CardTitle className="font-display pt-4 text-2xl">Plan mensual de logística</CardTitle>
                <CardDescription className="text-base leading-7">
                  Delegas toda la logística de ordenamiento y las esquemáticas de seguimiento. Es la única cuota
                  mensual: no pagas dos veces por el servicio.
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm">
                  {[
                    'Cronograma, rutas y recordatorios automáticos',
                    'Semáforo de habilitación y expediente',
                    'Soporte y gestión de garantías',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="check-dot">
                        <Check />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Para ingenieros */}
      <section id="profesionales" className="section-space ocean-band relative scroll-mt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <Badge className="glass-badge border-glass-border bg-glass text-hero-foreground hover:bg-glass">
              <Users /> Red profesional
            </Badge>
            <h2 className="font-display mt-5 text-4xl font-bold leading-tight text-hero-foreground sm:text-5xl">
              Más ingeniería. Menos tareas administrativas.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-hero-muted">
              Pulso agrega la demanda de consultorios cercanos, organiza rutas por zona y se encarga de la facturación
              y los informes para que concentres tu tiempo en el trabajo técnico.
            </p>
            <Link to="/registro" className={cn(buttonVariants({ size: 'lg' }), 'mt-8 h-12')}>
              Unirme a la red <ArrowRight />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [MapPin, 'Rutas eficientes', 'Servicios agrupados por zona para reducir desplazamientos.'],
              [CalendarCheck, 'Agenda predecible', 'Franjas horarias claras que se adaptan a tu disponibilidad.'],
              [BadgeCheck, 'Reputación visible', 'Inscripción INVIMA y tarjeta COPNIA verificadas por la red.'],
              [Wrench, 'Demanda estable', 'Más horas efectivas y menos tiempo buscando clientes.'],
            ].map(([Icon, title, description]) => {
              const FeatureIcon = Icon as typeof MapPin
              return (
                <div key={title as string} className="glass-panel">
                  <FeatureIcon />
                  <h3 className="font-display mt-5 text-lg font-bold text-hero-foreground">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-hero-muted">{description as string}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="section-space scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <span className="eyebrow">Planes y precios</span>
            <h2 className="section-title mt-4">Un solo cobro mensual, si decides delegar.</h2>
            <p className="section-copy mt-5">
              El plan cubre la logística de ordenamiento y las esquemáticas de seguimiento. Los servicios de
              mantenimiento y calibración se pagan por comisión cuando se ejecutan.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {planes.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  'feature-card relative flex flex-col bg-card/90',
                  plan.destacado ? 'border-primary/60 shadow-ocean' : 'border-border/80',
                )}
              >
                {plan.destacado && <Badge className="absolute -top-3 left-6">Recomendado</Badge>}
                <CardHeader>
                  <CardTitle className="font-display text-2xl">{plan.nombre}</CardTitle>
                  <p className="pt-2">
                    <span className="font-display text-4xl font-bold text-primary">
                      {plan.precioTexto ?? cop(plan.precioCOP)}
                    </span>{' '}
                    {!plan.precioTexto && <span className="text-sm text-muted-foreground">{plan.periodo}</span>}
                  </p>
                  <span className="text-sm font-semibold">{plan.rangoEquipos}</span>
                  <span className="text-xs text-muted-foreground">{plan.segmento}</span>
                  <CardDescription className="pt-2 text-base leading-7">{plan.resumen}</CardDescription>
                </CardHeader>
                <div className="flex flex-1 flex-col justify-between gap-6 p-6 pt-0">
                  <ul className="space-y-3">
                    {plan.incluye.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-6">
                        <span className="check-dot mt-0.5">
                          <Check />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/registro" className={buttonVariants({ variant: plan.destacado ? 'default' : 'outline', size: 'lg' })}>
                    {plan.id === 'custom' ? 'Acordar con el equipo' : `Elegir ${plan.nombre}`} <ArrowRight />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preguntas */}
      <section id="preguntas" className="section-space scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <span className="eyebrow">Preguntas frecuentes</span>
            <h2 className="section-title mt-4">Claridad antes de comenzar.</h2>
            <p className="section-copy mt-5">Respuestas rápidas sobre el alcance, la normativa y la red profesional.</p>
          </div>
          <Accordion className="border-t border-border">
            <AccordionItem value="uno" title="¿Pulso reemplaza a un ingeniero de planta?">
              Para prestadores pequeños que no justifican un cargo interno, Pulso coordina una red verificada y toda
              la gestión documental sin el costo fijo de una contratación de planta.
            </AccordionItem>
            <AccordionItem value="dos" title="¿Cómo se paga el mantenimiento?">
              El servicio se acuerda con el ingeniero y se paga por comisión cuando se ejecuta. El plan mensual es
              opcional y solo cubre la logística y el seguimiento.
            </AccordionItem>
            <AccordionItem value="tres" title="¿Qué planes existen?">
              El Plan Básico es la única cuota mensual y cubre la logística y el seguimiento para consultorios
              pequeños. Para organizaciones más grandes, el Plan Custom se acuerda con el equipo.
            </AccordionItem>
            <AccordionItem value="cuatro" title="¿Qué pasa con la Resolución 1732 de 2026?">
              La norma derogó la Resolución 3100 de 2019 y actualizó el manual de habilitación, con un periodo de
              transición de doce meses. Pulso mantiene tu expediente alineado a los nuevos estándares.
            </AccordionItem>
            <AccordionItem value="cinco" title="¿Qué recibo después de cada visita?">
              La intervención queda registrada en la hoja de vida del equipo y se incorporan automáticamente los
              informes y certificados con trazabilidad metrológica.
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 lg:px-8">
        <div className="cta-band mx-auto max-w-7xl overflow-hidden px-6 py-12 text-center sm:px-12 lg:py-16">
          <Stethoscope className="mx-auto size-9 text-seafoam" />
          <h2 className="font-display mx-auto mt-5 max-w-3xl text-3xl font-bold text-hero-foreground sm:text-5xl">
            Que tu próxima auditoría no te tome por sorpresa.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-hero-muted">
            Empieza con un diagnóstico de tu dotación y descubre una forma más simple de mantener todo al día.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/registro"
              onClick={() => track(EVENTOS.ctaDiagnostico, { origen: 'cta_final' })}
              className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-7 text-base')}
            >
              Empezar diagnóstico <ArrowRight />
            </Link>
            <a
              href="#planes"
              onClick={() => track(EVENTOS.ctaVerPlanes, { origen: 'cta_final' })}
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'glass-button h-12 px-7 text-base')}
            >
              Ver planes
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}
