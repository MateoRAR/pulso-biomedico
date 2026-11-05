import { BadgeCheck, Power, Save, ShieldX, Star } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input, Label, Select, Textarea } from '@/components/ui/field'
import { Switch } from '@/components/ui/misc'
import { toast } from '@/components/ui/toast'
import { especialidades, type Ingeniero } from '@/data/tipos'
import { textoCalificacion } from '@/lib/format'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

const ESTADOS: Ingeniero['estadoVerificacion'][] = ['Pendiente', 'En revisión', 'Verificado', 'Rechazado']

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={cn(
        'min-h-10 rounded-full border px-4 text-base font-semibold transition-colors',
        activo ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary',
      )}
    >
      {children}
    </button>
  )
}

/** Ficha para ver y editar a un ingeniero: datos, credenciales, verificación y disponibilidad. */
export function IngenieroFicha({ ingeniero, alTerminar }: { ingeniero: Ingeniero; alTerminar: () => void }) {
  const { ciudades, actualizarIngeniero } = useData()
  const [datos, setDatos] = useState<Ingeniero>(ingeniero)

  const cambiar = <K extends keyof Ingeniero>(campo: K, valor: Ingeniero[K]) => setDatos((d) => ({ ...d, [campo]: valor }))
  const alternar = (campo: 'especialidades', valor: string) =>
    setDatos((d) => ({ ...d, [campo]: d[campo].includes(valor) ? d[campo].filter((x) => x !== valor) : [...d[campo], valor] }))

  function guardar(extra: Partial<Ingeniero> = {}) {
    if (!datos.nombre.trim()) {
      toast.error('Falta el nombre', { description: 'Escribe el nombre del ingeniero para guardar.' })
      return
    }
    const final = { ...datos, ...extra }
    actualizarIngeniero(datos.id, { ...final, nombre: final.nombre.trim(), verificado: final.estadoVerificacion === 'Verificado' })
    setDatos(final)
    toast.success('Cambios guardados', { description: 'La ficha del ingeniero quedó actualizada.' })
    alTerminar()
  }

  function alternarActivo() {
    const activo = !datos.activo
    actualizarIngeniero(datos.id, { activo })
    setDatos((d) => ({ ...d, activo }))
    toast.info(activo ? 'Ingeniero reactivado' : 'Ingeniero desactivado', {
      description: activo ? 'Vuelve a aparecer en la red.' : 'Ya no aparece en la red, pero se puede reactivar.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg bg-muted px-4 py-3 text-base">
        <span className="flex items-center gap-2">
          <Star className="size-5 text-primary" /> {textoCalificacion(ingeniero)}
        </span>
        <span>{ingeniero.servicios} {ingeniero.servicios === 1 ? 'servicio terminado' : 'servicios terminados'}</span>
        <span>{ingeniero.opiniones.length} {ingeniero.opiniones.length === 1 ? 'opinión' : 'opiniones'}</span>
        {!datos.activo && <span className="font-semibold text-destructive">Desactivado</span>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="i-nombre">Nombre</Label>
          <Input id="i-nombre" value={datos.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="i-titulo">Título profesional</Label>
          <Input id="i-titulo" value={datos.titulo} onChange={(e) => cambiar('titulo', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="i-ciudad">Ciudad</Label>
          <Select
            id="i-ciudad"
            value={datos.ciudadId}
            onChange={(e) => {
              const c = ciudades.find((x) => x.id === e.target.value)
              if (c) setDatos((d) => ({ ...d, ciudadId: c.id, ciudad: c.nombre }))
            }}
          >
            {ciudades.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="i-exp">Años de experiencia</Label>
          <Input id="i-exp" type="number" min={0} value={datos.experiencia} onChange={(e) => cambiar('experiencia', Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <p className="text-base font-semibold">Especialidades</p>
          <div className="flex flex-wrap gap-2">
            {especialidades.map((e) => (
              <Chip key={e} activo={datos.especialidades.includes(e)} onClick={() => alternar('especialidades', e)}>
                {e}
              </Chip>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="i-invima">Inscripción INVIMA</Label>
          <Input id="i-invima" value={datos.registroInvima} onChange={(e) => cambiar('registroInvima', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="i-copnia">Tarjeta COPNIA</Label>
          <Input id="i-copnia" value={datos.tarjetaCopnia} onChange={(e) => cambiar('tarjetaCopnia', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="i-estado">Estado de la verificación</Label>
          <Select id="i-estado" value={datos.estadoVerificacion} onChange={(e) => cambiar('estadoVerificacion', e.target.value as Ingeniero['estadoVerificacion'])}>
            {ESTADOS.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="i-seg">Tipo de trabajo</Label>
          <Select id="i-seg" value={datos.segmento} onChange={(e) => cambiar('segmento', e.target.value as Ingeniero['segmento'])}>
            <option value="B1">Independiente con experiencia</option>
            <option value="B2">Empezando</option>
            <option value="B3">Con contrato fijo</option>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="i-resena">Presentación</Label>
          <Textarea id="i-resena" value={datos.resena} onChange={(e) => cambiar('resena', e.target.value)} />
        </div>
        <div className="flex items-center justify-between gap-4 sm:col-span-2">
          <Label htmlFor="i-disp">Disponible para nuevos servicios</Label>
          <Switch id="i-disp" checked={datos.disponible} onCheckedChange={(v) => cambiar('disponible', v)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={() => guardar()}>
          <Save /> Guardar cambios
        </Button>
        {datos.estadoVerificacion !== 'Verificado' && (
          <Button size="lg" variant="outline" onClick={() => guardar({ estadoVerificacion: 'Verificado' })}>
            <BadgeCheck /> Aprobar verificación
          </Button>
        )}
        {datos.estadoVerificacion !== 'Rechazado' && (
          <Button size="lg" variant="outline" onClick={() => guardar({ estadoVerificacion: 'Rechazado' })}>
            <ShieldX /> Rechazar
          </Button>
        )}
        <Button size="lg" variant="ghost" onClick={alternarActivo}>
          <Power /> {datos.activo ? 'Desactivar' : 'Reactivar'}
        </Button>
        <Button size="lg" variant="ghost" onClick={alTerminar}>
          Cerrar
        </Button>
      </div>
    </div>
  )
}
