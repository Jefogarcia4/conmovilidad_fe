import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError } from '@/api/cliente'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { esquemaPublicacion, type FormularioPublicacion } from './esquema'
import { SeccionDatosPrincipales } from './SeccionDatosPrincipales'
import { SeccionDocumentacion } from './SeccionDocumentacion'
import { SeccionEspecificaciones } from './SeccionEspecificaciones'
import { SeccionFotografias, type ImagenPublicacion } from './SeccionFotografias'

interface Props {
  /**
   * Estado inicial del formulario. Se lee una sola vez al montar, así que la pantalla de edición
   * debe montar este componente cuando ya tiene el vehículo cargado.
   */
  valoresIniciales: Partial<FormularioPublicacion>
  imagenesIniciales?: ImagenPublicacion[]
  /**
   * URLs que ya están guardadas en el vehículo: quitarlas de la galería no borra el archivo
   * del almacén hasta que el usuario confirme, para que cancelar no rompa la publicación viva.
   */
  urlsPersistidas?: string[]
  textoEnviar: string
  enviando: boolean
  error: unknown
  /** Contenido opcional que se inserta antes de los botones (el estado, al editar). */
  children?: ReactNode
  onEnviar: (datos: FormularioPublicacion, imagenes: ImagenPublicacion[]) => void
  onCancelar: () => void
}

export function FormularioVehiculo({
  valoresIniciales,
  imagenesIniciales = [],
  urlsPersistidas,
  textoEnviar,
  enviando,
  error,
  children,
  onEnviar,
  onCancelar,
}: Props) {
  const [imagenes, setImagenes] = useState<ImagenPublicacion[]>(imagenesIniciales)
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

  const onSubmit = handleSubmit((datos) => {
    if (imagenes.length === 0) {
      setErrorImagenes('Agrega al menos una imagen del vehículo.')
      return
    }

    setErrorImagenes(undefined)
    onEnviar(datos, imagenes)
  })

  const errorApi =
    error instanceof ApiError ? error : error ? new ApiError(0, (error as Error).message) : null

  const ocupado = isSubmitting || enviando

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <SeccionDatosPrincipales control={control} errors={errors} watch={watch} setValue={setValue} />

      <SeccionEspecificaciones control={control} errors={errors} />

      <SeccionDocumentacion control={control} errors={errors} watch={watch} />

      <SeccionFotografias
        imagenes={imagenes}
        urlsPersistidas={urlsPersistidas}
        onCambio={(nuevas) => {
          setImagenes(nuevas)
          if (nuevas.length > 0) setErrorImagenes(undefined)
        }}
        error={errorImagenes}
      />

      {children}

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
        <Boton variante="secundario" type="button" disabled={ocupado} onClick={onCancelar}>
          Cancelar
        </Boton>

        <Boton type="submit" cargando={ocupado}>
          {textoEnviar}
        </Boton>
      </div>
    </form>
  )
}
