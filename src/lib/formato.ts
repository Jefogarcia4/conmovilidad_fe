/** `185000000` → `"$185.000.000"`, el formato que usa el mockup (sin espacio ni decimales). */
export function formatearPrecio(valor: number): string {
  return `$${valor.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
}

/** `2026-08-22T14:03:00Z` → `"22 ago 2026"`. Para fechas que la API entrega en ISO con hora. */
export function formatearFechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Partículas que en un nombre español van en minúscula: «Juan de los Ríos», no «Juan De Los Ríos».
 * Nunca se aplica a la primera palabra, que siempre abre el nombre.
 */
const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'lo', 'los', 'y', 'e', 'da', 'das', 'do', 'dos'])

/**
 * `"JEFFERSON GARCIA"` → `"Jefferson Garcia"`.
 *
 * Los nombres llegan como los escribió quien cargó el usuario —a menudo en mayúsculas desde un
 * Excel— y en pantalla gritan. Se normaliza solo al mostrarlos: lo que se guarda no se toca,
 * porque es el dato que el administrador escribió y puede tener mayúsculas intencionadas.
 */
export function formatearNombre(texto: string | undefined): string {
  if (!texto) return ''

  return texto
    .trim()
    // Se parte conservando los separadores para no perder guiones ni espacios dobles.
    .split(/(\s+|-)/)
    .map((parte, i) => {
      if (!/[\p{L}]/u.test(parte)) return parte

      // `es-CO` importa: sin él, algunas mayúsculas con tilde no bajan bien.
      const minuscula = parte.toLocaleLowerCase('es-CO')

      // La primera palabra nunca es partícula, aunque se llame «Del» de apellido.
      if (i > 0 && PARTICULAS.has(minuscula)) return minuscula

      return minuscula.charAt(0).toLocaleUpperCase('es-CO') + minuscula.slice(1)
    })
    .join('')
}

/** `18.5` → `"18,5 %"`. Nulo cuando no hay tasa asignada. */
export function formatearTasa(valor: number | undefined): string | undefined {
  if (valor === undefined) return undefined

  return `${valor.toLocaleString('es-CO', { maximumFractionDigits: 2 })}%`
}

/** `45000` → `"45.000 km"` */
export function formatearKilometraje(valor: number): string {
  return `${valor.toLocaleString('es-CO')} km`
}
