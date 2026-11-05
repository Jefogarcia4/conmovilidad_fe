/**
 * Normaliza un texto para compararlo: sin acentos y en minúsculas.
 *
 * En «Armenia, Quindío» se busca tecleando «quindio», y en «GRUPO ÉXITO» tecleando «exito»:
 * nadie escribe las tildes al filtrar. Vive aquí y no dentro de un componente porque lo usan el
 * desplegable con búsqueda y los filtros del portal, y dos copias de la misma normalización
 * terminan comportándose distinto.
 */
export function comparable(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase()
}

/**
 * Deja solo los dígitos. Para comparar documentos y NIT, que la gente escribe con puntos, guiones
 * o espacios: «890.900.608» y «890900608» tienen que encontrarse el uno al otro.
 */
export function soloDigitos(texto: string): string {
  return texto.replace(/\D/g, '')
}
