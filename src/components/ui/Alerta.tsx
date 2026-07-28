import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Mensaje de error de la operación. Es `role="alert"` para que el lector de pantalla lo anuncie
 * en cuanto aparece, sin que el usuario tenga que ir a buscarlo.
 */
export function Alerta({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      <AlertCircle className="mt-px size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </div>
  )
}
