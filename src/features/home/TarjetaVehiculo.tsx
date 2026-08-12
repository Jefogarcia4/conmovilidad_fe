import { useState } from 'react'
import { ChevronLeft, ChevronRight, Gauge, ImageOff, MapPin, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { VehiculoLista } from '@/api/types'
import { useEtiquetasVehiculo } from '@/features/vehiculos/useEtiquetasVehiculo'
import { formatearKilometraje, formatearPrecio } from '@/lib/formato'
import { resolverUrlImagen } from '@/lib/imagenes'
import { cn } from '@/lib/utils'

/** A partir de aquí los puntos dejan de leerse y se cambian por un contador. */
const MAXIMO_PUNTOS = 8

interface Props {
  vehiculo: VehiculoLista
  /**
   * Las primeras tarjetas de la grilla se cargan sin diferir: son las que el usuario ve al
   * entrar, y dejarlas perezosas retrasa la única imagen que de verdad importa para la
   * sensación de rapidez.
   */
  prioritaria?: boolean
}

export function TarjetaVehiculo({ vehiculo, prioritaria = false }: Props) {
  const etiqueta = useEtiquetasVehiculo()
  const imagenes = vehiculo.imagenes
  const total = imagenes.length
  const [indice, setIndice] = useState(0)

  /*
   * Al montar solo existe la foto visible: una grilla de doce tarjetas que trajera la galería
   * completa de cada vehículo pediría cientos de imágenes de golpe. Basta con que el puntero
   * roce la tarjeta para montar también la anterior y la siguiente, que es mucho antes de que
   * llegue el clic.
   */
  const [armado, setArmado] = useState(false)

  const armar = () => setArmado(true)

  /*
   * Las tres fotos conviven en el DOM y se cruzan por opacidad. Antes había una sola `<img>` y
   * cambiar su `src` obligaba a descargar y decodificar en el instante del clic: de ahí el salto
   * y el hueco en blanco al pasar de foto. La ventana se limita a tres para que recorrer una
   * galería larga no acumule veinte imágenes decodificadas por tarjeta.
   */
  const visibles = armado && total > 1
    ? [...new Set([(indice - 1 + total) % total, indice, (indice + 1) % total])]
    : [indice]

  const mover = (delta: number) => {
    armar()
    setIndice((i) => (i + delta + total) % total)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <div
          onPointerEnter={armar}
          onFocusCapture={armar}
          className="group/carousel relative aspect-[4/3] overflow-hidden bg-muted"
        >
          {total > 0 ? (
            <>
              {/* Relleno: la misma foto ampliada y desenfocada tapa las franjas que deja
                  `object-contain`. Solo se pinta la de la imagen visible, porque el desenfoque
                  es lo más caro de la tarjeta y multiplicarlo por tres no aporta nada. */}
              <img
                src={resolverUrlImagen(imagenes[indice])}
                alt=""
                aria-hidden
                loading={prioritaria ? 'eager' : 'lazy'}
                className="absolute inset-0 size-full scale-110 object-cover blur-2xl"
              />

              {visibles.map((i) => (
                <img
                  key={imagenes[i]}
                  src={resolverUrlImagen(imagenes[i])}
                  alt={
                    i === indice
                      ? `${vehiculo.marca} ${vehiculo.linea}${vehiculo.version ? ` ${vehiculo.version}` : ''}`
                      : ''
                  }
                  aria-hidden={i !== indice}
                  // Las vecinas se montan a propósito para adelantarlas: diferirlas las dejaría
                  // sin descargar hasta el clic, que es justo lo que se quiere evitar.
                  loading={prioritaria || i !== indice ? 'eager' : 'lazy'}
                  fetchPriority={prioritaria && i === indice ? 'high' : 'auto'}
                  decoding="async"
                  className={cn(
                    'absolute inset-0 size-full object-contain transition-[opacity,transform] duration-300 group-hover:scale-105',
                    i === indice ? 'opacity-100' : 'opacity-0',
                  )}
                />
              ))}
            </>
          ) : (
            <div className="grid size-full place-items-center text-muted-foreground">
              <ImageOff className="size-8" aria-label="Sin imagen" />
            </div>
          )}

          {/* Las flechas solo tienen sentido cuando hay más de una foto. */}
          {total > 1 && (
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

              {/* Una galería larga llenaría el ancho de la tarjeta de puntos ilegibles; pasado
                  ese punto el contador dice lo mismo en menos espacio. */}
              {total <= MAXIMO_PUNTOS ? (
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
              ) : (
                <span className="absolute right-2 bottom-2 rounded-full bg-primary/80 px-2 py-0.5 text-[0.7rem] font-medium text-primary-foreground tabular-nums backdrop-blur">
                  {indice + 1} / {total}
                </span>
              )}
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
