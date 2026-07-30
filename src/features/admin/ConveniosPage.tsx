import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Pencil, Plus, Power, PowerOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ApiError } from '@/api/cliente'
import { adminConvenios, type ConvenioAdmin } from '@/api/admin'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { CampoFormulario } from '@/components/ui/CampoFormulario'
import { clasesControl } from '@/components/ui/estilosControl'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import {
  BotonFila,
  Celda,
  EncabezadoTabla,
  EstadoVacio,
  EtiquetaEstado,
  FilaTabla,
  TablaAdmin,
} from './componentes'

const esquema = z.object({
  // Se escribe libre. Solo se vetan los caracteres que romperían el CSV de carga masiva de
  // usuarios, donde el convenio se identifica por este código (misma regla que la API).
  codigo: z
    .string()
    .trim()
    .min(1, 'El código es obligatorio.')
    .max(30)
    .regex(/^[^,;"\r\n\t]+$/, 'No admite comas, puntos y coma, comillas ni tabulaciones.'),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.').max(150),
  descripcion: z.string().trim().max(500).optional(),
})

type Formulario = z.infer<typeof esquema>

export function ConveniosPage() {
  const clienteConsultas = useQueryClient()
  const [editando, setEditando] = useState<ConvenioAdmin | null>(null)
  const [creando, setCreando] = useState(false)

  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'convenios'],
    queryFn: adminConvenios.listar,
  })

  const estado = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      adminConvenios.cambiarEstado(id, activo),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: ['admin'] }),
  })

  const cerrar = () => {
    setEditando(null)
    setCreando(false)
  }

  if (isPending) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-label="Cargando" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data?.length ?? 0} convenio{data?.length === 1 ? '' : 's'}
        </p>

        <Boton onClick={() => setCreando(true)}>
          <Plus className="size-4" aria-hidden />
          Nuevo convenio
        </Boton>
      </div>

      {error && <Alerta>{(error as Error).message}</Alerta>}
      {estado.error && <Alerta>{(estado.error as Error).message}</Alerta>}

      {data && data.length > 0 ? (
        <TablaAdmin>
          <EncabezadoTabla
            columnas={[
              'Código',
              'Nombre',
              { texto: 'Empresas', derecha: true },
              { texto: 'Usuarios', derecha: true },
              { texto: 'Vehículos', derecha: true },
              'Estado',
              { texto: 'Acciones', derecha: true },
            ]}
          />

          <tbody>
            {data.map((c) => (
              <FilaTabla key={c.id} atenuada={!c.activo}>
                <Celda>
                  <span className="font-medium text-foreground">{c.codigo}</span>
                </Celda>

                <Celda>
                  <p className="font-medium text-foreground">{c.nombre}</p>
                  {c.descripcion && (
                    <p className="max-w-xs truncate text-xs text-muted-foreground">
                      {c.descripcion}
                    </p>
                  )}
                </Celda>

                <Celda derecha apagada>{c.totalEmpresas}</Celda>
                <Celda derecha apagada>{c.totalUsuarios}</Celda>
                <Celda derecha apagada>{c.totalVehiculos}</Celda>

                <Celda>
                  <EtiquetaEstado activo={c.activo} />
                </Celda>

                <Celda derecha>
                  <div className="flex items-center justify-end gap-1">
                    <BotonFila etiqueta={`Editar ${c.nombre}`} onClick={() => setEditando(c)}>
                      <Pencil className="size-4" aria-hidden />
                    </BotonFila>

                    <BotonFila
                      etiqueta={`${c.activo ? 'Desactivar' : 'Activar'} ${c.nombre}`}
                      destructivo={c.activo}
                      disabled={estado.isPending}
                      onClick={() => estado.mutate({ id: c.id, activo: !c.activo })}
                    >
                      {c.activo ? (
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
        !error && <EstadoVacio mensaje="Todavía no hay convenios registrados." />
      )}

      {(creando || editando) && <FormularioConvenio convenio={editando} onCerrar={cerrar} />}
    </div>
  )
}

function FormularioConvenio({
  convenio,
  onCerrar,
}: {
  convenio: ConvenioAdmin | null
  onCerrar: () => void
}) {
  const clienteConsultas = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      codigo: convenio?.codigo ?? '',
      nombre: convenio?.nombre ?? '',
      descripcion: convenio?.descripcion ?? '',
    },
  })

  const guardar = useMutation({
    mutationFn: (datos: Formulario) =>
      convenio ? adminConvenios.actualizar(convenio.id, datos) : adminConvenios.crear(datos),
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ['admin'] })
      onCerrar()
    },
  })

  const onSubmit = handleSubmit((datos) => guardar.mutateAsync(datos))

  return (
    <Modal
      titulo={convenio ? 'Editar convenio' : 'Nuevo convenio'}
      descripcion="El convenio agrupa empresas y define qué vehículos ve cada usuario."
      onCerrar={onCerrar}
      bloqueado={guardar.isPending}
      pie={
        <>
          <Boton variante="secundario" type="button" onClick={onCerrar} disabled={guardar.isPending}>
            Cancelar
          </Boton>
          <Boton type="submit" form="form-convenio" cargando={guardar.isPending}>
            {convenio ? 'Guardar cambios' : 'Crear convenio'}
          </Boton>
        </>
      }
    >
      <form id="form-convenio" onSubmit={onSubmit} noValidate className="space-y-4">
        {guardar.error && (
          <Alerta>
            {guardar.error instanceof ApiError
              ? guardar.error.message
              : (guardar.error as Error).message}
          </Alerta>
        )}

        <CampoFormulario etiqueta="Código" htmlFor="codigo" requerido error={errors.codigo?.message}>
          <input
            id="codigo"
            {...register('codigo')}
            placeholder="CONV-NORTE"
            className={cn(clasesControl, errors.codigo ? 'border-destructive' : 'border-input')}
          />
        </CampoFormulario>

        <CampoFormulario etiqueta="Nombre" htmlFor="nombre" requerido error={errors.nombre?.message}>
          <input
            id="nombre"
            {...register('nombre')}
            placeholder="Convenio Movilidad Norte"
            className={cn(clasesControl, errors.nombre ? 'border-destructive' : 'border-input')}
          />
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Descripción"
          htmlFor="descripcion"
          error={errors.descripcion?.message}
        >
          <textarea
            id="descripcion"
            {...register('descripcion')}
            rows={3}
            placeholder="Opcional"
            className={cn(clasesControl, 'h-auto resize-y border-input')}
          />
        </CampoFormulario>
      </form>
    </Modal>
  )
}
