import { CreditCard, Eye, ImageOff, Loader2, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { VehiculoLista } from '@/api/types'
import { ImagenCompleta } from '@/components/ui/ImagenCompleta'
import { formatearKilometraje, formatearPrecio } from '@/lib/formato'
import { cn } from '@/lib/utils'
import { presentarEstado } from './estadoVehiculo'

interface Props {
  vehiculo: VehiculoLista
  onEliminar: (vehiculo: VehiculoLista) => void
  eliminando?: boolean
  onPagar: () => void
  pagando?: boolean
}

/**
 * Tarjeta de gestión: la del catálogo vende el vehículo, esta lo administra. Por eso muestra el
 * estado de la publicación en vez del año y remata con acciones en lugar de «Ver Vehículo».
 */
export function TarjetaMiVehiculo({
  vehiculo,
  onEliminar,
  eliminando = false,
  onPagar,
  pagando = false,
}: Props) {
  const navegar = useNavigate()
  const estado = presentarEstado(vehiculo.estado)
  const pendienteDePago = vehiculo.estado === 'PendientePago'

  const meta = [
    String(vehiculo.modelo),
    formatearKilometraje(vehiculo.kilometraje),
    vehiculo.ciudad,
  ].filter(Boolean)

  return (
    <article
      aria-busy={eliminando}
      className="flex flex-col overflow-hidden rounded-2xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10 transition-opacity aria-busy:opacity-50"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {vehiculo.imagenPrincipal ? (
          <ImagenCompleta
            url={vehiculo.imagenPrincipal}
            alt={`${vehiculo.marca} ${vehiculo.linea}`}
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <ImageOff className="size-8" aria-label="Sin imagen" />
          </div>
        )}

        {/* Sobre la foto el badge va en superficie clara translúcida; el color lo aporta el punto
            y el texto se mantiene en `foreground` para que se lea sobre cualquier imagen. */}
        <span className="absolute top-3 left-3 inline-flex h-5 w-fit items-center rounded-4xl bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur">
          <span className={cn('mr-1 inline-block size-1.5 rounded-full', estado.punto)} aria-hidden />
          {estado.etiqueta}
        </span>

        {vehiculo.esBlindado && (
          <span className="absolute top-3 right-3 inline-flex h-5 w-fit items-center gap-1 rounded-4xl bg-background/90 px-2 py-0.5 text-xs font-medium text-cta backdrop-blur">
            <ShieldCheck className="size-3" aria-hidden />
            Blindado
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <p className="font-medium text-foreground">
            {vehiculo.marca} {vehiculo.linea}
          </p>
          <p className="text-xs text-muted-foreground">{meta.join(' · ')}</p>
        </div>

        <p className="font-display text-xl font-bold text-foreground">
          {formatearPrecio(vehiculo.precio)}
        </p>

        {/* El pago pendiente es lo único que separa al vehículo del catálogo, así que va como
            acción principal a ancho completo y no escondido entre los iconos de gestión. */}
        {pendienteDePago && (
          <button
            type="button"
            onClick={onPagar}
            disabled={pagando}
            className={cn(
              'inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg',
              'bg-cta px-3 text-sm font-medium text-cta-foreground',
              'transition-all outline-none hover:bg-cta-hover',
              'focus-visible:ring-3 focus-visible:ring-ring/50',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            {pagando ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <CreditCard className="size-3.5" aria-hidden />
            )}
            Pagar publicación
          </button>
        )}

        <div className="flex items-center gap-2 pt-1">
          <BotonAccion
            className="flex-1"
            onClick={() => navegar(`/vehicle/${vehiculo.id}/editar`)}
          >
            <Pencil className="size-3.5" aria-hidden />
            Editar
          </BotonAccion>

          <BotonAccion
            etiqueta={`Ver ${vehiculo.marca} ${vehiculo.linea}`}
            onClick={() => navegar(`/vehicle/${vehiculo.id}`)}
          >
            <Eye className="size-3.5" aria-hidden />
          </BotonAccion>

          <BotonAccion
            etiqueta={`Eliminar ${vehiculo.marca} ${vehiculo.linea}`}
            onClick={() => onEliminar(vehiculo)}
            disabled={eliminando}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-3.5" aria-hidden />
          </BotonAccion>
        </div>
      </div>
    </article>
  )
}

interface PropsBoton {
  onClick: () => void
  children: React.ReactNode
  /** Obligatoria en los botones que solo llevan icono. */
  etiqueta?: string
  className?: string
  disabled?: boolean
}

function BotonAccion({ onClick, children, etiqueta, className, disabled }: PropsBoton) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={etiqueta}
      title={etiqueta}
      className={cn(
        'inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-[0.6rem]',
        'border border-border bg-background px-2.5 text-[0.8rem] font-medium whitespace-nowrap',
        'transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        'hover:bg-muted',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  )
}
