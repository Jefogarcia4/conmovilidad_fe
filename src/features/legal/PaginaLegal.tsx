import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { Logo } from '@/components/ui/Logo'

/**
 * Armazón de los documentos legales.
 *
 * Vive fuera del layout de la aplicación porque estas páginas tienen que poder leerse **sin haber
 * iniciado sesión**: se enlazan desde la casilla del login y desde la de activación, y exigir
 * aceptar algo que no se puede abrir no se sostiene ni en lo legal ni en lo razonable.
 */
export function PaginaLegal({
  titulo,
  version,
  actualizacion,
  children,
}: {
  titulo: string
  version: string
  /** Fecha de la versión vigente, como la trae el documento. */
  actualizacion: string
  children: ReactNode
}) {
  const { estaAutenticado } = useAuth()

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <Link to={estaAutenticado ? '/home' : '/login'} aria-label="Ir al inicio">
            <Logo className="h-8" />
          </Link>

          <Link
            to={estaAutenticado ? '/home' : '/login'}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {estaAutenticado ? 'Volver al catálogo' : 'Volver al ingreso'}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
        <h1 className="font-display text-3xl font-bold text-balance text-foreground">{titulo}</h1>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Etiqueta>Versión {version}</Etiqueta>
          <Etiqueta>Actualización {actualizacion}</Etiqueta>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Plataforma operada por <strong className="text-foreground">AUTOS GALERIA S.A.S.</strong>,
          NIT 902.041.528-4.
        </p>

        <div className="mt-8 space-y-8">{children}</div>

        <footer className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            Cra 43A #19A 87, Local 112 (Movicentro Centro Comercial Automotriz), Medellín,
            Antioquia.
          </p>
          <p className="mt-1">
            <a href="mailto:autos.galeria.med@gmail.com" className="text-cta hover:underline">
              autos.galeria.med@gmail.com
            </a>{' '}
            · +57 314 803 7183
          </p>
        </footer>
      </main>
    </div>
  )
}

function Etiqueta({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-5 items-center rounded-4xl bg-muted px-2 py-0.5 font-medium text-muted-foreground">
      {children}
    </span>
  )
}

/** Apartado numerado del documento. El `id` permite enlazar a una cláusula concreta. */
export function Seccion({
  numero,
  titulo,
  children,
}: {
  numero?: string
  titulo: string
  children: ReactNode
}) {
  const id = numero ? `clausula-${numero.replace(/\./g, '-')}` : undefined

  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-display text-lg font-bold text-foreground">
        {numero && <span className="text-cta">{numero}. </span>}
        {titulo}
      </h2>

      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

/** Apartado de segundo nivel (4.1, 9.1…). */
export function Subseccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="pt-2">
      <h3 className="text-sm font-semibold text-foreground">{titulo}</h3>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  )
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
}

/** Lista con viñetas o con letras, según cómo numere el documento original. */
export function Lista({ children, letras = false }: { children: ReactNode; letras?: boolean }) {
  return (
    <ul
      className={`ml-5 space-y-2 text-sm leading-relaxed text-muted-foreground ${
        letras ? 'list-[lower-alpha]' : 'list-disc'
      }`}
    >
      {children}
    </ul>
  )
}

export function Li({ children }: { children: ReactNode }) {
  return <li className="pl-1">{children}</li>
}

/** Bloque destacado, para las reglas que el documento enmarca. */
export function Destacado({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-sm font-semibold text-foreground">{titulo}</p>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  )
}

/** Nota al pie del documento, con su marca de referencia. */
export function NotaAlPie({ numero, children }: { numero: number; children: ReactNode }) {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      <sup className="font-semibold text-foreground">{numero}</sup> {children}
    </p>
  )
}
