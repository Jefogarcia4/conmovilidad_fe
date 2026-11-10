import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { autenticacion } from '@/api/endpoints'
import { ApiError } from '@/api/cliente'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { Logo } from '@/components/ui/Logo'
import { PanelMarca } from './PanelMarca'

/** El mismo mínimo que exige la API. */
const LONGITUD_MINIMA = 8

const esquema = z
  .object({
    password: z.string().min(LONGITUD_MINIMA, `Mínimo ${LONGITUD_MINIMA} caracteres.`),
    confirmacion: z.string(),
  })
  .refine((d) => d.password === d.confirmacion, {
    path: ['confirmacion'],
    message: 'Las contraseñas no coinciden.',
  })

type Formulario = z.infer<typeof esquema>

export function RestablecerPasswordPage() {
  const [parametros] = useSearchParams()
  const token = parametros.get('token')

  const [listo, setListo] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { password: '', confirmacion: '' },
  })

  const onSubmit = handleSubmit(async ({ password }) => {
    setErrorGeneral(null)

    try {
      await autenticacion.restablecerPassword(token!, password)
      setListo(true)
    } catch (error) {
      setErrorGeneral(
        error instanceof ApiError ? error.message : 'No pudimos cambiar la contraseña.',
      )
    }
  })

  return (
    <main className="grid min-h-dvh lg:grid-cols-[auto_1fr]">
      <PanelMarca />

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <Logo className="mx-auto h-10 lg:hidden" />

            <h2 className="font-display text-2xl font-bold text-foreground">
              {listo ? 'Contraseña actualizada' : 'Crea tu nueva contraseña'}
            </h2>

            {!listo && (
              <p className="text-sm text-muted-foreground">
                Elige una contraseña que no hayas usado antes.
              </p>
            )}
          </div>

          {/* Sin token no hay nada que hacer: se llegó aquí sin pasar por el correo. */}
          {!token ? (
            <div className="space-y-5">
              <Alerta>
                El enlace está incompleto. Vuelve a solicitarlo desde «¿Olvidaste tu contraseña?».
              </Alerta>

              <Link to="/recuperar-password" className="block">
                <Boton className="w-full">Solicitar un enlace nuevo</Boton>
              </Link>
            </div>
          ) : listo ? (
            <div className="space-y-5 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-cta/10 text-cta">
                <CheckCircle2 className="size-7" aria-hidden />
              </span>

              <p className="text-sm text-muted-foreground">
                Ya puedes ingresar con tu documento y la contraseña que acabas de crear. Si tenías
                sesión abierta en otro dispositivo, se cerró.
              </p>

              <Link to="/login" className="block">
                <Boton className="w-full">Ingresar</Boton>
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              {errorGeneral && (
                <div className="space-y-3">
                  <Alerta>{errorGeneral}</Alerta>

                  <p className="text-center text-sm">
                    <Link
                      to="/recuperar-password"
                      className="font-medium text-cta hover:underline"
                    >
                      Solicitar un enlace nuevo
                    </Link>
                  </p>
                </div>
              )}

              <Campo
                etiqueta="Nueva contraseña"
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                conRevelarPassword
                error={errors.password?.message}
                {...register('password')}
              />

              <Campo
                etiqueta="Confirma la contraseña"
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                conRevelarPassword
                error={errors.confirmacion?.message}
                {...register('confirmacion')}
              />

              <Boton type="submit" tamano="lg" cargando={isSubmitting} className="w-full">
                {isSubmitting ? 'Guardando…' : 'Guardar contraseña'}
              </Boton>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
