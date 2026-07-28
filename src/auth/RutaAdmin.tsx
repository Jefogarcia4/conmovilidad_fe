import { ShieldAlert } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { Boton } from '@/components/ui/Boton'
import { useAuth } from './useAuth'

/**
 * Restringe el portal de administración al superadministrador. Es una comodidad de interfaz:
 * la autorización real la impone la API, que rechaza estas rutas con 403 para cualquier otro rol.
 */
export function RutaAdmin() {
  const { usuario } = useAuth()

  if (usuario?.rol !== 'SuperAdministrador') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ShieldAlert className="mx-auto size-10 text-muted-foreground" aria-hidden />

        <h1 className="mt-5 font-display text-2xl font-bold text-foreground">
          No tienes acceso a esta sección
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          El portal de administración está reservado para los superadministradores.
        </p>

        <Link to="/home" className="mt-6 inline-block">
          <Boton>Volver al catálogo</Boton>
        </Link>
      </div>
    )
  }

  return <Outlet />
}
