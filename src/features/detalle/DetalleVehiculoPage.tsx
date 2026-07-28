import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '@/api/cliente'
import { vehiculos } from '@/api/endpoints'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { EstadoBadge } from '@/features/vehiculos/EstadoBadge'
import { useEtiquetasVehiculo } from '@/features/vehiculos/useEtiquetasVehiculo'
import { GaleriaVehiculo } from './GaleriaVehiculo'
import { InformacionVehiculo } from './InformacionVehiculo'
import { PanelContacto } from './PanelContacto'

export function DetalleVehiculoPage() {
  const { id } = useParams<{ id: string }>()
  const etiqueta = useEtiquetasVehiculo()

  const { data, isPending, error } = useQuery({
    queryKey: ['vehiculos', 'detalle', id],
    queryFn: () => vehiculos.detalle(id!),
    enabled: Boolean(id),
  })

  if (isPending) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-label="Cargando" />
      </div>
    )
  }

  if (error) {
    const noEncontrado = error instanceof ApiError && error.status === 404

    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          {noEncontrado ? 'Este vehículo no está disponible' : 'No pudimos cargar el vehículo'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {noEncontrado
            ? 'Puede que se haya retirado del catálogo o que pertenezca a otro convenio.'
            : (error as Error).message}
        </p>

        <Link to="/home" className="mt-6 inline-block">
          <Boton>Volver al catálogo</Boton>
        </Link>
      </div>
    )
  }

  const titulo = `${data.marca} ${data.linea}`

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        to="/home"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver a resultados
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          {titulo} {data.version && <span className="font-normal text-muted-foreground">{data.version}</span>}
        </h1>

        <span className="inline-flex h-5 w-fit items-center rounded-4xl bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
          {data.modelo}
        </span>

        <span className="inline-flex h-5 w-fit items-center rounded-4xl bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
          {etiqueta(data.tipoVehiculo)}
        </span>

        {/* Un vehículo reservado o vendido sigue siendo visible: hay que decirlo aquí. */}
        {data.estado !== 'Disponible' && <EstadoBadge estado={data.estado} />}
      </div>

      {/* `items-start` es lo que hace funcionar el `sticky` del panel: sin él, el grid estira
          la columna a toda la altura de la fila y el elemento nunca tiene margen para pegarse. */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <GaleriaVehiculo imagenes={data.imagenes} descripcion={titulo} />

          <InformacionVehiculo vehiculo={data} />

          {data.descripcion && (
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="font-display text-xl font-bold text-foreground">Descripción</h2>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {data.descripcion}
              </p>
            </section>
          )}
        </div>

        <PanelContacto vehiculo={data} />
      </div>

      {data.estado === 'Vendido' && (
        <div className="mt-6">
          <Alerta>Este vehículo ya fue vendido y se muestra solo como referencia.</Alerta>
        </div>
      )}
    </div>
  )
}
