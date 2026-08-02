import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, X } from 'lucide-react'
import { resolverUrlImagen } from '@/lib/imagenes'
import { cn } from '@/lib/utils'

export interface ImagenVisor {
  url: string
  alt: string
}

interface Props {
  imagenes: ImagenVisor[]
  /** Imagen que se abre primero. */
  indiceInicial?: number
  /** Permite que la galería de origen quede en la misma foto en la que se cerró el visor. */
  onIndiceCambiado?: (indice: number) => void
  onCerrar: () => void
}

const ESCALA_MINIMA = 1
const ESCALA_MAXIMA = 6
/** Salto de los botones y del doble clic; la rueda usa un factor continuo. */
const PASO = 1.6

interface Vista {
  escala: number
  x: number
  y: number
}

interface Punto {
  x: number
  y: number
}

const VISTA_INICIAL: Vista = { escala: 1, x: 0, y: 0 }

/**
 * Visor a pantalla completa con zoom. Se apoya en `<dialog>` nativo, que ya aporta atrapado de
 * foco, cierre con Escape y fondo inerte.
 *
 * El zoom se aplica sobre el punto que señala el usuario —rueda o pellizco— en vez de sobre el
 * centro: al ampliar la esquina donde está la marca de agua, esa esquina es la que se queda
 * quieta y no hay que perseguirla arrastrando.
 */
export function VisorImagenes({
  imagenes,
  indiceInicial = 0,
  onIndiceCambiado,
  onCerrar,
}: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const marco = useRef<HTMLDivElement>(null)

  const [indice, setIndice] = useState(indiceInicial)
  const [vista, setVista] = useState<Vista>(VISTA_INICIAL)

  const total = imagenes.length
  const imagen = imagenes[indice]

  useEffect(() => {
    dialogo.current?.showModal()
  }, [])

  /**
   * El desplazamiento se limita al margen que el zoom deja fuera del marco, para que la imagen
   * no pueda arrastrarse hasta salirse de la vista.
   */
  const acotar = useCallback((v: Vista): Vista => {
    if (v.escala <= ESCALA_MINIMA) return VISTA_INICIAL

    const caja = marco.current?.getBoundingClientRect()
    if (!caja) return v

    const maxX = (caja.width * (v.escala - 1)) / 2
    const maxY = (caja.height * (v.escala - 1)) / 2

    return {
      escala: v.escala,
      x: Math.min(maxX, Math.max(-maxX, v.x)),
      y: Math.min(maxY, Math.max(-maxY, v.y)),
    }
  }, [])

  /**
   * Lleva la escala a `destino` dejando fijo el punto `foco`, en coordenadas de pantalla. Sin
   * foco (los botones y el teclado) se amplía por el centro del marco.
   */
  const reencuadrar = useCallback(
    (actual: Vista, destino: number, foco?: Punto): Vista => {
      const escala = Math.min(ESCALA_MAXIMA, Math.max(ESCALA_MINIMA, destino))
      if (escala === ESCALA_MINIMA) return VISTA_INICIAL

      const caja = marco.current?.getBoundingClientRect()
      if (!caja || !foco) return acotar({ ...actual, escala })

      // Punto señalado, medido desde el centro del marco: es el que debe quedarse quieto.
      const sx = foco.x - (caja.left + caja.width / 2)
      const sy = foco.y - (caja.top + caja.height / 2)

      const razon = escala / actual.escala

      return acotar({
        escala,
        x: sx - (sx - actual.x) * razon,
        y: sy - (sy - actual.y) * razon,
      })
    },
    [acotar],
  )

  const escalarA = useCallback(
    (destino: number, foco?: Punto) => setVista((v) => reencuadrar(v, destino, foco)),
    [reencuadrar],
  )

  /** Multiplica la escala vigente: la rueda y el pellizco no saben en cuánto está. */
  const escalarPor = useCallback(
    (factor: number, foco?: Punto) => setVista((v) => reencuadrar(v, v.escala * factor, foco)),
    [reencuadrar],
  )

  // La rueda debe cancelar el zoom de página del navegador, y React registra `onWheel` como
  // pasivo: hay que suscribirse a mano para poder llamar a `preventDefault`.
  useEffect(() => {
    const elemento = marco.current
    if (!elemento) return

    const alRodar = (e: WheelEvent) => {
      e.preventDefault()
      escalarPor(Math.exp(-e.deltaY / 320), { x: e.clientX, y: e.clientY })
    }

    elemento.addEventListener('wheel', alRodar, { passive: false })
    return () => elemento.removeEventListener('wheel', alRodar)
  }, [escalarPor])

  // El índice se lee de una referencia para que `irA` no cambie en cada foto y los suscriptores
  // del teclado no tengan que volver a registrarse.
  const indiceActual = useRef(indice)
  indiceActual.current = indice

  const irA = useCallback(
    (delta: number) => {
      const siguiente = (indiceActual.current + delta + total) % total

      setIndice(siguiente)
      onIndiceCambiado?.(siguiente)

      // Cambiar de foto con el zoom puesto dejaría la siguiente encuadrada en un recorte ajeno.
      setVista(VISTA_INICIAL)
    },
    [total, onIndiceCambiado],
  )

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && total > 1) irA(-1)
      if (e.key === 'ArrowRight' && total > 1) irA(1)
      if (e.key === '+' || e.key === '=') escalarPor(PASO)
      if (e.key === '-') escalarPor(1 / PASO)
      if (e.key === '0') setVista(VISTA_INICIAL)
    }

    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [irA, escalarPor, total])

  // Punteros activos sobre la imagen: uno arrastra, dos pellizcan.
  const punteros = useRef(new Map<number, { x: number; y: number }>())
  const pellizco = useRef<number | null>(null)
  const [arrastrando, setArrastrando] = useState(false)

  const distancia = () => {
    const [a, b] = [...punteros.current.values()]
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0
  }

  const centro = () => {
    const [a, b] = [...punteros.current.values()]
    return a && b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : undefined
  }

  const alBajarPuntero = (e: React.PointerEvent) => {
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (punteros.current.size === 2) {
      pellizco.current = distancia()
      setArrastrando(false)
    } else if (vista.escala > ESCALA_MINIMA) {
      setArrastrando(true)
    }

    // Solo se captura el puntero cuando de verdad se va a mover o a pellizcar la imagen: la
    // captura redirige también el clic, y sin zoom eso se lo quitaría a las flechas de encima.
    if (punteros.current.size === 2 || vista.escala > ESCALA_MINIMA) {
      e.currentTarget.setPointerCapture(e.pointerId)
    }
  }

  const alMoverPuntero = (e: React.PointerEvent) => {
    const previo = punteros.current.get(e.pointerId)
    if (!previo) return

    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (punteros.current.size >= 2) {
      const anterior = pellizco.current
      const actual = distancia()

      if (anterior && actual) {
        escalarPor(actual / anterior, centro())
        pellizco.current = actual
      }

      return
    }

    if (!arrastrando) return

    setVista((v) => acotar({ ...v, x: v.x + (e.clientX - previo.x), y: v.y + (e.clientY - previo.y) }))
  }

  const alSoltarPuntero = (e: React.PointerEvent) => {
    punteros.current.delete(e.pointerId)
    if (punteros.current.size < 2) pellizco.current = null
    if (punteros.current.size === 0) setArrastrando(false)
  }

  if (!imagen) return null

  const ampliada = vista.escala > ESCALA_MINIMA

  return (
    <dialog
      ref={dialogo}
      aria-label="Galería ampliada"
      onCancel={(e) => {
        e.preventDefault()
        onCerrar()
      }}
      className={cn(
        'm-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-primary-foreground',
        'backdrop:bg-foreground/80 backdrop:backdrop-blur-sm',
      )}
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-3 p-3 sm:p-4">
          <div className="flex items-center gap-1 rounded-full bg-background/15 p-1 backdrop-blur">
            <BotonVisor
              etiqueta="Alejar"
              onClick={() => escalarPor(1 / PASO)}
              deshabilitado={!ampliada}
            >
              <Minus className="size-4" aria-hidden />
            </BotonVisor>

            <span className="min-w-12 text-center text-xs font-medium tabular-nums">
              {Math.round(vista.escala * 100)}%
            </span>

            <BotonVisor
              etiqueta="Acercar"
              onClick={() => escalarPor(PASO)}
              deshabilitado={vista.escala >= ESCALA_MAXIMA}
            >
              <Plus className="size-4" aria-hidden />
            </BotonVisor>

            <BotonVisor
              etiqueta="Restablecer zoom"
              onClick={() => setVista(VISTA_INICIAL)}
              deshabilitado={!ampliada}
            >
              <Maximize2 className="size-4" aria-hidden />
            </BotonVisor>
          </div>

          <BotonVisor etiqueta="Cerrar" onClick={onCerrar} className="bg-background/15 backdrop-blur">
            <X className="size-5" aria-hidden />
          </BotonVisor>
        </header>

        <div
          ref={marco}
          onPointerDown={alBajarPuntero}
          onPointerMove={alMoverPuntero}
          onPointerUp={alSoltarPuntero}
          onPointerCancel={alSoltarPuntero}
          onDoubleClick={(e) =>
            ampliada ? setVista(VISTA_INICIAL) : escalarA(2.5, { x: e.clientX, y: e.clientY })
          }
          className={cn(
            'relative flex-1 overflow-hidden touch-none select-none',
            ampliada ? (arrastrando ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in',
          )}
        >
          <img
            src={resolverUrlImagen(imagen.url)}
            alt={imagen.alt}
            draggable={false}
            style={{
              transform: `translate(${vista.x}px, ${vista.y}px) scale(${vista.escala})`,
              // Solo se anima el salto de los botones: durante el arrastre debe seguir al dedo.
              transition: arrastrando ? undefined : 'transform 150ms ease-out',
            }}
            className="absolute inset-0 size-full object-contain"
          />

          {total > 1 && (
            <>
              <FlechaVisor lado="izquierda" onClick={() => irA(-1)} />
              <FlechaVisor lado="derecha" onClick={() => irA(1)} />
            </>
          )}
        </div>

        <footer className="flex items-center justify-center gap-4 p-3 text-xs sm:p-4">
          {total > 1 && (
            <span className="rounded-full bg-background/15 px-3 py-1 font-medium backdrop-blur">
              {indice + 1} / {total}
            </span>
          )}

          <span className="hidden text-primary-foreground/70 sm:block">
            Rueda o pellizco para acercar · arrastra para mover · doble clic para restablecer
          </span>
        </footer>
      </div>
    </dialog>
  )
}

function BotonVisor({
  etiqueta,
  onClick,
  children,
  deshabilitado = false,
  className,
}: {
  etiqueta: string
  onClick: () => void
  children: React.ReactNode
  deshabilitado?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      onClick={onClick}
      disabled={deshabilitado}
      className={cn(
        'grid size-9 place-items-center rounded-full transition-colors',
        'hover:bg-background/25 disabled:opacity-40 disabled:hover:bg-transparent',
        className,
      )}
    >
      {children}
    </button>
  )
}

function FlechaVisor({ lado, onClick }: { lado: 'izquierda' | 'derecha'; onClick: () => void }) {
  const esIzquierda = lado === 'izquierda'

  return (
    <button
      type="button"
      aria-label={esIzquierda ? 'Imagen anterior' : 'Imagen siguiente'}
      onClick={onClick}
      // La flecha vive dentro del marco que arrastra y hace zoom: sus gestos no son de la imagen.
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      className={cn(
        'absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full',
        'bg-background/15 backdrop-blur transition-colors hover:bg-background/30',
        esIzquierda ? 'left-3 sm:left-6' : 'right-3 sm:right-6',
      )}
    >
      {esIzquierda ? (
        <ChevronLeft className="size-6" aria-hidden />
      ) : (
        <ChevronRight className="size-6" aria-hidden />
      )}
    </button>
  )
}
