import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal } from 'lucide-react'
import { catalogos } from '@/api/endpoints'
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
  const { data: marcas } = useQuery({
    queryKey: ['catalogos', 'marcas'],
    queryFn: catalogos.marcas,
    staleTime: Infinity,
  })

  // Las líneas se piden solo cuando hay marca elegida: el catálogo completo son cientos de filas.
  const { data: lineas } = useQuery({
    queryKey: ['catalogos', 'lineas', valores.marcaId],
    queryFn: () => catalogos.lineas(valores.marcaId),
    enabled: Boolean(valores.marcaId),
    staleTime: Infinity,
  })

  // No hay catálogo de ciudades en la API: se derivan de las empresas del convenio,
  // que es exactamente el universo de ciudades donde este usuario puede ver vehículos.
  const { data: empresas } = useQuery({
    queryKey: ['catalogos', 'empresas'],
    queryFn: catalogos.empresas,
    staleTime: Infinity,
  })

  const ciudades = [...new Set((empresas ?? []).map((e) => e.ciudad).filter(Boolean))].sort()

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
            opciones={ciudades.map((c) => ({ valor: c!, etiqueta: c! }))}
          />
        </CampoFiltro>

        <CampoFiltro etiqueta="Marca" htmlFor="filtro-marca">
          <ComboBox
            id="filtro-marca"
            textoVacio="Todas las marcas"
            valor={valores.marcaId ?? ''}
            // Cambiar de marca invalida la línea elegida: pertenecía a la marca anterior.
            onCambio={(v) => actualizar({ marcaId: v || undefined, lineaId: undefined })}
            opciones={(marcas ?? []).map((m) => ({ valor: m.id, etiqueta: m.nombre }))}
          />
        </CampoFiltro>

        <CampoFiltro etiqueta="Modelo" htmlFor="filtro-modelo">
          <ComboBox
            id="filtro-modelo"
            textoVacio="Todos los modelos"
            valor={valores.lineaId ?? ''}
            onCambio={(v) => actualizar({ lineaId: v || undefined })}
            deshabilitado={!valores.marcaId}
            opciones={(lineas ?? []).map((l) => ({ valor: l.id, etiqueta: l.nombre }))}
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
