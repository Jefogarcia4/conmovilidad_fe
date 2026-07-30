import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import banner1 from '@/assets/banner_1.png'
import banner2 from '@/assets/banner_2.jpg'

interface Diapositiva {
  imagen: string
  /** Los banners traen el mensaje impreso, así que el alt lo transcribe. */
  alt: string
}

const DIAPOSITIVAS: Diapositiva[] = [
  {
    imagen: banner1,
    alt: 'Autos Galería: compraventa de carros multimarca y todas las gamas. Motos de mediano y alto cilindraje. Trámites de tránsito a nivel nacional.',
  },
  {
    imagen: banner2,
    alt: 'Autos Galería: compra y venta de vehículos multimarca y todas las gamas, financiamos tu vehículo, pólizas todo riesgo.',
  },
]

const INTERVALO_MS = 6000

export function CarruselHero() {
  const [actual, setActual] = useState(0)
  const [pausado, setPausado] = useState(false)

  const ir = useCallback((indice: number) => {
    setActual(((indice % DIAPOSITIVAS.length) + DIAPOSITIVAS.length) % DIAPOSITIVAS.length)
  }, [])

  // El temporizador se reinicia con cada cambio manual: evita un salto brusco justo después
  // de que el usuario elige una diapositiva.
  const refActual = useRef(actual)
  refActual.current = actual

  useEffect(() => {
    if (pausado) return

    const t = setInterval(() => ir(refActual.current + 1), INTERVALO_MS)
    return () => clearInterval(t)
  }, [pausado, ir, actual])

  return (
    <section
      aria-label="Vehículos destacados"
      aria-roledescription="carrusel"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
      // El aspecto sigue al del banner (1584x400) para que object-contain no deje franjas.
      className="group relative aspect-[1584/400] w-full overflow-hidden bg-primary"
    >
      {DIAPOSITIVAS.map((d, i) => (
        <div
          key={`${d.imagen}-${i}`}
          aria-hidden={i !== actual}
          className={cn(
            'absolute inset-0 transition-opacity duration-700 ease-in-out',
            i === actual ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <img
            src={d.imagen}
            alt={d.alt}
            // contain, no cover: el texto impreso del banner no se puede recortar.
            className="size-full object-contain"
            // Solo la primera bloquea el render inicial; las demás pueden esperar.
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : 'low'}
          />
        </div>
      ))}

      <button
        type="button"
        aria-label="Anterior"
        onClick={() => ir(actual - 1)}
        className="absolute top-1/2 left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/25 text-primary-foreground opacity-0 backdrop-blur transition-[opacity,background-color] duration-300 group-hover:opacity-100 hover:bg-background/40 focus-visible:opacity-100 max-sm:opacity-100 sm:left-6"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>

      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => ir(actual + 1)}
        className="absolute top-1/2 right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/25 text-primary-foreground opacity-0 backdrop-blur transition-[opacity,background-color] duration-300 group-hover:opacity-100 hover:bg-background/40 focus-visible:opacity-100 max-sm:opacity-100 sm:right-6"
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {DIAPOSITIVAS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir a la diapositiva ${i + 1}`}
            aria-current={i === actual}
            onClick={() => ir(i)}
            className={cn(
              'h-2 rounded-full transition-all',
              i === actual
                ? 'w-6 bg-cta'
                : 'w-2 bg-primary-foreground/50 hover:bg-primary-foreground/80',
            )}
          />
        ))}
      </div>
    </section>
  )
}
