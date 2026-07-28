import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  etiqueta: string
  htmlFor?: string
  /** Marca el campo como obligatorio con un asterisco, como indica el encabezado del formulario. */
  requerido?: boolean
  error?: string
  ayuda?: string
  className?: string
  children: ReactNode
}

/** Envoltorio con etiqueta, texto de ayuda y mensaje de error para un control del formulario. */
export function CampoFormulario({
  etiqueta,
  htmlFor,
  requerido = false,
  error,
  ayuda,
  className,
  children,
}: Props) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm leading-none font-medium select-none">
        {etiqueta}
        {requerido && (
          <span className="ml-0.5 text-cta" aria-hidden>
            *
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : ayuda ? (
        <p className="text-xs text-muted-foreground">{ayuda}</p>
      ) : null}
    </div>
  )
}
