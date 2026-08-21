import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '@/api/cliente'
import { vehiculos } from '@/api/endpoints'
import { pagos } from '@/api/pagos'
import type { EstadoVehiculo, VehiculoDetalle } from '@/api/types'
import { useAuth } from '@/auth/useAuth'
import { Boton } from '@/components/ui/Boton'
import { formatearPrecio } from '@/lib/formato'
import { puedeGestionarVehiculo } from '@/features/vehiculos/permisos'
import type { FormularioPublicacion } from './esquema'
import { FormularioVehiculo } from './FormularioVehiculo'
import { aImagenesFormulario, aPeticionVehiculo, aValoresFormulario } from './mapeo'
import { SeccionEstado } from './SeccionEstado'
import type { ImagenPublicacion } from './SeccionFotografias'

export function EditarVehiculoPage() {
  const { id } = useParams<{ id: string }>()

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
      <Aviso
        titulo={noEncontrado ? 'Este vehículo no está disponible' : 'No pudimos cargar el vehículo'}
        detalle={
          noEncontrado
            ? 'Puede que se haya eliminado o que pertenezca a otro convenio.'
            : (error as Error).message
        }
      />
    )
  }

  // El editor se monta con el vehículo ya cargado: así el formulario recibe sus valores
  // iniciales de una vez y no hace falta reinicializarlo cuando llega la respuesta.
  return <Editor vehiculo={data} />
}

function Editor({ vehiculo }: { vehiculo: VehiculoDetalle }) {
  const navegar = useNavigate()
  const clienteConsultas = useQueryClient()
  const { usuario } = useAuth()

  const [estado, setEstado] = useState<EstadoVehiculo>(vehiculo.estado)

  const { data: tarifa } = useQuery({
    queryKey: ['pagos', 'tarifa'],
    queryFn: pagos.tarifa,
  })

  const puedeEditar = puedeGestionarVehiculo(usuario, vehiculo.publicadoPorUsuarioId)

  // Con la publicación pagada, los datos principales quedan fijos. La excepción es un vehículo
  // antiguo sin ubicación guardada: el formulario la exige, y bloquearla sin valor lo dejaría
  // imposible de guardar. La API aplica la misma regla, esto es solo lo que ve el asesor.
  const datosPrincipalesBloqueados = vehiculo.publicacionPagada && Boolean(vehiculo.ciudad)

  const guardar = useMutation({
    mutationFn: async ({
      datos,
      imagenes,
    }: {
      datos: FormularioPublicacion
      imagenes: ImagenPublicacion[]
    }) => {
      const actualizado = await vehiculos.actualizar(
        vehiculo.id,
        // El formulario no gestiona estos campos: se reenvían tal cual porque la actualización
        // reemplaza el vehículo completo y omitirlos los borraría.
        aPeticionVehiculo(datos, imagenes, {
          precioNegociable: vehiculo.precioNegociable,
          numeroPuertas: vehiculo.numeroPuertas,
          descripcion: vehiculo.descripcion,
        }),
      )

      // El estado viaja por su propio endpoint; solo se toca si el usuario lo cambió.
      if (estado !== vehiculo.estado) {
        await vehiculos.cambiarEstado(vehiculo.id, estado)
      }

      return actualizado
    },
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ['vehiculos'] })
      navegar(`/vehicle/${vehiculo.id}`, { replace: true })
    },
  })

  if (!puedeEditar) {
    return (
      <Aviso
        titulo="No puedes editar este vehículo"
        detalle="Solo quien lo publicó o un administrador del convenio pueden modificarlo."
        volverA={`/vehicle/${vehiculo.id}`}
        textoVolver="Ver el vehículo"
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <Link
        to={`/vehicle/${vehiculo.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver al vehículo
      </Link>

      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Editar vehículo</h1>
        <p className="text-muted-foreground">
          {vehiculo.marca} {vehiculo.linea} · Placa {vehiculo.placa}
        </p>
      </header>

      <FormularioVehiculo
        valoresIniciales={aValoresFormulario(vehiculo)}
        imagenesIniciales={aImagenesFormulario(vehiculo)}
        urlsPersistidas={vehiculo.imagenes.map((i) => i.url)}
        datosPrincipalesBloqueados={datosPrincipalesBloqueados}
        textoEnviar="Guardar cambios"
        enviando={guardar.isPending}
        error={guardar.error}
        onEnviar={(datos, imagenes) => guardar.mutate({ datos, imagenes })}
        onCancelar={() => navegar(`/vehicle/${vehiculo.id}`)}
      >
        <SeccionEstado
          valor={estado}
          onCambio={setEstado}
          avisoPago={
            estado === 'Disponible' &&
            !vehiculo.publicacionPagada &&
            tarifa?.cobroActivo
              ? `Cambiar a «Disponible» pedirá el pago de ${formatearPrecio(tarifa.precio)}.`
              : undefined
          }
        />
      </FormularioVehiculo>
    </div>
  )
}

function Aviso({
  titulo,
  detalle,
  volverA = '/my-vehicles',
  textoVolver = 'Volver a mis vehículos',
}: {
  titulo: string
  detalle: string
  volverA?: string
  textoVolver?: string
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold text-foreground">{titulo}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{detalle}</p>

      <Link to={volverA} className="mt-6 inline-block">
        <Boton>{textoVolver}</Boton>
      </Link>
    </div>
  )
}
