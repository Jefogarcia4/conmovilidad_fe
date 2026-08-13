import { useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Loader2, Pencil, Plus, Power, PowerOff, Search, Upload, X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { adminConvenios, adminEmpresas, adminUsuarios, type UsuarioAdmin } from '@/api/admin'
import type { RolUsuario, TipoDocumento } from '@/api/types'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { CampoFormulario } from '@/components/ui/CampoFormulario'
import { ComboBox } from '@/components/ui/ComboBox'
import { clasesControl } from '@/components/ui/estilosControl'
import { Modal } from '@/components/ui/Modal'
import { Paginacion } from '@/components/ui/Paginacion'
import { cn } from '@/lib/utils'
import {
  BotonFila,
  Celda,
  EncabezadoTabla,
  EstadoVacio,
  EtiquetaEstado,
  FilaTabla,
  TablaAdmin,
  type OrdenTabla,
} from './componentes'
import { ImportarUsuarios } from './ImportarUsuarios'

/** Filas por página. Entran de sobra en una pantalla sin obligar a desplazarse. */
const POR_PAGINA = 15

/**
 * `valor` es el nombre del rol en la API y no se toca; `etiqueta` es lo que lee el usuario. El rol
 * base se llama `Asesor` internamente pero en pantalla es «Empleado», igual que en la plantilla
 * de carga masiva.
 */
const ROLES: { valor: RolUsuario; etiqueta: string }[] = [
  { valor: 'Asesor', etiqueta: 'Empleado' },
  { valor: 'AdministradorConvenio', etiqueta: 'Administrador de convenio' },
  { valor: 'SuperAdministrador', etiqueta: 'Superadministrador' },
]

const TIPOS_DOCUMENTO: { valor: TipoDocumento; etiqueta: string }[] = [
  { valor: 'CedulaCiudadania', etiqueta: 'Cédula de ciudadanía' },
  { valor: 'CedulaExtranjeria', etiqueta: 'Cédula de extranjería' },
  { valor: 'Pasaporte', etiqueta: 'Pasaporte' },
  { valor: 'Nit', etiqueta: 'NIT' },
  { valor: 'Ppt', etiqueta: 'Permiso por Protección Temporal' },
]

// Solo longitud: sin exigencias de composición. Debe coincidir con `ReglasPassword` de la API.
const reglasPassword = z.string().min(6, 'Debe tener al menos 6 caracteres.')

const esquemaBase = {
  nombres: z.string().trim().min(1, 'Los nombres son obligatorios.').max(100),
  apellidos: z.string().trim().min(1, 'Los apellidos son obligatorios.').max(100),
  tipoDocumento: z.string().min(1, 'Selecciona el tipo de documento.'),
  numeroDocumento: z
    .string()
    .trim()
    .min(1, 'El número de documento es obligatorio.')
    .max(30)
    .regex(/^[A-Za-z0-9.-]+$/, 'Solo letras, números, puntos y guiones.'),
  telefono: z.string().trim().max(30).optional(),
  rol: z.string().min(1, 'Selecciona el rol.'),
  convenioId: z.string().min(1, 'Selecciona el convenio.'),
  empresaId: z.string().min(1, 'Selecciona la empresa.'),
}

const esquemaCrear = z.object({ ...esquemaBase, passwordInicial: reglasPassword })

const esquemaEditar = z.object(esquemaBase)

type FormularioCrear = z.infer<typeof esquemaCrear>

const ESTADOS = [
  { valor: 'activos', etiqueta: 'Activos' },
  { valor: 'inactivos', etiqueta: 'Inactivos' },
  { valor: 'sin_activar', etiqueta: 'Sin activar' },
]

const FILTROS_VACIOS = { busqueda: '', convenioId: '', rol: '', estado: '' }

type Filtros = typeof FILTROS_VACIOS

/** Etiqueta sobre cada control de la barra de filtros. */
function CampoFiltro({
  etiqueta,
  htmlFor,
  children,
}: {
  etiqueta: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-medium text-muted-foreground">
        {etiqueta}
      </label>
      {children}
    </div>
  )
}

export function UsuariosPage() {
  const clienteConsultas = useQueryClient()
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS)
  const [orden, setOrden] = useState<OrdenTabla>({ clave: 'usuario', ascendente: true })
  const [pagina, setPagina] = useState(1)
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null)
  const [creando, setCreando] = useState(false)
  const [restableciendo, setRestableciendo] = useState<UsuarioAdmin | null>(null)
  const [importando, setImportando] = useState(false)

  const { data: convenios } = useQuery({
    queryKey: ['admin', 'convenios'],
    queryFn: adminConvenios.listar,
  })

  // Se traen todos y se filtra aquí: así escribir en el buscador es instantáneo y los resultados
  // abarcan el listado completo, no solo la página que se está viendo.
  const { data: usuarios, isPending, error } = useQuery({
    queryKey: ['admin', 'usuarios'],
    queryFn: () => adminUsuarios.listarTodos(),
  })

  const estado = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      adminUsuarios.cambiarEstado(id, activo),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: ['admin'] }),
  })

  const opcionesConvenio = (convenios ?? []).map((c) => ({ valor: c.id, etiqueta: c.nombre }))

  /** Cualquier cambio de filtro devuelve a la primera página: la 4 puede ya no existir. */
  const cambiarFiltro = (cambio: Partial<Filtros>) => {
    setFiltros((f) => ({ ...f, ...cambio }))
    setPagina(1)
  }

  const alternarOrden = (clave: string) => {
    setOrden((o) => ({ clave, ascendente: o.clave === clave ? !o.ascendente : true }))
    setPagina(1)
  }

  const hayFiltros = Object.values(filtros).some(Boolean)

  const filtrados = useMemo(() => {
    const termino = filtros.busqueda.trim().toLowerCase()

    const coincide = (u: UsuarioAdmin) => {
      if (filtros.convenioId && u.convenioId !== filtros.convenioId) return false
      if (filtros.rol && u.rol !== filtros.rol) return false
      if (filtros.estado === 'activos' && !u.activo) return false
      if (filtros.estado === 'inactivos' && u.activo) return false
      if (filtros.estado === 'sin_activar' && !u.debeCambiarPassword) return false
      if (!termino) return true

      // Se busca por todo lo que alguien puede tener a mano para localizar a una persona.
      return [u.nombres, u.apellidos, u.numeroDocumento, u.email, u.telefono, u.empresaNombre]
        .some((campo) => campo?.toLowerCase().includes(termino))
    }

    const valor = (u: UsuarioAdmin): string | number => {
      switch (orden.clave) {
        case 'rol':
          return u.rol
        case 'empresa':
          return u.empresaNombre
        case 'convenio':
          return u.convenioNombre
        case 'vehiculos':
          return u.totalVehiculos
        case 'estado':
          return Number(u.activo)
        default:
          return `${u.nombres} ${u.apellidos}`
      }
    }

    return usuarios
      ?.filter(coincide)
      .sort((a, b) => {
        const [x, y] = [valor(a), valor(b)]

        const comparacion =
          typeof x === 'number' && typeof y === 'number'
            ? x - y
            : // `localeCompare` para que los acentos y las mayúsculas no alteren el alfabeto.
              String(x).localeCompare(String(y), 'es', { sensitivity: 'base' })

        return orden.ascendente ? comparacion : -comparacion
      })
  }, [usuarios, filtros, orden])

  const total = filtrados?.length ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  // Si al filtrar quedan menos páginas que la actual, se muestra la última en vez de una vacía.
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = filtrados?.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Boton variante="secundario" onClick={() => setImportando(true)}>
          <Upload className="size-4" aria-hidden />
          Cargar desde archivo
        </Boton>

        <Boton onClick={() => setCreando(true)}>
          <Plus className="size-4" aria-hidden />
          Nuevo usuario
        </Boton>
      </div>

      <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <CampoFiltro etiqueta="Buscar" htmlFor="buscar-usuario">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />

              <input
                id="buscar-usuario"
                type="search"
                value={filtros.busqueda}
                onChange={(e) => cambiarFiltro({ busqueda: e.target.value })}
                placeholder="Nombre, documento, correo, celular o empresa"
                className={cn(clasesControl, 'border-input pl-9')}
              />
            </div>
          </CampoFiltro>

          <CampoFiltro etiqueta="Convenio" htmlFor="filtro-conv-usuarios">
            <ComboBox
              id="filtro-conv-usuarios"
              valor={filtros.convenioId}
              onCambio={(v) => cambiarFiltro({ convenioId: v })}
              textoVacio="Todos"
              opciones={opcionesConvenio}
            />
          </CampoFiltro>

          <CampoFiltro etiqueta="Rol" htmlFor="filtro-rol-usuarios">
            <ComboBox
              id="filtro-rol-usuarios"
              valor={filtros.rol}
              onCambio={(v) => cambiarFiltro({ rol: v })}
              textoVacio="Todos"
              opciones={ROLES.map((r) => ({ valor: r.valor, etiqueta: r.etiqueta }))}
            />
          </CampoFiltro>

          <CampoFiltro etiqueta="Estado" htmlFor="filtro-estado-usuarios">
            <ComboBox
              id="filtro-estado-usuarios"
              valor={filtros.estado}
              onCambio={(v) => cambiarFiltro({ estado: v })}
              textoVacio="Todos"
              opciones={ESTADOS}
            />
          </CampoFiltro>
        </div>

        {hayFiltros && (
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-sm text-muted-foreground">
              {total} {total === 1 ? 'usuario coincide' : 'usuarios coinciden'} con los filtros
            </p>

            <button
              type="button"
              onClick={() => {
                setFiltros(FILTROS_VACIOS)
                setPagina(1)
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-cta transition-colors hover:underline"
            >
              <X className="size-3.5" aria-hidden />
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {error && <Alerta>{(error as Error).message}</Alerta>}
      {estado.error && <Alerta>{(estado.error as Error).message}</Alerta>}

      {isPending ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" aria-label="Cargando" />
        </div>
      ) : visibles && visibles.length > 0 ? (
        <TablaAdmin>
          <EncabezadoTabla
            orden={orden}
            onOrdenar={alternarOrden}
            columnas={[
              { texto: 'Usuario', clave: 'usuario' },
              { texto: 'Rol', clave: 'rol' },
              { texto: 'Empresa', clave: 'empresa' },
              { texto: 'Convenio', clave: 'convenio' },
              { texto: 'Vehículos', derecha: true, clave: 'vehiculos' },
              { texto: 'Estado', clave: 'estado' },
              { texto: 'Acciones', derecha: true },
            ]}
          />

          <tbody>
            {visibles.map((u) => (
              <FilaTabla key={u.id} atenuada={!u.activo}>
                <Celda>
                  <p className="font-medium text-foreground">
                    {u.nombres} {u.apellidos}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {u.numeroDocumento}
                    {u.email && ` · ${u.email}`}
                  </p>
                </Celda>

                <Celda apagada>
                  {ROLES.find((r) => r.valor === u.rol)?.etiqueta ?? u.rol}
                </Celda>

                <Celda apagada>{u.empresaNombre}</Celda>
                <Celda apagada>{u.convenioNombre}</Celda>
                <Celda derecha apagada>{u.totalVehiculos}</Celda>

                <Celda>
                  <div className="flex flex-col items-start gap-1">
                    <EtiquetaEstado activo={u.activo} />
                    {u.debeCambiarPassword && (
                      <span className="text-xs text-muted-foreground">Sin activar</span>
                    )}
                  </div>
                </Celda>

                <Celda derecha>
                  <div className="flex items-center justify-end gap-1">
                    <BotonFila etiqueta={`Editar ${u.nombres}`} onClick={() => setEditando(u)}>
                      <Pencil className="size-4" aria-hidden />
                    </BotonFila>

                    <BotonFila
                      etiqueta={`Restablecer contraseña de ${u.nombres}`}
                      onClick={() => setRestableciendo(u)}
                    >
                      <KeyRound className="size-4" aria-hidden />
                    </BotonFila>

                    <BotonFila
                      etiqueta={`${u.activo ? 'Desactivar' : 'Activar'} ${u.nombres}`}
                      destructivo={u.activo}
                      disabled={estado.isPending}
                      onClick={() => estado.mutate({ id: u.id, activo: !u.activo })}
                    >
                      {u.activo ? (
                        <PowerOff className="size-4" aria-hidden />
                      ) : (
                        <Power className="size-4" aria-hidden />
                      )}
                    </BotonFila>
                  </div>
                </Celda>
              </FilaTabla>
            ))}
          </tbody>
        </TablaAdmin>
      ) : (
        !error && (
          <EstadoVacio
            // Distinguir los dos casos evita que alguien crea que no hay usuarios cuando lo que
            // pasa es que su búsqueda no encontró nada.
            mensaje={
              hayFiltros
                ? 'Ningún usuario coincide con los filtros aplicados.'
                : 'Todavía no hay usuarios registrados.'
            }
          />
        )
      )}

      {visibles && visibles.length > 0 && (
        <Paginacion
          pagina={paginaActual}
          totalPaginas={totalPaginas}
          totalRegistros={total}
          onCambiar={setPagina}
          nombre="usuario"
        />
      )}

      {(creando || editando) && (
        <FormularioUsuario
          usuario={editando}
          opcionesConvenio={opcionesConvenio}
          onCerrar={() => {
            setEditando(null)
            setCreando(false)
          }}
        />
      )}

      {restableciendo && (
        <RestablecerPassword usuario={restableciendo} onCerrar={() => setRestableciendo(null)} />
      )}

      {importando && <ImportarUsuarios onCerrar={() => setImportando(false)} />}
    </div>
  )
}

function FormularioUsuario({
  usuario,
  opcionesConvenio,
  onCerrar,
}: {
  usuario: UsuarioAdmin | null
  opcionesConvenio: { valor: string; etiqueta: string }[]
  onCerrar: () => void
}) {
  const clienteConsultas = useQueryClient()
  const esEdicion = usuario !== null

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormularioCrear>({
    resolver: zodResolver(esEdicion ? esquemaEditar : esquemaCrear) as never,
    defaultValues: {
      nombres: usuario?.nombres ?? '',
      apellidos: usuario?.apellidos ?? '',
      tipoDocumento: usuario?.tipoDocumento ?? 'CedulaCiudadania',
      numeroDocumento: usuario?.numeroDocumento ?? '',
      telefono: usuario?.telefono ?? '',
      rol: usuario?.rol ?? 'Asesor',
      convenioId: usuario?.convenioId ?? '',
      empresaId: usuario?.empresaId ?? '',
      passwordInicial: '',
    },
  })

  const convenioId = watch('convenioId')

  // El usuario se asigna a una empresa, y de ella hereda el convenio: por eso se elige primero
  // el convenio y luego una de sus empresas.
  const { data: empresas } = useQuery({
    queryKey: ['admin', 'empresas', convenioId],
    queryFn: () => adminEmpresas.listar(convenioId),
    enabled: Boolean(convenioId),
  })

  const guardar = useMutation({
    mutationFn: (datos: FormularioCrear) =>
      usuario
        ? adminUsuarios.actualizar(usuario.id, {
            nombres: datos.nombres,
            apellidos: datos.apellidos,
            tipoDocumento: datos.tipoDocumento as TipoDocumento,
            numeroDocumento: datos.numeroDocumento,
            telefono: datos.telefono || undefined,
            rol: datos.rol as RolUsuario,
            empresaId: datos.empresaId,
          })
        : adminUsuarios.crear({
            nombres: datos.nombres,
            apellidos: datos.apellidos,
            tipoDocumento: datos.tipoDocumento as TipoDocumento,
            numeroDocumento: datos.numeroDocumento,
            telefono: datos.telefono || undefined,
            rol: datos.rol as RolUsuario,
            empresaId: datos.empresaId,
            passwordInicial: datos.passwordInicial,
          }),
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ['admin'] })
      onCerrar()
    },
  })

  return (
    <Modal
      titulo={esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
      descripcion="El convenio se asigna a través de la empresa a la que pertenece el usuario."
      onCerrar={onCerrar}
      bloqueado={guardar.isPending}
      ancho="lg"
      pie={
        <>
          <Boton variante="secundario" type="button" onClick={onCerrar} disabled={guardar.isPending}>
            Cancelar
          </Boton>
          <Boton type="submit" form="form-usuario" cargando={guardar.isPending}>
            {esEdicion ? 'Guardar cambios' : 'Crear usuario'}
          </Boton>
        </>
      }
    >
      <form
        id="form-usuario"
        onSubmit={handleSubmit((datos) => guardar.mutateAsync(datos))}
        noValidate
        className="grid gap-4 sm:grid-cols-2"
      >
        {guardar.error && (
          <div className="sm:col-span-2">
            <Alerta>{(guardar.error as Error).message}</Alerta>
          </div>
        )}

        <CampoFormulario etiqueta="Nombres" htmlFor="nombres" requerido error={errors.nombres?.message}>
          <input
            id="nombres"
            {...register('nombres')}
            className={cn(clasesControl, errors.nombres ? 'border-destructive' : 'border-input')}
          />
        </CampoFormulario>

        <CampoFormulario etiqueta="Apellidos" htmlFor="apellidos" requerido error={errors.apellidos?.message}>
          <input
            id="apellidos"
            {...register('apellidos')}
            className={cn(clasesControl, errors.apellidos ? 'border-destructive' : 'border-input')}
          />
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Tipo de documento"
          htmlFor="tipo-documento"
          requerido
          error={errors.tipoDocumento?.message}
        >
          <Controller
            control={control}
            name="tipoDocumento"
            render={({ field }) => (
              <ComboBox
                id="tipo-documento"
                valor={field.value ?? ''}
                onCambio={field.onChange}
                textoVacio="Selecciona el tipo"
                invalido={Boolean(errors.tipoDocumento)}
                opciones={TIPOS_DOCUMENTO.map((t) => ({ valor: t.valor, etiqueta: t.etiqueta }))}
              />
            )}
          />
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Número de documento"
          htmlFor="numero-documento"
          requerido
          error={errors.numeroDocumento?.message}
          ayuda="Con este número inicia sesión el usuario."
        >
          <input
            id="numero-documento"
            inputMode="numeric"
            {...register('numeroDocumento')}
            placeholder="1020304050"
            className={cn(
              clasesControl,
              errors.numeroDocumento ? 'border-destructive' : 'border-input',
            )}
          />
        </CampoFormulario>

        <CampoFormulario etiqueta="Teléfono" htmlFor="telefono-usuario" error={errors.telefono?.message}>
          <input
            id="telefono-usuario"
            {...register('telefono')}
            placeholder="+57 300 123 4567"
            className={cn(clasesControl, 'border-input')}
          />
        </CampoFormulario>

        <CampoFormulario etiqueta="Rol" htmlFor="rol" requerido error={errors.rol?.message}>
          <Controller
            control={control}
            name="rol"
            render={({ field }) => (
              <ComboBox
                id="rol"
                valor={field.value ?? ''}
                onCambio={field.onChange}
                textoVacio="Selecciona el rol"
                invalido={Boolean(errors.rol)}
                opciones={ROLES.map((r) => ({ valor: r.valor, etiqueta: r.etiqueta }))}
              />
            )}
          />
        </CampoFormulario>

        <CampoFormulario etiqueta="Convenio" htmlFor="convenio-usuario" requerido error={errors.convenioId?.message}>
          <Controller
            control={control}
            name="convenioId"
            render={({ field }) => (
              <ComboBox
                id="convenio-usuario"
                valor={field.value ?? ''}
                onCambio={(v) => {
                  field.onChange(v)
                  // La empresa elegida pertenecía al convenio anterior.
                  setValue('empresaId', '')
                }}
                textoVacio="Selecciona el convenio"
                invalido={Boolean(errors.convenioId)}
                opciones={opcionesConvenio}
              />
            )}
          />
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Empresa"
          htmlFor="empresa-usuario"
          requerido
          error={errors.empresaId?.message}
          ayuda={convenioId ? undefined : 'Selecciona primero el convenio.'}
          className="sm:col-span-2"
        >
          <Controller
            control={control}
            name="empresaId"
            render={({ field }) => (
              <ComboBox
                id="empresa-usuario"
                valor={field.value ?? ''}
                onCambio={field.onChange}
                deshabilitado={!convenioId}
                textoVacio="Selecciona la empresa"
                invalido={Boolean(errors.empresaId)}
                opciones={(empresas ?? []).map((e) => ({ valor: e.id, etiqueta: e.nombre }))}
              />
            )}
          />
        </CampoFormulario>

        {!esEdicion && (
          <div className="sm:col-span-2">
            <CampoFormulario
              etiqueta="Contraseña inicial"
              htmlFor="password-inicial"
              requerido
              error={errors.passwordInicial?.message}
              ayuda="El usuario deberá cambiarla la primera vez que entre."
            >
              <input
                id="password-inicial"
                type="text"
                autoComplete="off"
                {...register('passwordInicial')}
                className={cn(
                  clasesControl,
                  errors.passwordInicial ? 'border-destructive' : 'border-input',
                )}
              />
            </CampoFormulario>
          </div>
        )}
      </form>
    </Modal>
  )
}

function RestablecerPassword({
  usuario,
  onCerrar,
}: {
  usuario: UsuarioAdmin
  onCerrar: () => void
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | undefined>()

  const restablecer = useMutation({
    mutationFn: () => adminUsuarios.restablecerPassword(usuario.id, password),
    onSuccess: onCerrar,
  })

  const enviar = () => {
    const resultado = reglasPassword.safeParse(password)

    if (!resultado.success) {
      setError(resultado.error.issues[0]?.message)
      return
    }

    setError(undefined)
    restablecer.mutate()
  }

  return (
    <Modal
      titulo="Restablecer contraseña"
      descripcion={`Se fijará una contraseña nueva para ${usuario.nombres} ${usuario.apellidos}.`}
      onCerrar={onCerrar}
      bloqueado={restablecer.isPending}
      pie={
        <>
          <Boton
            variante="secundario"
            type="button"
            onClick={onCerrar}
            disabled={restablecer.isPending}
          >
            Cancelar
          </Boton>
          <Boton onClick={enviar} cargando={restablecer.isPending}>
            Restablecer
          </Boton>
        </>
      }
    >
      <div className="space-y-4">
        {restablecer.error && <Alerta>{(restablecer.error as Error).message}</Alerta>}

        <Campo
          etiqueta="Contraseña nueva"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          conRevelarPassword
          type="password"
          autoComplete="new-password"
          error={error}
        />

        <p className="text-xs text-muted-foreground">
          Se cerrarán las sesiones abiertas del usuario y se le pedirá cambiarla al volver a entrar.
        </p>
      </div>
    </Modal>
  )
}
