import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '@/api/cliente'
import { useAuth } from '@/auth/useAuth'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { Logo } from '@/components/ui/Logo'
import { PanelMarca } from './PanelMarca'

const esquema = z.object({
  usuario: z
    .string()
    .trim()
    .min(1, 'Ingresa tu número de documento.')
    .regex(/^[A-Za-z0-9.\s-]+$/, 'El documento solo admite letras, números, puntos y guiones.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
  acepta: z.literal(true, {
    message: 'Debes aceptar los Términos y Condiciones para continuar.',
  }),
})

type Formulario = z.infer<typeof esquema>

export function LoginPage() {
  const { iniciarSesion } = useAuth()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { usuario: '', password: '', acepta: false as unknown as true },
  })

  const onSubmit = handleSubmit(async ({ usuario, password }) => {
    setErrorGeneral(null)

    try {
      await iniciarSesion(usuario, password)

      // Vuelve a donde el usuario intentaba entrar antes de que lo mandáramos al login.
      const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/home'
      navegar(destino, { replace: true })
    } catch (error) {
      setErrorGeneral(
        error instanceof ApiError ? error.message : 'No pudimos iniciar sesión. Inténtalo de nuevo.',
      )
    }
  })

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <PanelMarca />

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            {/* En móvil no hay panel de marca, así que el logo se muestra aquí. */}
            <Logo className="mx-auto h-10 lg:hidden" />

            <h2 className="font-display text-2xl font-bold text-foreground">Bienvenido de nuevo</h2>

            <p className="text-sm text-muted-foreground">
              Ingresa a tu cuenta de{' '}
              <span className="font-medium text-foreground">ConMovilidad</span>
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-5">
            {errorGeneral && <Alerta>{errorGeneral}</Alerta>}

            <Campo
              etiqueta="Número de documento"
              placeholder="1020304050"
              type="text"
              inputMode="numeric"
              autoComplete="username"
              error={errors.usuario?.message}
              {...register('usuario')}
            />

            <div className="space-y-2">
              <Campo
                etiqueta="Contraseña"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                conRevelarPassword
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex justify-end">
                <a
                  href="/recuperar-password"
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-2.5">
                <input
                  id="terminos"
                  type="checkbox"
                  {...register('acepta')}
                  className="mt-0.5 size-4 shrink-0 rounded-[4px] border-input accent-cta"
                />
                <label
                  htmlFor="terminos"
                  className="text-sm leading-snug font-normal text-muted-foreground select-none"
                >
                  Acepto{' '}
                  <a
                    href="/terminos"
                    className="font-medium text-cta underline-offset-2 hover:underline"
                  >
                    Términos y Condiciones
                  </a>{' '}
                  y{' '}
                  <a
                    href="/habeas-data"
                    className="font-medium text-cta underline-offset-2 hover:underline"
                  >
                    Habeas Data
                  </a>
                </label>
              </div>

              {errors.acepta && (
                <p className="mt-1.5 text-sm text-destructive">{errors.acepta.message}</p>
              )}
            </div>

            <Boton type="submit" tamano="lg" cargando={isSubmitting} className="w-full">
              {isSubmitting ? 'Ingresando…' : 'Iniciar Sesión'}
            </Boton>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <a href="/solicitar-cuenta" className="font-medium text-cta hover:underline">
              ¡Solicita una!
            </a>
          </p>
        </div>
      </section>
    </main>
  )
}
