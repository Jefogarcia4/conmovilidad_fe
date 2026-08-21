import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, CreditCard, Loader2, Pencil, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { adminConvenios, adminEmpresas } from '@/api/admin'
import { irAlCheckout } from '@/api/pagos'
import {
  adminPlanes,
  adminSuscripciones,
  type PlanSuscripcion,
  type SuscripcionEmpresa,
} from '@/api/suscripciones'
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

/** Mismo mínimo que exige la API: por debajo la pasarela rechaza la transacción. */
const PRECIO_MINIMO = 1500

export function SuscripcionesPage() {
  return (
    <div className="space-y-8">
      <SeccionPlanes />
      <SeccionEmpresas />
    </div>
  )
}

// --- Catálogo de planes -----------------------------------------------------

function SeccionPlanes() {
  const [editando, setEditando] = useState<PlanSuscripcion | null>(null)
  const [creando, setCreando] = useState(false)

  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'planes-suscripcion'],
    queryFn: () => adminPlanes.listar(),
  })

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Planes de suscripción
          </h2>
          <p className="text-sm text-muted-foreground">
            Cada plan define cuántos vehículos puede publicar al mes una empresa suscrita y cuánto
            cuesta el período. Editar un plan no cambia las suscripciones ya vendidas.
          </p>
        </div>

        <Boton onClick={() => setCreando(true)}>
          <Plus className="size-4" aria-hidden />
          Nuevo plan
        </Boton>
      </div>

      {error && <Alerta>{(error as Error).message}</Alerta>}

      {isPending ? (
        <Cargando />
      ) : data && data.length > 0 ? (
        <TablaAdmin>
          <EncabezadoTabla
            columnas={[
              'Plan',
              'Publicaciones al mes',
              { texto: 'Precio', derecha: true },
              'Período',
              { texto: 'Empresas', derecha: true },
              'Estado',
              { texto: 'Acciones', derecha: true },
            ]}
          />

          <tbody>
            {data.map((plan) => (
              <FilaTabla key={plan.id} atenuada={!plan.activo}>
                <Celda>
                  <span className="font-medium text-foreground">{plan.nombre}</span>
                  {plan.descripcion && (
                    <span className="block text-xs text-muted-foreground">{plan.descripcion}</span>
                  )}
                </Celda>

                <Celda apagada>{rangoDelPlan(plan)}</Celda>

                <Celda derecha>
                  <span className="font-medium text-foreground">
                    {plan.precio > 0 ? formatearPrecio(plan.precio) : 'Sin costo'}
                  </span>
                </Celda>

                <Celda apagada>
                  {plan.duracionMeses === 1 ? 'Mensual' : `${plan.duracionMeses} meses`}
                </Celda>

                <Celda derecha apagada>
                  {plan.empresasSuscritas}
                </Celda>

                <Celda apagada>{plan.activo ? 'En catálogo' : 'Retirado'}</Celda>

                <Celda derecha>
                  <BotonFila etiqueta={`Editar ${plan.nombre}`} onClick={() => setEditando(plan)}>
                    <Pencil className="size-4" aria-hidden />
                  </BotonFila>
                </Celda>
              </FilaTabla>
            ))}
          </tbody>
        </TablaAdmin>
      ) : (
        <EstadoVacio mensaje="Todavía no hay planes. Crea uno para poder suscribir empresas." />
      )}

      {(creando || editando) && (
        <FormularioPlan
          plan={editando}
          onCerrar={() => {
            setEditando(null)
            setCreando(false)
          }}
        />
      )}
    </section>
  )
}

const esquemaPlan = z
  .object({
    nombre: z.string().trim().min(1, 'Escribe el nombre del plan.').max(100),
    descripcion: z.string().trim().max(500).optional(),
    publicacionesMinimasMensuales: z
      .number({ message: 'Indica el mínimo del rango.' })
      .int()
      .min(0, 'El mínimo no puede ser negativo.')
      .max(10_000, 'El mínimo no puede pasar de 10.000.'),
    publicacionesMaximasMensuales: z
      .number({ message: 'Indica el máximo del rango.' })
      .int()
      .min(1, 'El máximo debe ser al menos 1.')
      .max(10_000, 'El máximo no puede pasar de 10.000.'),
    precio: z
      .number({ message: 'Escribe el precio del plan.' })
      .int('El precio debe ser un valor entero en pesos.')
      .min(0, 'El precio no puede ser negativo.')
      .max(500_000_000, 'El precio excede el máximo permitido.'),
    duracionMeses: z
      .number({ message: 'Indica la duración.' })
      .int()
      .min(1, 'La duración mínima es de un mes.')
      .max(36, 'La duración máxima es de 36 meses.'),
    activo: z.boolean(),
  })
  .refine((v) => v.publicacionesMaximasMensuales >= v.publicacionesMinimasMensuales, {
    path: ['publicacionesMaximasMensuales'],
    message: 'El máximo no puede ser menor que el mínimo.',
  })
  // Cero es un plan de cortesía y entra sin pasar por la pasarela. Por encima de cero tiene que
  // llegar al mínimo de Wompi, o el checkout fallaría cuando ya se cree vendida la suscripción.
  .refine((v) => v.precio === 0 || v.precio >= PRECIO_MINIMO, {
    path: ['precio'],
    message: `El precio debe ser de al menos ${formatearPrecio(PRECIO_MINIMO)}, o $0 para regalarlo.`,
  })

type FormularioPlanDatos = z.infer<typeof esquemaPlan>

function FormularioPlan({ plan, onCerrar }: { plan: PlanSuscripcion | null; onCerrar: () => void }) {
  const clienteConsultas = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormularioPlanDatos>({
    resolver: zodResolver(esquemaPlan),
    defaultValues: {
      nombre: plan?.nombre ?? '',
      descripcion: plan?.descripcion ?? '',
      publicacionesMinimasMensuales: plan?.publicacionesMinimasMensuales ?? 1,
      publicacionesMaximasMensuales: plan?.publicacionesMaximasMensuales ?? 10,
      precio: plan?.precio ?? 500_000,
      duracionMeses: plan?.duracionMeses ?? 1,
      activo: plan?.activo ?? true,
    },
  })

  const activo = watch('activo')

  const guardar = useMutation({
    mutationFn: (datos: FormularioPlanDatos) =>
      plan ? adminPlanes.actualizar(plan.id, datos) : adminPlanes.crear(datos),
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ['admin', 'planes-suscripcion'] })
      onCerrar()
    },
  })

  return (
    <Modal
      titulo={plan ? `Editar «${plan.nombre}»` : 'Nuevo plan de suscripción'}
      descripcion="El máximo de publicaciones es el tope que se aplica cada mes; el mínimo solo describe el rango."
      onCerrar={onCerrar}
      bloqueado={guardar.isPending}
      pie={
        <>
          <Boton variante="secundario" type="button" onClick={onCerrar} disabled={guardar.isPending}>
            Cancelar
          </Boton>
          <Boton type="submit" form="form-plan" cargando={guardar.isPending}>
            Guardar
          </Boton>
        </>
      }
    >
      <form
        id="form-plan"
        onSubmit={handleSubmit((datos) => guardar.mutateAsync(datos))}
        noValidate
        className="space-y-4"
      >
        {guardar.error && <Alerta>{(guardar.error as Error).message}</Alerta>}

        {plan && plan.empresasSuscritas > 0 && (
          <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            {plan.empresasSuscritas === 1
              ? 'Hay 1 empresa suscrita a este plan.'
              : `Hay ${plan.empresasSuscritas} empresas suscritas a este plan.`}{' '}
            Lo que cambies aquí se aplicará a las próximas contrataciones: las vigentes conservan el
            cupo y el precio con los que se vendieron.
          </p>
        )}

        <CampoFormulario etiqueta="Nombre" htmlFor="plan-nombre" requerido error={errors.nombre?.message}>
          <input
            id="plan-nombre"
            {...register('nombre')}
            placeholder="Ej: Plan Concesionario"
            className={cn(clasesControl, errors.nombre ? 'border-destructive' : 'border-input')}
          />
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Descripción"
          htmlFor="plan-descripcion"
          error={errors.descripcion?.message}
        >
          <input
            id="plan-descripcion"
            {...register('descripcion')}
            placeholder="Opcional"
            className={cn(clasesControl, 'border-input')}
          />
        </CampoFormulario>

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoFormulario
            etiqueta="Desde (vehículos/mes)"
            htmlFor="plan-min"
            requerido
            error={errors.publicacionesMinimasMensuales?.message}
          >
            <input
              id="plan-min"
              type="number"
              inputMode="numeric"
              {...register('publicacionesMinimasMensuales', { valueAsNumber: true })}
              className={cn(
                clasesControl,
                errors.publicacionesMinimasMensuales ? 'border-destructive' : 'border-input',
              )}
            />
          </CampoFormulario>

          <CampoFormulario
            etiqueta="Hasta (vehículos/mes)"
            htmlFor="plan-max"
            requerido
            error={errors.publicacionesMaximasMensuales?.message}
            ayuda="Este es el tope que se aplica."
          >
            <input
              id="plan-max"
              type="number"
              inputMode="numeric"
              {...register('publicacionesMaximasMensuales', { valueAsNumber: true })}
              className={cn(
                clasesControl,
                errors.publicacionesMaximasMensuales ? 'border-destructive' : 'border-input',
              )}
            />
          </CampoFormulario>

          <CampoFormulario
            etiqueta="Precio del período"
            htmlFor="plan-precio"
            requerido
            error={errors.precio?.message}
          >
            <input
              id="plan-precio"
              type="number"
              inputMode="numeric"
              step={1000}
              {...register('precio', { valueAsNumber: true })}
              className={cn(clasesControl, errors.precio ? 'border-destructive' : 'border-input')}
            />
          </CampoFormulario>

          <CampoFormulario
            etiqueta="Duración (meses)"
            htmlFor="plan-duracion"
            requerido
            error={errors.duracionMeses?.message}
            ayuda="Lo que cubre un pago."
          >
            <input
              id="plan-duracion"
              type="number"
              inputMode="numeric"
              {...register('duracionMeses', { valueAsNumber: true })}
              className={cn(
                clasesControl,
                errors.duracionMeses ? 'border-destructive' : 'border-input',
              )}
            />
          </CampoFormulario>
        </div>

        <Casilla
          etiqueta="Ofrecer en el catálogo"
          checked={activo}
          onChange={(valor) => setValue('activo', valor, { shouldValidate: true })}
        />

        {!activo && (
          <p className="text-sm text-muted-foreground">
            Un plan retirado no se puede contratar, pero las suscripciones vendidas con él siguen
            vigentes hasta su fecha de fin.
          </p>
        )}
      </form>
    </Modal>
  )
}

// --- Suscripciones de empresa ----------------------------------------------

function SeccionEmpresas() {
  const clienteConsultas = useQueryClient()
  const [suscribiendo, setSuscribiendo] = useState(false)
  const [porCancelar, setPorCancelar] = useState<SuscripcionEmpresa | null>(null)

  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'suscripciones'],
    queryFn: () => adminSuscripciones.listar({ tamanoPagina: 100 }),
  })

  const cancelar = useMutation({
    mutationFn: (id: string) => adminSuscripciones.cancelar(id),
    onSuccess: async () => {
      setPorCancelar(null)
      await clienteConsultas.invalidateQueries({ queryKey: ['admin', 'suscripciones'] })
    },
  })

  const pagar = useMutation({
    mutationFn: (id: string) => adminSuscripciones.checkout(id),
    onSuccess: async (checkout) => {
      if (checkout.requierePago && checkout.urlCheckout) {
        irAlCheckout(checkout.urlCheckout)
        return
      }

      // Sin nada que cobrar la suscripción ya quedó activa: basta con refrescar la tabla.
      await clienteConsultas.invalidateQueries({ queryKey: ['admin', 'suscripciones'] })
    },
  })

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Empresas suscritas</h2>
          <p className="text-sm text-muted-foreground">
            Mientras la suscripción esté vigente, los usuarios de la empresa publican sin pagar por
            vehículo hasta agotar el cupo del mes. La empresa sin suscripción paga por vehículo.
          </p>
        </div>

        <Boton onClick={() => setSuscribiendo(true)}>
          <Plus className="size-4" aria-hidden />
          Suscribir empresa
        </Boton>
      </div>

      {error && <Alerta>{(error as Error).message}</Alerta>}
      {cancelar.error && <Alerta>{(cancelar.error as Error).message}</Alerta>}
      {pagar.error && <Alerta>{(pagar.error as Error).message}</Alerta>}

      {isPending ? (
        <Cargando />
      ) : data && data.items.length > 0 ? (
        <TablaAdmin>
          <EncabezadoTabla
            columnas={[
              'Empresa',
              'Plan',
              'Vigencia',
              'Consumo del mes',
              { texto: 'Precio', derecha: true },
              'Estado',
              { texto: 'Acciones', derecha: true },
            ]}
          />

          <tbody>
            {data.items.map((s) => (
              <FilaTabla key={s.id} atenuada={!s.vigente}>
                <Celda>
                  <span className="font-medium text-foreground">{s.empresaNombre}</span>
                  <span className="block text-xs text-muted-foreground">{s.convenioNombre}</span>
                </Celda>

                <Celda apagada>{s.planNombre}</Celda>

                <Celda apagada>
                  {formatearFecha(s.fechaInicio)} — {formatearFecha(s.fechaFin)}
                </Celda>

                <Celda>
                  <Consumo suscripcion={s} />
                </Celda>

                <Celda derecha apagada>
                  {s.precio > 0 ? formatearPrecio(s.precio) : 'Sin costo'}
                </Celda>

                <Celda>
                  <EtiquetaSuscripcion suscripcion={s} />
                </Celda>

                <Celda derecha>
                  <div className="flex items-center justify-end gap-1">
                    {s.estado === 'PendientePago' && (
                      <BotonFila
                        etiqueta={`Pagar la suscripción de ${s.empresaNombre}`}
                        disabled={pagar.isPending}
                        onClick={() => pagar.mutate(s.id)}
                      >
                        <CreditCard className="size-4" aria-hidden />
                      </BotonFila>
                    )}

                    {s.estado !== 'Cancelada' && (
                      <BotonFila
                        etiqueta={`Cancelar la suscripción de ${s.empresaNombre}`}
                        destructivo
                        disabled={cancelar.isPending}
                        onClick={() => setPorCancelar(s)}
                      >
                        <Ban className="size-4" aria-hidden />
                      </BotonFila>
                    )}
                  </div>
                </Celda>
              </FilaTabla>
            ))}
          </tbody>
        </TablaAdmin>
      ) : (
        <EstadoVacio mensaje="Ninguna empresa tiene suscripción: todas pagan por vehículo publicado." />
      )}

      {suscribiendo && <FormularioSuscripcion onCerrar={() => setSuscribiendo(false)} />}

      {porCancelar && (
        <DialogoConfirmacion
          titulo="Cancelar suscripción"
          mensaje={`«${porCancelar.empresaNombre}» perderá el cupo de inmediato y volverá a pagar por cada vehículo que publique. Los vehículos ya publicados no se retiran y el histórico de pagos se conserva.`}
          textoConfirmar="Cancelar suscripción"
          cargando={cancelar.isPending}
          onConfirmar={() => cancelar.mutate(porCancelar.id)}
          onCancelar={() => setPorCancelar(null)}
        />
      )}
    </section>
  )
}

const esquemaSuscripcion = z.object({
  convenioId: z.string().min(1, 'Selecciona el convenio.'),
  empresaId: z.string().min(1, 'Selecciona la empresa.'),
  planSuscripcionId: z.string().min(1, 'Selecciona el plan.'),
  fechaInicio: z.string().optional(),
})

type FormularioSuscripcionDatos = z.infer<typeof esquemaSuscripcion>

function FormularioSuscripcion({ onCerrar }: { onCerrar: () => void }) {
  const clienteConsultas = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormularioSuscripcionDatos>({
    resolver: zodResolver(esquemaSuscripcion),
    defaultValues: { convenioId: '', empresaId: '', planSuscripcionId: '', fechaInicio: '' },
  })

  const convenioId = watch('convenioId')

  const { data: convenios } = useQuery({
    queryKey: ['admin', 'convenios'],
    queryFn: adminConvenios.listar,
  })

  // Las empresas se piden por convenio: el desplegable completo mezclaría empresas de clientes
  // distintos y suscribir a la equivocada es un cobro mal hecho.
  const { data: empresas } = useQuery({
    queryKey: ['admin', 'empresas', convenioId],
    queryFn: () => adminEmpresas.listar(convenioId),
    enabled: Boolean(convenioId),
  })

  // Solo los planes en catálogo: la API rechaza contratar uno retirado.
  const { data: planes } = useQuery({
    queryKey: ['admin', 'planes-suscripcion', 'activos'],
    queryFn: () => adminPlanes.listar(true),
  })

  const contratar = useMutation({
    mutationFn: ({ convenioId: _convenio, fechaInicio, ...datos }: FormularioSuscripcionDatos) =>
      adminSuscripciones.contratar({ ...datos, fechaInicio: fechaInicio || undefined }),
    onSuccess: async (suscripcion) => {
      await clienteConsultas.invalidateQueries({ queryKey: ['admin', 'suscripciones'] })
      await clienteConsultas.invalidateQueries({ queryKey: ['admin', 'planes-suscripcion'] })

      // Se encadena el cobro para no dejar la suscripción a medias: hasta que el pago se apruebe
      // no da cupo, y el administrador ya está aquí para terminarla.
      if (suscripcion.estado === 'PendientePago') {
        const checkout = await adminSuscripciones.checkout(suscripcion.id)

        if (checkout.requierePago && checkout.urlCheckout) {
          irAlCheckout(checkout.urlCheckout)
          return
        }
      }

      onCerrar()
    },
  })

  const planElegido = (planes ?? []).find((p) => p.id === watch('planSuscripcionId'))

  return (
    <Modal
      titulo="Suscribir una empresa"
      descripcion="El cupo y el precio quedan congelados con los valores que tenga el plan hoy."
      onCerrar={onCerrar}
      bloqueado={contratar.isPending}
      pie={
        <>
          <Boton
            variante="secundario"
            type="button"
            onClick={onCerrar}
            disabled={contratar.isPending}
          >
            Cancelar
          </Boton>
          <Boton type="submit" form="form-suscripcion" cargando={contratar.isPending}>
            Contratar y pagar
          </Boton>
        </>
      }
    >
      <form
        id="form-suscripcion"
        onSubmit={handleSubmit((datos) => contratar.mutateAsync(datos))}
        noValidate
        className="space-y-4"
      >
        {contratar.error && <Alerta>{(contratar.error as Error).message}</Alerta>}

        <CampoFormulario
          etiqueta="Convenio"
          htmlFor="sus-convenio"
          requerido
          error={errors.convenioId?.message}
        >
          <select
            id="sus-convenio"
            {...register('convenioId')}
            className={cn(clasesControl, errors.convenioId ? 'border-destructive' : 'border-input')}
          >
            <option value="">Selecciona un convenio</option>
            {(convenios ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Empresa"
          htmlFor="sus-empresa"
          requerido
          error={errors.empresaId?.message}
          ayuda={convenioId ? undefined : 'Selecciona primero el convenio.'}
        >
          <select
            id="sus-empresa"
            disabled={!convenioId}
            {...register('empresaId')}
            className={cn(clasesControl, errors.empresaId ? 'border-destructive' : 'border-input')}
          >
            <option value="">Selecciona una empresa</option>
            {/* Solo activas: suscribir una empresa dada de baja sería un cobro sin destinatario. */}
            {(empresas ?? [])
              .filter((e) => e.activo)
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
          </select>
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Plan"
          htmlFor="sus-plan"
          requerido
          error={errors.planSuscripcionId?.message}
        >
          <select
            id="sus-plan"
            {...register('planSuscripcionId')}
            className={cn(
              clasesControl,
              errors.planSuscripcionId ? 'border-destructive' : 'border-input',
            )}
          >
            <option value="">Selecciona un plan</option>
            {(planes ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — {rangoDelPlan(p)} —{' '}
                {p.precio > 0 ? formatearPrecio(p.precio) : 'sin costo'}
              </option>
            ))}
          </select>
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Inicio de la vigencia"
          htmlFor="sus-inicio"
          error={errors.fechaInicio?.message}
          ayuda="En blanco empieza hoy. Úsalo para encadenar una renovación al día siguiente del vencimiento."
        >
          <input
            id="sus-inicio"
            type="date"
            {...register('fechaInicio')}
            className={cn(clasesControl, 'border-input')}
          />
        </CampoFormulario>

        {planElegido && (
          <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            La empresa podrá publicar hasta{' '}
            <strong className="text-foreground">
              {planElegido.publicacionesMaximasMensuales} vehículos al mes
            </strong>{' '}
            durante{' '}
            {planElegido.duracionMeses === 1 ? 'un mes' : `${planElegido.duracionMeses} meses`}.
            {planElegido.precio > 0
              ? ' Al guardar se abrirá el pago: la suscripción no da cupo hasta que la pasarela lo confirme.'
              : ' Al ser un plan sin costo, queda activa de inmediato.'}
          </p>
        )}
      </form>
    </Modal>
  )
}

// --- Apoyo ------------------------------------------------------------------

function Consumo({ suscripcion }: { suscripcion: SuscripcionEmpresa }) {
  const { publicacionesUsadasEsteMes: usadas, publicacionesMaximasMensuales: maximo } = suscripcion
  const agotado = usadas >= maximo
  const porcentaje = maximo > 0 ? Math.min(100, Math.round((usadas / maximo) * 100)) : 0

  return (
    <div className="min-w-28 space-y-1">
      <span className={cn('text-xs font-medium', agotado ? 'text-destructive' : 'text-foreground')}>
        {usadas} de {maximo}
        {agotado && ' · agotado'}
      </span>

      <span className="block h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
        <span
          className={cn('block h-full rounded-full', agotado ? 'bg-destructive' : 'bg-cta')}
          style={{ width: `${porcentaje}%` }}
        />
      </span>
    </div>
  )
}

function EtiquetaSuscripcion({ suscripcion }: { suscripcion: SuscripcionEmpresa }) {
  // «Vencida» no llega de la API: es una activa a la que se le pasó la fecha.
  const { texto, clases } = suscripcion.vigente
    ? { texto: 'Vigente', clases: 'bg-cta/10 text-cta' }
    : suscripcion.estado === 'PendientePago'
      ? { texto: 'Pendiente de pago', clases: 'bg-destructive/10 text-destructive' }
      : suscripcion.estado === 'Cancelada'
        ? { texto: 'Cancelada', clases: 'bg-muted text-muted-foreground' }
        : { texto: 'Vencida', clases: 'bg-muted text-muted-foreground' }

  return (
    <span
      className={cn(
        'inline-flex h-5 w-fit items-center rounded-4xl px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        clases,
      )}
    >
      {texto}
    </span>
  )
}

function Cargando() {
  return (
    <div className="flex justify-center py-16 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" aria-label="Cargando" />
    </div>
  )
}

function rangoDelPlan(plan: PlanSuscripcion): string {
  const { publicacionesMinimasMensuales: minimo, publicacionesMaximasMensuales: maximo } = plan

  return minimo > 0 && minimo < maximo ? `${minimo} a ${maximo}` : `hasta ${maximo}`
}

/** `2026-08-21` → `21 ago 2026`. Se parte a mano: `new Date` interpretaría la fecha en UTC. */
function formatearFecha(iso: string): string {
  const [anio, mes, dia] = iso.split('-').map(Number)

  if (!anio || !mes || !dia) return iso

  return new Date(anio, mes - 1, dia).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
