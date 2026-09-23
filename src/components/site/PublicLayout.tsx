import { ArrowRight, HeartPulse, LogOut, Menu, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { rutaInicioPorRol, useSession } from '@/lib/session'

// Secciones del landing (anclas), no rutas aparte: el landing integra todo.
export const enlacesPublicos = [
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/#planes', label: 'Planes y precios' },
  { href: '/#profesionales', label: 'Para ingenieros' },
]

export function Brand({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)} aria-label="Pulso Biomédico, inicio">
      <span className="brand-mark">
        <HeartPulse aria-hidden="true" />
      </span>
      <span className="font-display text-lg font-bold text-foreground">
        Pulso <span className="text-primary">Biomédico</span>
      </span>
    </Link>
  )
}

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { sesion, cerrarSesion } = useSession()

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
          {enlacesPublicos.map((enlace) => (
            <a key={enlace.href} href={enlace.href} className="nav-link">
              {enlace.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {sesion ? (
            <>
              <Link to={rutaInicioPorRol[sesion.rol]} className={buttonVariants({ variant: 'ghost' })}>
                Ir a mi portal
              </Link>
              <Button variant="outline" size="icon" aria-label="Cerrar sesión" onClick={cerrarSesion}>
                <LogOut />
              </Button>
            </>
          ) : (
            <>
              <Link to="/ingresar" className={buttonVariants({ variant: 'ghost' })}>
                Iniciar sesión
              </Link>
              <Link to="/registro" className={cn(buttonVariants(), 'shadow-ocean')}>
                Crear cuenta <ArrowRight />
              </Link>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </div>
      {menuOpen && (
        <nav className="animate-fade-in border-t border-border bg-background px-5 py-5 md:hidden" aria-label="Navegación móvil">
          <div className="flex flex-col gap-1">
            {enlacesPublicos.map((enlace) => (
              <a
                key={enlace.href}
                href={enlace.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-3 font-medium hover:bg-accent"
              >
                {enlace.label}
              </a>
            ))}
            <div className="mt-3 grid gap-2">
              {sesion ? (
                <Link
                  to={rutaInicioPorRol[sesion.rol]}
                  onClick={() => setMenuOpen(false)}
                  className={buttonVariants()}
                >
                  Ir a mi portal
                </Link>
              ) : (
                <>
                  <Link to="/ingresar" onClick={() => setMenuOpen(false)} className={buttonVariants({ variant: 'outline' })}>
                    Iniciar sesión
                  </Link>
                  <Link to="/registro" onClick={() => setMenuOpen(false)} className={buttonVariants()}>
                    Crear cuenta
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
    <footer className="border-t border-border py-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <Brand />
          <p>Ingeniería biomédica coordinada para consultorios y prestadores de baja complejidad.</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground">Servicio</p>
          {enlacesPublicos.map((enlace) => (
            <a key={enlace.href} href={enlace.href} className="block hover:text-primary">
              {enlace.label}
            </a>
          ))}
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground">Cuenta</p>
          <Link to="/registro" className="block hover:text-primary">
            Crear cuenta
          </Link>
          <Link to="/ingresar" className="block hover:text-primary">
            Iniciar sesión
          </Link>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground">Contacto</p>
          <a href="mailto:contacto@pulsobiomedico.co" className="block hover:text-primary">
            contacto@pulsobiomedico.co
          </a>
          <p>Santiago de Cali, Colombia</p>
          <p>© 2026 Pulso Biomédico</p>
        </div>
      </div>
    </footer>
  )
}

export function PublicPage({
  eyebrow,
  titulo,
  descripcion,
  children,
}: {
  eyebrow: string
  titulo: string
  descripcion: string
  children: ReactNode
}) {
  return (
    <div className="bg-background text-foreground">
      <PublicHeader />
      <main className="pt-16">
        <section className="wave-grid border-b border-border py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <span className="eyebrow">{eyebrow}</span>
            <h1 className="section-title animate-fade-in mt-4">{titulo}</h1>
            <p className="section-copy mt-5">{descripcion}</p>
          </div>
        </section>
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
