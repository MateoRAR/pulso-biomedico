import { useEffect, useRef, type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

/**
 * Tabla responsive: en pantallas anchas es una tabla normal; en celulares cada fila se muestra
 * como una tarjeta con "Encabezado: valor". Las celdas toman su rótulo del encabezado de la columna.
 */
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  const ref = useRef<HTMLTableElement>(null)

  useEffect(() => {
    const tabla = ref.current
    if (!tabla) return
    const encabezados = Array.from(tabla.querySelectorAll('thead th')).map((th) => th.textContent?.trim() ?? '')
    tabla.querySelectorAll('tbody tr').forEach((fila) => {
      Array.from(fila.children).forEach((celda, i) => {
        if (encabezados[i]) celda.setAttribute('data-label', encabezados[i])
      })
    })
  })

  return (
    <div className="w-full overflow-x-auto">
      <table ref={ref} className={cn('tabla-responsive w-full caption-bottom text-sm', className)} {...props} />
    </div>
  )
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-border transition-colors hover:bg-muted/50', className)} {...props} />
}

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground', className)}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-middle', className)} {...props} />
}
