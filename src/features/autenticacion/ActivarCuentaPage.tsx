import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '@/api/cliente'
import { autenticacion } from '@/api/endpoints'
import { useAuth } from '@/auth/useAuth'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { Logo } from '@/components/ui/Logo'

const esquema = z
  .object({
    passwordActual: z.string().min(1, 'Ingresa la contraseña con la que entraste.'),
    passwordNuevo: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula.')
      .regex(/[a-z]/, 'Debe incluir al menos una letra minúscula.')
      .regex(/[0-9]/, 'Debe incluir al menos un número.'),
    confirmacion: z.string().min(1, 'Repite la contraseña nueva.'),
    emailRecuperacion: z
      .string()
      .trim()
      .min(1, 'El correo de recuperación es obligatorio.')
      .email('Ingresa un correo válido.'),
  })
  .refine((d) => d.passwordNuevo !== d.passwordActual, {
    path: ['passwordNuevo'],
    message: 'La nueva contraseña debe ser distinta de la actual.',
  })
  .refine((d) => d.passwordNuevo === d.confirmacion, {
    path: ['confirmacion'],
    message: 'Las contraseñas no coinciden.',
  })

type Formulario = z.infer<typeof esquema>

/**
 * Activación de cuenta en el primer ingreso. Se piden las dos cosas a la vez porque ambas
 * resuelven el mismo problema: la contraseña la conoce el administrador y, sin un correo
 * personal, el usuario dependería de él cada vez que la olvide.
 */
export function ActivarCuentaPage() {
  const { usuario, refrescarPerfil, cerrarSesion } = useAuth()
  const navegar = useNavigate()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    // Si ya venía con un correo cargado se propone, para que solo tenga que confirmarlo.
    defaultValues: { emailRecuperacion: usuario?.email ?? '' },
  })

  const onSubmit = handleSubmit(async ({ passwordActual, passwordNuevo, emailRecuperacion }) => {
    setErrorGeneral(null)

    try {
      await autenticacion.activarCuenta(passwordActual, passwordNuevo, emailRecuperacion)
      await refrescarPerfil()
      navegar('/home', { replace: true })
    } catch (error) {
      setErrorGeneral(
        error instanceof ApiError ? error.message : 'No pudimos activar tu cuenta.',
      )
    }
  })

  const salir = async () => {
    await cerrarSesion()
    navegar('/login', { replace: true })
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo className="h-10" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <header className="text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-full bg-accent">
              <ShieldCheck className="size-5 text-accent-foreground" aria-hidden />
            </span>

            <h1 className="mt-4 font-display text-xl font-bold text-foreground">
              Activa tu cuenta
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Elige una contraseña que solo tú conozcas y registra un correo personal para poder
              recuperarla.
            </p>
          </header>

          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
            {errorGeneral && <Alerta>{errorGeneral}</Alerta>}

            <Campo
              etiqueta="Contraseña actual"
              placeholder="La que te entregaron"
              type="password"
              autoComplete="current-password"
              conRevelarPassword
              error={errors.passwordActual?.message}
              {...register('passwordActual')}
            />

            <Campo
              etiqueta="Contraseña nueva"
              type="password"
              autoComplete="new-password"
              conRevelarPassword
              error={errors.passwordNuevo?.message}
              {...register('passwordNuevo')}
            />

            <Campo
              etiqueta="Repite la contraseña nueva"
              type="password"
              autoComplete="new-password"
              conRevelarPassword
              error={errors.confirmacion?.message}
              {...register('confirmacion')}
            />

            <div className="border-t border-border pt-4">
              <Campo
                etiqueta="Correo de recuperación"
                placeholder="tucorreo@gmail.com"
                type="email"
                autoComplete="email"
                error={errors.emailRecuperacion?.message}
                {...register('emailRecuperacion')}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Usa un correo personal al que siempre tengas acceso. Es el único modo de recuperar
                tu cuenta si olvidas la contraseña.
              </p>
            </div>

            <Boton type="submit" tamano="lg" cargando={isSubmitting} className="w-full">
              Activar y continuar
            </Boton>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Documento {usuario?.numeroDocumento}{' '}
          <button
            type="button"
            onClick={salir}
            className="font-medium text-cta transition-colors hover:underline"
          >
            Cerrar sesión
          </button>
        </p>
      </div>
    </main>
  )
}
