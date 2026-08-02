import { useState } from 'react'
import { ChevronLeft, ChevronRight, Gauge, ImageOff, MapPin, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { VehiculoLista } from '@/api/types'
import { ImagenCompleta } from '@/components/ui/ImagenCompleta'
import { useEtiquetasVehiculo } from '@/features/vehiculos/useEtiquetasVehiculo'
import { formatearKilometraje, formatearPrecio } from '@/lib/formato'
import { cn } from '@/lib/utils'

export function TarjetaVehiculo({ vehiculo }: { vehiculo: VehiculoLista }) {
  const etiqueta = useEtiquetasVehiculo()
  const imagenes = vehiculo.imagenes.length > 0 ? vehiculo.imagenes : []
  const [indice, setIndice] = useState(0)

  const mover = (delta: number) => {
    setIndice((i) => (i + delta + imagenes.length) % imagenes.length)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <div className="group/carousel relative aspect-[4/3] overflow-hidden bg-muted">
          {imagenes.length > 0 ? (
            <ImagenCompleta
              url={imagenes[indice] ?? ''}
              alt={`${vehiculo.marca} ${vehiculo.linea}${vehiculo.version ? ` ${vehiculo.version}` : ''}`}
              className="transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid size-full place-items-center text-muted-foreground">
              <ImageOff className="size-8" aria-label="Sin imagen" />
            </div>
          )}

          {/* Las flechas solo tienen sentido cuando hay más de una foto. */}
          {imagenes.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Imagen anterior"
                onClick={() => mover(-1)}
                className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover/carousel:opacity-100 focus-visible:opacity-100 hover:bg-background"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>

              <button
                type="button"
                aria-label="Imagen siguiente"
                onClick={() => mover(1)}
                className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover/carousel:opacity-100 focus-visible:opacity-100 hover:bg-background"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>

              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                {imagenes.map((url, i) => (
                  <span
                    key={url}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === indice ? 'w-4 bg-primary-foreground' : 'w-1.5 bg-primary-foreground/50',
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="absolute top-3 left-3 flex gap-2">
          <span className="inline-flex h-5 w-fit items-center rounded-4xl bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur">
            {vehiculo.modelo}
          </span>

          {vehiculo.esBlindado && (
            <span className="inline-flex h-5 w-fit items-center gap-1 rounded-4xl bg-background/90 px-2 py-0.5 text-xs font-medium text-cta backdrop-blur">
              <ShieldCheck className="size-3" aria-hidden />
              Blindado
            </span>
          )}

          {/* Un vehículo reservado sigue en el catálogo, pero debe distinguirse de un disponible. */}
          {vehiculo.estado === 'Reservado' && (
            <span className="inline-flex h-5 w-fit items-center rounded-4xl bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground backdrop-blur">
              Reservado
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium tracking-wide text-cta uppercase">{vehiculo.marca}</p>

        <h3 className="mt-0.5 text-pretty font-display text-base leading-tight font-semibold text-foreground">
          {vehiculo.linea}
        </h3>

        <p className="text-sm text-muted-foreground">
          {vehiculo.version ?? etiqueta(vehiculo.tipoVehiculo)}
        </p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Gauge className="size-3.5" aria-hidden />
            {formatearKilometraje(vehiculo.kilometraje)}
          </span>

          {vehiculo.ciudad && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {vehiculo.ciudad}
            </span>
          )}
        </div>

        {/* mt-auto empuja el precio al fondo: las tarjetas de una fila alinean su base
            aunque el nombre del vehículo ocupe una línea más. */}
        <div className="mt-auto flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Precio</p>
            <p className="font-display text-lg font-bold text-foreground">
              {formatearPrecio(vehiculo.precio)}
            </p>
          </div>
        </div>

        <Link
          to={`/vehicle/${vehiculo.id}`}
          className="mt-4 inline-flex h-8 w-full items-center justify-center rounded-lg bg-cta text-sm font-medium text-cta-foreground transition-all hover:bg-cta-hover"
        >
          Ver Vehículo
        </Link>
      </div>
    </article>
  )
}

/** Esqueleto con la misma silueta de la tarjeta, para que la grilla no salte al cargar. */
export function TarjetaVehiculoEsqueleto() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="aspect-[4/3] w-full animate-pulse bg-muted" />

      <div className="flex flex-col gap-3 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />

        <div className="mt-2 flex gap-3">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>

        <div className="mt-3 h-6 w-28 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-9 w-full animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  )
}
