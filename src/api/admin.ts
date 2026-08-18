import { api, queryString } from './cliente'
import type { EstadoPago } from './pagos'
import type { ResultadoPaginado, RolUsuario, TipoDocumento } from './types'

export interface ConvenioAdmin {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  activo: boolean
  totalEmpresas: number
  totalUsuarios: number
  totalVehiculos: number
  fechaCreacion: string
}

export interface EmpresaAdmin {
  id: string
  convenioId: string
  convenioNombre: string
  nit: string
  nombre: string
  telefono?: string
  direccion?: string
  ciudad?: string
  activo: boolean
  totalUsuarios: number
  totalVehiculos: number
  fechaCreacion: string
}

export interface UsuarioAdmin {
  id: string
  nombres: string
  apellidos: string
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  /** Correo de recuperación. Lo registra el propio usuario al activar su cuenta. */
  email?: string
  telefono?: string
  rol: RolUsuario
  empresaId: string
  empresaNombre: string
  convenioId: string
  convenioNombre: string
  activo: boolean
  debeCambiarPassword: boolean
  totalVehiculos: number
  ultimoAcceso?: string
  fechaCreacion: string
}

export interface GuardarConvenioRequest {
  codigo: string
  nombre: string
  descripcion?: string
}

export interface GuardarEmpresaRequest {
  convenioId: string
  nit: string
  nombre: string
  telefono?: string
  direccion?: string
  ciudad?: string
}

export interface CrearUsuarioRequest {
  nombres: string
  apellidos: string
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  telefono?: string
  rol: RolUsuario
  empresaId: string
  passwordInicial: string
}

export interface ActualizarUsuarioRequest {
  nombres: string
  apellidos: string
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  telefono?: string
  rol: RolUsuario
  empresaId: string
}

export const adminConvenios = {
  listar: () => api.get<ConvenioAdmin[]>('/admin/convenios'),
  crear: (datos: GuardarConvenioRequest) => api.post<ConvenioAdmin>('/admin/convenios', datos),
  actualizar: (id: string, datos: GuardarConvenioRequest) =>
    api.put<ConvenioAdmin>(`/admin/convenios/${id}`, datos),
  cambiarEstado: (id: string, activo: boolean) =>
    api.patch<void>(`/admin/convenios/${id}/estado`, { activo }),
}

export const adminEmpresas = {
  listar: (convenioId?: string) =>
    api.get<EmpresaAdmin[]>(`/admin/empresas${queryString({ convenioId })}`),
  crear: (datos: GuardarEmpresaRequest) => api.post<EmpresaAdmin>('/admin/empresas', datos),
  actualizar: (id: string, datos: GuardarEmpresaRequest) =>
    api.put<EmpresaAdmin>(`/admin/empresas/${id}`, datos),
  cambiarEstado: (id: string, activo: boolean) =>
    api.patch<void>(`/admin/empresas/${id}/estado`, { activo }),
}

export interface TarifaAdmin {
  id: string
  /** Nulo en la tarifa global de la plataforma. */
  convenioId?: string
  convenioNombre?: string
  precio: number
  moneda: string
  /** Con el cobro desactivado se publica sin pasar por la pasarela. */
  cobroActivo: boolean
  fechaActualizacion?: string
}

export interface GuardarTarifaRequest {
  precio: number
  cobroActivo: boolean
}

export interface PagoAdmin {
  id: string
  vehiculoId: string
  placa: string
  vehiculoDescripcion: string
  convenioId: string
  convenioNombre: string
  empresaNombre: string
  usuarioNombre: string
  referencia: string
  monto: number
  moneda: string
  estado: EstadoPago
  estadoProveedor?: string
  metodoPago?: string
  fechaCreacion: string
  fechaAprobacion?: string
}

export interface FiltroPagosAdmin {
  convenioId?: string
  estado?: EstadoPago
  pagina?: number
  tamanoPagina?: number
}

export const adminTarifas = {
  listar: () => api.get<TarifaAdmin[]>('/admin/tarifas'),

  guardarGlobal: (datos: GuardarTarifaRequest) =>
    api.put<TarifaAdmin>('/admin/tarifas/global', datos),

  guardarConvenio: (convenioId: string, datos: GuardarTarifaRequest) =>
    api.put<TarifaAdmin>(`/admin/tarifas/convenios/${convenioId}`, datos),

  /** Retira la tarifa propia del convenio: vuelve a regirse por la global. */
  eliminarConvenio: (convenioId: string) =>
    api.delete<void>(`/admin/tarifas/convenios/${convenioId}`),
}

export const adminPagos = {
  listar: (filtro: FiltroPagosAdmin = {}) =>
    api.get<ResultadoPaginado<PagoAdmin>>(`/admin/pagos${queryString(filtro)}`),
}

export interface ErrorImportacion {
  fila: number
  columna: string
  mensaje: string
}

export interface ResultadoImportacion {
  exito: boolean
  filasLeidas: number
  usuariosCreados: number
  /** Primeros errores encontrados; el total va en `totalErrores`. */
  errores: ErrorImportacion[]
  totalErrores: number
  /** Nombre y documento de los primeros usuarios dados de alta; el total, en `usuariosCreados`. */
  creados: string[]
}

export interface FiltroUsuarios {
  convenioId?: string
  empresaId?: string
  incluirInactivos?: boolean
  pagina?: number
  tamanoPagina?: number
}

/** Tope que impone la API por página; pedir más no trae más. */
const MAXIMO_POR_PAGINA = 100

export const adminUsuarios = {
  listar: (filtro: FiltroUsuarios = {}) =>
    api.get<ResultadoPaginado<UsuarioAdmin>>(`/admin/usuarios${queryString(filtro)}`),

  /**
   * Trae el listado completo encadenando páginas.
   *
   * El portal filtra y ordena en el navegador, así que necesita todos los usuarios y no solo los
   * de una página: buscar sobre lo que hay a la vista devolvería resultados falsos. Con unos
   * cientos de usuarios son dos o tres llamadas y el filtrado queda instantáneo; si la plataforma
   * llegara a decenas de miles, esto debería pasar a filtrarse en el servidor.
   */
  listarTodos: async (filtro: Omit<FiltroUsuarios, 'pagina' | 'tamanoPagina'> = {}) => {
    const todos: UsuarioAdmin[] = []

    for (let pagina = 1; ; pagina++) {
      const respuesta = await adminUsuarios.listar({
        ...filtro,
        pagina,
        tamanoPagina: MAXIMO_POR_PAGINA,
      })

      todos.push(...respuesta.items)

      // La segunda condición es la red de seguridad: si la API devolviera páginas vacías sin
      // agotar el total, el bucle no debe quedarse girando.
      if (pagina >= respuesta.totalPaginas || respuesta.items.length === 0) break
    }

    return todos
  },
  crear: (datos: CrearUsuarioRequest) => api.post<UsuarioAdmin>('/admin/usuarios', datos),
  actualizar: (id: string, datos: ActualizarUsuarioRequest) =>
    api.put<UsuarioAdmin>(`/admin/usuarios/${id}`, datos),
  cambiarEstado: (id: string, activo: boolean) =>
    api.patch<void>(`/admin/usuarios/${id}/estado`, { activo }),
  restablecerPassword: (id: string, passwordNuevo: string) =>
    api.post<void>(`/admin/usuarios/${id}/restablecer-password`, { passwordNuevo }),

  importar: (archivo: File) => {
    const cuerpo = new FormData()
    cuerpo.append('archivo', archivo)

    return api.post<ResultadoImportacion>('/admin/usuarios/importar', cuerpo)
  },

  /**
   * La plantilla no puede pedirse con un `<a href>` porque la ruta exige el token de sesión:
   * se descarga con el cliente autenticado y se entrega como blob.
   */
  descargarPlantilla: async (formato: 'csv' | 'xlsx') => {
    const blob = await api.getBlob(`/admin/usuarios/plantilla?formato=${formato}`)
    const url = URL.createObjectURL(blob)

    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `plantilla-usuarios.${formato}`
    enlace.click()

    URL.revokeObjectURL(url)
  },
}
