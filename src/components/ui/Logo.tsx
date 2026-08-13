import logo from '@/assets/Logo_ConMovilidad.png'
import { cn } from '@/lib/utils'

/**
 * Marca oficial de ConMovilidad. Se importa en vez de referenciarla desde `public` para que el
 * empaquetado le ponga huella en el nombre: así el navegador puede cachearla indefinidamente y
 * un cambio de logo no se queda servido desde una copia vieja.
 *
 * La altura por defecto es obligatoria: el PNG mide 949×275 y sin acotarla desborda el contenedor.
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
