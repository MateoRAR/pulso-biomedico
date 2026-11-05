import 'maplibre-gl/dist/maplibre-gl.css'
import { Map as Mapa, Marker, NavigationControl, setWorkerUrl, type GeoJSONSource, type PaddingOptions } from 'maplibre-gl'
import urlTrabajador from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useEffect, useRef, useState } from 'react'

import type { Ciudad } from '@/data/tipos'
import { cn } from '@/lib/utils'

export type EstadoPin = 'verde' | 'amarillo' | 'rojo' | 'sin-equipos'
export type ModoMapa = '2d' | '3d'

export interface PinConsultorio {
  id: string
  nombre: string
  lat: number
  lng: number
  estado: EstadoPin
  activo: boolean
  /** Número de equipos: define la altura del edificio en el modo 3D. */
  equipos: number
}

// MapLibre calcula la ruta de su worker de forma relativa; con un empaquetador hay que indicársela.
setWorkerUrl(urlTrabajador)

/** Mapa base gratuito de OpenFreeMap (datos de OpenStreetMap). */
const ESTILO = 'https://tiles.openfreemap.org/styles/liberty'
/** Capa de edificios en relieve del mapa base: se oculta en 2D para que el plano quede limpio. */
const EDIFICIOS_BASE = 'building-3d'

const COLOR: Record<EstadoPin, string> = {
  verde: '#10b981',
  amarillo: '#f59e0b',
  rojo: '#f43f5e',
  'sin-equipos': '#64748b',
}
const OSCURO: Record<EstadoPin, string> = {
  verde: '#047857',
  amarillo: '#b45309',
  rojo: '#be123c',
  'sin-equipos': '#475569',
}
const INACTIVO = '#94a3b8'
const INACTIVO_OSCURO = '#64748b'
const ACENTO = '#0f8fa3'

export const COLOMBIA = { lat: 4.6, lng: -74.3, zoom: 5.2 }

const FUENTE_EDIFICIOS = 'pulso-edificios'
const FUENTE_PUNTOS = 'pulso-puntos'
const CAPAS_3D = ['pulso-plaza', 'pulso-edificio', 'pulso-lejos', 'pulso-nombre'] as const
const CAPAS_CLIC = ['pulso-edificio', 'pulso-plaza', 'pulso-lejos']

// -- geometría de los edificios ------------------------------------------------------

const METROS_GRADO = 111_320

/** Cuadrado de `m` metros de medio lado alrededor de un punto. */
function cuadrado(lng: number, lat: number, m: number): number[][][] {
  const dLat = m / METROS_GRADO
  const dLng = m / (METROS_GRADO * Math.cos((lat * Math.PI) / 180))
  return [[[lng - dLng, lat - dLat], [lng + dLng, lat - dLat], [lng + dLng, lat + dLat], [lng - dLng, lat + dLat], [lng - dLng, lat - dLat]]]
}

function circulo(lng: number, lat: number, m: number, lados = 40): number[][][] {
  const dLat = m / METROS_GRADO
  const dLng = m / (METROS_GRADO * Math.cos((lat * Math.PI) / 180))
  const anillo = Array.from({ length: lados + 1 }, (_, i) => {
    const a = (i / lados) * Math.PI * 2
    return [lng + Math.cos(a) * dLng, lat + Math.sin(a) * dLat]
  })
  return [anillo]
}

/** Altura del edificio (m): crece con el número de equipos, para leer la dotación de un vistazo. */
function alturaDe(pin: PinConsultorio): number {
  return Math.min(110, 30 + pin.equipos * 5)
}

type Pieza = { geom: number[][][]; tipo: 'plaza' | 'volumen'; color: string; base: number; altura: number }

/** Cada consultorio es un edificio sencillo: plaza, cuerpo bajo, torre y remate (y una antena si está elegido). */
function piezasDe(pin: PinConsultorio, seleccionado: boolean): Pieza[] {
  const h = alturaDe(pin)
  const color = pin.activo ? COLOR[pin.estado] : INACTIVO
  const oscuro = pin.activo ? OSCURO[pin.estado] : INACTIVO_OSCURO
  const { lng, lat } = pin
  const piezas: Pieza[] = [
    { geom: circulo(lng, lat, seleccionado ? 46 : 38), tipo: 'plaza', color: seleccionado ? ACENTO : color, base: 0, altura: 0 },
    { geom: cuadrado(lng, lat, 20), tipo: 'volumen', color: oscuro, base: 0, altura: h * 0.38 },
    { geom: cuadrado(lng, lat, 13), tipo: 'volumen', color, base: h * 0.38, altura: h },
    { geom: cuadrado(lng, lat, 6), tipo: 'volumen', color: '#f8fafc', base: h, altura: h + 4 },
  ]
  if (seleccionado) piezas.push({ geom: cuadrado(lng, lat, 1.6), tipo: 'volumen', color: ACENTO, base: h + 4, altura: h + 22 })
  return piezas
}

function geojsonEdificios(pines: PinConsultorio[], seleccionadoId: string | null) {
  return {
    type: 'FeatureCollection' as const,
    features: pines.flatMap((pin) =>
      piezasDe(pin, pin.id === seleccionadoId).map((p) => ({
        type: 'Feature' as const,
        geometry: { type: 'Polygon' as const, coordinates: p.geom },
        properties: { id: pin.id, tipo: p.tipo, color: p.color, base: p.base, altura: p.altura, sel: pin.id === seleccionadoId ? 1 : 0 },
      })),
    ),
  }
}

function geojsonPuntos(pines: PinConsultorio[], seleccionadoId: string | null) {
  return {
    type: 'FeatureCollection' as const,
    features: pines.map((pin) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [pin.lng, pin.lat] },
      properties: { id: pin.id, nombre: pin.nombre, color: pin.activo ? COLOR[pin.estado] : INACTIVO, sel: pin.id === seleccionadoId ? 1 : 0 },
    })),
  }
}

// -- punto del modo 2D ------------------------------------------------------------------

function estilizarPunto(el: HTMLButtonElement, pin: PinConsultorio, seleccionado: boolean) {
  const tam = seleccionado ? 22 : 16
  el.style.width = `${tam}px`
  el.style.height = `${tam}px`
  el.style.padding = '0'
  el.style.background = pin.activo ? COLOR[pin.estado] : INACTIVO
  el.style.border = '3px solid #ffffff'
  el.style.borderRadius = '9999px'
  el.style.boxShadow = seleccionado ? `0 0 0 3px ${ACENTO}, 0 2px 8px rgba(15, 23, 42, 0.4)` : '0 2px 6px rgba(15, 23, 42, 0.35)'
  el.style.cursor = 'grab'
  el.title = `${pin.nombre}${pin.activo ? '' : ' (desactivado)'} — arrástralo para mover su ubicación`
  el.setAttribute('aria-label', `${pin.nombre}${pin.activo ? '' : ', desactivado'}`)
}

/**
 * Mapa con calles reales. En 2D cada consultorio es un punto (que se arrastra para corregir su
 * ubicación); en 3D es un edificio cuya altura crece con su número de equipos y cuyo color es el
 * estado de esos equipos. Tocar un punto o un edificio lo elige; la ficha la pinta quien usa el mapa,
 * encima de él. `margen` deja libre la parte del mapa que tapa esa ficha al centrar la cámara.
 */
export default function MapaConsultorios({
  ciudades,
  ciudadActiva,
  pines,
  seleccionadoId,
  modo,
  margen,
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
  modo: ModoMapa
  /** Espacio (px) que ocupa la ficha sobre el mapa, para que la cámara centre en el resto. */
  margen: PaddingOptions
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
  const [listo, setListo] = useState(false)
  const marcadores = useRef(new Map<string, { marker: Marker; el: HTMLButtonElement }>())
  // Los manejadores y el margen cambian en cada render; se guardan aparte para no recrear el mapa.
  const actual = useRef({ onSeleccionar, onMover, onAgregar, onFallo, modoAgregar, margen, modo })

  useEffect(() => {
    actual.current = { onSeleccionar, onMover, onAgregar, onFallo, modoAgregar, margen, modo }
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
      actual.current.onFallo()
      return
    }
    mapa.current = instancia
    instancia.addControl(new NavigationControl({ visualizePitch: true }), 'top-right')
    instancia.on('load', () => {
      cargado = true
      instancia.addSource(FUENTE_EDIFICIOS, { type: 'geojson', data: geojsonEdificios([], null) })
      instancia.addSource(FUENTE_PUNTOS, { type: 'geojson', data: geojsonPuntos([], null) })
      instancia.addLayer({
        id: 'pulso-plaza',
        type: 'fill',
        source: FUENTE_EDIFICIOS,
        filter: ['==', ['get', 'tipo'], 'plaza'],
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['case', ['==', ['get', 'sel'], 1], 0.5, 0.25] },
      })
      instancia.addLayer({
        id: 'pulso-edificio',
        type: 'fill-extrusion',
        source: FUENTE_EDIFICIOS,
        filter: ['==', ['get', 'tipo'], 'volumen'],
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-base': ['get', 'base'],
          'fill-extrusion-height': ['get', 'altura'],
          'fill-extrusion-opacity': 0.96,
          'fill-extrusion-vertical-gradient': true,
        },
      })
      // De lejos los edificios no se alcanzan a ver: un punto los reemplaza hasta acercarse.
      instancia.addLayer({
        id: 'pulso-lejos',
        type: 'circle',
        source: FUENTE_PUNTOS,
        paint: {
          'circle-radius': ['case', ['==', ['get', 'sel'], 1], 10, 7],
          'circle-color': ['get', 'color'],
          'circle-stroke-color': ['case', ['==', ['get', 'sel'], 1], ACENTO, '#ffffff'],
          'circle-stroke-width': 3,
          'circle-opacity': ['interpolate', ['linear'], ['zoom'], 12.5, 1, 14, 0],
          'circle-stroke-opacity': ['interpolate', ['linear'], ['zoom'], 12.5, 1, 14, 0],
        },
      })
      instancia.addLayer({
        id: 'pulso-nombre',
        type: 'symbol',
        source: FUENTE_PUNTOS,
        minzoom: 13.5,
        layout: {
          'text-field': ['get', 'nombre'],
          'text-font': ['Noto Sans Bold'],
          'text-size': 13,
          'text-anchor': 'top',
          'text-offset': [0, 1.6],
          'text-max-width': 12,
        },
        paint: { 'text-color': '#0f172a', 'text-halo-color': '#ffffff', 'text-halo-width': 2 },
      })
      setListo(true)
    })
    instancia.on('error', () => {
      if (!cargado) actual.current.onFallo()
    })
    instancia.on('click', (e) => {
      if (actual.current.modoAgregar) {
        actual.current.onAgregar(e.lngLat.lat, e.lngLat.lng)
        return
      }
      if (actual.current.modo !== '3d') return
      const capas = CAPAS_CLIC.filter((c) => instancia.getLayer(c))
      const tocado = instancia.queryRenderedFeatures(e.point, { layers: capas })[0]
      const id = tocado?.properties?.id
      if (typeof id === 'string') actual.current.onSeleccionar(id)
    })
    instancia.on('mousemove', (e) => {
      if (actual.current.modo !== '3d' || actual.current.modoAgregar) return
      const capas = CAPAS_CLIC.filter((c) => instancia.getLayer(c))
      const sobre = instancia.queryRenderedFeatures(e.point, { layers: capas }).length > 0
      instancia.getCanvas().style.cursor = sobre ? 'pointer' : ''
    })
    const limite = window.setTimeout(() => {
      if (!cargado) actual.current.onFallo()
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

  // Edificios y puntos lejanos (modo 3D).
  useEffect(() => {
    const m = mapa.current
    if (!m || !listo) return
    ;(m.getSource(FUENTE_EDIFICIOS) as GeoJSONSource | undefined)?.setData(geojsonEdificios(pines, seleccionadoId))
    ;(m.getSource(FUENTE_PUNTOS) as GeoJSONSource | undefined)?.setData(geojsonPuntos(pines, seleccionadoId))
  }, [pines, seleccionadoId, listo])

  // Puntos arrastrables (modo 2D).
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
        estilizarPunto(existente.el, pin, seleccionado)
        existente.marker.setLngLat([pin.lng, pin.lat])
        return
      }
      const el = document.createElement('button')
      el.type = 'button'
      estilizarPunto(el, pin, seleccionado)
      el.addEventListener('click', (ev) => {
        ev.stopPropagation()
        actual.current.onSeleccionar(pin.id)
      })
      const marker = new Marker({ element: el, draggable: true }).setLngLat([pin.lng, pin.lat]).addTo(m)
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLngLat()
        actual.current.onMover(pin.id, lat, lng)
      })
      marcadores.current.set(pin.id, { marker, el })
    })
    marcadores.current.forEach(({ el }) => {
      el.style.display = modo === '2d' ? '' : 'none'
    })
  }, [pines, seleccionadoId, modo])

  // Cambiar entre 2D y 3D: capas visibles, inclinación y giro.
  useEffect(() => {
    const m = mapa.current
    if (!m || !listo) return
    const visible = modo === '3d' ? 'visible' : 'none'
    for (const capa of [...CAPAS_3D, EDIFICIOS_BASE]) if (m.getLayer(capa)) m.setLayoutProperty(capa, 'visibility', visible)
    if (modo === '2d') {
      m.setMaxPitch(0)
      m.dragRotate.disable()
      m.touchZoomRotate.disableRotation()
      m.easeTo({ pitch: 0, bearing: 0, duration: 900 })
    } else {
      m.setMaxPitch(75)
      m.dragRotate.enable()
      m.touchZoomRotate.enableRotation()
      m.easeTo({ pitch: 58, bearing: -18, zoom: Math.max(m.getZoom(), 15.2), duration: 1200 })
    }
  }, [modo, listo])

  // Volar a la ciudad elegida.
  useEffect(() => {
    const m = mapa.current
    if (!m) return
    const tres = actual.current.modo === '3d'
    if (ciudadActiva === 'todas') {
      m.flyTo({ center: [COLOMBIA.lng, COLOMBIA.lat], zoom: COLOMBIA.zoom, pitch: 0, bearing: 0, duration: 2200, padding: actual.current.margen })
      return
    }
    const ciudad = ciudades.find((c) => c.id === ciudadActiva)
    if (ciudad)
      m.flyTo({
        center: [ciudad.lng, ciudad.lat],
        zoom: ciudad.zoom + (tres ? 1.2 : 0.6),
        pitch: tres ? 58 : 0,
        bearing: tres ? -18 : 0,
        duration: 2600,
        padding: actual.current.margen,
      })
  }, [ciudadActiva, ciudades])

  // Al elegir un consultorio, la cámara va hasta él (dejando libre el espacio de la ficha).
  const destino = pines.find((p) => p.id === seleccionadoId)
  const destinoLat = destino?.lat
  const destinoLng = destino?.lng
  useEffect(() => {
    const m = mapa.current
    if (!m || destinoLat === undefined || destinoLng === undefined) return
    const tres = actual.current.modo === '3d'
    m.flyTo({
      center: [destinoLng, destinoLat],
      zoom: Math.max(m.getZoom(), tres ? 16.2 : 15.5),
      pitch: tres ? 60 : 0,
      bearing: tres ? m.getBearing() || -18 : 0,
      duration: 1600,
      padding: actual.current.margen,
    })
    // Solo cuando cambia el consultorio elegido; mover su punto no debe volver a centrar la cámara.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seleccionadoId])

  return <div ref={contenedor} className={cn('size-full', modoAgregar && '[&_canvas]:!cursor-crosshair', className)} />
}
