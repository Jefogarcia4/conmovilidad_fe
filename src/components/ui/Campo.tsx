import { useId, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  etiqueta: string
  error?: string
  /** Añade el botón de mostrar/ocultar y alterna el tipo del input. */
  conRevelarPassword?: boolean
}

export function Campo({
  etiqueta,
  error,
  conRevelarPassword = false,
  className,
  type = 'text',
  ...props
}: Props) {
  const id = useId()
  const idError = `${id}-error`
  const [visible, setVisible] = useState(false)

  const tipoEfectivo = conRevelarPassword && visible ? 'text' : type

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm leading-none font-medium select-none">
        {etiqueta}
      </label>

      <div className="relative">
        <input
          {...props}
          id={id}
          type={tipoEfectivo}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idError : undefined}
          className={cn(
            'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1',
            'text-base transition-colors outline-none md:text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
            'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
            conRevelarPassword && 'pr-10',
            className,
          )}
        />

        {conRevelarPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            // El input ya está etiquetado; este botón necesita su propio nombre accesible.
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>

      {error && (
        <p id={idError} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
