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

## Modelo de cobro

- **Acuerdo directo con el ingeniero:** el mantenimiento se acuerda entre el
  consultorio y el ingeniero; Pulso media y cobra una **comisión por servicio**.
- **Plan mensual (opcional):** toda la logística de ordenamiento y las
  esquemáticas de seguimiento. Es la **única cuota mensual**. Dos planes:
  **Plan Pulso** (consultorios) y **Plan Custom** (organizaciones más grandes,
  cotización a medida).

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
