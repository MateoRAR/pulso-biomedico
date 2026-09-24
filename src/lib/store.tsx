import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import * as seed from '@/lib/mock/data'
import type {
  Calificacion,
  Consultorio,
  Documento,
  Equipo,
  Ingeniero,
  Metricas,
  Notificacion,
  PedidoRepuesto,
  Plan,
  Reclamo,
  Servicio,
  Aliado,
} from '@/lib/mock/data'

export interface DataState {
  consultorio: Consultorio
  equipos: Equipo[]
  ingenieros: Ingeniero[]
  servicios: Servicio[]
  documentos: Documento[]
  calificaciones: Calificacion[]
  reclamos: Reclamo[]
  repuestos: PedidoRepuesto[]
  aliados: Aliado[]
  notificaciones: Notificacion[]
  planes: Plan[]
  metricas: Metricas
}

const CLAVE = 'pulso.data.v2'

function inicial(): DataState {
  return {
    consultorio: seed.CONSULTORIO_SEED,
    equipos: seed.EQUIPOS_SEED,
    ingenieros: seed.INGENIEROS_SEED,
    servicios: seed.SERVICIOS_SEED,
    documentos: seed.DOCUMENTOS_SEED,
    calificaciones: seed.CALIFICACIONES_SEED,
    reclamos: seed.RECLAMOS_SEED,
    repuestos: seed.REPUESTOS_SEED,
    aliados: seed.ALIADOS_SEED,
    notificaciones: seed.NOTIFICACIONES_SEED,
    planes: seed.PLANES_SEED,
    metricas: seed.METRICAS_SEED,
  }
}

function cargar(): DataState {
  const base = inicial()
  if (typeof window === 'undefined') return base
  try {
    const crudo = window.localStorage.getItem(CLAVE)
    if (!crudo) return base
    const guardado = JSON.parse(crudo) as Partial<DataState>
    // Los catálogos (consultorio, planes, aliados, métricas) vienen SIEMPRE de
    // la semilla: así los cambios de planes se reflejan aunque el navegador
    // tenga datos guardados de una versión anterior. Lo dinámico (equipos,
    // servicios, calificaciones, pedidos…) sí se conserva.
    return {
      ...base,
      ...guardado,
      consultorio: base.consultorio,
      planes: base.planes,
      aliados: base.aliados,
      metricas: base.metricas,
    }
  } catch {
    return base
  }
}

interface DataContextValue extends DataState {
  agregarServicio: (servicio: Servicio) => void
  actualizarServicio: (id: string, cambios: Partial<Servicio>) => void
  agregarEquipo: (equipo: Equipo) => void
  actualizarEquipo: (id: string, cambios: Partial<Equipo>) => void
  agregarDocumento: (documento: Documento) => void
  agregarCalificacion: (calificacion: Calificacion) => void
  agregarReclamo: (reclamo: Reclamo) => void
  agregarPedido: (pedido: PedidoRepuesto) => void
  marcarNotificacion: (id: string) => void
  reiniciarDemo: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>(cargar)

  useEffect(() => {
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(state))
    } catch {
      // almacenamiento no disponible (modo privado): se mantiene en memoria
    }
  }, [state])

  const agregarServicio = useCallback((servicio: Servicio) => {
    setState((prev) => ({ ...prev, servicios: [servicio, ...prev.servicios] }))
  }, [])

  const actualizarServicio = useCallback((id: string, cambios: Partial<Servicio>) => {
    setState((prev) => ({
      ...prev,
      servicios: prev.servicios.map((s) => (s.id === id ? { ...s, ...cambios } : s)),
    }))
  }, [])

  const agregarEquipo = useCallback((equipo: Equipo) => {
    setState((prev) => ({ ...prev, equipos: [...prev.equipos, equipo] }))
  }, [])

  const actualizarEquipo = useCallback((id: string, cambios: Partial<Equipo>) => {
    setState((prev) => ({
      ...prev,
      equipos: prev.equipos.map((e) => (e.id === id ? { ...e, ...cambios } : e)),
    }))
  }, [])

  const agregarDocumento = useCallback((documento: Documento) => {
    setState((prev) => ({ ...prev, documentos: [documento, ...prev.documentos] }))
  }, [])

  const agregarCalificacion = useCallback((calificacion: Calificacion) => {
    setState((prev) => ({ ...prev, calificaciones: [calificacion, ...prev.calificaciones] }))
  }, [])

  const agregarReclamo = useCallback((reclamo: Reclamo) => {
    setState((prev) => ({ ...prev, reclamos: [reclamo, ...prev.reclamos] }))
  }, [])

  const agregarPedido = useCallback((pedido: PedidoRepuesto) => {
    setState((prev) => ({ ...prev, repuestos: [pedido, ...prev.repuestos] }))
  }, [])

  const marcarNotificacion = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notificaciones: prev.notificaciones.map((n) => (n.id === id ? { ...n, leida: true } : n)),
    }))
  }, [])

  const reiniciarDemo = useCallback(() => setState(inicial()), [])

  const value = useMemo<DataContextValue>(
    () => ({
      ...state,
      agregarServicio,
      actualizarServicio,
      agregarEquipo,
      actualizarEquipo,
      agregarDocumento,
      agregarCalificacion,
      agregarReclamo,
      agregarPedido,
      marcarNotificacion,
      reiniciarDemo,
    }),
    [
      state,
      agregarServicio,
      actualizarServicio,
      agregarEquipo,
      actualizarEquipo,
      agregarDocumento,
      agregarCalificacion,
      agregarReclamo,
      agregarPedido,
      marcarNotificacion,
      reiniciarDemo,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData debe usarse dentro de <DataProvider>')
  return context
}
