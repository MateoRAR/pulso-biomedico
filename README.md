# Pulso Biomédico — MVP frontend

Prototipo funcional (sin backend) de la plataforma multilateral **Pulso Biomédico**:
conecta consultorios y prestadores ambulatorios de baja complejidad con ingenieros
biomédicos verificados para el mantenimiento, la calibración y la documentación de
habilitación de su dotación.

Implementa los requerimientos de `../Requerimientos_MVP_Pulso_Biomedico.md` y el
modelo de negocio de `../Modelo_de_Negocio_Pulso_Biomedico.md`, partiendo de los
archivos base de `../ref_files`.

## Stack

- **Vite + React 19 + TypeScript**
- **react-router-dom** (rutas separadas por rol)
- **Tailwind CSS v4** (`@tailwindcss/vite`) con el design system de Pulso
- **lucide-react** para iconografía
- Datos simulados + **localStorage** (`src/lib/mock/data.ts`, `src/lib/store.tsx`)

## Cómo correr

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run preview  # sirve dist/
npm run lint
```

## Cuentas de demostración

El correo define a qué portal entras. Contraseña para todas: `pulso123`.

| Correo | Portal |
|---|---|
| `consultorio@pulso.co` | Portal del consultorio (Clínica Odontológica Sanare, Cali) |
| `ingeniero@pulso.co` | Portal del ingeniero (Laura Medina, Cali) |
| `admin@pulso.co` | Administración Pulso |

También hay botones de acceso rápido en `/ingresar`.

## Mapa de rutas

El landing (`/`) integra las secciones **Cómo funciona** y **Planes y precios**
(anclas), y el directorio vive dentro del portal del consultorio.

**Público:** `/`, `/ingenieros/:slug` (perfil público del ingeniero),
`/ingresar`, `/registro`.

**Consultorio:** `/consultorio` (panel + semáforo), `/onboarding` (diagnóstico,
cotización y contratación), `/equipos`, `/equipos/:id`, `/expediente`,
`/cronograma` (vista lista o calendario), `/solicitudes`,
`/solicitudes/nueva` (triage por criticidad), `/diagnostico-expres`,
`/ingenieros` (red de ingenieros verificados), `/repuestos`, `/calidad`,
`/perfil`.

**Ingeniero:** `/ingeniero` (panel), `/verificacion`, `/agenda` (lista o
calendario), `/solicitudes`, `/servicios/:id` (checklist, evidencia, cierre,
capacitación), `/repuestos`, `/historial`, `/perfil`.

**Admin:** `/admin` (métricas de canal), `/verificacion`, `/calidad`, `/aliados`,
`/planes`.

## Analítica (Vercel Web Analytics)

Este proyecto es **Vite + React**, no Next.js, así que se usa el entry
`@vercel/analytics/react` (el `/next` es exclusivo de Next y rompe el build de
Vite). Ya está instalado.

- **Pageviews:** `<Analytics />` en `src/App.tsx` (raíz de la app). El script
  detecta los cambios de ruta del SPA (react-router usa `pushState`).
- **Eventos personalizados:** helper `track` y hook `useTiempoEnPagina` en
  `src/lib/analytics.ts` (best-effort: nunca rompe la app).
- **Tiempo en página:** `tiempo_en_pagina` con `{ pagina, segundos }`, medido
  solo con la pestaña visible. Instrumentado en: `landing`, `login`, `registro`,
  `portal_consultorio`, `portal_ingeniero`, `portal_admin`, `red_ingenieros`.
- **Eventos de negocio:** `login`, `registro`, `plan_contratado`,
  `solicitud_creada`, `diagnostico_expres_solicitado`, `servicio_aceptado`,
  `servicio_rechazado`, `servicio_cerrado`, `calificacion_enviada`,
  `reclamo_radicado`, `repuesto_solicitado`, `cta_ver_planes`,
  `cta_solicitar_diagnostico`.

### Checklist para que salgan los datos

1. **Habilita Web Analytics** en el dashboard de Vercel (proyecto → Analytics →
   Enable). Esto agrega las rutas `/_vercel/insights/*` **en el próximo deploy**.
2. **Vuelve a desplegar y promueve a producción** después de habilitarlo. Si
   desplegaste antes de habilitarlo, `/_vercel/insights/script.js` da **404** y
   no se registra nada (es la causa más común).
3. **Verifica** en la pestaña Network una petición a `/_vercel/insights/view`
   (o `/<unique-path>/view`) al navegar. Si no aparece, revisa el paso 2.
4. **Root Directory**: si despliegas desde la raíz del repo, configura
   `pulso-biomedico` como Root Directory; Vercel detecta Vite y usa `dist`.
5. **Eventos personalizados**: los `track(...)` (incluido `tiempo_en_pagina`)
   requieren plan **Pro o Enterprise**. En Hobby solo verás pageviews.
6. **Ad blockers**: uBlock/AdBlock pueden bloquear `/_vercel/insights/script.js`.
   Si es tu caso, prueba en incógnito sin extensiones.
7. En `npm run dev` los eventos se registran en la consola con el script de
   debug; **no** se envían al dashboard.

`vercel.json` incluye rewrites explícitos para las rutas del SPA (deep links
como `/consultorio` sirven `index.html`) sin tocar `/_vercel/*`.

## Modelo de cobro

- **Acuerdo directo con el ingeniero:** el mantenimiento se acuerda entre el
  consultorio y el ingeniero; Pulso media y cobra una **comisión por servicio**.
- **Plan mensual (opcional):** toda la logística de ordenamiento y las
  esquemáticas de seguimiento. Es la **única cuota mensual**. Dos planes:
  **Plan Básico** (consultorios pequeños) y **Plan Custom** (organizaciones más
  grandes, condiciones **a convenir** con el equipo).

## Aterrizaje al contexto colombiano

- Normativa: **Resolución 1732 de 2026** (deroga la 3100 de 2019, transición de 12
  meses) y semáforo de habilitación.
- Mercado: cifras del **REPS** (59.092 prestadores, ~7.400 sedes del Valle) y foco
  en Cali y su área metropolitana.
- Credenciales: **INVIMA** y **COPNIA** para la verificación de ingenieros.
- Precios en **COP** y catálogo real de equipos de consultorio (odontología,
  esterilización, laboratorio, imágenes).
- Mecanismos del modelo: triage por criticidad, rutas por zona, diagnóstico exprés,
  capacitación en visita, planes periódicos y módulo de repuestos canalizado a
  distribuidores autorizados (sin ser importador).

## Estructura

```
src/
├─ components/  ui (primitivas), site (público), app (portal), shared
├─ lib/         mock/data, store (localStorage), session, format
└─ pages/       public, consultorio, ingeniero, admin
```

Los datos viven en el navegador; el botón **Restaurar demo** del portal restablece
la semilla original.
