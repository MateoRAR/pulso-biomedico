import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export interface OpcionSelector<T extends string> {
  id: T
  nombre: string
  /** Texto de ayuda al pasar el cursor. */
  titulo?: string
}

/**
 * Opciones unidas en una sola barra, con una "pastilla" que se desliza detrás del texto elegido.
 * Si no hay ninguna opción elegida (`valor` nulo) la pastilla se oculta. En pantallas angostas la
 * barra se desplaza a los lados y la opción elegida se centra sola.
 */
export function SelectorDeslizante<T extends string>({
  opciones,
  valor,
  onCambio,
  etiqueta,
  className,
}: {
  opciones: OpcionSelector<T>[]
  valor: T | null
  onCambio: (id: T) => void
  /** Nombre del grupo para lectores de pantalla. */
  etiqueta: string
  className?: string
}) {
  const barra = useRef<HTMLDivElement>(null)
  const botones = useRef(new Map<string, HTMLButtonElement>())
  const [caja, setCaja] = useState<{ x: number; ancho: number } | null>(null)

  const medir = useCallback(() => {
    const boton = valor ? botones.current.get(valor) : undefined
    setCaja(boton ? { x: boton.offsetLeft, ancho: boton.offsetWidth } : null)
  }, [valor])

  useLayoutEffect(medir, [medir, opciones])

  // Si cambia el tamaño o se terminan de cargar las fuentes, la pastilla se vuelve a ajustar.
  useEffect(() => {
    const el = barra.current
    if (!el) return
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    void document.fonts?.ready.then(medir)
    return () => observador.disconnect()
  }, [medir])

  // En celulares, la opción elegida se lleva al centro de la barra.
  useEffect(() => {
    if (valor) botones.current.get(valor)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [valor])

  return (
    <div className={cn('max-w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', className)}>
      <div ref={barra} role="group" aria-label={etiqueta} className="relative inline-flex min-w-max rounded-xl border border-border bg-card p-1 shadow-sm">
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-y-1 left-0 rounded-lg bg-primary shadow-md transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.34,1.25,0.64,1)]',
            caja ? 'opacity-100' : 'opacity-0',
          )}
          style={{ width: caja?.ancho ?? 0, transform: `translateX(${caja?.x ?? 0}px)` }}
        />
        {opciones.map((o) => (
          <button
            key={o.id}
            ref={(el) => {
              if (el) botones.current.set(o.id, el)
              else botones.current.delete(o.id)
            }}
            type="button"
            aria-pressed={valor === o.id}
            title={o.titulo}
            onClick={() => onCambio(o.id)}
            className={cn(
              'relative z-10 min-h-10 whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition-colors duration-200 sm:text-base',
              valor === o.id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {o.nombre}
          </button>
        ))}
      </div>
    </div>
  )
}
