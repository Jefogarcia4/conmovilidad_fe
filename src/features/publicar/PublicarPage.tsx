import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { vehiculos } from '@/api/endpoints'
import { valoresIniciales } from './esquema'
import { FormularioVehiculo } from './FormularioVehiculo'
import { aPeticionVehiculo } from './mapeo'
import type { FormularioPublicacion } from './esquema'
import type { ImagenPublicacion } from './SeccionFotografias'

export function PublicarPage() {
  const navegar = useNavigate()
  const clienteConsultas = useQueryClient()

  const publicar = useMutation({
    mutationFn: ({
      datos,
      imagenes,
    }: {
      datos: FormularioPublicacion
      imagenes: ImagenPublicacion[]
    }) => vehiculos.crear({ ...aPeticionVehiculo(datos, imagenes), publicarInmediatamente: true }),
    onSuccess: async (vehiculo) => {
      await clienteConsultas.invalidateQueries({ queryKey: ['vehiculos'] })
      navegar(`/vehicle/${vehiculo.id}`, { replace: true })
    },
  })

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Publicar un vehículo</h1>
        <p className="text-muted-foreground">
          Completa la información de tu vehículo. Los campos marcados con{' '}
          <span className="text-cta">*</span> son obligatorios.
        </p>
      </header>

      <FormularioVehiculo
        valoresIniciales={valoresIniciales}
        textoEnviar="Publicar Vehículo"
        enviando={publicar.isPending}
        error={publicar.error}
        onEnviar={(datos, imagenes) => publicar.mutate({ datos, imagenes })}
        onCancelar={() => navegar('/my-vehicles')}
      />
    </div>
  )
}
