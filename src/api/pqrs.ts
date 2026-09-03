import { api, queryString } from './cliente'
import type { ResultadoPaginado } from './types'

/**
 * Peticiones, quejas, reclamos y sugerencias. Radicar exige sesión, así que la solicitud queda
 * atada al usuario y no hace falta pedirle datos de contacto que ya están en su cuenta.
 */

export type TipoPqrs = 'Peticion' | 'Queja' | 'Reclamo' | 'Sugerencia'

export type EstadoPqrs = 'Recibida' | 'EnGestion' | 'Cerrada'

/** Cómo se le nombra cada tipo al usuario; el valor crudo es el del enum de la API. */
export const ETIQUETAS_TIPO: Record<TipoPqrs, string> = {
  Peticion: 'Petición',
  Queja: 'Queja',
  Reclamo: 'Reclamo',
  Sugerencia: 'Sugerencia',
}

export const ETIQUETAS_ESTADO: Record<EstadoPqrs, string> = {
  Recibida: 'Recibida',
  EnGestion: 'En gestión',
  Cerrada: 'Cerrada',
}

/** Lo que ve quien la radicó: su propia solicitud y la respuesta cuando llega. */
export interface MiPqrs {
  id: string
  /** Número con el que referirse al caso, p. ej. `PQRS-2026-42`. */
  radicado: string
  tipo: TipoPqrs
  asunto: string
  mensaje: string
  estado: EstadoPqrs
  respuesta?: string
  fechaRespuesta?: string
  fechaCreacion: string
}

/** La misma solicitud en la bandeja del portal, con quién la puso y cómo contactarlo. */
export interface PqrsAdmin extends MiPqrs {
  usuarioId: string
  solicitanteNombre: string
  solicitanteDocumento: string
  solicitanteEmail?: string
  solicitanteTelefono?: string
  convenioId: string
  convenioNombre: string
  empresaNombre: string
  respondidaPor?: string
}

export interface FiltroPqrs {
  convenioId?: string
  tipo?: TipoPqrs
  estado?: EstadoPqrs
  busqueda?: string
  pagina?: number
  tamanoPagina?: number
}

export const pqrs = {
  crear: (datos: { tipo: TipoPqrs; asunto: string; mensaje: string }) =>
    api.post<MiPqrs>('/pqrs', datos),

  mis: () => api.get<MiPqrs[]>('/pqrs/mis'),
}

export const adminPqrs = {
  listar: (filtro: FiltroPqrs = {}) =>
    api.get<ResultadoPaginado<PqrsAdmin>>(`/admin/pqrs${queryString(filtro)}`),

  /** Cambia el estado y deja la respuesta. Cerrar exige haber escrito una. */
  gestionar: (id: string, datos: { estado: EstadoPqrs; respuesta?: string }) =>
    api.put<PqrsAdmin>(`/admin/pqrs/${id}/gestion`, datos),
}
