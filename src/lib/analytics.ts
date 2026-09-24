import { track as vercelTrack } from '@vercel/analytics'
import { useEffect, useRef } from 'react'

// Vercel Analytics acepta string | number | boolean | null | undefined
// (no objetos anidados). Este tipo documenta y valida los eventos propios.
export type PropiedadesEvento = Record<string, string | number | boolean | null | undefined>

/**
 * Envía un evento personalizado a Vercel Analytics.
 * Nunca debe romper la app: si el script no está cargado, se ignora.
 */
export function track(evento: string, propiedades?: PropiedadesEvento): void {
  try {
    vercelTrack(evento, propiedades)
  } catch {
    // la analítica es best-effort
  }
}

/**
 * Mide el tiempo que el usuario permanece en una página y lo reporta como
 * evento `tiempo_en_pagina` con `{ pagina, segundos }`.
 *
 * - Cuenta solo el tiempo con la pestaña visible (pausa al ocultarse).
 * - Envía al desmontar (navegación SPA), al ocultar la pestaña y al cerrar
 *   (`pagehide`), evitando duplicados.
 */
export function useTiempoEnPagina(pagina: string, propiedades?: PropiedadesEvento): void {
  const propsRef = useRef(propiedades)
  propsRef.current = propiedades

  useEffect(() => {
    let inicio = Date.now()
    let activo = typeof document !== 'undefined' && document.visibilityState === 'visible'

    const enviar = () => {
      if (!activo) return
      activo = false
      const segundos = Math.round((Date.now() - inicio) / 1000)
      if (segundos >= 1) track('tiempo_en_pagina', { pagina, segundos, ...propsRef.current })
    }

    const onVisibilidad = () => {
      if (document.visibilityState === 'hidden') {
        enviar()
      } else {
        inicio = Date.now()
        activo = true
      }
    }

    document.addEventListener('visibilitychange', onVisibilidad)
    window.addEventListener('pagehide', enviar)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilidad)
      window.removeEventListener('pagehide', enviar)
      enviar()
    }
  }, [pagina])
}

/** Nombres de eventos usados en la app (evita errores de tipeo). */
export const EVENTOS = {
  tiempoEnPagina: 'tiempo_en_pagina',
  ctaVerPlanes: 'cta_ver_planes',
  ctaDiagnostico: 'cta_solicitar_diagnostico',
  login: 'login',
  registro: 'registro',
  planContratado: 'plan_contratado',
  solicitudCreada: 'solicitud_creada',
  diagnosticoExpres: 'diagnostico_expres_solicitado',
  servicioAceptado: 'servicio_aceptado',
  servicioRechazado: 'servicio_rechazado',
  servicioCerrado: 'servicio_cerrado',
  calificacionEnviada: 'calificacion_enviada',
  reclamoRadicado: 'reclamo_radicado',
  repuestoSolicitado: 'repuesto_solicitado',
} as const
