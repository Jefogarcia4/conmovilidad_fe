import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { vehiculos } from '@/api/endpoints'
import type { VehiculoLista } from '@/api/types'
import { Alerta } from '@/components/ui/Alerta'
import { AlternadorVista, type ModoVista } from '@/components/ui/AlternadorVista'
import { DialogoConfirmacion } from '@/components/ui/DialogoConfirmacion'
import { usePreferencia } from '@/lib/usePreferencia'
import { TablaVehiculos } from './TablaVehiculos'
import { TarjetaMiVehiculo } from './TarjetaMiVehiculo'

const MODOS = ['tabla', 'tarjetas'] as const

export function MisVehiculosPage() {
  const clienteConsultas = useQueryClient()
  const [modo, setModo] = usePreferencia<ModoVista>('conmovilidad.vistaMisVehiculos', 'tabla', MODOS)
  const [porEliminar, setPorEliminar] = useState<VehiculoLista | null>(null)

  const { data, isPending, error } = useQuery({
    queryKey: ['vehiculos', 'mios'],
    queryFn: () => vehiculos.mios({ tamanoPagina: 50 }),
  })

  const eliminar = useMutation({
    mutationFn: (id: string) => vehiculos.eliminar(id),
    onSuccess: async () => {
      setPorEliminar(null)
      // El vehículo desaparece del catálogo del convenio además de esta lista.
      await clienteConsultas.invalidateQueries({ queryKey: ['vehiculos'] })
    },
  })

  const total = data?.totalRegistros ?? 0

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Mis vehículos</h1>
            <p className="text-muted-foreground">
              Gestiona tus publicaciones activas en Autos Galería.
            </p>
          </div>

          <Link
            to="/publish"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-cta px-2.5 text-sm font-medium text-cta-foreground transition-all hover:bg-cta-hover"
          >
            <Plus className="size-4" aria-hidden />
            Publicar vehículo
          </Link>
        </div>

        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-sm text-muted-foreground">
            {isPending ? 'Cargando…' : `${total} ${total === 1 ? 'publicación' : 'publicaciones'}`}
          </span>

          <AlternadorVista valor={modo} onCambio={setModo} />
        </div>

        {error && <Alerta>{(error as Error).message}</Alerta>}

        {eliminar.error && <Alerta>{(eliminar.error as Error).message}</Alerta>}

        {isPending ? (
          <Cargando modo={modo} />
        ) : data && data.items.length > 0 ? (
          modo === 'tabla' ? (
            <TablaVehiculos
              vehiculos={data.items}
              onEliminar={setPorEliminar}
              eliminandoId={eliminar.isPending ? (porEliminar?.id ?? undefined) : undefined}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((v) => (
                <TarjetaMiVehiculo
                  key={v.id}
                  vehiculo={v}
                  onEliminar={setPorEliminar}
                  eliminando={eliminar.isPending && porEliminar?.id === v.id}
                />
              ))}
            </div>
          )
        ) : (
          !error && <SinPublicaciones />
        )}
      </div>

      {porEliminar && (
        <DialogoConfirmacion
          titulo="Eliminar publicación"
          mensaje={`Se eliminará «${porEliminar.marca} ${porEliminar.linea}» (placa ${porEliminar.placa}) junto con sus imágenes. Esta acción no se puede deshacer.`}
          cargando={eliminar.isPending}
          onConfirmar={() => eliminar.mutate(porEliminar.id)}
          onCancelar={() => setPorEliminar(null)}
        />
      )}
    </div>
  )
}

/** El esqueleto imita la forma de la vista elegida, para que el cambio no dé un salto visual. */
function Cargando({ modo }: { modo: ModoVista }) {
  if (modo === 'tarjetas') {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
            <div className="aspect-[16/10] w-full animate-pulse bg-muted" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-6 w-32 animate-pulse rounded bg-muted" />
              <div className="h-7 w-full animate-pulse rounded-[0.6rem] bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border p-2 last:border-0">
          <div className="h-12 w-16 shrink-0 animate-pulse rounded-md bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function SinPublicaciones() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <h2 className="font-display text-lg font-semibold text-foreground">
        Todavía no has publicado ningún vehículo
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Publica el primero y aparecerá en el catálogo de tu convenio.
      </p>

      <Link
        to="/publish"
        className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-lg bg-cta px-3 text-sm font-medium text-cta-foreground transition-all hover:bg-cta-hover"
      >
        <Plus className="size-4" aria-hidden />
        Publicar vehículo
      </Link>
    </div>
  )
}
