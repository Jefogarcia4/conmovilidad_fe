import { api, queryString } from './cliente'
import type { RolUsuario, TipoDocumento } from './types'

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

export interface ErrorImportacion {
  fila: number
  columna: string
  mensaje: string
}

export interface ResultadoImportacion {
  exito: boolean
  filasLeidas: number
  usuariosCreados: number
  errores: ErrorImportacion[]
  /** Nombre y documento de cada usuario dado de alta. */
  creados: string[]
}

export const adminUsuarios = {
  listar: (filtro: { convenioId?: string; empresaId?: string } = {}) =>
    api.get<UsuarioAdmin[]>(`/admin/usuarios${queryString(filtro)}`),
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
