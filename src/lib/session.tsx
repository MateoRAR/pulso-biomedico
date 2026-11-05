import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import type { Rol, Usuario } from '@/data/tipos'

/**
 * La sesión guarda quién entró. Las cuentas viven en el service de usuarios (la "base de
 * datos" JSON + copia de sesión), y la sesión en `sessionStorage`: al cerrar la pestaña
 * se pierde todo lo creado.
 */

export interface Sesion {
  rol: Rol
  nombre: string
  email: string
  organizacion?: string
  usuarioId: string
  /** Cuenta que viene de los JSON de demostración (no creada al registrarse). */
  demo: boolean
  consultorioId?: string
  ingenieroId?: string
}

export interface CuentaDemo {
  rol: Rol
  email: string
  password: string
}

// Cuentas de demostración publicadas en la pantalla de ingreso (existen también en usuarios.json).
export const CUENTAS_DEMO: CuentaDemo[] = [
  { rol: 'consultorio', email: 'consultorio@pulso.co', password: 'pulso123' },
  { rol: 'ingeniero', email: 'ingeniero@pulso.co', password: 'pulso123' },
  { rol: 'admin', email: 'admin@pulso.co', password: 'pulso123' },
]

export const etiquetaRol: Record<Rol, string> = {
  consultorio: 'Consultorio',
  ingeniero: 'Ingeniero biomédico',
  admin: 'Administración Pulso',
}

export const rutaInicioPorRol: Record<Rol, string> = {
  consultorio: '/consultorio',
  ingeniero: '/ingeniero',
  admin: '/admin',
}

const CLAVE_SESION = 'pulso.session.v4'

// Versiones anteriores guardaban todo en localStorage; se limpia al arrancar.
const CLAVES_LEGADO = ['pulso.session.v2', 'pulso.data.v2']

export function sesionDeUsuario(usuario: Usuario): Sesion {
  return {
    rol: usuario.rol,
    nombre: usuario.nombre,
    email: usuario.email,
    organizacion: usuario.organizacion,
    usuarioId: usuario.id,
    demo: usuario.origen === 'demo',
    consultorioId: usuario.consultorioId,
    ingenieroId: usuario.ingenieroId,
  }
}

function leerSesion(): Sesion | null {
  try {
    CLAVES_LEGADO.forEach((clave) => window.localStorage.removeItem(clave))
    const crudo = window.sessionStorage.getItem(CLAVE_SESION)
    return crudo ? (JSON.parse(crudo) as Sesion) : null
  } catch {
    return null
  }
}

interface SessionContextValue {
  sesion: Sesion | null
  /** Abre la sesión de un usuario ya validado (ver `useAutenticacion`). */
  abrirSesion: (sesion: Sesion) => void
  cerrarSesion: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(() => (typeof window === 'undefined' ? null : leerSesion()))

  useEffect(() => {
    try {
      if (sesion) window.sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
      else window.sessionStorage.removeItem(CLAVE_SESION)
    } catch {
      // sin almacenamiento: la sesión vive en memoria
    }
  }, [sesion])

  const abrirSesion = useCallback((nueva: Sesion) => setSesion(nueva), [])
  const cerrarSesion = useCallback(() => setSesion(null), [])

  const value = useMemo(() => ({ sesion, abrirSesion, cerrarSesion }), [sesion, abrirSesion, cerrarSesion])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession debe usarse dentro de <SessionProvider>')
  return context
}
