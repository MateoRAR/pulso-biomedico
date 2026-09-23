import {
  BadgeCheck,
  Bell,
  Boxes,
  CalendarDays,
  ClipboardList,
  FolderOpen,
  Handshake,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  RefreshCw,
  Settings,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import { useState, type ComponentType, type ReactNode } from 'react'
import { Navigate, NavLink, Outlet } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useData } from '@/lib/store'
import { etiquetaRol, rutaInicioPorRol, useSession } from '@/lib/session'
import { cn } from '@/lib/utils'
import type { Rol } from '@/lib/mock/data'

interface ItemNav {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}

const NAV: Record<Rol, ItemNav[]> = {
  consultorio: [
    { to: '/consultorio', label: 'Panel', icon: LayoutDashboard, end: true },
    { to: '/consultorio/onboarding', label: 'Diagnóstico inicial', icon: ClipboardList },
    { to: '/consultorio/equipos', label: 'Equipos', icon: Boxes },
    { to: '/consultorio/expediente', label: 'Expediente', icon: FolderOpen },
    { to: '/consultorio/cronograma', label: 'Cronograma', icon: CalendarDays },
    { to: '/consultorio/solicitudes', label: 'Solicitudes', icon: Wrench },
    { to: '/consultorio/diagnostico-expres', label: 'Diagnóstico exprés', icon: Zap },
    { to: '/consultorio/ingenieros', label: 'Red de ingenieros', icon: Users },
    { to: '/consultorio/repuestos', label: 'Repuestos', icon: Package },
    { to: '/consultorio/calidad', label: 'Calidad y garantías', icon: Star },
    { to: '/consultorio/perfil', label: 'Perfil', icon: Settings },
  ],
  ingeniero: [
    { to: '/ingeniero', label: 'Panel', icon: LayoutDashboard, end: true },
    { to: '/ingeniero/verificacion', label: 'Verificación', icon: BadgeCheck },
    { to: '/ingeniero/agenda', label: 'Agenda', icon: CalendarDays },
    { to: '/ingeniero/solicitudes', label: 'Solicitudes', icon: ClipboardList },
    { to: '/ingeniero/repuestos', label: 'Repuestos', icon: Package },
    { to: '/ingeniero/historial', label: 'Historial e ingresos', icon: TrendingUp },
    { to: '/ingeniero/perfil', label: 'Perfil público', icon: Settings },
  ],
  admin: [
    { to: '/admin', label: 'Métricas', icon: TrendingUp, end: true },
    { to: '/admin/verificacion', label: 'Verificación', icon: BadgeCheck },
    { to: '/admin/calidad', label: 'Calidad y reclamos', icon: ShieldCheck },
    { to: '/admin/aliados', label: 'Aliados', icon: Handshake },
    { to: '/admin/planes', label: 'Planes y tarifas', icon: Settings },
  ],
}

export function AppShell({ rol, children }: { rol: Rol; children?: ReactNode }) {
  const { sesion, cerrarSesion } = useSession()
  const { notificaciones, marcarNotificacion, reiniciarDemo } = useData()
  const [menuOpen, setMenuOpen] = useState(false)
  const [bandejaOpen, setBandejaOpen] = useState(false)

  if (!sesion) return <Navigate to="/ingresar" replace />
  if (sesion.rol !== rol) return <Navigate to={rutaInicioPorRol[sesion.rol]} replace />

  const pendientes = notificaciones.filter((n) => n.para === rol && !n.leida)

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
          <HeartPulse className="size-4" />
        </span>
        <span className="font-display text-base font-bold">
          Pulso <span className="text-seafoam">Biomédico</span>
        </span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Navegación del portal">
        {NAV[rol].map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          onClick={reiniciarDemo}
        >
          <RefreshCw /> Restaurar demo
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 w-64">{sidebar}</div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div className="animate-fade-in absolute inset-y-0 left-0 w-64">{sidebar}</div>
        </div>
      )}

      <div className="lg:col-start-2">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-5 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}>
              <Menu />
            </Button>
            <div>
              <p className="text-sm font-semibold">{sesion.organizacion ?? sesion.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {etiquetaRol[rol]} · {sesion.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                aria-label="Notificaciones"
                onClick={() => setBandejaOpen((v) => !v)}
              >
                <Bell />
              </Button>
              {pendientes.length > 0 && (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-destructive text-[0.65rem] font-bold text-destructive-foreground">
                  {pendientes.length}
                </span>
              )}
              {bandejaOpen && (
                <div className="absolute right-0 top-12 z-50 w-[22rem] rounded-lg border border-border bg-card p-2 shadow-xl">
                  <p className="px-2 py-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Notificaciones
                  </p>
                  {notificaciones.filter((n) => n.para === rol).length === 0 && (
                    <p className="px-2 py-3 text-sm text-muted-foreground">Sin notificaciones.</p>
                  )}
                  {notificaciones
                    .filter((n) => n.para === rol)
                    .map((n) => (
                      <button
                        key={n.id}
                        onClick={() => marcarNotificacion(n.id)}
                        className="block w-full rounded-md px-2 py-2 text-left hover:bg-accent"
                      >
                        <span className="flex items-center gap-2">
                          <Badge variant={n.leida ? 'outline' : 'default'}>{n.tipo}</Badge>
                          {!n.leida && <span className="size-2 rounded-full bg-primary" />}
                        </span>
                        <span className="mt-1 block text-sm">{n.mensaje}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" aria-label="Cerrar sesión" onClick={cerrarSesion}>
              <LogOut />
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  )
}
