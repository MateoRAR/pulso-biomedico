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
- **three + @react-three/fiber** para el consultorio 3D y la biblioteca de equipos (carga diferida)
- **maplibre-gl** para el mapa 3D del administrador (carga diferida; mapa base de OpenFreeMap / OpenStreetMap)
- **React Bits** (`src/components/reactbits/` y `site/ghost-fibers/`): GhostFibers como fondo de la landing, el ingreso y el
  registro; SpotlightCard, StarBorder, ShinyText, GradientText, BorderGlow y LogoLoop en la landing y los resúmenes
- Datos de demostración en **JSON** (`src/data/`) consultados mediante **services** (`src/services/`),
  con los cambios guardados en **sessionStorage**: nada persiste después de cerrar la pestaña

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

También hay botones de acceso rápido en `/ingresar`. Además, cada consultorio e ingeniero de los datos de ejemplo
tiene su propio usuario (ver `src/data/usuarios.json`; contraseña `pulso123`). Todas las cuentas leen y escriben en
la misma "base de datos" de la sesión, así que lo que hace una se ve en las otras.

### Crear tu propia cuenta (solo dura la sesión)

`/registro` es una conversación de cinco pasos (rol, nombre, lugar, perfil, acceso). Al terminar se crean tu usuario y
tu consultorio (o tu perfil de ingeniero) en la base de la sesión:

- **Consultorio:** arranca con su nombre, ciudad y zona, sin equipos. Puede cargar equipos de ejemplo, registrar los
  suyos, pedir servicios y ver cómo avanzan. Solo ve los datos de su consultorio.
- **Ingeniero:** arranca con su perfil (pendiente de verificación) y su zona, y ve las solicitudes abiertas de su
  ciudad; siguen llegando otras mientras trabaja.

Todo se guarda en `sessionStorage`: sobrevive a recargar y a cerrar/abrir sesión, pero **desaparece al cerrar la
pestaña**.

## Datos: JSON + services

Los datos viven en `src/data/*.json`, un archivo por entidad (`consultorios`, `usuarios`, `ingenieros`,
`equipos`, `servicios`, `documentos`, `calificaciones`, `reclamos`, `repuestos`, `aliados`, `notificaciones`,
`planes`, `ciudades`). La aplicación **no los lee directamente**: pasa por `src/services/*Service.ts`,
que se comportan como una base de datos (`listar`, `obtener`, `crear`, `actualizar`, `eliminar`, `restaurar`),
con métodos propios cuando hacen falta (`usuariosService.autenticar`, `consultoriosService.desactivar`…).

- Los JSON son de solo lectura. Todo cambio (editar, crear, desactivar, mover un pin) se guarda en una copia en
  `sessionStorage`; al cerrar la pestaña se pierde. Cambiar esto por una API real solo toca `services/`.
- Las fechas pueden escribirse relativas a hoy (`"+21d"`, `"-10d"`) para que los vencimientos de la demo siempre
  estén cerca.
- **Los datos de demostración son ficticios**: 12 consultorios, 8 ingenieros, equipos, servicios y usuarios repartidos
  en Cali, Yumbo, Palmira, Pereira, Bogotá y Medellín, con coordenadas en barrios reales. Las contraseñas de los
  usuarios de ejemplo están en texto plano **solo por ser demostración**; una base real debe guardar un hash.
- La calificación y el número de servicios de cada ingeniero **se calculan** a partir de las calificaciones y los
  servicios registrados; no hay cifras escritas a mano. El resumen del administrador también se calcula en vivo.
- `src/lib/store.tsx` es una caché en memoria con una vista por rol (el consultorio ve lo suyo, el ingeniero ve las
  solicitudes de su ciudad, el administrador ve todo).

## Experiencia

- **Consultorio en 3D** (`/consultorio/mi-consultorio`): una sala generada con los equipos reales del inventario,
  repartidos por zonas. Se recorre tocando lugares marcados o con los botones, se mira alrededor arrastrando y, al
  tocar un equipo, aparece su información. El anillo del piso muestra su estado. Los modelos se generan en código
  (`src/components/consultorio3d/modelos.tsx`) y son **representaciones ilustrativas**, no la marca exacta.
- **Biblioteca de equipos** (`/consultorio/biblioteca`): cada tipo de equipo se puede girar y acercar, con sus
  partes principales explicadas.
- **Cada vista 3D tiene una versión en tabla** («Ver como tabla»), más sobria. En celulares, con «reducir movimiento»
  o sin WebGL se abre primero la tabla; la última elección se recuerda durante la sesión. Solo se descarga el 3D si
  alguien lo pide.
- **Administrador**: `/admin/mapa` muestra un mapa 3D por ciudad (pestañas para Cali, Yumbo, Palmira, Pereira, Bogotá
  y Medellín); cada pin es un consultorio que se toca para editar su ficha, se arrastra para corregir su ubicación,
  y se pueden crear o desactivar consultorios. `/admin/ingenieros` permite buscar, filtrar y editar a cada ingeniero
  y aprobar o rechazar su verificación. Si el mapa no carga (sin internet), se ofrece la tabla.
- **Pulso, el asistente** (`AsistentePulso.tsx`): botón «Ayuda» que lee los datos y conversa sobre vencimientos,
  solicitudes y próximos pasos (reglas, sin modelo de lenguaje).
- **Motor vivo** (`MotorVivo.tsx`): simula a las personas del otro lado. Una solicitud del consultorio se asigna, se
  confirma, entra en ejecución y se cierra sola (con informe en los documentos y el estado del equipo actualizado); al
  ingeniero le llegan solicitudes nuevas de su ciudad. Los tiempos están acelerados a propósito para ver el ciclo.
- **Pensado para todas las personas**: letra compacta (15 px de base), menú corto con nombres sencillos, un botón
  principal por pantalla, barra inferior en el celular, tablas que se convierten en tarjetas y pocas animaciones. Los fondos
  animados respetan «reducir movimiento».

## Mapa de rutas

El landing (`/`) integra las secciones **Cómo funciona** y **Planes y precios**
(anclas), y el directorio vive dentro del portal del consultorio.

**Público:** `/`, `/ingenieros/:slug` (perfil público del ingeniero),
`/ingresar`, `/registro`.

**Consultorio:** `/consultorio` (inicio y estado de los equipos), `/onboarding` (revisión inicial,
cotización y contratación), `/equipos`, `/equipos/:id`, `/mi-consultorio` (3D), `/biblioteca` y
`/biblioteca/:tipo` (3D), `/expediente` (documentos), `/cronograma` (lista o calendario), `/solicitudes`,
`/solicitudes/nueva` (con elección de ingeniero), `/diagnostico-expres`, `/ingenieros` y
`/ingenieros/:slug` (encontrar ingeniero, sin salir del portal), `/repuestos`, `/calidad`, `/perfil`.

**Ingeniero:** `/ingeniero` (panel), `/verificacion`, `/agenda` (lista o
calendario), `/solicitudes`, `/servicios/:id` (checklist, evidencia, cierre,
capacitación), `/repuestos`, `/historial`, `/perfil`.

**Admin:** `/admin` (resumen calculado), `/mapa` (consultorios en mapa 3D o tabla), `/ingenieros`,
`/verificacion`, `/calidad`, `/aliados`, `/planes`.

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
7. **Comparte el dominio de producción, no la URL de despliegue.** En el plan
   Hobby, *Vercel Authentication (Standard Protection)* protege las URLs de
   **preview** y las URLs autogeneradas de **deployment**
   (`pulso-biomedico-<hash>.vercel.app`): cualquier persona que no esté logueada
   en Vercel ve una pantalla de login, la app nunca carga y por lo tanto **no se
   envían analytics**. Tu propia visita sí cuenta porque tu navegador ya está
   autenticado. Solución:
   - comparte el **dominio de producción** (`pulso-biomedico.vercel.app` o tu
     dominio propio), que sí es público; y
   - si quieres compartir previews, cambia el alcance en
     **Settings → Deployment Protection → Vercel Authentication** a
     *Only Preview Deployments* o desactívalo.
   Verifícalo en una ventana de incógnito: si ves el login de Vercel, es esto.
8. **Filtro de entorno del dashboard**: en Analytics, arriba a la derecha, elige
   **All Environments** o **Production**. Por defecto muestra Production, así que
   si solo desplegaste un preview no verás nada.
9. En `npm run dev` los eventos se registran en la consola con el script de
   debug; **no** se envían al dashboard.

### Anti-adblock (ruta disfrazada)

Los bloqueadores cortan `/_vercel/insights/script.js` (regla EasyPrivacy). Esa
es la causa de que **algunos visitantes no queden registrados** aunque el sitio
les cargue bien (típico: tu incógnito sí registra y otro PC con uBlock no).

Para mitigarlo:

- `src/components/shared/AnalyticsConRespaldo.tsx` carga el script desde
  `/medicion/script.js` y reporta a `/medicion/view` y `/medicion/event`.
- `vercel.json` reescribe `/medicion/:match*` → `/_vercel/insights/:match*`.
- Si la ruta disfrazada falla (404), **cae automáticamente** a la ruta oficial
  `/_vercel/insights/script.js`, así que la medición nunca se pierde.

Si el rewrite relativo no resolviera en tu proyecto, usa la URL **absoluta** de
tu dominio de producción (es lo que recomienda la comunidad):

```json
{
  "source": "/medicion/:match*",
  "destination": "https://TU-DOMINIO.vercel.app/_vercel/insights/:match*"
}
```

Verificación: en el navegador → Network debe aparecer `/medicion/script.js`
(200) y peticiones a `/medicion/view`. Prueba en un PC con adblocker encendido.

`vercel.json` también incluye rewrites explícitos para las rutas del SPA (deep
links como `/consultorio` sirven `index.html`) sin tocar `/_vercel/*`.

## Modelo de cobro

- **Acuerdo directo con el ingeniero:** el mantenimiento se acuerda entre el
  consultorio y el ingeniero; Pulso media y cobra una **comisión por servicio**.
- **Plan mensual (opcional):** toda la logística de ordenamiento y las
  esquemáticas de seguimiento. Es la **única cuota mensual**. Dos planes:
  **Plan Básico** (consultorios pequeños) y **Plan Custom** (organizaciones más
  grandes, condiciones **a convenir** con el equipo).

## Aterrizaje al contexto colombiano

- Habilitación: la plataforma ordena hojas de vida, certificados y vencimientos para estar listo ante la norma que
  esté vigente. **No se afirma qué resolución rige**: el marco normativo cambia y debe confirmarse siempre en el
  normograma oficial del Ministerio de Salud (por ejemplo, la Resolución 1732 de 2026 fue anunciada y luego
  revocada; verifica el estado actual antes de citar cualquier norma).
- La landing **no muestra cifras de mercado**: ninguna estadística que no se pueda verificar con los datos de la
  aplicación o con una fuente confiable.
- Credenciales: **INVIMA** y **COPNIA** para la verificación de ingenieros.
- Precios en **COP** y catálogo de equipos de consultorio (odontología, esterilización, laboratorio, imágenes).
- Mecanismos del modelo: urgencia de cada solicitud, rutas por zona, revisión rápida de un equipo, capacitación en
  visita, planes periódicos y módulo de repuestos canalizado a distribuidores autorizados (sin ser importador).

## Estructura

```
src/
├─ data/                  JSON de demostración (uno por entidad) + tipos y catálogos
├─ services/              acceso a los datos como si fueran una base de datos
├─ components/
│  ├─ ui, shared          primitivas y piezas comunes (VistaDual: 3D ↔ tabla)
│  ├─ site                público (barra, fondo GhostFibers, ingreso/registro)
│  ├─ app                 portal (menú, asistente, motor vivo)
│  ├─ consultorio3d       sala 3D, visor de equipos y modelos
│  └─ admin               mapa 3D (MapLibre)
├─ lib/                   store (caché por rol), session, registro, tema, format
└─ pages/                 public, consultorio, ingeniero, admin
```

Los datos que crea cada persona viven en la pestaña del navegador (`sessionStorage`); el botón **Restaurar datos de
ejemplo** del portal vuelve a los JSON (conservando las cuentas creadas al registrarse).
