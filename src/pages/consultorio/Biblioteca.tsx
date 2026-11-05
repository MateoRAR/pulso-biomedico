import { ArrowRight, Box } from 'lucide-react'
import { Link } from 'react-router-dom'

import { MODELOS, ORDEN_BIBLIOTECA } from '@/components/consultorio3d/catalogo'
import { PageHeader } from '@/components/shared/ui'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useData } from '@/lib/store'
import { tipoModeloDe } from '@/components/consultorio3d/catalogo'

/** Biblioteca de equipos biomédicos: cada tipo se puede explorar en 3D. */
export function ConsultorioBiblioteca() {
  const { equipos } = useData()
  const propios = new Set(equipos.map((e) => tipoModeloDe(e)))

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Biblioteca"
        titulo="Biblioteca de equipos"
        descripcion="Conoce cómo es por dentro y por fuera cada tipo de equipo. Son representaciones ilustrativas: sirven para entender las partes, no para identificar una marca."
        acciones={
          <Link to="/consultorio/equipos" className={buttonVariants({ variant: 'outline' })}>
            <Box /> Mis equipos en 3D
          </Link>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ORDEN_BIBLIOTECA.map((id) => {
          const def = MODELOS[id]
          const resumen = def.resumen.split('. ')[0] + '.'
          return (
            <Card key={id} className="flex flex-col border-border/80">
              <CardHeader>
                <CardTitle className="font-display text-xl">{def.nombre}</CardTitle>
                {propios.has(id) && <p className="text-sm font-semibold text-primary">Tienes uno en tu consultorio</p>}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-5">
                <p className="text-base leading-7 text-muted-foreground">{resumen}</p>
                <Link to={`/consultorio/biblioteca/${id}`} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                  Explorar <ArrowRight />
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
