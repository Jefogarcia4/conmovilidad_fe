import { useQuery } from '@tanstack/react-query'
import { catalogos } from '@/api/endpoints'

/**
 * Traduce los nombres de enum que devuelve la API (`Suv`, `Diesel`, `HibridoEnchufable`) a la
 * etiqueta legible que ya publica `/catalogos/opciones-vehiculo` (`SUV`, `Diésel`, `PHEV`).
 *
 * Se resuelve contra la API en vez de con un diccionario en el front para que agregar un tipo
 * o un combustible nuevo no obligue a tocar los dos lados.
 */
export function useEtiquetasVehiculo() {
  const { data } = useQuery({
    queryKey: ['catalogos', 'opciones-vehiculo'],
    queryFn: catalogos.opcionesVehiculo,
    staleTime: Infinity,
  })

  const mapa = new Map<string, string>()

  for (const grupo of [
    data?.tiposVehiculo,
    data?.combustibles,
    data?.transmisiones,
    data?.tracciones,
  ]) {
    for (const opcion of grupo ?? []) {
      mapa.set(opcion.nombre, opcion.etiqueta)
    }
  }

  /** Devuelve el nombre original mientras el catálogo aún no ha cargado. */
  return (nombre: string | undefined | null): string => (nombre ? (mapa.get(nombre) ?? nombre) : '')
}
