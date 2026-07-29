// Vacía en desarrollo por convención, así que `||` y no `??` (ver `api/cliente.ts`).
const BASE_API = import.meta.env.VITE_API_URL || '/api'

/**
 * Origen de la API sin el sufijo `/api`. Vacío en desarrollo, donde el proxy de Vite sirve
 * tanto la API como los archivos estáticos desde el mismo puerto.
 */
const ORIGEN_API = BASE_API.startsWith('http') ? BASE_API.replace(/\/api\/?$/, '') : ''

/**
 * Resuelve la URL de una imagen de vehículo.
 *
 * Las imágenes subidas a Azure Blob llegan como URL absoluta y se usan tal cual. Las que sirve
 * la propia API —los datos de demostración y el almacenamiento local— llegan como ruta relativa
 * (`/uploads/...`), y el navegador las buscaría en el dominio del front: hay que anteponerles el
 * origen de la API o saldrían rotas en cuanto front y API viven en dominios distintos.
 */
export function resolverUrlImagen(url: string | undefined | null): string | undefined {
  if (!url) return undefined

  return url.startsWith('http') ? url : `${ORIGEN_API}${url}`
}
