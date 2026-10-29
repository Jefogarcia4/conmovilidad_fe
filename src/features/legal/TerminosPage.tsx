import { Destacado, Li, Lista, P, PaginaLegal, Seccion, Subseccion } from './PaginaLegal'

/**
 * Términos y Condiciones de uso, publicación y comercialización.
 *
 * El texto es transcripción del documento vigente de AUTOS GALERIA S.A.S. No se resume ni se
 * reescribe: es lo que el usuario acepta al ingresar, así que lo que muestra la aplicación y lo
 * que dice el documento firmado tienen que ser lo mismo. Al llegar una versión nueva se actualizan
 * el contenido y las dos constantes de abajo.
 */
const VERSION = '02'
const ACTUALIZACION = '19 de agosto de 2026'

export function TerminosPage() {
  return (
    <PaginaLegal
      titulo="Términos y Condiciones de uso, publicación y comercialización"
      version={VERSION}
      actualizacion={ACTUALIZACION}
    >
      <Destacado titulo="Regla de identificación del vendedor">
        <P>
          Cada anuncio debe indicar de forma visible si el vehículo es vendido directamente por
          AUTOS GALERIA S.A.S. o si es ofrecido por un tercero. Esta distinción determina quién
          asume las obligaciones propias de la compraventa, sin perjuicio de las obligaciones que
          correspondan a ConMovilidad por su propio servicio digital.
        </P>

        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-medium text-foreground">Escenario</th>
                <th className="py-2 pr-3 text-left font-medium text-foreground">Quién vende</th>
                <th className="py-2 text-left font-medium text-foreground">Regla principal</th>
              </tr>
            </thead>

            <tbody className="text-muted-foreground">
              <tr className="border-b border-border">
                <td className="py-2 pr-3 align-top font-medium text-foreground">Venta propia</td>
                <td className="py-2 pr-3 align-top">AUTOS GALERIA S.A.S.</td>
                <td className="py-2 align-top">
                  AUTOS GALERIA S.A.S. asume las obligaciones legales del proveedor o expendedor
                  respecto del vehículo que vende.
                </td>
              </tr>

              <tr>
                <td className="py-2 pr-3 align-top font-medium text-foreground">
                  Publicación de tercero
                </td>
                <td className="py-2 pr-3 align-top">El anunciante identificado en el aviso</td>
                <td className="py-2 align-top">
                  ConMovilidad facilita publicación y contacto. El tercero responde por su oferta y
                  venta, sin eliminar las obligaciones propias que la ley asigne a la Plataforma.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Destacado>

      <Seccion numero="1" titulo="Identificación y datos de contacto">
        <P>
          La plataforma ConMovilidad es operada por AUTOS GALERIA S.A.S., identificada con NIT
          902.041.528-4.
        </P>

        <Lista>
          <Li>
            Correo electrónico de contacto y protección de datos:{' '}
            <a href="mailto:autos.galeria.med@gmail.com" className="text-cta hover:underline">
              autos.galeria.med@gmail.com
            </a>
          </Li>
          <Li>Teléfono: +57 314 803 7183.</Li>
          <Li>
            Dirección de notificaciones y domicilio: Cra 43A #19A 87, Local 112 (Movicentro Centro
            Comercial Automotriz) Medellín, Antioquia.
          </Li>
          <Li>
            Sitio web:{' '}
            <a
              href="https://www.conmovilidad.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cta hover:underline"
            >
              https://www.conmovilidad.com
            </a>
          </Li>
          <Li>
            Canal web de PQR y seguimiento:{' '}
            <a href="/contacto" className="text-cta hover:underline">
              https://www.conmovilidad.com/contacto
            </a>
          </Li>
        </Lista>
      </Seccion>

      <Seccion numero="2" titulo="Objeto y aceptación de los Términos">
        <P>
          Estos Términos regulan el acceso y uso de ConMovilidad, la creación y administración de
          cuentas, la publicación de vehículos, la contratación de servicios publicitarios, las
          ventas directas realizadas por AUTOS GALERIA S.A.S. y las funcionalidades mediante las
          cuales compradores y vendedores terceros pueden ponerse en contacto.
        </P>

        <P>
          El usuario debe leer estos Términos antes de registrarse, publicar, contratar o comprar.
          Cuando la operación se realice por medios electrónicos, la Plataforma podrá conservar
          evidencia de la aceptación, incluyendo la versión aceptada, fecha, hora y datos técnicos
          razonables que permitan acreditar la transacción. La aceptación de estos Términos no
          sustituye una autorización separada para el tratamiento de datos personales cuando la ley
          exija obtenerla de forma independiente.
        </P>

        <P>
          Las condiciones particulares contenidas en una oferta, orden de compra, contrato de
          compraventa, contrato de publicación, plan corporativo u otro documento específico
          prevalecerán respecto del asunto concreto que regulen, siempre que no desconozcan normas
          imperativas ni derechos irrenunciables del consumidor.
        </P>
      </Seccion>

      <Seccion numero="3" titulo="Usuarios habilitados, capacidad legal y acceso por convenios">
        <P>
          Los servicios de ConMovilidad que impliquen registro, publicación de vehículos,
          contratación, oferta, compra, venta o cualquier otro acto que genere obligaciones
          jurídicas están dirigidos a personas con capacidad legal para obligarse conforme a la
          legislación colombiana. Cuando una persona actúe en nombre de una sociedad, entidad o
          tercero, declara que cuenta con facultades o autorizaciones suficientes para representarlo
          y deberá acreditarlas cuando AUTOS GALERIA S.A.S. lo solicite razonablemente. La
          Plataforma podrá restringir o suspender una actuación cuando existan motivos objetivos
          para considerar que falta capacidad, representación o autorización, sin afectar derechos
          adquiridos ni obligaciones pendientes.
        </P>

        <P>
          ConMovilidad podrá ofrecer acceso o condiciones comerciales especiales a asociados de
          fondos de empleados y a usuarios vinculados con entidades que tengan convenio vigente con
          AUTOS GALERIA S.A.S. También podrá habilitar planes para concesionarios, empresas y
          aliados comerciales. La existencia de un convenio no convierte al fondo de empleados o a
          la entidad aliada en vendedor del vehículo, salvo que así se indique expresamente en el
          anuncio o contrato correspondiente.
        </P>
      </Seccion>

      <Seccion numero="4" titulo="Modalidades de operación">
        <Subseccion titulo="4.1. Venta directa">
          <P>
            Cuando el anuncio identifique a AUTOS GALERIA S.A.S. como vendedor, la sociedad actúa
            como proveedor o expendedor del vehículo y asume las obligaciones que le correspondan
            por información, precio, calidad, idoneidad, seguridad, garantía legal, entrega,
            atención de reclamaciones y demás deberes aplicables.
          </P>
        </Subseccion>

        <Subseccion titulo="4.2. Portal de contacto para terceros">
          <P>
            Cuando el anuncio identifique a una persona natural o jurídica distinta de AUTOS GALERIA
            S.A.S. como vendedor, ConMovilidad facilita la publicación y el contacto. El vendedor
            tercero es responsable por la titularidad, disponibilidad, procedencia y veracidad de la
            oferta y por las obligaciones que legalmente le correspondan como vendedor. Esta
            delimitación no excluye las responsabilidades propias que puedan corresponder a AUTOS
            GALERIA S.A.S. por la operación de la Plataforma, la publicidad que emita, la
            información que suministre, la seguridad del servicio digital o su participación
            efectiva en una transacción.
          </P>
        </Subseccion>

        <Subseccion titulo="4.3. Servicios adicionales">
          <P>
            La Plataforma podrá ofrecer o facilitar peritajes, acompañamiento documental, trámites
            de tránsito, financiación, seguros, publicidad destacada u otros servicios. Antes de
            contratarlos se informará quién es el prestador, su precio, alcance y condiciones. La
            sola referencia o enlace a un tercero no implica que AUTOS GALERIA S.A.S. garantice sus
            servicios, salvo obligación legal o compromiso expreso.
          </P>
        </Subseccion>
      </Seccion>

      <Seccion numero="5" titulo="Registro, creación de cuentas, seguridad y reglas de uso">
        <P>
          Las cuentas individuales o corporativas podrán ser creadas directamente por el
          administrador de la Plataforma, previa solicitud y validación de la información requerida.
          El usuario debe suministrar datos veraces, completos y actualizados y deberá informar
          cambios relevantes.
        </P>

        <P>
          Una vez entregadas las credenciales, el usuario debe conservarlas de manera confidencial y
          evitar su uso por personas no autorizadas. Debe reportar de inmediato cualquier pérdida,
          suplantación, acceso no autorizado o actividad sospechosa. AUTOS GALERIA S.A.S. podrá
          suspender temporalmente una cuenta cuando existan indicios razonables de fraude, riesgo de
          seguridad, incumplimiento de estos Términos o requerimiento de autoridad, con respeto del
          debido proceso contractual y de los derechos que resulten aplicables.
        </P>

        <Subseccion titulo="5.1. Usos prohibidos y protección de la Plataforma">
          <P>
            El usuario deberá utilizar ConMovilidad de buena fe y únicamente para finalidades
            lícitas y compatibles con los servicios ofrecidos. Sin autorización previa y expresa de
            AUTOS GALERIA S.A.S., queda prohibido:
          </P>

          <Lista>
            <Li>
              Suplantar a otra persona, crear cuentas con información falsa o utilizar credenciales
              ajenas.
            </Li>
            <Li>
              Intentar acceder a cuentas, sistemas, servidores, interfaces, bases de datos o
              funcionalidades para las cuales el usuario no esté autorizado, así como eludir
              controles de autenticación o seguridad.
            </Li>
            <Li>
              Realizar pruebas de vulnerabilidad, escaneos, ataques, interferencias, ingeniería
              inversa o cualquier acción destinada a afectar la disponibilidad, integridad o
              confidencialidad de la Plataforma, salvo autorización expresa y dentro del alcance
              acordado.
            </Li>
            <Li>
              Introducir malware, código malicioso, archivos dañinos o mecanismos que puedan afectar
              equipos, redes, servicios o información de ConMovilidad o de terceros.
            </Li>
            <Li>
              Utilizar bots, scrapers, crawlers, herramientas automatizadas o métodos equivalentes
              para extraer, copiar, indexar o recolectar de forma masiva o sistemática anuncios,
              precios, fotografías, datos de contacto u otra información, salvo que la Plataforma lo
              permita técnicamente o exista autorización expresa.
            </Li>
            <Li>
              Recolectar o utilizar datos de contacto de otros usuarios para spam, prospección
              comercial ajena a la negociación del vehículo, reventa de bases de datos, acoso o
              finalidades incompatibles con el propósito para el cual fueron facilitados.
            </Li>
            <Li>
              Eludir tarifas, restricciones, límites de publicaciones, controles antifraude o
              cualquier medida destinada a proteger la operación del servicio.
            </Li>
          </Lista>

          <P>
            Ante indicios razonables de estas conductas, AUTOS GALERIA S.A.S. podrá adoptar medidas
            proporcionales de prevención, bloqueo, retiro de contenido o suspensión, conservar los
            soportes necesarios y, cuando corresponda, informar al usuario sobre la razón y el
            mecanismo de revisión, sin perjuicio de las actuaciones legales que resulten
            procedentes.
          </P>
        </Subseccion>
      </Seccion>

      <Seccion
        numero="6"
        titulo="Protección de datos personales y armonización con la autorización existente"
      >
        <P>
          AUTOS GALERIA S.A.S. actúa como responsable del Tratamiento respecto de los datos
          personales sobre los cuales define finalidades y medios. El tratamiento se realizará
          conforme a la Ley 1581 de 2012, su reglamentación incorporada en el Decreto 1074 de 2015,
          las instrucciones de la Superintendencia de Industria y Comercio, la Política de
          Tratamiento de Datos Personales vigente y las autorizaciones válidamente obtenidas.
        </P>

        <P>
          El formato de «Autorización para el Tratamiento de Datos Personales» utilizado por AUTOS
          GALERIA S.A.S. deberá entenderse como un instrumento complementario a estos Términos. La
          aceptación de los Términos no amplía por sí sola las finalidades informadas al titular ni
          autoriza tratamientos que requieran consentimiento previo, expreso e informado.
        </P>

        <P>
          Los datos podrán tratarse, según la relación con el titular, para: gestionar registro y
          cuenta; publicar y administrar anuncios; atender solicitudes de compra o venta; verificar
          identidad y seguridad; ejecutar contratos; facturar, recaudar y gestionar cartera;
          coordinar trámites de tránsito y entrega; atender PQR y garantías; prevenir fraude y
          gestionar riesgos contractuales; cumplir obligaciones legales y requerimientos de
          autoridad; y conservar soportes de las operaciones.
        </P>

        <P>
          Cuando se soliciten datos sensibles o información de niños, niñas o adolescentes, se
          respetará el carácter facultativo de su entrega y las condiciones especiales de protección
          previstas por la ley. AUTOS GALERIA S.A.S. evitará recolectarlos cuando no sean necesarios
          para una finalidad legítima y previamente informada.
        </P>

        <P>
          El titular podrá conocer, actualizar, rectificar y solicitar la supresión de sus datos,
          solicitar prueba de la autorización, ser informado sobre el uso de su información,
          presentar consultas o reclamos y revocar la autorización cuando sea jurídicamente
          procedente. La revocatoria o supresión no procederá respecto de información que deba
          conservarse por una obligación legal o contractual vigente. Las solicitudes podrán
          presentarse al correo autos.galeria.med@gmail.com y por los demás canales que publique la
          sociedad.
        </P>
      </Seccion>

      <Seccion numero="7" titulo="Datos financieros, crediticios, comerciales y de servicios">
        <P>
          Cuando AUTOS GALERIA S.A.S. consulte o reporte información financiera, crediticia,
          comercial o de servicios sometida al régimen especial de habeas data financiero, actuará
          de conformidad con la Ley 1266 de 2008, la Ley 2157 de 2021 y las demás normas vigentes
          aplicables. La consulta o el reporte se limitarán a finalidades legítimas relacionadas con
          la relación comercial o crediticia y deberán contar con la habilitación legal o
          autorización exigible.
        </P>

        <P>
          La existencia de una autorización para consultar o reportar información no elimina los
          deberes legales de calidad, veracidad, actualización, circulación restringida, atención de
          reclamos ni la obligación de realizar la comunicación previa exigida antes de un reporte
          negativo cuando corresponda. AUTOS GALERIA S.A.S. conservará los soportes de la obligación
          y de las actuaciones necesarias para el reporte.
        </P>

        <P>
          Las verificaciones en listas vinculantes o restrictivas, fuentes públicas y herramientas
          de gestión de riesgo se realizarán únicamente cuando exista una finalidad legítima,
          proporcional y previamente informada, y sin utilizar información para fines
          discriminatorios o incompatibles con la relación contractual.
        </P>

        <Subseccion titulo="7.1. Debida diligencia, origen lícito de fondos y gestión de riesgos">
          <P>
            En operaciones que impliquen compraventa, pagos, financiación, trámites o servicios que
            por su naturaleza lo justifiquen, el usuario declara que los recursos, bienes y
            actividades relacionados con la operación tienen origen lícito. AUTOS GALERIA S.A.S.
            podrá solicitar información o soportes adicionales de identidad, representación,
            propiedad, procedencia del vehículo, origen de recursos u otros elementos razonables de
            conocimiento del usuario cuando existan señales objetivas de fraude, suplantación,
            inconsistencias documentales, requerimientos de autoridad o riesgos jurídicos o de
            seguridad.
          </P>

          <P>
            La intensidad de estas verificaciones será proporcional al riesgo y a las obligaciones
            legales que resulten exigibles a AUTOS GALERIA S.A.S. en cada momento. Mientras se
            completa una validación necesaria, la sociedad podrá pausar razonablemente la
            publicación, el servicio o la operación correspondiente, procurando informar al usuario
            cuando ello sea legal y técnicamente posible.
          </P>
        </Subseccion>
      </Seccion>

      <Seccion numero="8" titulo="Comunicaciones comerciales y canales de contacto">
        <P>
          El envío de publicidad, promociones o prospección comercial por llamadas, SMS, correo
          electrónico o aplicaciones de mensajería se realizará por los canales autorizados por el
          titular y dentro de las reglas legales aplicables. La autorización para recibir publicidad
          será opcional y no será condición para adquirir un vehículo o contratar un servicio, salvo
          comunicaciones estrictamente necesarias para ejecutar la relación contractual.
        </P>

        <P>
          El titular podrá solicitar la suspensión de comunicaciones comerciales a través de
          autos.galeria.med@gmail.com o mediante el mecanismo de suscripción que se habilite. Las
          gestiones de cobranza se efectuarán respetando los canales, horarios y periodicidad
          permitidos por la legislación vigente.
        </P>
      </Seccion>

      <Seccion numero="9" titulo="Obligaciones del vendedor tercero">
        <P>Todo vendedor tercero que solicite la publicación de un vehículo declara y se obliga a:</P>

        <Lista letras>
          <Li>
            Tener facultad legal para ofrecer y vender el vehículo o contar con autorización válida
            de su propietario.
          </Li>
          <Li>
            Suministrar información veraz, completa, actualizada y comprobable sobre marca,
            línea/modelo, año, versión, kilometraje, precio, ubicación, disponibilidad, estado
            general y demás características relevantes.
          </Li>
          <Li>
            Informar limitaciones al dominio, prendas, embargos, afectaciones, siniestros conocidos,
            reparaciones estructurales relevantes, defectos materiales conocidos u otras
            circunstancias que puedan influir en la decisión de compra, cuando corresponda.
          </Li>
          <Li>
            No publicar vehículos de procedencia ilícita, documentación adulterada, información
            falsa, fotografías engañosas o precios artificiosos destinados a inducir a error.
          </Li>
          <Li>
            Retirar o marcar como vendido el anuncio inmediatamente después de la venta o cuando el
            vehículo deje de estar disponible.
          </Li>
          <Li>
            Atender de buena fe las solicitudes de información y reclamaciones que le correspondan
            como vendedor.
          </Li>
        </Lista>

        <P>
          AUTOS GALERIA S.A.S. podrá solicitar documentos de identificación y soportes razonables de
          propiedad o facultad de venta, rechazar anuncios o retirarlos cuando identifique
          inconsistencias, riesgos de fraude o incumplimiento. La revisión documental de un anuncio
          no equivale a una certificación jurídica, técnica o mecánica del vehículo, salvo que se
          contrate expresamente un servicio de certificación con alcance definido.
        </P>

        <Subseccion titulo="9.1. Uso de datos de contacto entre usuarios">
          <P>
            Los datos de contacto que ConMovilidad haga visibles o facilite a un interesado para
            permitir la negociación de un vehículo deberán utilizarse exclusivamente para
            comunicaciones relacionadas con el anuncio, la compra, la venta, la verificación del
            vehículo o los servicios vinculados a dicha operación. No podrán emplearse para
            construir o comercializar bases de datos, enviar publicidad no solicitada, realizar
            campañas de prospección ajenas a la negociación, hostigar al titular ni para otras
            finalidades incompatibles con el propósito para el cual fueron facilitados. Cada usuario
            será responsable del tratamiento que realice de los datos personales que obtenga por
            fuera de la administración directa de AUTOS GALERIA S.A.S., conforme a la legislación
            que le resulte aplicable.
          </P>
        </Subseccion>
      </Seccion>

      <Seccion numero="10" titulo="Información de los vehículos y deber de verificación del comprador">
        <P>
          Cada anuncio procurará identificar de forma clara al vendedor y describir el vehículo con
          información suficiente para que el interesado pueda adoptar una decisión informada. El
          comprador debe verificar la información relevante antes de pagar o firmar, especialmente
          identidad del vendedor, propiedad y limitaciones, antecedentes disponibles, estado técnico
          y mecánico, kilometraje, documentación y condiciones del traspaso.
        </P>

        <P>
          Se recomienda realizar peritaje técnico y mecánico y, cuando resulte adecuado, contar con
          apoyo experto para el estudio documental, tránsito y traspaso. Esta recomendación no
          reduce las obligaciones de información, calidad, idoneidad o garantía que legalmente
          correspondan al vendedor.
        </P>
      </Seccion>

      <Seccion numero="11" titulo="Publicaciones individuales, tarifa y vigencia">
        <P>
          La tarifa ordinaria inicialmente prevista para una publicación individual es de ochenta
          mil pesos colombianos ($80.000 COP) por vehículo, pagaderos antes de la publicación a
          través del medio de pago habilitado. La Plataforma podrá modificar esta tarifa para
          futuras contrataciones y ofrecer promociones; el precio informado antes de concluir cada
          contratación será el aplicable.
        </P>

        <P>
          Las promociones de lanzamiento, incluyendo periodos de publicación sin costo para
          asociados, tendrán la vigencia y condiciones informadas en la oferta correspondiente. Si
          se anuncia un periodo promocional de noventa (90) días, su inicio, terminación,
          beneficiarios y condiciones deberán quedar visibles en la Plataforma.
        </P>

        <P>
          Una vez aprobado y publicado el anuncio, la tarifa remunera el servicio de publicación y
          podrá ser no reembolsable en la medida permitida por la ley. Esta regla no afecta derechos
          legales de retracto cuando procedan, reversión del pago, devoluciones por cobro indebido,
          incumplimiento atribuible a AUTOS GALERIA S.A.S. u otras restituciones obligatorias.
        </P>

        <P>
          La publicación podrá mantenerse activa mientras el vehículo continúe disponible. Si
          transcurren más de noventa (90) días sin actividad o actualización, la Plataforma podrá
          solicitar confirmación de disponibilidad y, ante falta de respuesta, pausar el anuncio. El
          vendedor sigue obligado a retirarlo inmediatamente cuando el vehículo se venda o deje de
          estar disponible.
        </P>

        <Subseccion titulo="11.1. Promociones, bonos, descuentos y campañas especiales">
          <P>
            Las promociones, campañas de lanzamiento, bonos, descuentos, beneficios por convenio,
            concursos o actividades comerciales especiales podrán sujetarse a términos y condiciones
            particulares. Antes de participar o contratar, se informarán de forma clara su vigencia,
            beneficiarios, requisitos, disponibilidad, restricciones, acumulabilidad, mecanismo para
            acceder al beneficio y demás condiciones relevantes. Para el asunto específico de la
            campaña, sus condiciones particulares prevalecerán sobre estos Términos, sin que puedan
            desconocer derechos irrenunciables del consumidor ni obligaciones legales aplicables.
          </P>
        </Subseccion>
      </Seccion>

      <Seccion numero="12" titulo="Paquetes corporativos, facturación y mora">
        <P>
          Concesionarios, empresas y aliados podrán contratar paquetes de publicaciones con precios
          por unidad, cupos, vigencia y condiciones definidos en la orden de servicio, contrato o
          propuesta comercial. Una publicación consumirá un cupo cuando sea efectivamente aprobada y
          publicada, salvo regla comercial distinta informada antes de contratar.
        </P>

        <P>
          Cuando los paquetes se facturen mensualmente por mes anticipado, la factura indicará su
          fecha de vencimiento. Si las partes pactan un plazo de cinco (5) días calendario desde la
          emisión y un periodo adicional de gracia, estos términos deberán constar en el acuerdo
          comercial. Durante la mora podrán causarse intereses a la tasa pactada, sin exceder los
          máximos legales aplicables.
        </P>

        <P>
          Ante mora vencida y conforme al contrato aplicable, AUTOS GALERIA S.A.S. podrá suspender
          la visibilidad de publicaciones y la posibilidad de consumir nuevos cupos hasta la
          normalización del saldo. La suspensión por mora no autoriza cobros no pactados ni limita
          los derechos que resulten aplicables al cliente.
        </P>
      </Seccion>

      <Seccion
        numero="13"
        titulo="Prohibición de reutilizar o «reciclar» anuncios, cesión y reventa de servicios"
      >
        <P>
          Cada publicación se vincula a un vehículo específico. Una vez aprobado el anuncio, no
          podrá utilizarse para sustituir el vehículo por otro diferente mediante el cambio de
          marca, línea/modelo, placa, VIN/chasis u otros identificadores esenciales. La corrección
          de errores tipográficos o actualizaciones legítimas podrá solicitarse al administrador.
        </P>

        <P>
          El intento de reutilizar una publicación para evitar el pago de un nuevo cupo podrá dar
          lugar al retiro del anuncio, pérdida del cupo utilizado y suspensión de la cuenta, de
          acuerdo con la gravedad, reincidencia y condiciones del servicio, sin perjuicio del
          derecho del usuario a controvertir la medida.
        </P>

        <P>
          Las cuentas, cupos, publicaciones, planes, beneficios o servicios contratados en
          ConMovilidad no podrán cederse, revenderse, sublicenciarse ni explotarse comercialmente
          por terceros, salvo que el plan, contrato u oferta aplicable lo permita o exista
          autorización expresa de AUTOS GALERIA S.A.S. Esta regla no impide la administración
          autorizada de cuentas corporativas por usuarios designados por la empresa contratante.
        </P>

        <P>
          También se prohíbe copiar, reproducir o extraer sistemáticamente anuncios, bases de
          precios, fotografías, datos o contenidos de la Plataforma con el propósito de crear
          directorios, bases comerciales, servicios competidores o productos derivados no
          autorizados, sin perjuicio de los usos permitidos por la ley.
        </P>
      </Seccion>

      <Seccion numero="14" titulo="Pagos electrónicos y pasarelas de pago">
        <P>
          Los pagos podrán procesarse mediante proveedores externos habilitados. Antes de concluir
          la operación se informarán los medios de pago disponibles. AUTOS GALERIA S.A.S. tratará la
          información transaccional que reciba legítimamente y no deberá almacenar códigos de
          seguridad de tarjetas ni otros datos que el proveedor de pagos no le habilite legalmente
          para conservar.
        </P>

        <P>
          La intervención de una pasarela de pagos no elimina las obligaciones que correspondan a
          AUTOS GALERIA S.A.S. respecto de la operación contratada ni la atención de solicitudes de
          reversión cuando legalmente procedan.
        </P>

        <P>
          AUTOS GALERIA S.A.S. adoptará, dentro del ámbito bajo su control, mecanismos de seguridad
          apropiados y confiables para proteger la información personal del consumidor y la
          transacción electrónica, de conformidad con la normativa aplicable. El usuario deberá
          utilizar únicamente los medios de pago y enlaces informados por la Plataforma o por el
          proveedor autorizado, verificar el destinatario antes de efectuar pagos y abstenerse de
          compartir contraseñas, códigos de verificación o credenciales de seguridad. Ninguna de
          estas obligaciones del usuario elimina las responsabilidades legales que correspondan a
          AUTOS GALERIA S.A.S. o a los demás participantes del sistema de pago.
        </P>
      </Seccion>

      <Seccion numero="15" titulo="Formación de contratos de compraventa directa">
        <P>
          La publicación de un vehículo propio constituye información comercial y no necesariamente
          una aceptación automática de una oferta de compra. Antes de perfeccionar la compraventa se
          verificarán disponibilidad, identidad, precio, forma de pago, documentación, condiciones
          de entrega y demás requisitos aplicables. El contrato, orden de compra o documento
          equivalente indicará las condiciones particulares del negocio.
        </P>

        <P>
          En ventas celebradas íntegramente por medios electrónicos, la Plataforma mostrará al
          consumidor la información exigida por la normativa de comercio electrónico antes de
          concluir la transacción y conservará soporte de la operación en condiciones que permitan
          su consulta posterior.
        </P>
      </Seccion>

      <Seccion numero="16" titulo="Garantía de vehículos vendidos por AUTOS GALERIA S.A.S.">
        <Subseccion titulo="16.1. Vehículos nuevos">
          <P>
            Cuando AUTOS GALERIA S.A.S. venda un vehículo nuevo, se aplicará la garantía legal y las
            garantías suplementarias válidamente ofrecidas. La garantía cubrirá calidad, idoneidad y
            seguridad en los términos previstos por la ley y por las condiciones informadas al
            consumidor.
          </P>
        </Subseccion>

        <Subseccion titulo="16.2. Vehículos usados">
          <P>
            Los vehículos usados serán identificados como tales. Cuando haya expirado la garantía
            legal anterior, la venta sin garantía solo podrá utilizarse cuando la ley lo permita y
            esa condición haya sido informada de forma clara y aceptada expresamente por escrito o
            por un mensaje de datos conservable. Si no existe una aceptación válida, se aplicará el
            término de garantía legal que corresponda.
          </P>
        </Subseccion>

        <Subseccion titulo="16.3. Información de defectos">
          <P>
            Los defectos, deterioros o condiciones particulares conocidas que puedan influir
            materialmente en la decisión del comprador deberán informarse de manera específica. Una
            expresión genérica como «se recibe en el estado en que se encuentra» no se utilizará
            para ocultar información relevante ni para eliminar derechos irrenunciables.
          </P>
        </Subseccion>

        <Subseccion titulo="16.4. Vehículos de terceros">
          <P>
            Cuando el vendedor identificado sea un tercero, las obligaciones de garantía del
            vehículo corresponderán a quienes tengan legalmente la calidad de productor o proveedor.
            ConMovilidad atenderá las obligaciones que le correspondan por su propio servicio y
            facilitará la identificación y contacto del vendedor en los términos legalmente
            procedentes.
          </P>
        </Subseccion>
      </Seccion>

      <Seccion numero="17" titulo="Retracto, reversión del pago y devoluciones">
        <P>
          El derecho de retracto se reconocerá únicamente cuando la operación se encuentre dentro de
          los supuestos previstos por la ley y no opere una excepción. Cuando proceda, el consumidor
          podrá ejercerlo dentro del término legal contado desde la entrega del bien o la
          celebración del contrato de servicios, según corresponda, utilizando el canal que AUTOS
          GALERIA S.A.S. publique para tal efecto.
        </P>

        <P>
          Cuando una compra de bienes o servicios sea realizada mediante comercio electrónico y pago
          electrónico, el consumidor podrá solicitar la reversión del pago en los eventos y dentro
          de los términos previstos por la normativa aplicable. AUTOS GALERIA S.A.S. suministrará el
          procedimiento y canal para la solicitud y atenderá las actuaciones que le correspondan
          frente a los participantes del sistema de pago.
        </P>

        <P>
          Ninguna estipulación de «no reembolso» se interpretará como renuncia a devoluciones
          ordenadas por la ley, por una autoridad competente o derivadas de incumplimiento, cobro
          indebido o acuerdo válido entre las partes.
        </P>
      </Seccion>

      <Seccion numero="18" titulo="Entrega, documentación y traspaso">
        <P>
          En las ventas directas se informarán el lugar y plazo de entrega, documentos requeridos,
          costos asociados al traspaso y la parte que asumirá cada concepto. Las obligaciones sobre
          impuestos, multas, retenciones, SOAT, revisión técnico-mecánica, matrícula, levantamiento
          de limitaciones y otros trámites se distribuirán conforme a la ley y al contrato
          particular.
        </P>

        <P>
          En compraventas entre terceros, comprador y vendedor serán responsables de acordar y
          ejecutar el pago, entrega y traspaso. ConMovilidad no recibe ni custodia recursos por
          cuenta de terceros ni actúa como mandatario o comisionista por el solo hecho de publicar
          el anuncio, salvo que exista un servicio distinto contratado expresamente.
        </P>
      </Seccion>

      <Seccion numero="19" titulo="Financiación, seguros y servicios de terceros">
        <P>
          Las simulaciones de financiación o referencias a productos financieros tienen carácter
          informativo hasta que la entidad financiera o financiador correspondiente realice su
          propio estudio y aprobación. La decisión crediticia corresponde al tercero que otorgue el
          crédito.
        </P>

        <P>
          Cuando para tramitar una solicitud de financiación sea necesario compartir datos con una
          entidad financiera, el titular será informado sobre el tercero receptor y se obtendrán las
          autorizaciones que correspondan antes de la transmisión o transferencia de la información.
        </P>

        <Subseccion titulo="19.1. Enlaces, plataformas y servicios de terceros">
          <P>
            ConMovilidad podrá incluir enlaces, integraciones o mecanismos de redirección hacia
            entidades financieras, aseguradoras, pasarelas de pago, peritos, organismos o gestores
            de trámites y otros prestadores independientes. Al acceder a un servicio externo, el
            usuario deberá revisar los términos, condiciones, políticas de privacidad, tarifas y
            reglas del tercero correspondiente, pues dicho tercero podrá actuar bajo su propia
            responsabilidad y control.
          </P>

          <P>
            La inclusión de un enlace, referencia o integración no constituye por sí sola una
            garantía, representación, mandato o asunción general de responsabilidad por el servicio
            del tercero. Esta regla no excluye las obligaciones que legalmente correspondan a AUTOS
            GALERIA S.A.S. por su propia conducta, por la información o publicidad que suministre,
            por la selección o integración del tercero cuando la ley le atribuya deberes, o por
            compromisos expresamente asumidos.
          </P>
        </Subseccion>
      </Seccion>

      <Seccion numero="20" titulo="Peticiones, quejas, reclamos y atención al consumidor">
        <P>
          AUTOS GALERIA S.A.S. habilitará en el mismo medio electrónico un mecanismo de PQR de fácil
          acceso que permita al usuario presentar solicitudes, resolver dudas y conservar evidencia
          de su radicación. El sistema deberá generar un número de registro o radicado con fecha y
          hora, y habilitar un mecanismo para consultar o recibir información sobre el seguimiento
          de la solicitud. Mientras se implementa o complementa el formulario web, las
          comunicaciones podrán enviarse adicionalmente a autos.galeria.med@gmail.com, sin perjuicio
          de las funcionalidades que exija la normativa aplicable al comercio electrónico.
        </P>

        <P>
          Las reclamaciones deberán identificar, en lo posible, al solicitante, el vehículo o
          servicio, los hechos, la pretensión y los datos de contacto. AUTOS GALERIA S.A.S.
          responderá dentro de los términos legales aplicables a la naturaleza de la solicitud. Las
          consultas y reclamos de datos personales seguirán el procedimiento previsto en la Política
          de Tratamiento de Datos Personales y en el régimen especial de habeas data cuando
          corresponda.
        </P>

        <P>
          Cuando la naturaleza de la solicitud lo requiera, el usuario podrá aportar documentos,
          fotografías, comprobantes, contratos u otros soportes pertinentes. La Plataforma podrá
          organizar el canal por categorías, tales como atención al consumidor, garantías, pagos o
          reversión, publicaciones, seguridad de cuenta y protección de datos personales. La
          clasificación interna no modificará los términos legales aplicables ni limitará el derecho
          del usuario a presentar su reclamación por el canal habilitado.
        </P>
      </Seccion>

      <Seccion numero="21" titulo="Propiedad intelectual, contenidos de usuarios y moderación">
        <P>
          Las marcas, diseños, software, bases de datos, textos propios y demás contenidos de
          ConMovilidad están protegidos por las normas aplicables. El vendedor conserva los derechos
          que tenga sobre fotografías y contenidos que suministre y otorga a AUTOS GALERIA S.A.S.,
          durante el tiempo necesario para prestar el servicio, una licencia no exclusiva para
          alojarlos, adaptarlos técnicamente, reproducirlos y mostrarlos en la Plataforma y en
          canales utilizados para promocionar el anuncio.
        </P>

        <P>
          El usuario declara que cuenta con derechos o autorizaciones suficientes sobre el material
          que publique y que su uso no vulnera derechos de terceros. AUTOS GALERIA S.A.S. podrá
          retirar material ante una reclamación razonablemente sustentada o una orden de autoridad.
        </P>

        <Subseccion titulo="21.1. Contenido prohibido y moderación">
          <P>
            No podrá publicarse o transmitirse a través de ConMovilidad contenido que sea ilícito,
            fraudulento o materialmente engañoso; que infrinja derechos de propiedad intelectual,
            imagen, intimidad o datos personales de terceros; que incluya información personal
            innecesaria o no autorizada; que contenga malware o enlaces maliciosos; que promueva
            actividades ilícitas; o que utilice la publicación del vehículo como medio para
            publicidad ajena, captación fraudulenta de usuarios o elusión de controles de la
            Plataforma.
          </P>

          <P>
            AUTOS GALERIA S.A.S. podrá rechazar, ocultar, solicitar la corrección o retirar
            contenido cuando existan razones objetivas para considerar que infringe estos Términos,
            la ley, derechos de terceros o reglas de seguridad. Cuando la naturaleza del riesgo lo
            permita, se informará al usuario la razón de la medida y el mecanismo disponible para
            solicitar revisión. El retiro o moderación de un contenido no convierte a AUTOS GALERIA
            S.A.S. en garante general de la información publicada por terceros ni elimina las
            responsabilidades que la ley le asigne por su propia actuación.
          </P>
        </Subseccion>
      </Seccion>

      <Seccion numero="22" titulo="Disponibilidad y mantenimiento de la Plataforma">
        <P>
          AUTOS GALERIA S.A.S. procurará la continuidad y seguridad razonable de ConMovilidad, pero
          podrá realizar mantenimientos, actualizaciones o suspensiones temporales. No se garantiza
          disponibilidad ininterrumpida frente a eventos de fuerza mayor, fallas de
          telecomunicaciones, ataques informáticos u otras causas fuera del control razonable de la
          sociedad, sin perjuicio de las obligaciones legales de seguridad y atención de incidentes.
        </P>
      </Seccion>

      <Seccion numero="23" titulo="Límites de responsabilidad">
        <P>
          Cuando ConMovilidad actúe exclusivamente como portal de contacto para un vehículo de
          tercero, AUTOS GALERIA S.A.S. no se convierte por ese solo hecho en propietario, poseedor,
          vendedor, mandatario, comisionista ni garante del vehículo. No responderá por acuerdos
          privados celebrados exclusivamente entre comprador y vendedor tercero, salvo que una norma
          imperativa o su propia conducta le atribuyan responsabilidad.
        </P>

        <P>
          Ninguna cláusula de estos Términos excluye o limita responsabilidad por obligaciones que
          legalmente sean irrenunciables, incluyendo aquellas relacionadas con información,
          publicidad, protección de datos, seguridad, garantía o derechos del consumidor cuando
          AUTOS GALERIA S.A.S. tenga la calidad jurídica correspondiente.
        </P>
      </Seccion>

      <Seccion numero="24" titulo="Suspensión y terminación de cuentas">
        <P>
          La Plataforma podrá advertir, pausar o terminar cuentas ante incumplimientos graves o
          reiterados, fraude, suplantación, publicación de vehículos ilícitos, manipulación de
          anuncios, mora contractual cuando proceda o riesgos de seguridad. La medida deberá ser
          proporcional a la conducta y no afectará derechos adquiridos ni obligaciones pendientes.
          Cuando sea posible, se informará al usuario la razón y el mecanismo para solicitar
          revisión.
        </P>
      </Seccion>

      <Seccion numero="25" titulo="Modificaciones de los Términos">
        <P>
          AUTOS GALERIA S.A.S. podrá actualizar estos Términos por cambios normativos, tecnológicos,
          comerciales u operativos. La versión vigente y su fecha de actualización estarán
          disponibles en la Plataforma. Las modificaciones materiales aplicarán hacia el futuro y no
          alterarán retroactivamente las condiciones esenciales de operaciones ya celebradas, salvo
          mandato legal o acuerdo válido de las partes.
        </P>
      </Seccion>

      <Seccion numero="26" titulo="Ley aplicable y autoridades competentes">
        <P>
          Estos Términos se rigen por las leyes de la República de Colombia. Las controversias serán
          conocidas por las autoridades administrativas o judiciales competentes conforme a las
          reglas legales aplicables. Ninguna cláusula se interpretará como renuncia del consumidor o
          del titular de datos a acudir a la Superintendencia de Industria y Comercio, a otra
          autoridad competente o al juez correspondiente cuando la ley le reconozca ese derecho.
        </P>
      </Seccion>

      <Seccion numero="27" titulo="Integridad documental, prevalencia y divisibilidad">
        <P>
          Estos Términos deben leerse conjuntamente con la{' '}
          <a href="/habeas-data" className="text-cta hover:underline">
            Política y Autorización de Tratamiento de Datos Personales
          </a>
          , el Aviso de Privacidad, la Política de Cookies, la Política de Garantías y Atención al
          Consumidor, y las condiciones particulares de cada servicio o transacción. En materia de
          protección de datos prevalecerán las normas imperativas y la política o autorización
          específica aplicable a la finalidad concreta.
        </P>

        <P>
          Si una disposición de estos Términos fuera declarada nula, ineficaz, inválida o
          inaplicable por una autoridad competente, dicha circunstancia afectará únicamente la
          disposición o parte de ella que resulte comprometida y no invalidará las demás
          estipulaciones, que continuarán produciendo efectos en la medida permitida por la ley. La
          disposición afectada deberá interpretarse o ajustarse, cuando sea posible, de forma
          compatible con su finalidad legítima y con las normas imperativas y derechos
          irrenunciables aplicables.
        </P>
      </Seccion>
    </PaginaLegal>
  )
}
