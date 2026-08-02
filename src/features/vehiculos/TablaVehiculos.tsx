import { Eye, ImageOff, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { VehiculoLista } from '@/api/types'
import { formatearKilometraje, formatearPrecio } from '@/lib/formato'
import { resolverUrlImagen } from '@/lib/imagenes'
import { EstadoBadge } from './EstadoBadge'

interface Props {
  vehiculos: VehiculoLista[]
  onEliminar: (vehiculo: VehiculoLista) => void
  /** Id del vehículo cuya eliminación está en curso, para bloquear su fila. */
  eliminandoId?: string
}

export function TablaVehiculos({ vehiculos, onEliminar, eliminandoId }: Props) {
  const navegar = useNavigate()

  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
      {/* La tabla no se comprime por debajo de su ancho mínimo: en móvil se desplaza en horizontal. */}
      <div className="relative w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <caption className="sr-only">Vehículos que has publicado</caption>

          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">
                Vehículo
              </th>
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">
                Modelo
              </th>
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">
                Kilometraje
              </th>
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">
                Ubicación
              </th>
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">
                Estado
              </th>
              <th className="h-10 px-2 text-right align-middle font-medium whitespace-nowrap text-foreground">
                Precio
              </th>
              <th className="h-10 px-2 text-right align-middle font-medium whitespace-nowrap text-foreground">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="[&_tr:last-child]:border-0">
            {vehiculos.map((v) => (
              <tr
                key={v.id}
                className="border-b border-border transition-colors hover:bg-muted/50 aria-busy:opacity-50"
                aria-busy={eliminandoId === v.id}
              >
                <td className="p-2 align-middle whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {v.imagenPrincipal ? (
                      <img
                        src={resolverUrlImagen(v.imagenPrincipal)}
                        alt=""
                        loading="lazy"
                        className="h-12 w-16 shrink-0 rounded-md bg-muted object-contain"
                      />
                    ) : (
                      <span className="grid h-12 w-16 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                        <ImageOff className="size-4" aria-label="Sin imagen" />
                      </span>
                    )}

                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate font-medium text-foreground">
                        {v.marca} {v.linea}
                        {v.esBlindado && (
                          <ShieldCheck className="size-3.5 shrink-0 text-cta" aria-label="Blindado" />
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{v.version}</p>
                    </div>
                  </div>
                </td>

                <td className="p-2 align-middle whitespace-nowrap text-muted-foreground">
                  {v.modelo}
                </td>

                <td className="p-2 align-middle whitespace-nowrap text-muted-foreground">
                  {formatearKilometraje(v.kilometraje)}
                </td>

                <td className="p-2 align-middle whitespace-nowrap text-muted-foreground">
                  {v.ciudad ?? '—'}
                </td>

                <td className="p-2 align-middle whitespace-nowrap">
                  <EstadoBadge estado={v.estado} />
                </td>

                <td className="p-2 text-right align-middle font-medium whitespace-nowrap text-foreground">
                  {formatearPrecio(v.precio)}
                </td>

                <td className="p-2 align-middle whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <BotonAccion
                      etiqueta={`Ver ${v.marca} ${v.linea}`}
                      onClick={() => navegar(`/vehicle/${v.id}`)}
                    >
                      <Eye className="size-4" aria-hidden />
                    </BotonAccion>

                    <BotonAccion
                      etiqueta={`Editar ${v.marca} ${v.linea}`}
                      onClick={() => navegar(`/vehicle/${v.id}/editar`)}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </BotonAccion>

                    <BotonAccion
                      etiqueta={`Eliminar ${v.marca} ${v.linea}`}
                      destructivo
                      disabled={eliminandoId === v.id}
                      onClick={() => onEliminar(v)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </BotonAccion>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface PropsBoton {
  etiqueta: string
  onClick: () => void
  children: React.ReactNode
  destructivo?: boolean
  disabled?: boolean
}

/** Los iconos van sin texto, así que cada botón necesita su propio nombre accesible. */
function BotonAccion({ etiqueta, onClick, children, destructivo, disabled }: PropsBoton) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-all',
        'outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        'disabled:pointer-events-none disabled:opacity-50',
        destructivo
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
