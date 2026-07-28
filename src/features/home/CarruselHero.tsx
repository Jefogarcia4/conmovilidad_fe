import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Diapositiva {
  imagen: string
  titulo: string
  texto: string
}

/** Ocho mensajes rotando sobre cuatro fotos: el mismo guion del mockup. */
const DIAPOSITIVAS: Diapositiva[] = [
  {
    imagen: '/hero/hero-showroom.png',
    titulo: 'Tu próximo vehículo te espera',
    texto: 'Miles de autos, camionetas y motos verificados en un solo lugar.',
  },
  {
    imagen: '/hero/hero-road.png',
    titulo: 'Conduce con confianza',
    texto: 'Cada vehículo con historial y documentación al día.',
  },
  {
    imagen: '/hero/hero-city.png',
    titulo: 'Compra y vende sin complicaciones',
    texto: 'Publica tu vehículo en minutos y llega a miles de compradores.',
  },
  {
    imagen: '/hero/hero-keys.png',
    titulo: 'Financiación a tu medida',
    texto: 'Solicita tu crédito y estrena el vehículo de tus sueños.',
  },
  {
    imagen: '/hero/hero-showroom.png',
    titulo: 'Los mejores precios del mercado',
    texto: 'Compara y encuentra la oferta perfecta para ti.',
  },
  {
    imagen: '/hero/hero-road.png',
    titulo: 'Aventura sin límites',
    texto: 'SUVs y pickups listas para cualquier terreno.',
  },
  {
    imagen: '/hero/hero-city.png',
    titulo: 'Movilidad urbana inteligente',
    texto: 'Autos compactos y eficientes para la ciudad.',
  },
  {
    imagen: '/hero/hero-keys.png',
    titulo: 'ConMovilidad te acompaña',
    texto: 'Asesoría experta en cada paso de tu compra.',
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
      className="group relative aspect-[2/1] w-full overflow-hidden bg-primary sm:aspect-[21/9] lg:aspect-[1920/720]"
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
            alt=""
            className="size-full object-cover"
            // Solo la primera bloquea el render inicial; las demás pueden esperar.
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : 'low'}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-8">
              <div className="max-w-xl space-y-3 text-primary-foreground sm:space-y-4">
                <h2 className="text-balance font-display text-2xl leading-tight font-bold sm:text-4xl lg:text-5xl">
                  {d.titulo}
                </h2>
                <p className="max-w-md text-pretty text-sm text-primary-foreground/80 sm:text-lg">
                  {d.texto}
                </p>
              </div>
            </div>
          </div>
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
