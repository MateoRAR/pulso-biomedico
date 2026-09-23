import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PublicFooter, PublicHeader } from '@/components/site/PublicLayout'
import { buttonVariants } from '@/components/ui/button'

export function NotFound() {
  return (
    <div className="bg-background text-foreground">
      <PublicHeader />
      <main className="mx-auto flex max-w-3xl flex-col items-center px-5 py-32 text-center">
        <span className="eyebrow">Error 404</span>
        <h1 className="font-display mt-4 text-4xl font-bold">Esta página no existe</h1>
        <p className="mt-3 text-muted-foreground">
          Puede que el enlace haya cambiado. Vuelve al inicio o entra a tu portal.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Link to="/" className={buttonVariants()}>
            <ArrowLeft /> Volver al inicio
          </Link>
          <Link to="/ingresar" className={buttonVariants({ variant: 'outline' })}>
            Iniciar sesión
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
