import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  titulo: string
  descripcion?: string
  onCerrar: () => void
  /** Bloquea el cierre mientras hay una operación en curso. */
  bloqueado?: boolean
  ancho?: 'md' | 'lg'
  children: ReactNode
  pie?: ReactNode
}

/**
 * Diálogo modal sobre `<dialog>` nativo: el navegador aporta atrapado de foco, cierre con
 * Escape y fondo inerte sin necesidad de librerías ni de gestionar el foco a mano.
 */
export function Modal({
  titulo,
  descripcion,
  onCerrar,
  bloqueado = false,
  ancho = 'md',
  children,
  pie,
}: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialogo.current?.showModal()
  }, [])

  return (
    <dialog
      ref={dialogo}
      onCancel={(e) => {
        e.preventDefault()
        if (!bloqueado) onCerrar()
      }}
      className={cn(
        'm-auto w-[calc(100%-2rem)] rounded-2xl border border-border bg-card p-0 text-foreground shadow-xl',
        'backdrop:bg-foreground/40 backdrop:backdrop-blur-sm',
        ancho === 'lg' ? 'max-w-2xl' : 'max-w-md',
      )}
    >
      <header className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <h2 className="font-display text-lg font-bold">{titulo}</h2>
          {descripcion && <p className="mt-0.5 text-sm text-muted-foreground">{descripcion}</p>}
        </div>

        <button
          type="button"
          onClick={onCerrar}
          disabled={bloqueado}
          aria-label="Cerrar"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <X className="size-4" aria-hidden />
        </button>
      </header>

      <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>

      {pie && (
        <footer className="flex justify-end gap-2 border-t border-border p-5">{pie}</footer>
      )}
    </dialog>
  )
}
