import { useRef, useState } from 'react'
import { GripVertical, Image as ImagenIcono, Loader2, Star, Trash2, UploadCloud } from 'lucide-react'
import { archivos } from '@/api/endpoints'
import { Alerta } from '@/components/ui/Alerta'
import { resolverUrlImagen } from '@/lib/imagenes'
import { subirImagenesVehiculo, type FotoFallida } from '@/lib/subirImagenes'
import { cn } from '@/lib/utils'

export interface ImagenPublicacion {
  url: string
  /** Se conserva para reenviarla al guardar; sin ella el vehículo perdería su miniatura. */
  urlMiniatura?: string
  nombre: string
}

interface Props {
  imagenes: ImagenPublicacion[]
  /**
   * URLs que ya pertenecen a un vehículo guardado. Quitarlas solo las saca de la lista: el
   * archivo lo borra la API al confirmar el cambio, para que cancelar no deje el vehículo
   * publicado con imágenes rotas.
   */
  urlsPersistidas?: string[]
  onCambio: (imagenes: ImagenPublicacion[]) => void
  error?: string
}

const ACEPTA = 'image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif'
const MAXIMO = 20

/**
 * Un único aviso con todo lo que no entró. Con veinte fotos en juego, decir solo «hubo un error»
 * deja al asesor sin saber cuáles repetir.
 */
function resumirFallos(
  fallidas: FotoFallida[],
  intentadas: number,
  descartadas: number,
): string | null {
  const avisos: string[] = []

  if (fallidas.length > 0 && fallidas.length === intentadas) {
    avisos.push(`No pudimos subir las imágenes: ${fallidas[0]?.motivo ?? 'error inesperado'}.`)
  } else if (fallidas.length > 0) {
    const detalle = fallidas.map((f) => `«${f.nombre}» (${f.motivo})`).join(', ')
    const verbo = fallidas.length === 1 ? 'Quedó fuera' : 'Quedaron fuera'
    avisos.push(`Subimos ${intentadas - fallidas.length} de ${intentadas}. ${verbo}: ${detalle}.`)
  }

  if (descartadas > 0) {
    const sobrantes =
      descartadas === 1 ? 'Se omitió 1 imagen' : `Se omitieron ${descartadas} imágenes`
    avisos.push(`${sobrantes}: el máximo es ${MAXIMO}.`)
  }

  return avisos.length > 0 ? avisos.join(' ') : null
}

export function SeccionFotografias({ imagenes, urlsPersistidas, onCambio, error }: Props) {
  const entrada = useRef<HTMLInputElement>(null)
  const [progreso, setProgreso] = useState<{ hechas: number; total: number } | null>(null)
  const [errorSubida, setErrorSubida] = useState<string | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [arrastrado, setArrastrado] = useState<number | null>(null)

  const subiendo = progreso !== null

  const subir = async (lista: FileList | File[]) => {
    const seleccion = Array.from(lista)
    if (seleccion.length === 0 || subiendo) return

    setErrorSubida(null)

    const disponibles = MAXIMO - imagenes.length
    if (disponibles <= 0) {
      setErrorSubida(`Puedes agregar máximo ${MAXIMO} imágenes.`)
      return
    }

    const aSubir = seleccion.slice(0, disponibles)
    setProgreso({ hechas: 0, total: aSubir.length })

    try {
      // Se suben una a una: las que entren se conservan aunque alguna falle, así que la lista se
      // actualiza con lo que haya llegado y el aviso resume el resto.
      const { imagenes: subidas, fallidas } = await subirImagenesVehiculo(aSubir, (hechas, total) =>
        setProgreso({ hechas, total }),
      )

      if (subidas.length > 0) {
        onCambio([
          ...imagenes,
          ...subidas.map((i) => ({
            url: i.url,
            urlMiniatura: i.urlMiniatura,
            nombre: i.nombreOriginal,
          })),
        ])
      }

      setErrorSubida(resumirFallos(fallidas, aSubir.length, seleccion.length - aSubir.length))
    } catch {
      setErrorSubida('No pudimos subir las imágenes. Inténtalo de nuevo.')
    } finally {
      setProgreso(null)
      // Permite volver a elegir el mismo archivo si el usuario lo borra y lo vuelve a agregar.
      if (entrada.current) entrada.current.value = ''
    }
  }

  const quitar = async (indice: number) => {
    const imagen = imagenes[indice]
    if (!imagen) return

    onCambio(imagenes.filter((_, i) => i !== indice))

    // Una imagen ya guardada sigue viva hasta que se confirme el cambio: si se borrara aquí,
    // cancelar la edición dejaría el vehículo publicado apuntando a un archivo inexistente.
    if (urlsPersistidas?.includes(imagen.url)) return

    // La recién subida sí se borra al instante, para no dejar basura si nunca se publica.
    // Son dos binarios —grande y miniatura—, así que hay que retirar ambos.
    await Promise.all(
      [imagen.url, imagen.urlMiniatura]
        .filter((url): url is string => Boolean(url))
        .map((url) => archivos.eliminarImagenVehiculo(url).catch(() => undefined)),
    )
  }

  const reordenar = (desde: number, hasta: number) => {
    if (desde === hasta) return

    const copia = [...imagenes]
    const [movida] = copia.splice(desde, 1)
    if (movida) copia.splice(hasta, 0, movida)
    onCambio(copia)
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
          <ImagenIcono className="size-4 text-foreground" aria-hidden />
        </span>

        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Fotografías del vehículo</h2>
          <p className="text-xs text-muted-foreground">
            Agrega imágenes de alta calidad. La primera será la principal.
          </p>
        </div>
      </header>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => entrada.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setArrastrando(true)
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => {
            e.preventDefault()
            setArrastrando(false)
            void subir(e.dataTransfer.files)
          }}
          disabled={subiendo}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10',
            'transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
            'disabled:cursor-wait',
            arrastrando ? 'border-cta bg-accent/40' : 'border-border hover:border-cta/50 hover:bg-muted/40',
          )}
        >
          <span className="grid size-11 place-items-center rounded-full bg-muted">
            {subiendo ? (
              <Loader2 className="size-5 animate-spin text-cta" aria-hidden />
            ) : (
              <UploadCloud className="size-5 text-muted-foreground" aria-hidden />
            )}
          </span>

          <span className="text-sm text-foreground">
            {progreso
              ? `Subiendo ${progreso.hechas} de ${progreso.total} imágenes…`
              : 'Arrastra imágenes aquí o haz clic para seleccionar'}
          </span>

          {progreso ? (
            <span className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted" aria-hidden>
              <span
                className="block h-full rounded-full bg-cta transition-[width] duration-300"
                style={{ width: `${Math.round((progreso.hechas / progreso.total) * 100)}%` }}
              />
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Formatos soportados: JPEG, PNG, WebP, HEIC
            </span>
          )}
        </button>

        <input
          ref={entrada}
          type="file"
          accept={ACEPTA}
          multiple
          className="sr-only"
          onChange={(e) => e.target.files && void subir(e.target.files)}
        />

        {(errorSubida ?? error) && <Alerta>{errorSubida ?? error}</Alerta>}

        {imagenes.length === 0 ? (
          <p className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-8 text-sm text-muted-foreground">
            <ImagenIcono className="size-4" aria-hidden />
            Aún no has agregado imágenes
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {imagenes.map((imagen, i) => (
              <li
                key={imagen.url}
                draggable
                onDragStart={() => setArrastrado(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (arrastrado !== null) reordenar(arrastrado, i)
                  setArrastrado(null)
                }}
                className="group relative overflow-hidden rounded-xl border border-border bg-muted"
              >
                {/* Contenida y no recortada: la previsualización debe mostrar exactamente lo que
                    verá el comprador, marcas de agua de las esquinas incluidas. */}
                <img
                  src={resolverUrlImagen(imagen.urlMiniatura ?? imagen.url)}
                  alt={imagen.nombre}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-contain"
                />

                {i === 0 && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-4xl bg-cta px-2 py-0.5 text-xs font-medium text-cta-foreground">
                    <Star className="size-3" aria-hidden />
                    Principal
                  </span>
                )}

                <span
                  aria-hidden
                  className="absolute top-2 right-2 grid size-6 cursor-grab place-items-center rounded-md bg-background/85 text-muted-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                >
                  <GripVertical className="size-3.5" />
                </span>

                <button
                  type="button"
                  onClick={() => void quitar(i)}
                  aria-label={`Quitar ${imagen.nombre}`}
                  className="absolute right-2 bottom-2 grid size-7 place-items-center rounded-md bg-background/85 text-destructive opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-background"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}

        {imagenes.length > 1 && (
          <p className="text-xs text-muted-foreground">
            Arrastra las imágenes para reordenarlas. La primera es la que se muestra en el catálogo.
          </p>
        )}
      </div>
    </section>
  )
}
