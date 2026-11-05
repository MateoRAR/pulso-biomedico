import {
  Activity,
  ArrowRight,
  Armchair,
  BadgeCheck,
  BedSingle,
  BellRing,
  CalendarCheck,
  Check,
  ClipboardList,
  Cpu,
  FileCheck2,
  FlaskConical,
  Handshake,
  HeartPulse,
  MapPinned,
  Microscope,
  RotateCw,
  Scale,
  ScanLine,
  Stethoscope,
  Users,
  Waves,
  Wind,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { MODELOS, ORDEN_BIBLIOTECA, type TipoModelo } from '@/components/consultorio3d/catalogo'
import BorderGlow from '@/components/reactbits/BorderGlow'
import GradientText from '@/components/reactbits/GradientText'
import LogoLoop from '@/components/reactbits/LogoLoop'
import ShinyText from '@/components/reactbits/ShinyText'
import SpotlightCard from '@/components/reactbits/SpotlightCard'
import StarBorder from '@/components/reactbits/StarBorder'
import { ContactoCustom } from '@/components/site/ContactoCustom'
import { FondoFibras } from '@/components/site/FondoFibras'
import { PublicFooter, PublicHeader } from '@/components/site/PublicLayout'
import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { Button, buttonVariants } from '@/components/ui/button'
import { EVENTOS, track, useTiempoEnPagina } from '@/lib/analytics'
import { cop } from '@/lib/format'
import { useData } from '@/lib/store'
import { useTema } from '@/lib/tema'
import { cn } from '@/lib/utils'

const ICONO_EQUIPO: Record<TipoModelo, LucideIcon> = {
  'unidad-odontologica': Armchair,
  autoclave: FlaskConical,
  'rayos-x': ScanLine,
  compresor: Wind,
  monitor: HeartPulse,
  bascula: Scale,
  centrifuga: RotateCw,
  microscopio: Microscope,
  ecografo: Waves,
  camilla: BedSingle,
  balanza: Scale,
  generico: Cpu,
}

const beneficios: { icono: LucideIcon; titulo: string; texto: string }[] = [
  { icono: ClipboardList, titulo: 'Tu inventario ordenado', texto: 'Cada equipo con su hoja de vida, sus fechas y su estado, en un solo lugar.' },
  { icono: BadgeCheck, titulo: 'Ingenieros verificados', texto: 'Revisamos la tarjeta COPNIA y la inscripción INVIMA antes de que aparezcan en la red.' },
  { icono: BellRing, titulo: 'Avisos a tiempo', texto: 'Te avisamos antes de que venza una calibración o un mantenimiento.' },
  { icono: Handshake, titulo: 'Tú decides cuánto delegar', texto: 'Acuerdas con el ingeniero, o dejas la logística a Pulso con un plan mensual.' },
]

const pasos: { icono: LucideIcon; titulo: string; texto: string }[] = [
  { icono: ClipboardList, titulo: 'Conocemos tu dotación', texto: 'Levantamos el inventario real de equipos con marca, modelo, serie y estado.' },
  { icono: CalendarCheck, titulo: 'Armamos tu calendario', texto: 'Mantenimientos y calibraciones ordenados por urgencia, vencimientos y zona.' },
  { icono: MapPinned, titulo: 'Coordinamos la visita', texto: 'Asignamos al ingeniero verificado más cercano y confirmamos por correo.' },
  { icono: FileCheck2, titulo: 'Dejamos todo registrado', texto: 'Actualizamos la hoja de vida, los certificados y el estado de cada equipo.' },
]

const urgencia: { nivel: string; punto: string; descripcion: string; meta: string }[] = [
  { nivel: 'Crítica', punto: 'bg-rose-400', descripcion: 'El equipo está fuera de servicio y detiene la atención', meta: '8 horas' },
  { nivel: 'Alta', punto: 'bg-amber-400', descripcion: 'Una falla limita el uso o la exactitud del equipo', meta: '24 horas' },
  { nivel: 'Media', punto: 'bg-sky-400', descripcion: 'Puede esperar la próxima visita programada', meta: '72 horas' },
  { nivel: 'Programada', punto: 'bg-emerald-400', descripcion: 'Mantenimiento o calibración del calendario', meta: 'Fecha acordada' },
]

/** Tarjeta de contenido con luz suave (React Bits · SpotlightCard) y los colores del tema de Pulso. */
function Tarjeta({ children, className, resaltada = false }: { children: ReactNode; className?: string; resaltada?: boolean }) {
  const { tema } = useTema()
  return (
    <SpotlightCard
      theme={tema === 'oscuro' ? 'dark' : 'light'}
      intensity={0.12}
      spotlightSize={260}
      borderGlow={0.55}
      className={cn('rounded-2xl! p-6! transition-transform duration-300 hover:-translate-y-0.5', className)}
      style={
        {
          '--spotlight-card-surface': 'var(--card)',
          '--spotlight-card-border': resaltada ? 'color-mix(in oklab, var(--primary) 45%, transparent)' : 'var(--border)',
          '--spotlight-card-shadow': '0 1px 2px color-mix(in oklab, var(--foreground) 6%, transparent), 0 14px 32px -20px color-mix(in oklab, var(--foreground) 20%, transparent)',
        } as CSSProperties
      }
    >
      {children}
    </SpotlightCard>
  )
}

function Cabecera({ etiqueta, titulo, texto, centrado = false, claro = false }: { etiqueta: string; titulo: string; texto?: string; centrado?: boolean; claro?: boolean }) {
  return (
    <div className={cn('max-w-2xl', centrado && 'mx-auto text-center')}>
      <span className={cn('text-sm font-semibold uppercase tracking-wider', claro ? 'text-seafoam' : 'text-primary')}>{etiqueta}</span>
      <h2 className={cn('font-display mt-3 text-3xl font-bold leading-tight sm:text-4xl', claro && 'text-hero-foreground')}>{titulo}</h2>
      {texto && <p className={cn('mt-4 text-base leading-7 sm:text-lg', claro ? 'text-hero-muted' : 'text-muted-foreground')}>{texto}</p>}
    </div>
  )
}

/** Vista de ejemplo del portal. Es ilustrativa: no muestra cifras, solo cómo se ve el estado de los equipos. */
function VistaEjemplo() {
  const filas = [
    { nombre: 'Autoclave de mesa', estado: 'Calibración vencida', punto: 'bg-rose-400' },
    { nombre: 'Unidad odontológica', estado: 'Mantenimiento próximo', punto: 'bg-amber-400' },
    { nombre: 'Monitor de signos vitales', estado: 'Al día', punto: 'bg-emerald-400' },
    { nombre: 'Equipo de rayos X', estado: 'Al día', punto: 'bg-emerald-400' },
  ]
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="absolute -inset-4 rounded-[2rem] bg-seafoam/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-hero-foreground">Estado de tus equipos</p>
            <p className="text-xs text-hero-muted">Ejemplo ilustrativo</p>
          </div>
          <span className="grid size-9 place-items-center rounded-lg bg-white/10 text-seafoam">
            <Activity className="size-4" />
          </span>
        </div>
        <ul className="mt-4 space-y-2">
          {filas.map((f) => (
            <li key={f.nombre} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3">
              <span className={cn('size-2.5 shrink-0 rounded-full', f.punto)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-hero-foreground">{f.nombre}</span>
                <span className="block text-xs text-hero-muted">{f.estado}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-seafoam/30 bg-seafoam/10 px-3.5 py-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-seafoam/20 text-seafoam">
            <Users className="size-4" />
          </span>
          <p className="text-sm text-hero-foreground">Ingeniero verificado cerca de ti, listo para la visita.</p>
        </div>
      </div>
    </div>
  )
}

export function Home() {
  const { planes } = useData()
  const [contactoAbierto, setContactoAbierto] = useState(false)
  useTiempoEnPagina('landing')

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return
    const objetivo = document.getElementById(hash)
    if (objetivo) window.setTimeout(() => objetivo.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }, [])


  // Las secciones aparecen con suavidad al llegar a ellas (cada grupo entra escalonado).
  const principal = useRef<HTMLElement>(null)
  useEffect(() => {
    const raiz = principal.current
    if (!raiz) return
    const objetivos: HTMLElement[] = []
    const reunir = (padre: Element, nivel: number) => {
      const hijos = Array.from(padre.children).filter((c): c is HTMLElement => c instanceof HTMLElement && !c.classList.contains('absolute'))
      hijos.forEach((hijo, i) => {
        if (nivel < 2 && hijo.matches('.grid, ol')) {
          reunir(hijo, nivel + 1)
          return
        }
        hijo.style.setProperty('--delay', `${Math.min(i, 5) * 90}ms`)
        objetivos.push(hijo)
      })
    }
    raiz.querySelectorAll(':scope > section:not(:first-of-type)').forEach((seccion) => {
      if (seccion.firstElementChild) reunir(seccion.firstElementChild, 0)
    })
    const observador = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('visible')
          observador.unobserve(e.target)
        }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    objetivos.forEach((el) => {
      el.classList.add('revelar')
      observador.observe(el)
    })
    return () => observador.disconnect()
  }, [])

  const equipos = ORDEN_BIBLIOTECA.filter((id) => id !== 'generico').map((id) => {
    const Icono = ICONO_EQUIPO[id]
    return {
      node: (
        <span className="flex items-center gap-2.5 whitespace-nowrap text-sm font-medium text-white/70">
          <Icono className="size-5 text-seafoam" /> {MODELOS[id].nombre}
        </span>
      ),
      title: MODELOS[id].nombre,
    }
  })

  return (
    <main ref={principal} id="inicio" className="overflow-x-clip bg-background text-foreground">
      <PublicHeader sobreOscuro />

      {/* Portada */}
      <section className="relative isolate overflow-hidden">
        <div className="ocean-band absolute inset-0 -z-20" />
        <FondoFibras className="-z-10" />
        <div className="hero-overlay pointer-events-none absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-28 lg:pt-40">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm backdrop-blur">
              <Stethoscope className="size-4 text-seafoam" />
              <ShinyText text="Ingeniería clínica para consultorios en Colombia" color="#cfe8ee" shineColor="#ffffff" speed={4} />
            </div>
            <h1 className="font-display mt-6 text-4xl font-bold leading-[1.08] text-hero-foreground sm:text-5xl lg:text-6xl">
              El pulso de tus equipos,{' '}
              <GradientText colors={['#5ee7d0', '#7dd3e8', '#a7f3e6']} animationSpeed={9}>
                siempre al día.
              </GradientText>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-hero-muted sm:text-lg">
              Tú acuerdas el mantenimiento con el ingeniero y Pulso media entre los dos. Si quieres delegar la logística y el seguimiento, un plan mensual lo resuelve.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <StarBorder
                as={Link}
                to="/registro"
                onClick={() => track(EVENTOS.ctaDiagnostico, { origen: 'hero' })}
                theme="dark"
                backgroundColor="#0f8fa3"
                textColor="#ffffff"
                color="#a7f3e6"
                radius={12}
                duration={5}
                className="text-base font-semibold"
              >
                Crear mi cuenta <ArrowRight className="size-4" />
              </StarBorder>
              <a
                href="#como-funciona"
                onClick={() => track(EVENTOS.ctaVerPlanes, { origen: 'hero' })}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Ver cómo funciona
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-hero-muted">
              {['Sin ingeniero de planta', 'Atención por cercanía', 'Todo queda registrado'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 text-seafoam" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <VistaEjemplo />
        </div>

        <div className="border-t border-white/10 bg-black/10 py-4 backdrop-blur-sm">
          <LogoLoop logos={equipos} speed={40} logoHeight={22} gap={48} fadeOut fadeOutColor="#0e2f3b" pauseOnHover ariaLabel="Tipos de equipos que se pueden gestionar" />
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Cabecera
            etiqueta="Por qué Pulso"
            titulo="Todo lo que necesitas para tener tus equipos en orden"
            texto="Menos papeles sueltos y menos sorpresas. Un solo lugar para saber qué tienes, qué vence y quién puede ayudarte."
            centrado
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {beneficios.map(({ icono: Icono, titulo, texto }) => (
              <Tarjeta key={titulo}>
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icono className="size-5" />
                </span>
                <h3 className="font-display mt-5 text-lg font-bold">{titulo}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{texto}</p>
              </Tarjeta>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="scroll-mt-16 bg-secondary/60 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Cabecera etiqueta="Cómo funciona" titulo="Nos ocupamos del proceso completo" texto="Del inventario inicial a los documentos listos para una visita de verificación, sin que tengas que coordinar nada por tu cuenta." centrado />
          <ol className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-5">
            <div className="absolute left-[12%] right-[12%] top-6 hidden h-px bg-border md:block" aria-hidden="true" />
            {pasos.map(({ icono: Icono, titulo, texto }, i) => (
              <li key={titulo} className="relative text-center">
                <span className="relative z-10 mx-auto grid size-12 place-items-center rounded-full border border-border bg-card text-primary shadow-sm">
                  <Icono className="size-5" />
                </span>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">Paso {i + 1}</p>
                <h3 className="font-display mt-1 text-lg font-bold">{titulo}</h3>
                <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-6 text-muted-foreground">{texto}</p>
              </li>
            ))}
          </ol>

          <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold">¿Qué tan urgente es?</h3>
            <p className="mt-1 text-sm text-muted-foreground">Cada solicitud se ordena por urgencia, y esa urgencia define la meta de respuesta.</p>
            <ul className="mt-5 divide-y divide-border">
              {urgencia.map((u) => (
                <li key={u.nivel} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3 max-sm:grid-cols-[1fr_auto]">
                  <span className="flex w-28 items-center gap-2 text-sm font-semibold">
                    <span className={cn('size-2.5 rounded-full', u.punto)} /> {u.nivel}
                  </span>
                  <span className="text-sm text-muted-foreground max-sm:order-3 max-sm:col-span-2">{u.descripcion}</span>
                  <span className="text-sm font-semibold">{u.meta}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Para consultorios */}
      <section id="consultorios" className="scroll-mt-16 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Cabecera
            etiqueta="Para consultorios y prestadores"
            titulo="Tú decides cuánto delegar"
            texto="El mantenimiento normalmente se acuerda entre el ingeniero y el consultorio; Pulso media entre ambos. El plan mensual es opcional y solo cubre la logística y el seguimiento."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Tarjeta className="flex flex-col">
              <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Handshake className="size-6" />
              </span>
              <h3 className="font-display mt-5 text-xl font-bold">Acuerdo directo con el ingeniero</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Tú y el ingeniero acuerdan el mantenimiento. Pulso conecta, asigna por cercanía y respalda cada intervención con documentación.</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {['Comisión por servicio, sin mensualidad', 'Ingenieros verificados (INVIMA y COPNIA)', 'Documentos y certificados en tu portal'].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                      <Check className="size-3" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </Tarjeta>
            <Tarjeta resaltada className="flex flex-col">
              <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                <ClipboardList className="size-6" />
              </span>
              <h3 className="font-display mt-5 text-xl font-bold">Plan mensual de logística</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Delegas la organización y el seguimiento. Es la única cuota mensual: no pagas dos veces por el servicio.</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {['Calendario, rutas y recordatorios automáticos', 'Estado de tus equipos y documentos', 'Soporte y gestión de garantías'].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                      <Check className="size-3" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </Tarjeta>
          </div>
        </div>
      </section>

      {/* Para ingenieros */}
      <section id="profesionales" className="ocean-band relative scroll-mt-16 py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <Cabecera etiqueta="Red profesional" titulo="Más ingeniería. Menos tareas administrativas." texto="Pulso reúne la demanda de consultorios cercanos, organiza rutas por zona y se encarga de la facturación y los informes para que te concentres en el trabajo técnico." claro />
            <Link to="/registro" className={cn(buttonVariants({ size: 'lg' }), 'mt-8 h-12 px-6 text-base')}>
              Unirme a la red <ArrowRight />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                [MapPinned, 'Rutas eficientes', 'Servicios agrupados por zona para reducir desplazamientos.'],
                [CalendarCheck, 'Agenda predecible', 'Franjas horarias claras que se adaptan a tu disponibilidad.'],
                [BadgeCheck, 'Reputación visible', 'Tu tarjeta COPNIA e inscripción INVIMA verificadas, a la vista.'],
                [Wrench, 'Trabajo cercano', 'Solicitudes de consultorios de tu ciudad y tu zona.'],
              ] as [LucideIcon, string, string][]
            ).map(([Icono, titulo, texto]) => (
              <div key={titulo} className="rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-sm transition hover:bg-white/10">
                <Icono className="size-6 text-seafoam" />
                <h3 className="font-display mt-4 text-base font-bold text-hero-foreground">{titulo}</h3>
                <p className="mt-1.5 text-sm leading-6 text-hero-muted">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="scroll-mt-16 py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <Cabecera etiqueta="Planes" titulo="Un solo cobro mensual, si decides delegar" texto="El plan cubre la logística y el seguimiento. Los servicios de mantenimiento y calibración se pagan por comisión cuando se ejecutan." centrado />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {planes.map((plan) => {
              const contenido = (
                <div className="flex h-full flex-col p-7">
                  {plan.destacado && <span className="mb-3 w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Recomendado</span>}
                  <h3 className="font-display text-xl font-bold">{plan.nombre}</h3>
                  <p className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-bold text-primary">{plan.precioTexto ?? cop(plan.precioCOP)}</span>
                    {!plan.precioTexto && <span className="text-sm text-muted-foreground">{plan.periodo}</span>}
                  </p>
                  <p className="mt-1 text-sm font-medium">{plan.rangoEquipos}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.resumen}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {plan.incluye.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-6">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                          <Check className="size-3" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7">
                    {plan.id === 'custom' ? (
                      <Button variant="outline" size="lg" className="w-full" onClick={() => setContactoAbierto(true)}>
                        Acordar con el equipo <ArrowRight />
                      </Button>
                    ) : (
                      <Link to="/registro" className={cn(buttonVariants({ size: 'lg' }), 'w-full')}>
                        Elegir {plan.nombre} <ArrowRight />
                      </Link>
                    )}
                  </div>
                </div>
              )
              return plan.destacado ? (
                <BorderGlow key={plan.id} backgroundColor="var(--card)" glowColor="188 70 55" colors={['#5ee7d0', '#0f8fa3', '#7dd3e8']} borderRadius={18} glowRadius={26} glowIntensity={0.8} fillOpacity={0.35}>
                  {contenido}
                </BorderGlow>
              ) : (
                <div key={plan.id} className="overflow-hidden rounded-[18px] border border-border bg-card shadow-sm">
                  {contenido}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Preguntas */}
      <section id="preguntas" className="scroll-mt-16 bg-secondary/60 py-20 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <Cabecera etiqueta="Preguntas frecuentes" titulo="Claridad antes de comenzar" texto="Respuestas rápidas sobre el alcance, los pagos y la red profesional." />
          <Accordion className="rounded-2xl border border-border bg-card px-6">
            <AccordionItem value="uno" title="¿Pulso reemplaza a un ingeniero de planta?">
              Para prestadores pequeños que no justifican un cargo interno, Pulso coordina una red verificada y toda la gestión documental sin el costo fijo de una contratación de planta.
            </AccordionItem>
            <AccordionItem value="dos" title="¿Cómo se paga el mantenimiento?">
              El servicio se acuerda con el ingeniero y se paga por comisión cuando se ejecuta. El plan mensual es opcional y solo cubre la logística y el seguimiento.
            </AccordionItem>
            <AccordionItem value="tres" title="¿Qué planes existen?">
              El Plan Básico es la única cuota mensual y cubre la logística y el seguimiento para consultorios pequeños. Para organizaciones más grandes, el Plan Custom se acuerda con el equipo.
            </AccordionItem>
            <AccordionItem value="cuatro" title="¿Y la normativa de habilitación?">
              Las reglas de habilitación las define el Ministerio de Salud y pueden cambiar. Pulso mantiene tus documentos ordenados (hojas de vida, certificados, vencimientos) para que estés listo ante la norma que esté vigente, y te recomendamos confirmarla siempre en la fuente oficial.
            </AccordionItem>
            <AccordionItem value="cinco" title="¿Qué recibo después de cada visita?">
              La intervención queda registrada en la hoja de vida del equipo y se incorporan automáticamente los informes y certificados con trazabilidad.
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <ContactoCustom open={contactoAbierto} onClose={() => setContactoAbierto(false)} />
      <PublicFooter />
    </main>
  )
}
