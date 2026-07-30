import { Building2, HandCoins, MapPin, MessageCircle, Phone, User } from 'lucide-react'
import type { VehiculoDetalle } from '@/api/types'
import { formatearPrecio } from '@/lib/formato'

/** Deja solo dígitos y antepone el indicativo de Colombia si el número viene sin él. */
function aFormatoWhatsApp(telefono: string): string {
  const digitos = telefono.replace(/\D/g, '')
  return digitos.startsWith('57') ? digitos : `57${digitos}`
}

export function PanelContacto({ vehiculo }: { vehiculo: VehiculoDetalle }) {
  const telefono = vehiculo.publicadoPorTelefono ?? vehiculo.empresaTelefono
  const descripcion = `${vehiculo.marca} ${vehiculo.linea} ${vehiculo.modelo}`

  const mensaje = encodeURIComponent(
    `Hola, vi el ${descripcion} publicado en Autos Galería por ${formatearPrecio(vehiculo.precio)} y me interesa.`,
  )

  return (
    <aside className="sticky top-20 rounded-2xl bg-card ring-1 ring-foreground/10">
      <div className="space-y-5 p-5">
        <div>
          <p className="text-sm text-muted-foreground">Precio de venta</p>
          <p className="font-display text-3xl font-bold text-foreground">
            {formatearPrecio(vehiculo.precio)}
          </p>
          {vehiculo.precioNegociable && (
            <p className="mt-0.5 text-xs text-muted-foreground">Precio negociable</p>
          )}
        </div>

        <div className="h-px w-full bg-border" />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="size-5" aria-hidden />
            </span>

            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{vehiculo.publicadoPor}</p>
              {/* En esta plataforma todo vendedor publica a nombre de una empresa del convenio;
                  no existen particulares, así que la etiqueta es fija. */}
              <p className="text-xs text-muted-foreground">Empresa</p>
            </div>
          </div>

          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Building2 className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{vehiculo.empresaNombre}</span>
            </p>

            {vehiculo.ciudad && (
              <p className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" aria-hidden />
                {vehiculo.ciudad}
              </p>
            )}

            {telefono && (
              <p className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" aria-hidden />
                {telefono}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {telefono ? (
            <>
              <a
                href={`https://wa.me/${aFormatoWhatsApp(telefono)}?text=${mensaje}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-cta px-2.5 text-sm font-medium text-cta-foreground transition-all hover:bg-cta-hover"
              >
                <MessageCircle className="size-4" aria-hidden />
                Contactar por WhatsApp
              </a>

              <a
                href={`tel:${telefono.replace(/\s/g, '')}`}
                className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-all hover:bg-muted"
              >
                <Phone className="size-4" aria-hidden />
                <span className="truncate">Contactar {vehiculo.empresaNombre}</span>
              </a>
            </>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
              Este vendedor aún no registró un teléfono de contacto.
            </p>
          )}

          <button
            type="button"
            disabled
            title="Disponible próximamente"
            className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-all hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            <HandCoins className="size-4" aria-hidden />
            Solicitar Financiación
          </button>
        </div>
      </div>
    </aside>
  )
}
