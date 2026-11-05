import { Canvas, invalidate, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { MODELOS } from './catalogo'
import { EntornoEstudio } from './entorno'
import { Caja, Cil, COMPONENTES } from './modelos'
import { colocarEquipos, LIMITES, PUNTOS, type Colocado, type DefPunto, type EquipoSala, type EstadoSala, type PuntoVista, type Zona } from './salaDatos'

const COLOR_ZONA: Record<Zona, string> = {
  atencion: '#e6f0f2',
  laboratorio: '#e7eef5',
  imagenes: '#ebe9f3',
  recepcion: '#f0f2e8',
}

const COLOR_ESTADO: Record<EstadoSala, string> = { verde: '#34d399', amarillo: '#fbbf24', rojo: '#fb7185' }

// -- texturas generadas en el momento (sin descargar nada) ----------------------------

/** Piso de porcelanato: baldosas con juntas finas y un leve moteado. */
function crearPiso(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#d6dfe4'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(120,140,150,${Math.random() * 0.05})`
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 3, 2 + Math.random() * 3)
  }
  ctx.strokeStyle = '#b4c1c9'
  ctx.lineWidth = 3
  ctx.strokeRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

// -- piezas de la sala --------------------------------------------------------------

function Estructura() {
  const piso = useMemo(() => {
    const t = crearPiso()
    t.repeat.set(20, 13.5)
    return t
  }, [])
  useEffect(() => () => piso.dispose(), [piso])

  return (
    <group>
      {/* piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12.4, 8.4]} />
        <meshStandardMaterial map={piso} roughness={0.35} metalness={0.05} />
      </mesh>
      {(Object.keys(LIMITES) as Zona[]).map((z) => {
        const l = LIMITES[z]
        return (
          <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[(l.x0 + l.x1) / 2, 0.003, (l.z0 + l.z1) / 2]} receiveShadow>
            <planeGeometry args={[l.x1 - l.x0 - 0.2, l.z1 - l.z0 - 0.2]} />
            <meshStandardMaterial color={COLOR_ZONA[z]} roughness={0.9} transparent opacity={0.55} />
          </mesh>
        )
      })}

      {/* paredes del fondo y del lado izquierdo (las otras quedan abiertas para poder mirar adentro) */}
      <Caja s={[12.4, 2.9, 0.16]} p={[0, 1.45, -4.1]} m="hueso" r={0.02} />
      <Caja s={[0.16, 2.9, 8.4]} p={[-6.1, 1.45, 0]} m="hueso" r={0.02} />
      {/* zócalos */}
      <Caja s={[12.2, 0.12, 0.04]} p={[0, 0.06, -4.0]} m="gris" r={0.012} />
      <Caja s={[0.04, 0.12, 8.2]} p={[-6.0, 0.06, 0]} m="gris" r={0.012} />
      {/* ventana grande en la pared del fondo */}
      <Caja s={[2.6, 1.3, 0.05]} p={[3, 1.7, -4.0]} luz="#d7efff" r={0.01} />
      {[-1.3, 0, 1.3].map((dx) => (
        <Caja key={dx} s={[0.05, 1.4, 0.07]} p={[3 + dx, 1.7, -3.98]} m="blanco" r={0.01} />
      ))}
      <Caja s={[2.7, 0.05, 0.08]} p={[3, 1.05, -3.97]} m="blanco" r={0.01} />
      <Caja s={[2.7, 0.05, 0.08]} p={[3, 2.35, -3.97]} m="blanco" r={0.01} />

      {/* divisiones bajas con pasos abiertos y tapa */}
      {[
        { s: [0.1, 1.1, 2.7] as [number, number, number], p: [0, 0.55, -2.65] as [number, number, number] },
        { s: [0.1, 1.1, 2.7] as [number, number, number], p: [0, 0.55, 2.65] as [number, number, number] },
        { s: [2.6, 1.1, 0.1] as [number, number, number], p: [-4.7, 0.55, 0] as [number, number, number] },
        { s: [2.6, 1.1, 0.1] as [number, number, number], p: [4.7, 0.55, 0] as [number, number, number] },
      ].map((d, i) => (
        <group key={i}>
          <Caja s={d.s} p={d.p} m="blanco" r={0.02} />
          <Caja s={[d.s[0] + 0.03, 0.04, d.s[2] + 0.03]} p={[d.p[0], 1.12, d.p[2]]} m="teal" r={0.015} />
        </group>
      ))}

      {/* mueble bajo con mesón en la sala de atención y en el laboratorio */}
      {[-3.4, 3.4].map((x) => (
        <group key={x}>
          <Caja s={[2.8, 0.82, 0.55]} p={[x, 0.41, -3.7]} m="blanco" r={0.02} />
          <Caja s={[2.86, 0.05, 0.6]} p={[x, 0.845, -3.7]} m="gris" r={0.015} />
          {[-0.9, 0, 0.9].map((dx) => (
            <Caja key={dx} s={[0.85, 0.7, 0.012]} p={[x + dx, 0.42, -3.41]} m="hueso" r={0.006} />
          ))}
          {[-0.9, 0, 0.9].map((dx) => (
            <Caja key={`t${dx}`} s={[0.14, 0.012, 0.014]} p={[x + dx, 0.68, -3.4]} m="cromo" r={0.004} />
          ))}
        </group>
      ))}

      {/* recepción: mostrador, computador, sillas, planta y cuadro */}
      <Caja s={[2.6, 1, 0.7]} p={[-3, 0.5, 3.3]} m="hueso" r={0.03} />
      <Caja s={[2.7, 0.06, 0.8]} p={[-3, 1.02, 3.3]} m="teal" r={0.02} />
      <Caja s={[0.5, 0.32, 0.03]} p={[-3.4, 1.25, 3.25]} luz="#38bdf8" r={0.008} />
      <Caja s={[0.5, 0.34, 0.015]} p={[-3.4, 1.25, 3.23]} m="oscuro" r={0.008} />
      {[-5.3, -4.7, -4.1].map((x) => (
        <group key={x}>
          <Caja s={[0.5, 0.08, 0.5]} p={[x, 0.45, 1.2]} m="tapiz" r={0.035} />
          <Caja s={[0.5, 0.5, 0.08]} p={[x, 0.72, 0.98]} m="tapiz" r={0.035} />
          {[-0.2, 0.2].flatMap((dx) => [-0.2, 0.2].map((dz) => <Cil key={`${dx}${dz}`} r={0.015} h={0.42} p={[x + dx, 0.21, 1.2 + dz]} m="acero" />))}
        </group>
      ))}
      <Cil r={0.2} h={0.4} p={[-5.5, 0.2, 3.5]} m="blanco" r2={0.16} />
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-5.5 + Math.sin(i * 1.3) * 0.12, 0.7 + i * 0.1, 3.5 + Math.cos(i * 1.3) * 0.12]} castShadow>
          <sphereGeometry args={[0.2 - i * 0.018, 20, 16]} />
          <meshStandardMaterial color="#3f8f5a" roughness={0.8} />
        </mesh>
      ))}
      <Caja s={[0.9, 0.6, 0.04]} p={[-3, 1.8, -0.0]} m="blanco" r={0.01} />
    </group>
  )
}

function Mesa({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Caja s={[0.98, 0.05, 0.62]} p={[0, 0.775, 0]} m="gris" r={0.015} />
      {[
        [-0.44, -0.26],
        [0.44, -0.26],
        [-0.44, 0.26],
        [0.44, 0.26],
      ].map(([dx, dz]) => (
        <Cil key={`${dx}${dz}`} r={0.022} h={0.75} p={[dx, 0.375, dz]} m="acero" />
      ))}
      <Caja s={[0.9, 0.03, 0.54]} p={[0, 0.3, 0]} m="gris" r={0.01} />
    </group>
  )
}

function EquipoEnSala({
  colocado,
  seleccionado,
  onSeleccionar,
}: {
  colocado: Colocado
  seleccionado: boolean
  onSeleccionar: (id: string) => void
}) {
  const { equipo, pos } = colocado
  const def = MODELOS[equipo.tipo]
  const Modelo = COMPONENTES[equipo.tipo]
  const color = COLOR_ESTADO[equipo.estado]
  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta > 5) return
        onSeleccionar(equipo.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    >
      {def.enMesa && <Mesa x={0} z={0} />}
      <group position={[0, def.enMesa ? 0.8 : 0, 0]}>
        <Modelo />
      </group>
      {/* placa en el piso: el color es el estado del equipo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[seleccionado ? 0.8 : 0.64, seleccionado ? 0.92 : 0.72, 56]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[seleccionado ? 0.8 : 0.64, 56]} />
        <meshBasicMaterial color={color} transparent opacity={seleccionado ? 0.28 : 0.12} depthWrite={false} />
      </mesh>
      {seleccionado && (
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.97, 0.97, 2, 48, 1, true]} />
          <meshBasicMaterial color="#0f8fa3" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

function Marcador({ punto, onIr }: { punto: DefPunto; onIr: (id: PuntoVista) => void }) {
  const x = punto.mira[0]
  const z = punto.id === 'recepcion' ? 1.9 : punto.id === 'imagenes' ? 2.2 : -1.9
  return (
    <mesh
      position={[x, 0.02, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta > 5) return
        onIr(punto.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    >
      <ringGeometry args={[0.28, 0.4, 40]} />
      <meshBasicMaterial color="#0f8fa3" transparent opacity={0.85} />
    </mesh>
  )
}

// -- cámara -----------------------------------------------------------------------

function Camara({ punto, enfoque }: { punto: PuntoVista; enfoque: { pos: [number, number, number] } | null }) {
  const camara = useThree((s) => s.camera)
  const dom = useThree((s) => s.gl.domElement)
  const objetivo = useRef({ ojo: new THREE.Vector3(6.5, 6.8, 8.2), mira: new THREE.Vector3(0, 0.3, 0.3), aereo: true })
  const actual = useRef({ ojo: new THREE.Vector3(6.5, 6.8, 8.2), mira: new THREE.Vector3(0, 0.3, 0.3) })
  const giro = useRef({ yaw: 0, pitch: 0, arrastrando: false, x: 0, y: 0 })

  // Hacia dónde mirar cuando cambia el punto o se selecciona un equipo.
  useEffect(() => {
    const def = PUNTOS.find((p) => p.id === punto) ?? PUNTOS[0]
    const o = objetivo.current
    if (enfoque) {
      const [px, , pz] = enfoque.pos
      o.ojo.set(px, 1.7, pz + 3)
      o.mira.set(px, 0.7, pz)
      o.aereo = false
    } else {
      o.ojo.set(...def.ojo)
      o.mira.set(...def.mira)
      o.aereo = def.id === 'general'
    }
    giro.current.yaw = 0
    giro.current.pitch = 0
    invalidate()
  }, [punto, enfoque])

  // Arrastrar: en la vista aérea gira alrededor del consultorio; a nivel del piso, mira alrededor.
  useEffect(() => {
    const g = giro.current
    const abajo = (e: PointerEvent) => {
      g.arrastrando = true
      g.x = e.clientX
      g.y = e.clientY
    }
    const mover = (e: PointerEvent) => {
      if (!g.arrastrando) return
      g.yaw -= (e.clientX - g.x) * 0.006
      g.pitch = THREE.MathUtils.clamp(g.pitch - (e.clientY - g.y) * 0.004, -0.6, 0.45)
      g.x = e.clientX
      g.y = e.clientY
      invalidate()
    }
    const arriba = () => {
      g.arrastrando = false
    }
    dom.addEventListener('pointerdown', abajo)
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', arriba)
    return () => {
      dom.removeEventListener('pointerdown', abajo)
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', arriba)
    }
  }, [dom])

  const dir = useMemo(() => new THREE.Vector3(), [])
  const eje = useMemo(() => new THREE.Vector3(), [])
  const vertical = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  useFrame((_, delta) => {
    const o = objetivo.current
    const a = actual.current
    const k = 1 - Math.exp(-delta * 4.5)
    a.ojo.lerp(o.ojo, k)
    a.mira.lerp(o.mira, k)
    const { yaw, pitch } = giro.current

    if (o.aereo) {
      // órbita alrededor del punto central
      dir.copy(a.ojo).sub(a.mira)
      dir.applyAxisAngle(vertical, yaw)
      eje.set(dir.z, 0, -dir.x).normalize()
      dir.applyAxisAngle(eje, pitch * 0.8)
      camara.position.copy(a.mira).add(dir)
      camara.lookAt(a.mira)
    } else {
      // mirar alrededor desde el mismo lugar
      dir.copy(a.mira).sub(a.ojo)
      dir.applyAxisAngle(vertical, yaw)
      eje.set(dir.z, 0, -dir.x).normalize()
      dir.applyAxisAngle(eje, pitch)
      camara.position.copy(a.ojo)
      camara.lookAt(a.ojo.x + dir.x, a.ojo.y + dir.y, a.ojo.z + dir.z)
    }

    const enMovimiento = a.ojo.distanceTo(o.ojo) > 0.003 || a.mira.distanceTo(o.mira) > 0.003
    if (enMovimiento || giro.current.arrastrando) invalidate()
  })

  return null
}

/**
 * Consultorio en 3D: se recorre tocando los lugares marcados (o los botones de arriba), se mira
 * alrededor arrastrando, y se toca un equipo para ver su información.
 */
export default function SalaConsultorio({
  equipos,
  seleccionadoId,
  onSeleccionar,
  punto,
  onPunto,
}: {
  equipos: EquipoSala[]
  seleccionadoId: string | null
  onSeleccionar: (id: string | null) => void
  punto: PuntoVista
  onPunto: (p: PuntoVista) => void
}) {
  const colocados = useMemo(() => colocarEquipos(equipos), [equipos])
  const seleccionado = colocados.find((c) => c.equipo.id === seleccionadoId)

  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ fov: 45, near: 0.1, far: 80, position: [6.5, 6.8, 8.2] }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.85 }}
      onPointerMissed={() => onSeleccionar(null)}
      role="img"
      aria-label="Modelo 3D del consultorio. Arrastra para mirar alrededor y toca un equipo para ver sus datos."
    >
      <EntornoEstudio intensidad={0.5} />
      <ambientLight intensity={0.2} />
      <hemisphereLight args={['#ffffff', '#9fb2bd', 0.3]} />
      <directionalLight
        position={[5, 9, 6]}
        intensity={2.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={24}
      />
      <Camara punto={punto} enfoque={seleccionado ? { pos: seleccionado.pos } : null} />
      <Estructura />
      {PUNTOS.filter((p) => p.id !== 'general' && p.id !== punto).map((p) => (
        <Marcador key={p.id} punto={p} onIr={onPunto} />
      ))}
      {colocados.map((c) => (
        <EquipoEnSala key={c.equipo.id} colocado={c} seleccionado={c.equipo.id === seleccionadoId} onSeleccionar={onSeleccionar} />
      ))}
    </Canvas>
  )
}
