import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import type { VehiculoImagen } from '@/api/types'
import { resolverUrlImagen } from '@/lib/imagenes'
import { cn } from '@/lib/utils'

interface Props {
  imagenes: VehiculoImagen[]
  descripcion: string
}

export function GaleriaVehiculo({ imagenes, descripcion }: Props) {
  const [actual, setActual] = useState(0)
  const total = imagenes.length

  // Las flechas del teclado son lo que espera cualquiera frente a una galería.
  useEffect(() => {
    if (total < 2) return

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setActual((i) => (i - 1 + total) % total)
      if (e.key === 'ArrowRight') setActual((i) => (i + 1) % total)
    }

    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [total])

  if (total === 0) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-2xl border border-border bg-muted text-muted-foreground">
        <ImageOff className="size-10" aria-label="Sin imágenes" />
      </div>
    )
  }

  const mover = (delta: number) => setActual((i) => (i + delta + total) % total)

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted">
        <img
          src={resolverUrlImagen(imagenes[actual]?.url)}
          alt={`${descripcion} — imagen ${actual + 1}`}
          className="size-full object-cover"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={() => mover(-1)}
              className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>

            <button
              type="button"
              aria-label="Imagen siguiente"
              onClick={() => mover(1)}
              className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>

            <span className="absolute right-3 bottom-3 rounded-full bg-primary/80 px-2.5 py-1 text-xs font-medium text-primary-foreground backdrop-blur">
              {actual + 1} / {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {imagenes.map((imagen, i) => (
            <button
              key={imagen.id}
              type="button"
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === actual}
              onClick={() => setActual(i)}
              className={cn(
                'aspect-square overflow-hidden rounded-lg border-2 transition-all',
                i === actual
                  ? 'border-cta ring-2 ring-cta/30'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <img
                src={resolverUrlImagen(imagen.url)}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
