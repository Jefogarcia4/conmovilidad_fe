import { createContext } from 'react'
import type { UsuarioAutenticado } from '@/api/types'

export interface EstadoAuth {
  usuario: UsuarioAutenticado | null
  estaAutenticado: boolean
  /** `aceptaTerminos` deja constancia de la primera aceptación; ver `ServicioAutenticacion`. */
  iniciarSesion: (email: string, password: string, aceptaTerminos: boolean) => Promise<void>
  cerrarSesion: () => Promise<void>
  /** Vuelve a leer el perfil de la API, p. ej. tras cambiar la contraseña obligatoria. */
  refrescarPerfil: () => Promise<void>
}

export const AuthContext = createContext<EstadoAuth | null>(null)
