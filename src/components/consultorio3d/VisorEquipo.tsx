import { Canvas, invalidate, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { MODELOS, type TipoModelo } from './catalogo'
import { EntornoEstudio } from './entorno'
import { COMPONENTES } from './modelos'
import { SeguirAncla } from './SeguirAncla'

function Controles({ altura, reinicio }: { altura: number; reinicio: number }) {
  const camara = useThree((s) => s.camera)
  const dom = useThree((s) => s.gl.domElement)

  useEffect(() => {
    const dist = Math.max(1.5, altura * 2.1)
    const objetivo = new THREE.Vector3(0, altura * 0.45, 0)
    camara.position.set(dist * 0.75, altura * 0.75 + 0.3, dist)
    const controles = new OrbitControls(camara, dom)
    controles.target.copy(objetivo)
    controles.enableDamping = true
    controles.dampingFactor = 0.12
    controles.enablePan = false
    controles.minDistance = Math.max(0.6, altura * 0.9)
    controles.maxDistance = dist * 2
    controles.maxPolarAngle = Math.PI / 2.02
    controles.update()
    // Con amortiguación hay que seguir dibujando un momento después de soltar; después se detiene.
    let raf = 0
    let corriendo = false
    const paso = () => {
      if (controles.update()) {
        invalidate()
        raf = requestAnimationFrame(paso)
      } else {
        corriendo = false
      }
    }
    const empezar = () => {
      if (corriendo) return
      corriendo = true
      raf = requestAnimationFrame(paso)
    }
    controles.addEventListener('start', empezar)
    const pedirDibujo = () => invalidate()
    controles.addEventListener('change', pedirDibujo)
    invalidate()
    return () => {
      cancelAnimationFrame(raf)
      controles.removeEventListener('start', empezar)
      controles.removeEventListener('change', pedirDibujo)
      controles.dispose()
    }
  }, [camara, dom, altura, reinicio])

  return null
}

function Punto({ pos, activo, escala, onClick }: { pos: [number, number, number]; activo: boolean; escala: number; onClick: () => void }) {
  const [sobre, setSobre] = useState(false)
  const radio = 0.028 * escala * (activo || sobre ? 1.45 : 1)
  return (
    <group position={pos}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          if (e.delta > 5) return
          onClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setSobre(true)
          document.body.style.cursor = 'pointer'
          invalidate()
        }}
        onPointerOut={() => {
          setSobre(false)
          document.body.style.cursor = ''
          invalidate()
        }}
      >
        <sphereGeometry args={[radio, 24, 24]} />
        <meshBasicMaterial color={activo ? '#0f8fa3' : '#ffffff'} depthTest={false} transparent opacity={0.95} />
      </mesh>
      {/* aro exterior para que el punto se vea sobre cualquier color */}
      <mesh renderOrder={-1}>
        <sphereGeometry args={[radio * 1.35, 24, 24]} />
        <meshBasicMaterial color={activo ? '#ffffff' : '#0f8fa3'} depthTest={false} transparent opacity={0.45} />
      </mesh>
    </group>
  )
}

/** Plataforma de estudio: disco con borde biselado donde caen las sombras. */
function Plataforma({ radio }: { radio: number }) {
  return (
    <group>
      <mesh position={[0, -0.015, 0]} receiveShadow>
        <cylinderGeometry args={[radio, radio * 1.04, 0.03, 96]} />
        <meshStandardMaterial color="#e3ebef" roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radio * 0.97, radio, 96]} />
        <meshStandardMaterial color="#0f8fa3" roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  )
}

/**
 * Visor de un equipo: se gira arrastrando, se acerca con la rueda o con el gesto de pellizco.
 * Los puntos blancos marcan las partes principales; tocar uno abre su explicación.
 */
export default function VisorEquipo({
  tipo,
  parteActiva,
  onParte,
  reinicio = 0,
  notaRef,
}: {
  tipo: TipoModelo
  parteActiva: string | null
  onParte: (id: string | null) => void
  /** Cambiar este número devuelve la cámara a su posición inicial. */
  reinicio?: number
  /** Elemento HTML de la nota flotante de la parte activa. */
  notaRef: RefObject<HTMLDivElement | null>
}) {
  const def = MODELOS[tipo]
  const Modelo = COMPONENTES[tipo]
  const escala = useMemo(() => Math.max(0.6, def.altura), [def.altura])
  const radio = Math.max(0.9, def.altura * 0.95)
  const cobertura = Math.max(1.6, def.altura * 1.6)
  const parteElegida = def.partes.find((p) => p.id === parteActiva)

  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ fov: 38, near: 0.05, far: 50 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      onPointerMissed={() => onParte(null)}
      aria-label={`Modelo 3D de ${def.nombre}. Arrastra para girarlo.`}
      role="img"
    >
      <EntornoEstudio intensidad={0.85} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[3, 5.5, 4]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-cobertura}
        shadow-camera-right={cobertura}
        shadow-camera-top={cobertura}
        shadow-camera-bottom={-cobertura}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
      />
      <directionalLight position={[-4, 2.5, -3]} intensity={0.6} />
      <Controles altura={def.altura} reinicio={reinicio} />
      <SeguirAncla pos={parteElegida ? parteElegida.pos : null} notaRef={notaRef} />
      <Plataforma radio={radio} />
      <Modelo />
      {def.partes.map((parte) => (
        <Punto key={parte.id} pos={parte.pos} escala={escala} activo={parteActiva === parte.id} onClick={() => onParte(parteActiva === parte.id ? null : parte.id)} />
      ))}
    </Canvas>
  )
}
