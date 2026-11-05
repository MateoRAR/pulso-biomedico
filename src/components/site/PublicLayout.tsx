import { ArrowRight, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { BotonTema } from '@/components/shared/BotonTema'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { rutaInicioPorRol, useSession } from '@/lib/session'

// Secciones del landing (anclas), en el mismo orden en que aparecen.
// Cubren los dos lados de la plataforma: consultorios (demanda) e ingenieros (oferta).
export const enlacesPublicos = [
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/#consultorios', label: 'Para consultorios' },
  { href: '/#profesionales', label: 'Para ingenieros' },
  { href: '/#planes', label: 'Planes' },
  { href: '/#preguntas', label: 'Preguntas' },
]

export function Brand({ className, claro = false }: { className?: string; claro?: boolean }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)} aria-label="Pulso Biomédico, inicio">
      <span className="grid size-8 place-items-center rounded-lg bg-white shadow-sm">
        <img src="/logo.png" alt="" className="size-7 rounded-md object-contain" />
      </span>
      <span className={cn('font-display text-base font-bold', claro ? 'text-white' : 'text-foreground')}>
        Pulso <span className={claro ? 'text-seafoam' : 'text-primary'}>Biomédico</span>
      </span>
    </Link>
  )
}

/**
 * Barra superior. Con `sobreOscuro` (la portada) arranca transparente con letras claras y se vuelve
 * sólida al bajar, para que siempre se lea.
 */
export function PublicHeader({ sobreOscuro = false }: { sobreOscuro?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [arriba, setArriba] = useState(true)
  const { sesion, cerrarSesion } = useSession()

  useEffect(() => {
    const revisar = () => setArriba(window.scrollY < 24)
    revisar()
    window.addEventListener('scroll', revisar, { passive: true })
    return () => window.removeEventListener('scroll', revisar)
  }, [])

  const claro = sobreOscuro && arriba && !menuOpen

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        claro ? 'border-b border-transparent bg-transparent' : 'border-b border-border/60 bg-background/90 backdrop-blur-xl',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Brand claro={claro} />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {enlacesPublicos.map((enlace) => (
            <a
              key={enlace.href}
              href={enlace.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                claro ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {enlace.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <BotonTema className={claro ? 'text-white hover:bg-white/10 hover:text-white' : undefined} />
          {sesion ? (
            <>
              <Link to={rutaInicioPorRol[sesion.rol]} className={buttonVariants({ variant: claro ? 'outline' : 'default' })}>
                Ir a mi portal
              </Link>
              <Button variant="ghost" size="icon" aria-label="Cerrar sesión" onClick={cerrarSesion} className={claro ? 'text-white hover:bg-white/10 hover:text-white' : undefined}>
                <LogOut />
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/ingresar"
                className={cn(buttonVariants({ variant: 'ghost' }), claro && 'text-white hover:bg-white/10 hover:text-white')}
              >
                Iniciar sesión
              </Link>
              <Link to="/registro" className={buttonVariants()}>
                Crear cuenta <ArrowRight />
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 lg:hidden">
          <BotonTema className={claro ? 'text-white hover:bg-white/10 hover:text-white' : undefined} />
          <Button
            variant="ghost"
            size="icon"
            className={claro ? 'text-white hover:bg-white/10 hover:text-white' : undefined}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {menuOpen && (
        <nav className="animate-fade-in border-t border-border bg-background px-5 py-4 lg:hidden" aria-label="Navegación móvil">
          <div className="flex flex-col gap-1">
            {enlacesPublicos.map((enlace) => (
              <a key={enlace.href} href={enlace.href} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-3 text-base font-medium hover:bg-accent">
                {enlace.label}
              </a>
            ))}
            <div className="mt-3 grid gap-2">
              {sesion ? (
                <Link to={rutaInicioPorRol[sesion.rol]} onClick={() => setMenuOpen(false)} className={buttonVariants({ size: 'lg' })}>
                  Ir a mi portal
                </Link>
              ) : (
                <>
                  <Link to="/registro" onClick={() => setMenuOpen(false)} className={buttonVariants({ size: 'lg' })}>
                    Crear cuenta
                  </Link>
                  <Link to="/ingresar" onClick={() => setMenuOpen(false)} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Brand />
            <p className="max-w-xs leading-6">Ingeniería biomédica coordinada para consultorios y prestadores de baja complejidad.</p>
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Plataforma</p>
            {enlacesPublicos.map((enlace) => (
              <a key={enlace.href} href={enlace.href} className="block hover:text-primary">
                {enlace.label}
              </a>
            ))}
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Cuenta</p>
            <Link to="/registro" className="block hover:text-primary">
              Crear cuenta
            </Link>
            <Link to="/ingresar" className="block hover:text-primary">
              Iniciar sesión
            </Link>
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Contacto</p>
            <a href="mailto:contacto@pulsobiomedico.co" className="block hover:text-primary">
              contacto@pulsobiomedico.co
            </a>
            <p>Santiago de Cali, Colombia</p>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Pulso Biomédico</p>
          <p>Prototipo de demostración: los datos de ejemplo son ficticios.</p>
        </div>
      </div>
    </footer>
  )
}
