import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Eye,
  EyeOff,
  ImageUp,
  Info,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { adminBanners, type BannerAdmin } from '@/api/banners'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { CampoFormulario } from '@/components/ui/CampoFormulario'
import { Casilla } from '@/components/ui/Casilla'
import { DialogoConfirmacion } from '@/components/ui/DialogoConfirmacion'
import { clasesControl } from '@/components/ui/estilosControl'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import {
  BotonFila,
  Celda,
  EncabezadoTabla,
  EstadoVacio,
  EtiquetaEstado,
  FilaTabla,
  TablaAdmin,
} from './componentes'

const CLAVE = ['admin', 'banners']

/** Mismos topes que la API; aquí solo para avisar antes de enviar. */
const LARGO_MAXIMO_TEXTO = 500
const LARGO_MAXIMO_ENLACE = 500

/**
 * Espejo de `Banner.EnlaceEsValido` en el dominio. La regla manda allá —esto es un XSS si se
 * cuela un `javascript:`—; aquí está repetida solo para no hacer un viaje al servidor para
 * decirle al administrador algo que se puede ver mientras escribe.
 */
const ENLACE_ADMITIDO = /^(https?:\/\/|\/(?!\/))/

const esquema = z.object({
  textoAlternativo: z
    .string()
    .trim()
    .min(1, 'Escribe el texto alternativo de la imagen.')
    .max(LARGO_MAXIMO_TEXTO, `No puede pasar de ${LARGO_MAXIMO_TEXTO} caracteres.`),
  enlace: z
    .string()
    .trim()
    .max(LARGO_MAXIMO_ENLACE, `No puede pasar de ${LARGO_MAXIMO_ENLACE} caracteres.`)
    .refine(
      (v) => v === '' || ENLACE_ADMITIDO.test(v),
      'Debe empezar por https:// si es un sitio externo, o por / si es una pantalla de la aplicación.',
    ),
  activo: z.boolean(),
})

type Formulario = z.infer<typeof esquema>

export function BannersPage() {
  const clienteConsultas = useQueryClient()
  const [subiendo, setSubiendo] = useState(false)
  const [editando, setEditando] = useState<BannerAdmin | null>(null)
  const [porEliminar, setPorEliminar] = useState<BannerAdmin | null>(null)

  const { data, isPending, error } = useQuery({ queryKey: CLAVE, queryFn: adminBanners.listar })

  const invalidar = () => clienteConsultas.invalidateQueries({ queryKey: CLAVE })

  const eliminar = useMutation({
    mutationFn: (id: string) => adminBanners.eliminar(id),
    onSuccess: async () => {
      setPorEliminar(null)
      await invalidar()
    },
  })

  const reordenar = useMutation({
    mutationFn: (ids: string[]) => adminBanners.reordenar(ids),
    onSuccess: invalidar,
  })

  const alternarEstado = useMutation({
    mutationFn: (banner: BannerAdmin) =>
      adminBanners.actualizar(banner.id, {
        textoAlternativo: banner.textoAlternativo,
        enlace: banner.enlace,
        activo: !banner.activo,
      }),
    onSuccess: invalidar,
  })

  const lista = data ?? []

  /** Mueve un banner una posición y envía el orden completo resultante. */
  const mover = (desde: number, hacia: number) => {
    const ids = lista.map((b) => b.id)
    const [movido] = ids.splice(desde, 1)

    // `splice` entrega el elemento como opcional. Con los índices que salen de la propia tabla
    // siempre existe, pero el tipo no puede saberlo.
    if (movido === undefined) return

    ids.splice(hacia, 0, movido)
    reordenar.mutate(ids)
  }

  if (isPending) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-label="Cargando" />
      </div>
    )
  }

  const ocupado = reordenar.isPending || alternarEstado.isPending

  return (
    <div className="space-y-6">
      {error && <Alerta>{(error as Error).message}</Alerta>}
      {eliminar.error && <Alerta>{(eliminar.error as Error).message}</Alerta>}
      {reordenar.error && <Alerta>{(reordenar.error as Error).message}</Alerta>}
      {alternarEstado.error && <Alerta>{(alternarEstado.error as Error).message}</Alerta>}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Banners del inicio
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Las diapositivas del carrusel de la pantalla principal, en el orden en que pasan. Se
            muestran solo las activas.
          </p>
        </div>

        <Boton onClick={() => setSubiendo(true)}>
          <Plus className="size-4" aria-hidden />
          Subir banner
        </Boton>
      </div>

      {lista.length === 0 ? (
        <>
          {/* No usa `Alerta`: eso es el estilo de un error y aquí no ha fallado nada. */}
          <div className="flex items-start gap-2.5 rounded-xl bg-secondary px-4 py-3 text-sm text-secondary-foreground ring-1 ring-foreground/10">
            <Info className="mt-px size-4 shrink-0 text-cta" aria-hidden />
            <span>
              Todavía no has subido ningún banner, así que el inicio está mostrando los cinco que
              vienen con la aplicación. <strong className="font-semibold">En cuanto subas el
              primero, esos cinco dejan de aparecer</strong>: si quieres conservar alguno, súbelo
              aquí.
            </span>
          </div>

          <EstadoVacio mensaje="Sube la primera imagen para empezar a administrar el carrusel." />
        </>
      ) : (
        <TablaAdmin>
          <EncabezadoTabla
            columnas={[
              'Imagen',
              'Texto alternativo',
              'Enlace',
              'Estado',
              { texto: 'Orden', derecha: true },
              { texto: 'Acciones', derecha: true },
            ]}
          />

          <tbody>
            {lista.map((banner, i) => (
              <FilaTabla key={banner.id} atenuada={!banner.activo}>
                <Celda>
                  {/* Proporción fija y `object-cover`: aquí solo hay que reconocer cuál es, y
                      las imágenes no comparten proporción. */}
                  <img
                    src={banner.imagenUrl}
                    alt=""
                    className="h-10 w-28 rounded-md bg-secondary object-cover ring-1 ring-foreground/10"
                    loading="lazy"
                  />
                </Celda>

                <Celda>
                  <span className="line-clamp-2 max-w-sm text-sm text-foreground">
                    {banner.textoAlternativo}
                  </span>
                </Celda>

                <Celda apagada>
                  {banner.enlace ? (
                    <a
                      href={banner.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-48 items-center gap-1 truncate text-cta hover:underline"
                    >
                      <span className="truncate">{banner.enlace}</span>
                      <ExternalLink className="size-3 shrink-0" aria-hidden />
                    </a>
                  ) : (
                    'Sin enlace'
                  )}
                </Celda>

                <Celda>
                  <EtiquetaEstado activo={banner.activo} />
                </Celda>

                <Celda derecha>
                  <div className="flex items-center justify-end gap-1">
                    <BotonFila
                      etiqueta={`Subir «${banner.textoAlternativo.slice(0, 40)}» una posición`}
                      disabled={i === 0 || ocupado}
                      onClick={() => mover(i, i - 1)}
                    >
                      <ArrowUp className="size-4" aria-hidden />
                    </BotonFila>

                    <BotonFila
                      etiqueta={`Bajar «${banner.textoAlternativo.slice(0, 40)}» una posición`}
                      disabled={i === lista.length - 1 || ocupado}
                      onClick={() => mover(i, i + 1)}
                    >
                      <ArrowDown className="size-4" aria-hidden />
                    </BotonFila>
                  </div>
                </Celda>

                <Celda derecha>
                  <div className="flex items-center justify-end gap-1">
                    <BotonFila
                      etiqueta={
                        banner.activo
                          ? 'Inactivar: deja de mostrarse en el inicio'
                          : 'Activar: vuelve al carrusel'
                      }
                      disabled={ocupado}
                      onClick={() => alternarEstado.mutate(banner)}
                    >
                      {/* El icono muestra la acción, no el estado: de eso ya se encarga la
                          columna «Estado» y repetirlo aquí deja al botón diciendo lo contrario
                          de lo que hace. */}
                      {banner.activo ? (
                        <EyeOff className="size-4" aria-hidden />
                      ) : (
                        <Eye className="size-4" aria-hidden />
                      )}
                    </BotonFila>

                    <BotonFila
                      etiqueta="Editar texto, enlace y estado"
                      disabled={ocupado}
                      onClick={() => setEditando(banner)}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </BotonFila>

                    <BotonFila
                      etiqueta="Quitar del carrusel"
                      destructivo
                      disabled={ocupado || eliminar.isPending}
                      onClick={() => setPorEliminar(banner)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </BotonFila>
                  </div>
                </Celda>
              </FilaTabla>
            ))}
          </tbody>
        </TablaAdmin>
      )}

      {subiendo && <FormularioBanner onCerrar={() => setSubiendo(false)} />}

      {editando && (
        <FormularioBanner banner={editando} onCerrar={() => setEditando(null)} />
      )}

      {porEliminar && (
        <DialogoConfirmacion
          titulo="Quitar el banner del carrusel"
          mensaje={
            porEliminar.esImagenEmpaquetada
              ? 'El banner desaparece del inicio. Esta imagen viene con la aplicación, así que el archivo no se borra.'
              : 'El banner desaparece del inicio y su imagen se borra del almacenamiento. Si solo quieres dejar de mostrarlo por un tiempo, usa «Inactivar».'
          }
          cargando={eliminar.isPending}
          onConfirmar={() => eliminar.mutate(porEliminar.id)}
          onCancelar={() => setPorEliminar(null)}
        />
      )}
    </div>
  )
}

/**
 * Alta y edición. La imagen solo se pide al crear: para cambiarla en uno que ya existe está el
 * botón propio del formulario, que conserva posición, texto y enlace.
 */
function FormularioBanner({
  banner,
  onCerrar,
}: {
  banner?: BannerAdmin
  onCerrar: () => void
}) {
  const clienteConsultas = useQueryClient()
  const esEdicion = banner !== undefined
  const [archivo, setArchivo] = useState<File | null>(null)
  const entradaArchivo = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      textoAlternativo: banner?.textoAlternativo ?? '',
      enlace: banner?.enlace ?? '',
      activo: banner?.activo ?? true,
    },
  })

  const guardar = useMutation({
    mutationFn: async (datos: Formulario) => {
      const metadatos = {
        textoAlternativo: datos.textoAlternativo,
        enlace: datos.enlace || null,
        activo: datos.activo,
      }

      if (!esEdicion) {
        if (!archivo) throw new Error('Elige la imagen del banner.')
        return adminBanners.crear(archivo, metadatos)
      }

      // En edición el archivo es opcional: si lo eligió, se reemplaza además de guardar.
      if (archivo) {
        await adminBanners.reemplazarImagen(banner.id, archivo)
      }

      return adminBanners.actualizar(banner.id, metadatos)
    },
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: CLAVE })
      onCerrar()
    },
  })

  const activo = watch('activo')

  return (
    <Modal
      titulo={esEdicion ? 'Editar banner' : 'Subir banner'}
      descripcion="Se muestra a lo ancho de la pantalla principal. Lo ideal es una imagen horizontal de unos 2400 px de ancho; se convierte a WebP al subirla."
      onCerrar={onCerrar}
      bloqueado={guardar.isPending}
      pie={
        <>
          <Boton variante="secundario" type="button" onClick={onCerrar} disabled={guardar.isPending}>
            Cancelar
          </Boton>
          <Boton
            type="submit"
            form="form-banner"
            cargando={guardar.isPending}
            disabled={!esEdicion && !archivo}
          >
            {esEdicion ? 'Guardar' : 'Subir banner'}
          </Boton>
        </>
      }
    >
      <form
        id="form-banner"
        onSubmit={handleSubmit((datos) => guardar.mutateAsync(datos))}
        noValidate
        className="space-y-4"
      >
        {guardar.error && <Alerta>{(guardar.error as Error).message}</Alerta>}

        <CampoFormulario
          etiqueta={esEdicion ? 'Reemplazar la imagen' : 'Imagen'}
          htmlFor="archivo"
          requerido={!esEdicion}
        >
          <input
            ref={entradaArchivo}
            id="archivo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            className={cn(clasesControl, 'border-input file:mr-3 file:text-sm')}
          />
        </CampoFormulario>

        <VistaPrevia archivo={archivo} urlActual={banner?.imagenUrl} />

        <CampoFormulario
          etiqueta="Texto alternativo"
          htmlFor="textoAlternativo"
          requerido
          error={errors.textoAlternativo?.message}
          ayuda="Transcribe el mensaje que trae impresa la imagen: es lo que se lee en voz alta a quien no puede verla."
        >
          <textarea
            id="textoAlternativo"
            rows={3}
            {...register('textoAlternativo')}
            className={cn(
              clasesControl,
              'h-auto resize-y',
              errors.textoAlternativo ? 'border-destructive' : 'border-input',
            )}
          />
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Enlace (opcional)"
          htmlFor="enlace"
          error={errors.enlace?.message}
          ayuda="A dónde lleva al pulsarlo. Si la imagen trae impreso un botón, conviene llenarlo."
        >
          <input
            id="enlace"
            type="text"
            inputMode="url"
            placeholder="https://www.presente.com.co/..."
            {...register('enlace')}
            className={cn(clasesControl, errors.enlace ? 'border-destructive' : 'border-input')}
          />
        </CampoFormulario>

        <Casilla
          etiqueta="Mostrar en el inicio"
          checked={activo}
          onChange={(valor) => setValue('activo', valor, { shouldValidate: true })}
        />

        {!activo && (
          <p className="text-sm text-muted-foreground">
            Queda guardado y en su posición, pero no aparece en el carrusel hasta que lo actives.
          </p>
        )}
      </form>
    </Modal>
  )
}

/** La imagen elegida, o la que ya tiene el banner mientras no se elija otra. */
function VistaPrevia({ archivo, urlActual }: { archivo: File | null; urlActual?: string }) {
  const [urlLocal, setUrlLocal] = useState<string | null>(null)

  useEffect(() => {
    if (!archivo) {
      setUrlLocal(null)
      return
    }

    const url = URL.createObjectURL(archivo)
    setUrlLocal(url)

    // Sin esto el objeto queda retenido en memoria mientras viva la pestaña.
    return () => URL.revokeObjectURL(url)
  }, [archivo])

  const url = urlLocal ?? urlActual

  if (!url) return null

  return (
    <figure className="space-y-1">
      <img
        src={url}
        alt=""
        className="w-full rounded-lg bg-secondary object-contain ring-1 ring-foreground/10"
      />
      <figcaption className="text-xs text-muted-foreground">
        {urlLocal ? (
          <span className="inline-flex items-center gap-1">
            <ImageUp className="size-3" aria-hidden />
            Imagen nueva, aún sin subir.
          </span>
        ) : (
          'Imagen actual del banner.'
        )}
      </figcaption>
    </figure>
  )
}
