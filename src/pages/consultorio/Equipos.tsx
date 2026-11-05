import { Box, Boxes, ChevronRight, ClipboardList, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { planoPara } from '@/components/consultorio3d/salaDatos'
import { VistaSala } from '@/components/consultorio3d/VistaSala'
import { EmptyState, PageHeader } from '@/components/shared/ui'
import { VistaDual } from '@/components/shared/VistaDual'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input, Label, Select } from '@/components/ui/field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import { diasHasta, ETIQUETA_SEMAFORO, fechaCorta, semaforoEquipo } from '@/lib/format'
import { inventarioEjemplo } from '@/lib/registro'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Criticidad, EstadoEquipo, Equipo, Semaforo } from '@/data/tipos'

const criticidades: Criticidad[] = ['Crítica', 'Alta', 'Media', 'Programada']
const estados: EstadoEquipo[] = ['Operativo', 'En mantenimiento', 'Requiere calibración', 'Fuera de servicio']

const PUNTO_SEMAFORO: Record<Semaforo, string> = { verde: 'bg-emerald-500', amarillo: 'bg-amber-500', rojo: 'bg-rose-500' }

const COLOR_IMPORTANCIA: Record<Criticidad, string> = {
  Crítica: 'font-semibold text-rose-600 dark:text-rose-400',
  Alta: 'font-semibold text-amber-600 dark:text-amber-400',
  Media: 'font-medium',
  Programada: 'text-muted-foreground',
}

/** "vence en 12 días", "vencida hace 3 días": lo que se entiende sin hacer cuentas con la fecha. */
function textoPlazo(iso: string): { texto: string; vencido: boolean } | null {
  const dias = diasHasta(iso)
  if (dias === null) return null
  const unidad = (n: number) => (n === 1 ? 'día' : 'días')
  if (dias < 0) return { texto: `vencida hace ${-dias} ${unidad(-dias)}`, vencido: true }
  if (dias === 0) return { texto: 'vence hoy', vencido: true }
  return { texto: `en ${dias} ${unidad(dias)}`, vencido: false }
}

/** Interruptor sencillo (en vez de un botón que cambia de texto). */
function Interruptor({ activo, onCambio, texto }: { activo: boolean; onCambio: (v: boolean) => void; texto: string }) {
  return (
    <button type="button" role="switch" aria-checked={activo} onClick={() => onCambio(!activo)} className="group flex min-h-10 items-center gap-3 text-sm font-medium">
      <span className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200', activo ? 'bg-primary' : 'bg-muted-foreground/30')}>
        <span className={cn('absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200', activo && 'translate-x-5')} />
      </span>
      {texto}
    </button>
  )
}

export function ConsultorioEquipos() {
  const { equipos, consultorio, agregarEquipo, agregarEquipos } = useData()
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState('todos')
  const [criticidad, setCriticidad] = useState('todas')
  const [dialogo, setDialogo] = useState(false)
  const [verTodo, setVerTodo] = useState(false)

  const [nuevo, setNuevo] = useState({
    nombre: '',
    tipo: 'Odontología',
    marca: '',
    modelo: '',
    serie: '',
    sede: consultorio.nombre,
    criticidad: 'Media' as Criticidad,
    estado: 'Operativo' as EstadoEquipo,
    registroSanitario: '',
  })

  const resultados = useMemo(
    () =>
      equipos.filter((e) => {
        const coincideTexto =
          texto.trim() === '' ||
          `${e.nombre} ${e.marca} ${e.modelo} ${e.serie}`.toLowerCase().includes(texto.toLowerCase())
        return (
          coincideTexto &&
          (estado === 'todos' || e.estado === estado) &&
          (criticidad === 'todas' || e.criticidad === criticidad)
        )
      }),
    [equipos, texto, estado, criticidad],
  )

  function guardar() {
    if (!nuevo.nombre || !nuevo.marca || !nuevo.modelo) {
      toast.error('Faltan datos', { description: 'Nombre, marca y modelo son obligatorios.' })
      return
    }
    const equipo: Equipo = {
      id: `eq-${Date.now()}`,
      consultorioId: consultorio.id,
      nombre: nuevo.nombre,
      tipo: nuevo.tipo,
      marca: nuevo.marca,
      modelo: nuevo.modelo,
      serie: nuevo.serie || `S/N-${Date.now().toString().slice(-5)}`,
      sede: nuevo.sede,
      criticidad: nuevo.criticidad,
      estado: nuevo.estado,
      registroSanitario: nuevo.registroSanitario || 'No aplica',
      proximoMantenimiento: new Date(Date.now() + 180 * 86_400_000).toISOString().slice(0, 10),
      proximaCalibracion: new Date(Date.now() + 180 * 86_400_000).toISOString().slice(0, 10),
      responsable: consultorio.contacto,
    }
    agregarEquipo(equipo)
    toast.success('Equipo agregado', { description: `${equipo.nombre} quedó en tu inventario.` })
    setDialogo(false)
    setNuevo({ ...nuevo, nombre: '', marca: '', modelo: '', serie: '', registroSanitario: '' })
  }

  function cargarEjemplo() {
    agregarEquipos(inventarioEjemplo(consultorio.id))
    toast.success('Equipos de ejemplo cargados', { description: 'Ya puedes recorrerlos en 3D y en la tabla.' })
  }

  const cuenta = (sem: Semaforo) => equipos.filter((e) => semaforoEquipo(e) === sem).length

  const tabla = (
    <div className="space-y-4">
      {/* Resumen: cuántos hay en cada estado, en una sola línea */}
      <p className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm">
        <span className="font-semibold">
          {equipos.length} {equipos.length === 1 ? 'equipo' : 'equipos'}
        </span>
        {(['verde', 'amarillo', 'rojo'] as Semaforo[]).map((sem) => (
          <span key={sem} className="flex items-center gap-2 text-muted-foreground">
            <span className={cn('size-2.5 rounded-full', PUNTO_SEMAFORO[sem])} />
            <span className="font-semibold tabular-nums text-foreground">{cuenta(sem)}</span> {ETIQUETA_SEMAFORO[sem].toLowerCase()}
          </span>
        ))}
      </p>

      {/* Búsqueda y filtros en una sola barra */}
      <div className="grid gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_1fr_1fr_auto] lg:items-end">
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="buscar">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="buscar" className="pl-9" placeholder="Nombre, marca o serie" value={texto} onChange={(event) => setTexto(event.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="estado">Estado</Label>
          <Select id="estado" value={estado} onChange={(event) => setEstado(event.target.value)}>
            <option value="todos">Todos</option>
            {estados.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="criticidad">Importancia</Label>
          <Select id="criticidad" value={criticidad} onChange={(event) => setCriticidad(event.target.value)}>
            <option value="todas">Todas</option>
            {criticidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <Interruptor activo={verTodo} onCambio={setVerTodo} texto="Todos los datos" />
        </div>
      </div>

      {resultados.length === 0 ? (
        <EmptyState icon={<Boxes />} titulo="Sin equipos con esos filtros" descripcion="Ajusta la búsqueda o agrega un equipo nuevo." />
      ) : (
        <Card className="overflow-hidden border-border/80">
          <CardContent className="p-0 max-md:bg-muted/30 max-md:p-3">
            <Table className={verTodo ? 'md:[&_td]:px-2.5 md:[&_th]:px-2.5' : undefined}>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Sede</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Importancia</TableHead>
                  {verTodo && <TableHead>Serie</TableHead>}
                  {verTodo && <TableHead>Registro sanitario</TableHead>}
                  {verTodo && <TableHead>Responsable</TableHead>}
                  {verTodo && <TableHead>Próx. mantenimiento</TableHead>}
                  <TableHead>Calibración</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultados.map((equipo) => {
                  const sem = semaforoEquipo(equipo)
                  const plazo = textoPlazo(equipo.proximaCalibracion)
                  return (
                    <TableRow key={equipo.id}>
                      <TableCell>
                        <p className="font-semibold">{equipo.nombre}</p>
                        <p className="text-xs font-normal text-muted-foreground">
                          {equipo.marca} {equipo.modelo}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{equipo.sede}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 text-sm font-medium">
                          <span className={cn('size-2.5 shrink-0 rounded-full', PUNTO_SEMAFORO[sem])} />
                          {ETIQUETA_SEMAFORO[sem]}
                        </span>
                        {equipo.estado !== 'Operativo' && <span className="block text-xs text-muted-foreground">{equipo.estado}</span>}
                      </TableCell>
                      <TableCell className={cn('text-sm', COLOR_IMPORTANCIA[equipo.criticidad])}>{equipo.criticidad}</TableCell>
                      {verTodo && <TableCell className="text-sm">{equipo.serie}</TableCell>}
                      {verTodo && <TableCell className="text-sm">{equipo.registroSanitario}</TableCell>}
                      {verTodo && <TableCell className="text-sm">{equipo.responsable}</TableCell>}
                      {verTodo && <TableCell className="text-sm">{fechaCorta(equipo.proximoMantenimiento)}</TableCell>}
                      <TableCell className="text-sm">
                        {fechaCorta(equipo.proximaCalibracion)}
                        {plazo && <span className={cn('block text-xs', plazo.vencido ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-muted-foreground')}>{plazo.texto}</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/consultorio/equipos/${equipo.id}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-primary')}>
                          Abrir <ChevronRight />
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mi consultorio"
        titulo="Mis equipos"
        descripcion={
          equipos.length > 0
            ? `${equipos.length} ${equipos.length === 1 ? 'equipo' : 'equipos'} de ${consultorio.nombre}. Recórrelos en 3D o consúltalos en tabla. Los modelos 3D son ilustrativos, no la marca exacta.`
            : 'Registra tus equipos para verlos en 3D, en tabla y en el calendario.'
        }
        acciones={
          <>
            <Link to="/consultorio/biblioteca" className={buttonVariants({ variant: 'outline' })}>
              <Box /> Biblioteca
            </Link>
            <Button onClick={() => setDialogo(true)} className="shadow-ocean">
              <Plus /> Agregar equipo
            </Button>
          </>
        }
      />

      {equipos.length === 0 ? (
        <EmptyState
          icon={<Box />}
          titulo="Todavía no hay equipos para mostrar"
          descripcion="Registra tus equipos, o carga unos de ejemplo para probar cómo se ve."
          accion={
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={cargarEjemplo}>
                <ClipboardList /> Cargar equipos de ejemplo
              </Button>
              <Button variant="outline" size="lg" onClick={() => setDialogo(true)}>
                <Plus /> Registrar un equipo
              </Button>
            </div>
          }
        />
      ) : (
        <VistaDual clave="consultorio-equipos" vista3D={<VistaSala equipos={equipos} plano={planoPara(consultorio.especialidad)} />} tabla={tabla} etiqueta3D="Ver en 3D" etiquetaTabla="Ver como tabla" />
      )}

      <Dialog
        open={dialogo}
        onClose={() => setDialogo(false)}
        title="Agregar equipo"
        description="Registra el equipo para incluirlo en el calendario y en los documentos."
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogo(false)}>
              Cancelar
            </Button>
            <Button onClick={guardar}>Guardar equipo</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nombre">Nombre del equipo</Label>
            <Input id="nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Autoclave de mesa 23 L" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input id="marca" value={nuevo.marca} onChange={(e) => setNuevo({ ...nuevo, marca: e.target.value })} placeholder="Tuttnauer" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo</Label>
            <Input id="modelo" value={nuevo.modelo} onChange={(e) => setNuevo({ ...nuevo, modelo: e.target.value })} placeholder="3870M" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serie">Serie</Label>
            <Input id="serie" value={nuevo.serie} onChange={(e) => setNuevo({ ...nuevo, serie: e.target.value })} placeholder="TT-00000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rs">Registro sanitario</Label>
            <Input id="rs" value={nuevo.registroSanitario} onChange={(e) => setNuevo({ ...nuevo, registroSanitario: e.target.value })} placeholder="INVIMA 2020DM-0000000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="criticidad-nueva">Importancia del equipo</Label>
            <Select id="criticidad-nueva" value={nuevo.criticidad} onChange={(e) => setNuevo({ ...nuevo, criticidad: e.target.value as Criticidad })}>
              {criticidades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado-nuevo">Estado</Label>
            <Select id="estado-nuevo" value={nuevo.estado} onChange={(e) => setNuevo({ ...nuevo, estado: e.target.value as EstadoEquipo })}>
              {estados.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
