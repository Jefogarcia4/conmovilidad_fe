import { Tag } from 'lucide-react'
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
}

interface Props {
  valor: EstadoVehiculo
  onCambio: (estado: EstadoVehiculo) => void
}

export function SeccionEstado({ valor, onCambio }: Props) {
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
          opciones={ESTADOS.map((e) => ({ valor: e, etiqueta: presentarEstado(e).etiqueta }))}
        />
      </CampoFormulario>
    </SeccionFormulario>
  )
}
