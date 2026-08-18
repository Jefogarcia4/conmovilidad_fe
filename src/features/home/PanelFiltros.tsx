import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal } from 'lucide-react'
import { vehiculos } from '@/api/endpoints'
import { CampoPrecio } from '@/components/ui/CampoPrecio'
import { ComboBox } from '@/components/ui/ComboBox'

export interface ValoresFiltro {
  ciudad?: string
  marcaId?: string
  lineaId?: string
  precioDesde?: number
  precioHasta?: number
}

interface Props {
  valores: ValoresFiltro
  onCambio: (valores: ValoresFiltro) => void
  totalResultados?: number
}

/** Etiqueta pequeña sobre cada control del panel de filtros. */
function CampoFiltro({
  etiqueta,
  htmlFor,
  children,
}: {
  etiqueta: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-muted-foreground select-none"
      >
        {etiqueta}
      </label>
      {children}
    </div>
  )
}

export function PanelFiltros({ valores, onCambio, totalResultados }: Props) {
  /*
   * Las tres listas salen del propio catálogo, no de los datos maestros: el formulario de alta
   * ofrece los más de mil municipios del país, y traerlos todos al filtro llenaría el
   * desplegable de ciudades sin un solo vehículo. Aquí solo aparece lo que hay publicado.
   */
  const { data: opciones } = useQuery({
    queryKey: ['vehiculos', 'catalogo', 'filtros'],
    queryFn: vehiculos.filtrosCatalogo,
  })

  const ciudades = opciones?.ciudades ?? []
  const marcas = opciones?.marcas ?? []

  // Las líneas llegan todas juntas; el desplegable muestra solo las de la marca elegida.
  const lineas = (opciones?.lineas ?? []).filter((l) => l.marcaId === valores.marcaId)

  const actualizar = (cambio: Partial<ValoresFiltro>) => onCambio({ ...valores, ...cambio })

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
          <SlidersHorizontal className="size-4 text-cta" aria-hidden />
          Filtrar búsqueda
        </h2>

        {totalResultados !== undefined && (
          <span className="text-sm text-muted-foreground">
            {totalResultados} {totalResultados === 1 ? 'resultado' : 'resultados'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <CampoFiltro etiqueta="Ciudad" htmlFor="filtro-ciudad">
          <ComboBox
            id="filtro-ciudad"
            textoVacio="Todas las ciudades"
            valor={valores.ciudad ?? ''}
            onCambio={(v) => actualizar({ ciudad: v || undefined })}
            opciones={ciudades.map((c) => ({ valor: c, etiqueta: c }))}
          />
        </CampoFiltro>

        <CampoFiltro etiqueta="Marca" htmlFor="filtro-marca">
          <ComboBox
            id="filtro-marca"
            textoVacio="Todas las marcas"
            valor={valores.marcaId ?? ''}
            // Cambiar de marca invalida la línea elegida: pertenecía a la marca anterior.
            onCambio={(v) => actualizar({ marcaId: v || undefined, lineaId: undefined })}
            opciones={marcas.map((m) => ({ valor: m.id, etiqueta: m.nombre }))}
          />
        </CampoFiltro>

        <CampoFiltro etiqueta="Modelo" htmlFor="filtro-modelo">
          <ComboBox
            id="filtro-modelo"
            textoVacio="Todos los modelos"
            valor={valores.lineaId ?? ''}
            onCambio={(v) => actualizar({ lineaId: v || undefined })}
            deshabilitado={!valores.marcaId}
            opciones={lineas.map((l) => ({ valor: l.id, etiqueta: l.nombre }))}
          />
        </CampoFiltro>

        <CampoPrecio
          etiqueta="Precio mínimo"
          valor={valores.precioDesde}
          onCambio={(v) => actualizar({ precioDesde: v })}
        />

        <CampoPrecio
          etiqueta="Precio máximo"
          valor={valores.precioHasta}
          onCambio={(v) => actualizar({ precioHasta: v })}
        />
      </div>
    </div>
  )
}
