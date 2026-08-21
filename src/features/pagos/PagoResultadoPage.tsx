import { useEffect, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ArrowRight, CheckCircle2, Clock, Loader2, RefreshCw } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '@/api/cliente'
import { irAlCheckout, pagos, type PagoPublicacion } from '@/api/pagos'
import { adminSuscripciones, type PagoSuscripcion } from '@/api/suscripciones'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { formatearPrecio } from '@/lib/formato'
import { cn } from '@/lib/utils'

/** Cada cuánto se vuelve a preguntar mientras el pago sigue sin resolverse. */
const INTERVALO_SONDEO_MS = 5_000

/**
 * Por esta pantalla vuelven los dos cobros de la plataforma: la publicación de un vehículo y la
 * suscripción de una empresa. La pasarela usa una única URL de retorno y el identificador de la
 * transacción no dice cuál de los dos es, así que se prueba primero el que hace todo el mundo.
 */
type ResultadoPago =
  | { tipo: 'vehiculo'; pago: PagoPublicacion }
  | { tipo: 'suscripcion'; pago: PagoSuscripcion }

async function verificar(transaccionId: string): Promise<ResultadoPago> {
  try {
    return { tipo: 'vehiculo', pago: await pagos.verificar(transaccionId) }
  } catch (e) {
    if (!(e instanceof ApiError) || e.status !== 404) throw e

    try {
      return { tipo: 'suscripcion', pago: await adminSuscripciones.verificar(transaccionId) }
    } catch {
      // Tampoco es de una suscripción, o quien mira no es administrador. Vale más el error
      // original: habla del pago que esta persona estaba esperando.
      throw e
    }
  }
}

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
    queryFn: () => verificar(transaccionId!),
    enabled: Boolean(transaccionId),

    // Con PSE o Nequi la aprobación tarda: mientras el pago siga en curso se vuelve a preguntar
    // solo, para que el usuario no tenga que refrescar a mano.
    refetchInterval: (consulta) =>
      consulta.state.data?.pago.estado === 'Pendiente' ? INTERVALO_SONDEO_MS : false,
  })

  // Los dos checkout devuelven cosas distintas, pero de aquí solo se usa a dónde hay que ir.
  const reintentar = useMutation<
    { requierePago: boolean; urlCheckout?: string },
    Error,
    ResultadoPago
  >({
    mutationFn: (resultado) =>
      resultado.tipo === 'vehiculo'
        ? pagos.checkout(resultado.pago.vehiculoId)
        : adminSuscripciones.checkout(resultado.pago.suscripcionEmpresaId),
    onSuccess: (checkout) => {
      if (checkout.requierePago && checkout.urlCheckout) {
        irAlCheckout(checkout.urlCheckout)
        return
      }

      navegar('/my-vehicles', { replace: true })
    },
  })

  const aprobado = data?.pago.estado === 'Aprobado'

  // Un pago aprobado cambia el estado del vehículo o abre el cupo de la empresa, así que el
  // catálogo, «mis vehículos» y el cupo dejan de ser válidos. Va en un efecto porque invalidar es
  // una escritura y no puede ocurrir durante el render.
  useEffect(() => {
    if (aprobado) {
      clienteConsultas.invalidateQueries({ queryKey: ['vehiculos'] })
      clienteConsultas.invalidateQueries({ queryKey: ['suscripciones', 'mi-cupo'] })
      clienteConsultas.invalidateQueries({ queryKey: ['admin', 'suscripciones'] })
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
        ) : data.pago.estado === 'Aprobado' ? (
          <Resultado
            icono={<CheckCircle2 className="size-7" aria-hidden />}
            tono="exito"
            titulo="¡Pago confirmado!"
            texto={
              data.tipo === 'suscripcion'
                ? `Pagaste ${formatearPrecio(data.pago.monto)} por el ${data.pago.planNombre} de ${data.pago.empresaNombre}. Su cupo de publicaciones ya está activo.`
                : `Pagaste ${formatearPrecio(data.pago.monto)} por la publicación de ${data.pago.vehiculoDescripcion} (${data.pago.placa}). Ya está visible en el catálogo de tu convenio.`
            }
            acciones={
              data.tipo === 'suscripcion' ? (
                <EnlaceSuscripciones />
              ) : (
                <>
                  <Link
                    to={`/vehicle/${data.pago.vehiculoId}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-cta px-3 text-sm font-medium text-cta-foreground transition-all hover:bg-cta-hover"
                  >
                    Ver mi vehículo
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <EnlaceMisVehiculos />
                </>
              )
            }
          />
        ) : data.pago.estado === 'Pendiente' ? (
          <Resultado
            icono={<Clock className="size-7" aria-hidden />}
            tono="espera"
            titulo="Estamos confirmando tu pago"
            texto={
              data.tipo === 'suscripcion'
                ? 'Si pagaste con PSE o Nequi puede tardar unos minutos. Activaremos la suscripción apenas se apruebe, aunque cierres esta página.'
                : 'Si pagaste con PSE o Nequi puede tardar unos minutos. Publicaremos tu vehículo apenas se apruebe, aunque cierres esta página.'
            }
            acciones={
              <>
                <Boton onClick={() => refetch()} cargando={isFetching}>
                  <RefreshCw className="size-4" aria-hidden />
                  Verificar de nuevo
                </Boton>
                {data.tipo === 'suscripcion' ? <EnlaceSuscripciones /> : <EnlaceMisVehiculos />}
              </>
            }
          />
        ) : (
          <Resultado
            icono={<AlertCircle className="size-7" aria-hidden />}
            tono="error"
            titulo="El pago no se completó"
            texto={`${textoDeFallo(data.pago.estado)} ${
              data.tipo === 'suscripcion'
                ? 'La suscripción quedó registrada y sin activar: puedes intentarlo de nuevo cuando quieras.'
                : 'Tu vehículo quedó guardado y pendiente de pago: puedes intentarlo de nuevo cuando quieras.'
            }`}
            acciones={
              <>
                <Boton onClick={() => reintentar.mutate(data)} cargando={reintentar.isPending}>
                  <RefreshCw className="size-4" aria-hidden />
                  Reintentar el pago
                </Boton>
                {data.tipo === 'suscripcion' ? <EnlaceSuscripciones /> : <EnlaceMisVehiculos />}
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

function EnlaceSuscripciones() {
  return (
    <Link
      to="/admin/suscripciones"
      className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      Ver suscripciones
    </Link>
  )
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
