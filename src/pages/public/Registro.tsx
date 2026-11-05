import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, Minus, Plus, Stethoscope, Wrench } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/components/site/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input, Label, Select } from '@/components/ui/field'
import { toast } from '@/components/ui/toast'
import { EVENTOS, track, useTiempoEnPagina } from '@/lib/analytics'
import { ciudades, especialidades, zonasCali } from '@/data/tipos'
import type { Rol } from '@/data/tipos'
import { etiquetaRol, rutaInicioPorRol } from '@/lib/session'
import { useAutenticacion } from '@/lib/store'
import { cn } from '@/lib/utils'

type RolRegistro = Exclude<Rol, 'admin'>
type Paso = 'rol' | 'nombre' | 'lugar' | 'perfil' | 'acceso'

const PASOS: Paso[] = ['rol', 'nombre', 'lugar', 'perfil', 'acceso']

const roles: { rol: RolRegistro; icon: typeof Stethoscope; titulo: string; texto: string }[] = [
  {
    rol: 'consultorio',
    icon: Stethoscope,
    titulo: 'Tengo un consultorio',
    texto: 'Quiero ordenar mi dotación, cumplir con habilitación y dejar de depender de correctivos.',
  },
  {
    rol: 'ingeniero',
    icon: Wrench,
    titulo: 'Soy ingeniero biomédico',
    texto: 'Quiero servicios cercanos, agenda predecible y menos carga administrativa.',
  },
]

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function Registro() {
  const { registrar } = useAutenticacion()
  const navigate = useNavigate()
  useTiempoEnPagina('registro')

  const [paso, setPaso] = useState<Paso>('rol')
  const [rol, setRol] = useState<RolRegistro | null>(null)
  const [nombre, setNombre] = useState('')
  const [organizacion, setOrganizacion] = useState('')
  const [ciudad, setCiudad] = useState(ciudades[0])
  const [zona, setZona] = useState(zonasCali[0])
  const [areas, setAreas] = useState<string[]>([])
  const [cifra, setCifra] = useState(8)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [creando, setCreando] = useState<number | null>(null)
  const primerCampo = useRef<HTMLInputElement>(null)
  const temporizadores = useRef<number[]>([])

  const indice = PASOS.indexOf(paso)
  const primerNombre = nombre.trim().split(/\s+/)[0] ?? ''

  useEffect(() => {
    const pendientes = temporizadores.current
    return () => pendientes.forEach((id) => window.clearTimeout(id))
  }, [])

  // El foco acompaña la conversación.
  useEffect(() => {
    const id = window.setTimeout(() => primerCampo.current?.focus(), 80)
    return () => window.clearTimeout(id)
  }, [paso])

  function ir(destino: Paso) {
    setPaso(destino)
  }

  function alternarArea(area: string) {
    setAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
  }

  const mensajeLateral = useMemo(() => {
    const textos: Record<Paso, [string, string]> = {
      rol: ['Empecemos por conocernos.', 'Pulso conecta consultorios con ingenieros biomédicos verificados. Cuéntanos desde qué lado nos acompañas.'],
      nombre: ['Un gusto.', 'Con tu nombre armamos un espacio que se sienta tuyo desde el primer minuto.'],
      lugar:
        rol === 'consultorio'
          ? [`${primerNombre ? `${primerNombre}, ` : ''}¿dónde atienden?`, 'La zona nos permite asignarte al ingeniero más cercano, no al primero que aparezca.']
          : [`${primerNombre ? `${primerNombre}, ` : ''}¿por dónde te mueves?`, 'Agrupamos servicios por zona para que pases más tiempo trabajando y menos en el tráfico.'],
      perfil:
        rol === 'consultorio'
          ? ['Ya casi conocemos tu consultorio.', 'Con esto dimensionamos el diagnóstico de tu dotación y el plan que mejor te queda.']
          : ['Cuéntanos qué se te da mejor.', 'Así la cola de solicitudes se llena de servicios que realmente quieres tomar.'],
      acceso: ['Último paso.', 'Tu espacio vive solo en esta sesión del navegador: cuando cierres la pestaña, desaparece.'],
    }
    return textos[paso]
  }, [paso, rol, primerNombre])

  function validar(): string | null {
    if (paso === 'nombre' && nombre.trim().length < 2) return 'Escribe tu nombre para continuar.'
    if (paso === 'lugar' && rol === 'consultorio' && organizacion.trim().length < 2) return 'Dinos cómo se llama tu consultorio.'
    if (paso === 'perfil' && areas.length === 0) return 'Elige al menos una opción.'
    if (paso === 'acceso') {
      if (!EMAIL_VALIDO.test(email.trim())) return 'Ese correo no parece completo.'
      if (password.length < 6) return 'Usa al menos 6 caracteres en la contraseña.'
    }
    return null
  }

  function avanzar(event: React.FormEvent) {
    event.preventDefault()
    if (!rol) return
    const problema = validar()
    if (problema) {
      toast.error(problema)
      return
    }
    if (paso !== 'acceso') {
      ir(PASOS[indice + 1])
      return
    }
    crear(rol)
  }

  async function crear(rolElegido: RolRegistro) {
    const resultado = await registrar({
      rol: rolElegido,
      nombre: nombre.trim(),
      email,
      password,
      organizacion: organizacion.trim() || ciudad,
      ciudad,
      zona,
      especialidades: areas,
      cifra,
    })
    if (!resultado.ok) {
      toast.error('Ese correo ya tiene cuenta', { description: 'Inicia sesión, o usa otro correo para crear una nueva.' })
      return
    }
    track(EVENTOS.registro, { rol: rolElegido })
    setCreando(0)
    // Una pequeña coreografía para que la creación del espacio se sienta real.
    ;[700, 1500, 2300].forEach((ms, i) => {
      temporizadores.current.push(window.setTimeout(() => setCreando(i + 1), ms))
    })
    temporizadores.current.push(
      window.setTimeout(() => {
        toast.success(`Te damos la bienvenida, ${primerNombre}`, { description: 'Tu espacio está listo.' })
        navigate(rutaInicioPorRol[rolElegido], { replace: true })
      }, 3000),
    )
  }

  const pasosCreacion =
    rol === 'consultorio'
      ? ['Creando la carpeta de documentos de tu consultorio', 'Preparando el estado de tus equipos', 'Avisando a la red de ingenieros de tu zona']
      : ['Creando tu perfil profesional', 'Abriendo tu agenda y tu cola de solicitudes', 'Buscando servicios cerca de tu zona']

  // ---------- pantalla de creación ----------
  if (creando !== null) {
    return (
      <AuthLayout
        titulo={<>Armando todo para ti, {primerNombre}.</>}
        mensaje="Esto toma un par de segundos."
      >
        <div className="animate-rise space-y-6">
          <h1 className="font-display text-3xl font-bold">Preparando tu espacio</h1>
          <ul className="space-y-4">
            {pasosCreacion.map((texto, i) => {
              const hecho = creando > i
              const activo = creando === i
              return (
                <li key={texto} className={cn('flex items-center gap-3 transition-opacity duration-500', creando < i && 'opacity-30')}>
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-full border transition-colors duration-300',
                      hecho ? 'animate-pop border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground',
                    )}
                  >
                    {hecho ? <Check className="size-4" /> : activo ? <Loader2 className="size-4 animate-spin" /> : null}
                  </span>
                  <span className={cn('text-sm font-medium', hecho && 'text-muted-foreground line-through decoration-primary/40')}>{texto}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout titulo={mensajeLateral[0]} mensaje={mensajeLateral[1]}>
      {/* progreso */}
      <div className="mb-8 flex items-center gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={PASOS.length} aria-valuenow={indice + 1}>
        {PASOS.map((p, i) => (
          <span key={p} className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: i <= indice ? '100%' : '0%' }}
            />
          </span>
        ))}
      </div>

      <form key={paso} onSubmit={avanzar} className="animate-rise space-y-6">
        {paso === 'rol' && (
          <>
            <h1 className="font-display text-3xl font-bold leading-tight">Hola. ¿Desde qué lado de Pulso nos acompañas?</h1>
            <div className="grid gap-3">
              {roles.map(({ rol: valor, icon: Icon, titulo, texto }) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => {
                    setRol(valor)
                    setAreas([])
                    setCifra(valor === 'consultorio' ? 8 : 3)
                    ir('nombre')
                  }}
                  className={cn(
                    'group flex items-start gap-4 rounded-xl border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-ocean',
                    rol === valor ? 'border-primary' : 'border-border',
                  )}
                >
                  <span className="icon-well shrink-0 transition-transform group-hover:scale-110">
                    <Icon />
                  </span>
                  <span>
                    <span className="font-display block text-lg font-bold">{titulo}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{texto}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {paso === 'nombre' && (
          <>
            <h1 className="font-display text-3xl font-bold leading-tight">
              {rol === 'consultorio' ? 'Perfecto, hablemos de tu consultorio.' : 'Perfecto, hablemos de tu trabajo.'} ¿Cómo te llamas?
            </h1>
            <div className="space-y-2">
              <Label htmlFor="nombre">Tu nombre completo</Label>
              <Input
                id="nombre"
                ref={primerCampo}
                autoComplete="name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Diana Ramírez"
                className="h-12 text-base"
              />
              {primerNombre && <p className="animate-rise text-sm text-primary">Mucho gusto, {primerNombre}.</p>}
            </div>
          </>
        )}

        {paso === 'lugar' && (
          <>
            <h1 className="font-display text-3xl font-bold leading-tight">
              {rol === 'consultorio' ? `${primerNombre}, ¿cómo se llama tu consultorio y dónde está?` : `${primerNombre}, ¿en qué ciudad y zona trabajas?`}
            </h1>
            <div className="space-y-5">
              {rol === 'consultorio' && (
                <div className="space-y-2">
                  <Label htmlFor="organizacion">Nombre del consultorio</Label>
                  <Input
                    id="organizacion"
                    ref={primerCampo}
                    value={organizacion}
                    onChange={(e) => setOrganizacion(e.target.value)}
                    placeholder="Clínica Odontológica Sanare"
                    className="h-12 text-base"
                  />
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Select id="ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="h-12">
                    {ciudades.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zona">Zona</Label>
                  <Select id="zona" value={zona} onChange={(e) => setZona(e.target.value)} className="h-12">
                    {zonasCali.map((z) => (
                      <option key={z}>{z}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}

        {paso === 'perfil' && (
          <>
            <h1 className="font-display text-3xl font-bold leading-tight">
              {rol === 'consultorio' ? '¿Qué tipo de atención prestan?' : '¿En qué equipos eres más fuerte?'}
            </h1>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {especialidades.map((area) => {
                  const activa = areas.includes(area)
                  return (
                    <button
                      key={area}
                      type="button"
                      aria-pressed={activa}
                      onClick={() => alternarArea(area)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                        activa
                          ? 'animate-pop border-primary bg-primary text-primary-foreground shadow-ocean'
                          : 'border-border bg-card hover:border-primary hover:text-primary',
                      )}
                    >
                      {activa && <Check className="mr-1.5 inline size-3.5" />}
                      {area}
                    </button>
                  )
                })}
              </div>
              <div className="space-y-3">
                <Label htmlFor="cifra">{rol === 'consultorio' ? '¿Cuántos equipos tienes, más o menos?' : '¿Cuántos años de experiencia tienes?'}</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-12"
                    aria-label="Disminuir"
                    onClick={() => setCifra((n) => Math.max(rol === 'consultorio' ? 1 : 0, n - 1))}
                  >
                    <Minus />
                  </Button>
                  <Input
                    id="cifra"
                    type="number"
                    inputMode="numeric"
                    min={rol === 'consultorio' ? 1 : 0}
                    max={rol === 'consultorio' ? 200 : 60}
                    value={cifra}
                    onChange={(e) => setCifra(Math.max(0, Number(e.target.value) || 0))}
                    className="h-12 w-24 text-center text-xl font-bold"
                  />
                  <Button type="button" variant="outline" size="icon" className="size-12" aria-label="Aumentar" onClick={() => setCifra((n) => n + 1)}>
                    <Plus />
                  </Button>
                </div>
                {rol === 'consultorio' && (
                  <p className="text-base text-muted-foreground">
                    {cifra <= 15 ? 'Con esta cantidad de equipos, el Plan Básico suele alcanzar.' : 'Con esta cantidad de equipos, conviene hablar de un Plan Custom.'}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {paso === 'acceso' && (
          <>
            <h1 className="font-display text-3xl font-bold leading-tight">{primerNombre}, ¿con qué correo vas a entrar?</h1>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  ref={primerCampo}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
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
              <p className="rounded-lg bg-muted px-4 py-3 text-sm leading-6 text-muted-foreground">
                Entrarás como <strong className="text-foreground">{rol ? etiquetaRol[rol] : ''}</strong>. Todo lo que hagas se guarda
                únicamente en esta pestaña y se borra al cerrarla.
              </p>
            </div>
          </>
        )}

        {paso !== 'rol' && (
          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="ghost" onClick={() => ir(PASOS[indice - 1])}>
              <ArrowLeft /> Atrás
            </Button>
            <Button type="submit" size="lg" className="shadow-ocean">
              {paso === 'acceso' ? 'Crear mi espacio' : 'Continuar'} <ArrowRight />
            </Button>
          </div>
        )}
      </form>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link to="/ingresar" className="font-semibold text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
