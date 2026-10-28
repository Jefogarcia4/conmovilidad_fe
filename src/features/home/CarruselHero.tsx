import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { URL_SEGURO } from '@/features/credito/enlacesAliado'
// En WebP: los PNG originales pesaban en conjunto catorce veces más, y son lo primero que carga
// el inicio. Los .png siguen en `assets` como maestros, sin importarse.
import banner1 from '@/assets/banner_1.webp'
import banner2 from '@/assets/banner_2.webp'
import banner3 from '@/assets/banner_3.webp'
import banner4 from '@/assets/banner_4.webp'
import banner5 from '@/assets/banner_5.webp'

interface Diapositiva {
  imagen: string
  /** Los banners traen el mensaje impreso, así que el alt lo transcribe. */
  alt: string
  /** Destino al pulsar el banner. Sin él, la diapositiva es solo una imagen. */
  enlace?: string
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
  {
    imagen: banner3,
    alt: '¿Aún no tienes tu Tarjeta Virtual Presente? Actívala ahora y lleva la experiencia de compras online al siguiente nivel. Aplican términos y condiciones.',
  },
  {
    imagen: banner4,
    alt: 'Tienes un plan, nosotros el crédito para hacerlo realidad. Impulsamos tus sueños y te acompañamos para que los hagas realidad. Encuentra en Presente diferentes alternativas de financiación para acercarte cada vez más a tus metas.',
  },
  {
    imagen: banner5,
    alt: 'Seguro de vehículo para autos y motos: recorre y disfruta kilómetros con la tranquilidad de estar asegurado. Con la póliza de autos y motos estarás cubierto ante cualquier riesgo que pueda presentarse en la vía.',
    // El banner trae impreso un botón «Explora todas las opciones»: sin enlace prometería algo
    // que no ocurre al pulsarlo.
    enlace: URL_SEGURO,
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
      // Los banners no comparten proporción: van de 2.74:1 a 3.96:1. El contenedor fija una sola
      // y cada imagen entra con `object-contain`, así que ninguna se recorta nunca; la que no
      // coincide queda centrada sobre el relleno desenfocado. Al agregar un banner no hay que
      // tocar esta medida salvo que sea mucho más alto y el relleno se note de más.
      className="group relative aspect-[3840/1356] w-full overflow-hidden bg-primary"
    >
      {DIAPOSITIVAS.map((d, i) => {
        const imagenes = (
          <>
            {/* Relleno: la misma imagen ampliada y desenfocada tapa las franjas que deja
                object-contain, en vez de dejar barras planas de otro color. */}
            <img
              src={d.imagen}
              alt=""
              aria-hidden
              className="absolute inset-0 size-full scale-110 object-cover blur-2xl"
              loading={i === 0 ? 'eager' : 'lazy'}
            />

            <img
              src={d.imagen}
              alt={d.alt}
              // contain, no cover: el texto impreso del banner no se puede recortar.
              className="relative size-full object-contain"
              // Solo la primera bloquea el render inicial; las demás pueden esperar.
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'low'}
            />
          </>
        )

        return (
          <div
            key={`${d.imagen}-${i}`}
            aria-hidden={i !== actual}
            // `inert` además de ocultar: `pointer-events-none` frena el ratón pero no el tabulador,
            // y un enlace enfocable dentro de algo marcado como oculto deja al teclado navegando
            // por diapositivas que nadie está viendo.
            inert={i !== actual}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-in-out',
              i === actual ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            {d.enlace ? (
              <a
                href={d.enlace}
                target="_blank"
                rel="noopener noreferrer"
                className="block size-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {imagenes}
              </a>
            ) : (
              imagenes
            )}
          </div>
        )
      })}

      <button
        type="button"
        aria-label="Anterior"
        onClick={() => ir(actual - 1)}
        className="absolute top-1/2 left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/25 text-primary-foreground opacity-0 backdrop-blur transition-[opacity,background-color] duration-300 group-hover:opacity-100 hover:bg-background/40 focus-visible:opacity-100 pointer-coarse:opacity-100 sm:left-6"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>

      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => ir(actual + 1)}
        className="absolute top-1/2 right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/25 text-primary-foreground opacity-0 backdrop-blur transition-[opacity,background-color] duration-300 group-hover:opacity-100 hover:bg-background/40 focus-visible:opacity-100 pointer-coarse:opacity-100 sm:right-6"
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
