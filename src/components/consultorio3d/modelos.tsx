import type { ComponentType } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

import type { TipoModelo } from './catalogo'

/**
 * Geometría de los equipos: cajas con bordes redondeados, materiales físicos (acero, plástico con
 * barniz, goma, vidrio) y reflejos del entorno. Medidas aproximadas en metros; el origen está en el
 * centro de la base, apoyado en el piso (y = 0). Son representaciones ilustrativas, no marcas exactas.
 */

type V3 = [number, number, number]

// -- materiales compartidos ---------------------------------------------------------

const MAT = {
  blanco: new THREE.MeshPhysicalMaterial({ color: '#f1f4f6', roughness: 0.34, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.22 }),
  hueso: new THREE.MeshPhysicalMaterial({ color: '#e4e9ec', roughness: 0.4, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
  acero: new THREE.MeshStandardMaterial({ color: '#cdd5db', roughness: 0.3, metalness: 0.92 }),
  cromo: new THREE.MeshStandardMaterial({ color: '#eef2f4', roughness: 0.12, metalness: 1 }),
  gris: new THREE.MeshStandardMaterial({ color: '#7f8f9a', roughness: 0.45, metalness: 0.35 }),
  oscuro: new THREE.MeshStandardMaterial({ color: '#27343e', roughness: 0.5, metalness: 0.25 }),
  goma: new THREE.MeshStandardMaterial({ color: '#1b2329', roughness: 0.88, metalness: 0 }),
  tapiz: new THREE.MeshPhysicalMaterial({ color: '#2b5a8f', roughness: 0.62, metalness: 0, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color('#9db7d4') }),
  teal: new THREE.MeshPhysicalMaterial({ color: '#0f8fa3', roughness: 0.32, metalness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
  vidrio: new THREE.MeshPhysicalMaterial({ color: '#d7eef5', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.28, depthWrite: false }),
}
export type Mat = keyof typeof MAT

const pantallas = new Map<string, THREE.MeshStandardMaterial>()
function pantalla(color: string) {
  let m = pantallas.get(color)
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: '#06151d', roughness: 0.14, metalness: 0.3, emissive: new THREE.Color(color), emissiveIntensity: 0.85 })
    pantallas.set(color, m)
  }
  return m
}

// -- piezas -------------------------------------------------------------------------

const cajas = new Map<string, RoundedBoxGeometry>()
function geoCaja(s: V3, r: number) {
  const radio = Math.max(0.001, Math.min(r, Math.min(...s) / 2 - 0.0005))
  const clave = `${s.join(',')}|${radio}`
  let g = cajas.get(clave)
  if (!g) {
    g = new RoundedBoxGeometry(s[0], s[1], s[2], 3, radio)
    cajas.set(clave, g)
  }
  return g
}

export function Caja({ s, p, m = 'blanco', r = 0.014, rot, luz }: { s: V3; p: V3; m?: Mat; r?: number; rot?: V3; luz?: string }) {
  return <mesh position={p} rotation={rot} geometry={geoCaja(s, r)} material={luz ? pantalla(luz) : MAT[m]} castShadow receiveShadow />
}

export function Cil({ r, h, p, m = 'blanco', rot, seg = 40, r2 }: { r: number; h: number; p: V3; m?: Mat; rot?: V3; seg?: number; r2?: number }) {
  return (
    <mesh position={p} rotation={rot} material={MAT[m]} castShadow receiveShadow>
      <cylinderGeometry args={[r2 ?? r, r, h, seg]} />
    </mesh>
  )
}

function Esfera({ r, p, m = 'blanco' }: { r: number; p: V3; m?: Mat }) {
  return (
    <mesh position={p} material={MAT[m]} castShadow>
      <sphereGeometry args={[r, 24, 18]} />
    </mesh>
  )
}

// -- modelos ------------------------------------------------------------------------

function Autoclave() {
  return (
    <group>
      <Caja s={[0.52, 0.37, 0.46]} p={[0, 0.2, 0]} m="acero" r={0.025} />
      <Caja s={[0.5, 0.05, 0.44]} p={[0, 0.405, 0]} m="blanco" r={0.02} />
      {/* puerta con ventana circular */}
      <Caja s={[0.42, 0.3, 0.025]} p={[0, 0.2, 0.236]} m="oscuro" r={0.012} />
      <Cil r={0.15} h={0.03} p={[0, 0.2, 0.25]} m="cromo" rot={[Math.PI / 2, 0, 0]} />
      <Cil r={0.115} h={0.034} p={[0, 0.2, 0.252]} m="goma" rot={[Math.PI / 2, 0, 0]} />
      <Cil r={0.1} h={0.036} p={[0, 0.2, 0.254]} m="vidrio" rot={[Math.PI / 2, 0, 0]} />
      {/* panel y perilla de cierre */}
      <Caja s={[0.22, 0.085, 0.02]} p={[0, 0.372, 0.236]} luz="#2dd4bf" r={0.008} />
      <Cil r={0.02} h={0.035} p={[0.17, 0.335, 0.252]} m="cromo" rot={[Math.PI / 2, 0, 0]} />
      <Caja s={[0.46, 0.02, 0.01]} p={[0, 0.045, 0.24]} m="teal" r={0.005} />
      {/* rejillas laterales y patas */}
      {[-0.07, -0.035, 0, 0.035, 0.07].map((y) => (
        <Caja key={y} s={[0.004, 0.012, 0.26]} p={[0.262, 0.2 + y, 0]} m="goma" r={0.002} />
      ))}
      {[-0.22, 0.22].flatMap((x) => [-0.18, 0.18].map((z) => <Cil key={`${x}${z}`} r={0.028} h={0.02} p={[x, 0.008, z]} m="goma" />))}
    </group>
  )
}

function UnidadOdontologica() {
  return (
    <group>
      {/* base y columna */}
      <Cil r={0.32} h={0.05} p={[0, 0.025, 0]} m="oscuro" />
      <Cil r={0.22} h={0.08} p={[0, 0.09, 0]} m="blanco" r2={0.17} />
      <Cil r={0.07} h={0.36} p={[0, 0.3, 0]} m="acero" />
      {/* asiento, respaldo, cabecero, apoyapiés */}
      <Caja s={[0.58, 0.14, 0.62]} p={[0, 0.5, 0.1]} m="tapiz" r={0.05} />
      <Caja s={[0.54, 0.82, 0.12]} p={[0, 0.85, -0.38]} m="tapiz" r={0.05} rot={[-0.55, 0, 0]} />
      <Caja s={[0.3, 0.22, 0.12]} p={[0, 1.3, -0.66]} m="tapiz" r={0.05} rot={[-0.55, 0, 0]} />
      <Caja s={[0.4, 0.07, 0.32]} p={[0, 0.36, 0.55]} m="tapiz" r={0.03} rot={[0.35, 0, 0]} />
      <Caja s={[0.08, 0.05, 0.4]} p={[0.32, 0.64, 0.05]} m="blanco" r={0.02} />
      {/* columna y brazo de la lámpara */}
      <Cil r={0.03} h={1.5} p={[0.6, 0.78, -0.35]} m="blanco" />
      <Caja s={[0.7, 0.045, 0.045]} p={[0.28, 1.5, -0.35]} m="blanco" r={0.02} />
      <Caja s={[0.38, 0.07, 0.22]} p={[-0.08, 1.46, -0.35]} m="blanco" r={0.03} />
      <Caja s={[0.32, 0.012, 0.16]} p={[-0.08, 1.42, -0.35]} luz="#fde68a" r={0.004} />
      {/* módulo de instrumentos con mangueras */}
      <Caja s={[0.42, 0.1, 0.3]} p={[0.62, 0.95, 0.15]} m="acero" r={0.03} />
      <Cil r={0.02} h={0.02} p={[0.62, 1.01, 0.15]} m="gris" />
      {[-0.12, 0, 0.12].map((dx, i) => (
        <Cil key={i} r={0.012} h={0.32} p={[0.62 + dx, 0.78, 0.2]} m="goma" rot={[0, 0, dx * 3]} />
      ))}
      <Cil r={0.05} h={0.04} p={[0.62, 0.64, -0.1]} m="teal" r2={0.07} />
    </group>
  )
}

function RayosX() {
  return (
    <group>
      <Cil r={0.3} h={0.05} p={[0, 0.025, 0]} m="oscuro" />
      <Cil r={0.2} h={0.04} p={[0, 0.07, 0]} m="blanco" r2={0.14} />
      <Cil r={0.05} h={1.5} p={[0, 0.78, 0]} m="blanco" />
      <Caja s={[0.9, 0.07, 0.07]} p={[0.35, 1.5, 0]} m="blanco" r={0.025} />
      <Caja s={[0.16, 0.16, 0.16]} p={[0.8, 1.5, 0]} m="blanco" r={0.04} />
      <Cil r={0.09} h={0.26} p={[0.9, 1.5, 0]} m="acero" rot={[0, 0, Math.PI / 2]} />
      <Cil r={0.05} h={0.12} p={[1.06, 1.5, 0]} m="goma" rot={[0, 0, Math.PI / 2]} />
      <Cil r={0.035} h={0.02} p={[1.125, 1.5, 0]} m="vidrio" rot={[0, 0, Math.PI / 2]} />
      <Caja s={[0.22, 0.14, 0.05]} p={[0.1, 1.12, 0.07]} luz="#22d3ee" r={0.015} />
      <Caja s={[0.2, 0.18, 0.015]} p={[0.1, 1.12, 0.045]} m="oscuro" r={0.01} />
      <Cil r={0.035} h={0.06} p={[0, 1.55, 0.04]} m="gris" rot={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

function Compresor() {
  return (
    <group>
      <Cil r={0.2} h={0.7} p={[0, 0.42, 0]} m="blanco" rot={[0, 0, Math.PI / 2]} />
      <Esfera r={0.2} p={[0.35, 0.42, 0]} m="blanco" />
      <Esfera r={0.2} p={[-0.35, 0.42, 0]} m="blanco" />
      <Caja s={[0.86, 0.05, 0.4]} p={[0, 0.2, 0]} m="gris" r={0.02} />
      <Caja s={[0.26, 0.2, 0.24]} p={[0, 0.74, 0]} m="teal" r={0.05} />
      <Cil r={0.07} h={0.04} p={[0.24, 0.68, 0.12]} m="oscuro" rot={[Math.PI / 2, 0, 0]} />
      <Cil r={0.055} h={0.045} p={[0.24, 0.68, 0.125]} m="vidrio" rot={[Math.PI / 2, 0, 0]} />
      <Cil r={0.015} h={0.06} p={[-0.3, 0.66, 0.1]} m="cromo" />
      {[-0.32, 0.32].map((x) => (
        <Cil key={x} r={0.06} h={0.07} p={[x, 0.035, 0.18]} m="goma" />
      ))}
    </group>
  )
}

function Monitor() {
  return (
    <group>
      <Cil r={0.28} h={0.04} p={[0, 0.02, 0]} m="oscuro" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Caja key={i} s={[0.28, 0.025, 0.04]} p={[Math.sin((i * 2 * Math.PI) / 5) * 0.18, 0.012, Math.cos((i * 2 * Math.PI) / 5) * 0.18]} m="gris" rot={[0, (i * 2 * Math.PI) / 5, 0]} r={0.01} />
      ))}
      <Cil r={0.04} h={1.05} p={[0, 0.56, 0]} m="acero" />
      <Caja s={[0.44, 0.32, 0.075]} p={[0, 1.2, 0]} m="blanco" r={0.03} />
      <Caja s={[0.37, 0.24, 0.01]} p={[0, 1.2, 0.04]} luz="#10b981" r={0.006} />
      <Caja s={[0.3, 0.012, 0.004]} p={[0, 1.255, 0.047]} luz="#34d399" r={0.002} />
      <Caja s={[0.3, 0.012, 0.004]} p={[0, 1.2, 0.047]} luz="#fbbf24" r={0.002} />
      <Caja s={[0.3, 0.012, 0.004]} p={[0, 1.145, 0.047]} luz="#38bdf8" r={0.002} />
      <Cil r={0.008} h={0.5} p={[0.26, 0.85, 0.05]} m="goma" rot={[0, 0, 0.3]} />
      <Cil r={0.008} h={0.5} p={[-0.26, 0.85, 0.05]} m="goma" rot={[0, 0, -0.3]} />
      <Cil r={0.018} h={0.06} p={[0.31, 0.6, 0.05]} m="teal" />
    </group>
  )
}

function Bascula() {
  return (
    <group>
      <Caja s={[0.44, 0.05, 0.38]} p={[0, 0.03, 0.05]} m="oscuro" r={0.02} />
      <Caja s={[0.4, 0.015, 0.34]} p={[0, 0.062, 0.05]} m="acero" r={0.01} />
      <Caja s={[0.06, 1.45, 0.06]} p={[0, 0.78, -0.18]} m="blanco" r={0.02} />
      <Caja s={[0.26, 0.12, 0.06]} p={[0, 1.4, -0.12]} m="blanco" r={0.03} />
      <Caja s={[0.2, 0.06, 0.006]} p={[0, 1.4, -0.088]} luz="#22d3ee" r={0.003} />
      <Caja s={[0.2, 0.025, 0.14]} p={[0, 1.1, -0.1]} m="teal" r={0.01} />
      {[0.4, 0.7, 1.0, 1.3].map((y) => (
        <Caja key={y} s={[0.025, 0.004, 0.004]} p={[0.032, y, -0.148]} m="goma" r={0.001} />
      ))}
    </group>
  )
}

function Centrifuga() {
  return (
    <group>
      <Caja s={[0.46, 0.26, 0.42]} p={[0, 0.13, 0]} m="blanco" r={0.035} />
      <Cil r={0.205} h={0.08} p={[0, 0.3, 0]} m="acero" />
      <Cil r={0.16} h={0.03} p={[0, 0.352, 0]} m="vidrio" />
      <Cil r={0.14} h={0.016} p={[0, 0.34, 0]} m="oscuro" />
      <Caja s={[0.18, 0.07, 0.02]} p={[0, 0.1, 0.215]} luz="#14b8a6" r={0.008} />
      <Cil r={0.022} h={0.03} p={[0.17, 0.1, 0.22]} m="cromo" rot={[Math.PI / 2, 0, 0]} />
      <Cil r={0.022} h={0.03} p={[-0.17, 0.1, 0.22]} m="gris" rot={[Math.PI / 2, 0, 0]} />
      {[-0.19, 0.19].flatMap((x) => [-0.17, 0.17].map((z) => <Cil key={`${x}${z}`} r={0.02} h={0.012} p={[x, 0.004, z]} m="goma" />))}
    </group>
  )
}

function Microscopio() {
  return (
    <group>
      <Caja s={[0.2, 0.045, 0.26]} p={[0, 0.022, 0]} m="oscuro" r={0.02} />
      <Caja s={[0.05, 0.3, 0.05]} p={[0, 0.19, -0.09]} m="blanco" r={0.02} />
      <Caja s={[0.06, 0.06, 0.24]} p={[0, 0.34, -0.02]} m="blanco" r={0.025} rot={[0.5, 0, 0]} />
      <Cil r={0.02} h={0.12} p={[-0.025, 0.42, 0.06]} m="oscuro" rot={[-0.5, 0, 0]} />
      <Cil r={0.02} h={0.12} p={[0.025, 0.42, 0.06]} m="oscuro" rot={[-0.5, 0, 0]} />
      <Cil r={0.024} h={0.012} p={[-0.025, 0.47, 0.085]} m="goma" rot={[-0.5, 0, 0]} />
      <Cil r={0.024} h={0.012} p={[0.025, 0.47, 0.085]} m="goma" rot={[-0.5, 0, 0]} />
      <Caja s={[0.17, 0.012, 0.15]} p={[0, 0.2, 0.02]} m="gris" r={0.005} />
      <Cil r={0.014} h={0.07} p={[0, 0.265, 0.03]} m="cromo" />
      <Cil r={0.014} h={0.06} p={[0.03, 0.265, 0.03]} m="acero" />
      <Cil r={0.014} h={0.06} p={[-0.03, 0.265, 0.03]} m="acero" />
      <Cil r={0.016} h={0.02} p={[0.045, 0.14, -0.09]} m="cromo" rot={[0, 0, Math.PI / 2]} />
    </group>
  )
}

function Ecografo() {
  return (
    <group>
      <Caja s={[0.52, 0.05, 0.46]} p={[0, 0.12, 0]} m="gris" r={0.02} />
      <Caja s={[0.1, 0.8, 0.1]} p={[-0.1, 0.55, -0.05]} m="blanco" r={0.03} />
      <Caja s={[0.46, 0.34, 0.055]} p={[-0.02, 1.15, -0.02]} m="blanco" r={0.025} rot={[-0.15, 0, 0]} />
      <Caja s={[0.4, 0.27, 0.01]} p={[-0.02, 1.15, 0.012]} luz="#38bdf8" r={0.004} rot={[-0.15, 0, 0]} />
      <Caja s={[0.44, 0.04, 0.22]} p={[0, 0.82, 0.12]} m="blanco" r={0.02} />
      <Caja s={[0.36, 0.006, 0.12]} p={[0, 0.845, 0.12]} m="oscuro" r={0.003} />
      <Cil r={0.03} h={0.14} p={[0.28, 0.86, 0.14]} m="goma" rot={[0.3, 0, 0.3]} />
      <Cil r={0.006} h={0.4} p={[0.34, 0.74, 0.12]} m="goma" rot={[0, 0, 0.1]} />
      {[-0.2, 0.2].map((x) => (
        <group key={x}>
          <Cil r={0.045} h={0.045} p={[x, 0.05, 0.15]} m="goma" rot={[0, 0, Math.PI / 2]} />
          <Cil r={0.045} h={0.045} p={[x, 0.05, -0.15]} m="goma" rot={[0, 0, Math.PI / 2]} />
        </group>
      ))}
    </group>
  )
}

function Camilla() {
  return (
    <group>
      <Caja s={[0.7, 0.14, 1.45]} p={[0, 0.62, 0.2]} m="tapiz" r={0.05} />
      <Caja s={[0.7, 0.14, 0.5]} p={[0, 0.78, -0.72]} m="tapiz" r={0.05} rot={[-0.4, 0, 0]} />
      <Caja s={[0.5, 0.1, 0.8]} p={[0, 0.3, 0.2]} m="gris" r={0.03} />
      <Caja s={[0.62, 0.05, 1]} p={[0, 0.03, 0.2]} m="oscuro" r={0.02} />
      {[-0.28, 0.28].flatMap((x) => [-0.2, 0.6].map((z) => <Cil key={`${x}${z}`} r={0.035} h={0.06} p={[x, 0.03, z]} m="goma" rot={[0, 0, Math.PI / 2]} />))}
    </group>
  )
}

function Balanza() {
  return (
    <group>
      <Caja s={[0.2, 0.07, 0.3]} p={[0, 0.035, 0]} m="blanco" r={0.025} />
      <Caja s={[0.14, 0.03, 0.05]} p={[0, 0.05, 0.14]} luz="#22d3ee" r={0.006} />
      <Caja s={[0.17, 0.2, 0.17]} p={[0, 0.17, -0.04]} m="vidrio" r={0.006} />
      <Cil r={0.05} h={0.012} p={[0, 0.088, -0.04]} m="cromo" />
      <Cil r={0.008} h={0.02} p={[0, 0.078, -0.04]} m="acero" />
    </group>
  )
}

function Generico() {
  return (
    <group>
      <Caja s={[0.42, 0.28, 0.34]} p={[0, 0.14, 0]} m="blanco" r={0.04} />
      <Caja s={[0.2, 0.1, 0.012]} p={[0, 0.2, 0.172]} luz="#14b8a6" r={0.006} />
      <Cil r={0.025} h={0.025} p={[-0.14, 0.08, 0.175]} m="cromo" rot={[Math.PI / 2, 0, 0]} />
      <Cil r={0.025} h={0.025} p={[0.14, 0.08, 0.175]} m="gris" rot={[Math.PI / 2, 0, 0]} />
      {[-0.17, 0.17].flatMap((x) => [-0.12, 0.12].map((z) => <Cil key={`${x}${z}`} r={0.02} h={0.012} p={[x, 0.004, z]} m="goma" />))}
    </group>
  )
}

export const COMPONENTES: Record<TipoModelo, ComponentType> = {
  autoclave: Autoclave,
  'unidad-odontologica': UnidadOdontologica,
  'rayos-x': RayosX,
  compresor: Compresor,
  monitor: Monitor,
  bascula: Bascula,
  centrifuga: Centrifuga,
  microscopio: Microscopio,
  ecografo: Ecografo,
  camilla: Camilla,
  balanza: Balanza,
  generico: Generico,
}
