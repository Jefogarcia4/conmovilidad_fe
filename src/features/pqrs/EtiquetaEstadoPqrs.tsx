import { ETIQUETAS_ESTADO, type EstadoPqrs } from '@/api/pqrs'
import { cn } from '@/lib/utils'

/**
 * Distintivo del estado de una PQRS. Vive en su propio archivo porque lo comparten la pantalla
 * del usuario y la bandeja del portal, y mezclarlo con utilidades rompería el refresco en
 * caliente de Vite (mismo motivo que `estilosControl`).
 */
const TONOS: Record<EstadoPqrs, string> = {
  Recibida: 'bg-muted text-muted-foreground',
  EnGestion: 'bg-orange-500/10 text-orange-600',
  Cerrada: 'bg-cta/10 text-cta',
}

export function EtiquetaEstadoPqrs({ estado }: { estado: EstadoPqrs }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 w-fit items-center rounded-4xl px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONOS[estado],
      )}
    >
      {ETIQUETAS_ESTADO[estado]}
    </span>
  )
}
