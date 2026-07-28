import { useEffect, useState } from 'react'

/**
 * Retrasa la propagación de un valor. Se usa en los campos de precio para no lanzar una
 * consulta por cada tecla mientras se escribe una cifra de nueve dígitos.
 */
export function useDebounce<T>(valor: T, ms = 400): T {
  const [retrasado, setRetrasado] = useState(valor)

  useEffect(() => {
    const t = setTimeout(() => setRetrasado(valor), ms)
    return () => clearTimeout(t)
  }, [valor, ms])

  return retrasado
}
