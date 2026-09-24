import { DirectorioIngenieros } from '@/components/shared/DirectorioIngenieros'
import { PageHeader } from '@/components/shared/ui'
import { useTiempoEnPagina } from '@/lib/analytics'

export function ConsultorioIngenieros() {
  useTiempoEnPagina('red_ingenieros', { rol: 'consultorio' })
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Red de ingenieros"
        titulo="Ingenieros biomédicos verificados"
        descripcion="Inscripción INVIMA y tarjeta COPNIA revisadas, alcance técnico declarado y calificación de los servicios realizados. Así eliges con quién acuerdas tu mantenimiento."
      />
      <DirectorioIngenieros />
    </div>
  )
}
