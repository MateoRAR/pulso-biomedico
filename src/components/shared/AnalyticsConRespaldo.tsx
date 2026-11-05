import { useEffect } from 'react'

/**
 * Vercel Web Analytics con ruta "disfrazada" para esquivar adblockers.
 *
 * Los bloqueadores cortan `/_vercel/insights/script.js` (regla EasyPrivacy).
 * Aquí cargamos el script desde `/medicion/script.js` (ver `vercel.json`, que
 * lo reescribe a `/_vercel/insights/*`) y, si esa ruta falla, caemos de vuelta
 * a la ruta oficial para no perder la medición.
 *
 * Debe ser el ÚNICO cargador de analytics de la app (no usar a la vez el
 * componente <Analytics /> del paquete).
 */

const PROXY_SCRIPT = '/medicion/script.js'
const PROXY_ENDPOINT = '/medicion'
const DEFAULT_SCRIPT = '/_vercel/insights/script.js'
const DEBUG_SCRIPT = 'https://va.vercel-scripts.com/v1/script.debug.js'
const MARCA = 'data-pulso-analytics'

type WindowConVa = Window & {
  va?: (...args: unknown[]) => void
  vaq?: unknown[][]
  vam?: string
}

export function AnalyticsConRespaldo() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const w = window as WindowConVa

    // Cola de Vercel: la usan `track()` y el script al terminar de cargar.
    w.va =
      w.va ||
      function (...args: unknown[]) {
        ;(w.vaq = w.vaq || []).push(args)
      }
    w.vam = import.meta.env.DEV ? 'development' : 'production'

    if (document.head.querySelector(`script[${MARCA}]`)) return

    const inyectar = (src: string, endpoint?: string, esRespaldo = false) => {
      const script = document.createElement('script')
      script.src = src
      script.defer = true
      script.setAttribute(MARCA, esRespaldo ? 'respaldo' : 'proxy')
      if (endpoint) script.dataset.endpoint = endpoint
      script.onerror = () => {
        script.remove()
        // Si la ruta disfrazada no resuelve, usa la oficial (como antes).
        if (!esRespaldo) inyectar(DEFAULT_SCRIPT, undefined, true)
      }
      document.head.appendChild(script)
    }

    if (import.meta.env.DEV) {
      inyectar(DEBUG_SCRIPT, undefined, true)
      return
    }
    inyectar(PROXY_SCRIPT, PROXY_ENDPOINT)
  }, [])

  return null
}
