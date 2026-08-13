import logo from '@/assets/Logo_ConMovilidad_ajustado.png'
import { cn } from '@/lib/utils'

/**
 * Marca oficial de ConMovilidad. Se importa en vez de referenciarla desde `public` para que el
 * empaquetado le ponga huella en el nombre: así el navegador puede cachearla indefinidamente y
 * un cambio de logo no se queda servido desde una copia vieja.
 *
 * Usa la versión sin márgenes (876×163). El archivo original que entrega diseño
 * —`Logo_ConMovilidad.png`, 949×275— lleva un 41% de alto en transparencia alrededor, así que
 * cualquier altura que se le pusiera dibujaba el logo bastante más pequeño de lo pedido: con
 * `h-9` se veía a 21 px en vez de a 36. Recortar ese vacío no cambia el diseño y hace que la
 * altura signifique lo que dice.
 *
 * Si diseño entrega un logo nuevo, hay que volver a recortarlo antes de reemplazar este archivo.
 *
 * La altura es obligatoria: sin acotarla, la imagen desborda el contenedor.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="ConMovilidad"
      className={cn('h-7 w-auto shrink-0 select-none', className)}
    />
  )
}
