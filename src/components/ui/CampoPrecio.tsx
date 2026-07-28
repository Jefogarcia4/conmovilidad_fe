import { useId } from 'react'

interface Props {
  etiqueta: string
  valor: number | undefined
  onCambio: (valor: number | undefined) => void
}

/**
 * Entrada de precio con el `$` fijo dentro del campo. Se escribe en crudo y se formatea con
 * separadores de miles mientras el usuario teclea, que es lo que hace legible una cifra de 9 dígitos.
 */
export function CampoPrecio({ etiqueta, valor, onCambio }: Props) {
  const id = useId()

  const mostrado = valor === undefined ? '' : valor.toLocaleString('es-CO')

  const alEscribir = (texto: string) => {
    const soloDigitos = texto.replace(/\D/g, '')
    onCambio(soloDigitos === '' ? undefined : Number(soloDigitos))
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground select-none">
        {etiqueta}
      </label>

      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground"
        >
          $
        </span>

        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={mostrado}
          onChange={(e) => alEscribir(e.target.value)}
          placeholder="0"
          className="h-8 w-full rounded-lg border border-input bg-transparent py-2 pr-2.5 pl-6 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
    </div>
  )
}
