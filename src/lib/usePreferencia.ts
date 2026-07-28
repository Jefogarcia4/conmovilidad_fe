import { useCallback, useState } from 'react'

/**
 * Estado que se recuerda entre sesiones en `localStorage`. Se usa para preferencias de interfaz
 * (como la vista elegida), nunca para datos del servidor.
 */
export function usePreferencia<T extends string>(
  clave: string,
  porDefecto: T,
  valores: readonly T[],
): [T, (valor: T) => void] {
  const [estado, setEstado] = useState<T>(() => {
    const guardado = localStorage.getItem(clave)
    // Un valor obsoleto de una versión anterior no debe dejar la interfaz en un modo inexistente.
    return valores.includes(guardado as T) ? (guardado as T) : porDefecto
  })

  const cambiar = useCallback(
    (valor: T) => {
      setEstado(valor)
      localStorage.setItem(clave, valor)
    },
    [clave],
  )

  return [estado, cambiar]
}
