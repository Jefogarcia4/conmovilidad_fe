import { api } from './cliente'

/**
 * Qué módulos están en servicio hoy. Los controla el administrador desde las variables de la
 * aplicación en App Service, así que pueden cambiar sin que se despliegue nada.
 */
export interface Modulos {
  /** Refleja la variable `habilita_vehiculos`. En `false`, publicar está fuera de servicio. */
  vehiculosHabilitados: boolean
}

export const configuracion = {
  modulos: () => api.get<Modulos>('/configuracion/modulos'),
}
