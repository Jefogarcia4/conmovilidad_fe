import { ApiError } from '@/api/cliente'
import { archivos, type ImagenSubida } from '@/api/endpoints'
import { comprimirImagen } from './comprimirImagen'

/**
 * Sube la selección de fotos **de una en una** en lugar de en un único envío.
 *
 * Mandar las veinte juntas producía una petición de cientos de megas que tardaba minutos y que el
 * balanceador de App Service cortaba a los 230 s con un 502 sin cuerpo; además era todo o nada:
 * si fallaba la decimoctava se perdían las diecisiete anteriores y quedaban sus binarios
 * huérfanos en el almacén. Repartida en peticiones cortas ninguna se acerca a ese tope, se puede
 * mostrar el avance real, y una foto que falle no arrastra a las demás.
 */

/** Subidas simultáneas. Tres saturan el enlace de subida de un móvil sin llegar a atragantarlo. */
const CONCURRENCIA = 3

const INTENTOS = 3

/** Con las fotos ya recodificadas ronda los 400 KB; dos minutos cubren una conexión muy mala. */
const TIEMPO_MAXIMO_MS = 120_000

export interface FotoFallida {
  nombre: string
  motivo: string
}

export interface ResultadoSubida {
  /** Las que sí subieron, en el mismo orden en que las eligió el asesor. */
  imagenes: ImagenSubida[]
  fallidas: FotoFallida[]
}

/**
 * Comprime y sube la selección. No lanza: lo que falle viene en `fallidas` para que el asesor
 * conserve las fotos que sí entraron y sepa cuáles repetir.
 */
export async function subirImagenesVehiculo(
  seleccion: File[],
  onProgreso: (completadas: number, total: number) => void,
): Promise<ResultadoSubida> {
  const subidas = new Array<ImagenSubida | undefined>(seleccion.length)
  const fallidas: FotoFallida[] = []

  let siguiente = 0
  let completadas = 0

  // La compresión ocupa el hilo principal y reserva el mapa de bits completo de la foto —una de
  // 48 MP son casi 200 MB—, así que se hace de una en una aunque las subidas viajen en paralelo:
  // hacerlas a la vez no ganaría tiempo y sí puede tumbar la pestaña en un móvil.
  let turnoCompresion: Promise<unknown> = Promise.resolve()

  const trabajador = async () => {
    while (siguiente < seleccion.length) {
      const indice = siguiente++
      const original = seleccion[indice]
      if (!original) continue

      const enTurno = turnoCompresion.then(() => comprimirImagen(original))
      turnoCompresion = enTurno.catch(() => undefined)

      try {
        subidas[indice] = await subirConReintento(await enTurno)
      } catch (e) {
        fallidas.push({ nombre: original.name, motivo: describir(e) })
      } finally {
        onProgreso(++completadas, seleccion.length)
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCIA, seleccion.length) }, () => trabajador()),
  )

  return {
    imagenes: subidas.filter((i): i is ImagenSubida => i !== undefined),
    fallidas,
  }
}

async function subirConReintento(archivo: File): Promise<ImagenSubida> {
  for (let intento = 1; ; intento++) {
    try {
      return await subirUna(archivo)
    } catch (e) {
      // Un 400 es la propia foto —formato o tamaño—: repetirla daría exactamente el mismo error.
      const reintentable = esCorte(e) || (e instanceof ApiError && (e.status === 0 || e.status >= 500))

      if (!reintentable || intento >= INTENTOS) throw e

      // Espera creciente: si la API está saturada, insistir de inmediato solo empeora.
      await new Promise((seguir) => setTimeout(seguir, intento * 1000))
    }
  }
}

async function subirUna(archivo: File): Promise<ImagenSubida> {
  const control = new AbortController()
  const temporizador = setTimeout(() => control.abort(), TIEMPO_MAXIMO_MS)

  try {
    const { imagenes } = await archivos.subirImagenesVehiculo([archivo], control.signal)
    const imagen = imagenes[0]

    if (!imagen) {
      throw new ApiError(500, 'La API no devolvió la imagen subida.')
    }

    return imagen
  } finally {
    clearTimeout(temporizador)
  }
}

/** Distingue el corte por tiempo agotado de un error de la API. */
function esCorte(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError'
}

function describir(e: unknown): string {
  if (esCorte(e)) return 'la subida tardó demasiado'

  return e instanceof ApiError ? e.message : 'error inesperado'
}
