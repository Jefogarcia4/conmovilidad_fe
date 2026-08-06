import { resolverUrlImagen } from '@/lib/imagenes'
import { cn } from '@/lib/utils'

interface Props {
  /** URL tal como la entrega la API; se resuelve aquí. */
  url: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
  /** Desactiva el relleno desenfocado cuando el hueco es tan pequeño que no aporta. */
  sinRelleno?: boolean
}

/**
 * Imagen de vehículo que se ve entera. Las fotos llegan en proporciones dispares y con marcas
 * de agua en las esquinas, así que recortar (`object-cover`) se come justo la parte que
 * identifica al vendedor: se usa `object-contain` y las franjas sobrantes las tapa la misma
 * imagen ampliada y desenfocada, en vez de dejar barras planas.
 *
 * Se posiciona en absoluto: el contenedor debe ser `relative` y marcar la proporción.
 */
export function ImagenCompleta({
  url,
  alt,
  className,
  loading = 'lazy',
  fetchPriority,
  sinRelleno = false,
}: Props) {
  const src = resolverUrlImagen(url)

  return (
    <>
      {!sinRelleno && (
        <img
          src={src}
          alt=""
          aria-hidden
          loading={loading}
          className="absolute inset-0 size-full scale-110 object-cover blur-2xl"
        />
      )}

      <img
        src={src}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        // Descodificar fuera del hilo principal: con doce tarjetas en la grilla, hacerlo en línea
        // bloquea el desplazamiento mientras aparecen.
        decoding="async"
        className={cn('absolute inset-0 size-full object-contain', className)}
      />
    </>
  )
}
