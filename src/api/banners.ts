import { api } from './cliente'

/**
 * Banners del carrusel del inicio.
 *
 * Antes eran imágenes importadas en el componente y cambiar una exigía desplegar el front. Ahora
 * las administra el superadministrador desde el portal.
 */

/** Lo que recibe el inicio. Sin identificadores ni estado: el endpoint es anónimo. */
export interface BannerPublico {
  imagenUrl: string
  textoAlternativo: string
  enlace?: string | null
}

export interface BannerAdmin extends BannerPublico {
  id: string
  orden: number
  activo: boolean
  /** Vino empaquetado con el front: se puede quitar de la lista, pero no hay archivo que borrar. */
  esImagenEmpaquetada: boolean
}

export interface GuardarBannerRequest {
  textoAlternativo: string
  enlace?: string | null
  activo: boolean
}

export const banners = {
  /** Sin autenticación: el inicio se pinta antes de que nadie inicie sesión. */
  listar: () => api.get<BannerPublico[]>('/banners', { sinAutenticacion: true }),
}

export const adminBanners = {
  listar: () => api.get<BannerAdmin[]>('/admin/banners'),

  crear: (archivo: File, datos: GuardarBannerRequest) => {
    const cuerpo = new FormData()
    cuerpo.append('archivo', archivo)
    cuerpo.append('textoAlternativo', datos.textoAlternativo)
    cuerpo.append('activo', String(datos.activo))

    if (datos.enlace) {
      cuerpo.append('enlace', datos.enlace)
    }

    return api.post<BannerAdmin>('/admin/banners', cuerpo)
  },

  actualizar: (id: string, datos: GuardarBannerRequest) =>
    api.put<BannerAdmin>(`/admin/banners/${id}`, datos),

  reemplazarImagen: (id: string, archivo: File) => {
    const cuerpo = new FormData()
    cuerpo.append('archivo', archivo)

    return api.put<BannerAdmin>(`/admin/banners/${id}/imagen`, cuerpo)
  },

  /** Se envía la lista completa en el orden deseado; ver `ReordenarBannersRequest` en la API. */
  reordenar: (ids: string[]) => api.put<void>('/admin/banners/orden', { ids }),

  eliminar: (id: string) => api.delete<void>(`/admin/banners/${id}`),
}
