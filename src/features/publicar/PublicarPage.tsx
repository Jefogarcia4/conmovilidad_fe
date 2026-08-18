import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { vehiculos } from '@/api/endpoints'
import { irAlCheckout, pagos, type CheckoutPublicacion } from '@/api/pagos'
import type { VehiculoDetalle } from '@/api/types'
import { formatearPrecio } from '@/lib/formato'
import { valoresIniciales } from './esquema'
import { FormularioVehiculo } from './FormularioVehiculo'
import { aPeticionVehiculo } from './mapeo'
import type { FormularioPublicacion } from './esquema'
import type { ImagenPublicacion } from './SeccionFotografias'

interface ResultadoPublicacion {
  vehiculo: VehiculoDetalle
  checkout: CheckoutPublicacion | null
  /** El vehículo se creó pero no se pudo abrir el cobro. Se avisa sin perder la publicación. */
  errorCobro?: Error
}

export function PublicarPage() {
  const navegar = useNavigate()
  const clienteConsultas = useQueryClient()

  const { data: tarifa } = useQuery({
    queryKey: ['pagos', 'tarifa'],
    queryFn: pagos.tarifa,
  })

  const publicar = useMutation<
    ResultadoPublicacion,
    Error,
    { datos: FormularioPublicacion; imagenes: ImagenPublicacion[] }
  >({
    mutationFn: async ({ datos, imagenes }) => {
      const vehiculo = await vehiculos.crear({
        ...aPeticionVehiculo(datos, imagenes),
        publicarInmediatamente: true,
      })

      try {
        return { vehiculo, checkout: await pagos.checkout(vehiculo.id) }
      } catch (error) {
        // El vehículo ya quedó guardado: hacer fallar toda la operación haría creer que se perdió,
        // y reintentar el formulario chocaría contra la placa duplicada. Se sigue adelante y el
        // usuario retoma el pago desde «Mis vehículos», donde el vehículo espera pendiente.
        return { vehiculo, checkout: null, errorCobro: error as Error }
      }
    },
    onSuccess: async ({ vehiculo, checkout, errorCobro }) => {
      await clienteConsultas.invalidateQueries({ queryKey: ['vehiculos'] })

      if (errorCobro) {
        navegar('/my-vehicles', {
          replace: true,
          state: { avisoPago: `Guardamos tu vehículo, pero no pudimos abrir el pago: ${errorCobro.message}` },
        })
        return
      }

      if (checkout?.requierePago && checkout.urlCheckout) {
        irAlCheckout(checkout.urlCheckout)
        return
      }

      navegar(`/vehicle/${vehiculo.id}`, { replace: true })
    },
  })

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Publicar un vehículo</h1>
        <p className="text-muted-foreground">
          Completa la información de tu vehículo. Los campos marcados con{' '}
          <span className="text-cta">*</span> son obligatorios.
        </p>
      </header>

      {/* El costo se anuncia antes de llenar el formulario, no al final: enterarse del cobro
          después de veinte campos y diez fotos es la peor forma de descubrirlo. */}
      {tarifa?.cobroActivo && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <CreditCard className="mt-px size-4 shrink-0 text-cta" aria-hidden />
          <p className="text-muted-foreground">
            Publicar tiene un costo de{' '}
            <span className="font-medium text-foreground">{formatearPrecio(tarifa.precio)}</span>. Al
            terminar te llevaremos a la pasarela de pago; tu vehículo aparecerá en el catálogo en
            cuanto se apruebe.
          </p>
        </div>
      )}

      <FormularioVehiculo
        valoresIniciales={valoresIniciales}
        textoEnviar={tarifa?.cobroActivo ? 'Continuar al pago' : 'Publicar Vehículo'}
        enviando={publicar.isPending}
        error={publicar.error}
        onEnviar={(datos, imagenes) => publicar.mutate({ datos, imagenes })}
        onCancelar={() => navegar('/my-vehicles')}
      />
    </div>
  )
}
