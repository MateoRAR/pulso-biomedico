import { Box, FileText, Maximize2, Minimize2, Wrench } from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { NotaFlotante } from '@/components/consultorio3d/NotaFlotante'
import { PLANOS, puntosDe, type EquipoSala, type PlanoId, type PuntoVista } from '@/components/consultorio3d/salaDatos'
import { tipoModeloDe } from '@/components/consultorio3d/catalogo'
import { SelectorDeslizante } from '@/components/shared/SelectorDeslizante'
import { SemaforoBadge, TriageBadge } from '@/components/shared/ui'
import { buttonVariants } from '@/components/ui/button'
import type { Equipo } from '@/data/tipos'
import { fechaCorta, semaforoEquipo } from '@/lib/format'
import { cn } from '@/lib/utils'

// Three.js solo se descarga cuando alguien abre la vista 3D.
const SalaConsultorio = lazy(() => import('@/components/consultorio3d/SalaConsultorio'))

const LEYENDA = [
  ['bg-emerald-400', 'Al día'],
  ['bg-amber-400', 'Por vencer'],
  ['bg-rose-400', 'Requiere atención'],
]

/**
 * El consultorio en 3D con los equipos reales del inventario. Ocupa todo el ancho: los lugares y la
 * leyenda flotan sobre el modelo, y al tocar un equipo se despliega una nota con sus datos justo en él.
 */
export function VistaSala({ equipos: todos, plano = 'general' }: { equipos: Equipo[]; plano?: PlanoId }) {
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null)
  const [punto, setPunto] = useState<PuntoVista>('general')
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  /** Sin la API de pantalla completa (iPhone): el visor se fija sobre toda la ventana con CSS. */
  const [completaSimulada, setCompletaSimulada] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)
  const notaRef = useRef<HTMLDivElement>(null)

  // Con varias sedes, cada una se recorre por separado (el 3D representa un solo consultorio).
  const sedes = useMemo(() => [...new Set(todos.map((e) => e.sede).filter(Boolean))], [todos])
  const [sede, setSede] = useState<string | null>(null)
  const sedeActiva = sedes.length > 1 ? (sede && sedes.includes(sede) ? sede : sedes[0]) : null
  const equipos = useMemo(() => (sedeActiva ? todos.filter((e) => e.sede === sedeActiva) : todos), [todos, sedeActiva])

  const equiposSala = useMemo<EquipoSala[]>(
    () => equipos.map((e) => ({ id: e.id, nombre: e.nombre, tipo: tipoModeloDe(e), estado: semaforoEquipo(e) })),
    [equipos],
  )
  const seleccionado = equipos.find((e) => e.id === seleccionadoId)

  // Si el equipo elegido ya no existe (se borró o cambió el inventario), se cierra la nota.
  useEffect(() => {
    if (seleccionadoId && !seleccionado) setSeleccionadoId(null)
  }, [seleccionadoId, seleccionado])

  useEffect(() => {
    const cambio = () => setPantallaCompleta(document.fullscreenElement === contenedor.current)
    document.addEventListener('fullscreenchange', cambio)
    return () => document.removeEventListener('fullscreenchange', cambio)
  }, [])

  // En pantalla completa simulada, Escape la cierra y la página de fondo no se desplaza.
  useEffect(() => {
    if (!completaSimulada) return
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && setCompletaSimulada(false)
    const desborde = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', tecla)
    return () => {
      document.body.style.overflow = desborde
      window.removeEventListener('keydown', tecla)
    }
  }, [completaSimulada])

  function alternarPantallaCompleta() {
    if (completaSimulada) return setCompletaSimulada(false)
    if (document.fullscreenElement) return void document.exitFullscreen()
    const el = contenedor.current
    if (el?.requestFullscreen && document.fullscreenEnabled) void el.requestFullscreen().catch(() => setCompletaSimulada(true))
    else setCompletaSimulada(true)
  }
  const enCompleta = pantallaCompleta || completaSimulada

  const lugares = useMemo(() => puntosDe(PLANOS[plano]).map((p) => ({ id: p.id, nombre: p.nombre, titulo: p.descripcion })), [plano])

  return (
    <div
      ref={contenedor}
      data-completa={completaSimulada || undefined}
      className={cn(
        'group/vs flex flex-col gap-3 [&:fullscreen]:h-screen [&:fullscreen]:bg-background [&:fullscreen]:p-3',
        completaSimulada && 'fixed inset-0 z-[60] h-[100dvh] bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]',
      )}
    >
      {/* Sedes: solo si el inventario está repartido en más de una */}
      {sedeActiva && (
        <SelectorDeslizante
          opciones={sedes.map((s) => ({ id: s, nombre: s }))}
          valor={sedeActiva}
          etiqueta="Sede"
          onCambio={(s) => {
            setSeleccionadoId(null)
            setPunto('general')
            setSede(s)
          }}
        />
      )}

      {/* Lugares del consultorio: una barra con pastilla que se desliza, encima del modelo */}
      <SelectorDeslizante
        opciones={lugares}
        valor={punto}
        etiqueta="Ir a un lugar del consultorio"
        onCambio={(id) => {
          setSeleccionadoId(null)
          setPunto(id)
        }}
      />

      <div
        className={cn(
          'relative h-[calc(100svh-20.5rem)] min-h-[30rem] max-h-[58rem] overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-[#e8f2f6] to-[#cfe0e8]',
          'max-sm:h-[calc(100svh-27rem)] max-sm:min-h-[24rem]',
          'group-[:fullscreen]/vs:h-auto group-[:fullscreen]/vs:min-h-0 group-[:fullscreen]/vs:max-h-none group-[:fullscreen]/vs:flex-1',
          'group-data-[completa]/vs:h-auto group-data-[completa]/vs:min-h-0 group-data-[completa]/vs:max-h-none group-data-[completa]/vs:flex-1',
        )}
      >
        <Suspense fallback={<p className="grid h-full place-items-center text-base text-muted-foreground">Cargando la vista 3D…</p>}>
          <SalaConsultorio
            equipos={equiposSala}
            seleccionadoId={seleccionadoId}
            onSeleccionar={setSeleccionadoId}
            punto={punto}
            onPunto={(p) => {
              setSeleccionadoId(null)
              setPunto(p)
            }}
            notaRef={notaRef}
            plano={plano}
          />
        </Suspense>

        <button
          type="button"
          onClick={alternarPantallaCompleta}
          aria-label={enCompleta ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
          title={enCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
          className="absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-lg border border-border bg-card/90 shadow-sm backdrop-blur transition-colors hover:border-primary"
        >
          {enCompleta ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
        </button>

      {/* Leyenda y ayuda */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex flex-wrap items-end justify-between gap-2">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-card/85 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
          {LEYENDA.map(([color, texto]) => (
            <span key={texto} className="flex items-center gap-1.5">
              <span className={cn('size-2.5 rounded-full', color)} /> {texto}
            </span>
          ))}
        </p>
        <p className="rounded-lg bg-card/85 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur max-[380px]:hidden">
          <span className="sm:hidden">Desliza a los lados para girar · toca un equipo</span>
          <span className="max-sm:hidden">Arrastra para mirar · toca un equipo para ver su nota</span>
        </p>
      </div>

      {/* Nota flotante del equipo elegido */}
      {seleccionado && (
        <NotaFlotante key={seleccionado.id} notaRef={notaRef} titulo={`Datos de ${seleccionado.nombre}`} onCerrar={() => setSeleccionadoId(null)}>
          <div className="pr-8">
            <p className="font-display text-base font-bold leading-snug">{seleccionado.nombre}</p>
            <p className="text-sm text-muted-foreground">
              {seleccionado.marca} {seleccionado.modelo}
            </p>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <SemaforoBadge semaforo={semaforoEquipo(seleccionado)} />
            <TriageBadge criticidad={seleccionado.criticidad} />
          </div>
          <dl className="mt-3 space-y-1.5 text-sm">
            {[
              ['Serie', seleccionado.serie],
              ['Mantenimiento', fechaCorta(seleccionado.proximoMantenimiento)],
              ['Calibración', fechaCorta(seleccionado.proximaCalibracion)],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{rotulo}</dt>
                <dd className="text-right font-semibold">{valor}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3.5 flex flex-wrap gap-2">
            <Link to={`/consultorio/equipos/${seleccionado.id}`} className={cn(buttonVariants({ size: 'sm' }), 'flex-1')}>
              <FileText /> Hoja de vida
            </Link>
            <Link to="/consultorio/solicitudes/nueva" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1')}>
              <Wrench /> Pedir servicio
            </Link>
            <Link
              to={`/consultorio/biblioteca/${tipoModeloDe(seleccionado)}?equipo=${seleccionado.id}`}
              className="flex w-full items-center justify-center gap-1.5 py-0.5 text-sm font-semibold text-primary hover:underline"
            >
              <Box className="size-4" /> Ver cómo es por dentro
            </Link>
          </div>
        </NotaFlotante>
      )}
      </div>
    </div>
  )
}
