import { Boton } from './Boton'

interface Props {
  pagina: number
  totalPaginas: number
  totalRegistros: number
  onCambiar: (pagina: number) => void
  /** Palabra con la que contar los resultados: «usuario» → «12 usuarios». */
  nombre: string
}

/**
 * Barra de paginación de una tabla. Muestra el total además de los controles porque, cuando el
 * listado está paginado, saber cuántos registros hay en total deja de ser evidente.
 *
 * Con una sola página se oculta a sí misma: no se hace navegar por algo que no se puede navegar.
 */
export function Paginacion({ pagina, totalPaginas, totalRegistros, onCambiar, nombre }: Props) {
  if (totalPaginas <= 1) {
    return (
      <p className="text-sm text-muted-foreground">
        {totalRegistros} {totalRegistros === 1 ? nombre : `${nombre}s`}
      </p>
    )
  }

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <span className="text-muted-foreground">
        {totalRegistros} {nombre}s · página {pagina} de {totalPaginas}
      </span>

      <div className="flex items-center gap-2">
        <Boton
          variante="secundario"
          disabled={pagina <= 1}
          onClick={() => onCambiar(pagina - 1)}
        >
          Anterior
        </Boton>

        <Boton
          variante="secundario"
          disabled={pagina >= totalPaginas}
          onClick={() => onCambiar(pagina + 1)}
        >
          Siguiente
        </Boton>
      </div>
    </nav>
  )
}
