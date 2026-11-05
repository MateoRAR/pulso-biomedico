import { MapPin, Plus, X } from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'

import type { PinConsultorio } from '@/components/admin/MapaConsultorios'
import { PageHeader } from '@/components/shared/ui'
import { useVista, VistaDual } from '@/components/shared/VistaDual'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import type { Consultorio, Semaforo } from '@/data/tipos'
import { semaforoEquipo } from '@/lib/format'
import { hoyISO, idNuevo } from '@/lib/registro'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

import { ConsultorioFicha } from './ConsultorioFicha'

// MapLibre solo se descarga cuando alguien abre el mapa.
const MapaConsultorios = lazy(() => import('@/components/admin/MapaConsultorios'))

const ORDEN: Semaforo[] = ['rojo', 'amarillo', 'verde']

export function AdminMapa() {
  const { consultorios, ciudades, equipos, planes, actualizarConsultorioPorId } = useData()
  const [ciudadActiva, setCiudadActiva] = useState('cali')
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null)
  const [nuevo, setNuevo] = useState<Consultorio | null>(null)
  const [modoAgregar, setModoAgregar] = useState(false)
  const [mapaFallo, setMapaFallo] = useState(false)
  const [editando, setEditando] = useState<Consultorio | null>(null)
  const control = useVista('admin-mapa')

  /** El peor estado de sus equipos: si hay uno que requiere atención, el consultorio se marca así. */
  const estadoDe = (id: string): PinConsultorio['estado'] => {
    const suyos = equipos.filter((e) => e.consultorioId === id).map(semaforoEquipo)
    if (suyos.length === 0) return 'sin-equipos'
    return ORDEN.find((s) => suyos.includes(s)) ?? 'verde'
  }

  const visibles = useMemo(
    () => consultorios.filter((c) => ciudadActiva === 'todas' || c.ciudadId === ciudadActiva),
    [consultorios, ciudadActiva],
  )

  const pines = useMemo<PinConsultorio[]>(
    () =>
      consultorios.map((c) => ({ id: c.id, nombre: c.nombre, lat: c.lat, lng: c.lng, estado: estadoDe(c.id), activo: c.activo })),
    // estadoDe depende solo de `equipos`
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [consultorios, equipos],
  )

  const seleccionado = consultorios.find((c) => c.id === seleccionadoId) ?? null

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

  function empezarAgregar(enMapa: boolean) {
    if (enMapa) {
      setSeleccionadoId(null)
      setModoAgregar(true)
      toast.info('Toca el mapa', { description: 'Haz clic en el lugar donde está el consultorio.' })
      return
    }
    const ciudad = ciudades.find((c) => c.id === ciudadActiva) ?? ciudades[0]
    setNuevo(consultorioVacio(ciudad.lat, ciudad.lng))
  }

  const pestanas = (
    <div role="tablist" aria-label="Ciudades" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {[{ id: 'todas', nombre: 'Todas', cuenta: consultorios.length }, ...ciudades.map((c) => ({ id: c.id, nombre: c.corto, cuenta: consultorios.filter((x) => x.ciudadId === c.id).length }))].map(
        (c) => (
          <button
            key={c.id}
            role="tab"
            type="button"
            aria-selected={ciudadActiva === c.id}
            onClick={() => {
              setCiudadActiva(c.id)
              setSeleccionadoId(null)
            }}
            className={cn(
              'flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-4 text-base font-semibold transition-colors',
              ciudadActiva === c.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary',
            )}
          >
            {c.nombre}
            <span className={cn('rounded-full px-2 text-sm', ciudadActiva === c.id ? 'bg-white/25' : 'bg-muted text-muted-foreground')}>{c.cuenta}</span>
          </button>
        ),
      )}
    </div>
  )

  const leyenda = (
    <p className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
      {[
        ['bg-emerald-500', 'Equipos al día'],
        ['bg-amber-500', 'Algo por vencer'],
        ['bg-rose-500', 'Requiere atención'],
        ['bg-slate-500', 'Sin equipos registrados'],
        ['bg-slate-400', 'Desactivado'],
      ].map(([color, texto]) => (
        <span key={texto} className="flex items-center gap-2">
          <span className={cn('size-3.5 rounded-full', color)} /> {texto}
        </span>
      ))}
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
      <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
        <div className="relative h-[28rem] overflow-hidden rounded-2xl border border-border bg-muted sm:h-[36rem]">
          <Suspense fallback={<p className="grid h-full place-items-center text-base text-muted-foreground">Cargando el mapa…</p>}>
            <MapaConsultorios
              ciudades={ciudades}
              ciudadActiva={ciudadActiva}
              pines={pines}
              seleccionadoId={seleccionadoId}
              onSeleccionar={(id) => {
                setModoAgregar(false)
                setSeleccionadoId(id)
              }}
              onMover={(id, lat, lng) => {
                actualizarConsultorioPorId(id, { lat, lng })
                toast.success('Ubicación actualizada', { description: 'El pin quedó en su nuevo lugar.' })
              }}
              modoAgregar={modoAgregar}
              onAgregar={(lat, lng) => {
                setModoAgregar(false)
                setNuevo(consultorioVacio(lat, lng))
              }}
              onFallo={() => setMapaFallo(true)}
            />
          </Suspense>
        </div>

        <Card className="h-fit border-border/80">
          {seleccionado ? (
            <>
              <CardHeader>
                <CardTitle className="font-display text-xl">{seleccionado.nombre}</CardTitle>
                <p className="text-base text-muted-foreground">
                  {seleccionado.ciudad} · zona {seleccionado.zona}
                </p>
              </CardHeader>
              <CardContent>
                <ConsultorioFicha key={seleccionado.id} consultorio={seleccionado} alTerminar={() => setSeleccionadoId(null)} />
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="font-display text-xl">
                  {visibles.length} {visibles.length === 1 ? 'consultorio' : 'consultorios'}
                  {ciudadActiva !== 'todas' && ` en ${ciudades.find((c) => c.id === ciudadActiva)?.corto}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {visibles.length === 0 && <p className="text-base text-muted-foreground">Aún no hay consultorios en esta ciudad. Agrega el primero con el botón de arriba.</p>}
                {visibles.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSeleccionadoId(c.id)}
                    className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-4 py-2 text-left text-base transition hover:border-primary"
                  >
                    <span className="font-semibold">{c.nombre}</span>
                    {!c.activo && <Badge variant="outline">Desactivado</Badge>}
                  </button>
                ))}
                <p className="pt-2 text-sm text-muted-foreground">Toca un pin o un consultorio de esta lista para ver y editar su ficha.</p>
              </CardContent>
            </>
          )}
        </Card>
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
        descripcion="Elige una ciudad para ver dónde están los consultorios. Puedes ver y editar cada ficha, mover un pin o agregar un consultorio nuevo."
        acciones={
          <Button size="lg" onClick={() => empezarAgregar(control.vista === '3d' && !mapaFallo)}>
            <Plus /> Agregar consultorio
          </Button>
        }
      />
      {pestanas}
      <VistaDual clave="admin-mapa" control={control} vista3D={vistaMapa} tabla={vistaTabla} etiqueta3D="Ver mapa 3D" etiquetaTabla="Ver como tabla" />

      <Dialog open={Boolean(editando)} onClose={() => setEditando(null)} title={editando?.nombre ?? ''} description={editando ? `${editando.ciudad} · zona ${editando.zona}` : undefined}>
        {editando && <ConsultorioFicha key={editando.id} consultorio={consultorios.find((c) => c.id === editando.id) ?? editando} alTerminar={() => setEditando(null)} />}
      </Dialog>

      <Dialog open={Boolean(nuevo)} onClose={() => setNuevo(null)} title="Nuevo consultorio" description="Completa los datos. La ubicación se puede ajustar después arrastrando el pin.">
        {nuevo && <ConsultorioFicha key={nuevo.id} consultorio={nuevo} esNuevo alTerminar={() => setNuevo(null)} />}
      </Dialog>

      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="size-4" /> Mapa: © OpenStreetMap contributors · OpenFreeMap. Los consultorios de ejemplo son ficticios.
      </p>
    </div>
  )
}
