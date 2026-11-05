import { invalidate, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, type RefObject } from 'react'
import * as THREE from 'three'

/** Largo de la línea que une el punto del modelo con el cuadro (debe coincidir con `--nota-linea` en index.css). */
export const LINEA_NOTA = 40
/** Ancho aproximado del cuadro (17,5 rem). */
export const ANCHO_NOTA = 280
/** Desde este ancho la nota se muestra al lado del modelo; en pantallas más angostas, arriba o abajo. */
export const ANCHO_LATERAL = 640

const MARGEN = 8
/** Espacio reservado arriba (botón de pantalla completa) y abajo (leyenda) del visor. */
const RESERVA_ARRIBA = 56
const RESERVA_ABAJO = 52

export type V3 = [number, number, number]

/**
 * Dentro del Canvas: lleva la nota flotante (un elemento HTML) hasta el punto 3D indicado. Cada
 * cuadro dibujado calcula dónde cae ese punto en la pantalla y mueve la nota.
 *  - Pantallas anchas: el cuadro va AL LADO del punto (a la derecha; a la izquierda si no cabe).
 *  - Pantallas angostas: arriba del punto (`posVertical`), o debajo si arriba no cabe.
 * En todos los casos el cuadro se mantiene dentro del área visible.
 */
export function SeguirAncla({
  pos,
  posVertical,
  notaRef,
}: {
  /** Punto para la nota al lado del modelo. */
  pos: V3 | null
  /** Punto para la nota arriba del modelo (celulares). Si no se da, se usa `pos`. */
  posVertical?: V3 | null
  notaRef: RefObject<HTMLDivElement | null>
}) {
  const camara = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const v = useMemo(() => new THREE.Vector3(), [])
  const lateral = size.width >= ANCHO_LATERAL
  const punto = lateral ? pos : (posVertical ?? pos)

  const mover = useCallback(() => {
    const el = notaRef.current
    if (!el || !punto) return
    // La cámara se mueve en este mismo cuadro: se actualizan sus matrices antes de proyectar.
    camara.updateMatrixWorld()
    v.set(punto[0], punto[1], punto[2]).project(camara)
    const x = (v.x * 0.5 + 0.5) * size.width
    const y = (-v.y * 0.5 + 0.5) * size.height
    el.style.visibility = v.z > 1 ? 'hidden' : 'visible'
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    const card = el.querySelector<HTMLElement>('.nota-card')
    if (!card) return
    const ancho = card.offsetWidth
    const alto = card.offsetHeight

    if (lateral) {
      const cabeDerecha = x + LINEA_NOTA + ancho + MARGEN <= size.width
      const cabeIzquierda = x - LINEA_NOTA - ancho - MARGEN >= 0
      if (cabeDerecha || cabeIzquierda) {
        el.dataset.lado = cabeDerecha ? 'derecha' : 'izquierda'
        // El cuadro se centra en el punto, sin salirse por arriba ni por abajo.
        const arriba = Math.min(Math.max(y - alto / 2, RESERVA_ARRIBA), Math.max(RESERVA_ARRIBA, size.height - RESERVA_ABAJO - alto))
        el.style.setProperty('--cy', `${(arriba - y).toFixed(1)}px`)
        return
      }
    }

    // Arriba o abajo: el cuadro nace junto a la línea, sin salirse de la pantalla.
    const izquierda = Math.min(Math.max(x - 28, MARGEN), Math.max(MARGEN, size.width - ancho - MARGEN))
    el.style.setProperty('--cx', `${(izquierda - x).toFixed(1)}px`)
    const cabeArriba = y - LINEA_NOTA - alto >= RESERVA_ARRIBA
    const cabeAbajo = y + LINEA_NOTA + alto <= size.height - RESERVA_ABAJO
    const espacioArriba = y - RESERVA_ARRIBA
    const espacioAbajo = size.height - RESERVA_ABAJO - y
    const lado = cabeArriba ? 'arriba' : cabeAbajo ? 'abajo' : espacioArriba >= espacioAbajo ? 'arriba' : 'abajo'
    el.dataset.lado = lado
    // Si no cabe de ningún lado (visor bajo en un celular), el cuadro se corre hacia el centro lo justo
    // para verse completo: puede tapar el punto, pero nunca queda cortado por el borde del visor.
    let corrimiento = 0
    if (lado === 'arriba') {
      const arriba = y - LINEA_NOTA - alto
      corrimiento = Math.max(0, RESERVA_ARRIBA - arriba)
      corrimiento = Math.min(corrimiento, Math.max(0, size.height - MARGEN - (y - LINEA_NOTA)))
    } else {
      const abajo = y + LINEA_NOTA + alto
      corrimiento = Math.max(0, abajo - (size.height - RESERVA_ABAJO))
      corrimiento = Math.min(corrimiento, Math.max(0, y + LINEA_NOTA - MARGEN))
    }
    el.style.setProperty('--ny', `${corrimiento.toFixed(1)}px`)
  }, [camara, lateral, notaRef, punto, size.height, size.width, v])

  useFrame(mover)

  useEffect(() => {
    mover()
    invalidate()
  }, [mover])

  return null
}
