import { clasesControl } from './estilosControl'
import { cn } from '@/lib/utils'

interface Props {
  id?: string
  valor: number | undefined
  onCambio: (valor: number | undefined) => void
  placeholder?: string
  /** Símbolo fijo dentro del campo, por ejemplo `$` en el precio. */
  prefijo?: string
  invalido?: boolean
  maximo?: number
}

/**
 * Entrada de números enteros con separador de miles en vivo (`145.000`). Se usa `type="text"`
 * a propósito: `type="number"` no admite el punto de miles y además muestra flechas que no
 * aportan nada en cifras de seis o nueve dígitos.
 */
export function CampoNumerico({
  id,
  valor,
  onCambio,
  placeholder,
  prefijo,
  invalido = false,
  maximo,
}: Props) {
  const mostrado = valor === undefined ? '' : valor.toLocaleString('es-CO')

  const alEscribir = (texto: string) => {
    const digitos = texto.replace(/\D/g, '')

    if (digitos === '') {
      onCambio(undefined)
      return
    }

    const numero = Number(digitos)
    onCambio(maximo !== undefined && numero > maximo ? maximo : numero)
  }

  return (
    <div className="relative">
      {prefijo && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground"
        >
          {prefijo}
        </span>
      )}

      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={mostrado}
        placeholder={placeholder}
        aria-invalid={invalido || undefined}
        onChange={(e) => alEscribir(e.target.value)}
        className={cn(
          clasesControl,
          prefijo && 'pl-6',
          invalido ? 'border-destructive focus-visible:ring-destructive/20' : 'border-input',
        )}
      />
    </div>
  )
}
