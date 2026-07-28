import { LayoutGrid, Table } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ModoVista = 'tabla' | 'tarjetas'

interface Props {
  valor: ModoVista
  onCambio: (modo: ModoVista) => void
}

/**
 * Grupo de dos botones excluyentes. Se usa `role="radiogroup"` en vez de dos botones sueltos
 * para que el lector de pantalla anuncie cuál de las dos vistas está activa.
 */
export function AlternadorVista({ valor, onCambio }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Forma de visualización"
      className="flex items-center gap-1 rounded-lg border border-border p-1"
    >
      <Opcion
        etiqueta="Vista de tabla"
        activo={valor === 'tabla'}
        onClick={() => onCambio('tabla')}
      >
        <Table className="size-4" aria-hidden />
      </Opcion>

      <Opcion
        etiqueta="Vista de tarjetas"
        activo={valor === 'tarjetas'}
        onClick={() => onCambio('tarjetas')}
      >
        <LayoutGrid className="size-4" aria-hidden />
      </Opcion>
    </div>
  )
}

interface PropsOpcion {
  etiqueta: string
  activo: boolean
  onClick: () => void
  children: React.ReactNode
}

function Opcion({ etiqueta, activo, onClick, children }: PropsOpcion) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={activo}
      aria-label={etiqueta}
      title={etiqueta}
      onClick={onClick}
      className={cn(
        'flex size-8 items-center justify-center rounded-md transition-colors',
        'outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        activo
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
