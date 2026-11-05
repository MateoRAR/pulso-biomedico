import { Canvas, invalidate, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { MODELOS } from './catalogo'
import { EntornoEstudio } from './entorno'
import { Caja, Cil, COMPONENTES } from './modelos'
import { SeguirAncla } from './SeguirAncla'
import { anclaDeEquipo, colocarEquipos, LIMITES, PUNTOS, ZONA_ANCHO, ZONA_FONDO, type Colocado, type DefPunto, type EquipoSala, type EstadoSala, type PuntoVista, type Zona } from './salaDatos'

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
  const W = ZONA_ANCHO
  const D = ZONA_FONDO
  const piso = useMemo(() => {
    const t = crearPiso()
    t.repeat.set((2 * W + 0.4) * 1.6, (2 * D + 0.4) * 1.6)
    return t
  }, [W, D])
  useEffect(() => () => piso.dispose(), [piso])

  return (
    <group>
      {/* piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[2 * W + 0.4, 2 * D + 0.4]} />
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
      <Caja s={[2 * W + 0.4, 2.9, 0.16]} p={[0, 1.45, -D - 0.1]} m="hueso" r={0.02} />
      <Caja s={[0.16, 2.9, 2 * D + 0.4]} p={[-W - 0.1, 1.45, 0]} m="hueso" r={0.02} />
      {/* zócalos */}
      <Caja s={[2 * W + 0.2, 0.12, 0.04]} p={[0, 0.06, -D + 0.02]} m="gris" r={0.012} />
      <Caja s={[0.04, 0.12, 2 * D + 0.2]} p={[-W + 0.02, 0.06, 0]} m="gris" r={0.012} />
      {/* una ventana grande por cada sala del fondo */}
      {[-W / 2, W / 2].map((cx) => (
        <group key={cx}>
          <Caja s={[3.2, 1.3, 0.05]} p={[cx, 1.7, -D]} luz="#d7efff" r={0.01} />
          {[-1.6, -0.53, 0.53, 1.6].map((dx) => (
            <Caja key={dx} s={[0.05, 1.4, 0.07]} p={[cx + dx, 1.7, -D + 0.02]} m="blanco" r={0.01} />
          ))}
          <Caja s={[3.3, 0.05, 0.08]} p={[cx, 1.05, -D + 0.03]} m="blanco" r={0.01} />
          <Caja s={[3.3, 0.05, 0.08]} p={[cx, 2.35, -D + 0.03]} m="blanco" r={0.01} />
        </group>
      ))}

      {/* divisiones bajas con pasos abiertos y tapa (la cámara las mira desde arriba, no estorban) */}
      {[
        { s: [0.1, 0.9, D - 1.3] as [number, number, number], p: [0, 0.45, -(1.3 + (D - 1.3) / 2)] as [number, number, number] },
        { s: [0.1, 0.9, D - 1.3] as [number, number, number], p: [0, 0.45, 1.3 + (D - 1.3) / 2] as [number, number, number] },
        { s: [2.6, 0.9, 0.1] as [number, number, number], p: [-(W - 1.3), 0.45, 0] as [number, number, number] },
        { s: [2.6, 0.9, 0.1] as [number, number, number], p: [W - 1.3, 0.45, 0] as [number, number, number] },
      ].map((d, i) => (
        <group key={i}>
          <Caja s={d.s} p={d.p} m="blanco" r={0.02} />
          <Caja s={[d.s[0] + 0.03, 0.04, d.s[2] + 0.03]} p={[d.p[0], 0.92, d.p[2]]} m="teal" r={0.015} />
        </group>
      ))}

      {/* mueble bajo con mesón contra la pared en la sala de atención y en el laboratorio */}
      {[-W / 2, W / 2].map((x) => (
        <group key={x}>
          <Caja s={[3.6, 0.82, 0.55]} p={[x, 0.41, -D + 0.3]} m="blanco" r={0.02} />
          <Caja s={[3.66, 0.05, 0.6]} p={[x, 0.845, -D + 0.3]} m="gris" r={0.015} />
          {[-1.2, 0, 1.2].map((dx) => (
            <Caja key={dx} s={[1.1, 0.7, 0.012]} p={[x + dx, 0.42, -D + 0.59]} m="hueso" r={0.006} />
          ))}
          {[-1.2, 0, 1.2].map((dx) => (
            <Caja key={`t${dx}`} s={[0.14, 0.012, 0.014]} p={[x + dx, 0.68, -D + 0.6]} m="cromo" r={0.004} />
          ))}
        </group>
      ))}

      {/* recepción: mostrador, computador, sillas, planta */}
      <Caja s={[3.2, 1, 0.7]} p={[-W / 2, 0.5, D - 0.8]} m="hueso" r={0.03} />
      <Caja s={[3.3, 0.06, 0.8]} p={[-W / 2, 1.02, D - 0.8]} m="teal" r={0.02} />
      <Caja s={[0.5, 0.32, 0.03]} p={[-W / 2 - 0.5, 1.25, D - 0.85]} luz="#38bdf8" r={0.008} />
      <Caja s={[0.5, 0.34, 0.015]} p={[-W / 2 - 0.5, 1.25, D - 0.87]} m="oscuro" r={0.008} />
      {[-W + 1, -W + 1.6, -W + 2.2].map((x) => (
        <group key={x}>
          <Caja s={[0.5, 0.08, 0.5]} p={[x, 0.45, 1.6]} m="tapiz" r={0.035} />
          <Caja s={[0.5, 0.5, 0.08]} p={[x, 0.72, 1.38]} m="tapiz" r={0.035} />
          {[-0.2, 0.2].flatMap((dx) => [-0.2, 0.2].map((dz) => <Cil key={`${dx}${dz}`} r={0.015} h={0.42} p={[x + dx, 0.21, 1.6 + dz]} m="acero" />))}
        </group>
      ))}
      <Cil r={0.2} h={0.4} p={[-W + 0.6, 0.2, D - 0.6]} m="blanco" r2={0.16} />
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-W + 0.6 + Math.sin(i * 1.3) * 0.12, 0.7 + i * 0.1, D - 0.6 + Math.cos(i * 1.3) * 0.12]} castShadow>
          <sphereGeometry args={[0.2 - i * 0.018, 20, 16]} />
          <meshStandardMaterial color="#3f8f5a" roughness={0.8} />
        </mesh>
      ))}
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
          <meshBasicMaterial color="#0f8fa3" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

function Marcador({ punto, onIr }: { punto: DefPunto; onIr: (id: PuntoVista) => void }) {
  const [x, z] = punto.marcador ?? [punto.mira[0], 0]
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

function Camara({ punto, enfoque }: { punto: PuntoVista; enfoque: { pos: [number, number, number]; y: number } | null }) {
  const camara = useThree((s) => s.camera)
  const dom = useThree((s) => s.gl.domElement)
  const size = useThree((s) => s.size)
  const objetivo = useRef({ ojo: new THREE.Vector3(...PUNTOS[0].ojo), mira: new THREE.Vector3(...PUNTOS[0].mira), aereo: true })
  const actual = useRef({ ojo: new THREE.Vector3(...PUNTOS[0].ojo), mira: new THREE.Vector3(...PUNTOS[0].mira) })
  const giro = useRef({ yaw: 0, pitch: 0, arrastrando: false, x: 0, y: 0 })
  const aspecto = size.width / Math.max(1, size.height)

  // Hacia dónde mirar cuando cambia el punto o se selecciona un equipo.
  useEffect(() => {
    const def = PUNTOS.find((p) => p.id === punto) ?? PUNTOS[0]
    const o = objetivo.current
    if (enfoque) {
      // Se aleja lo justo para ver el equipo con su nota arriba: el punto de la nota queda a una altura que deja espacio al cuadro.
      const [px, , pz] = enfoque.pos
      const fraccion = THREE.MathUtils.clamp(400 / size.height, 0.5, 0.78)
      const d = Math.max(3.9, ((enfoque.y / (1 - fraccion)) / (2 * Math.tan(THREE.MathUtils.degToRad(22.5)))) * 0.92)
      const alto = 2 * d * Math.tan(THREE.MathUtils.degToRad(22.5))
      const yMira = enfoque.y + (fraccion - 0.5) * alto
      o.ojo.set(px, yMira + 0.45, pz + d)
      o.mira.set(px, yMira, pz)
      o.aereo = false
    } else {
      // En pantallas angostas (celular vertical) la cámara se aleja para que quepa todo el ancho de la sala.
      const alejar = THREE.MathUtils.clamp(1.7 / aspecto, 1, 2.2)
      const mira = new THREE.Vector3(...def.mira)
      o.mira.copy(mira)
      o.ojo.set(...def.ojo).sub(mira).multiplyScalar(alejar).add(mira)
      o.aereo = def.id === 'general'
    }
    giro.current.yaw = 0
    giro.current.pitch = 0
    invalidate()
  }, [punto, enfoque, aspecto, size.height])

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
  notaRef,
}: {
  equipos: EquipoSala[]
  seleccionadoId: string | null
  onSeleccionar: (id: string | null) => void
  punto: PuntoVista
  onPunto: (p: PuntoVista) => void
  /** Elemento HTML de la nota flotante: se mueve hasta el equipo seleccionado. */
  notaRef: RefObject<HTMLDivElement | null>
}) {
  const colocados = useMemo(() => colocarEquipos(equipos), [equipos])
  const seleccionado = colocados.find((c) => c.equipo.id === seleccionadoId)
  const ancla = useMemo(() => (seleccionado ? anclaDeEquipo(seleccionado) : null), [seleccionado])
  const enfoque = useMemo(() => (seleccionado && ancla ? { pos: seleccionado.pos, y: ancla[1] } : null), [seleccionado, ancla])

  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ fov: 45, near: 0.1, far: 90, position: PUNTOS[0].ojo }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.85 }}
      onPointerMissed={() => onSeleccionar(null)}
      role="img"
      aria-label="Modelo 3D del consultorio. Arrastra para mirar alrededor y toca un equipo para ver sus datos en una nota."
    >
      <EntornoEstudio intensidad={0.5} />
      <ambientLight intensity={0.2} />
      <hemisphereLight args={['#ffffff', '#9fb2bd', 0.3]} />
      <directionalLight
        position={[7, 13, 9]}
        intensity={2.0}
        castShadow
        shadow-mapSize={[3072, 3072]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={36}
      />
      <Camara punto={punto} enfoque={enfoque} />
      <SeguirAncla pos={ancla} notaRef={notaRef} />
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
