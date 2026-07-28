import { Building2, Handshake, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const secciones = [
  { a: '/admin/convenios', texto: 'Convenios', Icono: Handshake },
  { a: '/admin/empresas', texto: 'Empresas', Icono: Building2 },
  { a: '/admin/usuarios', texto: 'Usuarios', Icono: Users },
]

export function LayoutAdmin() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 md:py-12">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Administración</h1>
        <p className="text-muted-foreground">
          Gestiona los convenios, las empresas afiliadas y los usuarios de la plataforma.
        </p>
      </header>

      <nav className="mb-6 flex gap-1 border-b border-border">
        {secciones.map(({ a, texto, Icono }) => (
          <NavLink
            key={a}
            to={a}
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                // El borde inferior marca la sección activa sin desplazar el resto de pestañas.
                isActive
                  ? 'border-cta text-cta'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Icono className="size-4" aria-hidden />
            {texto}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
