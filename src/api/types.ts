/** Contratos que expone la API .NET. Deben mantenerse alineados con `/openapi/v1.json`. */

export type RolUsuario = 'Asesor' | 'AdministradorConvenio' | 'SuperAdministrador'

export type EstadoVehiculo = 'Borrador' | 'Disponible' | 'Reservado' | 'Vendido' | 'Inactivo'

export type TipoVehiculo =
  | 'Automovil'
  | 'Camioneta'
  | 'Suv'
  | 'Pickup'
  | 'Van'
  | 'Camion'
  | 'Motocicleta'
  | 'Bus'

export type TipoCombustible =
  | 'Gasolina'
  | 'Diesel'
  | 'Gas'
  | 'Hibrido'
  | 'Electrico'
  | 'HibridoEnchufable'

export type TipoTransmision = 'Manual' | 'Automatica' | 'Secuencial' | 'CVT'

/** Los nombres comerciales («AWD», «4x4», «4x2») llegan como etiqueta del catálogo. */
export type TipoTraccion = 'Awd' | 'CuatroPorCuatro' | 'CuatroPorDos'

export type TipoDocumento =
  | 'CedulaCiudadania'
  | 'CedulaExtranjeria'
  | 'Pasaporte'
  | 'Nit'
  | 'Ppt'

export interface UsuarioAutenticado {
  id: string
  nombres: string
  apellidos: string
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  /** Correo de recuperación. Nulo mientras el usuario no lo haya registrado. */
  email?: string
  rol: RolUsuario
  empresaId: string
  empresaNombre: string
  convenioId: string
  convenioNombre: string
  /** Un administrador fijó su contraseña: debe cambiarla antes de usar la aplicación. */
  debeCambiarPassword: boolean
}

export interface AuthResponse {
  accessToken: string
  accessTokenExpiraEn: string
  refreshToken: string
  usuario: UsuarioAutenticado
}

export interface ResultadoPaginado<T> {
  items: T[]
  pagina: number
  tamanoPagina: number
  totalRegistros: number
  totalPaginas: number
  tienePaginaAnterior: boolean
  tienePaginaSiguiente: boolean
}

export interface VehiculoLista {
  id: string
  placa: string
  marca: string
  linea: string
  version?: string
  modelo: number
  color: string
  kilometraje: number
  precio: number
  precioNegociable: boolean
  tipoVehiculo: TipoVehiculo
  combustible: TipoCombustible
  /** Opcional: hay vehículos cargados sin transmisión. */
  transmision?: TipoTransmision
  ciudad?: string
  esBlindado: boolean
  estado: EstadoVehiculo
  imagenPrincipal?: string
  /** Galería completa y ordenada, para el carrusel de la tarjeta. */
  imagenes: string[]
  empresaNombre: string
  publicadoPor: string
  fechaCreacion: string
  fechaPublicacion?: string
}

export interface VehiculoImagen {
  id: string
  url: string
  esPrincipal: boolean
  orden: number
}

// El detalle trae la galería como objetos completos (id, orden, principal), no como URLs sueltas.
export interface VehiculoDetalle extends Omit<VehiculoLista, 'imagenPrincipal' | 'imagenes'> {
  marcaId: string
  lineaId: string
  /** Solo viaja en el detalle: el listado no la necesita. */
  traccion?: TipoTraccion
  cilindraje?: number
  numeroPuertas?: number
  capacidadPasajeros?: number
  ciudadMatricula?: string
  /** Formato `YYYY-MM-DD`: la API los serializa como `DateOnly`. */
  vencimientoSoat?: string
  /** El documento está vencido y no se registró fecha. */
  soatVencido: boolean
  vencimientoTecnomecanica?: string
  tecnomecanicaVencida: boolean
  tienePrenda: boolean
  descripcion?: string
  empresaId: string
  empresaTelefono?: string
  convenioId: string
  convenioNombre: string
  publicadoPorUsuarioId: string
  publicadoPorTelefono?: string
  publicadoPorEmail: string
  fechaActualizacion?: string
  imagenes: VehiculoImagen[]
}

export interface Marca {
  id: string
  nombre: string
}

export interface Linea {
  id: string
  marcaId: string
  nombre: string
}

export interface Empresa {
  id: string
  nombre: string
  nit: string
  ciudad?: string
}

export interface Opcion {
  valor: number
  nombre: string
  etiqueta: string
}

export interface OpcionesVehiculo {
  tiposVehiculo: Opcion[]
  combustibles: Opcion[]
  transmisiones: Opcion[]
  tracciones: Opcion[]
  estados: Opcion[]
}

/** Formato ProblemDetails que devuelve la API en los errores. */
export interface ProblemDetails {
  title?: string
  status?: number
  detail?: string
  instance?: string
  codigo?: string
  errors?: Record<string, string[]>
  errores?: Record<string, string[]>
}
