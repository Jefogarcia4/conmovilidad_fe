import { api, queryString } from './cliente'

/**
 * Vigencia de las publicaciones, vista de todos los convenios. Solo superadministrador.
 */

export interface PublicacionPorVencer {
  id: string
  placa: string
  vehiculo: string
  precio: number
  estado: string
  convenioNombre: string
  empresaNombre: string
  publicadoPor: string
  /** Si está inactivo, nadie va a renovar este aviso: se cae solo al vencerse. */
  vendedorActivo: boolean
  fechaPublicacion?: string
  fechaVencimientoPublicacion: string
  /** Negativo si ya venció. */
  diasRestantes: number
  avisoEnviado: boolean
}

export interface ResumenVigencia {
  vencidas: number
  porVencer: number
  publicaciones: PublicacionPorVencer[]
}

export const adminPublicaciones = {
  /** Sin `dias`, el horizonte es la misma antelación con la que la API manda el correo. */
  vigencia: (dias?: number) =>
    api.get<ResumenVigencia>(`/admin/publicaciones/vigencia${queryString({ dias })}`),
}
