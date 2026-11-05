import { Box, ClipboardList, FileText, Plus, Wrench } from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { PUNTOS, type EquipoSala, type PuntoVista } from '@/components/consultorio3d/salaDatos'
import { MODELOS, tipoModeloDe } from '@/components/consultorio3d/catalogo'
import { EmptyState, PageHeader, SemaforoBadge, TriageBadge } from '@/components/shared/ui'
import { VistaDual } from '@/components/shared/VistaDual'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import { fechaCorta, semaforoEquipo } from '@/lib/format'
import { inventarioEjemplo } from '@/lib/registro'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

// Three.js solo se descarga cuando alguien abre la vista 3D.
const SalaConsultorio = lazy(() => import('@/components/consultorio3d/SalaConsultorio'))

export function ConsultorioMiConsultorio3D() {
  const { equipos, consultorio, agregarEquipos } = useData()
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null)
  const [punto, setPunto] = useState<PuntoVista>('general')

  const equiposSala = useMemo<EquipoSala[]>(
    () => equipos.map((e) => ({ id: e.id, nombre: e.nombre, tipo: tipoModeloDe(e), estado: semaforoEquipo(e) })),
    [equipos],
  )
  const seleccionado = equipos.find((e) => e.id === seleccionadoId)

  function cargarEjemplo() {
    agregarEquipos(inventarioEjemplo(consultorio.id))
    toast.success('Equipos de ejemplo cargados', { description: 'Ya puedes recorrerlos en 3D.' })
  }

  if (equipos.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader eyebrow="Mi consultorio" titulo="Mi consultorio en 3D" descripcion="Recorre tu consultorio y mira tus equipos como si estuvieras adentro." />
        <EmptyState
          icon={<Box />}
          titulo="Todavía no hay equipos para mostrar"
          descripcion="Registra tus equipos, o carga unos de ejemplo para probar cómo se ve."
          accion={
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={cargarEjemplo}>
                <ClipboardList /> Cargar equipos de ejemplo
              </Button>
              <Link to="/consultorio/equipos" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                <Plus /> Registrar un equipo
              </Link>
            </div>
          }
        />
      </div>
    )
  }

  const tabla = (
    <Card className="border-border/80">
      <CardContent className="p-0 sm:p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipo</TableHead>
              <TableHead>Lugar</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Importancia</TableHead>
              <TableHead>Próximo mantenimiento</TableHead>
              <TableHead>Próxima calibración</TableHead>
              <TableHead>
                <span className="sr-only">Ver</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipos.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <p className="font-semibold">{e.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {e.marca} {e.modelo}
                  </p>
                </TableCell>
                <TableCell className="text-muted-foreground">{e.sede}</TableCell>
                <TableCell>
                  <SemaforoBadge semaforo={semaforoEquipo(e)} />
                </TableCell>
                <TableCell>
                  <TriageBadge criticidad={e.criticidad} />
                </TableCell>
                <TableCell>{fechaCorta(e.proximoMantenimiento)}</TableCell>
                <TableCell>{fechaCorta(e.proximaCalibracion)}</TableCell>
                <TableCell>
                  <Link to={`/consultorio/equipos/${e.id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                    Abrir
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const vista3D = (
    <div className="space-y-4">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Ir a un lugar del consultorio">
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
              'min-h-10 shrink-0 rounded-lg border px-4 text-base font-semibold transition-colors',
              punto === p.id && !seleccionado ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary',
            )}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_21rem]">
        <div className="relative h-[26rem] overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-[#e8f2f6] to-[#cfe0e8] sm:h-[34rem]">
          <Suspense fallback={<p className="grid h-full place-items-center text-base text-muted-foreground">Cargando la vista 3D…</p>}>
            <SalaConsultorio equipos={equiposSala} seleccionadoId={seleccionadoId} onSeleccionar={setSeleccionadoId} punto={punto} onPunto={setPunto} />
          </Suspense>
          <p className="pointer-events-none absolute inset-x-0 bottom-2 px-3 text-center text-sm font-medium text-[#27343e]">
            Arrastra para mirar alrededor · toca un equipo para ver sus datos
          </p>
        </div>

        <Card className="h-fit border-border/80">
          {seleccionado ? (
            <>
              <CardHeader>
                <CardTitle className="font-display text-xl">{seleccionado.nombre}</CardTitle>
                <p className="text-base text-muted-foreground">
                  {seleccionado.marca} {seleccionado.modelo}
                </p>
              </CardHeader>
              <CardContent className="space-y-4 text-base">
                <div className="flex flex-wrap gap-2">
                  <SemaforoBadge semaforo={semaforoEquipo(seleccionado)} />
                  <TriageBadge criticidad={seleccionado.criticidad} />
                </div>
                <dl className="space-y-2">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Serie</dt>
                    <dd className="text-right font-semibold">{seleccionado.serie}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Mantenimiento</dt>
                    <dd className="font-semibold">{fechaCorta(seleccionado.proximoMantenimiento)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Calibración</dt>
                    <dd className="font-semibold">{fechaCorta(seleccionado.proximaCalibracion)}</dd>
                  </div>
                </dl>
                <div className="grid gap-2">
                  <Link to={`/consultorio/equipos/${seleccionado.id}`} className={buttonVariants({ size: 'lg' })}>
                    <FileText /> Ver hoja de vida
                  </Link>
                  <Link to="/consultorio/solicitudes/nueva" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                    <Wrench /> Pedir un servicio
                  </Link>
                  <Link
                    to={`/consultorio/biblioteca/${tipoModeloDe(seleccionado)}?equipo=${seleccionado.id}`}
                    className={buttonVariants({ variant: 'outline', size: 'lg' })}
                  >
                    <Box /> Ver cómo es por dentro
                  </Link>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="font-display text-xl">¿Cómo leer el 3D?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-base">
                <p className="text-muted-foreground">El anillo en el piso de cada equipo muestra cómo está:</p>
                {[
                  ['bg-emerald-400', 'Al día'],
                  ['bg-amber-400', 'Por vencer'],
                  ['bg-rose-400', 'Requiere atención'],
                ].map(([color, texto]) => (
                  <p key={texto} className="flex items-center gap-3">
                    <span className={cn('size-4 rounded-full', color)} /> {texto}
                  </p>
                ))}
                <p className="text-muted-foreground">
                  Los círculos azules en el piso te llevan a otra zona. Si prefieres leerlo en orden, usa «Ver como tabla».
                </p>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Mi consultorio"
        titulo="Mi consultorio en 3D"
        descripcion={`${equipos.length} ${equipos.length === 1 ? 'equipo' : 'equipos'} de ${consultorio.nombre}. Los modelos son representaciones ilustrativas, no la marca exacta de cada equipo.`}
        acciones={
          <Link to="/consultorio/biblioteca" className={buttonVariants({ variant: 'outline' })}>
            <Box /> Biblioteca de equipos
          </Link>
        }
      />
      <VistaDual clave="consultorio-sala" vista3D={vista3D} tabla={tabla} />
    </div>
  )
}

// Utilidad para mostrar el nombre del tipo de modelo en otras pantallas.
export function nombreModelo(equipo: { nombre: string; tipo?: string }): string {
  return MODELOS[tipoModeloDe(equipo)].nombre
}
