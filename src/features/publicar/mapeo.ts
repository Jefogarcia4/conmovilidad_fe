import type { VehiculoDetalle } from '@/api/types'
import type { FormularioPublicacion } from './esquema'
import type { ImagenPublicacion } from './SeccionFotografias'

/** Campos que la API espera y el formulario no gestiona: se conservan tal como estaban. */
export interface CamposConservados {
  precioNegociable?: boolean
  numeroPuertas?: number
  descripcion?: string
}

/**
 * Traduce el formulario al cuerpo que espera la API. Publicar y editar mandan la misma
 * estructura, así que el mapeo vive en un solo sitio: si se agrega un campo, se agrega aquí.
 */
export function aPeticionVehiculo(
  datos: FormularioPublicacion,
  imagenes: ImagenPublicacion[],
  conservados: CamposConservados = {},
) {
  return {
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
    // Opcionales: la API rechaza la cadena vacía porque no es un valor del enum.
    transmision: datos.transmision || undefined,
    traccion: datos.traccion || undefined,
    cilindraje: datos.cilindraje,
    capacidadPasajeros: datos.capacidadPasajeros,
    ciudad: datos.ciudad,
    ciudadMatricula: datos.ciudadMatricula || undefined,
    vencimientoSoat: datos.soatVencido ? undefined : datos.vencimientoSoat || undefined,
    vencimientoTecnomecanica: datos.tecnomecanicaVencida
      ? undefined
      : datos.vencimientoTecnomecanica || undefined,
    soatVencido: datos.soatVencido,
    tecnomecanicaVencida: datos.tecnomecanicaVencida,
    tienePrenda: datos.tienePrenda,
    esBlindado: datos.esBlindado,
    ...conservados,
    // El orden de la galería es el que dejó el usuario; la primera es la principal.
    imagenes: imagenes.map((img, i) => ({ url: img.url, esPrincipal: i === 0, orden: i })),
  }
}

/** Rellena el formulario con lo que ya tiene guardado el vehículo. */
export function aValoresFormulario(vehiculo: VehiculoDetalle): FormularioPublicacion {
  return {
    marcaId: vehiculo.marcaId,
    lineaNombre: vehiculo.linea,
    lineaId: vehiculo.lineaId,
    version: vehiculo.version ?? '',
    modelo: vehiculo.modelo,
    tipoVehiculo: vehiculo.tipoVehiculo,
    color: vehiculo.color,
    placa: vehiculo.placa,
    ciudadMatricula: vehiculo.ciudadMatricula ?? '',
    ciudad: vehiculo.ciudad ?? '',
    kilometraje: vehiculo.kilometraje,
    cilindraje: vehiculo.cilindraje,
    combustible: vehiculo.combustible,
    // Una API antigua devuelve cadena vacía cuando no hay valor; el combo la trata como «sin elegir».
    transmision: vehiculo.transmision ?? '',
    traccion: vehiculo.traccion ?? '',
    capacidadPasajeros: vehiculo.capacidadPasajeros,
    precio: vehiculo.precio,
    vencimientoSoat: vehiculo.vencimientoSoat ?? '',
    soatVencido: vehiculo.soatVencido,
    vencimientoTecnomecanica: vehiculo.vencimientoTecnomecanica ?? '',
    tecnomecanicaVencida: vehiculo.tecnomecanicaVencida,
    tienePrenda: vehiculo.tienePrenda,
    esBlindado: vehiculo.esBlindado,
  }
}

/**
 * La galería guardada no recuerda el nombre del archivo original, así que se toma el último
 * segmento de la URL: solo se usa como texto alternativo y etiqueta del botón de quitar.
 */
export function aImagenesFormulario(vehiculo: VehiculoDetalle): ImagenPublicacion[] {
  return [...vehiculo.imagenes]
    .sort((a, b) => a.orden - b.orden)
    .map((imagen) => ({
      url: imagen.url,
      nombre: decodeURIComponent(imagen.url.split('/').pop() ?? 'Imagen del vehículo'),
    }))
}
