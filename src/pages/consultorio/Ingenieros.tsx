import { DirectorioIngenieros } from '@/components/shared/DirectorioIngenieros'
import { PageHeader } from '@/components/shared/ui'
import { useTiempoEnPagina } from '@/lib/analytics'

export function ConsultorioIngenieros() {
  useTiempoEnPagina('red_ingenieros', { rol: 'consultorio' })
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Red de ingenieros"
        titulo="Encontrar ingeniero"
        descripcion="Ingenieros biomédicos con sus documentos profesionales revisados. Mira sus perfiles, lo que opinan otros consultorios y elige con quién acordar tu mantenimiento."
      />
      <DirectorioIngenieros />
    </div>
  )
}
