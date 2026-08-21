import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  titulo: string
  descripcion: string
  Icono: LucideIcon
  /** Nota que se antepone a los campos, para explicar por qué la sección se comporta distinto. */
  aviso?: ReactNode
  children: ReactNode
}

/** Bloque del formulario de publicación: encabezado con icono y una rejilla de tres columnas. */
export function SeccionFormulario({ titulo, descripcion, Icono, aviso, children }: Props) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
          <Icono className="size-4 text-foreground" aria-hidden />
        </span>

        <div>
          <h2 className="font-display text-lg font-bold text-foreground">{titulo}</h2>
          <p className="text-xs text-muted-foreground">{descripcion}</p>
        </div>
      </header>

      {aviso && <div className="mb-4">{aviso}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  )
}
