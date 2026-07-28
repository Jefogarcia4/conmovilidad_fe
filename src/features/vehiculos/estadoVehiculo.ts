import type { EstadoVehiculo } from '@/api/types'

interface Presentacion {
  etiqueta: string
  /** Clases del badge y del punto que lo precede. */
  badge: string
  punto: string
}

/**
 * Presentación de cada estado. «Disponible» se muestra como «Activo» porque es el término que
 * usa el diseño para la publicación viva; el resto conserva su nombre de dominio.
 */
const PRESENTACION: Record<EstadoVehiculo, Presentacion> = {
  Disponible: { etiqueta: 'Activo', badge: 'bg-cta/10 text-cta', punto: 'bg-cta' },
  Reservado: {
    etiqueta: 'Reservado',
    badge: 'bg-amber-500/10 text-amber-700',
    punto: 'bg-amber-500',
  },
  Vendido: {
    etiqueta: 'Vendido',
    badge: 'bg-emerald-500/10 text-emerald-700',
    punto: 'bg-emerald-500',
  },
  Borrador: { etiqueta: 'Borrador', badge: 'bg-muted text-muted-foreground', punto: 'bg-muted-foreground' },
  Inactivo: { etiqueta: 'Inactivo', badge: 'bg-muted text-muted-foreground', punto: 'bg-muted-foreground' },
}

export function presentarEstado(estado: EstadoVehiculo): Presentacion {
  return PRESENTACION[estado] ?? PRESENTACION.Borrador
}
