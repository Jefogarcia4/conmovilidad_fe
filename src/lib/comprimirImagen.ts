/**
 * Reduce y recodifica la foto en el navegador **antes** de enviarla.
 *
 * Una foto de iPhone ronda los 3-15 MB —48 MP en «máxima compatibilidad»— y veinte de ellas son
 * más de 100 MB. Sobre datos móviles eso son minutos de subida, y App Service corta cualquier
 * petición que pase de 230 s con un 502 sin cuerpo, que el asesor ve como «error del servidor».
 * Recodificada a 2000 px cada foto queda en 300-600 KB: la subida baja de minutos a segundos y no
 * se pierde calidad visible, porque la API la reduce después a 1600 px WebP de todos modos.
 *
 * Nada de esto puede impedir publicar: ante cualquier fallo —un HEIC que el navegador no sabe
 * decodificar, memoria insuficiente— se devuelve el archivo original y la API se encarga.
 */

/** Lado mayor de la foto recodificada. Deja margen sobre los 1600 px que guarda la API. */
const LADO_MAXIMO = 2000

const CALIDAD = 0.85

/**
 * Por debajo de este peso no compensa recodificar: se ganarían unos pocos KB a cambio de una
 * segunda pérdida de calidad.
 */
const UMBRAL_BYTES = 700 * 1024

/** El bloque EXIF va justo detrás de la cabecera; no hace falta leer el archivo entero. */
const CABECERA_BYTES = 256 * 1024

/**
 * Bloque EXIF con `Orientation = 6` que se injerta en una foto de prueba para averiguar si el
 * navegador aplica por su cuenta la orientación de la cámara. Ver {@link sondear}.
 */
const APP1_ORIENTACION_6 = new Uint8Array([
  0xff, 0xe1, 0x00, 0x22, //                         APP1, longitud 34
  0x45, 0x78, 0x69, 0x66, 0x00, 0x00, //             "Exif\0\0"
  0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, // TIFF little-endian, primer IFD en el byte 8
  0x01, 0x00, //                                     una sola entrada
  0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, // tag 0x0112 (Orientation), SHORT, 1 valor
  0x06, 0x00, 0x00, 0x00, //                         6 = girada 90°
  0x00, 0x00, 0x00, 0x00, //                         no hay más IFD
])

/** Devuelve una versión ligera del archivo, o el archivo tal cual si no se puede recodificar. */
export async function comprimirImagen(archivo: File): Promise<File> {
  if (archivo.size <= UMBRAL_BYTES || typeof createImageBitmap !== 'function') {
    return archivo
  }

  let mapa: ImageBitmap | undefined

  try {
    const [orientacion, yaAplicada] = await Promise.all([
      leerOrientacionExif(archivo),
      aplicaOrientacionNativa(),
    ])

    mapa = await decodificar(archivo)

    // Al recodificar se pierden los metadatos, así que la orientación tiene que quedar grabada en
    // los píxeles. Si el navegador ya la aplicó al decodificar, volver a girar la dejaría torcida.
    const giro = yaAplicada ? 1 : orientacion

    const escala = Math.min(1, LADO_MAXIMO / Math.max(mapa.width, mapa.height))
    const ancho = Math.round(mapa.width * escala)
    const alto = Math.round(mapa.height * escala)

    // Las orientaciones 5-8 giran la foto un cuarto de vuelta: el lienzo va con los lados al revés.
    const trasponer = giro >= 5

    const lienzo = document.createElement('canvas')
    lienzo.width = trasponer ? alto : ancho
    lienzo.height = trasponer ? ancho : alto

    const contexto = lienzo.getContext('2d')
    if (!contexto) return archivo

    // JPEG no tiene transparencia: sin fondo, un PNG con alfa saldría con manchas negras.
    contexto.fillStyle = '#ffffff'
    contexto.fillRect(0, 0, lienzo.width, lienzo.height)

    aplicarGiro(contexto, giro, ancho, alto)
    contexto.drawImage(mapa, 0, 0, ancho, alto)

    const blob = await aBlob(lienzo)

    // Un navegador que no sepa codificar JPEG devuelve un PNG, que para una fotografía pesa más
    // que el original: en ese caso no hay nada que ganar.
    if (!blob || blob.type !== 'image/jpeg' || blob.size >= archivo.size) {
      return archivo
    }

    return new File([blob], conExtensionJpg(archivo.name), {
      type: 'image/jpeg',
      lastModified: archivo.lastModified,
    })
  } catch {
    return archivo
  } finally {
    mapa?.close()
  }
}

/**
 * Decodifica pidiendo la orientación de la cámara. La opción no la admiten todos los navegadores;
 * el segundo intento cubre a los que la rechazan, y el sondeo pasa por aquí también, así que
 * ambos caminos coinciden siempre.
 */
async function decodificar(blob: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(blob, { imageOrientation: 'from-image' })
  } catch {
    return await createImageBitmap(blob)
  }
}

let sondeo: Promise<boolean> | null = null

/** El resultado no cambia dentro de una misma sesión: se sondea una vez y se reutiliza. */
function aplicaOrientacionNativa(): Promise<boolean> {
  sondeo ??= sondear()
  return sondeo
}

/**
 * Comprueba con una foto de prueba si el navegador gira la imagen al decodificarla. Los
 * navegadores vigentes lo hacen, pero no todos ni desde la misma versión, y acertar a ciegas no
 * es opción: equivocarse deja **todas** las fotos del iPhone tumbadas.
 */
async function sondear(): Promise<boolean> {
  try {
    const lienzo = document.createElement('canvas')
    lienzo.width = 2
    lienzo.height = 1

    const base = aBytes(lienzo.toDataURL('image/jpeg'))

    // El bloque EXIF va inmediatamente detrás del marcador de inicio (los dos primeros bytes).
    const conExif = new Uint8Array(base.length + APP1_ORIENTACION_6.length)
    conExif.set(base.subarray(0, 2), 0)
    conExif.set(APP1_ORIENTACION_6, 2)
    conExif.set(base.subarray(2), 2 + APP1_ORIENTACION_6.length)

    const mapa = await decodificar(new Blob([conExif], { type: 'image/jpeg' }))

    // Si aplicó el giro, la foto de 2×1 sale de 1×2.
    const aplicada = mapa.width === 1 && mapa.height === 2
    mapa.close()

    return aplicada
  } catch {
    // Sin sonda fiable se asume que sí la aplica, que es lo que hacen los navegadores vigentes.
    return true
  }
}

/**
 * Lee la orientación de la cámara del bloque EXIF. Devuelve 1 —sin giro— si el archivo no es un
 * JPEG o no la trae.
 */
async function leerOrientacionExif(archivo: File): Promise<number> {
  try {
    const vista = new DataView(await archivo.slice(0, CABECERA_BYTES).arrayBuffer())

    if (vista.byteLength < 4 || vista.getUint16(0) !== 0xffd8) {
      return 1
    }

    let posicion = 2

    while (posicion + 4 <= vista.byteLength) {
      if (vista.getUint8(posicion) !== 0xff) return 1

      const marca = vista.getUint8(posicion + 1)

      // Marcadores sueltos, sin bloque de datos detrás.
      if (marca === 0x01 || (marca >= 0xd0 && marca <= 0xd9)) {
        posicion += 2
        continue
      }

      // Inicio de los datos comprimidos: a partir de aquí ya no hay metadatos.
      if (marca === 0xda) return 1

      if (marca === 0xe1) {
        const orientacion = leerOrientacionApp1(vista, posicion + 4)
        if (orientacion) return orientacion
      }

      posicion += 2 + vista.getUint16(posicion + 2)
    }

    return 1
  } catch {
    return 1
  }
}

function leerOrientacionApp1(vista: DataView, inicio: number): number | null {
  // "Exif\0\0" seguido de la cabecera TIFF.
  if (
    inicio + 14 > vista.byteLength ||
    vista.getUint32(inicio) !== 0x45786966 ||
    vista.getUint16(inicio + 4) !== 0
  ) {
    return null
  }

  const tiff = inicio + 6
  const orden = vista.getUint16(tiff)

  if (orden !== 0x4949 && orden !== 0x4d4d) return null

  const pequeno = orden === 0x4949
  if (vista.getUint16(tiff + 2, pequeno) !== 42) return null

  const ifd = tiff + vista.getUint32(tiff + 4, pequeno)
  if (ifd + 2 > vista.byteLength) return null

  const entradas = vista.getUint16(ifd, pequeno)

  for (let i = 0; i < entradas; i++) {
    // Cada entrada del directorio mide 12 bytes; el valor va en los últimos cuatro.
    const entrada = ifd + 2 + i * 12
    if (entrada + 12 > vista.byteLength) break

    if (vista.getUint16(entrada, pequeno) === 0x0112) {
      const valor = vista.getUint16(entrada + 8, pequeno)
      return valor >= 1 && valor <= 8 ? valor : null
    }
  }

  return null
}

/**
 * Deja grabado en los píxeles el giro que la cámara había anotado como metadato. `ancho` y `alto`
 * son los de la foto sin girar; el lienzo ya viene con los suyos.
 */
function aplicarGiro(
  contexto: CanvasRenderingContext2D,
  giro: number,
  ancho: number,
  alto: number,
): void {
  switch (giro) {
    case 2:
      contexto.transform(-1, 0, 0, 1, ancho, 0)
      break
    case 3:
      contexto.transform(-1, 0, 0, -1, ancho, alto)
      break
    case 4:
      contexto.transform(1, 0, 0, -1, 0, alto)
      break
    case 5:
      contexto.transform(0, 1, 1, 0, 0, 0)
      break
    case 6:
      contexto.transform(0, 1, -1, 0, alto, 0)
      break
    case 7:
      contexto.transform(0, -1, -1, 0, alto, ancho)
      break
    case 8:
      contexto.transform(0, -1, 1, 0, 0, ancho)
      break
  }
}

function aBlob(lienzo: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolver) => lienzo.toBlob(resolver, 'image/jpeg', CALIDAD))
}

function aBytes(urlDatos: string): Uint8Array {
  const binario = atob(urlDatos.slice(urlDatos.indexOf(',') + 1))
  const bytes = new Uint8Array(binario.length)

  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i)
  }

  return bytes
}

function conExtensionJpg(nombre: string): string {
  const punto = nombre.lastIndexOf('.')

  return `${punto > 0 ? nombre.slice(0, punto) : nombre}.jpg`
}
