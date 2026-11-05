import { X } from 'lucide-react'
import type { ReactNode, RefObject } from 'react'

/**
 * Nota flotante sobre un modelo 3D: un punto en el modelo, una línea y un cuadro de texto que se
 * despliega. No sabe dónde está el modelo: `SeguirAncla` (dentro del Canvas) la mueve cada vez que
 * la cámara cambia. Debe ir dentro de un contenedor `relative` del mismo tamaño que el Canvas.
 * Usa `key` en el padre para que la animación de despliegue se repita al cambiar de nota.
 */
export function NotaFlotante({
  notaRef,
  titulo,
  onCerrar,
  children,
}: {
  notaRef: RefObject<HTMLDivElement | null>
  titulo: string
  onCerrar: () => void
  children: ReactNode
}) {
  return (
    <div ref={notaRef} className="nota-ancla" data-lado="arriba">
      <span className="nota-punto" aria-hidden="true" />
      <span className="nota-linea" aria-hidden="true" />
      <div className="nota-card" role="dialog" aria-label={titulo}>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar nota"
          className="absolute right-2 top-2 grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  )
}
