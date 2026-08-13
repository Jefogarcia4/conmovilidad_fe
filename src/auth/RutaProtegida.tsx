import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

/**
 * Los textos legales se abren desde la propia pantalla de activación: quien tiene que aceptarlos
 * necesita poder leerlos antes, así que no pueden quedar detrás de la activación que exigen.
 */
const RUTAS_PERMITIDAS_SIN_ACTIVAR = ['/activar-cuenta', '/terminos', '/habeas-data']

/** Deja pasar solo a usuarios autenticados y recuerda a dónde iban para volver tras el login. */
export function RutaProtegida() {
  const { estaAutenticado, usuario } = useAuth()
  const ubicacion = useLocation()

  if (!estaAutenticado) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  }

  // Mientras la cuenta no esté activada, la única pantalla accesible es la de activación:
  // no basta con enlazarla, hay que impedir el resto.
  if (usuario?.debeCambiarPassword && !RUTAS_PERMITIDAS_SIN_ACTIVAR.includes(ubicacion.pathname)) {
    return <Navigate to="/activar-cuenta" replace />
  }

  return <Outlet />
}

/** Inverso de la anterior: evita que un usuario ya autenticado vuelva al login. */
export function RutaPublica() {
  const { estaAutenticado } = useAuth()

  return estaAutenticado ? <Navigate to="/home" replace /> : <Outlet />
}
