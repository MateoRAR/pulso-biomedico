import { ArrowLeft, RotateCcw } from 'lucide-react'
import { lazy, Suspense, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { MODELOS, type TipoModelo } from '@/components/consultorio3d/catalogo'
import { NotaFlotante } from '@/components/consultorio3d/NotaFlotante'
import { SelectorDeslizante } from '@/components/shared/SelectorDeslizante'
import { PageHeader, SemaforoBadge } from '@/components/shared/ui'
import { VistaDual } from '@/components/shared/VistaDual'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fechaCorta, semaforoEquipo } from '@/lib/format'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

const VisorEquipo = lazy(() => import('@/components/consultorio3d/VisorEquipo'))

/** Un equipo de la biblioteca: se puede girar en 3D o leer como ficha. */
export function ConsultorioBibliotecaEquipo() {
  const { tipo } = useParams()
  const [params] = useSearchParams()
  const { equipos } = useData()
  const [parteActiva, setParteActiva] = useState<string | null>(null)
  const [reinicio, setReinicio] = useState(0)
  const notaRef = useRef<HTMLDivElement>(null)

  const def = tipo && tipo in MODELOS ? MODELOS[tipo as TipoModelo] : null
  const equipo = equipos.find((e) => e.id === params.get('equipo'))

  if (!def) {
    return (
      <div className="space-y-6">
        <PageHeader titulo="No encontramos ese equipo" descripcion="Vuelve a la biblioteca para elegir otro." />
        <Link to="/consultorio/biblioteca" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
          <ArrowLeft /> Volver a la biblioteca
        </Link>
      </div>
    )
  }

  const parte = def.partes.find((p) => p.id === parteActiva)

  const datosEquipo = equipo && (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="font-display text-xl">Tu equipo: {equipo.nombre}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-base">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Marca y modelo</span>
          <span className="text-right font-semibold">
            {equipo.marca} {equipo.modelo}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Serie</span>
          <span className="text-right font-semibold">{equipo.serie}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Estado</span>
          <SemaforoBadge semaforo={semaforoEquipo(equipo)} />
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Próximo mantenimiento</span>
          <span className="font-semibold">{fechaCorta(equipo.proximoMantenimiento)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Próxima calibración</span>
          <span className="font-semibold">{fechaCorta(equipo.proximaCalibracion)}</span>
        </div>
        <Link to={`/consultorio/equipos/${equipo.id}`} className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}>
          Ver hoja de vida
        </Link>
      </CardContent>
    </Card>
  )

  const vista3D = (
    <div className="space-y-4">
      {/* Partes del equipo: una barra con pastilla que se desliza; tocar una despliega su nota junto al modelo */}
      <SelectorDeslizante
        opciones={def.partes.map((p) => ({ id: p.id, nombre: p.nombre }))}
        valor={parteActiva}
        etiqueta="Partes principales"
        onCambio={(id) => setParteActiva(parteActiva === id ? null : id)}
      />
      <div className="relative h-[calc(100svh-22rem)] min-h-[28rem] max-sm:h-[calc(100svh-28rem)] max-sm:min-h-[24rem] max-h-[52rem] overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-[#eef5f8] to-[#d3e2ea]">
        <Suspense fallback={<p className="grid h-full place-items-center text-base text-muted-foreground">Cargando la vista 3D…</p>}>
          <VisorEquipo tipo={def.id} parteActiva={parteActiva} onParte={setParteActiva} reinicio={reinicio} notaRef={notaRef} />
        </Suspense>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-3 top-3 z-20 bg-card/90 backdrop-blur"
          aria-label="Volver a la vista inicial"
          title="Volver a la vista inicial"
          onClick={() => {
            setParteActiva(null)
            setReinicio((n) => n + 1)
          }}
        >
          <RotateCcw />
        </Button>
        <p className="pointer-events-none absolute inset-x-3 bottom-3 z-20 w-fit rounded-lg bg-card/85 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
          <span className="sm:hidden">Arrastra para girar · pellizca para acercar · toca un punto</span>
          <span className="max-sm:hidden">Arrastra para girar · pellizca o usa la rueda para acercar · toca un punto blanco o una parte</span>
        </p>

        {parte && (
          <NotaFlotante key={parte.id} notaRef={notaRef} titulo={parte.nombre} onCerrar={() => setParteActiva(null)}>
            <p className="font-display pr-8 text-base font-bold leading-snug">{parte.nombre}</p>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{parte.descripcion}</p>
          </NotaFlotante>
        )}
      </div>
      {datosEquipo}
    </div>
  )

  const tabla = (
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="font-display text-xl">Ficha del equipo</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parte</TableHead>
                <TableHead>Qué hace</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {def.partes.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold">{p.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{p.descripcion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {datosEquipo}
    </div>
  )

  return (
    <div className="space-y-8">
      <Link
        to={equipo ? `/consultorio/equipos/${equipo.id}` : '/consultorio/biblioteca'}
        className="inline-flex min-h-10 items-center gap-2 text-base text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-5" /> {equipo ? 'Volver al equipo' : 'Biblioteca de equipos'}
      </Link>
      <PageHeader eyebrow="Biblioteca de equipos" titulo={def.nombre} descripcion={def.resumen} />
      <VistaDual clave="biblioteca-visor" vista3D={vista3D} tabla={tabla} etiquetaTabla="Ver como ficha" />
    </div>
  )
}
