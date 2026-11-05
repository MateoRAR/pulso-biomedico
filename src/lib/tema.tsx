import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type Tema = 'claro' | 'oscuro'

const CLAVE = 'pulso.tema.v3'

interface TemaContextValue {
  tema: Tema
  alternar: () => void
}

const TemaContext = createContext<TemaContextValue | null>(null)

function inicial(): Tema {
  if (typeof window === 'undefined') return 'claro'
  try {
    const guardado = window.sessionStorage.getItem(CLAVE)
    if (guardado === 'claro' || guardado === 'oscuro') return guardado
  } catch {
    // sin almacenamiento
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
}

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(inicial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
    try {
      window.sessionStorage.setItem(CLAVE, tema)
    } catch {
      // sin almacenamiento
    }
  }, [tema])

  const alternar = useCallback(() => setTema((t) => (t === 'claro' ? 'oscuro' : 'claro')), [])
  const value = useMemo(() => ({ tema, alternar }), [tema, alternar])
  return <TemaContext.Provider value={value}>{children}</TemaContext.Provider>
}

export function useTema(): TemaContextValue {
  const context = useContext(TemaContext)
  if (!context) throw new Error('useTema debe usarse dentro de <TemaProvider>')
  return context
}
