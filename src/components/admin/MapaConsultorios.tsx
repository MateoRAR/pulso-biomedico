import 'maplibre-gl/dist/maplibre-gl.css'
import { Map as Mapa, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl'
import urlTrabajador from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useEffect, useRef } from 'react'

import type { Ciudad } from '@/data/tipos'
import { cn } from '@/lib/utils'

export type EstadoPin = 'verde' | 'amarillo' | 'rojo' | 'sin-equipos'

export interface PinConsultorio {
  id: string
  nombre: string
  lat: number
  lng: number
  estado: EstadoPin
  activo: boolean
}

// MapLibre calcula la ruta de su worker de forma relativa; con un empaquetador hay que indicársela.
setWorkerUrl(urlTrabajador)

/** Mapa base gratuito de OpenFreeMap (datos de OpenStreetMap), con edificios en relieve. */
const ESTILO = 'https://tiles.openfreemap.org/styles/liberty'

const COLOR: Record<EstadoPin, string> = {
  verde: '#10b981',
  amarillo: '#f59e0b',
  rojo: '#f43f5e',
  'sin-equipos': '#64748b',
}

export const COLOMBIA = { lat: 4.6, lng: -74.3, zoom: 5.2 }

function estilizar(el: HTMLButtonElement, pin: PinConsultorio, seleccionado: boolean) {
  const tam = seleccionado ? 46 : 36
  el.style.width = `${tam}px`
  el.style.height = `${tam}px`
  el.style.background = pin.activo ? COLOR[pin.estado] : '#94a3b8'
  el.style.opacity = pin.activo ? '1' : '0.7'
  el.style.border = seleccionado ? '4px solid #0f172a' : '3px solid #ffffff'
  el.style.boxShadow = '0 3px 10px rgba(15, 23, 42, 0.35)'
  el.style.borderRadius = '9999px'
  el.style.cursor = 'grab'
  el.style.display = 'grid'
  el.style.placeItems = 'center'
  el.style.color = '#ffffff'
  el.style.fontWeight = '800'
  el.style.fontSize = seleccionado ? '16px' : '13px'
  el.textContent = pin.activo ? pin.nombre.trim().charAt(0).toUpperCase() : '⏸'
  el.title = `${pin.nombre}${pin.activo ? '' : ' (desactivado)'} — arrástralo para mover su ubicación`
  el.setAttribute('aria-label', `${pin.nombre}${pin.activo ? '' : ', desactivado'}`)
}

/**
 * Mapa 3D con calles y edificios reales. Cada pin es un consultorio: se toca para abrir su ficha
 * y se arrastra para corregir su ubicación. Al elegir una ciudad la cámara vuela hasta ella.
 */
export default function MapaConsultorios({
  ciudades,
  ciudadActiva,
  pines,
  seleccionadoId,
  onSeleccionar,
  onMover,
  modoAgregar,
  onAgregar,
  onFallo,
  className,
}: {
  ciudades: Ciudad[]
  ciudadActiva: string
  pines: PinConsultorio[]
  seleccionadoId: string | null
  onSeleccionar: (id: string) => void
  onMover: (id: string, lat: number, lng: number) => void
  modoAgregar: boolean
  onAgregar: (lat: number, lng: number) => void
  /** Se llama si el mapa no puede cargarse (sin internet, sin WebGL…). */
  onFallo: () => void
  className?: string
}) {
  const contenedor = useRef<HTMLDivElement>(null)
  const mapa = useRef<Mapa | null>(null)
  const marcadores = useRef(new Map<string, { marker: Marker; el: HTMLButtonElement }>())
  // Los manejadores cambian en cada render; se guardan aparte para no recrear el mapa.
  const manejadores = useRef({ onSeleccionar, onMover, onAgregar, onFallo, modoAgregar })

  useEffect(() => {
    manejadores.current = { onSeleccionar, onMover, onAgregar, onFallo, modoAgregar }
  })

  // Crear el mapa una sola vez.
  useEffect(() => {
    if (!contenedor.current) return
    let cargado = false
    let instancia: Mapa
    try {
      instancia = new Mapa({
        container: contenedor.current,
        style: ESTILO,
        center: [COLOMBIA.lng, COLOMBIA.lat],
        zoom: COLOMBIA.zoom,
        pitch: 0,
        maxPitch: 75,
        attributionControl: { compact: true },
      })
    } catch {
      manejadores.current.onFallo()
      return
    }
    mapa.current = instancia
    instancia.addControl(new NavigationControl({ visualizePitch: true }), 'top-right')
    instancia.on('load', () => {
      cargado = true
    })
    instancia.on('error', () => {
      if (!cargado) manejadores.current.onFallo()
    })
    instancia.on('click', (e) => {
      if (manejadores.current.modoAgregar) manejadores.current.onAgregar(e.lngLat.lat, e.lngLat.lng)
    })
    const limite = window.setTimeout(() => {
      if (!cargado) manejadores.current.onFallo()
    }, 15000)
    const pinesActuales = marcadores.current
    return () => {
      window.clearTimeout(limite)
      pinesActuales.forEach(({ marker }) => marker.remove())
      pinesActuales.clear()
      instancia.remove()
      mapa.current = null
    }
  }, [])

  // Sincronizar los pines con los consultorios.
  useEffect(() => {
    const m = mapa.current
    if (!m) return
    const vivos = new Set(pines.map((p) => p.id))
    marcadores.current.forEach(({ marker }, id) => {
      if (!vivos.has(id)) {
        marker.remove()
        marcadores.current.delete(id)
      }
    })
    pines.forEach((pin) => {
      const seleccionado = pin.id === seleccionadoId
      const existente = marcadores.current.get(pin.id)
      if (existente) {
        estilizar(existente.el, pin, seleccionado)
        existente.marker.setLngLat([pin.lng, pin.lat])
        return
      }
      const el = document.createElement('button')
      el.type = 'button'
      estilizar(el, pin, seleccionado)
      el.addEventListener('click', (ev) => {
        ev.stopPropagation()
        manejadores.current.onSeleccionar(pin.id)
      })
      const marker = new Marker({ element: el, draggable: true }).setLngLat([pin.lng, pin.lat]).addTo(m)
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLngLat()
        manejadores.current.onMover(pin.id, lat, lng)
      })
      marcadores.current.set(pin.id, { marker, el })
    })
  }, [pines, seleccionadoId])

  // Volar a la ciudad elegida.
  useEffect(() => {
    const m = mapa.current
    if (!m) return
    if (ciudadActiva === 'todas') {
      m.flyTo({ center: [COLOMBIA.lng, COLOMBIA.lat], zoom: COLOMBIA.zoom, pitch: 0, bearing: 0, duration: 2200 })
      return
    }
    const ciudad = ciudades.find((c) => c.id === ciudadActiva)
    if (ciudad) m.flyTo({ center: [ciudad.lng, ciudad.lat], zoom: ciudad.zoom + 1.2, pitch: 58, bearing: -18, duration: 2600 })
  }, [ciudadActiva, ciudades])

  return <div ref={contenedor} className={cn('size-full', modoAgregar && '[&_canvas]:!cursor-crosshair', className)} />
}
