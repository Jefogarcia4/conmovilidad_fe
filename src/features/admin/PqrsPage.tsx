import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Loader2 } from 'lucide-react'
import { adminConvenios } from '@/api/admin'
import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_TIPO,
  adminPqrs,
  type EstadoPqrs,
  type PqrsAdmin,
  type TipoPqrs,
} from '@/api/pqrs'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { CampoFormulario } from '@/components/ui/CampoFormulario'
import { clasesControl } from '@/components/ui/estilosControl'
import { Modal } from '@/components/ui/Modal'
import { formatearFechaCorta } from '@/lib/formato'
import { useDebounce } from '@/lib/useDebounce'
import { cn } from '@/lib/utils'
import { EtiquetaEstadoPqrs } from '@/features/pqrs/EtiquetaEstadoPqrs'
import {
  BotonFila,
  Celda,
  EncabezadoTabla,
  EstadoVacio,
  FilaTabla,
  TablaAdmin,
} from './componentes'

const TIPOS: TipoPqrs[] = ['Peticion', 'Queja', 'Reclamo', 'Sugerencia']
const ESTADOS: EstadoPqrs[] = ['Recibida', 'EnGestion', 'Cerrada']

export function PqrsPage() {
  const [filtros, setFiltros] = useState<{
    convenioId: string
    tipo: string
    estado: string
    busqueda: string
  }>({ convenioId: '', tipo: '', estado: '', busqueda: '' })

  const [abierta, setAbierta] = useState<PqrsAdmin | null>(null)

  // El buscador va contra la API: sin esperar a que el usuario pare de teclear se dispararía una
  // consulta por letra.
  const busqueda = useDebounce(filtros.busqueda, 350)

  const { data: convenios } = useQuery({
    queryKey: ['admin', 'convenios'],
    queryFn: adminConvenios.listar,
  })

  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'pqrs', filtros.convenioId, filtros.tipo, filtros.estado, busqueda],
    queryFn: () =>
      adminPqrs.listar({
        convenioId: filtros.convenioId || undefined,
        tipo: (filtros.tipo || undefined) as TipoPqrs | undefined,
        estado: (filtros.estado || undefined) as EstadoPqrs | undefined,
        busqueda: busqueda || undefined,
        tamanoPagina: 100,
      }),
  })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">
          Peticiones, quejas, reclamos y sugerencias
        </h2>
        <p className="text-sm text-muted-foreground">
          Lo que han radicado los usuarios desde «Contáctanos». Al cerrar una solicitud, la
          respuesta que escribas es la que ve quien la puso.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Filtro etiqueta="Convenio" htmlFor="f-convenio">
          <select
            id="f-convenio"
            value={filtros.convenioId}
            onChange={(e) => setFiltros((f) => ({ ...f, convenioId: e.target.value }))}
            className={cn(clasesControl, 'border-input')}
          >
            <option value="">Todos</option>
            {(convenios ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Filtro>

        <Filtro etiqueta="Tipo" htmlFor="f-tipo">
          <select
            id="f-tipo"
            value={filtros.tipo}
            onChange={(e) => setFiltros((f) => ({ ...f, tipo: e.target.value }))}
            className={cn(clasesControl, 'border-input')}
          >
            <option value="">Todos</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {ETIQUETAS_TIPO[t]}
              </option>
            ))}
          </select>
        </Filtro>

        <Filtro etiqueta="Estado" htmlFor="f-estado">
          <select
            id="f-estado"
            value={filtros.estado}
            onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value }))}
            className={cn(clasesControl, 'border-input')}
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ETIQUETAS_ESTADO[e]}
              </option>
            ))}
          </select>
        </Filtro>

        <Filtro etiqueta="Buscar" htmlFor="f-busqueda">
          <input
            id="f-busqueda"
            value={filtros.busqueda}
            onChange={(e) => setFiltros((f) => ({ ...f, busqueda: e.target.value }))}
            placeholder="Asunto, nombre o documento"
            className={cn(clasesControl, 'border-input')}
          />
        </Filtro>
      </div>

      {error && <Alerta>{(error as Error).message}</Alerta>}

      {isPending ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" aria-label="Cargando" />
        </div>
      ) : data && data.items.length > 0 ? (
        <TablaAdmin>
          <EncabezadoTabla
            columnas={[
              'Radicado',
              'Tipo',
              'Asunto',
              'Solicitante',
              'Fecha',
              'Estado',
              { texto: 'Acciones', derecha: true },
            ]}
          />

          <tbody>
            {data.items.map((p) => (
              <FilaTabla key={p.id} atenuada={p.estado === 'Cerrada'}>
                <Celda>
                  <span className="font-medium text-foreground">{p.radicado}</span>
                </Celda>

                <Celda apagada>{ETIQUETAS_TIPO[p.tipo]}</Celda>

                <Celda>
                  {/* El asunto puede ser largo: se recorta y el detalle está a un clic. */}
                  <span className="block max-w-64 truncate text-foreground" title={p.asunto}>
                    {p.asunto}
                  </span>
                </Celda>

                <Celda>
                  <span className="text-foreground">{p.solicitanteNombre}</span>
                  <span className="block text-xs text-muted-foreground">{p.empresaNombre}</span>
                </Celda>

                <Celda apagada>{formatearFechaCorta(p.fechaCreacion)}</Celda>

                <Celda>
                  <EtiquetaEstadoPqrs estado={p.estado} />
                </Celda>

                <Celda derecha>
                  <BotonFila
                    etiqueta={`Ver y gestionar ${p.radicado}`}
                    onClick={() => setAbierta(p)}
                  >
                    <Eye className="size-4" aria-hidden />
                  </BotonFila>
                </Celda>
              </FilaTabla>
            ))}
          </tbody>
        </TablaAdmin>
      ) : (
        <EstadoVacio mensaje="No hay solicitudes que coincidan con el filtro." />
      )}

      {abierta && <DetallePqrs pqrs={abierta} onCerrar={() => setAbierta(null)} />}
    </div>
  )
}

function Filtro({
  etiqueta,
  htmlFor,
  children,
}: {
  etiqueta: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm leading-none font-medium select-none">
        {etiqueta}
      </label>
      {children}
    </div>
  )
}

function DetallePqrs({ pqrs: p, onCerrar }: { pqrs: PqrsAdmin; onCerrar: () => void }) {
  const clienteConsultas = useQueryClient()
  const [estado, setEstado] = useState<EstadoPqrs>(p.estado)
  const [respuesta, setRespuesta] = useState(p.respuesta ?? '')

  const cerrada = p.estado === 'Cerrada'

  const gestionar = useMutation({
    mutationFn: () => adminPqrs.gestionar(p.id, { estado, respuesta: respuesta.trim() || undefined }),
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ['admin', 'pqrs'] })
      onCerrar()
    },
  })

  return (
    <Modal
      titulo={`${ETIQUETAS_TIPO[p.tipo]} ${p.radicado}`}
      descripcion={p.asunto}
      ancho="lg"
      onCerrar={onCerrar}
      bloqueado={gestionar.isPending}
      pie={
        <>
          <Boton
            variante="secundario"
            type="button"
            onClick={onCerrar}
            disabled={gestionar.isPending}
          >
            {cerrada ? 'Cerrar' : 'Cancelar'}
          </Boton>

          {!cerrada && (
            <Boton onClick={() => gestionar.mutate()} cargando={gestionar.isPending}>
              Guardar
            </Boton>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {gestionar.error && <Alerta>{(gestionar.error as Error).message}</Alerta>}

        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium text-foreground">{p.solicitanteNombre}</p>
          <p className="text-xs text-muted-foreground">
            Documento {p.solicitanteDocumento} · {p.empresaNombre} · {p.convenioNombre}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {[p.solicitanteEmail, p.solicitanteTelefono].filter(Boolean).join(' · ') ||
              'Sin datos de contacto registrados'}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-foreground">
            Radicada el {formatearFechaCorta(p.fechaCreacion)}
          </p>
          <p className="mt-1.5 text-sm whitespace-pre-line text-muted-foreground">{p.mensaje}</p>
        </div>

        {cerrada ? (
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="text-xs font-medium text-foreground">
              Respuesta de {p.respondidaPor ?? 'la administración'}
              {p.fechaRespuesta && ` · ${formatearFechaCorta(p.fechaRespuesta)}`}
            </p>
            <p className="mt-1.5 text-sm whitespace-pre-line text-muted-foreground">
              {p.respuesta}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Una solicitud cerrada ya no admite cambios. Si hay algo nuevo que tratar, el usuario
              puede radicar otra.
            </p>
          </div>
        ) : (
          <>
            <CampoFormulario etiqueta="Estado" htmlFor="pqrs-estado">
              <select
                id="pqrs-estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoPqrs)}
                className={cn(clasesControl, 'border-input')}
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {ETIQUETAS_ESTADO[e]}
                  </option>
                ))}
              </select>
            </CampoFormulario>

            <CampoFormulario
              etiqueta="Respuesta"
              htmlFor="pqrs-respuesta"
              requerido={estado === 'Cerrada'}
              ayuda="Es lo que va a leer quien radicó la solicitud."
            >
              <textarea
                id="pqrs-respuesta"
                rows={6}
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                className={cn(
                  'w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm',
                  'transition-colors outline-none placeholder:text-muted-foreground',
                  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                )}
              />
            </CampoFormulario>
          </>
        )}
      </div>
    </Modal>
  )
}
