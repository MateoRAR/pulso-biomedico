/**
 * "Base de datos" de la aplicación.
 *
 * Los archivos de `src/data/*.json` son la fuente de lectura. Cualquier cambio (crear,
 * editar, desactivar…) se guarda en una copia en `sessionStorage`, así que dura lo que
 * dure la pestaña. Todos los métodos son asíncronos para que reemplazar esto por una API
 * real no cambie a quien los usa.
 *
 * Las fechas del JSON pueden escribirse relativas a hoy ("+21d", "-10d") para que la
 * demostración siempre tenga vencimientos cercanos.
 */

const PREFIJO = 'pulso.db.v7.'

const RELATIVA = /^([+-]\d+)d$/

function aISO(dias: number): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

function resolverFechas<T>(valor: T): T {
  if (typeof valor === 'string') {
    const m = RELATIVA.exec(valor)
    return (m ? aISO(Number(m[1])) : valor) as T
  }
  if (Array.isArray(valor)) return valor.map(resolverFechas) as T
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, resolverFechas(v)])) as T
  }
  return valor
}

export class Coleccion<T extends { id: string }> {
  readonly nombre: string
  private readonly inicial: T[]

  constructor(nombre: string, inicial: T[]) {
    this.nombre = nombre
    this.inicial = inicial
  }

  private deSesion(): T[] | null {
    try {
      const crudo = window.sessionStorage.getItem(PREFIJO + this.nombre)
      return crudo ? (JSON.parse(crudo) as T[]) : null
    } catch {
      return null
    }
  }

  private guardar(items: T[]): void {
    try {
      window.sessionStorage.setItem(PREFIJO + this.nombre, JSON.stringify(items))
    } catch {
      // sin almacenamiento: los cambios viven solo en memoria de esta carga
    }
  }

  private datos(): T[] {
    return this.deSesion() ?? resolverFechas(this.inicial)
  }

  async listar(): Promise<T[]> {
    return this.datos()
  }

  async obtener(id: string): Promise<T | undefined> {
    return this.datos().find((x) => x.id === id)
  }

  async crear(item: T, alInicio = false): Promise<T> {
    const items = this.datos()
    this.guardar(alInicio ? [item, ...items] : [...items, item])
    return item
  }

  async actualizar(id: string, cambios: Partial<T>): Promise<T | undefined> {
    const items = this.datos().map((x) => (x.id === id ? { ...x, ...cambios } : x))
    this.guardar(items)
    return items.find((x) => x.id === id)
  }

  async eliminar(id: string): Promise<void> {
    this.guardar(this.datos().filter((x) => x.id !== id))
  }

  async reemplazar(items: T[]): Promise<void> {
    this.guardar(items)
  }

  /**
   * Vuelve a los datos del JSON. `conservar` permite mantener los registros creados en la
   * sesión (por ejemplo, las cuentas registradas) que cumplan la condición.
   */
  async restaurar(conservar?: (item: T) => boolean): Promise<T[]> {
    const base = resolverFechas(this.inicial)
    if (!conservar) {
      try {
        window.sessionStorage.removeItem(PREFIJO + this.nombre)
      } catch {
        // nada que borrar
      }
      return base
    }
    const propios = this.datos().filter((x) => !base.some((b) => b.id === x.id) && conservar(x))
    const resultado = [...base, ...propios]
    this.guardar(resultado)
    return resultado
  }
}
