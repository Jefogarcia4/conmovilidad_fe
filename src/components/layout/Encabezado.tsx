import { useEffect, useRef, useState } from 'react'
import { ChevronDown, CirclePlus, LogOut, Shield, User } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

const enlaces = [
  { a: '/home', texto: 'Explorar' },
  { a: '/my-vehicles', texto: 'Mis Vehículos' },
]

export function Encabezado() {
  const { usuario, cerrarSesion } = useAuth()
  const navegar = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const contenedorMenu = useRef<HTMLDivElement>(null)

  // Cierra el menú al hacer clic fuera o pulsar Escape.
  useEffect(() => {
    if (!menuAbierto) return

    const alClicFuera = (e: MouseEvent) => {
      if (!contenedorMenu.current?.contains(e.target as Node)) setMenuAbierto(false)
    }
    const alEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuAbierto(false)
    }

    document.addEventListener('mousedown', alClicFuera)
    document.addEventListener('keydown', alEscape)

    return () => {
      document.removeEventListener('mousedown', alClicFuera)
      document.removeEventListener('keydown', alEscape)
    }
  }, [menuAbierto])

  const salir = async () => {
    setMenuAbierto(false)
    await cerrarSesion()
    navegar('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/home" aria-label="Ir al inicio">
          <Logo className="h-9" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.a}
              to={enlace.a}
              className={({ isActive }) =>
                cn(
                  'inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              {enlace.texto}
            </NavLink>
          ))}

          <Link
            to="/publish"
            className="ml-1 inline-flex h-8 items-center gap-1.5 rounded-lg bg-cta px-2.5 text-sm font-medium text-cta-foreground transition-all hover:bg-cta-hover"
          >
            <CirclePlus className="size-4" aria-hidden />
            Publicar Vehículo
          </Link>
        </nav>

        <div className="relative" ref={contenedorMenu}>
          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuAbierto}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-all hover:bg-muted"
          >
            <span className="grid size-5 place-items-center rounded-full bg-muted">
              <User className="size-3.5 text-muted-foreground" aria-hidden />
            </span>
            <span className="hidden max-w-[120px] truncate sm:inline">
              {usuario ? `${usuario.nombres} ${usuario.apellidos}` : ''}
            </span>
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
          </button>

          {menuAbierto && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
            >
              <div className="border-b border-border px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-foreground">
                  {usuario?.nombres} {usuario?.apellidos}
                </p>
                <p className="truncate text-xs text-muted-foreground">{usuario?.email}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {usuario?.empresaNombre} · {usuario?.convenioNombre}
                </p>
              </div>

              <div className="p-1 md:hidden">
                {enlaces.map((enlace) => (
                  <Link
                    key={enlace.a}
                    to={enlace.a}
                    role="menuitem"
                    onClick={() => setMenuAbierto(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    {enlace.texto}
                  </Link>
                ))}
                <Link
                  to="/publish"
                  role="menuitem"
                  onClick={() => setMenuAbierto(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-cta transition-colors hover:bg-muted"
                >
                  Publicar Vehículo
                </Link>
              </div>

              {/* La API rechaza estas rutas para otros roles; aquí solo se evita mostrar
                  un enlace que llevaría a una pantalla de acceso denegado. */}
              {usuario?.rol === 'SuperAdministrador' && (
                <div className="border-t border-border p-1">
                  <Link
                    to="/admin/convenios"
                    role="menuitem"
                    onClick={() => setMenuAbierto(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Shield className="size-4 text-muted-foreground" aria-hidden />
                    Administración
                  </Link>
                </div>
              )}

              <div className="border-t border-border p-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={salir}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <LogOut className="size-4 text-muted-foreground" aria-hidden />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
