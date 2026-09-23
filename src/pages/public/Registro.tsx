import { ArrowRight, Building2, ShieldCheck, Stethoscope, Wrench } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { PublicPage } from '@/components/site/PublicLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/field'
import { toast } from '@/components/ui/toast'
import { etiquetaRol, rutaInicioPorRol, useSession } from '@/lib/session'
import type { Rol } from '@/lib/mock/data'
import { cn } from '@/lib/utils'

const roles: { rol: Rol; icon: typeof Stethoscope; titulo: string; texto: string; puntos: string[] }[] = [
  {
    rol: 'consultorio',
    icon: Stethoscope,
    titulo: 'Soy un consultorio o prestador',
    texto: 'Quiero ordenar mi dotación, cumplir con habilitación y dejar de depender de correctivos.',
    puntos: ['Diagnóstico de dotación', 'Cronograma anual', 'Expediente documental'],
  },
  {
    rol: 'ingeniero',
    icon: Wrench,
    titulo: 'Soy ingeniero biomédico',
    texto: 'Quiero recibir servicios cercanos, con agenda predecible y menos carga administrativa.',
    puntos: ['Verificación de credenciales', 'Agenda y franjas', 'Historial e ingresos'],
  },
]

export function Registro() {
  const [rol, setRol] = useState<Rol | null>(null)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [organizacion, setOrganizacion] = useState('')
  const { iniciarSesion } = useSession()
  const navigate = useNavigate()

  function crearCuenta(event: React.FormEvent) {
    event.preventDefault()
    if (!rol) return
    iniciarSesion({ nombre, email, rol, organizacion: organizacion || undefined })
    toast.success('Cuenta creada', {
      description: `Correo de bienvenida enviado a ${email} (simulado).`,
    })
    navigate(rutaInicioPorRol[rol])
  }

  return (
    <PublicPage
      eyebrow="Registro"
      titulo="Crea tu cuenta en la red Pulso."
      descripcion="Elige tu rol para continuar. Este prototipo usa una sesión simulada: los datos se guardan en tu navegador."
    >
      <section className="section-space">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            {roles.map(({ rol: valor, icon: Icon, titulo, texto, puntos }) => (
              <Card
                key={valor}
                className={cn(
                  'feature-card cursor-pointer bg-card/90',
                  rol === valor ? 'border-primary shadow-ocean' : 'border-border/80',
                )}
                onClick={() => setRol(valor)}
              >
                <CardHeader>
                  <div className="icon-well">
                    <Icon />
                  </div>
                  <CardTitle className="font-display pt-4 text-xl">{titulo}</CardTitle>
                  <CardDescription className="text-base leading-7">{texto}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {puntos.map((punto) => (
                    <p key={punto} className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-primary" /> {punto}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {rol && (
            <Card className="animate-fade-in mt-8 border-border/80 bg-card/95">
              <CardHeader>
                <CardTitle className="font-display text-xl">Datos de la cuenta · {etiquetaRol[rol]}</CardTitle>
                <CardDescription>Con esto habilitamos tu portal y el siguiente paso del proceso.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-5 sm:grid-cols-2" onSubmit={crearCuenta}>
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input
                      id="nombre"
                      required
                      value={nombre}
                      onChange={(event) => setNombre(event.target.value)}
                      placeholder="Diana Ramírez"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="tucorreo@dominio.co"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="organizacion">
                      {rol === 'consultorio' ? 'Nombre del consultorio' : 'Ciudad de operación'}
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="organizacion"
                        className="pl-9"
                        value={organizacion}
                        onChange={(event) => setOrganizacion(event.target.value)}
                        placeholder={rol === 'consultorio' ? 'Clínica Odontológica Sanare' : 'Santiago de Cali'}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                    <Button type="submit" size="lg" className="shadow-ocean">
                      Crear cuenta <ArrowRight />
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      ¿Ya tienes cuenta?{' '}
                      <Link to="/ingresar" className="font-semibold text-primary">
                        Inicia sesión
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </PublicPage>
  )
}
