import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarClock, Loader2, MailCheck, UserX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminPublicaciones, type PublicacionEnSeguimiento } from '@/api/publicaciones'
import { Alerta } from '@/components/ui/Alerta'
import { clasesControl } from '@/components/ui/estilosControl'
import { formatearFechaCorta, formatearPrecio } from '@/lib/formato'
import { cn } from '@/lib/utils'
import { Celda, EncabezadoTabla, EstadoVacio, FilaTabla, TablaAdmin } from './componentes'

const FILTROS = [
  { valor: '30', texto: 'Más de un mes publicado' },
  { valor: '90', texto: 'Más de tres meses' },
  { valor: '180', texto: 'Más de seis meses' },
  { valor: '', texto: 'Todas las publicaciones' },
]

export function SeguimientoPage() {
  const [dias, setDias] = useState('30')

  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'seguimiento', dias],
    queryFn: () => adminPublicaciones.seguimiento(dias ? Number(dias) : undefined),
  })

  return (
    <div className="space-y-6">
      {error && <Alerta>{(error as Error).message}</Alerta>}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Seguimiento del catálogo
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Lo que lleva más tiempo sin venderse, de todos los convenios y empezando por lo más
            antiguo. Las publicaciones no se vencen: esto no es una lista de lo que se va a caer,
            sino de a qué conviene ayudarle —revisar precio, fotos o descripción—.
          </p>
        </div>

        <select
          aria-label="Antigüedad"
          value={dias}
          onChange={(e) => setDias(e.target.value)}
          className={cn(clasesControl, 'w-auto border-input')}
        >
          {FILTROS.map((f) => (
            <option key={f.valor} value={f.valor}>
              {f.texto}
            </option>
          ))}
        </select>
      </div>

      {isPending ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" aria-label="Cargando" />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Resumen
              titulo="En esta lista"
              cantidad={data?.total ?? 0}
              detalle="Publicaciones visibles en el catálogo."
            />
            <Resumen
              titulo="Más de tres meses"
              cantidad={data?.sinVenderTresMeses ?? 0}
              detalle="Candidatas a revisar precio y fotos."
              alerta
            />
            <Resumen
              titulo="Vendedor inactivo"
              cantidad={data?.vendedorInactivo ?? 0}
              detalle="Siguen publicadas, pero nadie recibe el seguimiento."
              alerta
            />
          </div>

          {data && data.publicaciones.length > 0 ? (
            <TablaAdmin>
              <EncabezadoTabla
                columnas={[
                  'Vehículo',
                  'Convenio / Empresa',
                  'Vendedor',
                  'Publicado',
                  { texto: 'Precio', derecha: true },
                ]}
              />

              <tbody>
                {data.publicaciones.map((p) => (
                  <Fila key={p.id} publicacion={p} />
                ))}
              </tbody>
            </TablaAdmin>
          ) : (
            <EstadoVacio mensaje="No hay publicaciones con esa antigüedad." />
          )}
        </>
      )}
    </div>
  )
}

function Resumen({
  titulo,
  cantidad,
  detalle,
  alerta = false,
}: {
  titulo: string
  cantidad: number
  detalle: string
  alerta?: boolean
}) {
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
      <p className="text-sm font-medium text-muted-foreground">{titulo}</p>
      <p
        className={cn(
          'font-display text-3xl font-bold',
          alerta && cantidad > 0 ? 'text-destructive' : 'text-foreground',
        )}
      >
        {cantidad}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{detalle}</p>
    </div>
  )
}

function Fila({ publicacion: p }: { publicacion: PublicacionEnSeguimiento }) {
  const viejo = p.diasPublicado > 90

  return (
    <FilaTabla>
      <Celda>
        <Link to={`/vehicle/${p.id}`} className="font-medium text-foreground hover:underline">
          {p.vehiculo}
        </Link>
        <p className="text-xs text-muted-foreground">
          {p.placa} · {p.estado}
        </p>
      </Celda>

      <Celda apagada>
        {p.convenioNombre}
        <p className="text-xs">{p.empresaNombre}</p>
      </Celda>

      <Celda apagada>
        <span className="inline-flex items-center gap-1.5">
          {!p.vendedorActivo && <UserX className="size-3.5 shrink-0 text-destructive" aria-hidden />}
          {p.publicadoPor}
        </span>

        {!p.vendedorActivo && (
          <p className="text-xs text-destructive">Inactivo: no recibe el seguimiento</p>
        )}
      </Celda>

      <Celda>
        <span
          className={cn(
            'text-sm',
            viejo ? 'font-medium text-destructive' : 'text-foreground',
          )}
        >
          {textoDias(p.diasPublicado)}
        </span>

        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          {p.fechaPublicacion ? formatearFechaCorta(p.fechaPublicacion) : '—'}

          {p.avisoRevisionEnviadoEn ? (
            <>
              <MailCheck className="ml-1 size-3 shrink-0" aria-hidden />
              <span>avisado</span>
            </>
          ) : (
            p.diasParaRevision > 0 && (
              <>
                <CalendarClock className="ml-1 size-3 shrink-0" aria-hidden />
                <span>revisión en {p.diasParaRevision} d</span>
              </>
            )
          )}
        </p>
      </Celda>

      <Celda derecha>
        <span className="font-medium text-foreground">{formatearPrecio(p.precio)}</span>
      </Celda>
    </FilaTabla>
  )
}

function textoDias(dias: number): string {
  if (dias < 1) return 'Hoy'
  if (dias === 1) return '1 día'
  if (dias < 30) return `${dias} días`

  const meses = Math.floor(dias / 30)

  return meses === 1 ? 'Un mes' : `${meses} meses`
}
