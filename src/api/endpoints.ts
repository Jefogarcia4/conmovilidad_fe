import { api, queryString } from './cliente'
import type {
  AuthResponse,
  Empresa,
  Linea,
  Marca,
  OpcionesVehiculo,
  ResultadoPaginado,
  UsuarioAutenticado,
  VehiculoDetalle,
  VehiculoLista,
} from './types'

export const autenticacion = {
  login: (numeroDocumento: string, password: string) =>
    api.post<AuthResponse>(
      '/auth/login',
      { numeroDocumento, password },
      { sinAutenticacion: true },
    ),

  /** Primer ingreso: cambia la contraseña inicial y registra el correo de recuperación. */
  activarCuenta: (passwordActual: string, passwordNuevo: string, emailRecuperacion: string) =>
    api.post<void>('/auth/activar-cuenta', {
      passwordActual,
      passwordNuevo,
      emailRecuperacion,
    }),

  logout: (refreshToken: string) =>
    api.post<void>('/auth/logout', { refreshToken }, { sinAutenticacion: true }),

  perfil: () => api.get<UsuarioAutenticado>('/auth/me'),

  cambiarPassword: (passwordActual: string, passwordNuevo: string) =>
    api.post<void>('/auth/cambiar-password', { passwordActual, passwordNuevo }),
}

export interface FiltroVehiculos {
  busqueda?: string
  marcaId?: string
  lineaId?: string
  empresaId?: string
  tipoVehiculo?: string
  combustible?: string
  transmision?: string
  estado?: string
  modeloDesde?: number
  modeloHasta?: number
  precioDesde?: number
  precioHasta?: number
  kilometrajeHasta?: number
  ciudad?: string
  pagina?: number
  tamanoPagina?: number
  ordenarPor?: 'recientes' | 'precio_asc' | 'precio_desc' | 'km_asc' | 'modelo_desc'
}

export const vehiculos = {
  catalogo: (filtro: FiltroVehiculos = {}) =>
    api.get<ResultadoPaginado<VehiculoLista>>(`/vehiculos/catalogo${queryString(filtro)}`),

  mios: (filtro: FiltroVehiculos = {}) =>
    api.get<ResultadoPaginado<VehiculoLista>>(`/vehiculos/mis-vehiculos${queryString(filtro)}`),

  detalle: (id: string) => api.get<VehiculoDetalle>(`/vehiculos/${id}`),

  crear: (datos: CrearVehiculoRequest) => api.post<VehiculoDetalle>('/vehiculos', datos),

  eliminar: (id: string) => api.delete<void>(`/vehiculos/${id}`),

  cambiarEstado: (id: string, estado: string) =>
    api.patch<void>(`/vehiculos/${id}/estado`, { estado }),
}

export interface ImagenSubida {
  url: string
  ruta: string
  tamanoBytes: number
  nombreOriginal: string
}

export const archivos = {
  /** Sube las imágenes al almacenamiento configurado y devuelve sus URLs públicas. */
  subirImagenesVehiculo: (lista: File[]) => {
    const cuerpo = new FormData()
    lista.forEach((f) => cuerpo.append('archivos', f))

    return api.post<{ imagenes: ImagenSubida[] }>('/archivos/imagenes-vehiculo', cuerpo)
  },

  eliminarImagenVehiculo: (url: string) =>
    api.delete<void>(`/archivos/imagenes-vehiculo${queryString({ url })}`),
}

export interface CrearVehiculoRequest {
  placa: string
  marcaId: string
  lineaId?: string
  lineaNombre?: string
  version?: string
  modelo: number
  color: string
  kilometraje: number
  precio: number
  precioNegociable?: boolean
  tipoVehiculo: string
  combustible: string
  transmision?: string
  cilindraje?: number
  numeroPuertas?: number
  capacidadPasajeros?: number
  esBlindado?: boolean
  tienePrenda?: boolean
  ciudad?: string
  ciudadMatricula?: string
  vencimientoSoat?: string
  soatVencido?: boolean
  vencimientoTecnomecanica?: string
  tecnomecanicaVencida?: boolean
  descripcion?: string
  publicarInmediatamente?: boolean
  imagenes?: { url: string; esPrincipal: boolean; orden: number }[]
}

export const catalogos = {
  marcas: () => api.get<Marca[]>('/catalogos/marcas'),

  lineas: (marcaId?: string) => api.get<Linea[]>(`/catalogos/lineas${queryString({ marcaId })}`),

  empresas: () => api.get<Empresa[]>('/catalogos/empresas'),

  opcionesVehiculo: () => api.get<OpcionesVehiculo>('/catalogos/opciones-vehiculo'),

  ciudades: () => api.get<string[]>('/catalogos/ciudades'),

  colores: () => api.get<string[]>('/catalogos/colores'),
}
