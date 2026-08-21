import { api, queryString } from './cliente'
import type { EstadoPago } from './pagos'
import type { ResultadoPaginado } from './types'

/**
 * Suscripciones de empresa: el plan que contrata una empresa para que sus usuarios publiquen sin
 * pagar por vehículo, hasta el tope de publicaciones que incluye cada mes.
 *
 * La empresa sin suscripción vigente se sigue rigiendo por la tarifa por vehículo (`api/pagos`).
 */

/** «Vencida» no es un estado guardado: se deduce de la fecha de fin (ver `vigente`). */
export type EstadoSuscripcion = 'PendientePago' | 'Activa' | 'Cancelada'

export interface PlanSuscripcion {
  id: string
  nombre: string
  descripcion?: string
  /** Extremo inferior del rango que anuncia el plan. Informativo: el que limita es el máximo. */
  publicacionesMinimasMensuales: number
  publicacionesMaximasMensuales: number
  precio: number
  moneda: string
  /** Meses que cubre un pago. Define la fecha de fin al contratar. */
  duracionMeses: number
  activo: boolean
  /** Suscripciones vigentes que lo usan: avisa antes de retirar un plan del que hay gente colgando. */
  empresasSuscritas: number
}

export interface GuardarPlanRequest {
  nombre: string
  descripcion?: string
  publicacionesMinimasMensuales: number
  publicacionesMaximasMensuales: number
  precio: number
  duracionMeses: number
  activo: boolean
}

export interface SuscripcionEmpresa {
  id: string
  empresaId: string
  empresaNombre: string
  convenioId: string
  convenioNombre: string
  planSuscripcionId: string
  planNombre: string
  /** `YYYY-MM-DD`. */
  fechaInicio: string
  fechaFin: string
  publicacionesMaximasMensuales: number
  publicacionesUsadasEsteMes: number
  precio: number
  moneda: string
  estado: EstadoSuscripcion
  /** Está pagada y hoy cae dentro de sus fechas, así que hoy da cupo. */
  vigente: boolean
}

export interface CheckoutSuscripcion {
  /** `false` cuando no había nada que cobrar: la suscripción quedó activa sin pasar por la pasarela. */
  requierePago: boolean
  urlCheckout?: string
  referencia?: string
  monto: number
  moneda: string
  estadoSuscripcion: EstadoSuscripcion
}

export interface PagoSuscripcion {
  id: string
  suscripcionEmpresaId: string
  empresaNombre: string
  planNombre: string
  referencia: string
  monto: number
  moneda: string
  estado: EstadoPago
  estadoProveedor?: string
  metodoPago?: string
  fechaCreacion: string
  fechaAprobacion?: string
}

/**
 * Cupo de la empresa del usuario. Con `tieneSuscripcion` en `false` el resto de campos no aplica:
 * la empresa paga por vehículo.
 */
export interface CupoPublicacion {
  tieneSuscripcion: boolean
  planNombre?: string
  maximo: number
  usadas: number
  disponibles: number
  /** `YYYY-MM-DD`. */
  vigenteHasta?: string
}

export interface FiltroSuscripciones {
  convenioId?: string
  empresaId?: string
  estado?: EstadoSuscripcion
  soloVigentes?: boolean
  pagina?: number
  tamanoPagina?: number
}

export const suscripciones = {
  /** Lo que le queda a la empresa del usuario este mes. */
  miCupo: () => api.get<CupoPublicacion>('/suscripciones/mi-cupo'),
}

export const adminPlanes = {
  listar: (soloActivos = false) =>
    api.get<PlanSuscripcion[]>(`/admin/planes-suscripcion${queryString({ soloActivos })}`),

  crear: (datos: GuardarPlanRequest) =>
    api.post<PlanSuscripcion>('/admin/planes-suscripcion', datos),

  actualizar: (id: string, datos: GuardarPlanRequest) =>
    api.put<PlanSuscripcion>(`/admin/planes-suscripcion/${id}`, datos),
}

export const adminSuscripciones = {
  listar: (filtro: FiltroSuscripciones = {}) =>
    api.get<ResultadoPaginado<SuscripcionEmpresa>>(`/admin/suscripciones${queryString(filtro)}`),

  contratar: (datos: { empresaId: string; planSuscripcionId: string; fechaInicio?: string }) =>
    api.post<SuscripcionEmpresa>('/admin/suscripciones', datos),

  checkout: (id: string) => api.post<CheckoutSuscripcion>(`/admin/suscripciones/${id}/checkout`),

  /** Resultado de la transacción con la que Wompi devolvió al administrador. */
  verificar: (transaccionId: string) =>
    api.get<PagoSuscripcion>(
      `/admin/suscripciones/verificar?id=${encodeURIComponent(transaccionId)}`,
    ),

  cancelar: (id: string) => api.delete<void>(`/admin/suscripciones/${id}`),

  pagos: (filtro: FiltroSuscripciones = {}) =>
    api.get<ResultadoPaginado<PagoSuscripcion>>(`/admin/suscripciones/pagos${queryString(filtro)}`),
}
