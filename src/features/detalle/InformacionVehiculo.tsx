import { Calendar, Fuel, Gauge, Users, type LucideIcon } from 'lucide-react'
import type { VehiculoDetalle } from '@/api/types'
import { useEtiquetasVehiculo } from '@/features/vehiculos/useEtiquetasVehiculo'
import { formatearKilometraje } from '@/lib/formato'

/** `2026-03-15` → `15-03-2026`. Se parte el texto en vez de usar `Date` para no correr un día por zona horaria. */
function formatearFecha(iso: string | undefined): string | null {
  if (!iso) return null

  const [anio, mes, dia] = iso.slice(0, 10).split('-')
  return anio && mes && dia ? `${dia}-${mes}-${anio}` : null
}

export function InformacionVehiculo({ vehiculo }: { vehiculo: VehiculoDetalle }) {
  const etiqueta = useEtiquetasVehiculo()

  const destacados: { Icono: LucideIcon; titulo: string; valor: string }[] = [
    { Icono: Gauge, titulo: 'Kilometraje', valor: formatearKilometraje(vehiculo.kilometraje) },
    { Icono: Calendar, titulo: 'Año', valor: String(vehiculo.modelo) },
    { Icono: Fuel, titulo: 'Combustible', valor: etiqueta(vehiculo.combustible) },
    {
      Icono: Users,
      titulo: 'Capacidad',
      valor: vehiculo.capacidadPasajeros ? `${vehiculo.capacidadPasajeros} pasajeros` : '—',
    },
  ]

  // Un documento vencido no tiene fecha que mostrar: el hecho es la información.
  const soat = vehiculo.soatVencido ? 'Vencido' : formatearFecha(vehiculo.vencimientoSoat)
  const tecno = vehiculo.tecnomecanicaVencida
    ? 'Vencido'
    : formatearFecha(vehiculo.vencimientoTecnomecanica)

  const columnaIzquierda: [string, string | null][] = [
    ['Placa', vehiculo.placa],
    ['Ciudad de matrícula', vehiculo.ciudadMatricula ?? null],
    ['Marca', vehiculo.marca],
    ['Modelo', vehiculo.linea],
    ['Versión', vehiculo.version ?? null],
    ['Año', String(vehiculo.modelo)],
    ['Kilometraje', formatearKilometraje(vehiculo.kilometraje)],
    ['Cilindraje', vehiculo.cilindraje ? vehiculo.cilindraje.toLocaleString('es-CO') : null],
  ]

  const columnaDerecha: [string, string | null][] = [
    ['Color', vehiculo.color],
    ['Clase de vehículo', etiqueta(vehiculo.tipoVehiculo)],
    ['Combustible', etiqueta(vehiculo.combustible)],
    ['Transmisión', vehiculo.transmision ? etiqueta(vehiculo.transmision) : null],
    [
      'Capacidad',
      vehiculo.capacidadPasajeros ? `${vehiculo.capacidadPasajeros} pasajeros` : null,
    ],
    ['Vencimiento SOAT', soat],
    ['Vencimiento Tecnomecánica', tecno],
    ['Ubicación', vehiculo.ciudad ?? null],
  ]

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold text-foreground">Información del vehículo</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {destacados.map(({ Icono, titulo, valor }) => (
          <div
            key={titulo}
            className="flex items-center gap-3 rounded-xl border border-border px-4 py-3"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
              <Icono className="size-4 text-muted-foreground" aria-hidden />
            </span>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{titulo}</p>
              <p className="truncate font-semibold text-foreground">{valor}</p>
            </div>
          </div>
        ))}
      </div>

      <dl className="mt-6 grid gap-x-10 md:grid-cols-2">
        <Columna filas={columnaIzquierda} />
        <Columna filas={columnaDerecha} />
      </dl>

      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 rounded-xl border border-border px-4 py-3">
        <Condicion activa={vehiculo.tienePrenda} texto="Tiene prenda / gravamen financiero" />
        <Condicion activa={vehiculo.esBlindado} texto="Vehículo blindado" />
      </div>
    </section>
  )
}

/** Omite las filas sin dato: una etiqueta con un guion no aporta nada al comprador. */
function Columna({ filas }: { filas: [string, string | null][] }) {
  return (
    <div>
      {filas
        .filter(([, valor]) => valor)
        .map(([titulo, valor]) => (
          <div
            key={titulo}
            className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0"
          >
            <dt className="text-sm text-muted-foreground">{titulo}</dt>
            <dd className="text-right text-sm font-medium text-foreground">{valor}</dd>
          </div>
        ))}
    </div>
  )
}

/**
 * Condición del vehículo en solo lectura. Mantiene la forma de casilla del diseño, pero como
 * imagen semántica: no es un control, así que no debe poder recibir foco ni anunciarse como tal.
 */
function Condicion({ activa, texto }: { activa: boolean; texto: string }) {
  return (
    <p className="flex items-center gap-2 text-sm">
      <span
        role="img"
        aria-label={activa ? `Sí: ${texto}` : `No: ${texto}`}
        className={
          activa
            ? 'grid size-4 shrink-0 place-items-center rounded-[4px] bg-cta text-[10px] leading-none font-bold text-cta-foreground'
            : 'size-4 shrink-0 rounded-[4px] border border-input'
        }
      >
        {activa ? '✓' : ''}
      </span>

      <span className={activa ? 'text-foreground' : 'text-muted-foreground'}>{texto}</span>
    </p>
  )
}
