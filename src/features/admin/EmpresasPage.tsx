import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Pencil, Plus, Power, PowerOff } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { adminConvenios, adminEmpresas, type EmpresaAdmin } from '@/api/admin'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { CampoFormulario } from '@/components/ui/CampoFormulario'
import { ComboBox } from '@/components/ui/ComboBox'
import { clasesControl } from '@/components/ui/estilosControl'
import { Modal } from '@/components/ui/Modal'
import { comparable, soloDigitos } from '@/lib/texto'
import { cn } from '@/lib/utils'
import {
  BotonFila,
  CampoFiltro,
  Celda,
  EncabezadoTabla,
  EstadoVacio,
  EtiquetaEstado,
  FilaTabla,
  TablaAdmin,
} from './componentes'

const esquema = z.object({
  convenioId: z.string().min(1, 'Selecciona el convenio.'),
  nit: z
    .string()
    .trim()
    .min(1, 'El NIT es obligatorio.')
    .max(30)
    .regex(/^[0-9.-]+$/, 'Solo números, puntos y guiones.'),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.').max(150),
  telefono: z.string().trim().max(30).optional(),
  direccion: z.string().trim().max(200).optional(),
  ciudad: z.string().trim().max(100).optional(),
})

type Formulario = z.infer<typeof esquema>

export function EmpresasPage() {
  const clienteConsultas = useQueryClient()
  const [convenioFiltro, setConvenioFiltro] = useState('')
  const [nombreFiltro, setNombreFiltro] = useState('')
  const [nitFiltro, setNitFiltro] = useState('')
  const [editando, setEditando] = useState<EmpresaAdmin | null>(null)
  const [creando, setCreando] = useState(false)

  const { data: convenios } = useQuery({
    queryKey: ['admin', 'convenios'],
    queryFn: adminConvenios.listar,
  })

  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'empresas', convenioFiltro],
    queryFn: () => adminEmpresas.listar(convenioFiltro || undefined),
  })

  const estado = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      adminEmpresas.cambiarEstado(id, activo),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: ['admin'] }),
  })

  const opcionesConvenio = (convenios ?? []).map((c) => ({ valor: c.id, etiqueta: c.nombre }))
  const sinConvenios = convenios !== undefined && convenios.length === 0

  /**
   * El convenio lo filtra la API; el nombre y el NIT, aquí. El listado llega completo y son unos
   * cientos de filas: filtrar en el navegador responde al instante y no hay que tocar el endpoint.
   *
   * El nombre se compara sin acentos —«exito» encuentra «GRUPO ÉXITO»— y el NIT solo por sus
   * dígitos, porque unos lo escriben con puntos y otros sin ellos.
   */
  const visibles = useMemo(() => {
    const nombre = comparable(nombreFiltro.trim())
    const nit = soloDigitos(nitFiltro)

    return (data ?? []).filter(
      (e) =>
        (!nombre || comparable(e.nombre).includes(nombre)) &&
        (!nit || soloDigitos(e.nit).includes(nit)),
    )
  }, [data, nombreFiltro, nitFiltro])

  const hayFiltrosDeTexto = Boolean(nombreFiltro.trim() || nitFiltro.trim())

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid w-full flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CampoFiltro etiqueta="Convenio" htmlFor="filtro-convenio">
            <ComboBox
              id="filtro-convenio"
              valor={convenioFiltro}
              onCambio={setConvenioFiltro}
              textoVacio="Todos los convenios"
              opciones={opcionesConvenio}
            />
          </CampoFiltro>

          <CampoFiltro etiqueta="Nombre" htmlFor="filtro-nombre">
            <input
              id="filtro-nombre"
              value={nombreFiltro}
              onChange={(ev) => setNombreFiltro(ev.target.value)}
              placeholder="Buscar por nombre"
              className={cn(clasesControl, 'border-input')}
            />
          </CampoFiltro>

          <CampoFiltro etiqueta="NIT" htmlFor="filtro-nit">
            <input
              id="filtro-nit"
              value={nitFiltro}
              onChange={(ev) => setNitFiltro(ev.target.value)}
              inputMode="numeric"
              placeholder="Buscar por NIT"
              className={cn(clasesControl, 'border-input')}
            />
          </CampoFiltro>
        </div>

        <Boton onClick={() => setCreando(true)} disabled={sinConvenios}>
          <Plus className="size-4" aria-hidden />
          Nueva empresa
        </Boton>
      </div>

      {/* Cuántas se están viendo: con filtros puestos, una tabla corta puede confundirse con
          que hay pocas empresas. */}
      {!isPending && data && (
        <p className="text-xs text-muted-foreground">
          {visibles.length === data.length
            ? `${data.length} empresa${data.length === 1 ? '' : 's'}`
            : `${visibles.length} de ${data.length} empresas`}
        </p>
      )}

      {sinConvenios && (
        <Alerta>Crea primero un convenio: toda empresa debe pertenecer a uno.</Alerta>
      )}

      {error && <Alerta>{(error as Error).message}</Alerta>}
      {estado.error && <Alerta>{(estado.error as Error).message}</Alerta>}

      {isPending ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" aria-label="Cargando" />
        </div>
      ) : visibles.length > 0 ? (
        <TablaAdmin>
          <EncabezadoTabla
            columnas={[
              'Empresa',
              'NIT',
              'Convenio',
              'Ciudad',
              { texto: 'Usuarios', derecha: true },
              { texto: 'Vehículos', derecha: true },
              'Estado',
              { texto: 'Acciones', derecha: true },
            ]}
          />

          <tbody>
            {visibles.map((e) => (
              <FilaTabla key={e.id} atenuada={!e.activo}>
                <Celda>
                  <p className="font-medium text-foreground">{e.nombre}</p>
                  {e.telefono && <p className="text-xs text-muted-foreground">{e.telefono}</p>}
                </Celda>

                <Celda apagada>{e.nit}</Celda>
                <Celda apagada>{e.convenioNombre}</Celda>
                <Celda apagada>{e.ciudad ?? '—'}</Celda>
                <Celda derecha apagada>{e.totalUsuarios}</Celda>
                <Celda derecha apagada>{e.totalVehiculos}</Celda>

                <Celda>
                  <EtiquetaEstado activo={e.activo} />
                </Celda>

                <Celda derecha>
                  <div className="flex items-center justify-end gap-1">
                    <BotonFila etiqueta={`Editar ${e.nombre}`} onClick={() => setEditando(e)}>
                      <Pencil className="size-4" aria-hidden />
                    </BotonFila>

                    <BotonFila
                      etiqueta={`${e.activo ? 'Desactivar' : 'Activar'} ${e.nombre}`}
                      destructivo={e.activo}
                      disabled={estado.isPending}
                      onClick={() => estado.mutate({ id: e.id, activo: !e.activo })}
                    >
                      {e.activo ? (
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
            mensaje={
              hayFiltrosDeTexto
                ? 'Ninguna empresa coincide con la búsqueda.'
                : 'No hay empresas para el filtro seleccionado.'
            }
          />
        )
      )}

      {(creando || editando) && (
        <FormularioEmpresa
          empresa={editando}
          opcionesConvenio={opcionesConvenio}
          onCerrar={() => {
            setEditando(null)
            setCreando(false)
          }}
        />
      )}
    </div>
  )
}

function FormularioEmpresa({
  empresa,
  opcionesConvenio,
  onCerrar,
}: {
  empresa: EmpresaAdmin | null
  opcionesConvenio: { valor: string; etiqueta: string }[]
  onCerrar: () => void
}) {
  const clienteConsultas = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      convenioId: empresa?.convenioId ?? '',
      nit: empresa?.nit ?? '',
      nombre: empresa?.nombre ?? '',
      telefono: empresa?.telefono ?? '',
      direccion: empresa?.direccion ?? '',
      ciudad: empresa?.ciudad ?? '',
    },
  })

  const guardar = useMutation({
    mutationFn: (datos: Formulario) =>
      empresa ? adminEmpresas.actualizar(empresa.id, datos) : adminEmpresas.crear(datos),
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ['admin'] })
      onCerrar()
    },
  })

  return (
    <Modal
      titulo={empresa ? 'Editar empresa' : 'Nueva empresa'}
      descripcion="La empresa pertenece a un convenio; sus usuarios heredan ese convenio."
      onCerrar={onCerrar}
      bloqueado={guardar.isPending}
      ancho="lg"
      pie={
        <>
          <Boton variante="secundario" type="button" onClick={onCerrar} disabled={guardar.isPending}>
            Cancelar
          </Boton>
          <Boton type="submit" form="form-empresa" cargando={guardar.isPending}>
            {empresa ? 'Guardar cambios' : 'Crear empresa'}
          </Boton>
        </>
      }
    >
      <form
        id="form-empresa"
        onSubmit={handleSubmit((datos) => guardar.mutateAsync(datos))}
        noValidate
        className="grid gap-4 sm:grid-cols-2"
      >
        {guardar.error && (
          <div className="sm:col-span-2">
            <Alerta>{(guardar.error as Error).message}</Alerta>
          </div>
        )}

        <CampoFormulario
          etiqueta="Convenio"
          htmlFor="convenio"
          requerido
          error={errors.convenioId?.message}
          className="sm:col-span-2"
        >
          <Controller
            control={control}
            name="convenioId"
            render={({ field }) => (
              <ComboBox
                id="convenio"
                valor={field.value ?? ''}
                onCambio={field.onChange}
                textoVacio="Selecciona el convenio"
                invalido={Boolean(errors.convenioId)}
                opciones={opcionesConvenio}
              />
            )}
          />
        </CampoFormulario>

        <CampoFormulario etiqueta="Nombre" htmlFor="nombre-empresa" requerido error={errors.nombre?.message}>
          <input
            id="nombre-empresa"
            {...register('nombre')}
            placeholder="Autos del Norte S.A.S."
            className={cn(clasesControl, errors.nombre ? 'border-destructive' : 'border-input')}
          />
        </CampoFormulario>

        <CampoFormulario etiqueta="NIT" htmlFor="nit" requerido error={errors.nit?.message}>
          <input
            id="nit"
            {...register('nit')}
            placeholder="900123456-1"
            className={cn(clasesControl, errors.nit ? 'border-destructive' : 'border-input')}
          />
        </CampoFormulario>

        <CampoFormulario etiqueta="Teléfono" htmlFor="telefono-empresa" error={errors.telefono?.message}>
          <input
            id="telefono-empresa"
            {...register('telefono')}
            placeholder="6011234567"
            className={cn(clasesControl, 'border-input')}
          />
        </CampoFormulario>

        <CampoFormulario etiqueta="Ciudad" htmlFor="ciudad-empresa" error={errors.ciudad?.message}>
          <input
            id="ciudad-empresa"
            {...register('ciudad')}
            placeholder="Bogotá"
            className={cn(clasesControl, 'border-input')}
          />
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Dirección"
          htmlFor="direccion"
          error={errors.direccion?.message}
          className="sm:col-span-2"
        >
          <input
            id="direccion"
            {...register('direccion')}
            placeholder="Calle 100 #15-20"
            className={cn(clasesControl, 'border-input')}
          />
        </CampoFormulario>
      </form>
    </Modal>
  )
}
