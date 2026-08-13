import mockup from '@/assets/Inicio_Login_Mockup.png'

/** GIF transparente de 1×1: ocupa 43 bytes y no genera petición de red. */
const PIXEL_VACIO =
  'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

/**
 * Capa del mockup.
 *
 * El `<source>` con `media` es lo que evita que el móvil pague por esta imagen: un `<img>` dentro
 * de un contenedor oculto se descarga igual —`display: none` no cancela la petición—, así que sin
 * esto cada inicio de sesión desde el celular se traía casi un mega para nada. El punto de corte
 * es el mismo `lg` que decide si el panel se ve.
 *
 * Ambas capas apuntan al mismo archivo, de modo que el navegador hace una sola petición.
 */
function CapaMockup({ className, alt }: { className: string; alt: string }) {
  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={mockup} />

      <img
        src={PIXEL_VACIO}
        alt={alt}
        aria-hidden={alt === '' || undefined}
        className={className}
        fetchPriority="high"
      />
    </picture>
  )
}

/**
 * Mitad izquierda del login. La pieza que entrega diseño ya trae el logo, el titular y los
 * mensajes incrustados en la propia imagen, así que aquí no se superpone nada: repetir el texto
 * en HTML lo mostraría dos veces.
 *
 * La imagen es vertical (964×1080). Si el panel se quedara en media ventana fija, su proporción
 * cambiaría con cada tamaño de navegador y siempre habría que sacrificar algo: recortando se
 * perdía el logo o el subtítulo, y mostrándola entera aparecían bandas a los lados.
 *
 * Así que es el panel el que se adapta a la imagen: su ancho se deriva del alto disponible con la
 * misma proporción del mockup, y entonces encaja exacto sin recortar ni dejar hueco. En una
 * pantalla 16:9 maximizada da casi justo la mitad, que es la intención del diseño; en una ventana
 * baja se estrecha y el formulario gana ese espacio.
 *
 * Los topes son para los extremos: sin ellos, una ventana muy alta lo convertiría en la pantalla
 * entera y una muy baja lo dejaría en una tira. Solo en esos casos vuelve a recortar, y por eso
 * se ancla arriba a la izquierda, donde están el logo y los textos.
 */
const PROPORCION_MOCKUP = 964 / 1080

export function PanelMarca() {
  return (
    // Oculto por debajo de `lg` para que en móvil el formulario ocupe toda la pantalla.
    <section
      style={{ width: `clamp(30vw, calc(100dvh * ${PROPORCION_MOCKUP}), 52vw)` }}
      className="relative hidden overflow-hidden bg-primary lg:block"
    >
      <CapaMockup
        // El texto vive dentro de la imagen: sin esta descripción, quien use lector de pantalla
        // no recibiría nada de lo que dice el panel.
        alt="ConMovilidad. El marketplace donde tu próximo vehículo te espera. Descubre miles de autos, camionetas y motos verificadas. Compra y vende con total confianza. Vehículos con documentación al día."
        className="absolute inset-0 size-full object-cover object-left-top"
      />
    </section>
  )
}
