import { z } from 'zod'

const anioActual = new Date().getFullYear()

/**
 * Esquema del formulario de publicación. Cubre por ahora las secciones «Datos principales» y
 * «Especificaciones técnicas»; las de documentación e imágenes se añadirán con sus mockups.
 */
export const esquemaPublicacion = z.object({
  // --- Datos principales ---
  marcaId: z.string().min(1, 'Selecciona la marca.'),

  /** Línea escrita o elegida del catálogo. */
  lineaNombre: z.string().trim().min(1, 'Indica el modelo.').max(100),

  /** Se rellena solo si lo escrito coincide con una línea existente. */
  lineaId: z.string().optional(),

  version: z.string().trim().max(100).optional(),

  modelo: z
    .number({ message: 'Selecciona el año.' })
    .int()
    .min(1950, 'El año no es válido.')
    .max(anioActual + 2, 'El año no es válido.'),

  tipoVehiculo: z.string().min(1, 'Selecciona el tipo de vehículo.'),

  color: z.string().min(1, 'Selecciona el color.'),

  placa: z
    .string()
    .trim()
    .min(1, 'Indica la placa.')
    .regex(/^[A-Za-z0-9- ]{5,10}$/, 'La placa debe tener entre 5 y 10 caracteres alfanuméricos.'),

  ciudadMatricula: z.string().optional(),

  ciudad: z.string().min(1, 'Selecciona la ubicación.'),

  // --- Especificaciones técnicas ---
  kilometraje: z
    .number({ message: 'Indica el kilometraje.' })
    .int()
    .min(0)
    .max(3_000_000, 'El kilometraje no es válido.'),

  /** Centímetros cúbicos. */
  cilindraje: z.number().int().min(1).max(20_000, 'El cilindraje no es válido.').optional(),

  combustible: z.string().min(1, 'Selecciona el combustible.'),

  /** Nombres del enum de la API (`Manual`, `Automatica`), no las etiquetas que ve el usuario. */
  transmision: z.string().optional(),

  traccion: z.string().optional(),

  capacidadPasajeros: z
    .number()
    .int()
    .min(1)
    .max(80, 'La capacidad debe estar entre 1 y 80 pasajeros.')
    .optional(),

  precio: z
    .number({ message: 'Indica el precio.' })
    .positive('El precio debe ser mayor que cero.')
    .max(100_000_000_000, 'El precio excede el máximo permitido.'),

  // --- Documentación y estado legal ---
  /** Formato `YYYY-MM-DD`, tal como lo entrega un `input[type=date]`. */
  vencimientoSoat: z.string().optional(),
  soatVencido: z.boolean().optional(),

  vencimientoTecnomecanica: z.string().optional(),
  tecnomecanicaVencida: z.boolean().optional(),

  tienePrenda: z.boolean().optional(),
  esBlindado: z.boolean().optional(),
})

export type FormularioPublicacion = z.infer<typeof esquemaPublicacion>

export const valoresIniciales: Partial<FormularioPublicacion> = {
  marcaId: '',
  lineaNombre: '',
  version: '',
  tipoVehiculo: '',
  color: '',
  placa: '',
  ciudadMatricula: '',
  ciudad: '',
  combustible: '',
  transmision: '',
  traccion: '',
  vencimientoSoat: '',
  vencimientoTecnomecanica: '',
  soatVencido: false,
  tecnomecanicaVencida: false,
  tienePrenda: false,
  esBlindado: false,
}

/** Años que ofrece el desplegable «Modelo», del más reciente al más antiguo. */
export const aniosDisponibles = Array.from({ length: 22 }, (_, i) => anioActual + 1 - i)
