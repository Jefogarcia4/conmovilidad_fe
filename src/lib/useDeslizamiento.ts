import { useRef } from 'react'

/** Recorrido antes de decidir si el gesto es horizontal o vertical. */
const UMBRAL_DIRECCION = 10

/** Distancia mínima para que un arrastre pausado cuente como cambio de foto. */
const UMBRAL_DISTANCIA = 45

/** Un gesto rápido cuenta aunque sea corto: así es como se pasa una foto de verdad. */
const MS_GOLPE_RAPIDO = 250
const DISTANCIA_GOLPE_RAPIDO = 20

interface Opciones {
  onSiguiente: () => void
  onAnterior: () => void
  /** Permite apagarlo cuando no hay nada que deslizar, o cuando manda otro gesto (el zoom). */
  activo?: boolean
}

/**
 * Deslizamiento lateral para carruseles táctiles.
 *
 * El gesto se decide por el eje dominante de los primeros píxeles: si el dedo va hacia los lados
 * pasamos de foto, y si va hacia arriba o abajo se abandona para que la página siga desplazándose
 * con normalidad. Sin esa distinción, un carrusel a pantalla completa deja al usuario atrapado.
 *
 * El contenedor debe llevar `touch-pan-y`, que cede al navegador el desplazamiento vertical y nos
 * reserva el horizontal.
 */
export function useDeslizamiento({ onSiguiente, onAnterior, activo = true }: Opciones) {
  const inicio = useRef<{ x: number; y: number; t: number } | null>(null)
  const eje = useRef<'indeciso' | 'horizontal' | 'vertical'>('indeciso')

  /** Un deslizamiento no debe además abrir lo que haya debajo del dedo. */
  const huboDeslizamiento = useRef(false)

  const olvidar = () => {
    inicio.current = null
    eje.current = 'indeciso'
  }

  return {
    onPointerDown: (e: React.PointerEvent) => {
      if (!activo || !e.isPrimary) return

      inicio.current = { x: e.clientX, y: e.clientY, t: e.timeStamp }
      eje.current = 'indeciso'
      huboDeslizamiento.current = false
    },

    onPointerMove: (e: React.PointerEvent) => {
      const desde = inicio.current
      if (!desde || eje.current !== 'indeciso') return

      const dx = Math.abs(e.clientX - desde.x)
      const dy = Math.abs(e.clientY - desde.y)

      if (Math.max(dx, dy) > UMBRAL_DIRECCION) {
        eje.current = dx > dy ? 'horizontal' : 'vertical'
      }
    },

    onPointerUp: (e: React.PointerEvent) => {
      const desde = inicio.current
      const direccion = eje.current
      olvidar()

      if (!desde || direccion !== 'horizontal') return

      const dx = e.clientX - desde.x
      const recorrido = Math.abs(dx)
      const rapido =
        e.timeStamp - desde.t < MS_GOLPE_RAPIDO && recorrido > DISTANCIA_GOLPE_RAPIDO

      if (recorrido < UMBRAL_DISTANCIA && !rapido) return

      huboDeslizamiento.current = true

      // Arrastrar hacia la izquierda trae la foto siguiente, como pasar una página.
      if (dx < 0) onSiguiente()
      else onAnterior()
    },

    // El navegador lo dispara cuando decide desplazar la página: el gesto ya no es nuestro.
    onPointerCancel: olvidar,

    /**
     * Va en la fase de captura para llegar antes que el elemento pulsado: al soltar tras un
     * deslizamiento, el navegador emite un clic que abriría el visor o seguiría un enlace.
     */
    onClickCapture: (e: React.MouseEvent) => {
      if (!huboDeslizamiento.current) return

      e.preventDefault()
      e.stopPropagation()
      huboDeslizamiento.current = false
    },
  }
}
