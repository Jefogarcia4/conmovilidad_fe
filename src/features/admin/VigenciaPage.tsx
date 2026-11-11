import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CalendarClock, Loader2, MailCheck, UserX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminPublicaciones, type PublicacionPorVencer } from '@/api/publicaciones'
import { Alerta } from '@/components/ui/Alerta'
import { clasesControl } from '@/components/ui/estilosControl'
import { formatearFechaCorta, formatearPrecio } from '@/lib/formato'
import { cn } from '@/lib/utils'
import {
  Celda,
  EncabezadoTabla,
  EstadoVacio,
  FilaTabla,
  TablaAdmin,
} from './componentes'

/** Horizontes que se ofrecen. El vacío deja que la API use la antelación del aviso. */
const HORIZONTES = [
  { valor: '', texto: 'Los que están recibiendo aviso' },
  { valor: '15', texto: 'Próximos 15 días' },
  { valor: '30', texto: 'Próximos 30 días' },
  { valor: '60', texto: 'Próximos 60 días' },
]

export function VigenciaPage() {
  const [horizonte, setHorizonte] = useState('')

  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'vigencia', horizonte],
    queryFn: () => adminPublicaciones.vigencia(horizonte ? Number(horizonte) : undefined),
  })

  return (
    <div className="space-y-6">
      {error && <Alerta>{(error as Error).message}</Alerta>}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Vigencia de publicaciones
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Avisos que están a punto de caerse del catálogo y los que ya cayeron, de todos los
            convenios. Renovar es gratis y lo hace el vendedor desde «Mis vehículos».
          </p>
        </div>

        <select
          aria-label="Horizonte"
          value={horizonte}
          onChange={(e) => setHorizonte(e.target.value)}
          className={cn(clasesControl, 'w-auto border-input')}
        >
          {HORIZONTES.map((h) => (
            <option key={h.valor} value={h.valor}>
              {h.texto}
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
          <div className="grid gap-3 sm:grid-cols-2">
            <Resumen
              titulo="Ya vencidas"
              cantidad={data?.vencidas ?? 0}
              detalle="Fuera del catálogo. Vencieron en los últimos 30 días."
              alerta
            />
            <Resumen
              titulo="Por vencerse"
              cantidad={data?.porVencer ?? 0}
              detalle="Todavía visibles en el catálogo."
            />
          </div>

          {data && data.publicaciones.length > 0 ? (
            <TablaAdmin>
              <EncabezadoTabla
                columnas={[
                  'Vehículo',
                  'Convenio / Empresa',
                  'Vendedor',
                  'Vence',
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
            <EstadoVacio mensaje="No hay publicaciones por vencerse en este horizonte." />
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

function Fila({ publicacion: p }: { publicacion: PublicacionPorVencer }) {
  const vencida = p.diasRestantes <= 0

  return (
    <FilaTabla atenuada={vencida}>
      <Celda>
        {/* Enlace al detalle: el superadministrador sí puede verlo aunque esté vencido. */}
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
          <p className="text-xs text-destructive">Inactivo: no puede renovar</p>
        )}
      </Celda>

      <Celda>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-sm',
            vencida ? 'font-medium text-destructive' : 'text-foreground',
          )}
        >
          {vencida ? (
            <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
          ) : (
            <CalendarClock className="size-3.5 shrink-0" aria-hidden />
          )}
          {textoDias(p.diasRestantes)}
        </span>

        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          {formatearFechaCorta(p.fechaVencimientoPublicacion)}
          {p.avisoEnviado && (
            <>
              <MailCheck className="ml-1 size-3 shrink-0" aria-hidden />
              <span>avisado</span>
            </>
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
  if (dias <= 0) return dias === 0 ? 'Vence hoy' : `Venció hace ${Math.abs(dias)} d`
  if (dias === 1) return 'Vence mañana'

  return `En ${dias} días`
}
