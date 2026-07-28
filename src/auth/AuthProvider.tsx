import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { autenticacion } from '@/api/endpoints'
import { sesion } from '@/api/sesion'
import type { UsuarioAutenticado } from '@/api/types'
import { AuthContext, type EstadoAuth } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(() => sesion.usuario)

  // El cliente de API puede invalidar la sesión al fallar un refresco, fuera del árbol de React.
  useEffect(() => {
    const desuscribir = sesion.alCerrarSesion(() => setUsuario(null))
    return () => {
      desuscribir()
    }
  }, [])

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const auth = await autenticacion.login(email, password)
    sesion.guardar(auth)
    setUsuario(auth.usuario)
  }, [])

  const cerrarSesion = useCallback(async () => {
    const refreshToken = sesion.refreshToken

    if (refreshToken) {
      // Que el backend no alcance a revocar el token no debe impedir salir de la aplicación.
      await autenticacion.logout(refreshToken).catch(() => undefined)
    }

    sesion.limpiar()
    setUsuario(null)
  }, [])

  const refrescarPerfil = useCallback(async () => {
    const perfil = await autenticacion.perfil()

    // El perfil guardado alimenta el arranque de la app; hay que dejarlo al día.
    sesion.actualizarUsuario(perfil)
    setUsuario(perfil)
  }, [])

  const valor = useMemo<EstadoAuth>(
    () => ({
      usuario,
      estaAutenticado: usuario !== null,
      iniciarSesion,
      cerrarSesion,
      refrescarPerfil,
    }),
    [usuario, iniciarSesion, cerrarSesion, refrescarPerfil],
  )

  return <AuthContext value={valor}>{children}</AuthContext>
}
