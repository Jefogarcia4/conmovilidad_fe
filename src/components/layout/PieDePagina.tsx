import { Globe, Mail, MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'

const columnas = [
  {
    titulo: 'Marketplace',
    enlaces: [
      { texto: 'Explorar vehículos', a: '/home' },
      { texto: 'Publicar vehículo', a: '/publish' },
      { texto: 'Mis vehículos', a: '/my-vehicles' },
    ],
  },
  {
    titulo: 'Compañía',
    enlaces: [
      { texto: 'Sobre Nosotros', a: '/sobre-nosotros' },
      { texto: 'Nuestro Equipo', a: '/equipo' },
      { texto: 'Solicitar asesoría', a: '/asesoria' },
    ],
  },
  {
    titulo: 'Legal',
    enlaces: [
      { texto: 'Habeas Data', a: '/habeas-data' },
      { texto: 'Términos y Condiciones', a: '/terminos' },
      { texto: 'Contáctanos', a: '/contacto' },
    ],
  },
]

const redes = [
  { etiqueta: 'Sitio web', Icono: Globe },
  { etiqueta: 'Correo', Icono: Mail },
  { etiqueta: 'WhatsApp', Icono: MessageCircle },
  { etiqueta: 'Teléfono', Icono: Phone },
]

export function PieDePagina() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <span className="inline-flex items-center rounded-lg bg-background px-3 py-2">
              <Logo className="h-7" />
            </span>

            <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/70">
              El marketplace de vehículos que conecta compradores y vendedores con confianza,
              transparencia y la mejor experiencia.
            </p>

            <div className="flex gap-3">
              {redes.map(({ etiqueta, Icono }) => (
                <a
                  key={etiqueta}
                  href="/home"
                  aria-label={etiqueta}
                  className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-cta hover:text-cta-foreground"
                >
                  <Icono className="size-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {columnas.map((columna) => (
            <div key={columna.titulo} className="space-y-4">
              <h3 className="text-sm font-semibold">{columna.titulo}</h3>

              <ul className="space-y-2.5">
                {columna.enlaces.map((enlace) => (
                  <li key={enlace.texto}>
                    <Link
                      to={enlace.a}
                      className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                    >
                      {enlace.texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-primary-foreground/10 pt-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ConMovilidad. Todos los derechos reservados.</p>
          <p>Hecho en Colombia</p>
        </div>
      </div>
    </footer>
  )
}
