import { useState, type ReactNode } from 'react'
import { Controller, useForm, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '@/api/cliente'
import { autenticacion } from '@/api/endpoints'
import { useAuth } from '@/auth/useAuth'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { Casilla } from '@/components/ui/Casilla'
import { Logo } from '@/components/ui/Logo'

const esquema = z
  .object({
    passwordActual: z.string().min(1, 'Ingresa la contraseña con la que entraste.'),
    // Solo longitud: sin exigencias de composición. Debe coincidir con `ReglasPassword` de la API.
    passwordNuevo: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
    confirmacion: z.string().min(1, 'Repite la contraseña nueva.'),
    emailRecuperacion: z
      .string()
      .trim()
      .min(1, 'El correo de recuperación es obligatorio.')
      .email('Ingresa un correo válido.'),
    telefono: z
      .string()
      .trim()
      .min(1, 'El número de celular es obligatorio.')
      .max(30)
      // Se admiten espacios y los signos habituales: cada quien escribe su número a su manera.
      .regex(/^\+?[\d\s().-]{7,}$/, 'Ingresa un número de celular válido.'),
    aceptaTerminos: z.boolean(),
    aceptaHabeasData: z.boolean(),
  })
  .refine((d) => d.aceptaTerminos, {
    path: ['aceptaTerminos'],
    message: 'Debes aceptar los términos y condiciones para continuar.',
  })
  .refine((d) => d.aceptaHabeasData, {
    path: ['aceptaHabeasData'],
    message: 'Debes autorizar el tratamiento de tus datos personales.',
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
 * Enlace a un texto legal. Abre en otra pestaña y detiene la propagación: al vivir dentro de la
 * etiqueta de la casilla, un clic normal marcaría la aceptación en lugar de abrir el documento
 * que se pretende leer.
 */
function EnlaceLegal({ a, children }: { a: string; children: ReactNode }) {
  return (
    <Link
      to={a}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="font-medium text-cta underline underline-offset-2"
    >
      {children}
    </Link>
  )
}

/** Casilla legal conectada al formulario, con su mensaje de error debajo. */
function Aceptacion({
  control,
  nombre,
  error,
  children,
}: {
  control: Control<Formulario>
  nombre: 'aceptaTerminos' | 'aceptaHabeasData'
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <Controller
        control={control}
        name={nombre}
        render={({ field }) => (
          <Casilla
            checked={field.value}
            onChange={field.onChange}
            // Arriba y no centrado: la etiqueta ocupa dos líneas en pantallas estrechas.
            className="items-start"
            etiqueta={<span className="text-sm leading-snug text-foreground">{children}</span>}
          />
        )}
      />

      {error && <p className="mt-1 ml-6 text-xs text-destructive">{error}</p>}
    </div>
  )
}

/**
 * Activación de cuenta en el primer ingreso. Se resuelve todo de una vez porque son piezas del
 * mismo problema: la contraseña la conoce el administrador, sin correo personal el usuario
 * dependería de él para recuperarla, sin celular nadie puede contactarlo por sus vehículos, y las
 * dos autorizaciones legales deben quedar registradas antes de que empiece a usar la plataforma.
 */
export function ActivarCuentaPage() {
  const { usuario, refrescarPerfil, cerrarSesion } = useAuth()
  const navegar = useNavigate()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    // Si ya venía con datos cargados se proponen, para que solo tenga que confirmarlos.
    defaultValues: {
      emailRecuperacion: usuario?.email ?? '',
      telefono: '',
      aceptaTerminos: false,
      aceptaHabeasData: false,
    },
  })

  const onSubmit = handleSubmit(async (datos) => {
    setErrorGeneral(null)

    try {
      await autenticacion.activarCuenta({
        passwordActual: datos.passwordActual,
        passwordNuevo: datos.passwordNuevo,
        emailRecuperacion: datos.emailRecuperacion,
        telefono: datos.telefono,
        aceptaTerminos: datos.aceptaTerminos,
        aceptaHabeasData: datos.aceptaHabeasData,
      })

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

            <div className="space-y-4 border-t border-border pt-4">
              <div>
                <Campo
                  etiqueta="Correo de recuperación"
                  placeholder="tucorreo@gmail.com"
                  type="email"
                  autoComplete="email"
                  error={errors.emailRecuperacion?.message}
                  {...register('emailRecuperacion')}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Usa un correo personal al que siempre tengas acceso. Es el único modo de
                  recuperar tu cuenta si olvidas la contraseña.
                </p>
              </div>

              <div>
                <Campo
                  etiqueta="Celular"
                  placeholder="300 123 4567"
                  type="tel"
                  autoComplete="tel"
                  error={errors.telefono?.message}
                  {...register('telefono')}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Es el número con el que te contactarán los interesados en tus vehículos.
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <Aceptacion
                control={control}
                nombre="aceptaTerminos"
                error={errors.aceptaTerminos?.message}
              >
                He leído y acepto los <EnlaceLegal a="/terminos">términos y condiciones</EnlaceLegal>
                .
              </Aceptacion>

              <Aceptacion
                control={control}
                nombre="aceptaHabeasData"
                error={errors.aceptaHabeasData?.message}
              >
                Autorizo el tratamiento de mis datos personales conforme a la{' '}
                <EnlaceLegal a="/habeas-data">política de habeas data</EnlaceLegal>.
              </Aceptacion>
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
