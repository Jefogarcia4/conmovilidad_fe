import { Destacado, Li, Lista, NotaAlPie, P, PaginaLegal, Seccion } from './PaginaLegal'

/**
 * Autorización para el Tratamiento de Datos Personales.
 *
 * Transcripción del documento vigente de AUTOS GALERIA S.A.S. El original es un formato para
 * firmar en papel; aquí se omite únicamente el recuadro de firma, huella y cédula, y en su lugar
 * se explica cómo se otorga la autorización por medios electrónicos. El texto de lo que se
 * autoriza no se toca.
 */
const VERSION = '01'
const ACTUALIZACION = '17 de marzo de 2026'

export function HabeasDataPage() {
  return (
    <PaginaLegal
      titulo="Autorización para el Tratamiento de Datos Personales"
      version={VERSION}
      actualizacion={ACTUALIZACION}
    >
      <Destacado titulo="Cómo se otorga esta autorización en ConMovilidad">
        <P>
          El documento original está previsto para firmarse en papel. En la Plataforma la
          autorización se otorga por medios electrónicos: al marcar la casilla de aceptación en el
          ingreso o en la activación de la cuenta. ConMovilidad deja constancia de la fecha y hora
          en que cada usuario la otorgó por primera vez.
        </P>
      </Destacado>

      <Seccion titulo="Información que se le entrega al titular">
        <P>
          Manifiesto que he sido informado por AUTOS GALERIA S.A.S., identificada con NIT
          902.041.528-4, que:
        </P>

        <Lista>
          <Li>
            La compañía actuará como responsable del tratamiento de datos personales de los cuales
            soy titular y que, conjunta o separadamente, podrán recolectar, usar y tratar mis datos
            personales en cumplimiento de las normas contenidas en la Ley 1581 de 2012 y su Decreto
            reglamentario 1377 de 2013 y conforme a las políticas de tratamiento de datos personales
            que Autos Galeria S.A.S. tiene a su disposición.
          </Li>
          <Li>
            La respuesta a preguntas sobre datos sensibles<sup>1</sup> o sobre menores de edad
            <sup>2</sup> es de carácter facultativa, y no está obligada a proporcionar dicha
            información si no lo desea.
          </Li>
          <Li>
            Mis derechos como titular de los datos son los previstos en la Constitución y la Ley,
            especialmente el derecho a conocer, actualizar, rectificar y suprimir mi información
            personal, así como el derecho a revocar el consentimiento otorgado para el tratamiento
            de datos personales.
          </Li>
          <Li>
            Los titulares de los datos podrán ejercer sus derechos a través de los canales gratuitos
            dispuestos por Autos Galeria S.A.S., conforme a las políticas de tratamiento de datos
            personales emitidas por esta.
          </Li>
          <Li>
            La Compañía garantiza la confidencialidad, libertad, seguridad, veracidad,
            transparencia, acceso y circulación restringida de mis datos y se reserva el derecho de
            modificar su política de tratamiento de datos personales en cualquier momento.
          </Li>
        </Lista>
      </Seccion>

      <Seccion titulo="Consentimiento que se otorga">
        <P>
          Igualmente, doy consentimiento expreso, inequívoco e irrevocable a Autos Galeria S.A.S. o
          a quien este determine, para que en mi nombre o de la sociedad a la que represento:
        </P>

        <Lista letras>
          <Li>
            Consultar en cualquier momento, en centrales de riesgos o bases de datos públicas o
            privadas, toda la información relevante sobre el desempeño como deudor, capacidad de
            pago y viabilidad para mantener o establecer una relación contractual.
          </Li>
          <Li>
            Realizar consultas en listas vinculantes, restrictivas, fuentes públicas, antecedentes
            judiciales, investigaciones y procesos judiciales relacionados con la Gestión de Riesgo
            de Lavado de Activos, Financiación del Terrorismo, y otros riesgos relacionados con las
            relaciones comerciales y contractuales establecidas.
          </Li>
          <Li>
            Reportar, a cualquier central de riesgos manejada por un operador de datos, información
            sobre el cumplimiento o incumplimiento de obligaciones crediticias, deberes
            patrimoniales, datos de ubicación, contacto, solicitudes de crédito, así como otra
            información atinente a la relación comercial, financiera y en general socioeconómica que
            haya generado o que consten en registros públicos, base de datos o documentos públicos.
          </Li>
        </Lista>

        <P>
          La autorización anterior no impedirá al firmante o su representada ejercer el derecho de
          corroborar en cualquier tiempo, en la central de información de riesgos a la cual se hayan
          suministrado los datos, que la información suministrada es veraz, completa, exacta y
          actualizada, y en caso de que no lo sea, a que se deje constancia de su desacuerdo, a
          exigir la rectificación y a ser informado sobre las correcciones futuras.
        </P>
      </Seccion>

      <Seccion titulo="Cómo ejercer tus derechos">
        <P>
          Para conocer, actualizar, rectificar o suprimir tus datos, solicitar prueba de esta
          autorización, presentar consultas o reclamos, o revocarla cuando sea jurídicamente
          procedente, puedes escribir a{' '}
          <a href="mailto:autos.galeria.med@gmail.com" className="text-cta hover:underline">
            autos.galeria.med@gmail.com
          </a>{' '}
          o radicar tu solicitud en el{' '}
          <a href="/contacto" className="text-cta hover:underline">
            canal de PQR de la Plataforma
          </a>
          , donde queda con número de radicado, fecha y hora.
        </P>
      </Seccion>

      <section className="border-t border-border pt-6">
        <NotaAlPie numero={1}>
          Ley 1581 de 2012, artículo 5. Datos Sensibles. Para los propósitos de la presente ley, se
          entiende por datos sensibles aquellos que afectan la intimidad del titular o cuyo uso
          indebido puede generar su discriminación, tales como aquellos que revelen el origen racial
          o étnico, la orientación política, las convicciones religiosas o filosóficas, la
          pertenencia a sindicatos, organizaciones sociales, de derechos humanos o que promueva
          intereses de cualquier partido político o que garanticen los derechos y garantías de
          partidos políticos de oposición, así como los datos relativos a la salud, a la vida sexual
          y los datos biométricos.
        </NotaAlPie>

        <div className="mt-3">
          <NotaAlPie numero={2}>
            Ley 1098 de 2006, artículo 3. Sujetos titulares de derechos del Código de la Infancia y
            la Adolescencia. Para todos los efectos de esta ley son sujetos titulares de derechos
            todas las personas menores de 18 años. Sin perjuicio de lo establecido en el artículo 34
            del Código Civil, se entiende por niño o niña las personas entre los 0 y los 12 años, y
            por adolescente las personas entre 12 y 18 años.
          </NotaAlPie>
        </div>
      </section>
    </PaginaLegal>
  )
}
