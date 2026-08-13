import mockup from '@/assets/Inicio_Login_Mockup.png'

/** GIF transparente de 1×1: ocupa 43 bytes y no genera petición de red. */
const PIXEL_VACIO =
  'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

/**
 * Mitad izquierda del login. La pieza que entrega diseño ya trae el logo, el titular y los
 * mensajes incrustados en la propia imagen, así que aquí no se superpone nada: repetir el texto
 * en HTML lo mostraría dos veces.
 *
 * El encuadre se ancla a la izquierda porque ahí están el logo y los textos; cuando la ventana es
 * más estrecha que la imagen, el recorte se lleva el borde derecho de la fotografía y no la parte
 * que comunica.
 */
export function PanelMarca() {
  return (
    // Oculto por debajo de `lg` para que en móvil el formulario ocupe toda la pantalla.
    <section className="relative hidden overflow-hidden bg-primary lg:block">
      {/*
       * El `<source>` con `media` es lo que evita que el móvil pague por esta imagen. Un `<img>`
       * dentro de un contenedor oculto se descarga igual —`display: none` no cancela la petición—,
       * así que sin esto cada inicio de sesión desde el celular se traía casi un mega para nada.
       * El punto de corte es el mismo `lg` que decide si el panel se ve.
       */}
      <picture>
        <source media="(min-width: 1024px)" srcSet={mockup} />

        <img
          src={PIXEL_VACIO}
          // El texto vive dentro de la imagen: sin esta descripción, quien use lector de pantalla
          // no recibiría nada de lo que dice el panel.
          alt="ConMovilidad. El marketplace donde tu próximo vehículo te espera. Descubre miles de autos, camionetas y motos verificadas. Compra y vende con total confianza. Vehículos con documentación al día."
          className="absolute inset-0 size-full object-cover object-left"
          fetchPriority="high"
        />
      </picture>
    </section>
  )
}
