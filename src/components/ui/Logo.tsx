import { cn } from '@/lib/utils'

/**
 * Marca de Autos Galería.
 *
 * El logotipo original es un cuadro con fondo de hexágonos: arriba el emblema (alas y escudo) y
 * debajo la palabra, en blanco. A tamaño de cabecera esa palabra queda en doce píxeles, así que se
 * recorta solo el emblema (`public/brand/ag-emblema.png`) y el nombre se compone como texto: sale
 * nítido a cualquier tamaño y toma el color de donde se use, sin necesitar una versión por fondo.
 */

const TAMANOS = {
  sm: { emblema: 'h-7', texto: 'text-[0.58rem]', hueco: 'gap-2' },
  md: { emblema: 'h-9', texto: 'text-[0.72rem]', hueco: 'gap-2.5' },
  lg: { emblema: 'h-11', texto: 'text-[0.85rem]', hueco: 'gap-3' },
} as const

interface Props {
  tamano?: keyof typeof TAMANOS
  className?: string
}

export function Logo({ tamano = 'md', className }: Props) {
  const { emblema, texto, hueco } = TAMANOS[tamano]

  return (
    <span className={cn('inline-flex items-center select-none', hueco, className)}>
      {/*
        El emblema trae su propio fondo oscuro. Se redondea para que lea como una insignia, y el
        aro —apenas visible— evita que su borde se pierda cuando se usa sobre una superficie
        igual de oscura, como el pie de página.
      */}
      <img
        src="/brand/ag-emblema.png"
        alt=""
        aria-hidden
        className={cn('w-auto shrink-0 rounded-md ring-1 ring-white/10', emblema)}
      />

      {/* Dos líneas, como en el logotipo original. */}
      <span
        className={cn(
          'font-display leading-none font-bold tracking-[0.14em] whitespace-nowrap uppercase',
          texto,
        )}
      >
        Autos
        <br />
        Galería
      </span>
    </span>
  )
}
