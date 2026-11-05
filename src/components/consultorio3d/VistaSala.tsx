import { Box, FileText, Maximize2, Minimize2, Wrench } from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { NotaFlotante } from '@/components/consultorio3d/NotaFlotante'
import { PUNTOS, type EquipoSala, type PuntoVista } from '@/components/consultorio3d/salaDatos'
import { tipoModeloDe } from '@/components/consultorio3d/catalogo'
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
export function VistaSala({ equipos }: { equipos: Equipo[] }) {
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null)
  const [punto, setPunto] = useState<PuntoVista>('general')
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)
  const notaRef = useRef<HTMLDivElement>(null)

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

  function alternarPantallaCompleta() {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void contenedor.current?.requestFullscreen?.()
  }

  return (
    <div
      ref={contenedor}
      className={cn(
        'relative h-[calc(100svh-17.5rem)] min-h-[30rem] max-sm:h-[calc(100svh-24rem)] max-sm:min-h-[26rem] max-h-[58rem] overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-[#e8f2f6] to-[#cfe0e8]',
        '[&:fullscreen]:h-screen [&:fullscreen]:max-h-none [&:fullscreen]:rounded-none [&:fullscreen]:border-0',
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
        />
      </Suspense>

      {/* Lugares del consultorio */}
      <div className="absolute inset-x-3 top-3 z-20 flex gap-2 overflow-x-auto pb-1 pr-12" role="group" aria-label="Ir a un lugar del consultorio">
        {PUNTOS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={punto === p.id && !seleccionado}
            onClick={() => {
              setSeleccionadoId(null)
              setPunto(p.id)
            }}
            title={p.descripcion}
            className={cn(
              'min-h-10 shrink-0 rounded-lg border px-4 text-sm font-semibold shadow-sm backdrop-blur transition-colors sm:text-base',
              punto === p.id && !seleccionado ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card/90 hover:border-primary',
            )}
          >
            {p.nombre}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={alternarPantallaCompleta}
        aria-label={pantallaCompleta ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
        title={pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
        className="absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-lg border border-border bg-card/90 shadow-sm backdrop-blur transition-colors hover:border-primary"
      >
        {pantallaCompleta ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
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
        <p className="hidden rounded-lg bg-card/85 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur sm:block">
          Arrastra para mirar · toca un equipo para ver su nota · toca los círculos azules del piso para cambiar de sala
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
  )
}
