import { ArrowLeft, Building2, ChevronDown, ChevronUp, MapPin, Pencil, Plus, X } from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import type { ModoMapa, PinConsultorio } from '@/components/admin/MapaConsultorios'
import { SelectorDeslizante } from '@/components/shared/SelectorDeslizante'
import { PageHeader } from '@/components/shared/ui'
import { useVista, VistaDual } from '@/components/shared/VistaDual'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Label, Select } from '@/components/ui/field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import type { Consultorio, Semaforo } from '@/data/tipos'
import { cop, ETIQUETA_SEMAFORO, semaforoEquipo } from '@/lib/format'
import { hoyISO, idNuevo } from '@/lib/registro'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

import { ConsultorioFicha } from './ConsultorioFicha'

// MapLibre solo se descarga cuando alguien abre el mapa.
const MapaConsultorios = lazy(() => import('@/components/admin/MapaConsultorios'))

const ORDEN: Semaforo[] = ['rojo', 'amarillo', 'verde']
const PUNTO: Record<PinConsultorio['estado'], string> = {
  verde: 'bg-emerald-500',
  amarillo: 'bg-amber-500',
  rojo: 'bg-rose-500',
  'sin-equipos': 'bg-slate-500',
}
const TEXTO_ESTADO: Record<PinConsultorio['estado'], string> = {
  verde: 'Equipos al día',
  amarillo: 'Algo por vencer',
  rojo: 'Requiere atención',
  'sin-equipos': 'Sin equipos registrados',
}

/** Desde este ancho la ficha va a la izquierda del mapa; en celulares, abajo. */
const ANCHO_LATERAL = 640

function pantallaAncha() {
  return typeof window !== 'undefined' && window.innerWidth >= ANCHO_LATERAL
}

/** Una fila de la ficha: rótulo a la izquierda y valor a la derecha (o "—" si falta). */
function Dato({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  const vacio = children === '' || children === null || children === undefined
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <dt className="shrink-0 text-sm text-muted-foreground">{rotulo}</dt>
      <dd className={cn('min-w-0 break-words text-right text-sm', vacio ? 'text-muted-foreground' : 'font-semibold')}>{vacio ? '—' : children}</dd>
    </div>
  )
}

export function AdminMapa() {
  const { consultorios, ciudades, equipos, servicios, planes, actualizarConsultorioPorId } = useData()
  const [ciudadActiva, setCiudadActiva] = useState('cali')
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null)
  const [editandoEnMapa, setEditandoEnMapa] = useState(false)
  const [nuevo, setNuevo] = useState<Consultorio | null>(null)
  const [modoAgregar, setModoAgregar] = useState(false)
  const [mapaFallo, setMapaFallo] = useState(false)
  const [editando, setEditando] = useState<Consultorio | null>(null)
  const [modo, setModo] = useState<ModoMapa>('3d')
  const [listaAbierta, setListaAbierta] = useState(pantallaAncha)
  const [ancha, setAncha] = useState(pantallaAncha)
  const caja = useRef<HTMLDivElement>(null)
  const control = useVista('admin-mapa')
  const enMapa = control.vista === '3d' && !mapaFallo

  useEffect(() => {
    const medir = () => setAncha(pantallaAncha())
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])

  /** El peor estado de sus equipos: si hay uno que requiere atención, el consultorio se marca así. */
  const estadoDe = (id: string): PinConsultorio['estado'] => {
    const suyos = equipos.filter((e) => e.consultorioId === id).map(semaforoEquipo)
    if (suyos.length === 0) return 'sin-equipos'
    return ORDEN.find((s) => suyos.includes(s)) ?? 'verde'
  }

  // Ciudades con su cantidad de consultorios, ordenadas: primero las que tienen, luego por nombre.
  const opcionesCiudad = useMemo(
    () =>
      ciudades
        .map((c) => ({ ...c, cuenta: consultorios.filter((x) => x.ciudadId === c.id).length }))
        .sort((a, b) => Number(b.cuenta > 0) - Number(a.cuenta > 0) || a.nombre.localeCompare(b.nombre, 'es')),
    [ciudades, consultorios],
  )

  const visibles = useMemo(
    () => consultorios.filter((c) => ciudadActiva === 'todas' || c.ciudadId === ciudadActiva),
    [consultorios, ciudadActiva],
  )

  const pines = useMemo<PinConsultorio[]>(
    () =>
      consultorios.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        lat: c.lat,
        lng: c.lng,
        estado: estadoDe(c.id),
        activo: c.activo,
        equipos: equipos.filter((e) => e.consultorioId === c.id).length,
      })),
    // estadoDe depende solo de `equipos`
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [consultorios, equipos],
  )

  const seleccionado = consultorios.find((c) => c.id === seleccionadoId) ?? null
  const nuevoEnMapa = Boolean(nuevo) && enMapa
  const fichaAbierta = Boolean(seleccionado) || nuevoEnMapa
  const panelAbierto = fichaAbierta || listaAbierta
  const panelAncho = editandoEnMapa || nuevoEnMapa

  // Espacio que tapa la ficha: la cámara centra el consultorio en lo que queda libre del mapa.
  const margen = useMemo(() => {
    const nada = { top: 0, right: 0, bottom: 0, left: 0 }
    if (!panelAbierto) return nada
    if (ancha) return { ...nada, left: (panelAncho ? 30 : 23) * 16 + 24 }
    return { ...nada, bottom: Math.round(window.innerHeight * 0.38) }
  }, [panelAbierto, panelAncho, ancha])

  function elegir(id: string | null) {
    setModoAgregar(false)
    setNuevo(null)
    setEditandoEnMapa(false)
    setSeleccionadoId(id)
  }

  function consultorioVacio(lat: number, lng: number): Consultorio {
    const ciudad = ciudades.find((c) => c.id === ciudadActiva) ?? ciudades[0]
    return {
      id: idNuevo('con'),
      nombre: '',
      nit: '',
      tipo: 'Prestador ambulatorio de baja complejidad',
      segmento: 'A1',
      ciudad: ciudad.nombre,
      ciudadId: ciudad.id,
      direccion: '',
      zona: 'Centro',
      sedes: 1,
      empleados: 1,
      contacto: '',
      cargoContacto: 'Responsable',
      telefono: '',
      email: '',
      planId: '',
      codigoHabilitacion: '',
      lat,
      lng,
      activo: true,
      creado: hoyISO(),
    }
  }

  function empezarAgregar() {
    if (enMapa) {
      elegir(null)
      setModoAgregar(true)
      toast.info('Toca el mapa', { description: 'Haz clic en el lugar donde está el consultorio.' })
      return
    }
    const ciudad = ciudades.find((c) => c.id === ciudadActiva) ?? ciudades[0]
    setNuevo(consultorioVacio(ciudad.lat, ciudad.lng))
  }

  const nombreCiudad = ciudadActiva === 'todas' ? 'todas las ciudades' : (ciudades.find((c) => c.id === ciudadActiva)?.nombre ?? '')

  // -- filtro de ciudad (desplegable: la lista de ciudades puede crecer sin límite) --------
  const filtroCiudad = (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-full space-y-1.5 sm:w-72">
        <Label htmlFor="ciudad">Ciudad</Label>
        <Select
          id="ciudad"
          value={ciudadActiva}
          onChange={(e) => {
            setCiudadActiva(e.target.value)
            elegir(null)
          }}
          className="h-11 text-base"
        >
          <option value="todas">Todas las ciudades ({consultorios.length})</option>
          {opcionesCiudad.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} ({c.cuenta})
            </option>
          ))}
        </Select>
      </div>
      <p className="pb-2.5 text-sm text-muted-foreground">
        {visibles.length} {visibles.length === 1 ? 'consultorio' : 'consultorios'} en {nombreCiudad}
      </p>
    </div>
  )

  // -- contenido del cuadro que flota sobre el mapa ---------------------------------------
  function fichaResumen(c: Consultorio) {
    const suyos = equipos.filter((e) => e.consultorioId === c.id)
    const cuenta = (s: Semaforo) => suyos.filter((e) => semaforoEquipo(e) === s).length
    const plan = planes.find((p) => p.id === c.planId)
    const estado = estadoDe(c.id)
    const nServicios = servicios.filter((s) => s.consultorioId === c.id).length
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
            <span className={cn('size-2.5 rounded-full', c.activo ? PUNTO[estado] : 'bg-slate-400')} />
            {c.activo ? TEXTO_ESTADO[estado] : 'Desactivado'}
          </span>
          {c.especialidad && <Badge variant="secondary">{c.especialidad}</Badge>}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {c.tipo}
          {c.direccion ? ` · ${c.direccion}` : ''}, {c.ciudad} (zona {c.zona}).
        </p>

        {suyos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center">
            {(['verde', 'amarillo', 'rojo'] as Semaforo[]).map((s) => (
              <div key={s} className="rounded-lg border border-border bg-background px-2 py-2">
                <p className="font-display text-xl font-bold tabular-nums">{cuenta(s)}</p>
                <p className="flex items-center justify-center gap-1.5 text-[11px] leading-tight text-muted-foreground">
                  <span className={cn('size-2 shrink-0 rounded-full', PUNTO[s])} /> {ETIQUETA_SEMAFORO[s]}
                </p>
              </div>
            ))}
          </div>
        )}

        <dl>
          <Dato rotulo="Equipos">{`${suyos.length} · ${nServicios} ${nServicios === 1 ? 'servicio' : 'servicios'}`}</Dato>
          <Dato rotulo="Sedes">{c.sedes}</Dato>
          <Dato rotulo="Plan">{plan ? `${plan.nombre}${plan.precioTexto ? '' : ` · ${cop(plan.precioCOP)}/mes`}` : 'Sin plan'}</Dato>
          <Dato rotulo="Contacto">{c.contacto ? `${c.contacto}${c.cargoContacto ? ` (${c.cargoContacto})` : ''}` : ''}</Dato>
          <Dato rotulo="Teléfono">{c.telefono}</Dato>
          <Dato rotulo="Correo">{c.email}</Dato>
          <Dato rotulo="NIT">{c.nit}</Dato>
          <Dato rotulo="Código REPS">{c.codigoHabilitacion}</Dato>
        </dl>

        <div className="flex flex-wrap gap-2">
          <Button className="flex-1" onClick={() => setEditandoEnMapa(true)}>
            <Pencil /> Editar ficha
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => elegir(null)}>
            Cerrar
          </Button>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          {modo === '3d' ? 'La altura del edificio crece con el número de equipos. Para mover la ubicación, cambia a 2D y arrastra el punto.' : 'Arrastra el punto para corregir la ubicación: se guarda sola.'}
        </p>
      </div>
    )
  }

  let titulo: ReactNode
  let cuerpo: ReactNode
  if (nuevoEnMapa && nuevo) {
    titulo = 'Nuevo consultorio'
    cuerpo = <ConsultorioFicha key={nuevo.id} consultorio={nuevo} esNuevo alTerminar={() => setNuevo(null)} />
  } else if (seleccionado) {
    titulo = seleccionado.nombre
    cuerpo = editandoEnMapa ? (
      <ConsultorioFicha key={seleccionado.id} consultorio={seleccionado} alTerminar={() => setEditandoEnMapa(false)} />
    ) : (
      fichaResumen(seleccionado)
    )
  } else {
    titulo = `${visibles.length} ${visibles.length === 1 ? 'consultorio' : 'consultorios'}`
    cuerpo = (
      <div className="space-y-2">
        {visibles.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay consultorios en esta ciudad. Agrega el primero con el botón de arriba.</p>}
        {visibles.map((c) => {
          const estado = estadoDe(c.id)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => elegir(c.id)}
              className="flex min-h-11 w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition hover:border-primary"
            >
              <span className={cn('size-3 shrink-0 rounded-full', c.activo ? PUNTO[estado] : 'bg-slate-400')} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{c.nombre}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {c.ciudad} · {equipos.filter((e) => e.consultorioId === c.id).length} equipos
                </span>
              </span>
              {!c.activo && <Badge variant="outline">Desactivado</Badge>}
            </button>
          )
        })}
      </div>
    )
  }

  const cuadro = (
    <section
      aria-label="Ficha del consultorio"
      className={cn(
        'absolute z-10 flex flex-col overflow-hidden rounded-xl border border-border bg-card/95 text-card-foreground shadow-xl backdrop-blur-md',
        'left-2 right-2 bottom-2 max-h-[62%] sm:right-auto sm:bottom-auto sm:left-3 sm:top-3 sm:max-h-[calc(100%-1.5rem)]',
        panelAncho ? 'sm:w-[min(30rem,calc(100%-1.5rem))]' : 'sm:w-[min(23rem,calc(100%-1.5rem))]',
      )}
    >
      <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        {fichaAbierta && (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            aria-label={editandoEnMapa ? 'Volver a la ficha' : 'Volver a la lista'}
            onClick={() => (editandoEnMapa ? setEditandoEnMapa(false) : elegir(null))}
          >
            <ArrowLeft />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-display truncate text-base font-bold leading-tight">{titulo}</h2>
          {!fichaAbierta && <p className="truncate text-xs text-muted-foreground">en {nombreCiudad}</p>}
          {seleccionado && !nuevoEnMapa && (
            <p className="truncate text-xs text-muted-foreground">
              {seleccionado.ciudad} · zona {seleccionado.zona}
            </p>
          )}
        </div>
        {fichaAbierta ? (
          <Button variant="ghost" size="icon" className="size-9 shrink-0" aria-label="Cerrar ficha" onClick={() => elegir(null)}>
            <X />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            aria-expanded={listaAbierta}
            aria-label={listaAbierta ? 'Ocultar la lista' : 'Mostrar la lista'}
            onClick={() => setListaAbierta((v) => !v)}
          >
            {listaAbierta === ancha ? <ChevronUp /> : <ChevronDown />}
          </Button>
        )}
      </header>
      {panelAbierto && <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">{cuerpo}</div>}
    </section>
  )

  const leyenda = (
    <p className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
      {(['verde', 'amarillo', 'rojo', 'sin-equipos'] as const).map((e) => (
        <span key={e} className="flex items-center gap-2">
          <span className={cn('size-3.5 rounded-full', PUNTO[e])} /> {TEXTO_ESTADO[e]}
        </span>
      ))}
      <span className="flex items-center gap-2">
        <span className="size-3.5 rounded-full bg-slate-400" /> Desactivado
      </span>
      {modo === '3d' && (
        <span className="flex items-center gap-2">
          <Building2 className="size-4" /> Más alto = más equipos
        </span>
      )}
    </p>
  )

  const vistaMapa = mapaFallo ? (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center text-base text-muted-foreground">
        No pudimos cargar el mapa (puede faltar la conexión a internet). Usa «Ver como tabla» para seguir trabajando.
      </CardContent>
    </Card>
  ) : (
    <div className="space-y-4">
      {leyenda}
      {modoAgregar && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary bg-accent px-4 py-3 text-base font-semibold">
          Haz clic en el mapa para colocar el nuevo consultorio.
          <Button variant="outline" onClick={() => setModoAgregar(false)}>
            <X /> Cancelar
          </Button>
        </div>
      )}
      <div
        ref={caja}
        className="relative h-[calc(100svh-17rem)] min-h-[32rem] max-h-[56rem] overflow-hidden rounded-2xl border border-border bg-muted max-sm:h-[calc(100svh-15rem)] max-sm:min-h-[30rem]"
      >
        <Suspense fallback={<p className="grid h-full place-items-center text-base text-muted-foreground">Cargando el mapa…</p>}>
          <MapaConsultorios
            ciudades={ciudades}
            ciudadActiva={ciudadActiva}
            pines={pines}
            seleccionadoId={seleccionadoId}
            modo={modo}
            margen={margen}
            onSeleccionar={elegir}
            onMover={(id, lat, lng) => {
              actualizarConsultorioPorId(id, { lat, lng })
              toast.success('Ubicación actualizada', { description: 'El punto quedó en su nuevo lugar.' })
            }}
            modoAgregar={modoAgregar}
            onAgregar={(lat, lng) => {
              setModoAgregar(false)
              setNuevo(consultorioVacio(lat, lng))
            }}
            onFallo={() => setMapaFallo(true)}
          />
        </Suspense>

        {/* 2D / 3D: junto a los controles de zoom del mapa */}
        <SelectorDeslizante
          className="absolute right-14 top-3 z-10"
          opciones={[
            { id: '2d' as ModoMapa, nombre: '2D', titulo: 'Plano con un punto por consultorio' },
            { id: '3d' as ModoMapa, nombre: '3D', titulo: 'Cada consultorio como un edificio' },
          ]}
          valor={modo}
          etiqueta="Tipo de mapa"
          onCambio={setModo}
        />

        {cuadro}
      </div>
    </div>
  )

  const vistaTabla = (
    <Card className="border-border/80">
      <CardContent className="p-0 sm:p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Consultorio</TableHead>
              <TableHead>Ciudad y zona</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Equipos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>
                <span className="sr-only">Editar</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold">{c.nombre}</TableCell>
                <TableCell>
                  {c.ciudad}
                  <span className="block text-sm text-muted-foreground">Zona {c.zona}</span>
                </TableCell>
                <TableCell>{c.contacto || '—'}</TableCell>
                <TableCell>{planes.find((p) => p.id === c.planId)?.nombre ?? 'Sin plan'}</TableCell>
                <TableCell>{equipos.filter((e) => e.consultorioId === c.id).length}</TableCell>
                <TableCell>{c.activo ? <Badge variant="good">Activo</Badge> : <Badge variant="outline">Desactivado</Badge>}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => setEditando(c)}>
                    Ver y editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay consultorios en esta ciudad.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administración"
        titulo="Consultorios"
        descripcion="Elige una ciudad para ver dónde están los consultorios. En 3D cada uno es un edificio; en 2D, un punto que puedes arrastrar. Toca uno para ver su ficha sobre el mapa."
        acciones={
          <Button size="lg" onClick={empezarAgregar}>
            <Plus /> Agregar consultorio
          </Button>
        }
      />
      {filtroCiudad}
      <VistaDual clave="admin-mapa" control={control} vista3D={vistaMapa} tabla={vistaTabla} etiqueta3D="Ver mapa" etiquetaTabla="Ver como tabla" />

      <Dialog open={Boolean(editando)} onClose={() => setEditando(null)} title={editando?.nombre ?? ''} description={editando ? `${editando.ciudad} · zona ${editando.zona}` : undefined}>
        {editando && <ConsultorioFicha key={editando.id} consultorio={consultorios.find((c) => c.id === editando.id) ?? editando} alTerminar={() => setEditando(null)} />}
      </Dialog>

      <Dialog open={Boolean(nuevo) && !enMapa} onClose={() => setNuevo(null)} title="Nuevo consultorio" description="Completa los datos. La ubicación se puede ajustar después en el mapa 2D.">
        {nuevo && !enMapa && <ConsultorioFicha key={nuevo.id} consultorio={nuevo} esNuevo alTerminar={() => setNuevo(null)} />}
      </Dialog>

      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="size-4" /> Mapa: © OpenStreetMap contributors · OpenFreeMap. Los consultorios de ejemplo son ficticios, salvo Inoos.
      </p>
    </div>
  )
}
