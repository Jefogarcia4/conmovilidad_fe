import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ApiError } from './api/cliente'
import { AuthProvider } from './auth/AuthProvider'
import { RutaAdmin } from './auth/RutaAdmin'
import { RutaProtegida, RutaPublica } from './auth/RutaProtegida'
import { LayoutApp } from './components/layout/LayoutApp'
import { ActivarCuentaPage } from './features/autenticacion/ActivarCuentaPage'
import { LoginPage } from './features/autenticacion/LoginPage'
import { DetalleVehiculoPage } from './features/detalle/DetalleVehiculoPage'
import { HomePage } from './features/home/HomePage'
import { PagoResultadoPage } from './features/pagos/PagoResultadoPage'
import { MisVehiculosPage } from './features/vehiculos/MisVehiculosPage'
import { PendientePage } from './features/vehiculos/PendientePage'

// El portal de administración solo lo usa el superadministrador y el formulario de publicación
// no se abre en cada visita: se cargan aparte para no pesarle al catálogo, que es lo primero
// que ve todo el mundo.
const LayoutAdmin = lazy(() =>
  import('./features/admin/LayoutAdmin').then((m) => ({ default: m.LayoutAdmin })),
)
const ConveniosPage = lazy(() =>
  import('./features/admin/ConveniosPage').then((m) => ({ default: m.ConveniosPage })),
)
const EmpresasPage = lazy(() =>
  import('./features/admin/EmpresasPage').then((m) => ({ default: m.EmpresasPage })),
)
const UsuariosPage = lazy(() =>
  import('./features/admin/UsuariosPage').then((m) => ({ default: m.UsuariosPage })),
)
const TarifasPage = lazy(() =>
  import('./features/admin/TarifasPage').then((m) => ({ default: m.TarifasPage })),
)
const PublicarPage = lazy(() =>
  import('./features/publicar/PublicarPage').then((m) => ({ default: m.PublicarPage })),
)
const EditarVehiculoPage = lazy(() =>
  import('./features/publicar/EditarVehiculoPage').then((m) => ({ default: m.EditarVehiculoPage })),
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (intentos, error) => {
        // Reintentar un 401/403/404 no cambia el resultado y solo retrasa el mensaje al usuario.
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
        return intentos < 2
      },
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<CargandoPagina />}>
            <Routes>
            <Route element={<RutaPublica />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<RutaProtegida />}>
              {/* Fuera del layout: hasta activar la cuenta no hay navegación disponible. */}
              <Route path="/activar-cuenta" element={<ActivarCuentaPage />} />

              <Route element={<LayoutApp />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/my-vehicles" element={<MisVehiculosPage />} />
                <Route path="/publish" element={<PublicarPage />} />
                <Route path="/vehicle/:id" element={<DetalleVehiculoPage />} />
                <Route path="/vehicle/:id/editar" element={<EditarVehiculoPage />} />

                {/* Destino del redirect de Wompi. La ruta debe coincidir con `Wompi:UrlRedireccion`
                    de la API, que es la que se le manda a la pasarela. */}
                <Route path="/pago" element={<PagoResultadoPage />} />

                <Route element={<RutaAdmin />}>
                  <Route path="/admin" element={<LayoutAdmin />}>
                    <Route index element={<Navigate to="/admin/convenios" replace />} />
                    <Route path="convenios" element={<ConveniosPage />} />
                    <Route path="empresas" element={<EmpresasPage />} />
                    <Route path="usuarios" element={<UsuariosPage />} />
                    <Route path="tarifas" element={<TarifasPage />} />
                  </Route>
                </Route>

                <Route path="/sobre-nosotros" element={<PendientePage titulo="Sobre Nosotros" />} />
                <Route path="/equipo" element={<PendientePage titulo="Nuestro Equipo" />} />
                <Route path="/asesoria" element={<PendientePage titulo="Solicitar asesoría" />} />
                <Route path="/habeas-data" element={<PendientePage titulo="Habeas Data" />} />
                <Route path="/terminos" element={<PendientePage titulo="Términos y Condiciones" />} />
                <Route path="/contacto" element={<PendientePage titulo="Contáctanos" />} />
              </Route>
            </Route>

              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

function CargandoPagina() {
  return (
    <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
      <Loader2 className="size-6 animate-spin" aria-label="Cargando" />
    </div>
  )
}
