import { Box, Table2 } from 'lucide-react'
import { useCallback, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type Vista = '3d' | 'tabla'

const PREFIJO = 'pulso.vista.v5.'

/** WebGL disponible (si no, solo se ofrece la tabla). */
function hayWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Qué vista abrir primero: la última que la persona eligió en esta sesión; si no ha elegido, la de
 * la página (el 3D también en celulares) salvo con "reducir movimiento", que abre la tabla.
 */
function vistaInicial(clave: string, porDefecto: Vista): Vista {
  try {
    const guardada = window.sessionStorage.getItem(PREFIJO + clave)
    if (guardada === '3d' || guardada === 'tabla') return guardada
  } catch {
    // sin almacenamiento
  }
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return reducido ? 'tabla' : porDefecto
}

export function useVista(clave: string, porDefecto: Vista = '3d'): { vista: Vista; cambiar: (v: Vista) => void; hay3D: boolean } {
  const [hay3D] = useState(hayWebGL)
  const [elegida, setElegida] = useState<Vista>(() => vistaInicial(clave, porDefecto))
  const cambiar = useCallback(
    (v: Vista) => {
      setElegida(v)
      try {
        window.sessionStorage.setItem(PREFIJO + clave, v)
      } catch {
        // sin almacenamiento
      }
    },
    [clave],
  )
  return { vista: hay3D ? elegida : 'tabla', cambiar, hay3D }
}

/**
 * Presenta lo mismo de dos maneras: una vista 3D interactiva y una tabla sobria y profesional.
 * Solo se monta la vista elegida, así el 3D no se descarga si nadie lo pide.
 */
export function VistaDual({
  clave,
  control,
  vista3D,
  tabla,
  etiqueta3D = 'Ver en 3D',
  etiquetaTabla = 'Ver como tabla',
  porDefecto = '3d',
}: {
  clave: string
  /** Si la página necesita saber qué vista está activa, crea el control con `useVista` y pásalo aquí. */
  control?: ReturnType<typeof useVista>
  vista3D: ReactNode
  tabla: ReactNode
  etiqueta3D?: string
  etiquetaTabla?: string
  /** Vista con la que abre en pantallas grandes cuando la persona aún no ha elegido. */
  porDefecto?: Vista
}) {
  const propio = useVista(clave, porDefecto)
  const { vista, cambiar, hay3D } = control ?? propio

  return (
    <div className="space-y-4">
      {hay3D ? (
        <div role="group" aria-label="Forma de ver la información" className="inline-flex rounded-xl border border-border bg-card p-1 max-sm:flex max-sm:w-full">
          {(
            [
              ['3d', etiqueta3D, Box],
              ['tabla', etiquetaTabla, Table2],
            ] as const
          ).map(([id, texto, Icono]) => (
            <button
              key={id}
              type="button"
              aria-pressed={vista === id}
              onClick={() => cambiar(id)}
              className={cn(
                'flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-base font-semibold transition-colors max-sm:flex-1 max-sm:px-2 max-sm:text-sm',
                vista === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icono className="size-5" /> {texto}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-base text-muted-foreground">Este dispositivo no admite la vista 3D; te mostramos la información en tabla.</p>
      )}
      {vista === '3d' ? vista3D : tabla}
    </div>
  )
}
