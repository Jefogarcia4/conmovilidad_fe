/** `185000000` → `"$185.000.000"`, el formato que usa el mockup (sin espacio ni decimales). */
export function formatearPrecio(valor: number): string {
  return `$${valor.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
}

/** `45000` → `"45.000 km"` */
export function formatearKilometraje(valor: number): string {
  return `${valor.toLocaleString('es-CO')} km`
}
