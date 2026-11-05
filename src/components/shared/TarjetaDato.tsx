import type { CSSProperties, ReactNode } from 'react'

import SpotlightCard from '@/components/reactbits/SpotlightCard'
import { useTema } from '@/lib/tema'
import { cn } from '@/lib/utils'

type Tono = 'neutro' | 'bueno' | 'aviso' | 'alerta'

const TONO: Record<Tono, string> = {
  neutro: 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary',
  bueno: 'bg-gradient-to-br from-emerald-400/30 to-emerald-400/10 text-good-foreground',
  aviso: 'bg-gradient-to-br from-amber-400/35 to-amber-400/10 text-warning-foreground',
  alerta: 'bg-gradient-to-br from-rose-400/30 to-rose-400/10 text-alert-foreground',
}

// Franja fina en el borde superior: da el tono sin pintar toda la tarjeta.
const FRANJA: Record<Tono, string> = {
  neutro: 'bg-primary/55',
  bueno: 'bg-emerald-400',
  aviso: 'bg-amber-400',
  alerta: 'bg-rose-400',
}

/**
 * Dato de resumen: un número grande, qué significa y una frase corta. Usa la tarjeta con luz suave
 * de React Bits (SpotlightCard), con los colores del tema de Pulso.
 */
export function TarjetaDato({
  etiqueta,
  valor,
  nota,
  icono,
  tono = 'neutro',
  className,
}: {
  etiqueta: string
  valor: ReactNode
  nota?: string
  icono?: ReactNode
  tono?: Tono
  className?: string
}) {
  const { tema } = useTema()
  return (
    <SpotlightCard
      theme={tema === 'oscuro' ? 'dark' : 'light'}
      intensity={0.1}
      spotlightSize={200}
      borderGlow={0.5}
      className={cn('rounded-2xl! p-4!', className)}
      style={
        {
          '--spotlight-card-surface': 'var(--card)',
          '--spotlight-card-border': 'color-mix(in oklab, var(--border) 75%, transparent)',
          '--spotlight-card-shadow': '0 1px 2px color-mix(in oklab, var(--foreground) 6%, transparent), 0 10px 28px -18px color-mix(in oklab, var(--foreground) 18%, transparent)',
        } as CSSProperties
      }
    >
      <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-[3px]', FRANJA[tono])} />
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{etiqueta}</p>
        {icono && <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl shadow-[inset_0_0_0_1px_color-mix(in_oklab,currentColor_14%,transparent)] [&_svg]:size-[1.05rem]', TONO[tono])}>{icono}</span>}
      </div>
      <p className="font-display mt-3 text-3xl font-bold leading-none tabular-nums">{valor}</p>
      {nota && <p className="mt-2 text-xs text-muted-foreground">{nota}</p>}
    </SpotlightCard>
  )
}
