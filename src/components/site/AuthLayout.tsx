import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { BotonTema } from '@/components/shared/BotonTema'
import { FondoFibras } from '@/components/site/FondoFibras'

/**
 * Pantalla dividida para ingresar / registrarse. El lado izquierdo es una escena 3D viva
 * que reacciona a lo que haces (cada paso emite una onda desde el núcleo).
 */
export function AuthLayout({
  children,
  titulo,
  mensaje,
}: {
  children: ReactNode
  /** Frase grande del panel izquierdo; cambia con el contexto (p. ej. saluda por nombre). */
  titulo: ReactNode
  mensaje: string
}) {
  return (
    <div className="min-h-svh bg-background text-foreground lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="ocean-band relative hidden min-h-svh overflow-hidden lg:block">
        <FondoFibras />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[oklch(0.17_0.05_225/0.9)] via-[oklch(0.17_0.05_225/0.35)] to-transparent" />
        <div className="pointer-events-none relative z-10 flex min-h-svh flex-col justify-between p-10 xl:p-14">
          <Link to="/" className="pointer-events-auto flex w-fit items-center gap-2.5" aria-label="Pulso Biomédico, inicio">
            <span className="grid size-10 place-items-center rounded-lg bg-white shadow-lg">
              <img src="/logo.png" alt="" className="size-9 rounded-md object-contain" />
            </span>
            <span className="font-display text-lg font-bold text-hero-foreground">
              Pulso <span className="text-seafoam">Biomédico</span>
            </span>
          </Link>

          <div className="max-w-md">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-seafoam">
              Tu espacio en Pulso
            </p>
            <h2 key={`t-${mensaje}`} className="font-display animate-rise mt-4 text-4xl font-bold leading-[1.1] text-hero-foreground xl:text-5xl">
              {titulo}
            </h2>
            <p key={`m-${mensaje}`} className="animate-rise mt-4 text-lg leading-8 text-hero-muted">
              {mensaje}
            </p>
          </div>
        </div>
      </aside>

      <main className="relative flex min-h-svh flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-10">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Volver al inicio
          </Link>
          <BotonTema />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  )
}
