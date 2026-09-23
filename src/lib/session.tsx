import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import type { Rol } from '@/lib/mock/data'

export interface Sesion {
  rol: Rol
  nombre: string
  email: string
  organizacion?: string
}

export interface CuentaDemo extends Sesion {
  password: string
}

// Cuentas mock: el correo decide a qué portal se entra.
export const CUENTAS_DEMO: CuentaDemo[] = [
  {
    rol: 'consultorio',
    nombre: 'Diana Ramírez',
    email: 'consultorio@pulso.co',
    password: 'pulso123',
    organizacion: 'Clínica Odontológica Sanare',
  },
  {
    rol: 'ingeniero',
    nombre: 'Laura Medina',
    email: 'ingeniero@pulso.co',
    password: 'pulso123',
    organizacion: 'Santiago de Cali',
  },
  {
    rol: 'admin',
    nombre: 'Equipo Pulso',
    email: 'admin@pulso.co',
    password: 'pulso123',
    organizacion: 'Pulso Biomédico',
  },
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

const CLAVE = 'pulso.session.v2'

interface SessionContextValue {
  sesion: Sesion | null
  iniciarSesion: (sesion: Sesion) => void
  cerrarSesion: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const crudo = window.localStorage.getItem(CLAVE)
      return crudo ? (JSON.parse(crudo) as Sesion) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (sesion) window.localStorage.setItem(CLAVE, JSON.stringify(sesion))
      else window.localStorage.removeItem(CLAVE)
    } catch {
      // sin almacenamiento: la sesión vive en memoria
    }
  }, [sesion])

  const iniciarSesion = useCallback((nueva: Sesion) => setSesion(nueva), [])
  const cerrarSesion = useCallback(() => setSesion(null), [])

  const value = useMemo(() => ({ sesion, iniciarSesion, cerrarSesion }), [sesion, iniciarSesion, cerrarSesion])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession debe usarse dentro de <SessionProvider>')
  return context
}

export function buscarCuenta(email: string): CuentaDemo | undefined {
  return CUENTAS_DEMO.find((cuenta) => cuenta.email.toLowerCase() === email.trim().toLowerCase())
}
