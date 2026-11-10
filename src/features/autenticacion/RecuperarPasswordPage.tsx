import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { autenticacion } from '@/api/endpoints'
import { ApiError } from '@/api/cliente'
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
})

type Formulario = z.infer<typeof esquema>

export function RecuperarPasswordPage() {
  const [enviado, setEnviado] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({ resolver: zodResolver(esquema), defaultValues: { usuario: '' } })

  const onSubmit = handleSubmit(async ({ usuario }) => {
    setErrorGeneral(null)

    try {
      await autenticacion.recuperarPassword(usuario)
      setEnviado(true)
    } catch (error) {
      setErrorGeneral(
        error instanceof ApiError ? error.message : 'No pudimos procesar la solicitud.',
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
              {enviado ? 'Revisa tu correo' : 'Recuperar contraseña'}
            </h2>

            <p className="text-sm text-muted-foreground">
              {enviado
                ? 'Si ese documento tiene una cuenta con correo registrado, le enviamos un enlace para crear una contraseña nueva.'
                : 'Ingresa tu número de documento y te enviaremos un enlace al correo que registraste.'}
            </p>
          </div>

          {/* La confirmación no dice si la cuenta existe: hacerlo convertiría esta pantalla en
              una forma de averiguar qué documentos están registrados. */}
          {enviado ? (
            <div className="space-y-5 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-cta/10 text-cta">
                <MailCheck className="size-7" aria-hidden />
              </span>

              <p className="text-sm text-muted-foreground">
                El enlace vence en una hora y sirve una sola vez. Si no te llega, revisa la carpeta
                de correo no deseado o comunícate con tu gestor.
              </p>

              <Link to="/login" className="inline-block">
                <Boton variante="secundario">
                  <ArrowLeft className="size-4" aria-hidden />
                  Volver al ingreso
                </Boton>
              </Link>
            </div>
          ) : (
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

              <Boton type="submit" tamano="lg" cargando={isSubmitting} className="w-full">
                {isSubmitting ? 'Enviando…' : 'Enviar enlace'}
              </Boton>

              <p className="text-center text-sm">
                <Link to="/login" className="font-medium text-cta hover:underline">
                  Volver al ingreso
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
