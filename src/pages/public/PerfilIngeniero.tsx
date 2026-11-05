import { Link, useParams } from 'react-router-dom'

import { PerfilIngenieroVista } from '@/components/shared/PerfilIngenieroVista'
import { PublicFooter, PublicHeader } from '@/components/site/PublicLayout'
import { buttonVariants } from '@/components/ui/button'
import { useData } from '@/lib/store'

/** Perfil público de un ingeniero (con la barra del sitio). Dentro del consultorio se usa otra ruta. */
export function PerfilIngeniero() {
  const { slug } = useParams()
  const { ingenieros } = useData()
  const ingeniero = ingenieros.find((ing) => ing.slug === slug && ing.activo)

  return (
    <div className="bg-background text-foreground">
      <PublicHeader />
      <main className="pt-16">
        {ingeniero ? (
          <PerfilIngenieroVista ingeniero={ingeniero} enPortal={false} />
        ) : (
          <div className="mx-auto max-w-3xl px-5 py-32 text-center">
            <h1 className="font-display text-3xl font-bold">Este perfil no existe</h1>
            <p className="mt-3 text-lg text-muted-foreground">Puede que el enlace esté mal escrito o que el profesional ya no esté en la red.</p>
            <Link to="/" className={`${buttonVariants({ size: 'lg' })} mt-7`}>
              Volver al inicio
            </Link>
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  )
}
