import { CreditCard, Tag } from 'lucide-react'
import type { EstadoVehiculo } from '@/api/types'
import { CampoFormulario } from '@/components/ui/CampoFormulario'
import { ComboBox } from '@/components/ui/ComboBox'
import { SeccionFormulario } from '@/components/ui/SeccionFormulario'
import { presentarEstado } from '@/features/vehiculos/estadoVehiculo'

/**
 * «Inactivo» queda fuera a propósito: retirar una publicación se hace con el botón de eliminar,
 * y ofrecer dos caminos para lo mismo solo confunde.
 */
const ESTADOS: EstadoVehiculo[] = ['Borrador', 'Disponible', 'Reservado', 'Vendido']

const AYUDA: Partial<Record<EstadoVehiculo, string>> = {
  Borrador: 'No aparece en el catálogo: solo tú lo ves desde «Mis vehículos».',
  Disponible: 'Visible en el catálogo para todo tu convenio.',
  Reservado: 'Sigue visible, marcado como reservado por un interesado.',
  Vendido: 'Se conserva el registro, marcado como vendido.',
  PendientePago: 'Esperando la aprobación del pago; todavía no aparece en el catálogo.',
}

interface Props {
  valor: EstadoVehiculo
  onCambio: (estado: EstadoVehiculo) => void
  /** Advertencia del costo al elegir «Disponible», cuando la publicación aún no está pagada. */
  avisoPago?: string
}

export function SeccionEstado({ valor, onCambio, avisoPago }: Props) {
  // «Pendiente de pago» no se elige, se llega a él: se ofrece solo si es el estado actual, para
  // que el desplegable no aparezca vacío mientras se espera la aprobación.
  const opciones = ESTADOS.includes(valor) ? ESTADOS : [valor, ...ESTADOS]

  return (
    <SeccionFormulario
      titulo="Estado de la publicación"
      descripcion="Controla dónde y cómo se muestra el vehículo."
      Icono={Tag}
    >
      <CampoFormulario etiqueta="Estado" htmlFor="estado" ayuda={AYUDA[valor]}>
        <ComboBox
          id="estado"
          valor={valor}
          onCambio={(v) => onCambio(v as EstadoVehiculo)}
          textoVacio="Selecciona el estado"
          opciones={opciones.map((e) => ({ valor: e, etiqueta: presentarEstado(e).etiqueta }))}
        />
      </CampoFormulario>

      {avisoPago && valor === 'Disponible' && (
        <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <CreditCard className="mt-0.5 size-4 shrink-0 text-cta" aria-hidden />
          {avisoPago}
        </p>
      )}
    </SeccionFormulario>
  )
}
