import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  etiqueta: ReactNode
  checked: boolean
  onChange: (valor: boolean) => void
  id?: string
  className?: string
}

export function Casilla({ etiqueta, checked, onChange, id, className }: Props) {
  const idGenerado = useId()
  const idCampo = id ?? idGenerado

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <input
        id={idCampo}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 shrink-0 rounded-[4px] border-input accent-cta"
      />

      <label htmlFor={idCampo} className="text-sm text-foreground select-none">
        {etiqueta}
      </label>
    </div>
  )
}
