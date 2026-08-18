import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown, Plus, X } from 'lucide-react'
import { clasesControl } from './estilosControl'
import { cn } from '@/lib/utils'

export interface OpcionCombo {
  valor: string
  etiqueta: string
}

/**
 * Cuántas opciones se pintan a la vez. Las ciudades del país pasan de mil y montar esa lista
 * entera al abrir el desplegable se nota; teclear dos letras la deja en un puñado.
 */
const MAXIMO_VISIBLES = 100

interface Props {
  opciones: OpcionCombo[]
  valor: string
  /** Recibe el valor elegido, o el texto escrito cuando `permitirCrear` está activo. */
  onCambio: (valor: string, esNuevo?: boolean) => void
  textoVacio: string
  id?: string
  deshabilitado?: boolean
  invalido?: boolean
  /** Deja confirmar un texto que no está en la lista, para dar de alta valores nuevos. */
  permitirCrear?: boolean
  /** Muestra la equis para volver al estado sin selección. */
  permitirLimpiar?: boolean
}

/**
 * Desplegable con búsqueda. Se escribe para filtrar y se navega con las flechas; con listas de
 * quince marcas o veintidós años, teclear dos letras es mucho más rápido que recorrer la lista.
 *
 * Implementa el patrón ARIA de combobox: el input anuncia el estado, la lista es un `listbox` y
 * la opción resaltada se comunica con `aria-activedescendant` sin mover el foco real.
 */
export function ComboBox({
  opciones,
  valor,
  onCambio,
  textoVacio,
  id,
  deshabilitado = false,
  invalido = false,
  permitirCrear = false,
  permitirLimpiar = true,
}: Props) {
  const idGenerado = useId()
  const idCampo = id ?? idGenerado
  const idLista = `${idCampo}-lista`

  const contenedor = useRef<HTMLDivElement>(null)
  const campo = useRef<HTMLInputElement>(null)

  /**
   * Al elegir una opción se devuelve el foco al campo, y ese foco volvería a abrir la lista.
   * Esta marca hace que el `onFocus` inmediatamente posterior a una selección no reabra nada.
   */
  const acabaDeElegir = useRef(false)

  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [resaltada, setResaltada] = useState(0)

  const seleccionada = opciones.find((o) => o.valor === valor)

  // Cerrado muestra la etiqueta elegida; abierto, lo que se está escribiendo.
  const textoVisible = abierto ? busqueda : (seleccionada?.etiqueta ?? (permitirCrear ? valor : ''))

  const { filtradas, hayMas } = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    const coincidencias = termino
      ? opciones.filter((o) => o.etiqueta.toLowerCase().includes(termino))
      : opciones

    return {
      filtradas: coincidencias.slice(0, MAXIMO_VISIBLES),
      hayMas: coincidencias.length > MAXIMO_VISIBLES,
    }
  }, [opciones, busqueda])

  const puedeCrear =
    permitirCrear &&
    busqueda.trim().length > 0 &&
    !opciones.some((o) => o.etiqueta.toLowerCase() === busqueda.trim().toLowerCase())

  useEffect(() => {
    if (!abierto) return

    const alClicFuera = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) {
        setAbierto(false)
        setBusqueda('')
      }
    }

    document.addEventListener('mousedown', alClicFuera)
    return () => document.removeEventListener('mousedown', alClicFuera)
  }, [abierto])

  const abrir = () => {
    if (deshabilitado || acabaDeElegir.current) {
      acabaDeElegir.current = false
      return
    }

    setBusqueda('')
    setResaltada(0)
    setAbierto(true)
  }

  const cerrar = () => {
    setAbierto(false)
    setBusqueda('')
  }

  const confirmar = (valorElegido: string, esNuevo?: boolean) => {
    acabaDeElegir.current = true
    onCambio(valorElegido, esNuevo)
    cerrar()
    campo.current?.focus()
  }

  const elegir = (opcion: OpcionCombo) => confirmar(opcion.valor)

  const crear = () => confirmar(busqueda.trim(), true)

  const alTeclear = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()

      if (!abierto) {
        abrir()
        return
      }

      const total = filtradas.length + (puedeCrear ? 1 : 0)
      if (total === 0) return

      const paso = e.key === 'ArrowDown' ? 1 : -1
      setResaltada((i) => (i + paso + total) % total)
      return
    }

    if (e.key === 'Enter') {
      if (!abierto) return
      e.preventDefault()

      const opcion = filtradas[resaltada]
      if (opcion) elegir(opcion)
      else if (puedeCrear) crear()
      return
    }

    if (e.key === 'Escape' && abierto) {
      e.preventDefault()
      cerrar()
      return
    }

    if (e.key === 'Tab') cerrar()
  }

  return (
    <div className="relative" ref={contenedor}>
      <input
        ref={campo}
        id={idCampo}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-autocomplete="list"
        aria-activedescendant={abierto && filtradas[resaltada] ? `${idLista}-${resaltada}` : undefined}
        aria-invalid={invalido || undefined}
        disabled={deshabilitado}
        // Abierto, el campo queda vacío para escribir: el placeholder recuerda qué había elegido.
        placeholder={abierto && seleccionada ? seleccionada.etiqueta : textoVacio}
        value={textoVisible}
        onChange={(e) => {
          setBusqueda(e.target.value)
          setResaltada(0)
          if (!abierto) setAbierto(true)
        }}
        onFocus={abrir}
        onKeyDown={alTeclear}
        className={cn(
          clasesControl,
          'cursor-text pr-14',
          !seleccionada && !valor && 'text-muted-foreground',
          invalido ? 'border-destructive focus-visible:ring-destructive/20' : 'border-input',
        )}
      />

      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-0.5">
        {permitirLimpiar && valor && !deshabilitado && (
          <button
            type="button"
            aria-label="Quitar selección"
            onClick={() => {
              onCambio('')
              cerrar()
            }}
            className="grid size-5 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        )}

        <ChevronDown
          className={cn(
            'size-4 text-muted-foreground transition-transform',
            abierto && 'rotate-180',
          )}
          aria-hidden
        />
      </div>

      {abierto && (
        <ul
          id={idLista}
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card p-1 shadow-lg"
        >
          {filtradas.map((opcion, i) => (
            <li key={opcion.valor}>
              <button
                type="button"
                id={`${idLista}-${i}`}
                role="option"
                aria-selected={opcion.valor === valor}
                // El resaltado sigue al ratón para que teclado y puntero no se contradigan.
                onMouseEnter={() => setResaltada(i)}
                onClick={() => elegir(opcion)}
                className={cn(
                  'w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
                  i === resaltada ? 'bg-muted text-foreground' : 'text-foreground',
                  opcion.valor === valor && 'font-medium text-cta',
                )}
              >
                {opcion.etiqueta}
              </button>
            </li>
          ))}

          {filtradas.length === 0 && !puedeCrear && (
            <li className="px-2.5 py-2 text-sm text-muted-foreground">Sin coincidencias</li>
          )}

          {hayMas && (
            <li className="px-2.5 py-2 text-xs text-muted-foreground">
              Hay más opciones: escribe para acotar la búsqueda.
            </li>
          )}

          {puedeCrear && (
            <li>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseEnter={() => setResaltada(filtradas.length)}
                onClick={crear}
                className={cn(
                  'flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
                  resaltada === filtradas.length ? 'bg-muted' : '',
                )}
              >
                <Plus className="size-3.5 shrink-0 text-cta" aria-hidden />
                <span className="text-muted-foreground">
                  Agregar «<span className="text-foreground">{busqueda.trim()}</span>»
                </span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
