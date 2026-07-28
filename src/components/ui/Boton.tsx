import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variante = 'cta' | 'secundario' | 'fantasma'
type Tamano = 'sm' | 'md' | 'lg'

const variantes: Record<Variante, string> = {
  cta: 'bg-cta text-cta-foreground hover:bg-cta-hover',
  secundario: 'bg-card text-foreground border-border hover:bg-muted',
  fantasma: 'text-muted-foreground hover:bg-muted hover:text-foreground',
}

const tamanos: Record<Tamano, string> = {
  sm: 'h-7 px-2.5 text-sm',
  md: 'h-8 px-3 text-sm',
  lg: 'h-9 px-4 text-sm',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
  cargando?: boolean
  children: ReactNode
}

export function Boton({
  variante = 'cta',
  tamano = 'md',
  cargando = false,
  className,
  children,
  disabled,
  ...props
}: Props) {
  return (
    <button
      {...props}
      // Mientras carga se bloquea el botón para no duplicar la petición con un doble clic.
      disabled={disabled || cargando}
      aria-busy={cargando}
      className={cn(
        'group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg',
        'border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap',
        'transition-all outline-none select-none',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        'active:translate-y-px',
        'disabled:pointer-events-none disabled:opacity-50',
        variantes[variante],
        tamanos[tamano],
        className,
      )}
    >
      {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}
