import { useQuery } from '@tanstack/react-query'
import { autenticacion } from '@/api/endpoints'
import { formatearPrecio, formatearTasa } from '@/lib/formato'
import { cn } from '@/lib/utils'

/**
 * Aliado que otorga el crédito. Va en el texto del aviso porque el cupo no es de la plataforma
 * sino de ellos, y el usuario tiene que saber con quién lo tiene.
 */
const ALIADO = 'Presente'

/**
 * Anuncia al usuario el cupo de crédito que tiene aprobado, y le avisa cuando el vehículo que
 * está mirando no le cabe dentro.
 *
 * El cupo se consulta a la API en lugar de leerlo de la sesión guardada: lo cambia el
 * administrador —a mano o por carga masiva— y un cupo desactualizado en pantalla es peor que no
 * mostrarlo, porque el usuario toma decisiones con él.
 */
export function AvisoCupo({
  saludar = false,
  precioVehiculo,
  className,
}: {
  /** Antepone «Hola, {nombre}!». Se usa en el catálogo, donde el aviso recibe al usuario. */
  saludar?: boolean
  /** Precio contra el que comparar. Sin él, el aviso solo anuncia el cupo. */
  precioVehiculo?: number
  className?: string
}) {
  const { data: usuario } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: autenticacion.perfil,
  })

  // Sin cupo asignado no hay nada que anunciar. Nulo no es cero: a quien no tiene cupo no se le
  // dice que su cupo no alcanza, simplemente no se le habla de cupos.
  if (usuario?.cupoCredito === undefined) {
    return null
  }

  const cupo = usuario.cupoCredito
  const noAlcanza = precioVehiculo !== undefined && precioVehiculo > cupo

  return (
    <div
      className={cn(
        'rounded-xl px-4 py-3 text-center text-sm leading-snug',
        noAlcanza
          ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400'
          : 'bg-cta text-cta-foreground',
        className,
      )}
    >
      {saludar && (
        <p className="font-display text-base font-bold">
          Hola {primerNombre(usuario.nombres)}!
        </p>
      )}

      {noAlcanza ? (
        <p>
          Este vehículo supera tu cupo disponible con {ALIADO}, que es de{' '}
          <strong className="font-semibold">{formatearPrecio(cupo)}</strong>.
        </p>
      ) : (
        <p>
          Tienes un cupo disponible con {ALIADO} de{' '}
          <strong className="font-semibold">{formatearPrecio(cupo)}</strong>
          {usuario.tasaInteres !== undefined && (
            <>
              {' '}
              y tasa de intereses del{' '}
              <strong className="font-semibold">{formatearTasa(usuario.tasaInteres)} MV</strong>
            </>
          )}
        </p>
      )}
    </div>
  )
}

/** «Alejandro José» → «Alejandro». El saludo usa un solo nombre, como en cualquier conversación. */
function primerNombre(nombres: string): string {
  return nombres.trim().split(/\s+/)[0] ?? nombres
}
