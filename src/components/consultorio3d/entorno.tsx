import { invalidate, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * Entorno de estudio: genera en el momento (sin descargar nada) un mapa de iluminación que los materiales
 * reflejan. Es lo que hace que el acero parezca acero y el plástico tenga brillo suave.
 */
export function EntornoEstudio({ intensidad = 0.8 }: { intensidad?: number }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    const generador = new THREE.PMREMGenerator(gl)
    const entorno = new RoomEnvironment()
    const mapa = generador.fromScene(entorno, 0.04)
    scene.environment = mapa.texture
    scene.environmentIntensity = intensidad
    invalidate()
    return () => {
      scene.environment = null
      mapa.dispose()
      generador.dispose()
      entorno.dispose()
    }
  }, [gl, scene, intensidad])

  return null
}
