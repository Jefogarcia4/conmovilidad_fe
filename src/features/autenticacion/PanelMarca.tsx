import { ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

/**
 * Mitad izquierda del login. La foto va al 40% sobre el gris oscuro de la marca y encima lleva
 * un degradado ascendente: así el texto conserva contraste sobre la zona clara del showroom.
 * Se oculta por debajo de `lg` para que en móvil el formulario ocupe toda la pantalla.
 */
export function PanelMarca() {
  return (
    <section className="relative hidden overflow-hidden bg-primary lg:block">
      <img
        src="/hero/hero-showroom.png"
        alt="Concesionario premium de vehículos"
        className="absolute inset-0 size-full object-cover opacity-40"
        fetchPriority="high"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/30" />

      <div className="relative flex h-full flex-col justify-between p-12">
        {/* Sin caja blanca: el emblema es oscuro y se integra en el degradado del panel. */}
        <Logo tamano="lg" className="text-primary-foreground" />

        <div className="space-y-4 text-primary-foreground">
          <h1 className="max-w-md text-balance font-display text-4xl leading-tight font-bold">
            El marketplace donde tu próximo vehículo te encuentra.
          </h1>

          <p className="max-w-sm text-pretty text-primary-foreground/70">
            Explora miles de autos, camionetas y motos verificados. Compra y vende con total
            confianza.
          </p>

          <div className="flex items-center gap-2 pt-2 text-sm text-primary-foreground/80">
            <ShieldCheck className="size-5 text-cta" aria-hidden />
            Vehículos con documentación al día
          </div>
        </div>
      </div>
    </section>
  )
}
