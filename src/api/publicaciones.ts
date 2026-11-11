import { api, queryString } from './cliente'

/**
 * Seguimiento del catálogo, visto de todos los convenios. Solo superadministrador.
 *
 * La pregunta que responde no es «qué se va a caer» —las publicaciones no vencen, nada se cae—
 * sino «a qué hay que ayudarle a venderse».
 */

export interface PublicacionEnSeguimiento {
  id: string
  placa: string
  vehiculo: string
  precio: number
  estado: string
  convenioNombre: string
  empresaNombre: string
  publicadoPor: string
  /** Si está inactivo no recibe el correo de seguimiento, pero su publicación sigue en pie. */
  vendedorActivo: boolean
  fechaPublicacion?: string
  /** Días que lleva el aviso en el catálogo. Es la señal que importa. */
  diasPublicado: number
  fechaRevisionPublicacion?: string
  /** Negativo si el seguimiento ya está cumplido y el correo aún no ha salido. */
  diasParaRevision: number
  avisoRevisionEnviadoEn?: string
}

export interface ResumenSeguimiento {
  total: number
  sinVenderUnMes: number
  sinVenderTresMeses: number
  vendedorInactivo: number
  publicaciones: PublicacionEnSeguimiento[]
}

export const adminPublicaciones = {
  /** `dias` filtra a las que lleven al menos ese tiempo publicadas. */
  seguimiento: (dias?: number) =>
    api.get<ResumenSeguimiento>(`/admin/publicaciones/seguimiento${queryString({ dias })}`),
}
