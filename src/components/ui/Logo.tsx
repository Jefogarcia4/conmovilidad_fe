import { cn } from '@/lib/utils'

/**
 * Marca oficial de ConMovilidad, tomada del mockup (`public/brand/logo-mark.png`).
 * La altura por defecto es obligatoria: el PNG mide 920×144 y sin acotarla desborda el contenedor.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/brand/logo-mark.png"
      alt="ConMovilidad"
      className={cn('h-7 w-auto shrink-0 select-none', className)}
    />
  )
}
