import { useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

import GhostFibers from './ghost-fibers/GhostFibers'

/**
 * Fondo animado (React Bits · GhostFibers). Solo se monta cuando es sensato:
 *  - pantalla de escritorio (≥ 768 px),
 *  - sin preferencia de "reducir movimiento",
 *  - con WebGL2 disponible.
 * En cualquier otro caso no se monta nada y queda el degradado estático del contenedor,
 * así se ahorra batería en celulares y no se mueve nada para quien lo pidió.
 */

const CONSULTAS = ['(min-width: 768px)', '(prefers-reduced-motion: reduce)'] as const

let webgl2: boolean | null = null
function hayWebGL2(): boolean {
  if (webgl2 === null) {
    try {
      webgl2 = Boolean(document.createElement('canvas').getContext('webgl2'))
    } catch {
      webgl2 = false
    }
  }
  return webgl2
}

function suscribir(aviso: () => void) {
  const listas = CONSULTAS.map((q) => window.matchMedia(q))
  listas.forEach((l) => l.addEventListener('change', aviso))
  return () => listas.forEach((l) => l.removeEventListener('change', aviso))
}

function instantanea(): boolean {
  const [ancha, reducido] = CONSULTAS.map((q) => window.matchMedia(q).matches)
  return ancha && !reducido && hayWebGL2()
}

export function useFondoAnimado(): boolean {
  return useSyncExternalStore(suscribir, instantanea, () => false)
}

export function FondoFibras({ className }: { className?: string }) {
  const animado = useFondoAnimado()
  if (!animado) return null
  return (
    <div className={cn('pointer-events-none absolute inset-0', className)} aria-hidden="true">
      <GhostFibers
        glowColor="#0f8fa3"
        lineColor="#5ee7d0"
        secondaryColor="#7dd3e8"
        speed={0.35}
        layers={2}
        threads={56}
        particles={0.3}
        sparkle={0.25}
        brightness={0.8}
        vignette={0.45}
        grain={0.03}
        mouseInteraction={false}
        pulseOnClick={false}
        dpr={1}
      />
    </div>
  )
}
