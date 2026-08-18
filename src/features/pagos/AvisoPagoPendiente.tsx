import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Clock } from 'lucide-react'
import { irAlCheckout, pagos } from '@/api/pagos'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { formatearPrecio } from '@/lib/formato'

/**
 * Aviso accionable para el vehículo que está esperando el pago de su publicación. Solo tiene
 * sentido mostrárselo a quien puede gestionarlo: para el resto del convenio ese vehículo ni
 * siquiera existe en el catálogo.
 */
export function AvisoPagoPendiente({ vehiculoId }: { vehiculoId: string }) {
  const clienteConsultas = useQueryClient()

  const { data: tarifa } = useQuery({
    queryKey: ['pagos', 'tarifa'],
    queryFn: pagos.tarifa,
  })

  const pagar = useMutation({
    mutationFn: () => pagos.checkout(vehiculoId),
    onSuccess: async (checkout) => {
      if (checkout.requierePago && checkout.urlCheckout) {
        irAlCheckout(checkout.urlCheckout)
        return
      }

      // No hubo nada que cobrar: la API ya lo dejó publicado.
      await clienteConsultas.invalidateQueries({ queryKey: ['vehiculos'] })
    },
  })

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-3 rounded-2xl border border-orange-500/25 bg-orange-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <Clock className="mt-0.5 size-4 shrink-0 text-orange-600" aria-hidden />

          <div>
            <p className="text-sm font-medium text-foreground">
              Esta publicación está pendiente de pago
            </p>
            <p className="text-sm text-muted-foreground">
              No aparece en el catálogo de tu convenio hasta que se apruebe el pago
              {tarifa?.cobroActivo ? ` de ${formatearPrecio(tarifa.precio)}` : ''}.
            </p>
          </div>
        </div>

        <Boton onClick={() => pagar.mutate()} cargando={pagar.isPending} className="sm:shrink-0">
          <CreditCard className="size-4" aria-hidden />
          Pagar publicación
        </Boton>
      </div>

      {pagar.error && <Alerta>{(pagar.error as Error).message}</Alerta>}
    </div>
  )
}
