import { invalidate, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, type RefObject } from 'react'
import * as THREE from 'three'

/** Largo de la línea que une el punto del modelo con el cuadro (debe coincidir con `--nota-linea` en index.css). */
const LINEA = 40
const MARGEN = 8
/** Espacio reservado arriba (botones de lugares) y abajo (leyenda) del visor. */
const RESERVA_ARRIBA = 60
const RESERVA_ABAJO = 52

/**
 * Dentro del Canvas: lleva la nota flotante (un elemento HTML) hasta el punto 3D indicado. Cada
 * cuadro dibujado calcula dónde cae ese punto en la pantalla y mueve la nota; además mantiene el
 * cuadro dentro del área visible, y lo pasa debajo del punto si arriba no cabe.
 */
export function SeguirAncla({ pos, notaRef }: { pos: [number, number, number] | null; notaRef: RefObject<HTMLDivElement | null> }) {
  const camara = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const v = useMemo(() => new THREE.Vector3(), [])

  const mover = useCallback(() => {
    const el = notaRef.current
    if (!el || !pos) return
    camara.updateMatrixWorld()
    v.set(pos[0], pos[1], pos[2]).project(camara)
    const x = (v.x * 0.5 + 0.5) * size.width
    const y = (-v.y * 0.5 + 0.5) * size.height
    el.style.visibility = v.z > 1 ? 'hidden' : 'visible'
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    const card = el.querySelector<HTMLElement>('.nota-card')
    if (!card) return
    const ancho = card.offsetWidth
    const alto = card.offsetHeight
    // Horizontal: el cuadro nace junto a la línea, pero sin salirse de la pantalla.
    const izquierda = Math.min(Math.max(x - 28, MARGEN), Math.max(MARGEN, size.width - ancho - MARGEN))
    el.style.setProperty('--cx', `${(izquierda - x).toFixed(1)}px`)
    // Vertical: arriba si cabe; si no, debajo del punto.
    const cabeArriba = y - LINEA - alto >= RESERVA_ARRIBA
    const cabeAbajo = y + LINEA + alto <= size.height - RESERVA_ABAJO
    el.dataset.lado = cabeArriba || !cabeAbajo ? 'arriba' : 'abajo'
  }, [camara, notaRef, pos, size.height, size.width, v])

  useFrame(mover)

  useEffect(() => {
    mover()
    invalidate()
  }, [mover])

  return null
}
