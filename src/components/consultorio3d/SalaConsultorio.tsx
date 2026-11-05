import { Canvas, invalidate, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'

import { MODELOS } from './catalogo'
import { EntornoEstudio } from './entorno'
import { Caja, Cil, COMPONENTES } from './modelos'
import { ANCHO_LATERAL, ANCHO_NOTA, LINEA_NOTA, SeguirAncla } from './SeguirAncla'
import { anclasDeEquipo, colocarEquipos, esMovil, PLANOS, puntosDe, SILLONES_QUIMIO, ZONA_ANCHO, ZONA_FONDO, type Colocado, type DefPlano, type DefPunto, type EquipoSala, type EstadoSala, type PlanoId, type PuntoVista } from './salaDatos'

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

/** Piso de porcelanato del plano y un tinte suave por zona. */
function Piso({ plano }: { plano: DefPlano }) {
  const { x0, x1, z0, z1 } = plano.piso
  const ancho = x1 - x0
  const fondo = z1 - z0
  const piso = useMemo(() => {
    const t = crearPiso()
    t.repeat.set(ancho * 1.6, fondo * 1.6)
    return t
  }, [ancho, fondo])
  useEffect(() => () => piso.dispose(), [piso])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(x0 + x1) / 2, 0, (z0 + z1) / 2]} receiveShadow>
        <planeGeometry args={[ancho, fondo]} />
        <meshStandardMaterial map={piso} roughness={0.35} metalness={0.05} />
      </mesh>
      {plano.zonas.map((l) => (
        <mesh key={l.id} rotation={[-Math.PI / 2, 0, 0]} position={[(l.x0 + l.x1) / 2, 0.003, (l.z0 + l.z1) / 2]} receiveShadow>
          <planeGeometry args={[l.x1 - l.x0 - 0.2, l.z1 - l.z0 - 0.2]} />
          <meshStandardMaterial color={l.color} roughness={0.9} transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  )
}

/** Consultorio de baja complejidad: atención, esterilización y laboratorio, imágenes y recepción. */
function EstructuraGeneral({ plano }: { plano: DefPlano }) {
  const W = ZONA_ANCHO
  const D = ZONA_FONDO

  return (
    <group>
      <Piso plano={plano} />

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

// -- plano de oncología ---------------------------------------------------------------

type P2 = [number, number]

/** Muro bajo con tapa (la cámara lo mira desde arriba y no estorba), de (x0, z0) a (x1, z1), recto. */
function Muro({ a, b, alto = 0.9 }: { a: P2; b: P2; alto?: number }) {
  const largo = Math.hypot(b[0] - a[0], b[1] - a[1])
  const enX = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1])
  const s: [number, number, number] = enX ? [largo, alto, 0.1] : [0.1, alto, largo]
  const p: [number, number, number] = [(a[0] + b[0]) / 2, alto / 2, (a[1] + b[1]) / 2]
  return (
    <group>
      <Caja s={s} p={p} m="blanco" r={0.02} />
      <Caja s={[s[0] + 0.03, 0.04, s[2] + 0.03]} p={[p[0], alto + 0.02, p[2]]} m="teal" r={0.015} />
    </group>
  )
}

/** Muro de vidrio alto con marco (sala limpia de la central de mezclas). */
function MuroVidrio({ x, z0, z1 }: { x: number; z0: number; z1: number }) {
  const largo = z1 - z0
  const cz = (z0 + z1) / 2
  return (
    <group>
      <Caja s={[0.04, 2.3, largo]} p={[x, 1.15, cz]} m="vidrio" r={0.005} />
      <Caja s={[0.08, 0.08, largo]} p={[x, 2.3, cz]} m="acero" r={0.01} />
      <Caja s={[0.08, 0.1, largo]} p={[x, 0.05, cz]} m="acero" r={0.01} />
      {[z0, z1].map((z) => (
        <Caja key={z} s={[0.08, 2.3, 0.08]} p={[x, 1.15, z]} m="acero" r={0.01} />
      ))}
    </group>
  )
}

/** Sillón reclinable de quimioterapia con apoyabrazos y mesa auxiliar. */
function SillonQuimio({ x, z, rot }: { x: number; z: number; rot: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <Caja s={[0.66, 0.1, 0.9]} p={[0, 0.05, 0]} m="oscuro" r={0.03} />
      <Caja s={[0.2, 0.3, 0.3]} p={[0, 0.25, 0]} m="gris" r={0.03} />
      <Caja s={[0.6, 0.15, 0.58]} p={[0, 0.48, 0.05]} m="tapiz" r={0.05} />
      <Caja s={[0.6, 0.78, 0.13]} p={[0, 0.86, -0.34]} m="tapiz" r={0.05} rot={[-0.32, 0, 0]} />
      <Caja s={[0.36, 0.2, 0.12]} p={[0, 1.32, -0.5]} m="tapiz" r={0.05} rot={[-0.32, 0, 0]} />
      <Caja s={[0.52, 0.08, 0.46]} p={[0, 0.36, 0.55]} m="tapiz" r={0.03} rot={[0.5, 0, 0]} />
      {[-0.35, 0.35].map((dx) => (
        <Caja key={dx} s={[0.09, 0.07, 0.56]} p={[dx, 0.66, 0]} m="blanco" r={0.03} />
      ))}
      {/* mesa auxiliar */}
      <Cil r={0.02} h={0.68} p={[0.66, 0.34, 0.05]} m="acero" />
      <Caja s={[0.36, 0.04, 0.36]} p={[0.66, 0.7, 0.05]} m="blanco" r={0.015} />
      <Cil r={0.035} h={0.1} p={[0.6, 0.77, 0.08]} m="teal" />
    </group>
  )
}

/** Silla de espera o de consultorio (mirando a +z antes de girarla). */
function Silla({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <Caja s={[0.48, 0.07, 0.46]} p={[0, 0.45, 0]} m="tapiz" r={0.03} />
      <Caja s={[0.48, 0.46, 0.07]} p={[0, 0.72, -0.21]} m="tapiz" r={0.03} />
      {[-0.19, 0.19].flatMap((dx) => [-0.18, 0.18].map((dz) => <Cil key={`${dx}${dz}`} r={0.014} h={0.42} p={[dx, 0.21, dz]} m="acero" />))}
    </group>
  )
}

/** Escritorio con computador. */
function Escritorio({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <Caja s={[1.4, 0.05, 0.7]} p={[0, 0.75, 0]} m="hueso" r={0.015} />
      <Caja s={[0.05, 0.73, 0.66]} p={[-0.66, 0.365, 0]} m="blanco" r={0.01} />
      <Caja s={[0.45, 0.73, 0.66]} p={[0.46, 0.365, 0]} m="blanco" r={0.01} />
      <Caja s={[0.48, 0.3, 0.03]} p={[-0.2, 1.0, -0.22]} m="oscuro" r={0.01} />
      <Caja s={[0.44, 0.26, 0.01]} p={[-0.2, 1.0, -0.2]} luz="#7dd3fc" r={0.004} />
      <Caja s={[0.06, 0.12, 0.06]} p={[-0.2, 0.83, -0.22]} m="gris" r={0.01} />
    </group>
  )
}

/** Camilla fija de examen (mobiliario del consultorio, no es un equipo del inventario). */
function CamillaExamen({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <Caja s={[0.64, 0.62, 1.8]} p={[0, 0.31, 0]} m="blanco" r={0.03} />
      <Caja s={[0.66, 0.1, 1.82]} p={[0, 0.67, 0]} m="tapiz" r={0.04} />
      <Caja s={[0.66, 0.1, 0.5]} p={[0, 0.8, -0.72]} m="tapiz" r={0.04} rot={[-0.35, 0, 0]} />
      <Caja s={[0.5, 0.02, 1.2]} p={[0, 0.73, 0.15]} m="hueso" r={0.005} />
    </group>
  )
}

function Planta({ x, z }: { x: number; z: number }) {
  return (
    <group>
      <Cil r={0.2} h={0.4} p={[x, 0.2, z]} m="blanco" r2={0.16} />
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[x + Math.sin(i * 1.3) * 0.12, 0.7 + i * 0.1, z + Math.cos(i * 1.3) * 0.12]} castShadow>
          <sphereGeometry args={[0.2 - i * 0.018, 20, 16]} />
          <meshStandardMaterial color="#3f8f5a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Ventana({ x, z }: { x: number; z: number }) {
  return (
    <group>
      <Caja s={[3, 1.3, 0.05]} p={[x, 1.7, z]} luz="#d7efff" r={0.01} />
      {[-1.5, -0.5, 0.5, 1.5].map((dx) => (
        <Caja key={dx} s={[0.05, 1.4, 0.07]} p={[x + dx, 1.7, z + 0.02]} m="blanco" r={0.01} />
      ))}
      <Caja s={[3.1, 0.05, 0.08]} p={[x, 1.05, z + 0.03]} m="blanco" r={0.01} />
      <Caja s={[3.1, 0.05, 0.08]} p={[x, 2.35, z + 0.03]} m="blanco" r={0.01} />
    </group>
  )
}

function EstructuraOncologia({ plano }: { plano: DefPlano }) {
  const { x0, x1, z0, z1 } = plano.piso
  const ancho = x1 - x0
  const fondo = z1 - z0
  return (
    <group>
      <Piso plano={plano} />
      {/* línea guía del pasillo de circulación */}
      <Caja s={[ancho - 1, 0.006, 0.08]} p={[0, 0.006, 0.2]} m="teal" r={0.002} />

      {/* paredes del fondo y del lado izquierdo, con ventanas sobre la sala de quimioterapia */}
      <Caja s={[ancho, 2.9, 0.16]} p={[0, 1.45, z0 + 0.1]} m="hueso" r={0.02} />
      <Caja s={[0.16, 2.9, fondo]} p={[x0 + 0.1, 1.45, 0]} m="hueso" r={0.02} />
      {[-9, -5.2, -1.4].map((x) => (
        <Ventana key={x} x={x} z={z0 + 0.2} />
      ))}

      {/* --- sala de quimioterapia --- */}
      <Muro a={[-11, -0.6]} b={[-7, -0.6]} />
      <Muro a={[-4, -0.6]} b={[1, -0.6]} />
      <Muro a={[1, -7]} b={[1, -0.6]} />
      {SILLONES_QUIMIO.map((s) => (
        <SillonQuimio key={`${s.x}${s.z}`} {...s} />
      ))}
      {/* cortinas de privacidad entre los sillones del fondo */}
      {SILLONES_QUIMIO.filter((s) => s.rot === 0)
        .slice(0, -1)
        .map((s) => (
          <group key={`c${s.x}`}>
            <Caja s={[0.03, 1.5, 1.2]} p={[s.x + 0.95, 1.05, -6.2]} m="hueso" r={0.01} />
            <Caja s={[0.04, 0.04, 1.3]} p={[s.x + 0.95, 1.82, -6.2]} m="acero" r={0.01} />
          </group>
        ))}
      {/* estación de enfermería, con vista a todos los sillones */}
      <group>
        <Caja s={[3, 1.05, 0.6]} p={[-5.5, 0.525, -3.0]} m="hueso" r={0.03} />
        <Caja s={[3.1, 0.05, 0.7]} p={[-5.5, 1.07, -3.0]} m="teal" r={0.02} />
        <Caja s={[0.6, 1.05, 1.1]} p={[-7.2, 0.525, -3.25]} m="hueso" r={0.03} />
        <Caja s={[0.7, 0.05, 1.2]} p={[-7.2, 1.07, -3.25]} m="teal" r={0.02} />
        {[-6.2, -4.8].map((x) => (
          <group key={x}>
            <Caja s={[0.5, 0.32, 0.03]} p={[x, 1.28, -3.1]} m="oscuro" r={0.008} />
            <Caja s={[0.46, 0.28, 0.01]} p={[x, 1.28, -3.08]} luz="#7dd3fc" r={0.004} />
          </group>
        ))}
        <Silla x={-6.2} z={-2.4} rot={Math.PI} />
        <Silla x={-4.8} z={-2.4} rot={Math.PI} />
      </group>
      {/* lavamanos clínico */}
      <Caja s={[0.6, 0.85, 0.45]} p={[-10.6, 0.425, -3.2]} m="blanco" r={0.03} />
      <Caja s={[0.5, 0.08, 0.35]} p={[-10.6, 0.89, -3.2]} m="acero" r={0.03} />

      {/* --- servicio farmacéutico --- */}
      <Muro a={[1, -0.6]} b={[1.6, -0.6]} />
      <Muro a={[2.8, -0.6]} b={[3.4, -0.6]} />
      <Muro a={[4.8, -0.6]} b={[11, -0.6]} />
      {/* ventanilla de dispensación */}
      <Caja s={[1.4, 1.0, 0.3]} p={[4.1, 0.5, -0.6]} m="blanco" r={0.02} />
      <Caja s={[1.5, 0.05, 0.5]} p={[4.1, 1.02, -0.6]} m="teal" r={0.015} />
      {/* sala limpia de la central de mezclas: muro de vidrio con esclusa y pass-box */}
      <MuroVidrio x={5.2} z0={-7} z1={-2.3} />
      <MuroVidrio x={5.2} z0={-1.3} z1={-0.6} />
      <Caja s={[0.5, 0.5, 0.55]} p={[5.2, 1.15, -4.4]} m="acero" r={0.02} />
      <Caja s={[0.52, 0.04, 0.6]} p={[5.2, 0.88, -4.4]} m="gris" r={0.01} />
      {/* mesón de acero y banco en la sala limpia */}
      <Caja s={[1.8, 0.05, 0.75]} p={[8.2, 0.9, -3.3]} m="acero" r={0.01} />
      {[-0.82, 0.82].flatMap((dx) => [-0.3, 0.3].map((dz) => <Cil key={`${dx}${dz}`} r={0.02} h={0.88} p={[8.2 + dx, 0.44, -3.3 + dz]} m="acero" />))}
      <Caja s={[1.7, 0.03, 0.65]} p={[8.2, 0.25, -3.3]} m="acero" r={0.008} />
      <Cil r={0.2} h={0.05} p={[8.2, 0.62, -2.6]} m="oscuro" />
      <Cil r={0.03} h={0.6} p={[8.2, 0.3, -2.6]} m="acero" />
      {/* estantería del almacenamiento */}
      <group>
        <Caja s={[0.45, 1.9, 1.8]} p={[1.35, 0.95, -4.2]} m="blanco" r={0.02} />
        {[0.4, 0.8, 1.2, 1.6].map((y) => (
          <Caja key={y} s={[0.47, 0.03, 1.82]} p={[1.37, y, -4.2]} m="gris" r={0.008} />
        ))}
        {[-0.6, -0.2, 0.2, 0.6].map((dz) => (
          <Caja key={dz} s={[0.3, 0.22, 0.28]} p={[1.4, 1.0, -4.2 + dz]} m="hueso" r={0.02} />
        ))}
      </group>

      {/* --- recepción y sala de espera --- */}
      <Caja s={[3.2, 1.05, 0.7]} p={[-5.4, 0.525, 2.2]} m="hueso" r={0.03} />
      <Caja s={[3.3, 0.06, 0.8]} p={[-5.4, 1.08, 2.2]} m="teal" r={0.02} />
      {[-6.2, -4.6].map((x) => (
        <group key={x}>
          <Caja s={[0.5, 0.32, 0.03]} p={[x, 1.3, 2.05]} m="oscuro" r={0.008} />
          <Caja s={[0.46, 0.28, 0.01]} p={[x, 1.3, 2.03]} luz="#38bdf8" r={0.004} />
          <Silla x={x} z={1.45} />
        </group>
      ))}
      {[4.3, 5.6].flatMap((z) => [-10.2, -9.5, -8.8, -8.1, -7.4].map((x) => <Silla key={`${x}${z}`} x={x} z={z} rot={Math.PI} />))}
      {/* televisor informativo en la pared */}
      <Caja s={[0.06, 0.75, 1.3]} p={[x0 + 0.22, 1.8, 4.9]} m="oscuro" r={0.01} />
      <Caja s={[0.01, 0.68, 1.22]} p={[x0 + 0.26, 1.8, 4.9]} luz="#0ea5e9" r={0.004} />
      <Planta x={-10.4} z={1.7} />
      <Planta x={-3.6} z={6.5} />

      {/* --- consultorios de consulta externa --- */}
      <Muro a={[-3, 1]} b={[-1.6, 1]} />
      <Muro a={[-0.6, 1]} b={[2.4, 1]} />
      <Muro a={[3.4, 1]} b={[5, 1]} />
      <Muro a={[-3, 1]} b={[-3, 7]} />
      <Muro a={[1, 1]} b={[1, 7]} />
      {[-1, 3].map((cx) => (
        <group key={cx}>
          <Escritorio x={cx + 0.3} z={5.7} rot={Math.PI} />
          <Silla x={cx + 0.3} z={6.4} rot={Math.PI} />
          <Silla x={cx - 0.1} z={4.9} />
          <Silla x={cx + 0.7} z={4.9} />
          <CamillaExamen x={cx - 1.3} z={4.4} />
        </group>
      ))}

      {/* --- sala de procedimientos --- */}
      <Muro a={[5, 1]} b={[6, 1]} />
      <Muro a={[7.4, 1]} b={[11, 1]} />
      <Muro a={[5, 1]} b={[5, 7]} />
      {/* lámpara de procedimientos rodante */}
      <group>
        <Cil r={0.25} h={0.05} p={[9.4, 0.03, 6.5]} m="oscuro" />
        <Cil r={0.025} h={1.8} p={[9.4, 0.95, 6.5]} m="blanco" />
        <Caja s={[1.84, 0.04, 0.04]} p={[9.05, 1.85, 5.65]} m="blanco" r={0.015} rot={[0, 1.96, 0]} />
        <Cil r={0.24} h={0.1} p={[8.7, 1.8, 4.8]} m="blanco" r2={0.18} />
        <Cil r={0.2} h={0.012} p={[8.7, 1.745, 4.8]} m="vidrio" />
      </group>
      {/* mesón con lavamanos y mesa de instrumental */}
      <Caja s={[0.6, 0.88, 2.2]} p={[10.65, 0.44, 4.6]} m="blanco" r={0.02} />
      <Caja s={[0.64, 0.05, 2.24]} p={[10.65, 0.9, 4.6]} m="gris" r={0.015} />
      <Caja s={[0.4, 0.06, 0.4]} p={[10.6, 0.94, 5.3]} m="acero" r={0.02} />
      <Caja s={[0.7, 0.03, 0.45]} p={[7.0, 0.85, 4.4]} m="acero" r={0.01} />
      <Cil r={0.02} h={0.84} p={[7.0, 0.42, 4.4]} m="acero" />
      <Cil r={0.2} h={0.03} p={[7.0, 0.02, 4.4]} m="oscuro" />
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
  const { equipo, pos, rot } = colocado
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
      <group rotation={[0, rot, 0]}>
        {def.enMesa && <Mesa x={0} z={0} />}
        <group position={[0, def.enMesa ? 0.8 : 0, 0]}>
          <Modelo />
        </group>
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

function Camara({ punto, enfoque, puntos }: { punto: PuntoVista; enfoque: { pos: [number, number, number]; y: number; alto: number } | null; puntos: DefPunto[] }) {
  const camara = useThree((s) => s.camera)
  const dom = useThree((s) => s.gl.domElement)
  const size = useThree((s) => s.size)
  const objetivo = useRef({ ojo: new THREE.Vector3(...puntos[0].ojo), mira: new THREE.Vector3(...puntos[0].mira), aereo: true })
  const actual = useRef({ ojo: new THREE.Vector3(...puntos[0].ojo), mira: new THREE.Vector3(...puntos[0].mira) })
  const giro = useRef({ yaw: 0, pitch: 0, arrastrando: false, x: 0, y: 0 })
  const aspecto = size.width / Math.max(1, size.height)

  // Hacia dónde mirar cuando cambia el punto o se selecciona un equipo.
  useEffect(() => {
    const def = puntos.find((p) => p.id === punto) ?? puntos[0]
    const o = objetivo.current
    if (enfoque) {
      const [px, , pz] = enfoque.pos
      if (size.width >= ANCHO_LATERAL) {
        // Pantalla ancha: acercamiento fuerte al equipo, desplazado a la izquierda para que su nota quepa al lado.
        const d = Math.max(2.4, enfoque.alto * 1.75)
        const altoVista = 2 * d * Math.tan(THREE.MathUtils.degToRad(22.5))
        const fx = THREE.MathUtils.clamp(0.5 - (ANCHO_NOTA + LINEA_NOTA) / (2 * size.width), 0.28, 0.5)
        const desplazamiento = (0.5 - fx) * altoVista * aspecto
        const yMira = enfoque.alto * 0.5
        o.ojo.set(px + desplazamiento, yMira + 0.4, pz + d)
        o.mira.set(px + desplazamiento, yMira, pz)
      } else {
        // Celular: se aleja lo justo para ver el equipo con su nota arriba.
        const fraccion = THREE.MathUtils.clamp(400 / size.height, 0.5, 0.78)
        const d = Math.max(3.9, ((enfoque.y / (1 - fraccion)) / (2 * Math.tan(THREE.MathUtils.degToRad(22.5)))) * 0.92)
        const alto = 2 * d * Math.tan(THREE.MathUtils.degToRad(22.5))
        const yMira = enfoque.y + (fraccion - 0.5) * alto
        o.ojo.set(px, yMira + 0.45, pz + d)
        o.mira.set(px, yMira, pz)
      }
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
  }, [punto, enfoque, aspecto, size.height, size.width, puntos])

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
    // Si el navegador toma el gesto para desplazar la página (touch-action: pan-y), llega pointercancel.
    dom.addEventListener('pointerdown', abajo)
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', arriba)
    window.addEventListener('pointercancel', arriba)
    return () => {
      dom.removeEventListener('pointerdown', abajo)
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', arriba)
      window.removeEventListener('pointercancel', arriba)
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
  plano: idPlano = 'general',
}: {
  /** Distribución del consultorio (odontología y baja complejidad, u oncología). */
  plano?: PlanoId
  equipos: EquipoSala[]
  seleccionadoId: string | null
  onSeleccionar: (id: string | null) => void
  punto: PuntoVista
  onPunto: (p: PuntoVista) => void
  /** Elemento HTML de la nota flotante: se mueve hasta el equipo seleccionado. */
  notaRef: RefObject<HTMLDivElement | null>
}) {
  const plano = PLANOS[idPlano]
  const puntos = useMemo(() => puntosDe(plano), [plano])
  const colocados = useMemo(() => colocarEquipos(equipos, plano), [equipos, plano])
  const seleccionado = colocados.find((c) => c.equipo.id === seleccionadoId)
  const anclas = useMemo(() => (seleccionado ? anclasDeEquipo(seleccionado) : null), [seleccionado])
  const enfoque = useMemo(() => (seleccionado && anclas ? { pos: seleccionado.pos, y: anclas.arriba[1], alto: anclas.alto } : null), [seleccionado, anclas])

  const [movil] = useState(esMovil)

  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={movil ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: 45, near: 0.1, far: 90, position: puntos[0].ojo }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.85 }}
      onPointerMissed={() => onSeleccionar(null)}
      // En celulares el gesto horizontal gira la vista y el vertical desplaza la página: el visor no "atrapa" el scroll.
      style={{ touchAction: 'pan-y' }}
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
        shadow-mapSize={movil ? [1536, 1536] : [3072, 3072]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-camera-near={1}
        shadow-camera-far={42}
      />
      <Camara punto={punto} enfoque={enfoque} puntos={puntos} />
      <SeguirAncla pos={anclas ? anclas.lateral : null} posVertical={anclas ? anclas.arriba : null} notaRef={notaRef} />
      {plano.id === 'oncologia' ? <EstructuraOncologia plano={plano} /> : <EstructuraGeneral plano={plano} />}
      {puntos.filter((p) => p.id !== 'general' && p.id !== punto).map((p) => (
        <Marcador key={p.id} punto={p} onIr={onPunto} />
      ))}
      {colocados.map((c) => (
        <EquipoEnSala key={c.equipo.id} colocado={c} seleccionado={c.equipo.id === seleccionadoId} onSeleccionar={onSeleccionar} />
      ))}
    </Canvas>
  )
}
