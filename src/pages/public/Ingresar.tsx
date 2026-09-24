import { ArrowRight, LogIn } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { PublicPage } from '@/components/site/PublicLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/field'
import { toast } from '@/components/ui/toast'
import { EVENTOS, track, useTiempoEnPagina } from '@/lib/analytics'
import { buscarCuenta, CUENTAS_DEMO, etiquetaRol, rutaInicioPorRol, useSession } from '@/lib/session'

export function Ingresar() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { iniciarSesion } = useSession()
  const navigate = useNavigate()
  useTiempoEnPagina('login')

  function entrar(correo: string, clave: string) {
    const cuenta = buscarCuenta(correo)
    if (!cuenta) {
      toast.error('Correo no reconocido', {
        description: 'Usa una de las cuentas de demostración: consultorio@pulso.co o ingeniero@pulso.co.',
      })
      return
    }
    if (clave !== cuenta.password) {
      toast.error('Contraseña incorrecta', { description: `Para esta demo usa "${cuenta.password}".` })
      return
    }
    iniciarSesion({ rol: cuenta.rol, nombre: cuenta.nombre, email: cuenta.email, organizacion: cuenta.organizacion })
    track(EVENTOS.login, { rol: cuenta.rol, portal: rutaInicioPorRol[cuenta.rol] })
    toast.success(`Bienvenido, ${cuenta.nombre}`, { description: `Entraste como ${etiquetaRol[cuenta.rol]}.` })
    navigate(rutaInicioPorRol[cuenta.rol])
  }

  return (
    <PublicPage
      eyebrow="Inicio de sesión"
      titulo="Entra a tu portal."
      descripcion="El correo con el que ingresas define tu portal: consultorio, ingeniero biomédico o administración. La autenticación de este prototipo es simulada."
    >
      <section className="section-space">
        <div className="mx-auto grid max-w-5xl gap-6 px-5 lg:grid-cols-[1.1fr_1fr] lg:px-8">
          <Card className="border-border/80 bg-card/95">
            <CardHeader>
              <CardTitle className="font-display text-xl">Con tu correo</CardTitle>
              <CardDescription>Contraseña de demostración: pulso123</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault()
                  entrar(email, password)
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="consultorio@pulso.co"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="pulso123"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full shadow-ocean">
                  <LogIn /> Iniciar sesión
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  ¿Aún no tienes cuenta?{' '}
                  <Link to="/registro" className="font-semibold text-primary">
                    Regístrate
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/90">
            <CardHeader>
              <CardTitle className="font-display text-xl">Cuentas de demostración</CardTitle>
              <CardDescription>Entra con un clic para recorrer cada portal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {CUENTAS_DEMO.map((cuenta) => (
                <button
                  key={cuenta.rol}
                  type="button"
                  onClick={() => {
                    setEmail(cuenta.email)
                    setPassword(cuenta.password)
                    entrar(cuenta.email, cuenta.password)
                  }}
                  className="flex w-full items-center justify-between rounded-md border border-border bg-background px-4 py-4 text-left transition hover:border-primary hover:bg-accent"
                >
                  <span>
                    <span className="block font-semibold">{etiquetaRol[cuenta.rol]}</span>
                    <span className="text-sm text-muted-foreground">{cuenta.email}</span>
                  </span>
                  <ArrowRight className="size-4 text-primary" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicPage>
  )
}
