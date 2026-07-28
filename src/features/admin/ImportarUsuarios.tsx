import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Download, FileSpreadsheet, Upload } from 'lucide-react'
import { adminUsuarios, type ResultadoImportacion } from '@/api/admin'
import { Alerta } from '@/components/ui/Alerta'
import { Boton } from '@/components/ui/Boton'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

const ACEPTA = '.csv,.xlsx,.xlsm'

export function ImportarUsuarios({ onCerrar }: { onCerrar: () => void }) {
  const clienteConsultas = useQueryClient()
  const entrada = useRef<HTMLInputElement>(null)

  const [archivo, setArchivo] = useState<File | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null)

  const descargar = useMutation({
    mutationFn: (formato: 'csv' | 'xlsx') => adminUsuarios.descargarPlantilla(formato),
  })

  const importar = useMutation({
    mutationFn: (f: File) => adminUsuarios.importar(f),
    onSuccess: async (r) => {
      setResultado(r)

      if (r.exito) {
        await clienteConsultas.invalidateQueries({ queryKey: ['admin'] })
      }
    },
  })

  const elegir = (lista: FileList | null) => {
    const f = lista?.[0]
    if (!f) return

    setArchivo(f)
    // Un archivo nuevo invalida el resultado anterior: mezclarlos confunde.
    setResultado(null)
    importar.reset()
  }

  const exitoso = resultado?.exito === true

  return (
    <Modal
      titulo="Cargar usuarios desde archivo"
      descripcion="Sube un CSV o Excel con la plantilla para crear varios usuarios de una vez."
      onCerrar={onCerrar}
      bloqueado={importar.isPending}
      ancho="lg"
      pie={
        exitoso ? (
          <Boton onClick={onCerrar}>Listo</Boton>
        ) : (
          <>
            <Boton
              variante="secundario"
              type="button"
              onClick={onCerrar}
              disabled={importar.isPending}
            >
              Cancelar
            </Boton>
            <Boton
              onClick={() => archivo && importar.mutate(archivo)}
              cargando={importar.isPending}
              disabled={!archivo}
            >
              Cargar usuarios
            </Boton>
          </>
        )
      }
    >
      <div className="space-y-5">
        {!exitoso && (
          <section className="rounded-xl border border-border bg-muted/40 p-4">
            <h3 className="text-sm font-semibold text-foreground">1. Descarga la plantilla</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Trae los convenios disponibles y las listas de roles ya cargadas.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Boton
                variante="secundario"
                type="button"
                onClick={() => descargar.mutate('xlsx')}
                cargando={descargar.isPending && descargar.variables === 'xlsx'}
              >
                <Download className="size-4" aria-hidden />
                Excel (.xlsx)
              </Boton>

              <Boton
                variante="secundario"
                type="button"
                onClick={() => descargar.mutate('csv')}
                cargando={descargar.isPending && descargar.variables === 'csv'}
              >
                <Download className="size-4" aria-hidden />
                CSV
              </Boton>
            </div>
          </section>
        )}

        {!exitoso && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-foreground">2. Sube el archivo</h3>

            <button
              type="button"
              onClick={() => entrada.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setArrastrando(true)
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={(e) => {
                e.preventDefault()
                setArrastrando(false)
                elegir(e.dataTransfer.files)
              }}
              disabled={importar.isPending}
              className={cn(
                'flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8',
                'transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                arrastrando ? 'border-cta bg-accent/40' : 'border-border hover:border-cta/50 hover:bg-muted/40',
              )}
            >
              <span className="grid size-10 place-items-center rounded-full bg-muted">
                {archivo ? (
                  <FileSpreadsheet className="size-5 text-cta" aria-hidden />
                ) : (
                  <Upload className="size-5 text-muted-foreground" aria-hidden />
                )}
              </span>

              <span className="text-sm text-foreground">
                {archivo ? archivo.name : 'Arrastra el archivo aquí o haz clic para elegirlo'}
              </span>

              <span className="text-xs text-muted-foreground">
                {archivo
                  ? `${(archivo.size / 1024).toFixed(1)} KB · haz clic para cambiarlo`
                  : 'Formatos aceptados: CSV y Excel'}
              </span>
            </button>

            <input
              ref={entrada}
              type="file"
              accept={ACEPTA}
              className="sr-only"
              onChange={(e) => elegir(e.target.files)}
            />
          </section>
        )}

        {importar.error && <Alerta>{(importar.error as Error).message}</Alerta>}

        {resultado && !resultado.exito && resultado.errores.length > 0 && (
          <section>
            <Alerta>
              No se creó ningún usuario. Corrige {resultado.errores.length}{' '}
              {resultado.errores.length === 1 ? 'error' : 'errores'} y vuelve a cargar el archivo.
            </Alerta>

            {/* La tabla se desplaza sola: con archivos grandes la lista de errores es larga. */}
            <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-secondary/90 backdrop-blur">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-medium">Fila</th>
                    <th className="px-3 py-2 text-left font-medium">Columna</th>
                    <th className="px-3 py-2 text-left font-medium">Problema</th>
                  </tr>
                </thead>

                <tbody>
                  {resultado.errores.map((e, i) => (
                    <tr key={`${e.fila}-${e.columna}-${i}`} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-medium text-foreground">{e.fila}</td>
                      <td className="px-3 py-2 text-muted-foreground">{e.columna}</td>
                      <td className="px-3 py-2 text-foreground">{e.mensaje}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {exitoso && resultado && (
          <section className="rounded-xl border border-cta/25 bg-cta/5 p-5 text-center">
            <CheckCircle2 className="mx-auto size-9 text-cta" aria-hidden />

            <h3 className="mt-3 font-display text-lg font-bold text-foreground">
              {resultado.usuariosCreados}{' '}
              {resultado.usuariosCreados === 1 ? 'usuario creado' : 'usuarios creados'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Entran con su número de documento y deberán activar la cuenta la primera vez.
            </p>

            <ul className="mx-auto mt-4 max-h-40 max-w-sm overflow-y-auto text-left text-sm text-muted-foreground">
              {resultado.creados.map((usuario) => (
                <li key={usuario} className="border-b border-border/60 py-1.5 last:border-0">
                  {usuario}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  )
}
