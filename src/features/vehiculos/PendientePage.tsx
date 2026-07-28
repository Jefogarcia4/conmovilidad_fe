import { Construction } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Marcador para las rutas que ya tienen enlace en el diseño pero todavía no tienen mockup.
 * Existe para que ningún enlace del header o del footer lleve a una pantalla en blanco.
 */
export function PendientePage({ titulo }: { titulo: string }) {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <Construction className="size-10 text-cta" aria-hidden />

      <h1 className="mt-5 font-display text-2xl font-bold text-foreground">{titulo}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Esta pantalla está en construcción. Vuelve pronto.
      </p>

      <Link
        to="/home"
        className="mt-6 inline-flex h-8 items-center rounded-lg bg-cta px-3 text-sm font-medium text-cta-foreground transition-all hover:bg-cta-hover"
      >
        Volver al inicio
      </Link>
    </section>
  )
}
