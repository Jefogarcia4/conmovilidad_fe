import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '@/api/cliente'
import { vehiculos } from '@/api/endpoints'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { esquemaPublicacion, valoresIniciales, type FormularioPublicacion } from './esquema'
import { SeccionDatosPrincipales } from './SeccionDatosPrincipales'
import { SeccionDocumentacion } from './SeccionDocumentacion'
import { SeccionEspecificaciones } from './SeccionEspecificaciones'
import { SeccionFotografias, type ImagenPublicacion } from './SeccionFotografias'

export function PublicarPage() {
  const navegar = useNavigate()
  const clienteConsultas = useQueryClient()

  const [imagenes, setImagenes] = useState<ImagenPublicacion[]>([])
  const [errorImagenes, setErrorImagenes] = useState<string | undefined>()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormularioPublicacion>({
    resolver: zodResolver(esquemaPublicacion),
    defaultValues: valoresIniciales as FormularioPublicacion,
  })

  const publicar = useMutation({
    mutationFn: (datos: FormularioPublicacion) =>
      vehiculos.crear({
        placa: datos.placa,
        marcaId: datos.marcaId,
        // Si lo escrito coincide con el catálogo se manda el id; si no, el nombre y la API lo crea.
        lineaId: datos.lineaId,
        lineaNombre: datos.lineaId ? undefined : datos.lineaNombre,
        version: datos.version || undefined,
        modelo: datos.modelo,
        color: datos.color,
        kilometraje: datos.kilometraje,
        precio: datos.precio,
        tipoVehiculo: datos.tipoVehiculo,
        combustible: datos.combustible,
        cilindraje: datos.cilindraje,
        capacidadPasajeros: datos.capacidadPasajeros,
        ciudad: datos.ciudad,
        ciudadMatricula: datos.ciudadMatricula || undefined,
        vencimientoSoat: datos.soatVencido ? undefined : datos.vencimientoSoat || undefined,
        soatVencido: datos.soatVencido,
        vencimientoTecnomecanica: datos.tecnomecanicaVencida
          ? undefined
          : datos.vencimientoTecnomecanica || undefined,
        tecnomecanicaVencida: datos.tecnomecanicaVencida,
        tienePrenda: datos.tienePrenda,
        esBlindado: datos.esBlindado,
        publicarInmediatamente: true,
        // El orden de la galería es el que dejó el usuario; la primera es la principal.
        imagenes: imagenes.map((img, i) => ({ url: img.url, esPrincipal: i === 0, orden: i })),
      }),
    onSuccess: async (vehiculo) => {
      await clienteConsultas.invalidateQueries({ queryKey: ['vehiculos'] })
      navegar(`/vehicle/${vehiculo.id}`, { replace: true })
    },
  })

  const onSubmit = handleSubmit((datos) => {
    if (imagenes.length === 0) {
      setErrorImagenes('Agrega al menos una imagen del vehículo.')
      return
    }

    setErrorImagenes(undefined)
    return publicar.mutateAsync(datos)
  })

  const errorApi =
    publicar.error instanceof ApiError
      ? publicar.error
      : publicar.error
        ? new ApiError(0, (publicar.error as Error).message)
        : null

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Publicar un vehículo</h1>
        <p className="text-muted-foreground">
          Completa la información de tu vehículo. Los campos marcados con{' '}
          <span className="text-cta">*</span> son obligatorios.
        </p>
      </header>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <SeccionDatosPrincipales
          control={control}
          errors={errors}
          watch={watch}
          setValue={setValue}
        />

        <SeccionEspecificaciones control={control} errors={errors} />

        <SeccionDocumentacion control={control} errors={errors} watch={watch} />

        <SeccionFotografias
          imagenes={imagenes}
          onCambio={(nuevas) => {
            setImagenes(nuevas)
            if (nuevas.length > 0) setErrorImagenes(undefined)
          }}
          error={errorImagenes}
        />

        {errorApi && (
          <Alerta>
            {errorApi.message}
            {errorApi.errores && (
              <ul className="mt-1 list-inside list-disc">
                {Object.entries(errorApi.errores).flatMap(([campo, mensajes]) =>
                  mensajes.map((m) => <li key={`${campo}-${m}`}>{m}</li>),
                )}
              </ul>
            )}
          </Alerta>
        )}

        <div className="flex justify-end gap-2">
          <Boton
            variante="secundario"
            type="button"
            disabled={isSubmitting || publicar.isPending}
            onClick={() => navegar('/my-vehicles')}
          >
            Cancelar
          </Boton>

          <Boton type="submit" cargando={isSubmitting || publicar.isPending}>
            Publicar Vehículo
          </Boton>
        </div>
      </form>
    </div>
  )
}
