import json from '@/data/usuarios.json'
import type { Usuario } from '@/data/tipos'

import { Coleccion } from './almacen'

class UsuariosService extends Coleccion<Usuario> {
  async porEmail(email: string): Promise<Usuario | undefined> {
    const limpio = email.trim().toLowerCase()
    return (await this.listar()).find((u) => u.email.toLowerCase() === limpio)
  }

  /** Devuelve el usuario si el correo y la contraseña coinciden y la cuenta está activa. */
  async autenticar(
    email: string,
    password: string,
  ): Promise<{ usuario?: Usuario; motivo?: 'no-existe' | 'clave' | 'inactiva' }> {
    const usuario = await this.porEmail(email)
    if (!usuario) return { motivo: 'no-existe' }
    if (!usuario.activo) return { motivo: 'inactiva' }
    if (usuario.password !== password) return { motivo: 'clave' }
    return { usuario }
  }

  async creadosEnSesion(): Promise<Usuario[]> {
    return (await this.listar()).filter((u) => u.origen === 'registro')
  }
}

export const usuariosService = new UsuariosService('usuarios', json as unknown as Usuario[])
