import { useQuery } from '@tanstack/react-query'
import { Info } from 'lucide-react'
import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { catalogos } from '@/api/endpoints'
import { CampoFormulario } from '@/components/ui/CampoFormulario'
import { clasesControl } from '@/components/ui/estilosControl'
import { CampoNumerico } from '@/components/ui/CampoNumerico'
import { ComboBox } from '@/components/ui/ComboBox'
import { SeccionFormulario } from '@/components/ui/SeccionFormulario'
import { cn } from '@/lib/utils'
import type { FormularioPublicacion } from './esquema'

interface Props {
  control: Control<FormularioPublicacion>
  errors: FieldErrors<FormularioPublicacion>
}

export function SeccionEspecificaciones({ control, errors }: Props) {
  const { data: ciudades } = useQuery({
    queryKey: ['catalogos', 'ciudades'],
    queryFn: catalogos.ciudades,
    staleTime: Infinity,
  })

  const { data: opciones } = useQuery({
    queryKey: ['catalogos', 'opciones-vehiculo'],
    queryFn: catalogos.opcionesVehiculo,
    staleTime: Infinity,
  })

  const opcionesCiudad = (ciudades ?? []).map((c) => ({ valor: c, etiqueta: c }))

  return (
    <SeccionFormulario
      titulo="Especificaciones técnicas"
      descripcion="Detalles mecánicos y de matrícula."
      Icono={Info}
    >
      <CampoFormulario etiqueta="Placa" htmlFor="placa" requerido error={errors.placa?.message}>
        <Controller
          control={control}
          name="placa"
          render={({ field }) => (
            <input
              {...field}
              id="placa"
              value={field.value ?? ''}
              placeholder="ABC-123"
              // La placa se guarda normalizada, así que se muestra en mayúsculas desde el inicio.
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              aria-invalid={Boolean(errors.placa) || undefined}
              className={cn(
                clasesControl,
                errors.placa ? 'border-destructive' : 'border-input',
              )}
            />
          )}
        />
      </CampoFormulario>

      <CampoFormulario
        etiqueta="Ciudad de matrícula"
        htmlFor="ciudad-matricula"
        error={errors.ciudadMatricula?.message}
      >
        <Controller
          control={control}
          name="ciudadMatricula"
          render={({ field }) => (
            <ComboBox
              id="ciudad-matricula"
              valor={field.value ?? ''}
              onCambio={field.onChange}
              textoVacio="Selecciona la ciudad"
              opciones={opcionesCiudad}
            />
          )}
        />
      </CampoFormulario>

      <CampoFormulario
        etiqueta="Ubicación"
        htmlFor="ciudad"
        requerido
        error={errors.ciudad?.message}
        ayuda="Dónde está el vehículo para verlo."
      >
        <Controller
          control={control}
          name="ciudad"
          render={({ field }) => (
            <ComboBox
              id="ciudad"
              valor={field.value ?? ''}
              onCambio={field.onChange}
              textoVacio="Selecciona la ciudad"
              invalido={Boolean(errors.ciudad)}
              opciones={opcionesCiudad}
            />
          )}
        />
      </CampoFormulario>

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
