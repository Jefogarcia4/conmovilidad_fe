/**
 * Clases compartidas por inputs y selects del formulario, para que midan, se enfoquen y
 * se deshabiliten igual. Vive fuera del componente porque exportar constantes junto a
 * componentes rompe el refresco en caliente de Vite.
 */
export const clasesControl = [
  'h-9 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-sm',
  'transition-colors outline-none placeholder:text-muted-foreground',
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-60',
].join(' ')
