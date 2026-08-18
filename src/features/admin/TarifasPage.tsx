import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { adminConvenios, adminTarifas, type TarifaAdmin } from '@/api/admin'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { CampoFormulario } from '@/components/ui/CampoFormulario'
import { Casilla } from '@/components/ui/Casilla'
import { DialogoConfirmacion } from '@/components/ui/DialogoConfirmacion'
import { clasesControl } from '@/components/ui/estilosControl'
import { Modal } from '@/components/ui/Modal'
import { formatearPrecio } from '@/lib/formato'
import { cn } from '@/lib/utils'
import {
  BotonFila,
  Celda,
  EncabezadoTabla,
  EstadoVacio,
  FilaTabla,
  TablaAdmin,
} from './componentes'

/** Mismo mínimo que exige la API: por debajo de esto la pasarela rechaza la transacción. */
const PRECIO_MINIMO = 1500

const esquema = z
  .object({
    precio: z
      .number({ message: 'Escribe el precio de la publicación.' })
      .int('El precio debe ser un valor entero en pesos.')
      .min(0, 'El precio no puede ser negativo.')
      .max(50_000_000, 'El precio excede el máximo permitido.'),
    cobroActivo: z.boolean(),
  })
  // El mínimo solo aplica si de verdad se va a cobrar: con el cobro apagado el precio queda
  // guardado como referencia y no viaja a la pasarela.
  .refine((v) => !v.cobroActivo || v.precio >= PRECIO_MINIMO, {
    path: ['precio'],
    message: `El precio debe ser de al menos ${formatearPrecio(PRECIO_MINIMO)}. Para publicar sin costo, desactiva el cobro.`,
  })

type Formulario = z.infer<typeof esquema>

export function TarifasPage() {
  const clienteConsultas = useQueryClient()
  const [editando, setEditando] = useState<TarifaAdmin | null>(null)
  const [creando, setCreando] = useState(false)
  const [porEliminar, setPorEliminar] = useState<TarifaAdmin | null>(null)

  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'tarifas'],
    queryFn: adminTarifas.listar,
  })

  const eliminar = useMutation({
    mutationFn: (convenioId: string) => adminTarifas.eliminarConvenio(convenioId),
    onSuccess: async () => {
      setPorEliminar(null)
      await clienteConsultas.invalidateQueries({ queryKey: ['admin', 'tarifas'] })
    },
  })

  const global = data?.find((t) => !t.convenioId)
  const porConvenio = data?.filter((t) => t.convenioId) ?? []

  if (isPending) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-label="Cargando" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && <Alerta>{(error as Error).message}</Alerta>}
      {eliminar.error && <Alerta>{(eliminar.error as Error).message}</Alerta>}

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Tarifa de la plataforma
          </h2>
          <p className="text-sm text-muted-foreground">
            Lo que cuesta publicar un vehículo. Se cobra una sola vez por vehículo: una vez
            aprobado el pago, ese vehículo puede volver al catálogo sin pagar de nuevo.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-3xl font-bold text-foreground">
              {formatearPrecio(global?.precio ?? 0)}{' '}
              <span className="text-sm font-medium text-muted-foreground">
                {global?.moneda ?? 'COP'}
              </span>
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {global?.cobroActivo === false
                ? 'Cobro desactivado: hoy se publica sin costo.'
                : 'Aplica a todos los convenios que no tengan tarifa propia.'}
            </p>
          </div>

          {global && (
            <Boton variante="secundario" onClick={() => setEditando(global)}>
              <Pencil className="size-4" aria-hidden />
              Editar tarifa
            </Boton>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Tarifas por convenio
            </h2>
            <p className="text-sm text-muted-foreground">
              Excepciones negociadas. El convenio que no aparezca aquí se rige por la tarifa de la
              plataforma.
            </p>
          </div>

          <Boton onClick={() => setCreando(true)}>
            <Plus className="size-4" aria-hidden />
            Nueva excepción
          </Boton>
        </div>

        {porConvenio.length > 0 ? (
          <TablaAdmin>
            <EncabezadoTabla
              columnas={[
                'Convenio',
                { texto: 'Precio', derecha: true },
                'Cobro',
                { texto: 'Acciones', derecha: true },
              ]}
            />

            <tbody>
              {porConvenio.map((t) => (
                <FilaTabla key={t.id} atenuada={!t.cobroActivo}>
                  <Celda>
                    <span className="font-medium text-foreground">{t.convenioNombre}</span>
                  </Celda>

                  <Celda derecha>
                    <span className="font-medium text-foreground">{formatearPrecio(t.precio)}</span>
                  </Celda>

                  <Celda apagada>{t.cobroActivo ? 'Activo' : 'Sin costo'}</Celda>

                  <Celda derecha>
                    <div className="flex items-center justify-end gap-1">
                      <BotonFila
                        etiqueta={`Editar la tarifa de ${t.convenioNombre}`}
                        onClick={() => setEditando(t)}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </BotonFila>

                      <BotonFila
                        etiqueta={`Quitar la tarifa propia de ${t.convenioNombre}`}
                        destructivo
                        disabled={eliminar.isPending}
                        onClick={() => setPorEliminar(t)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </BotonFila>
                    </div>
                  </Celda>
                </FilaTabla>
              ))}
            </tbody>
          </TablaAdmin>
        ) : (
          <EstadoVacio mensaje="Todos los convenios usan la tarifa de la plataforma." />
        )}
      </section>

      {(creando || editando) && (
        <FormularioTarifa
          tarifa={editando}
          conveniosOcupados={porConvenio.map((t) => t.convenioId!)}
          onCerrar={() => {
            setEditando(null)
            setCreando(false)
          }}
        />
      )}

      {porEliminar && (
        <DialogoConfirmacion
          titulo="Quitar tarifa del convenio"
          mensaje={`«${porEliminar.convenioNombre}» volverá a regirse por la tarifa de la plataforma. Los pagos ya realizados no cambian.`}
          cargando={eliminar.isPending}
          onConfirmar={() => eliminar.mutate(porEliminar.convenioId!)}
          onCancelar={() => setPorEliminar(null)}
        />
      )}
    </div>
  )
}

function FormularioTarifa({
  tarifa,
  conveniosOcupados,
  onCerrar,
}: {
  /** Nula al crear una excepción; con `convenioId` nulo se está editando la tarifa global. */
  tarifa: TarifaAdmin | null
  conveniosOcupados: string[]
  onCerrar: () => void
}) {
  const clienteConsultas = useQueryClient()
  const esGlobal = tarifa !== null && !tarifa.convenioId
  const [convenioId, setConvenioId] = useState(tarifa?.convenioId ?? '')

  // Solo hace falta la lista al crear una excepción: al editar, el convenio ya está decidido.
  const { data: convenios } = useQuery({
    queryKey: ['admin', 'convenios'],
    queryFn: adminConvenios.listar,
    enabled: tarifa === null,
  })

  const disponibles = (convenios ?? []).filter((c) => !conveniosOcupados.includes(c.id))

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      precio: tarifa?.precio ?? 80_000,
      cobroActivo: tarifa?.cobroActivo ?? true,
    },
  })

  const cobroActivo = watch('cobroActivo')

  const guardar = useMutation({
    mutationFn: (datos: Formulario) =>
      esGlobal
        ? adminTarifas.guardarGlobal(datos)
        : adminTarifas.guardarConvenio(tarifa?.convenioId ?? convenioId, datos),
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ['admin', 'tarifas'] })
      onCerrar()
    },
  })

  const titulo = esGlobal
    ? 'Editar la tarifa de la plataforma'
    : tarifa
      ? `Tarifa de ${tarifa.convenioNombre}`
      : 'Nueva tarifa por convenio'

  return (
    <Modal
      titulo={titulo}
      descripcion="El precio se cobra una vez por vehículo, al publicarlo."
      onCerrar={onCerrar}
      bloqueado={guardar.isPending}
      pie={
        <>
          <Boton variante="secundario" type="button" onClick={onCerrar} disabled={guardar.isPending}>
            Cancelar
          </Boton>
          <Boton
            type="submit"
            form="form-tarifa"
            cargando={guardar.isPending}
            disabled={!esGlobal && !tarifa && !convenioId}
          >
            Guardar
          </Boton>
        </>
      }
    >
      <form
        id="form-tarifa"
        onSubmit={handleSubmit((datos) => guardar.mutateAsync(datos))}
        noValidate
        className="space-y-4"
      >
        {guardar.error && <Alerta>{(guardar.error as Error).message}</Alerta>}

        {!esGlobal && !tarifa && (
          <CampoFormulario etiqueta="Convenio" htmlFor="convenio" requerido>
            <select
              id="convenio"
              value={convenioId}
              onChange={(e) => setConvenioId(e.target.value)}
              className={cn(clasesControl, 'border-input')}
            >
              <option value="">Selecciona un convenio</option>
              {disponibles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </CampoFormulario>
        )}

        <CampoFormulario
          etiqueta="Precio de la publicación"
          htmlFor="precio"
          requerido
          error={errors.precio?.message}
        >
          {/* `valueAsNumber`: sin él el input entrega texto y el esquema lo rechazaría por tipo. */}
          <input
            id="precio"
            type="number"
            inputMode="numeric"
            step={100}
            {...register('precio', { valueAsNumber: true })}
            className={cn(clasesControl, errors.precio ? 'border-destructive' : 'border-input')}
          />
        </CampoFormulario>

        <Casilla
          etiqueta="Cobrar por publicar"
          checked={cobroActivo}
          onChange={(valor) => setValue('cobroActivo', valor, { shouldValidate: true })}
        />

        {!cobroActivo && (
          <p className="text-sm text-muted-foreground">
            Con el cobro desactivado los vehículos entran al catálogo sin pasar por la pasarela.
            Los que ya se publicaron así no se les cobrará después si vuelves a activarlo.
          </p>
        )}
      </form>
    </Modal>
  )
}
