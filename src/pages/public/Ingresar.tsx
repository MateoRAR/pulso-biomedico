import { ArrowRight, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/components/site/AuthLayout'
import { saludoHora } from '@/components/shared/efectos'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/field'
import { toast } from '@/components/ui/toast'
import { EVENTOS, track, useTiempoEnPagina } from '@/lib/analytics'
import { CUENTAS_DEMO, etiquetaRol, rutaInicioPorRol } from '@/lib/session'
import { useAutenticacion, useData } from '@/lib/store'

export function Ingresar() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verClave, setVerClave] = useState(false)
  const { ingresar } = useAutenticacion()
  const { usuarios } = useData()
  const cuentas = usuarios.filter((u) => u.origen === 'registro')
  const navigate = useNavigate()
  useTiempoEnPagina('login')

  async function entrar(correo: string, clave: string) {
    const resultado = await ingresar(correo, clave)
    if (!resultado.ok) {
      if (resultado.motivo === 'no-existe') {
        toast.error('No encontramos ese correo', {
          description: 'Revisa que esté bien escrito, o crea tu cuenta en un minuto.',
        })
      } else if (resultado.motivo === 'inactiva') {
        toast.error('Esta cuenta está desactivada', { description: 'Comunícate con el equipo de Pulso para reactivarla.' })
      } else {
        toast.error('Esa contraseña no coincide', {
          description: resultado.pista ? `Para las cuentas de demostración es "${resultado.pista}".` : 'Inténtalo de nuevo.',
        })
      }
      return
    }
    const { sesion } = resultado
    track(EVENTOS.login, { rol: sesion.rol, portal: rutaInicioPorRol[sesion.rol] })
    toast.success(`${saludoHora()}, ${sesion.nombre.split(' ')[0]}`, { description: `Entraste como ${etiquetaRol[sesion.rol].toLowerCase()}.` })
    navigate(rutaInicioPorRol[sesion.rol])
  }

  const coincidencia = usuarios.find((c) => c.email.toLowerCase() === email.trim().toLowerCase())

  return (
    <AuthLayout
      titulo={coincidencia ? <>Qué bueno verte, {coincidencia.nombre.split(' ')[0]}.</> : <>Tu equipo ya te estaba esperando.</>}
      mensaje={
        coincidencia
          ? 'Tus equipos, visitas y documentos siguen donde los dejaste.'
          : 'Entra a tu portal para ver el pulso de tu dotación, tus visitas y tus documentos.'
      }
    >
      <div className="animate-rise space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Entra a tu portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            El correo con el que ingresas define tu portal: consultorio, ingeniero biomédico o administración.
          </p>
        </div>

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
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tucorreo@dominio.co"
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={verClave ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Tu contraseña"
                className="h-12 pr-11 text-base"
              />
              <button
                type="button"
                aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setVerClave((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              >
                {verClave ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" size="lg" className="h-12 w-full shadow-ocean">
            <LogIn /> Iniciar sesión
          </Button>
        </form>

        {cuentas.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Creadas en esta sesión</p>
            {cuentas.map((cuenta) => (
              <button
                key={cuenta.email}
                type="button"
                onClick={() => {
                  setEmail(cuenta.email)
                  setPassword('')
                  document.getElementById('password')?.focus()
                }}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-primary"
              >
                <span>
                  <span className="block text-sm font-semibold">{cuenta.nombre}</span>
                  <span className="text-xs text-muted-foreground">
                    {cuenta.email} · {etiquetaRol[cuenta.rol]}
                  </span>
                </span>
                <ArrowRight className="size-4 text-primary" />
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" /> Probar con una cuenta de demostración
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {CUENTAS_DEMO.map((cuenta) => (
              <button
                key={cuenta.rol}
                type="button"
                onClick={() => {
                  setEmail(cuenta.email)
                  setPassword(cuenta.password)
                  entrar(cuenta.email, cuenta.password)
                }}
                className="rounded-xl border border-border bg-card px-3 py-3 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-ocean"
              >
                <span className="block text-sm font-semibold leading-tight">{etiquetaRol[cuenta.rol]}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{cuenta.email}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-primary hover:underline">
            Crea la tuya en un minuto
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
