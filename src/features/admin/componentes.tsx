import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Contenedor de tabla del portal: bordes, fondo y desplazamiento horizontal propio. */
export function TablaAdmin({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
      <div className="relative w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm">{children}</table>
      </div>
    </div>
  )
}

export function EncabezadoTabla({ columnas }: { columnas: (string | { texto: string; derecha: true })[] }) {
  return (
    <thead>
      <tr className="border-b border-border bg-secondary/50">
        {columnas.map((c) => {
          const texto = typeof c === 'string' ? c : c.texto
          const derecha = typeof c !== 'string'

          return (
            <th
              key={texto}
              className={cn(
                'h-10 px-3 align-middle font-medium whitespace-nowrap text-foreground',
                derecha ? 'text-right' : 'text-left',
              )}
            >
              {texto}
            </th>
          )
        })}
      </tr>
    </thead>
  )
}

export function FilaTabla({ children, atenuada }: { children: ReactNode; atenuada?: boolean }) {
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors last:border-0 hover:bg-muted/50',
        // Los inactivos siguen listados pero se distinguen de un vistazo.
        atenuada && 'opacity-55',
      )}
    >
      {children}
    </tr>
  )
}

export function Celda({
  children,
  derecha,
  apagada,
}: {
  children: ReactNode
  derecha?: boolean
  apagada?: boolean
}) {
  return (
    <td
      className={cn(
        'px-3 py-2.5 align-middle whitespace-nowrap',
        derecha && 'text-right',
        apagada && 'text-muted-foreground',
      )}
    >
      {children}
    </td>
  )
}

export function EtiquetaEstado({ activo }: { activo: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 w-fit items-center rounded-4xl px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        activo ? 'bg-cta/10 text-cta' : 'bg-muted text-muted-foreground',
      )}
    >
      <span
        aria-hidden
        className={cn('mr-1 inline-block size-1.5 rounded-full', activo ? 'bg-cta' : 'bg-muted-foreground')}
      />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  )
}

interface PropsBoton {
  etiqueta: string
  onClick: () => void
  children: ReactNode
  destructivo?: boolean
  disabled?: boolean
}

/** Acción de fila: solo icono, así que el nombre accesible es obligatorio. */
export function BotonFila({ etiqueta, onClick, children, destructivo, disabled }: PropsBoton) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-all',
        'outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        'disabled:pointer-events-none disabled:opacity-50',
        destructivo
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

export function EstadoVacio({ mensaje }: { mensaje: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
      {mensaje}
    </div>
  )
}
