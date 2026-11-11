import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { banners as apiBanners, type BannerPublico } from '@/api/banners'
import { cn } from '@/lib/utils'
import { URL_SEGURO } from '@/features/credito/enlacesAliado'
// En WebP: los PNG originales pesaban en conjunto catorce veces más, y son lo primero que carga
// el inicio. Los .png siguen en `assets` como maestros, sin importarse.
import banner1 from '@/assets/banner_1.webp'
import banner2 from '@/assets/banner_2.webp'
import banner3 from '@/assets/banner_3.webp'
import banner4 from '@/assets/banner_4.webp'
import banner5 from '@/assets/banner_5.webp'

/**
 * Los cinco banners con los que salió la plataforma, empaquetados con el front.
 *
 * Son el respaldo, no la fuente: el carrusel muestra lo que administra el superadministrador y
 * solo cae aquí si la API no devuelve ninguno —porque todavía no se ha subido nada, o porque no
 * respondió—. Así el inicio nunca aparece vacío, que es la pantalla que ve todo visitante nuevo.
 *
 * El día que haya banners cargados en la base, esta lista deja de usarse y puede retirarse.
 */
const DIAPOSITIVAS_EMPAQUETADAS: BannerPublico[] = [
  {
    imagenUrl: banner1,
    textoAlternativo:
      'Autos Galería: compraventa de carros multimarca y todas las gamas. Motos de mediano y alto cilindraje. Trámites de tránsito a nivel nacional.',
  },
  {
    imagenUrl: banner2,
    textoAlternativo:
      'Autos Galería: compra y venta de vehículos multimarca y todas las gamas, financiamos tu vehículo, pólizas todo riesgo.',
  },
  {
    imagenUrl: banner3,
    textoAlternativo:
      '¿Aún no tienes tu Tarjeta Virtual Presente? Actívala ahora y lleva la experiencia de compras online al siguiente nivel. Aplican términos y condiciones.',
  },
  {
    imagenUrl: banner4,
    textoAlternativo:
      'Tienes un plan, nosotros el crédito para hacerlo realidad. Impulsamos tus sueños y te acompañamos para que los hagas realidad. Encuentra en Presente diferentes alternativas de financiación para acercarte cada vez más a tus metas.',
  },
  {
    imagenUrl: banner5,
    textoAlternativo:
      'Seguro de vehículo para autos y motos: recorre y disfruta kilómetros con la tranquilidad de estar asegurado. Con la póliza de autos y motos estarás cubierto ante cualquier riesgo que pueda presentarse en la vía.',
    // El banner trae impreso un botón «Explora todas las opciones»: sin enlace prometería algo
    // que no ocurre al pulsarlo.
    enlace: URL_SEGURO,
  },
]

const INTERVALO_MS = 6000

export function CarruselHero() {
  const [actual, setActual] = useState(0)
  const [pausado, setPausado] = useState(false)

  // Sin `isPending`: mientras llega la respuesta se pintan los empaquetados en lugar de un hueco.
  // El inicio es lo primero que carga y un esqueleto del ancho de la pantalla se nota más que
  // un banner que se reemplaza.
  const { data } = useQuery({
    queryKey: ['banners'],
    queryFn: apiBanners.listar,
    // Son cinco filas que cambian cuando el administrador las cambia: no hace falta revalidar
    // en cada navegación dentro de la sesión.
    staleTime: 5 * 60 * 1000,
  })

  const diapositivas = data?.length ? data : DIAPOSITIVAS_EMPAQUETADAS
  const total = diapositivas.length

  // La lista puede encogerse en caliente: si estaba en la quinta y la respuesta trae tres, el
  // índice guardado apunta a una diapositiva que ya no existe. Se corrige al leerlo y no con un
  // efecto que lo reajuste, porque un efecto pintaría primero el fotograma vacío.
  const indice = actual < total ? actual : 0

  const ir = useCallback(
    (destino: number) => setActual(((destino % total) + total) % total),
    [total],
  )

  // El temporizador se reinicia con cada cambio manual: evita un salto brusco justo después
  // de que el usuario elige una diapositiva.
  const refActual = useRef(indice)
  refActual.current = indice

  useEffect(() => {
    if (pausado) return

    const t = setInterval(() => ir(refActual.current + 1), INTERVALO_MS)
    return () => clearInterval(t)
  }, [pausado, ir, indice])

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
      {diapositivas.map((d, i) => {
        const imagenes = (
          <>
            {/* Relleno: la misma imagen ampliada y desenfocada tapa las franjas que deja
                object-contain, en vez de dejar barras planas de otro color. */}
            <img
              src={d.imagenUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 size-full scale-110 object-cover blur-2xl"
              loading={i === 0 ? 'eager' : 'lazy'}
            />

            <img
              src={d.imagenUrl}
              alt={d.textoAlternativo}
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
            key={`${d.imagenUrl}-${i}`}
            aria-hidden={i !== indice}
            // `inert` además de ocultar: `pointer-events-none` frena el ratón pero no el tabulador,
            // y un enlace enfocable dentro de algo marcado como oculto deja al teclado navegando
            // por diapositivas que nadie está viendo.
            inert={i !== indice}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-in-out',
              i === indice ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            {d.enlace ? (
              <EnvoltorioEnlace enlace={d.enlace}>{imagenes}</EnvoltorioEnlace>
            ) : (
              imagenes
            )}
          </div>
        )
      })}

      <button
        type="button"
        aria-label="Anterior"
        onClick={() => ir(indice - 1)}
        className="absolute top-1/2 left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/25 text-primary-foreground opacity-0 backdrop-blur transition-[opacity,background-color] duration-300 group-hover:opacity-100 hover:bg-background/40 focus-visible:opacity-100 pointer-coarse:opacity-100 sm:left-6"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>

      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => ir(indice + 1)}
        className="absolute top-1/2 right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/25 text-primary-foreground opacity-0 backdrop-blur transition-[opacity,background-color] duration-300 group-hover:opacity-100 hover:bg-background/40 focus-visible:opacity-100 pointer-coarse:opacity-100 sm:right-6"
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {diapositivas.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir a la diapositiva ${i + 1}`}
            aria-current={i === indice}
            onClick={() => ir(i)}
            className={cn(
              'h-2 rounded-full transition-all',
              i === indice
                ? 'w-6 bg-cta'
                : 'w-2 bg-primary-foreground/50 hover:bg-primary-foreground/80',
            )}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Envuelve la diapositiva en su enlace. El administrador puede apuntar un banner a un sitio del
 * aliado o a una pantalla de la aplicación, y no se navegan igual: lo externo abre en otra
 * pestaña para no sacar al visitante del catálogo, y lo interno va por el enrutador, sin recargar
 * la aplicación entera.
 */
function EnvoltorioEnlace({ enlace, children }: { enlace: string; children: ReactNode }) {
  const CLASES = 'block size-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50'

  return enlace.startsWith('/') ? (
    <Link to={enlace} className={CLASES}>
      {children}
    </Link>
  ) : (
    <a href={enlace} target="_blank" rel="noopener noreferrer" className={CLASES}>
      {children}
    </a>
  )
}
