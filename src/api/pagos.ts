import { api } from './cliente'
import type { EstadoVehiculo } from './types'

/** Estados normalizados que devuelve la API, independientes de cómo los llame la pasarela. */
export type EstadoPago = 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Anulado' | 'Error'

export interface TarifaVigente {
  precio: number
  moneda: string
  /** Con el cobro desactivado se publica sin pasar por la pasarela. */
  cobroActivo: boolean
  /** El convenio tiene tarifa negociada; si es `false`, hereda la global. */
  esTarifaPropia: boolean
}

export interface CheckoutPublicacion {
  /**
   * `false` cuando no había nada que cobrar (publicación ya pagada o cobro abierto): el vehículo
   * quedó publicado y no hay a dónde redirigir.
   */
  requierePago: boolean
  urlCheckout?: string
  referencia?: string
  monto: number
  moneda: string
  estadoVehiculo: EstadoVehiculo
}

export interface PagoPublicacion {
  id: string
  vehiculoId: string
  vehiculoDescripcion: string
  placa: string
  referencia: string
  monto: number
  moneda: string
  estado: EstadoPago
  /** Texto crudo de la pasarela (APPROVED, DECLINED…). Solo para soporte. */
  estadoProveedor?: string
  metodoPago?: string
  transaccionId?: string
  estadoVehiculo: EstadoVehiculo
  fechaCreacion: string
  fechaAprobacion?: string
}

export const pagos = {
  /** Precio de publicar en el convenio del usuario, para anunciarlo antes de cobrar. */
  tarifa: () => api.get<TarifaVigente>('/pagos/tarifa'),

  /** Abre el pago de la publicación de un vehículo. */
  checkout: (vehiculoId: string) =>
    api.post<CheckoutPublicacion>(`/pagos/vehiculos/${vehiculoId}/checkout`),

  /** Consulta el resultado de la transacción con la que Wompi devolvió al usuario. */
  verificar: (transaccionId: string) =>
    api.get<PagoPublicacion>(`/pagos/verificar?id=${encodeURIComponent(transaccionId)}`),

  /** Último intento de pago de un vehículo. */
  deVehiculo: (vehiculoId: string) => api.get<PagoPublicacion>(`/pagos/vehiculos/${vehiculoId}`),
}

/**
 * Envía al usuario al checkout de la pasarela.
 *
 * Es una salida del SPA, no una navegación de React Router: `assign` conserva la página actual en
 * el historial, así que el botón «atrás» del navegador devuelve al usuario a donde estaba en vez
 * de sacarlo de la aplicación.
 */
export function irAlCheckout(url: string): void {
  window.location.assign(url)
}
