import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import { AppShell } from '@/components/app/AppShell'
import { Toaster } from '@/components/ui/toast'
import { DataProvider } from '@/lib/store'
import { SessionProvider } from '@/lib/session'
import { NotFound } from '@/pages/NotFound'

import { Home } from '@/pages/public/Home'
import { PerfilIngeniero } from '@/pages/public/PerfilIngeniero'
import { Ingresar } from '@/pages/public/Ingresar'
import { Registro } from '@/pages/public/Registro'

import { ConsultorioDashboard } from '@/pages/consultorio/Dashboard'
import { ConsultorioOnboarding } from '@/pages/consultorio/Onboarding'
import { ConsultorioEquipos } from '@/pages/consultorio/Equipos'
import { ConsultorioEquipoDetalle } from '@/pages/consultorio/EquipoDetalle'
import { ConsultorioExpediente } from '@/pages/consultorio/Expediente'
import { ConsultorioCronograma } from '@/pages/consultorio/Cronograma'
import { ConsultorioSolicitudes } from '@/pages/consultorio/Solicitudes'
import { ConsultorioSolicitudNueva } from '@/pages/consultorio/SolicitudNueva'
import { ConsultorioDiagnosticoExpres } from '@/pages/consultorio/DiagnosticoExpres'
import { ConsultorioRepuestos } from '@/pages/consultorio/Repuestos'
import { ConsultorioCalidad } from '@/pages/consultorio/Calidad'
import { ConsultorioPerfil } from '@/pages/consultorio/Perfil'
import { ConsultorioIngenieros } from '@/pages/consultorio/Ingenieros'

import { IngenieroDashboard } from '@/pages/ingeniero/Dashboard'
import { IngenieroVerificacion } from '@/pages/ingeniero/Verificacion'
import { IngenieroAgenda } from '@/pages/ingeniero/Agenda'
import { IngenieroSolicitudes } from '@/pages/ingeniero/Solicitudes'
import { IngenieroServicioDetalle } from '@/pages/ingeniero/ServicioDetalle'
import { IngenieroRepuestos } from '@/pages/ingeniero/Repuestos'
import { IngenieroHistorial } from '@/pages/ingeniero/Historial'
import { IngenieroPerfil } from '@/pages/ingeniero/Perfil'

import { AdminMetricas } from '@/pages/admin/Metricas'
import { AdminVerificacion } from '@/pages/admin/Verificacion'
import { AdminCalidad } from '@/pages/admin/Calidad'
import { AdminAliados } from '@/pages/admin/Aliados'
import { AdminPlanes } from '@/pages/admin/Planes'

export default function App() {
  return (
    <DataProvider>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ingenieros/:slug" element={<PerfilIngeniero />} />
            <Route path="/ingresar" element={<Ingresar />} />
            <Route path="/registro" element={<Registro />} />

            <Route path="/consultorio" element={<AppShell rol="consultorio" />}>
              <Route index element={<ConsultorioDashboard />} />
              <Route path="onboarding" element={<ConsultorioOnboarding />} />
              <Route path="equipos" element={<ConsultorioEquipos />} />
              <Route path="equipos/:id" element={<ConsultorioEquipoDetalle />} />
              <Route path="expediente" element={<ConsultorioExpediente />} />
              <Route path="cronograma" element={<ConsultorioCronograma />} />
              <Route path="solicitudes" element={<ConsultorioSolicitudes />} />
              <Route path="solicitudes/nueva" element={<ConsultorioSolicitudNueva />} />
              <Route path="diagnostico-expres" element={<ConsultorioDiagnosticoExpres />} />
              <Route path="ingenieros" element={<ConsultorioIngenieros />} />
              <Route path="repuestos" element={<ConsultorioRepuestos />} />
              <Route path="calidad" element={<ConsultorioCalidad />} />
              <Route path="perfil" element={<ConsultorioPerfil />} />
            </Route>

            <Route path="/ingeniero" element={<AppShell rol="ingeniero" />}>
              <Route index element={<IngenieroDashboard />} />
              <Route path="verificacion" element={<IngenieroVerificacion />} />
              <Route path="agenda" element={<IngenieroAgenda />} />
              <Route path="solicitudes" element={<IngenieroSolicitudes />} />
              <Route path="servicios/:id" element={<IngenieroServicioDetalle />} />
              <Route path="repuestos" element={<IngenieroRepuestos />} />
              <Route path="historial" element={<IngenieroHistorial />} />
              <Route path="perfil" element={<IngenieroPerfil />} />
            </Route>

            <Route path="/admin" element={<AppShell rol="admin" />}>
              <Route index element={<AdminMetricas />} />
              <Route path="verificacion" element={<AdminVerificacion />} />
              <Route path="calidad" element={<AdminCalidad />} />
              <Route path="aliados" element={<AdminAliados />} />
              <Route path="planes" element={<AdminPlanes />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <AnalyticsRutas />
        </BrowserRouter>
      </SessionProvider>
    </DataProvider>
  )
}

/**
 * Vercel Analytics para un SPA con react-router: al pasar `route`/`path` se
 * desactiva el auto-track y se emite un pageview en cada cambio de ruta.
 */
function AnalyticsRutas() {
  const location = useLocation()
  return <Analytics route={location.pathname} path={`${location.pathname}${location.search}`} />
}
