import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SearchX } from 'lucide-react'
import { vehiculos } from '@/api/endpoints'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { useDebounce } from '@/lib/useDebounce'
import { cn } from '@/lib/utils'
import { CarruselHero } from './CarruselHero'
import { PanelFiltros, type ValoresFiltro } from './PanelFiltros'
import { TarjetaVehiculo, TarjetaVehiculoEsqueleto } from './TarjetaVehiculo'

const POR_PAGINA = 12

export function HomePage() {
  const [filtros, setFiltros] = useState<ValoresFiltro>({})
  const [pagina, setPagina] = useState(1)

  // Los precios se escriben dígito a dígito; el resto de filtros son selects y no lo necesitan.
  const precioDesde = useDebounce(filtros.precioDesde)
  const precioHasta = useDebounce(filtros.precioHasta)

  const consulta = {
    ciudad: filtros.ciudad,
    marcaId: filtros.marcaId,
    lineaId: filtros.lineaId,
    precioDesde,
    precioHasta,
    pagina,
    tamanoPagina: POR_PAGINA,
  }

  const { data, isPending, isFetching, error } = useQuery({
    queryKey: ['vehiculos', 'catalogo', consulta],
    queryFn: () => vehiculos.catalogo(consulta),
    // Mantener la página anterior evita que la grilla colapse mientras se refiltra.
    placeholderData: keepPreviousData,
  })

  const cambiarFiltros = (nuevos: ValoresFiltro) => {
    setFiltros(nuevos)
    setPagina(1)
  }

  return (
    <>
      <CarruselHero />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* El panel monta sobre el hero, como en el mockup. */}
        <div className="relative z-10 -mt-14">
          <PanelFiltros
            valores={filtros}
            onCambio={cambiarFiltros}
            totalResultados={data?.totalRegistros}
          />
        </div>

        <div className="mt-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Vehículos disponibles
              </h2>
              <p className="text-sm text-muted-foreground">
                Encuentra el vehículo ideal entre nuestra selección premium.
              </p>
            </div>
          </div>

          {error && <Alerta>{(error as Error).message}</Alerta>}

          {isPending ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <TarjetaVehiculoEsqueleto key={i} />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <div
              className={cn(
                'grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
                // Atenúa la grilla mientras llega una página nueva, sin quitarla de pantalla.
                isFetching && 'opacity-60',
              )}
            >
              {data.items.map((v, i) => (
                // La primera fila entra sin diferir: es lo que se ve al abrir el catálogo, y
                // `loading="lazy"` en esas cuatro solo retrasa la imagen que marca la sensación
                // de rapidez. El resto sigue perezoso.
                <TarjetaVehiculo key={v.id} vehiculo={v} prioritaria={i < 4} />
              ))}
            </div>
          ) : (
            !error && <SinResultados alLimpiar={() => cambiarFiltros({})} />
          )}

          {data && data.totalPaginas > 1 && (
            <nav
              aria-label="Paginación"
              className="mt-8 flex items-center justify-center gap-3 text-sm"
            >
              <Boton
                variante="secundario"
                disabled={!data.tienePaginaAnterior}
                onClick={() => setPagina((p) => p - 1)}
              >
                Anterior
              </Boton>

              <span className="text-muted-foreground">
                Página {data.pagina} de {data.totalPaginas}
              </span>

              <Boton
                variante="secundario"
                disabled={!data.tienePaginaSiguiente}
                onClick={() => setPagina((p) => p + 1)}
              >
                Siguiente
              </Boton>
            </nav>
          )}
        </div>
      </section>
    </>
  )
}

function SinResultados({ alLimpiar }: { alLimpiar: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <SearchX className="mx-auto size-10 text-muted-foreground" aria-hidden />

      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
        No encontramos vehículos
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Prueba a ampliar el rango de precio o a quitar alguno de los filtros aplicados.
      </p>

      <Boton variante="secundario" className="mt-5" onClick={alLimpiar}>
        Limpiar filtros
      </Boton>
    </div>
  )
}
