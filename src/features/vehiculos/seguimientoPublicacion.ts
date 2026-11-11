import type { EstadoVehiculo, VehiculoLista } from '@/api/types'

/**
 * Seguimiento de una publicación.
 *
 * **Las publicaciones no vencen.** Un aviso se queda en el catálogo hasta que el vendedor lo
 * retira o lo marca vendido; nunca sale por cumplir días. Lo único que hay aquí es el ciclo de
 * seguimiento: cada cierto tiempo se le pregunta al vendedor si el vehículo sigue disponible, y
 * él puede confirmarlo con un clic.
 */

/** Los mismos días de antelación que usa la API para mandar el correo. */
const DIAS_AVISO = 5

/** Solo lo que está en el catálogo tiene seguimiento que mostrar. */
const ESTADOS_PUBLICADOS: EstadoVehiculo[] = ['Disponible', 'Reservado']

export interface Seguimiento {
  /** Días que lleva el aviso en el catálogo. */
  diasPublicado: number
  /** Toca confirmar que sigue disponible: el ciclo está por cumplirse o ya se cumplió. */
  porRevisar: boolean
  /** Días hasta la próxima revisión. Cero o menos si ya se cumplió. */
  diasParaRevision: number
}

export function seguimientoDe(vehiculo: VehiculoLista): Seguimiento | null {
  if (!ESTADOS_PUBLICADOS.includes(vehiculo.estado)) return null

  const ahora = Date.now()

  const diasPublicado = vehiculo.fechaPublicacion
    ? Math.max(0, Math.floor((ahora - new Date(vehiculo.fechaPublicacion).getTime()) / 86_400_000))
    : 0

  if (!vehiculo.fechaRevisionPublicacion) {
    return { diasPublicado, porRevisar: false, diasParaRevision: 0 }
  }

  const restante = new Date(vehiculo.fechaRevisionPublicacion).getTime() - ahora
  const diasParaRevision = Math.ceil(restante / 86_400_000)

  return {
    diasPublicado,
    porRevisar: diasParaRevision <= DIAS_AVISO,
    diasParaRevision,
  }
}

/**
 * Antigüedad del aviso, para la tarjeta y la tabla.
 *
 * Se muestra los días publicados y no la fecha de revisión: al vendedor le sirve saber que su
 * vehículo lleva dos meses sin venderse, no cuándo le va a llegar un correo.
 */
export function textoAntiguedad(seguimiento: Seguimiento): string {
  const { diasPublicado } = seguimiento

  if (diasPublicado < 1) return 'Publicado hoy'
  if (diasPublicado === 1) return 'Publicado ayer'
  if (diasPublicado < 30) return `${diasPublicado} días publicado`

  const meses = Math.floor(diasPublicado / 30)

  return meses === 1 ? 'Un mes publicado' : `${meses} meses publicado`
}
