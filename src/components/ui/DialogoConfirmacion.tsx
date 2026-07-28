import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Boton } from './Boton'

interface Props {
  titulo: string
  mensaje: string
  textoConfirmar?: string
  cargando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

/**
 * Confirmación para acciones destructivas. Se usa `<dialog>` nativo: el navegador se encarga
 * del atrapado de foco, del cierre con Escape y del fondo inerte.
 */
export function DialogoConfirmacion({
  titulo,
  mensaje,
  textoConfirmar = 'Eliminar',
  cargando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialogo.current?.showModal()
  }, [])

  return (
    <dialog
      ref={dialogo}
      // El Escape del navegador dispara `cancel`; se redirige al mismo cierre controlado.
      onCancel={(e) => {
        e.preventDefault()
        if (!cargando) onCancelar()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-5 text-destructive" aria-hidden />
          </span>

          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold">{titulo}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{mensaje}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Boton variante="secundario" onClick={onCancelar} disabled={cargando}>
            Cancelar
          </Boton>

          <Boton
            onClick={onConfirmar}
            cargando={cargando}
            className="bg-destructive hover:bg-destructive/90"
          >
            {textoConfirmar}
          </Boton>
        </div>
      </div>
    </dialog>
  )
}
