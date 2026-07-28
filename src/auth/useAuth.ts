import { use } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  const contexto = use(AuthContext)

  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.')
  }

  return contexto
}
