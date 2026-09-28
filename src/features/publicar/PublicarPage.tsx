import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, CreditCard, Loader2, Wrench } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { configuracion } from '@/api/configuracion'
import { vehiculos } from '@/api/endpoints'
import { irAlCheckout, pagos, type CheckoutPublicacion } from '@/api/pagos'
import { suscripciones } from '@/api/suscripciones'
import type { VehiculoDetalle } from '@/api/types'
import { formatearPrecio } from '@/lib/formato'
import { cn } from '@/lib/utils'
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
  /** La suscripción de la empresa no tenía cupo: el vehículo quedó guardado como borrador. */
  sinCupo?: boolean
}

export function PublicarPage() {
  const navegar = useNavigate()
  const clienteConsultas = useQueryClient()

  const { data: modulos, isPending: cargandoModulos } = useQuery({
    queryKey: ['configuracion', 'modulos'],
    queryFn: configuracion.modulos,
  })

  const { data: tarifa } = useQuery({
    queryKey: ['pagos', 'tarifa'],
    queryFn: pagos.tarifa,
  })

  const { data: cupo } = useQuery({
    queryKey: ['suscripciones', 'mi-cupo'],
    queryFn: suscripciones.miCupo,
  })

  // Con suscripción vigente y cupo, publicar no cuesta: el botón no debe prometer un pago.
  const cubiertoPorSuscripcion = cupo?.tieneSuscripcion === true && cupo.disponibles > 0
  const sinCupoDisponible = cupo?.tieneSuscripcion === true && cupo.disponibles === 0

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

      // Con el cupo de la suscripción agotado la API guarda el vehículo como borrador: no hay
      // nada que cobrar, y pedir el checkout solo devolvería el mismo error del cupo. Se decide
      // por lo que respondió la API y no por el cupo consultado antes, que pudo quedarse viejo.
      if (vehiculo.estado === 'Borrador') {
        return { vehiculo, checkout: null, sinCupo: true }
      }

      try {
        return { vehiculo, checkout: await pagos.checkout(vehiculo.id) }
      } catch (error) {
        // El vehículo ya quedó guardado: hacer fallar toda la operación haría creer que se perdió,
        // y reintentar el formulario chocaría contra la placa duplicada. Se sigue adelante y el
        // usuario retoma el pago desde «Mis vehículos», donde el vehículo espera pendiente.
        return { vehiculo, checkout: null, errorCobro: error as Error }
      }
    },
    onSuccess: async ({ vehiculo, checkout, errorCobro, sinCupo }) => {
      await clienteConsultas.invalidateQueries({ queryKey: ['vehiculos'] })
      await clienteConsultas.invalidateQueries({ queryKey: ['suscripciones', 'mi-cupo'] })

      if (sinCupo) {
        navegar('/my-vehicles', {
          replace: true,
          state: {
            avisoPago:
              'Guardamos tu vehículo como borrador: tu empresa ya usó todas las publicaciones que ' +
              'incluye su suscripción este mes. Podrás publicarlo cuando el cupo se renueve.',
          },
        })
        return
      }

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

  // Se espera a saber si el módulo está en servicio antes de pintar nada: mostrar el formulario
  // y cambiarlo por el aviso medio segundo después es peor que un momento de espera.
  if (cargandoModulos) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-label="Cargando" />
      </div>
    )
  }

  // Solo cuando la API lo dice expresamente. Si la consulta falla se deja pasar, igual que la API
  // deja el módulo habilitado cuando la variable no está; y si de verdad estuviera apagado, el
  // alta se rechaza igualmente del lado del servidor.
  if (modulos?.vehiculosHabilitados === false) {
    return <FueraDeServicio />
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Publicar un vehículo</h1>
        <p className="text-muted-foreground">
          Completa la información de tu vehículo. Los campos marcados con{' '}
          <span className="text-cta">*</span> son obligatorios.
        </p>
      </header>

      {/* Lo que va a pasar al terminar se anuncia antes de llenar el formulario, no al final:
          enterarse del cobro —o de que no queda cupo— después de veinte campos y diez fotos es la
          peor forma de descubrirlo. */}
      {cupo?.tieneSuscripcion ? (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <CalendarClock
            className={cn(
              'mt-px size-4 shrink-0',
              sinCupoDisponible ? 'text-destructive' : 'text-cta',
            )}
            aria-hidden
          />
          <p className="text-muted-foreground">
            {sinCupoDisponible ? (
              <>
                Tu empresa ya usó las{' '}
                <span className="font-medium text-foreground">{cupo.maximo} publicaciones</span> que
                incluye su suscripción este mes. Puedes cargar el vehículo y quedará guardado como
                borrador: podrás publicarlo cuando el cupo se renueve, el día primero.
              </>
            ) : (
              <>
                Publicar no tiene costo: tu empresa está suscrita
                {cupo.planNombre ? ` al ${cupo.planNombre}` : ''}. Te quedan{' '}
                <span className="font-medium text-foreground">
                  {cupo.disponibles} de {cupo.maximo} publicaciones
                </span>{' '}
                este mes.
              </>
            )}
          </p>
        </div>
      ) : (
        tarifa?.cobroActivo && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <CreditCard className="mt-px size-4 shrink-0 text-cta" aria-hidden />
            <p className="text-muted-foreground">
              Publicar tiene un costo de{' '}
              <span className="font-medium text-foreground">{formatearPrecio(tarifa.precio)}</span>.
              Al terminar te llevaremos a la pasarela de pago; tu vehículo aparecerá en el catálogo
              en cuanto se apruebe.
            </p>
          </div>
        )
      )}

      <FormularioVehiculo
        valoresIniciales={valoresIniciales}
        textoEnviar={
          sinCupoDisponible
            ? 'Guardar como borrador'
            : cubiertoPorSuscripcion || !tarifa?.cobroActivo
              ? 'Publicar Vehículo'
              : 'Continuar al pago'
        }
        enviando={publicar.isPending}
        error={publicar.error}
        onEnviar={(datos, imagenes) => publicar.mutate({ datos, imagenes })}
        onCancelar={() => navegar('/my-vehicles')}
      />
    </div>
  )
}

/**
 * Aviso cuando `habilita_vehiculos` está en `false`. No promete una fecha de vuelta porque nadie
 * la sabe: el módulo vuelve cuando el administrador cambia la variable.
 */
function FueraDeServicio() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <Wrench className="size-10 text-cta" aria-hidden />

      <h1 className="mt-5 font-display text-2xl font-bold text-foreground">
        Módulo temporalmente fuera de servicio
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        La publicación de vehículos está suspendida por mantenimiento. Los vehículos que ya
        publicaste siguen en el catálogo y puedes seguir consultándolos y editándolos.
      </p>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link
          to="/my-vehicles"
          className="inline-flex h-8 items-center rounded-lg bg-cta px-3 text-sm font-medium text-cta-foreground transition-all hover:bg-cta-hover"
        >
          Mis vehículos
        </Link>

        <Link
          to="/home"
          className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  )
}
