import type { AuthResponse, UsuarioAutenticado } from './types'

/**
 * Almacenamiento de la sesión.
 *
 * Se usa `localStorage` para que la sesión sobreviva a recargas y pestañas nuevas. Es una decisión
 * consciente: expone los tokens a un XSS, y el mitigante real es no inyectar HTML sin sanear.
 * La alternativa robusta —refresh token en cookie httpOnly— exige que la API emita cookies y que
 * front y API compartan dominio; queda anotado para cuando se defina el despliegue.
 */
const CLAVE_ACCESS = 'conmovilidad.accessToken'
const CLAVE_REFRESH = 'conmovilidad.refreshToken'
const CLAVE_USUARIO = 'conmovilidad.usuario'

/** Se notifica a la app cuando la sesión se invalida desde fuera del árbol de React. */
type Escucha = () => void
const escuchas = new Set<Escucha>()

export const sesion = {
  get accessToken() {
    return localStorage.getItem(CLAVE_ACCESS)
  },

  get refreshToken() {
    return localStorage.getItem(CLAVE_REFRESH)
  },

  get usuario(): UsuarioAutenticado | null {
    const crudo = localStorage.getItem(CLAVE_USUARIO)
    if (!crudo) return null

    try {
      return JSON.parse(crudo) as UsuarioAutenticado
    } catch {
      // Dato corrupto de una versión anterior: se descarta en vez de romper el arranque.
      localStorage.removeItem(CLAVE_USUARIO)
      return null
    }
  },

  guardar(auth: AuthResponse) {
    localStorage.setItem(CLAVE_ACCESS, auth.accessToken)
    localStorage.setItem(CLAVE_REFRESH, auth.refreshToken)
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(auth.usuario))
  },

  /** Refresca solo el perfil, conservando los tokens vigentes. */
  actualizarUsuario(usuario: UsuarioAutenticado) {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
  },

  limpiar() {
    localStorage.removeItem(CLAVE_ACCESS)
    localStorage.removeItem(CLAVE_REFRESH)
    localStorage.removeItem(CLAVE_USUARIO)
    escuchas.forEach((fn) => fn())
  },

  alCerrarSesion(fn: Escucha) {
    escuchas.add(fn)
    return () => escuchas.delete(fn)
  },
}
