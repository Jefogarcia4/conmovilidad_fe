import { useEffect, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ArrowRight, CheckCircle2, Clock, Loader2, RefreshCw } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { irAlCheckout, pagos } from '@/api/pagos'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { formatearPrecio } from '@/lib/formato'
import { cn } from '@/lib/utils'

/** Cada cuánto se vuelve a preguntar mientras el pago sigue sin resolverse. */
const INTERVALO_SONDEO_MS = 5_000

/**
 * Pantalla a la que Wompi devuelve al usuario tras el checkout. Verifica la transacción contra la
 * API, que a su vez consulta la pasarela.
 *
 * La confirmación autoritativa es el webhook, no esta pantalla: aquí solo se le da una respuesta
 * inmediata a quien está esperando. Por eso, si el usuario cierra la ventana, el pago se acredita
 * igual.
 */
export function PagoResultadoPage() {
  const [parametros] = useSearchParams()
  const clienteConsultas = useQueryClient()
  const navegar = useNavigate()

  // Wompi devuelve el identificador de la transacción en `id`.
  const transaccionId = parametros.get('id')

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: ['pagos', 'verificar', transaccionId],
    queryFn: () => pagos.verificar(transaccionId!),
    enabled: Boolean(transaccionId),

    // Con PSE o Nequi la aprobación tarda: mientras el pago siga en curso se vuelve a preguntar
    // solo, para que el usuario no tenga que refrescar a mano.
    refetchInterval: (consulta) =>
      consulta.state.data?.estado === 'Pendiente' ? INTERVALO_SONDEO_MS : false,
  })

  const reintentar = useMutation({
    mutationFn: (vehiculoId: string) => pagos.checkout(vehiculoId),
    onSuccess: (checkout) => {
      if (checkout.requierePago && checkout.urlCheckout) {
        irAlCheckout(checkout.urlCheckout)
        return
      }

      navegar('/my-vehicles', { replace: true })
    },
  })

  const aprobado = data?.estado === 'Aprobado'

  // Un pago aprobado cambia el estado del vehículo, así que el catálogo y «mis vehículos» dejan
  // de ser válidos. Va en un efecto porque invalidar es una escritura y no puede ocurrir durante
  // el render.
  useEffect(() => {
    if (aprobado) {
      clienteConsultas.invalidateQueries({ queryKey: ['vehiculos'] })
    }
  }, [aprobado, clienteConsultas])

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col justify-center px-4 py-12 md:py-20">
      <div className="rounded-2xl bg-card p-8 text-center ring-1 ring-foreground/10">
        {!transaccionId ? (
          <Resultado
            icono={<AlertCircle className="size-7" aria-hidden />}
            tono="error"
            titulo="No pudimos leer el pago"
            texto="Falta la referencia de la transacción. Revisa el estado de tu publicación en «Mis vehículos»."
            acciones={<EnlaceMisVehiculos />}
          />
        ) : isPending ? (
          <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" aria-hidden />
            <p className="text-sm">Verificando tu pago…</p>
          </div>
        ) : error || !data ? (
          <Resultado
            icono={<AlertCircle className="size-7" aria-hidden />}
            tono="error"
            titulo="No pudimos verificar el pago"
            texto={error ? (error as Error).message : 'No obtuvimos el estado del pago.'}
            acciones={
              <>
                <Boton onClick={() => refetch()} cargando={isFetching}>
                  <RefreshCw className="size-4" aria-hidden />
                  Reintentar
                </Boton>
                <EnlaceMisVehiculos />
              </>
            }
          />
        ) : data.estado === 'Aprobado' ? (
          <Resultado
            icono={<CheckCircle2 className="size-7" aria-hidden />}
            tono="exito"
            titulo="¡Pago confirmado!"
            texto={`Pagaste ${formatearPrecio(data.monto)} por la publicación de ${data.vehiculoDescripcion} (${data.placa}). Ya está visible en el catálogo de tu convenio.`}
            acciones={
              <>
                <Link
                  to={`/vehicle/${data.vehiculoId}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-cta px-3 text-sm font-medium text-cta-foreground transition-all hover:bg-cta-hover"
                >
                  Ver mi vehículo
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <EnlaceMisVehiculos />
              </>
            }
          />
        ) : data.estado === 'Pendiente' ? (
          <Resultado
            icono={<Clock className="size-7" aria-hidden />}
            tono="espera"
            titulo="Estamos confirmando tu pago"
            texto="Si pagaste con PSE o Nequi puede tardar unos minutos. Publicaremos tu vehículo apenas se apruebe, aunque cierres esta página."
            acciones={
              <>
                <Boton onClick={() => refetch()} cargando={isFetching}>
                  <RefreshCw className="size-4" aria-hidden />
                  Verificar de nuevo
                </Boton>
                <EnlaceMisVehiculos />
              </>
            }
          />
        ) : (
          <Resultado
            icono={<AlertCircle className="size-7" aria-hidden />}
            tono="error"
            titulo="El pago no se completó"
            texto={`${textoDeFallo(data.estado)} Tu vehículo quedó guardado y pendiente de pago: puedes intentarlo de nuevo cuando quieras.`}
            acciones={
              <>
                <Boton
                  onClick={() => reintentar.mutate(data.vehiculoId)}
                  cargando={reintentar.isPending}
                >
                  <RefreshCw className="size-4" aria-hidden />
                  Reintentar el pago
                </Boton>
                <EnlaceMisVehiculos />
              </>
            }
          />
        )}

        {reintentar.error && (
          <div className="mt-5 text-left">
            <Alerta>{(reintentar.error as Error).message}</Alerta>
          </div>
        )}
      </div>
    </div>
  )
}

function textoDeFallo(estado: string): string {
  switch (estado) {
    case 'Rechazado':
      return 'El banco rechazó la transacción.'
    case 'Anulado':
      return 'La transacción fue anulada.'
    default:
      return 'La pasarela reportó un error al procesarla.'
  }
}

function EnlaceMisVehiculos() {
  return (
    <Link
      to="/my-vehicles"
      className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      Mis vehículos
    </Link>
  )
}

const tonos = {
  exito: 'bg-cta/10 text-cta',
  espera: 'bg-orange-500/10 text-orange-600',
  error: 'bg-destructive/10 text-destructive',
} as const

function Resultado({
  icono,
  tono,
  titulo,
  texto,
  acciones,
}: {
  icono: ReactNode
  tono: keyof typeof tonos
  titulo: string
  texto: string
  acciones: ReactNode
}) {
  return (
    <div className="flex flex-col items-center">
      <span className={cn('grid size-14 place-items-center rounded-2xl', tonos[tono])}>{icono}</span>

      <h1 className="mt-5 font-display text-2xl font-bold text-foreground">{titulo}</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{texto}</p>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">{acciones}</div>
    </div>
  )
}
