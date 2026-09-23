import { Boxes, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState, PageHeader, SemaforoBadge } from '@/components/shared/ui'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input, Label, Select } from '@/components/ui/field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import { fechaCorta, semaforoEquipo } from '@/lib/format'
import { useData } from '@/lib/store'
import type { Criticidad, EstadoEquipo, Equipo } from '@/lib/mock/data'

const criticidades: Criticidad[] = ['Crítica', 'Alta', 'Media', 'Programada']
const estados: EstadoEquipo[] = ['Operativo', 'En mantenimiento', 'Requiere calibración', 'Fuera de servicio']

export function ConsultorioEquipos() {
  const { equipos, consultorio, agregarEquipo } = useData()
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState('todos')
  const [criticidad, setCriticidad] = useState('todas')
  const [dialogo, setDialogo] = useState(false)

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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Inventario"
        titulo="Equipos y hojas de vida"
        descripcion="Cada equipo con su marca, serie, registro sanitario, criticidad y estado de calibración."
        acciones={
          <Button onClick={() => setDialogo(true)} className="shadow-ocean">
            <Plus /> Agregar equipo
          </Button>
        }
      />

      <Card className="border-border/80">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[1.6fr_1fr_1fr]">
          <div className="space-y-2">
            <Label htmlFor="buscar">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="buscar"
                className="pl-9"
                placeholder="Nombre, marca, modelo o serie"
                value={texto}
                onChange={(event) => setTexto(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label htmlFor="criticidad">Criticidad</Label>
            <Select id="criticidad" value={criticidad} onChange={(event) => setCriticidad(event.target.value)}>
              <option value="todas">Todas</option>
              {criticidades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {resultados.length === 0 ? (
        <EmptyState icon={<Boxes />} titulo="Sin equipos con esos filtros" descripcion="Ajusta la búsqueda o agrega un equipo nuevo." />
      ) : (
        <Card className="overflow-hidden border-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Criticidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Semáforo</TableHead>
                <TableHead>Próx. calibración</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultados.map((equipo) => (
                <TableRow key={equipo.id}>
                  <TableCell>
                    <p className="font-medium">{equipo.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {equipo.marca} {equipo.modelo} · {equipo.serie}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">{equipo.sede}</TableCell>
                  <TableCell className="text-sm">{equipo.criticidad}</TableCell>
                  <TableCell className="text-sm">{equipo.estado}</TableCell>
                  <TableCell>
                    <SemaforoBadge semaforo={semaforoEquipo(equipo)} />
                  </TableCell>
                  <TableCell className="text-sm">{fechaCorta(equipo.proximaCalibracion)}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/consultorio/equipos/${equipo.id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                      Ver
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog
        open={dialogo}
        onClose={() => setDialogo(false)}
        title="Agregar equipo"
        description="Registra el equipo para incluirlo en el cronograma y el expediente."
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
            <Label htmlFor="criticidad-nueva">Criticidad</Label>
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
