import { sesion } from './sesion'
import type { AuthResponse, ProblemDetails } from './types'

// `||` y no `??`: en desarrollo la variable existe pero está vacía para indicar «usa la ruta
// relativa», y `??` solo sustituye null o undefined, así que dejaría la base en cadena vacía y
// todas las peticiones saldrían sin el prefijo `/api`.
const BASE = import.meta.env.VITE_API_URL || '/api'

/** Error de la API ya interpretado, con el `codigo` estable que devuelve el backend. */
export class ApiError extends Error {
  readonly status: number
  readonly codigo?: string
  readonly errores?: Record<string, string[]>

  constructor(
    status: number,
    mensaje: string,
    codigo?: string,
    errores?: Record<string, string[]>,
  ) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.codigo = codigo
    this.errores = errores
  }

  /** Errores de validación asociados a un campo concreto del formulario. */
  erroresDe(campo: string): string[] {
    if (!this.errores) return []

    // La API responde con el nombre de la propiedad en PascalCase.
    const clave = Object.keys(this.errores).find((k) => k.toLowerCase() === campo.toLowerCase())
    return clave ? (this.errores[clave] ?? []) : []
  }
}

interface OpcionesPeticion extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Marca las peticiones que no deben intentar refrescar la sesión (el propio login/refresh). */
  sinAutenticacion?: boolean
}

/**
 * Refresco en curso. Si varias peticiones reciben 401 a la vez, todas esperan al mismo refresco
 * en lugar de disparar uno cada una y anularse entre sí por la rotación de tokens del backend.
 */
let refrescoEnCurso: Promise<string | null> | null = null

async function refrescarSesion(): Promise<string | null> {
  const refreshToken = sesion.refreshToken
  if (!refreshToken) return null

  refrescoEnCurso ??= (async () => {
    try {
      const respuesta = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!respuesta.ok) {
        sesion.limpiar()
        return null
      }

      const auth = (await respuesta.json()) as AuthResponse
      sesion.guardar(auth)
      return auth.accessToken
    } catch {
      sesion.limpiar()
      return null
    } finally {
      refrescoEnCurso = null
    }
  })()

  return refrescoEnCurso
}

async function interpretarError(respuesta: Response): Promise<ApiError> {
  let problema: ProblemDetails = {}

  try {
    problema = (await respuesta.json()) as ProblemDetails
  } catch {
    // Respuesta sin cuerpo JSON (502, timeout de proxy...): se cae al mensaje genérico.
  }

  const mensaje =
    problema.detail ??
    problema.title ??
    (respuesta.status >= 500
      ? 'No pudimos conectar con el servidor. Inténtalo de nuevo en un momento.'
      : 'La solicitud no pudo completarse.')

  return new ApiError(
    respuesta.status,
    mensaje,
    problema.codigo,
    problema.errors ?? problema.errores,
  )
}

/**
 * Ejecuta la petición aplicando cabeceras, refresco de token y traducción de errores, y devuelve
 * la respuesta cruda. Las variantes tipadas deciden luego cómo interpretar el cuerpo.
 */
async function ejecutarCrudo(ruta: string, opciones: OpcionesPeticion = {}): Promise<Response> {
  const { body, sinAutenticacion, headers, ...resto } = opciones

  const construirPeticion = (token: string | null): RequestInit => {
    const cabeceras = new Headers(headers)

    if (body !== undefined && !(body instanceof FormData)) {
      cabeceras.set('Content-Type', 'application/json')
    }

    if (token) {
      cabeceras.set('Authorization', `Bearer ${token}`)
    }

    return {
      ...resto,
      headers: cabeceras,
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }
  }

  let respuesta: Response

  try {
    respuesta = await fetch(
      `${BASE}${ruta}`,
      construirPeticion(sinAutenticacion ? null : sesion.accessToken),
    )
  } catch (e) {
    // Una cancelación —el tiempo máximo de una subida, por ejemplo— no es un fallo de red: se
    // propaga tal cual para que quien la pidió la distinga y decida si reintenta.
    if (e instanceof DOMException && e.name === 'AbortError') throw e

    throw new ApiError(0, 'No pudimos conectar con el servidor. Revisa tu conexión.')
  }

  // El access token expiró: se refresca una vez y se reintenta la misma petición.
  if (respuesta.status === 401 && !sinAutenticacion && sesion.refreshToken) {
    const nuevoToken = await refrescarSesion()

    if (!nuevoToken) {
      throw new ApiError(401, 'Tu sesión expiró. Inicia sesión nuevamente.', 'auth.sesion_expirada')
    }

    respuesta = await fetch(`${BASE}${ruta}`, construirPeticion(nuevoToken))
  }

  if (!respuesta.ok) {
    throw await interpretarError(respuesta)
  }

  return respuesta
}

async function ejecutar<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const respuesta = await ejecutarCrudo(ruta, opciones)

  return respuesta.status === 204 ? (undefined as T) : ((await respuesta.json()) as T)
}

export const api = {
  get: <T>(ruta: string, opciones?: OpcionesPeticion) =>
    ejecutar<T>(ruta, { ...opciones, method: 'GET' }),

  /** Para descargas (plantillas, informes) que no devuelven JSON. */
  getBlob: async (ruta: string, opciones?: OpcionesPeticion) =>
    (await ejecutarCrudo(ruta, { ...opciones, method: 'GET' })).blob(),

  post: <T>(ruta: string, body?: unknown, opciones?: OpcionesPeticion) =>
    ejecutar<T>(ruta, { ...opciones, method: 'POST', body }),

  put: <T>(ruta: string, body?: unknown, opciones?: OpcionesPeticion) =>
    ejecutar<T>(ruta, { ...opciones, method: 'PUT', body }),

  patch: <T>(ruta: string, body?: unknown, opciones?: OpcionesPeticion) =>
    ejecutar<T>(ruta, { ...opciones, method: 'PATCH', body }),

  delete: <T>(ruta: string, opciones?: OpcionesPeticion) =>
    ejecutar<T>(ruta, { ...opciones, method: 'DELETE' }),
}

/** Construye un query string omitiendo los filtros vacíos. */
export function queryString(parametros: object): string {
  const busqueda = new URLSearchParams()

  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor === undefined || valor === null || valor === '') continue
    busqueda.set(clave, String(valor))
  }

  const texto = busqueda.toString()
  return texto ? `?${texto}` : ''
}
