import { Power, Save } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input, Label, Select } from '@/components/ui/field'
import { toast } from '@/components/ui/toast'
import { zonasCali, type Consultorio } from '@/data/tipos'
import { useData } from '@/lib/store'

/**
 * Ficha para ver y editar un consultorio (o crear uno nuevo). El mismo formulario se usa
 * en el cuadro que flota sobre el mapa y en la ventana de la vista de tabla.
 */
export function ConsultorioFicha({
  consultorio,
  esNuevo = false,
  alTerminar,
}: {
  consultorio: Consultorio
  esNuevo?: boolean
  /** Se llama al guardar o cancelar, para que quien la muestra la cierre. */
  alTerminar: () => void
}) {
  const { ciudades, planes, equipos, servicios, crearConsultorio, actualizarConsultorioPorId } = useData()
  const [datos, setDatos] = useState<Consultorio>(consultorio)

  // Si se mueve el pin en el mapa, la ubicación del formulario se actualiza sin perder lo demás.
  useEffect(() => {
    setDatos((d) => ({ ...d, lat: consultorio.lat, lng: consultorio.lng }))
  }, [consultorio.lat, consultorio.lng])

  const cambiar = <K extends keyof Consultorio>(campo: K, valor: Consultorio[K]) => setDatos((d) => ({ ...d, [campo]: valor }))
  const nEquipos = equipos.filter((e) => e.consultorioId === consultorio.id).length
  const nServicios = servicios.filter((s) => s.consultorioId === consultorio.id).length

  function elegirCiudad(id: string) {
    const ciudad = ciudades.find((c) => c.id === id)
    if (!ciudad) return
    setDatos((d) => ({ ...d, ciudadId: ciudad.id, ciudad: ciudad.nombre }))
  }

  function guardar() {
    if (!datos.nombre.trim()) {
      toast.error('Falta el nombre', { description: 'Escribe el nombre del consultorio para guardarlo.' })
      return
    }
    if (!Number.isFinite(datos.lat) || !Number.isFinite(datos.lng)) {
      toast.error('La ubicación no es válida', { description: 'Revisa la latitud y la longitud.' })
      return
    }
    if (esNuevo) {
      crearConsultorio({ ...datos, nombre: datos.nombre.trim() })
      toast.success('Consultorio creado', { description: `${datos.nombre.trim()} ya aparece en el mapa.` })
    } else {
      actualizarConsultorioPorId(datos.id, { ...datos, nombre: datos.nombre.trim() })
      toast.success('Cambios guardados', { description: 'La ficha del consultorio quedó actualizada.' })
    }
    alTerminar()
  }

  function alternarActivo() {
    const activo = !datos.activo
    actualizarConsultorioPorId(datos.id, { activo })
    setDatos((d) => ({ ...d, activo }))
    toast.info(activo ? 'Consultorio reactivado' : 'Consultorio desactivado', {
      description: activo ? 'Vuelve a aparecer como activo.' : 'Queda guardado y se puede reactivar cuando quieras.',
    })
  }

  return (
    <div className="space-y-5">
      {!esNuevo && (
        <p className="text-base text-muted-foreground">
          {nEquipos} {nEquipos === 1 ? 'equipo registrado' : 'equipos registrados'} · {nServicios} {nServicios === 1 ? 'servicio' : 'servicios'}
          {!datos.activo && ' · Desactivado'}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="f-nombre">Nombre del consultorio</Label>
          <Input id="f-nombre" value={datos.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="f-ciudad">Ciudad</Label>
          <Select id="f-ciudad" value={datos.ciudadId} onChange={(e) => elegirCiudad(e.target.value)}>
            {ciudades.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="f-zona">Zona</Label>
          <Select id="f-zona" value={datos.zona} onChange={(e) => cambiar('zona', e.target.value)}>
            {zonasCali.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="f-dir">Dirección o barrio</Label>
          <Input id="f-dir" value={datos.direccion} onChange={(e) => cambiar('direccion', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="f-contacto">Persona de contacto</Label>
          <Input id="f-contacto" value={datos.contacto} onChange={(e) => cambiar('contacto', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="f-tel">Teléfono</Label>
          <Input id="f-tel" inputMode="tel" value={datos.telefono} onChange={(e) => cambiar('telefono', e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="f-email">Correo</Label>
          <Input id="f-email" type="email" value={datos.email} onChange={(e) => cambiar('email', e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="f-plan">Plan</Label>
          <Select id="f-plan" value={datos.planId} onChange={(e) => cambiar('planId', e.target.value)}>
            <option value="">Sin plan (pendiente del diagnóstico inicial)</option>
            {planes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="f-lat">Latitud</Label>
          <Input id="f-lat" type="number" step="0.0001" value={datos.lat} onChange={(e) => cambiar('lat', Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="f-lng">Longitud</Label>
          <Input id="f-lng" type="number" step="0.0001" value={datos.lng} onChange={(e) => cambiar('lng', Number(e.target.value))} />
        </div>
        <p className="text-sm text-muted-foreground sm:col-span-2">
          También puedes arrastrar su punto en el mapa 2D: la ubicación se guarda sola.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={guardar}>
          <Save /> {esNuevo ? 'Crear consultorio' : 'Guardar cambios'}
        </Button>
        <Button size="lg" variant="outline" onClick={alTerminar}>
          Cerrar
        </Button>
        {!esNuevo && (
          <Button size="lg" variant="ghost" onClick={alternarActivo}>
            <Power /> {datos.activo ? 'Desactivar' : 'Reactivar'}
          </Button>
        )}
      </div>
    </div>
  )
}
