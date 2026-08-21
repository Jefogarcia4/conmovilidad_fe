import { useQuery } from '@tanstack/react-query'
import { Info } from 'lucide-react'
import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { catalogos } from '@/api/endpoints'
import { CampoFormulario } from '@/components/ui/CampoFormulario'
import { CampoNumerico } from '@/components/ui/CampoNumerico'
import { ComboBox } from '@/components/ui/ComboBox'
import { SeccionFormulario } from '@/components/ui/SeccionFormulario'
import type { FormularioPublicacion } from './esquema'

interface Props {
  control: Control<FormularioPublicacion>
  errors: FieldErrors<FormularioPublicacion>
}

/** `Automatica` y `Manual` son los nombres del enum; el usuario lee «Automática» y «Mecánica». */
const TRANSMISIONES_QUE_SE_CAPTURAN = ['Automatica', 'Manual']

export function SeccionEspecificaciones({ control, errors }: Props) {
  const { data: opciones } = useQuery({
    queryKey: ['catalogos', 'opciones-vehiculo'],
    queryFn: catalogos.opcionesVehiculo,
    staleTime: Infinity,
  })

  // El catálogo publica también `Secuencial` y `CVT` —hay vehículos antiguos con esos valores y sus
  // etiquetas se siguen resolviendo—, pero al publicar el negocio solo distingue estas dos.
  const opcionesTransmision = TRANSMISIONES_QUE_SE_CAPTURAN.flatMap((nombre) => {
    const opcion = opciones?.transmisiones.find((t) => t.nombre === nombre)
    return opcion ? [{ valor: opcion.nombre, etiqueta: opcion.etiqueta }] : []
  })

  return (
    <SeccionFormulario
      titulo="Especificaciones técnicas"
      descripcion="Detalles mecánicos y condiciones de venta."
      Icono={Info}
    >
      <CampoFormulario
        etiqueta="Kilometraje"
        htmlFor="kilometraje"
        requerido
        error={errors.kilometraje?.message}
      >
        <Controller
          control={control}
          name="kilometraje"
          render={({ field }) => (
            <CampoNumerico
              id="kilometraje"
              valor={field.value}
              onCambio={field.onChange}
              placeholder="145.000"
              maximo={3_000_000}
              invalido={Boolean(errors.kilometraje)}
            />
          )}
        />
      </CampoFormulario>

      <CampoFormulario
        etiqueta="Cilindraje"
        htmlFor="cilindraje"
        error={errors.cilindraje?.message}
        ayuda="En centímetros cúbicos."
      >
        <Controller
          control={control}
          name="cilindraje"
          render={({ field }) => (
            <CampoNumerico
              id="cilindraje"
              valor={field.value}
              onCambio={field.onChange}
              placeholder="Ej: 2.000"
              maximo={20_000}
              invalido={Boolean(errors.cilindraje)}
            />
          )}
        />
      </CampoFormulario>

      <CampoFormulario
        etiqueta="Combustible"
        htmlFor="combustible"
        requerido
        error={errors.combustible?.message}
      >
        <Controller
          control={control}
          name="combustible"
          render={({ field }) => (
            <ComboBox
              id="combustible"
              valor={field.value ?? ''}
              onCambio={field.onChange}
              textoVacio="Selecciona el combustible"
              invalido={Boolean(errors.combustible)}
              opciones={(opciones?.combustibles ?? []).map((o) => ({
                valor: o.nombre,
                etiqueta: o.etiqueta,
              }))}
            />
          )}
        />
      </CampoFormulario>

      <CampoFormulario
        etiqueta="Transmisión"
        htmlFor="transmision"
        error={errors.transmision?.message}
      >
        <Controller
          control={control}
          name="transmision"
          render={({ field }) => (
            <ComboBox
              id="transmision"
              valor={field.value ?? ''}
              onCambio={field.onChange}
              textoVacio="Selecciona la transmisión"
              invalido={Boolean(errors.transmision)}
              opciones={opcionesTransmision}
            />
          )}
        />
      </CampoFormulario>

      <CampoFormulario etiqueta="Tracción" htmlFor="traccion" error={errors.traccion?.message}>
        <Controller
          control={control}
          name="traccion"
          render={({ field }) => (
            <ComboBox
              id="traccion"
              valor={field.value ?? ''}
              onCambio={field.onChange}
              textoVacio="Selecciona la tracción"
              invalido={Boolean(errors.traccion)}
              opciones={(opciones?.tracciones ?? []).map((o) => ({
                valor: o.nombre,
                etiqueta: o.etiqueta,
              }))}
            />
          )}
        />
      </CampoFormulario>

      <CampoFormulario
        etiqueta="Capacidad (pasajeros)"
        htmlFor="capacidad"
        error={errors.capacidadPasajeros?.message}
      >
        <Controller
          control={control}
          name="capacidadPasajeros"
          render={({ field }) => (
            <CampoNumerico
              id="capacidad"
              valor={field.value}
              onCambio={field.onChange}
              placeholder="5"
              maximo={80}
              invalido={Boolean(errors.capacidadPasajeros)}
            />
          )}
        />
      </CampoFormulario>

      <CampoFormulario etiqueta="Precio" htmlFor="precio" requerido error={errors.precio?.message}>
        <Controller
          control={control}
          name="precio"
          render={({ field }) => (
            <CampoNumerico
              id="precio"
              valor={field.value}
              onCambio={field.onChange}
              placeholder="0"
              prefijo="$"
              invalido={Boolean(errors.precio)}
            />
          )}
        />
      </CampoFormulario>
    </SeccionFormulario>
  )
}
