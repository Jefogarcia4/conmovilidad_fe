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

/** `45000` → `"45.000 km"` */
export function formatearKilometraje(valor: number): string {
  return `${valor.toLocaleString('es-CO')} km`
}
