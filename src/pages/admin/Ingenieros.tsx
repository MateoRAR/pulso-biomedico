import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { PageHeader } from '@/components/shared/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input, Label, Select } from '@/components/ui/field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Ingeniero } from '@/data/tipos'
import { textoCalificacion } from '@/lib/format'
import { useTiempoEnPagina } from '@/lib/analytics'
import { useData } from '@/lib/store'

import { IngenieroFicha } from './IngenieroFicha'

function EstadoVerificacion({ estado }: { estado: Ingeniero['estadoVerificacion'] }) {
  const variante = estado === 'Verificado' ? 'good' : estado === 'Rechazado' ? 'alert' : estado === 'En revisión' ? 'warning' : 'outline'
  return <Badge variant={variante}>{estado}</Badge>
}

/** Administración de ingenieros: ver, buscar, filtrar y editar a cada uno. */
export function AdminIngenieros() {
  const { ingenieros, ciudades } = useData()
  useTiempoEnPagina('portal_admin', { rol: 'admin' })
  const [texto, setTexto] = useState('')
  const [ciudad, setCiudad] = useState('todas')
  const [estado, setEstado] = useState('todos')
  const [abiertoId, setAbiertoId] = useState<string | null>(null)

  const lista = useMemo(
    () =>
      ingenieros.filter((i) => {
        const coincide = `${i.nombre} ${i.ciudad} ${i.especialidades.join(' ')}`.toLowerCase().includes(texto.trim().toLowerCase())
        return coincide && (ciudad === 'todas' || i.ciudadId === ciudad) && (estado === 'todos' || i.estadoVerificacion === estado)
      }),
    [ingenieros, texto, ciudad, estado],
  )
  const abierto = ingenieros.find((i) => i.id === abiertoId) ?? null

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administración"
        titulo="Ingenieros"
        descripcion="Consulta a cada ingeniero de la red, revisa sus credenciales y cambia su verificación, disponibilidad o datos."
      />

      <Card className="border-border/80">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-2">
            <Label htmlFor="buscar-ing">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input id="buscar-ing" className="pl-10" placeholder="Nombre, ciudad o especialidad" value={texto} onChange={(e) => setTexto(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ciudad-ing">Ciudad</Label>
            <Select id="ciudad-ing" value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
              <option value="todas">Todas las ciudades</option>
              {ciudades.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado-ing">Verificación</Label>
            <Select id="estado-ing" value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="todos">Todos los estados</option>
              {['Verificado', 'En revisión', 'Pendiente', 'Rechazado'].map((e) => (
                <option key={e}>{e}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <p className="text-base text-muted-foreground">
        {lista.length} {lista.length === 1 ? 'ingeniero' : 'ingenieros'}
      </p>

      <Card className="border-border/80">
        <CardContent className="p-0 sm:p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingeniero</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Verificación</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>
                  <span className="sr-only">Editar</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>
                    <p className="font-semibold">{i.nombre}</p>
                    <p className="text-sm text-muted-foreground">{i.especialidades.join(', ') || 'Sin especialidades'}</p>
                    {!i.activo && <Badge variant="outline">Desactivado</Badge>}
                  </TableCell>
                  <TableCell>
                    {i.ciudad}
                  </TableCell>
                  <TableCell>
                    <EstadoVerificacion estado={i.estadoVerificacion} />
                  </TableCell>
                  <TableCell>{i.disponible ? 'Sí' : 'No'}</TableCell>
                  <TableCell>
                    {textoCalificacion(i)}
                    <span className="block text-sm text-muted-foreground">{i.servicios} servicios</span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setAbiertoId(i.id)}>
                      Ver y editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay ingenieros con esos filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={Boolean(abierto)} onClose={() => setAbiertoId(null)} title={abierto?.nombre ?? ''} description={abierto ? `${abierto.ciudad} · ${abierto.titulo}` : undefined}>
        {abierto && <IngenieroFicha key={abierto.id} ingeniero={abierto} alTerminar={() => setAbiertoId(null)} />}
      </Dialog>
    </div>
  )
}
