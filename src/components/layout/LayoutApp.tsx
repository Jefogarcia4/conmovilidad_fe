import { Outlet } from 'react-router-dom'
import { Encabezado } from './Encabezado'
import { PieDePagina } from './PieDePagina'

export function LayoutApp() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Encabezado />

      <main className="flex-1">
        <Outlet />
      </main>

      <PieDePagina />
    </div>
  )
}
