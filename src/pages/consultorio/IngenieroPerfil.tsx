import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/shared/ui'
import { PerfilIngenieroVista } from '@/components/shared/PerfilIngenieroVista'
import { buttonVariants } from '@/components/ui/button'
import { useData } from '@/lib/store'

/** Perfil de un ingeniero dentro del espacio del consultorio (sin salir del portal). */
export function ConsultorioIngenieroPerfil() {
  const { slug } = useParams()
  const { ingenieros } = useData()
  const ingeniero = ingenieros.find((i) => i.slug === slug)

  if (!ingeniero) {
    return (
      <div className="space-y-6">
        <PageHeader titulo="No encontramos a este ingeniero" descripcion="Puede que ya no esté en la red. Vuelve a la lista para ver a los demás." />
        <Link to="/consultorio/ingenieros" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
          <ArrowLeft /> Volver a Encontrar ingeniero
        </Link>
      </div>
    )
  }

  return (
    <div className="-mx-5 -mt-8 lg:-mx-8">
      <PerfilIngenieroVista ingeniero={ingeniero} enPortal />
    </div>
  )
}
