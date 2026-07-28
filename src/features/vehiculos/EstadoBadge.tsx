import type { EstadoVehiculo } from '@/api/types'
import { cn } from '@/lib/utils'
import { presentarEstado } from './estadoVehiculo'

export function EstadoBadge({ estado }: { estado: EstadoVehiculo }) {
  const { etiqueta, badge, punto } = presentarEstado(estado)

  return (
    <span
      className={cn(
        'inline-flex h-5 w-fit shrink-0 items-center rounded-4xl px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        badge,
      )}
    >
      <span className={cn('mr-1 inline-block size-1.5 rounded-full', punto)} aria-hidden />
      {etiqueta}
    </span>
  )
}
