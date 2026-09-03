import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Loader2, MessageSquare } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ETIQUETAS_TIPO, pqrs, type MiPqrs, type TipoPqrs } from '@/api/pqrs'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { CampoFormulario } from '@/components/ui/CampoFormulario'
import { clasesControl } from '@/components/ui/estilosControl'
import { formatearFechaCorta } from '@/lib/formato'
import { cn } from '@/lib/utils'
import { EtiquetaEstadoPqrs } from './EtiquetaEstadoPqrs'

const TIPOS: TipoPqrs[] = ['Peticion', 'Queja', 'Reclamo', 'Sugerencia']

const esquema = z.object({
  tipo: z.enum(['Peticion', 'Queja', 'Reclamo', 'Sugerencia']),
  asunto: z.string().trim().min(1, 'Escribe un asunto.').max(150),
  // El mismo mínimo que exige la API: un mensaje de tres letras no se puede atender.
  mensaje: z
    .string()
    .trim()
    .min(20, 'Describe tu solicitud con al menos 20 caracteres.')
    .max(4000),
})

type Formulario = z.infer<typeof esquema>

export function ContactoPage() {
  const clienteConsultas = useQueryClient()

  const { data: mias, isPending } = useQuery({
    queryKey: ['pqrs', 'mis'],
    queryFn: pqrs.mis,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { tipo: 'Peticion', asunto: '', mensaje: '' },
  })

  const radicar = useMutation({
    mutationFn: (datos: Formulario) => pqrs.crear(datos),
    onSuccess: async () => {
      reset()
      await clienteConsultas.invalidateQueries({ queryKey: ['pqrs', 'mis'] })
    },
  })

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Contáctanos</h1>
        <p className="text-muted-foreground">
          Radica aquí tus peticiones, quejas, reclamos y sugerencias. Te responderemos al correo y
          al celular registrados en tu cuenta.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <form
          onSubmit={handleSubmit((datos) => radicar.mutateAsync(datos))}
          noValidate
          className="space-y-4"
        >
          {radicar.error && <Alerta>{(radicar.error as Error).message}</Alerta>}

          {radicar.isSuccess && (
            <p className="flex items-start gap-2.5 rounded-xl border border-cta/25 bg-cta/5 px-4 py-3 text-sm text-foreground">
              <CheckCircle2 className="mt-px size-4 shrink-0 text-cta" aria-hidden />
              <span>
                Radicamos tu solicitud con el número{' '}
                <strong>{radicar.data.radicado}</strong>. La verás abajo con su estado.
              </span>
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <CampoFormulario
              etiqueta="Tipo"
              htmlFor="pqrs-tipo"
              requerido
              error={errors.tipo?.message}
            >
              <select
                id="pqrs-tipo"
                {...register('tipo')}
                className={cn(clasesControl, 'border-input')}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {ETIQUETAS_TIPO[t]}
                  </option>
                ))}
              </select>
            </CampoFormulario>

            <CampoFormulario
              etiqueta="Asunto"
              htmlFor="pqrs-asunto"
              requerido
              error={errors.asunto?.message}
              className="sm:col-span-2"
            >
              <input
                id="pqrs-asunto"
                {...register('asunto')}
                placeholder="Resume en una línea de qué se trata"
                className={cn(
                  clasesControl,
                  errors.asunto ? 'border-destructive' : 'border-input',
                )}
              />
            </CampoFormulario>
          </div>

          <CampoFormulario
            etiqueta="Mensaje"
            htmlFor="pqrs-mensaje"
            requerido
            error={errors.mensaje?.message}
            ayuda="Cuéntanos con detalle qué pasó; entre más contexto, mejor te podemos responder."
          >
            <textarea
              id="pqrs-mensaje"
              rows={6}
              {...register('mensaje')}
              className={cn(
                'w-full rounded-lg border bg-transparent px-2.5 py-2 text-sm',
                'transition-colors outline-none placeholder:text-muted-foreground',
                'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                errors.mensaje ? 'border-destructive' : 'border-input',
              )}
            />
          </CampoFormulario>

          <div className="flex justify-end">
            <Boton type="submit" cargando={radicar.isPending}>
              Radicar solicitud
            </Boton>
          </div>
        </form>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Tus radicados</h2>

        {isPending ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" aria-label="Cargando" />
          </div>
        ) : mias && mias.length > 0 ? (
          <ul className="space-y-3">
            {mias.map((p) => (
              <Radicado key={p.id} pqrs={p} />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            Todavía no has radicado ninguna solicitud.
          </p>
        )}
      </section>
    </div>
  )
}

function Radicado({ pqrs: p }: { pqrs: MiPqrs }) {
  return (
    <li className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-foreground">{p.asunto}</p>
          <p className="text-xs text-muted-foreground">
            {p.radicado} · {ETIQUETAS_TIPO[p.tipo]} · {formatearFechaCorta(p.fechaCreacion)}
          </p>
        </div>

        <EtiquetaEstadoPqrs estado={p.estado} />
      </div>

      <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">{p.mensaje}</p>

      {p.respuesta && (
        <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <MessageSquare className="size-3.5 text-cta" aria-hidden />
            Respuesta {p.fechaRespuesta && `· ${formatearFechaCorta(p.fechaRespuesta)}`}
          </p>
          <p className="mt-1.5 text-sm whitespace-pre-line text-muted-foreground">{p.respuesta}</p>
        </div>
      )}
    </li>
  )
}
