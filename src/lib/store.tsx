import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'

import type {
  Aliado,
  Calificacion,
  Ciudad,
  Consultorio,
  Documento,
  Equipo,
  Ingeniero,
  IngenieroRegistro,
  Notificacion,
  PedidoRepuesto,
  Plan,
  Reclamo,
  Servicio,
  Usuario,
} from '@/data/tipos'
import { bienvenidaConsultorio, bienvenidaIngeniero, construirRegistro, type DatosRegistro } from '@/lib/registro'
import { sesionDeUsuario, useSession, type Sesion } from '@/lib/session'
import {
  cargarBase,
  consultoriosService,
  documentosService,
  calificacionesService,
  enriquecerIngenieros,
  equiposService,
  ingenierosService,
  notificacionesService,
  reclamosService,
  reiniciarCuenta,
  repuestosService,
  restaurarDemo,
  serviciosService,
  usuariosService,
  type Base,
} from '@/services'

/**
 * Vista de los datos para la persona que tiene la sesión abierta. Por debajo, todo se lee y se
 * escribe a través de los servicios de `src/services` (la "base de datos" JSON + sesión).
 * Esto es solo una caché en memoria para que las pantallas se pinten sin esperas.
 *
 *  - consultorio: ve únicamente lo de su consultorio (y la red de ingenieros).
 *  - ingeniero:  ve las solicitudes de todos los consultorios (cada pantalla filtra las suyas).
 *  - admin:      ve todo.
 */
export interface DataState {
  /** Consultorio de la sesión (o uno de referencia si la sesión no es de consultorio). */
  consultorio: Consultorio
  consultorios: Consultorio[]
  ciudades: Ciudad[]
  usuarios: Usuario[]
  equipos: Equipo[]
  ingenieros: Ingeniero[]
  servicios: Servicio[]
  documentos: Documento[]
  calificaciones: Calificacion[]
  reclamos: Reclamo[]
  repuestos: PedidoRepuesto[]
  aliados: Aliado[]
  notificaciones: Notificacion[]
  planes: Plan[]
}

const CAMPOS_CALCULADOS = ['calificacion', 'servicios', 'opiniones'] as const

interface DataContextValue extends DataState {
  /** Identifica la cuenta activa (correo) o "anonimo" en las páginas públicas. */
  espacio: string
  agregarServicio: (servicio: Servicio) => void
  actualizarServicio: (id: string, cambios: Partial<Servicio>) => void
  agregarEquipo: (equipo: Equipo) => void
  agregarEquipos: (equipos: Equipo[]) => void
  actualizarEquipo: (id: string, cambios: Partial<Equipo>) => void
  /** Edita el consultorio de la sesión. */
  actualizarConsultorio: (cambios: Partial<Consultorio>) => void
  /** Administración: crea o edita cualquier consultorio. */
  crearConsultorio: (consultorio: Consultorio) => void
  actualizarConsultorioPorId: (id: string, cambios: Partial<Consultorio>) => void
  crearIngeniero: (ingeniero: IngenieroRegistro) => void
  actualizarIngeniero: (id: string, cambios: Partial<Ingeniero>) => void
  actualizarUsuario: (id: string, cambios: Partial<Usuario>) => void
  agregarDocumento: (documento: Documento) => void
  agregarCalificacion: (calificacion: Calificacion) => void
  agregarReclamo: (reclamo: Reclamo) => void
  agregarPedido: (pedido: PedidoRepuesto) => void
  agregarNotificacion: (notificacion: Notificacion) => void
  marcarNotificacion: (id: string) => void
  marcarTodasNotificaciones: (para: Notificacion['para']) => void
  reiniciarEspacio: () => void
  recargar: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

function PantallaCarga() {
  return (
    <div className="grid min-h-svh place-items-center bg-background text-muted-foreground" role="status">
      <p className="text-base">Cargando Pulso Biomédico…</p>
    </div>
  )
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [base, setBase] = useState<Base | null>(null)

  useEffect(() => {
    let vivo = true
    void cargarBase().then((b) => vivo && setBase(b))
    return () => {
      vivo = false
    }
  }, [])

  if (!base) return <PantallaCarga />
  return <Fuente base={base} setBase={setBase as Dispatch<SetStateAction<Base>>}>{children}</Fuente>
}

function vistaPara(base: Base, sesion: Sesion | null): DataState {
  const ingenieros = enriquecerIngenieros(base.ingenieros, base.calificaciones, base.servicios)
  const referencia = base.consultorios[0]
  const propio = base.consultorios.find((c) => c.id === sesion?.consultorioId)
  const rol = sesion?.rol
  const ref = sesion?.consultorioId ?? sesion?.ingenieroId

  const comun = {
    consultorios: base.consultorios,
    ciudades: base.ciudades,
    usuarios: base.usuarios,
    aliados: base.aliados,
    planes: base.planes,
  }

  if (rol === 'consultorio' && propio) {
    const equipos = base.equipos.filter((e) => e.consultorioId === propio.id)
    const idsEquipos = new Set(equipos.map((e) => e.id))
    const servicios = base.servicios.filter((s) => s.consultorioId === propio.id)
    const idsServicios = new Set(servicios.map((s) => s.id))
    return {
      ...comun,
      consultorio: propio,
      equipos,
      servicios,
      ingenieros: ingenieros.filter((i) => i.activo),
      documentos: base.documentos.filter((d) => idsEquipos.has(d.equipoId)),
      calificaciones: base.calificaciones.filter((c) => idsServicios.has(c.servicioId)),
      reclamos: base.reclamos.filter((r) => r.consultorioId === propio.id),
      repuestos: base.repuestos.filter((r) => r.consultorioId === propio.id),
      notificaciones: base.notificaciones.filter((n) => n.para === 'consultorio' && (!n.refId || n.refId === ref)),
    }
  }

  return {
    ...comun,
    consultorio: propio ?? referencia,
    equipos: base.equipos,
    servicios: base.servicios,
    ingenieros: rol === 'admin' ? ingenieros : ingenieros.filter((i) => i.activo),
    documentos: base.documentos,
    calificaciones: base.calificaciones,
    reclamos: base.reclamos,
    repuestos: base.repuestos,
    notificaciones: base.notificaciones.filter((n) => n.para === rol && (!n.refId || n.refId === ref)),
  }
}

function Fuente({
  base,
  setBase,
  children,
}: {
  base: Base
  setBase: Dispatch<SetStateAction<Base>>
  children: ReactNode
}) {
  const { sesion } = useSession()
  const vista = useMemo(() => vistaPara(base, sesion), [base, sesion])

  const recargar = useCallback(async () => setBase(await cargarBase()), [setBase])

  const acciones = useMemo(() => {
    const consultorioId = sesion?.consultorioId
    const ingenieroId = sesion?.ingenieroId
    return {
      agregarServicio: (servicio: Servicio) => {
        setBase((b) => ({ ...b, servicios: [servicio, ...b.servicios] }))
        void serviciosService.crear(servicio, true)
      },
      actualizarServicio: (id: string, cambios: Partial<Servicio>) => {
        setBase((b) => ({ ...b, servicios: b.servicios.map((x) => (x.id === id ? { ...x, ...cambios } : x)) }))
        void serviciosService.actualizar(id, cambios)
      },
      agregarEquipo: (equipo: Equipo) => {
        setBase((b) => ({ ...b, equipos: [...b.equipos, equipo] }))
        void equiposService.crear(equipo)
      },
      agregarEquipos: (equipos: Equipo[]) => {
        setBase((b) => ({ ...b, equipos: [...b.equipos, ...equipos] }))
        equipos.forEach((e) => void equiposService.crear(e))
      },
      actualizarEquipo: (id: string, cambios: Partial<Equipo>) => {
        setBase((b) => ({ ...b, equipos: b.equipos.map((x) => (x.id === id ? { ...x, ...cambios } : x)) }))
        void equiposService.actualizar(id, cambios)
      },
      actualizarConsultorio: (cambios: Partial<Consultorio>) => {
        if (!consultorioId) return
        setBase((b) => ({ ...b, consultorios: b.consultorios.map((x) => (x.id === consultorioId ? { ...x, ...cambios } : x)) }))
        void consultoriosService.actualizar(consultorioId, cambios)
      },
      crearConsultorio: (consultorio: Consultorio) => {
        setBase((b) => ({ ...b, consultorios: [...b.consultorios, consultorio] }))
        void consultoriosService.crear(consultorio)
      },
      actualizarConsultorioPorId: (id: string, cambios: Partial<Consultorio>) => {
        setBase((b) => ({ ...b, consultorios: b.consultorios.map((x) => (x.id === id ? { ...x, ...cambios } : x)) }))
        void consultoriosService.actualizar(id, cambios)
      },
      crearIngeniero: (ingeniero: IngenieroRegistro) => {
        setBase((b) => ({ ...b, ingenieros: [...b.ingenieros, ingeniero] }))
        void ingenierosService.crear(ingeniero)
      },
      actualizarIngeniero: (id: string, cambios: Partial<Ingeniero>) => {
        const limpios: Partial<IngenieroRegistro> = { ...cambios }
        CAMPOS_CALCULADOS.forEach((campo) => delete (limpios as Record<string, unknown>)[campo])
        setBase((b) => ({ ...b, ingenieros: b.ingenieros.map((x) => (x.id === id ? { ...x, ...limpios } : x)) }))
        void ingenierosService.actualizar(id, limpios)
      },
      actualizarUsuario: (id: string, cambios: Partial<Usuario>) => {
        setBase((b) => ({ ...b, usuarios: b.usuarios.map((x) => (x.id === id ? { ...x, ...cambios } : x)) }))
        void usuariosService.actualizar(id, cambios)
      },
      agregarDocumento: (documento: Documento) => {
        setBase((b) => ({ ...b, documentos: [documento, ...b.documentos] }))
        void documentosService.crear(documento, true)
      },
      agregarCalificacion: (calificacion: Calificacion) => {
        setBase((b) => ({ ...b, calificaciones: [calificacion, ...b.calificaciones] }))
        void calificacionesService.crear(calificacion, true)
      },
      agregarReclamo: (reclamo: Reclamo) => {
        setBase((b) => ({ ...b, reclamos: [reclamo, ...b.reclamos] }))
        void reclamosService.crear(reclamo, true)
      },
      agregarPedido: (pedido: PedidoRepuesto) => {
        setBase((b) => ({ ...b, repuestos: [pedido, ...b.repuestos] }))
        void repuestosService.crear(pedido, true)
      },
      agregarNotificacion: (notificacion: Notificacion) => {
        setBase((b) => ({ ...b, notificaciones: [notificacion, ...b.notificaciones] }))
        void notificacionesService.crear(notificacion, true)
      },
      marcarNotificacion: (id: string) => {
        setBase((b) => ({ ...b, notificaciones: b.notificaciones.map((n) => (n.id === id ? { ...n, leida: true } : n)) }))
        void notificacionesService.actualizar(id, { leida: true })
      },
      marcarTodasNotificaciones: (para: Notificacion['para']) => {
        const ref = consultorioId ?? ingenieroId
        const propia = (n: Notificacion) => n.para === para && (!n.refId || n.refId === ref)
        setBase((b) => {
          const notificaciones = b.notificaciones.map((n) => (propia(n) ? { ...n, leida: true } : n))
          void notificacionesService.reemplazar(notificaciones)
          return { ...b, notificaciones }
        })
      },
      reiniciarEspacio: () => {
        if (!sesion || sesion.demo) {
          void restaurarDemo().then(setBase)
          return
        }
        const bienvenida = consultorioId
          ? bienvenidaConsultorio(sesion.nombre, sesion.organizacion ?? '', consultorioId)
          : ingenieroId
            ? bienvenidaIngeniero(sesion.nombre, ingenieroId)
            : []
        void reiniciarCuenta({ consultorioId, ingenieroId }, bienvenida).then(setBase)
      },
      recargar,
    }
  }, [sesion, setBase, recargar])

  const value = useMemo<DataContextValue>(
    () => ({ ...vista, espacio: sesion?.email ?? 'anonimo', ...acciones }),
    [vista, sesion, acciones],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData debe usarse dentro de <DataProvider>')
  return context
}

/** Perfil del ingeniero que tiene la sesión abierta (cuenta de demostración o creada al registrarse). */
export function useIngenieroActual(): Ingeniero {
  const { sesion } = useSession()
  const { ingenieros } = useData()
  return (
    ingenieros.find((i) => sesion?.ingenieroId && i.id === sesion.ingenieroId) ??
    ingenieros.find((i) => i.nombre === sesion?.nombre) ??
    ingenieros[0]
  )
}

export type ResultadoIngreso =
  | { ok: true; sesion: Sesion }
  | { ok: false; motivo: 'no-existe' | 'clave' | 'inactiva'; pista?: string }

export type ResultadoRegistro = { ok: true; sesion: Sesion } | { ok: false; motivo: 'existe' }

/** Ingresar y registrarse: leen y escriben en el service de usuarios y luego abren la sesión. */
export function useAutenticacion() {
  const { abrirSesion } = useSession()
  const { recargar } = useData()

  const ingresar = useCallback(
    async (email: string, password: string): Promise<ResultadoIngreso> => {
      const { usuario, motivo } = await usuariosService.autenticar(email, password)
      if (!usuario) {
        const demo = motivo === 'clave' ? (await usuariosService.porEmail(email))?.origen === 'demo' : false
        return { ok: false, motivo: motivo ?? 'no-existe', pista: demo ? 'pulso123' : undefined }
      }
      const sesion = sesionDeUsuario(usuario)
      abrirSesion(sesion)
      return { ok: true, sesion }
    },
    [abrirSesion],
  )

  const registrar = useCallback(
    async (datos: DatosRegistro): Promise<ResultadoRegistro> => {
      if (await usuariosService.porEmail(datos.email)) return { ok: false, motivo: 'existe' }
      const { usuario, consultorio, ingeniero, notificaciones } = construirRegistro(datos)
      await usuariosService.crear(usuario)
      if (consultorio) await consultoriosService.crear(consultorio)
      if (ingeniero) await ingenierosService.crear(ingeniero)
      for (const n of notificaciones) await notificacionesService.crear(n, true)
      await recargar()
      const sesion = sesionDeUsuario(usuario)
      abrirSesion(sesion)
      return { ok: true, sesion }
    },
    [abrirSesion, recargar],
  )

  return { ingresar, registrar }
}
