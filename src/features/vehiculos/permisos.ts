import type { UsuarioAutenticado } from '@/api/types'

/**
 * Refleja la regla que aplica la API (`ServicioVehiculos.PuedeGestionar`): el vehículo lo maneja
 * quien lo publicó, y por encima de él los administradores. Aquí solo sirve para no ofrecer
 * acciones que terminarían en un 403; la decisión real la sigue tomando el servidor.
 */
export function puedeGestionarVehiculo(
  usuario: UsuarioAutenticado | null | undefined,
  publicadoPorUsuarioId: string,
): boolean {
  if (!usuario) return false

  return (
    usuario.id === publicadoPorUsuarioId ||
    usuario.rol === 'AdministradorConvenio' ||
    usuario.rol === 'SuperAdministrador'
  )
}
