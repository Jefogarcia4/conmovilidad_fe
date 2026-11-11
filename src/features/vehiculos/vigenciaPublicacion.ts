import type { EstadoVehiculo, VehiculoLista } from '@/api/types'

/**
 * Estado de la vigencia del aviso en el catálogo.
 *
 * Es una dimensión aparte del estado del vehículo: un vehículo puede estar en «Disponible» y no
 * verse en el catálogo porque su aviso venció. El estado dice qué quiere el vendedor; esto dice
 * si el aviso sigue en pie.
 */

/** Los mismos días de antelación que usa la API para el correo de aviso. */
const DIAS_AVISO = 5

/** Solo los estados que de verdad se muestran en el catálogo tienen vigencia que contar. */
const ESTADOS_CON_VIGENCIA: EstadoVehiculo[] = ['Disponible', 'Reservado']

export interface Vigencia {
  vencida: boolean
  /** Sigue vigente pero le quedan pocos días. */
  porVencer: boolean
  /** Días que faltan, redondeados hacia arriba. Cero o menos si ya venció. */
  dias: number
}

/**
 * Devuelve la vigencia del aviso, o `null` si no aplica: el vehículo no está publicado, o es de
 * antes de que las publicaciones tuvieran vencimiento.
 */
export function vigenciaDe(vehiculo: VehiculoLista): Vigencia | null {
  if (!vehiculo.fechaVencimientoPublicacion) return null
  if (!ESTADOS_CON_VIGENCIA.includes(vehiculo.estado)) return null

  const vence = new Date(vehiculo.fechaVencimientoPublicacion).getTime()
  const restante = vence - Date.now()
  const dias = Math.ceil(restante / 86_400_000)

  return {
    vencida: restante <= 0,
    porVencer: restante > 0 && dias <= DIAS_AVISO,
    dias,
  }
}

/** Texto corto para la tarjeta y la tabla. */
export function textoVigencia(vigencia: Vigencia): string {
  if (vigencia.vencida) return 'Publicación vencida'
  if (vigencia.dias === 1) return 'Vence mañana'

  return `Vence en ${vigencia.dias} días`
}
