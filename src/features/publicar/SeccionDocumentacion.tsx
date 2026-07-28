import { FileText } from 'lucide-react'
import { Controller, type Control, type FieldErrors, type UseFormWatch } from 'react-hook-form'
import { CampoFormulario } from '@/components/ui/CampoFormulario'
import { clasesControl } from '@/components/ui/estilosControl'
import { Casilla } from '@/components/ui/Casilla'
import { SeccionFormulario } from '@/components/ui/SeccionFormulario'
import { cn } from '@/lib/utils'
import type { FormularioPublicacion } from './esquema'

interface Props {
  control: Control<FormularioPublicacion>
  errors: FieldErrors<FormularioPublicacion>
  watch: UseFormWatch<FormularioPublicacion>
}

export function SeccionDocumentacion({ control, errors, watch }: Props) {
  const soatVencido = watch('soatVencido')
  const tecnoVencida = watch('tecnomecanicaVencida')

  return (
    <SeccionFormulario
      titulo="Documentación y estado legal"
      descripcion="Vigencias y condiciones especiales del vehículo."
      Icono={FileText}
    >
      <CampoFormulario
        etiqueta="Vencimiento SOAT"
        htmlFor="soat"
        error={errors.vencimientoSoat?.message}
        className="lg:col-span-1"
      >
        <div className="space-y-2">
          {/* La casilla va sobre el campo porque al marcarla lo anula: verlo primero explica
              por qué la fecha queda deshabilitada. */}
          <Controller
            control={control}
            name="soatVencido"
            render={({ field }) => (
              <Casilla
                id="soat-vencido"
                etiqueta="Vencido"
                checked={field.value ?? false}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="vencimientoSoat"
            render={({ field }) => (
              <input
                {...field}
                id="soat"
                type="date"
                value={field.value ?? ''}
                disabled={soatVencido}
                className={cn(clasesControl, 'border-input')}
              />
            )}
          />
        </div>
      </CampoFormulario>

      <CampoFormulario
        etiqueta="Vencimiento Tecnomecánica"
        htmlFor="tecnomecanica"
        error={errors.vencimientoTecnomecanica?.message}
      >
        <div className="space-y-2">
          <Controller
            control={control}
            name="tecnomecanicaVencida"
            render={({ field }) => (
              <Casilla
                id="tecno-vencida"
                etiqueta="Vencido"
                checked={field.value ?? false}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="vencimientoTecnomecanica"
            render={({ field }) => (
              <input
                {...field}
                id="tecnomecanica"
                type="date"
                value={field.value ?? ''}
                disabled={tecnoVencida}
                className={cn(clasesControl, 'border-input')}
              />
            )}
          />
        </div>
      </CampoFormulario>

      <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4 sm:col-span-2 lg:col-span-3">
        <Controller
          control={control}
          name="tienePrenda"
          render={({ field }) => (
            <Casilla
              id="prenda"
              etiqueta="El vehículo tiene prenda / gravamen financiero"
              checked={field.value ?? false}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="esBlindado"
          render={({ field }) => (
            <Casilla
              id="blindado"
              etiqueta="El vehículo es blindado"
              checked={field.value ?? false}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </SeccionFormulario>
  )
}
