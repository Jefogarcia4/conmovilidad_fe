# ConMovilidad — Frontend

SPA en React 19 + TypeScript + Vite 8, consumiendo la API .NET de `conmovilidad_be`.

## Puesta en marcha

Requisitos: Node 20+ y la API corriendo en `http://localhost:5153`.

```bash
npm install
npm run dev
```

Queda en <http://localhost:5173>. El proxy de Vite redirige `/api` y `/uploads` a la API, así que
no hace falta configurar CORS ni variables de entorno en desarrollo.

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Chequeo de tipos + build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm run lint` | oxlint |

Se entra con **número de documento**, no con correo. Para probar: `10000002` / `Movilidad2026*`
(el resto de usuarios está en el README del backend).

## Estructura

```text
src/
  api/         Cliente HTTP, tipos del backend y endpoints tipados
  auth/        Contexto de sesión, hook useAuth y guardas de ruta
  components/  ui/ (piezas reutilizables) y layout/ (chrome de la app)
  features/    Una carpeta por dominio funcional
  lib/         Utilidades transversales
```

`features/` agrupa por dominio, no por tipo de archivo: todo lo de una pantalla vive junto y se
puede borrar de una pieza cuando deja de existir.

## Sistema de diseño

Los tokens salen del mockup en Vercel (`conmovilidad.vercel.app`) y viven en un único sitio,
el bloque `@theme` de [src/index.css](src/index.css). **Ningún componente debe llevar un color
suelto**: si hace falta un tono nuevo, primero se agrega como token.

| Token | Valor | Uso |
| --- | --- | --- |
| `--color-cta` | `#d8017d` | Botón principal, enlaces de marca, acentos |
| `--color-cta-hover` | `#b9006a` | Hover del CTA |
| `--color-primary` | `#393338` | Fondo del panel del login, texto de énfasis |
| `--color-foreground` | `#221e22` | Texto principal |
| `--color-muted-foreground` | `#676166` | Texto secundario |
| `--color-border` / `--color-input` | `#e4e0e2` | Bordes y campos |
| `--color-accent` | `#ffe7f1` | Realces suaves en tono marca |
| `--radius` | `0.75rem` | Radio base |

Tipografías: **Inter** para interfaz y **Sora** (`font-display`) para titulares.

Los recursos de marca (`public/brand/logo-mark.png`, `public/hero/hero-showroom.png`) se tomaron
del mockup, así que la marca es la real y no una reconstrucción.

## Sesión y llamadas a la API

[src/api/cliente.ts](src/api/cliente.ts) envuelve `fetch` y se encarga de:

- Adjuntar el `Bearer` en cada petición.
- **Refrescar el token ante un 401** y reintentar la petición original una vez. Si varias
  peticiones fallan a la vez, todas esperan al mismo refresco: el backend rota el refresh token en
  cada canje, así que dos refrescos en paralelo se anularían entre sí.
- Convertir los `ProblemDetails` de la API en un `ApiError` con el `codigo` estable, para que la UI
  reaccione al código y no al texto del mensaje.

Los tokens se guardan en `localStorage`. Es una decisión consciente y anotada en
[src/api/sesion.ts](src/api/sesion.ts): sobrevive a recargas, pero queda expuesta a XSS. La
alternativa robusta —refresh token en cookie `httpOnly`— exige que la API emita cookies y que
front y API compartan dominio; queda pendiente de definir el despliegue.

## Rutas

Las rutas conservan los mismos nombres del mockup (`/home`, `/my-vehicles`, `/publish`).

| Ruta | Acceso | Estado |
| --- | --- | --- |
| `/login` | Pública (redirige si ya hay sesión) | Terminada, fiel al mockup |
| `/home` | Protegida | Terminada, fiel al mockup |
| `/my-vehicles` | Protegida | Terminada, con vista de tabla y de tarjetas |
| `/publish` | Protegida | Terminada, con subida real a Azure Blob |
| `/activar-cuenta` | Protegida | Primer ingreso: contraseña nueva y correo de recuperación |
| `/admin/*` | Solo superadministrador | Convenios, empresas y usuarios |
| `/vehicle/:id` y las legales | Protegida | Marcador «en construcción» |

`RutaProtegida` recuerda a dónde iba el usuario y lo devuelve allí después de iniciar sesión.
Ninguna ruta enlazada desde el header o el footer lleva a una pantalla en blanco: las que aún no
tienen mockup muestran un marcador.

## Decisiones del home

- **Carrusel del hero**: 8 mensajes sobre 4 fotos, con autoplay de 6 s que se pausa al pasar el
  ratón o al enfocar con teclado. Los mensajes están en `CarruselHero.tsx`.
- **Filtro «Modelo»**: en el mockup va después de «Marca», así que se interpretó como la **línea**
  del vehículo (Mazda → CX-5), no como el año. En la API ese campo es `lineaId`; `modelo` allí es el
  año. El select se habilita solo al elegir marca, porque las líneas dependen de ella.
- **Filtro «Ciudad»**: la API no tiene catálogo de ciudades, así que se derivan de las empresas del
  convenio del usuario — exactamente el universo de ciudades donde puede haber vehículos visibles.
- **Precios**: se escriben con separadores de miles en vivo y se consultan con *debounce* de 400 ms,
  para no lanzar una petición por cada tecla de una cifra de nueve dígitos.
- **Carrusel de la tarjeta**: requirió añadir `imagenes: string[]` al DTO de lista del backend; antes
  solo devolvía la imagen principal.

## Decisiones de «Mis vehículos»

- **Dos vistas**: tabla (por defecto) y tarjetas. La elección se guarda en `localStorage`
  (`conmovilidad.vistaMisVehiculos`) y sobrevive a la recarga; si el valor almacenado no
  corresponde a ningún modo válido se cae al de por defecto.
- **La tarjeta de gestión es distinta a la del catálogo** y por eso vive en su propio componente
  (`TarjetaMiVehiculo`): la del catálogo *vende* —marca destacada, versión, precio en color de
  marca, botón «Ver Vehículo»— mientras que esta *administra* —estado de la publicación, datos
  condensados en una línea y acciones de editar, ver y eliminar—. Intentar unificarlas con
  banderas habría dejado un componente con dos personalidades.
- En el mockup el badge de estado sobre la foto usa texto casi blanco sobre fondo casi blanco y
  queda ilegible; aquí el texto va en `foreground` y el color lo aporta el punto, conservando el
  mismo aspecto.
- **Estados**: el diseño llama «Activo» a la publicación viva, que en el dominio es `Disponible`.
  Esa traducción vive en un solo sitio, `estadoVehiculo.ts`, junto con el color de cada estado;
  el resto (`Reservado`, `Vendido`, `Borrador`, `Inactivo`) conserva su nombre.
- **Eliminar** pide confirmación en un `<dialog>` nativo, que aporta atrapado de foco, cierre con
  Escape y fondo inerte sin librerías. El mensaje nombra el vehículo y su placa, porque en una
  tabla de filas parecidas conviene que el usuario confirme *cuál* está borrando.
- **Esqueleto de carga** por vista: imita la silueta de la tabla o de las tarjetas según el modo
  activo, para que al terminar la carga no haya un salto de maquetación.
- La tabla no se comprime: por debajo de su ancho mínimo se desplaza horizontalmente en su propio
  contenedor, sin arrastrar el resto de la página.

## Verificado

Flujo probado en navegador (Edge headless vía CDP):

- Ruta protegida sin sesión → redirige a `/login`.
- Formulario vacío → los tres mensajes de validación.
- Credenciales incorrectas → alerta con el mensaje de la API.
- Login correcto → `/home` con el carrusel de 8 diapositivas y los 6 vehículos del convenio.
- Filtrar por marca BMW → 1 resultado y el select «Modelo» se habilita.
- Precio máximo imposible → estado vacío con opción de limpiar filtros.
- `/my-vehicles` → 3 publicaciones propias.
- Menú de usuario → abre y cierra sesión, volviendo a `/login` sin tokens.
- Sin errores de consola.

## Desplegables con búsqueda

Todos los desplegables de la aplicación usan `ComboBox`: se escribe para filtrar en vez de recorrer
la lista. Con quince marcas o veintidós años, teclear dos letras es bastante más rápido.

Sigue el patrón ARIA de combobox: el campo lleva `role="combobox"` con `aria-expanded`, la lista es
un `listbox` de `option`, y la opción resaltada se comunica con `aria-activedescendant` **sin mover
el foco real**, que es lo que permite seguir escribiendo mientras se navega con las flechas.

- Flechas para moverse, `Enter` para elegir, `Escape` para cerrar, `Tab` para salir.
- El resaltado sigue al ratón, para que puntero y teclado no se contradigan.
- Con `permitirCrear` (campo «Modelo») ofrece «Agregar «X»» cuando lo escrito no está en la lista.
- Tras elegir devuelve el foco al campo sin reabrir la lista: un `focus()` posterior a una
  selección se ignora a propósito, o al hacer clic en una opción el desplegable revolvería a abrirse.

Se sacrificó el selector nativo del sistema en móvil, que era la ventaja del `<select>`. A cambio,
el comportamiento es idéntico en todas las plataformas y las listas largas se vuelven manejables.

## Decisiones de «Publicar vehículo»

- **Los dos campos «Modelo» del mockup son cosas distintas**: el de texto es la línea comercial
  («Corolla Cross») y el desplegable es el año. Aquí el segundo se llama **«Año»**, porque dos
  etiquetas idénticas en un mismo formulario confunden al usuario y rompen la accesibilidad.
- **Modelo con autocompletar**: sugiere las líneas del catálogo de la marca elegida y además deja
  escribir una nueva, avisando de que se creará. La API la da de alta si no existe, así el asesor
  no queda bloqueado por un modelo aún no registrado y el catálogo sigue sirviendo para filtrar.
- **Cilindraje en centímetros cúbicos** (`2.000`), no en litros: guardado como número, permite
  filtrar y ordenar más adelante.
- **Color es texto libre**, no un desplegable: la gama real («Azul Océano», «Gris Meteoro») no cabe
  en una lista cerrada. Se acompaña de un `datalist` con los colores básicos como ayuda, que sugiere
  sin restringir lo que se escriba.
- **«Vencido» deshabilita la fecha** del documento correspondiente: son estados excluyentes, y
  verlo antes que el campo explica por qué queda inactivo.
- **Las imágenes se suben al elegirlas**, no al enviar el formulario: el asesor ve la miniatura de
  inmediato y el envío final solo manda URLs. Si quita una imagen se borra también del almacén,
  para no dejar basura cuando la publicación se abandona.
- **La galería se reordena arrastrando** y la primera queda marcada como principal, que es la que
  se muestra en el catálogo.
- **Formatos**: JPEG, PNG, WebP y HEIC. Se descartó RAW —pesa 20-50 MB y nadie lo sube desde un
  móvil a un marketplace—; el HEIC de iPhone lo recodifica la API a WebP.
- **Cada foto se recodifica en el navegador antes de enviarla** (`lib/comprimirImagen.ts`): 2000 px
  de lado mayor y JPEG al 85 %, con lo que una foto de iPhone baja de 3-15 MB a 300-600 KB. Es la
  diferencia entre subir veinte fotos en segundos o en minutos, y minutos era directamente un
  error: el balanceador de App Service corta a los 230 s con un 502. No se pierde calidad visible
  porque la API reduce a 1600 px de todos modos. Si algo falla —un HEIC que el navegador no sabe
  decodificar, memoria insuficiente— se manda el original y la API se encarga: publicar nunca
  depende de que la compresión funcione.
- **La orientación de la cámara se sondea, no se supone.** Al recodificar se pierde el EXIF, así
  que el giro tiene que quedar grabado en los píxeles; pero los navegadores vigentes ya lo aplican
  al decodificar y volver a girar dejaría **todas** las fotos del iPhone tumbadas. Una foto de
  prueba de 2×1 con `Orientation = 6` resuelve la duda una vez por sesión.
- **Se sube una foto por petición, tres en paralelo** (`lib/subirImagenes.ts`), con reintento ante
  fallos de red o 5xx y avance visible. Las veinte en un solo `FormData` eran todo o nada: si
  fallaba la decimoctava se perdían las diecisiete anteriores. Ahora las que entran se conservan y
  el aviso dice cuáles repetir.

## Portal de administración

Reservado al rol `SuperAdministrador`, con tres pestañas: convenios, empresas y usuarios.

- **El convenio de un usuario se asigna eligiendo su empresa.** El formulario pide primero el
  convenio y luego filtra sus empresas; no hay relación directa usuario-convenio en el modelo.
- **La guarda de ruta es solo comodidad de interfaz.** La autorización real la impone la API, que
  responde 403 a `/api/admin/*` para cualquier otro rol. Entrar por URL directa muestra una
  pantalla de acceso denegado en vez de una página rota.
- **Contraseña inicial visible al crear el usuario**: se escribe en claro a propósito, porque el
  administrador tiene que dictársela. El backend marca la cuenta como pendiente de activar.
- **El administrador no captura el correo.** Lo registra el propio usuario al activar su cuenta:
  es su correo personal de recuperación, no un dato corporativo que otro deba inventar.
- **La activación bloquea el resto de la aplicación**: mientras `debeCambiarPassword` esté activo,
  cualquier ruta protegida redirige a `/activar-cuenta`. No basta con enlazarla.
- La pantalla de activación pide contraseña nueva **y** correo en un solo paso, porque resuelven el
  mismo problema: la clave la conoce el administrador y, sin correo, el usuario dependería de él
  cada vez que la olvide. Si el usuario ya tenía correo, se propone para que solo lo confirme.
- Los registros inactivos se siguen listando, atenuados, en vez de desaparecer: hace falta poder
  reactivarlos.
- **Carga masiva de usuarios** desde CSV o Excel, en un diálogo de tres pasos: descargar plantilla,
  subir archivo, ver resultado. Si el archivo tiene errores se muestran en tabla con fila, columna y
  motivo, y **no se crea ningún usuario**; elegir un archivo nuevo limpia el resultado anterior para
  no mezclar dos intentos. La plantilla se descarga con el cliente autenticado y se entrega como
  blob, porque la ruta exige el token y un `<a href>` normal no lo lleva.

El portal y el formulario de publicación se cargan con `lazy`, para que el catálogo —lo primero que
ve todo el mundo— no arrastre código que la mayoría nunca abre.

## Nota sobre dependencias

`react-router-dom` está fijado en `7.18.1`. `npm audit` marca un aviso *high* sobre el modo RSC
(React Server Components), que esta SPA no usa. Todas las versiones 7.x anteriores acumulan
vulnerabilidades reales que sí aplican —entre ellas una RCE por `turbo-stream` hasta la 7.14.1—,
así que **bajar de versión empeora la seguridad**. Revisar cuando salga la 8.3.0.

## Pendiente

- Pantallas de «Mis Vehículos» y detalle del vehículo definitivas (esperando mockups).
- Formulario de publicación con subida de imágenes a `/api/archivos/imagenes-vehiculo`.
- Páginas legales, de equipo y de asesoría: los enlaces del footer ya apuntan a esas rutas.
- Recuperación de contraseña y solicitud de cuenta, enlazadas desde el login.
- El campo de login se llama "Usuario" (como el mockup) pero la API autentica por correo.
- El mockup muestra un distintivo «Blindado» en una tarjeta; el modelo de datos aún no tiene ese
  atributo, así que solo se pinta el año y, cuando aplica, el estado «Reservado».
