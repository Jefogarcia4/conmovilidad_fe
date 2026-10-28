/**
 * Destinos de los trámites que no resuelve la plataforma sino el aliado financiero.
 *
 * Viven en un solo archivo porque los mismos enlaces aparecen en el panel del detalle y en los
 * banners del inicio: repetidos, el día que cambie uno se actualizaría en un sitio y no en el otro.
 */

/**
 * Portal de servicios digitales de Presente, donde se tramita el crédito. El `redirect_uri` lo
 * fija el propio portal: primero autentica la identidad y luego devuelve al usuario allí.
 */
export const URL_FINANCIACION =
  'https://gestionidentidad.presente.com.co/?redirect_uri=https://apps.presente.com.co/servicios-digitales-presente/'

/** Asesoría en seguros del aliado. */
export const URL_SEGURO = 'https://www.presente.com.co/seguros-y-exequial/especialista-en-seguros?'

/**
 * Compra de SOAT. Las marcas de campaña del enlace hay que conservarlas: son las que le permiten
 * al aliado atribuirle la venta a ConMovilidad.
 */
export const URL_SOAT = 'https://soatmundial.com.co/packmovilidad/?utm_source=Presente&utm_medium=WebSite'
