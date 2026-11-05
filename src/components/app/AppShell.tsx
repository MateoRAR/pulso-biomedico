import {
  BadgeCheck,
  Bell,
  Boxes,
  Building2,
  CalendarDays,
  CheckCheck,
  ClipboardList,
  FolderOpen,
  Handshake,
  Home,
  LogOut,
  Map,
  Menu,
  Package,
  PlusCircle,
  Settings,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'

import { AsistentePulso } from '@/components/app/AsistentePulso'
import { BotonTema } from '@/components/shared/BotonTema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Rol } from '@/data/tipos'
import { haceCuanto, iniciales } from '@/lib/format'
import { etiquetaRol, rutaInicioPorRol, useSession } from '@/lib/session'
import { useData } from '@/lib/store'
import { cn } from '@/lib/utils'

interface ItemNav {
  to: string
  label: string
  /** Texto corto para la barra inferior del celular. */
  corto?: string
  icon: LucideIcon
  end?: boolean
  /** Aparece en la barra inferior del celular. */
  principal?: boolean
}

interface GrupoNav {
  titulo: string
  items: ItemNav[]
}

// Pocas opciones, con nombres sencillos.
const NAV: Record<Rol, GrupoNav[]> = {
  consultorio: [
    {
      titulo: 'Principal',
      items: [
        { to: '/consultorio', label: 'Inicio', icon: Home, end: true, principal: true },
        { to: '/consultorio/ingenieros', label: 'Encontrar ingeniero', corto: 'Ingenieros', icon: Users, principal: true },
        { to: '/consultorio/solicitudes/nueva', label: 'Pedir un servicio', corto: 'Pedir', icon: PlusCircle, principal: true },
        { to: '/consultorio/solicitudes', label: 'Mis solicitudes', icon: Wrench },
      ],
    },
    {
      titulo: 'Mi consultorio',
      items: [
        { to: '/consultorio/equipos', label: 'Mis equipos', corto: 'Equipos', icon: Boxes, principal: true },
        { to: '/consultorio/cronograma', label: 'Calendario', icon: CalendarDays },
        { to: '/consultorio/expediente', label: 'Documentos', icon: FolderOpen },
        { to: '/consultorio/repuestos', label: 'Repuestos', icon: Package },
      ],
    },
    {
      titulo: 'Más',
      items: [
        { to: '/consultorio/calidad', label: 'Opiniones y garantías', icon: Star },
        { to: '/consultorio/perfil', label: 'Mi perfil y plan', icon: Settings },
      ],
    },
  ],
  ingeniero: [
    {
      titulo: 'Principal',
      items: [
        { to: '/ingeniero', label: 'Inicio', icon: Home, end: true, principal: true },
        { to: '/ingeniero/solicitudes', label: 'Trabajos disponibles', corto: 'Trabajos', icon: ClipboardList, principal: true },
        { to: '/ingeniero/agenda', label: 'Mi agenda', corto: 'Agenda', icon: CalendarDays, principal: true },
      ],
    },
    {
      titulo: 'Mi trabajo',
      items: [
        { to: '/ingeniero/historial', label: 'Historial e ingresos', corto: 'Ingresos', icon: TrendingUp, principal: true },
        { to: '/ingeniero/repuestos', label: 'Repuestos', icon: Package },
        { to: '/ingeniero/verificacion', label: 'Mis documentos', icon: BadgeCheck },
        { to: '/ingeniero/perfil', label: 'Mi perfil público', icon: Settings },
      ],
    },
  ],
  admin: [
    {
      titulo: 'Principal',
      items: [
        { to: '/admin', label: 'Resumen', icon: TrendingUp, end: true, principal: true },
        { to: '/admin/mapa', label: 'Consultorios', icon: Map, principal: true },
        { to: '/admin/ingenieros', label: 'Ingenieros', icon: Users, principal: true },
        { to: '/admin/verificacion', label: 'Verificaciones', corto: 'Verificar', icon: BadgeCheck, principal: true },
      ],
    },
    {
      titulo: 'Más',
      items: [
        { to: '/admin/calidad', label: 'Calidad y reclamos', icon: ShieldCheck },
        { to: '/admin/aliados', label: 'Aliados', icon: Handshake },
        { to: '/admin/planes', label: 'Planes y tarifas', icon: Building2 },
      ],
    },
  ],
}

function EnlaceMenu({ item, alNavegar }: { item: ItemNav; alNavegar: () => void }) {
  const Icono = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={alNavegar}
      className={({ isActive }) =>
        cn(
          'flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-white/15 text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/75 hover:bg-white/10 hover:text-sidebar-accent-foreground',
        )
      }
    >
      <Icono className="size-4 shrink-0" />
      {item.label}
    </NavLink>
  )
}

export function AppShell({ rol, children }: { rol: Rol; children?: ReactNode }) {
  const { sesion, cerrarSesion } = useSession()
  const { notificaciones, marcarNotificacion, marcarTodasNotificaciones } = useData()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [bandejaOpen, setBandejaOpen] = useState(false)
  const bandejaRef = useRef<HTMLDivElement>(null)

  const pendientes = notificaciones.filter((n) => !n.leida)

  // Cierra el menú del celular al cambiar de página.
  useEffect(() => setMenuOpen(false), [location.pathname])

  // Cierra la bandeja de avisos al hacer clic fuera.
  useEffect(() => {
    if (!bandejaOpen) return
    const fuera = (e: PointerEvent) => {
      if (!bandejaRef.current?.contains(e.target as Node)) setBandejaOpen(false)
    }
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [bandejaOpen])

  if (!sesion) return <Navigate to="/ingresar" replace />
  if (sesion.rol !== rol) return <Navigate to={rutaInicioPorRol[sesion.rol]} replace />

  const grupos = NAV[rol]
  const principales = grupos.flatMap((g) => g.items).filter((i) => i.principal)

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <NavLink to={rutaInicioPorRol[rol]} end className="flex h-14 shrink-0 items-center gap-2.5 px-5" aria-label="Ir al inicio de mi portal">
        <span className="grid size-8 place-items-center rounded-lg bg-white">
          <img src="/logo.png" alt="" className="size-7 rounded-md object-contain" />
        </span>
        <span className="font-display text-base font-bold">
          Pulso <span className="text-seafoam">Biomédico</span>
        </span>
      </NavLink>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3" aria-label="Menú del portal">
        {grupos.map((grupo) => (
          <div key={grupo.titulo}>
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/45">{grupo.titulo}</p>
            <div className="space-y-0.5">
              {grupo.items.map((item) => (
                <EnlaceMenu key={item.to} item={item} alNavegar={() => setMenuOpen(false)} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      {!sesion.demo && (
        <p className="m-3 shrink-0 rounded-lg bg-white/5 px-3 py-2 text-xs leading-5 text-sidebar-foreground/65">
          Tus datos viven solo en esta pestaña y se borran al cerrarla.
        </p>
      )}
    </div>
  )

  return (
    <div className="min-h-svh bg-background lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 w-60">{sidebar}</div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div className="animate-fade-in absolute inset-y-0 left-0 w-[min(18rem,86vw)]">
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setMenuOpen(false)}
              className="absolute right-2 top-2 z-10 grid size-10 place-items-center rounded-full text-sidebar-foreground hover:bg-white/10"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/90 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              {iniciales(sesion.nombre)}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{sesion.organizacion ?? sesion.nombre}</p>
              <p className="truncate text-xs text-muted-foreground">{etiquetaRol[rol]}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <BotonTema />
            <div className="relative" ref={bandejaRef}>
              <Button variant="ghost" size="icon" onClick={() => setBandejaOpen((v) => !v)} aria-label={`Avisos${pendientes.length ? `, ${pendientes.length} sin leer` : ''}`} className="relative">
                <Bell />
                {pendientes.length > 0 && (
                  <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[0.65rem] font-bold text-destructive-foreground">
                    {pendientes.length}
                  </span>
                )}
              </Button>
              {bandejaOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-2 shadow-2xl">
                  <div className="flex items-center justify-between px-2 py-1">
                    <p className="text-sm font-semibold">Avisos</p>
                    {pendientes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => marcarTodasNotificaciones(rol)}
                        className="flex min-h-9 items-center gap-1 px-2 text-xs font-semibold text-primary hover:underline"
                      >
                        <CheckCheck className="size-3.5" /> Marcar leídos
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notificaciones.length === 0 && <p className="px-2 py-3 text-sm text-muted-foreground">No tienes avisos por ahora.</p>}
                    {notificaciones.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => marcarNotificacion(n.id)}
                        className="block w-full rounded-lg px-2 py-2 text-left transition hover:bg-accent"
                      >
                        <span className="flex items-center gap-2">
                          <Badge variant={n.leida ? 'outline' : 'default'}>{n.tipo}</Badge>
                          <span className="ml-auto text-xs text-muted-foreground">{haceCuanto(n.fecha)}</span>
                        </span>
                        <span className={cn('mt-1 block text-sm', n.leida && 'text-muted-foreground')}>{n.mensaje}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={cerrarSesion} aria-label="Cerrar sesión" title="Cerrar sesión">
              <LogOut />
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 lg:px-8 lg:pb-10 lg:pt-8">
          <div key={location.pathname} className="pagina">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>

      {/* Barra inferior del celular: las acciones más usadas, siempre a mano. */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid border-t border-border bg-background lg:hidden"
        style={{ gridTemplateColumns: `repeat(${principales.length + 1}, minmax(0, 1fr))`, paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Accesos principales"
      >
        {principales.map(({ to, label, corto, icon: Icono, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn('flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[0.7rem] font-semibold leading-tight', isActive ? 'text-primary' : 'text-muted-foreground')
            }
          >
            <Icono className="size-5" />
            <span className="text-center">{corto ?? label}</span>
          </NavLink>
        ))}
        <button type="button" onClick={() => setMenuOpen(true)} className="flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[0.7rem] font-semibold text-muted-foreground">
          <Menu className="size-5" />
          Más
        </button>
      </nav>

      <AsistentePulso />
    </div>
  )
}
