import { useQuery } from '@tanstack/react-query'
import { Car, Lock } from 'lucide-react'
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form'
import { catalogos } from '@/api/endpoints'
import { CampoFormulario } from '@/components/ui/CampoFormulario'
import { ComboBox } from '@/components/ui/ComboBox'
import { clasesControl } from '@/components/ui/estilosControl'
import { SeccionFormulario } from '@/components/ui/SeccionFormulario'
import { cn } from '@/lib/utils'
import { aniosDisponibles, type FormularioPublicacion } from './esquema'

interface Props {
  control: Control<FormularioPublicacion>
  errors: FieldErrors<FormularioPublicacion>
  watch: UseFormWatch<FormularioPublicacion>
  setValue: UseFormSetValue<FormularioPublicacion>
  /**
   * Deja la sección en solo lectura. Estos campos son la identidad de la publicación: una vez
   * pagada no pueden cambiar, porque el cobro es por *este* vehículo y no por un espacio
   * reutilizable para otro. El resto del formulario sigue editable.
   */
  bloqueada?: boolean
}

export function SeccionDatosPrincipales({
  control,
  errors,
  watch,
  setValue,
  bloqueada = false,
}: Props) {
  const marcaId = watch('marcaId')

  const { data: marcas } = useQuery({
    queryKey: ['catalogos', 'marcas'],
    queryFn: catalogos.marcas,
    staleTime: Infinity,
  })

  // Las líneas alimentan el autocompletar y solo tienen sentido con una marca elegida.
  const { data: lineas } = useQuery({
    queryKey: ['catalogos', 'lineas', marcaId],
    queryFn: () => catalogos.lineas(marcaId),
    enabled: Boolean(marcaId),
    staleTime: Infinity,
  })

  const { data: opciones } = useQuery({
    queryKey: ['catalogos', 'opciones-vehiculo'],
    queryFn: catalogos.opcionesVehiculo,
    staleTime: Infinity,
  })

  const { data: colores } = useQuery({
    queryKey: ['catalogos', 'colores'],
    queryFn: catalogos.colores,
    staleTime: Infinity,
  })

  const { data: ciudades } = useQuery({
    queryKey: ['catalogos', 'ciudades'],
    queryFn: catalogos.ciudades,
    staleTime: Infinity,
  })

  const opcionesCiudad = (ciudades ?? []).map((c) => ({ valor: c, etiqueta: c }))

  return (
    <SeccionFormulario
      titulo="Datos principales"
      descripcion="Información básica de identificación del vehículo."
      Icono={Car}
      aviso={
        bloqueada ? (
          <p className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <Lock className="mt-px size-3.5 shrink-0" aria-hidden />
            <span>
              La publicación de este vehículo ya está pagada, así que sus datos principales no se
              pueden modificar. El resto del formulario sigue disponible.
            </span>
          </p>
        ) : undefined
      }
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
              disabled={bloqueada}
              // La placa se guarda normalizada, así que se muestra en mayúsculas desde el inicio.
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              aria-invalid={Boolean(errors.placa) || undefined}
              className={cn(clasesControl, errors.placa ? 'border-destructive' : 'border-input')}
            />
          )}
        />
      </CampoFormulario>

      <CampoFormulario etiqueta="Marca" htmlFor="marca" requerido error={errors.marcaId?.message}>
        <Controller
          control={control}
          name="marcaId"
          render={({ field }) => (
            <ComboBox
              id="marca"
              valor={field.value ?? ''}
              onCambio={(v) => {
                field.onChange(v)
                // La línea elegida pertenecía a la marca anterior: deja de ser válida.
                setValue('lineaNombre', '')
                setValue('lineaId', undefined)
              }}
              textoVacio="Selecciona la marca"
              deshabilitado={bloqueada}
              invalido={Boolean(errors.marcaId)}
              opciones={(marcas ?? []).map((m) => ({ valor: m.id, etiqueta: m.nombre }))}
            />
          )}
        />
      </CampoFormulario>

      <CampoFormulario
        etiqueta="Modelo"
        htmlFor="linea"
        requerido
        error={errors.lineaNombre?.message}
        ayuda={marcaId ? 'Escribe para buscar o agregar uno nuevo.' : 'Selecciona primero la marca.'}
      >
        <Controller
          control={control}
          name="lineaNombre"
          render={({ field }) => (
            <ComboBox
              id="linea"
              valor={field.value ?? ''}
              // Las líneas se identifican por nombre aquí: el id se resuelve al elegir del catálogo.
              opciones={(lineas ?? []).map((l) => ({ valor: l.nombre, etiqueta: l.nombre }))}
              onCambio={(nombre, esNuevo) => {
                field.onChange(nombre)
                const existente = esNuevo ? undefined : lineas?.find((l) => l.nombre === nombre)
                setValue('lineaId', existente?.id)
              }}
              permitirCrear
              deshabilitado={bloqueada || !marcaId}
              invalido={Boolean(errors.lineaNombre)}
              textoVacio="Ej: Corolla Cross"
            />
          )}
        />
      </CampoFormulario>

      <CampoFormulario etiqueta="Versión" htmlFor="version" error={errors.version?.message}>
        <Controller
          control={control}
          name="version"
          render={({ field }) => (
            <input
              {...field}
              id="version"
              value={field.value ?? ''}
              placeholder="Ej: XLI Híbrido"
              disabled={bloqueada}
              className={cn(clasesControl, 'border-input')}
            />
          )}
        />
      </CampoFormulario>

      <CampoFormulario etiqueta="Año" htmlFor="modelo" requerido error={errors.modelo?.message}>
        <Controller
          control={control}
          name="modelo"
          render={({ field }) => (
            <ComboBox
              id="modelo"
              valor={field.value ? String(field.value) : ''}
              onCambio={(v) => field.onChange(v ? Number(v) : undefined)}
              textoVacio="Selecciona el modelo"
              deshabilitado={bloqueada}
              invalido={Boolean(errors.modelo)}
              opciones={aniosDisponibles.map((a) => ({ valor: String(a), etiqueta: String(a) }))}
            />
          )}
        />
      </CampoFormulario>

      <CampoFormulario
        etiqueta="Tipo de vehículo"
        htmlFor="tipo"
        requerido
        error={errors.tipoVehiculo?.message}
      >
        <Controller
          control={control}
          name="tipoVehiculo"
          render={({ field }) => (
            <ComboBox
              id="tipo"
              valor={field.value ?? ''}
              onCambio={field.onChange}
              textoVacio="Selecciona el tipo"
              deshabilitado={bloqueada}
              invalido={Boolean(errors.tipoVehiculo)}
              opciones={(opciones?.tiposVehiculo ?? []).map((o) => ({
                valor: o.nombre,
                etiqueta: o.etiqueta,
              }))}
            />
          )}
        />
      </CampoFormulario>

      <CampoFormulario
        etiqueta="Color"
        htmlFor="color"
        requerido
        error={errors.color?.message}
        ayuda="Escribe el color; la lista es solo una ayuda."
      >
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <>
              {/* Texto libre: la gama real («Azul Océano», «Gris Meteoro») no cabe en una lista
                  cerrada, pero el datalist ofrece los básicos sin restringir lo que se escriba. */}
              <input
                {...field}
                id="color"
                list="colores-sugeridos"
                value={field.value ?? ''}
                placeholder="Ej: Blanco Perla"
                autoComplete="off"
                disabled={bloqueada}
                aria-invalid={Boolean(errors.color) || undefined}
                className={cn(
                  clasesControl,
                  errors.color ? 'border-destructive' : 'border-input',
                )}
              />

              <datalist id="colores-sugeridos">
                {(colores ?? []).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </>
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
              deshabilitado={bloqueada}
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
              deshabilitado={bloqueada}
              invalido={Boolean(errors.ciudad)}
              opciones={opcionesCiudad}
            />
          )}
        />
      </CampoFormulario>
    </SeccionFormulario>
  )
}
