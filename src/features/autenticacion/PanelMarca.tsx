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
 * Y por eso mismo la imagen no puede recortarse. Cubrir el panel funciona mientras la ventana
 * mantenga una proporción parecida a la del mockup —en una pantalla 16:9 maximizada coinciden
 * casi exactamente—, pero basta con que el navegador quede bajo para que el recorte se lleve el
 * logo por arriba y la línea de la garantía por abajo. Se muestra entera y el hueco lo tapa la
 * misma imagen ampliada y desenfocada, en vez de una franja plana.
 */
export function PanelMarca() {
  return (
    // Oculto por debajo de `lg` para que en móvil el formulario ocupe toda la pantalla.
    <section className="relative hidden overflow-hidden bg-primary lg:block">
      <CapaMockup alt="" className="absolute inset-0 size-full scale-110 object-cover blur-2xl" />

      <CapaMockup
        // El texto vive dentro de la imagen: sin esta descripción, quien use lector de pantalla
        // no recibiría nada de lo que dice el panel.
        alt="ConMovilidad. El marketplace donde tu próximo vehículo te espera. Descubre miles de autos, camionetas y motos verificadas. Compra y vende con total confianza. Vehículos con documentación al día."
        className="absolute inset-0 size-full object-contain"
      />
    </section>
  )
}
