// Archivo autogenerado a partir de los documentos Markdown
import React from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownComponents = {
  h1: ({node, ...props}: any) => <h1 className="text-2xl font-bold text-[#e2e2e2] mb-6 mt-8" {...props} />,
  h2: ({node, ...props}: any) => <h2 className="text-xl font-semibold text-[#d2bbff] mb-4 mt-6 border-b border-[#4a4455] pb-2" {...props} />,
  h3: ({node, ...props}: any) => <h3 className="text-lg font-medium text-[#e2e2e2] mb-3 mt-5" {...props} />,
  p: ({node, ...props}: any) => <p className="mb-4 text-[14px] leading-relaxed text-[#ccc3d8]" {...props} />,
  ul: ({node, ...props}: any) => <ul className="list-disc pl-6 mb-4 space-y-2 text-[14px] text-[#ccc3d8]" {...props} />,
  ol: ({node, ...props}: any) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-[14px] text-[#ccc3d8]" {...props} />,
  li: ({node, ...props}: any) => <li className="" {...props} />,
  a: ({node, ...props}: any) => <a className="text-[#7c3aed] hover:underline" {...props} />,
  strong: ({node, ...props}: any) => <strong className="font-semibold text-[#e2e2e2]" {...props} />,
  blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-[#7c3aed] pl-4 italic my-4 text-[#958da1]" {...props} />,
};

export const TermsAndConditions = () => (
  <div className="w-full">
    <ReactMarkdown components={MarkdownComponents}>
      {`
# Términos y Condiciones de Uso — BackRoom

**Última actualización:** [FECHA]
**Versión:** 2.0

> **Nota de alcance:** este documento corresponde a un proyecto académico (SENA — Tecnología en Análisis y Desarrollo de Software) y se elabora como plantilla de referencia. **No sustituye asesoría legal profesional.** Antes de un lanzamiento con usuarios reales, pagos reales o datos personales reales fuera del entorno de pruebas, estos Términos y la Política de Tratamiento de Datos Personales deben ser revisados y aprobados por un abogado con conocimiento del régimen de protección de datos y del consumidor colombiano.

---

## 1. Identificación del prestador del servicio

| Campo | Valor |
|---|---|
| Nombre del proyecto/plataforma | BackRoom |
| Naturaleza | Proyecto académico — Tecnología en Análisis y Desarrollo de Software (ADSO), SENA |
| Responsables del proyecto | [NOMBRE COMPLETO INTEGRANTE 1], [NOMBRE COMPLETO INTEGRANTE 2] |
| Correo de contacto | [CORREO DE CONTACTO] |
| Domicilio / jurisdicción | República de Colombia |

## 2. Objeto y ámbito de aplicación

Los presentes Términos y Condiciones ("los Términos") regulan el acceso y uso de la plataforma BackRoom ("la Plataforma"), un servicio web de espacios colaborativos de estudio y trabajo académico, organización de recursos, gestión de salas, permisos y registro de auditoría entre usuarios.

Estos Términos aplican a toda persona natural o jurídica que se registre, acceda o use la Plataforma ("el Usuario"), en cualquiera de sus modalidades: versión de demostración ("Demo") o, en el futuro, planes de pago. Forman parte integral de los Términos la Política de Tratamiento de Datos Personales y demás políticas que la Plataforma publique.

## 3. Aceptación de los Términos

El acceso y uso de la Plataforma implica la aceptación plena y sin reservas de estos Términos y de la Política de Tratamiento de Datos Personales. Si el Usuario no está de acuerdo con alguna de sus disposiciones, debe abstenerse de registrarse y de usar la Plataforma.

La aceptación se registra de forma explícita y activa durante el proceso de registro, mediante una casilla de verificación que el Usuario debe marcar voluntariamente. **No se presume aceptación por defecto.** El uso continuado de la Plataforma después de publicarse modificaciones a estos Términos constituye aceptación de las mismas (art. 12, Decreto 1377 de 2013, aplicable por remisión).

## 4. Definiciones

| Término | Definición |
|---|---|
| **BackRoom** | Espacio colaborativo creado por un Usuario, que agrupa salas y recursos con permisos de acceso configurables. |
| **Organización** | Entidad creada por un Usuario (Propietario) que agrupa BackRooms, miembros e invitaciones. |
| **Sala** | Nodo jerárquico dentro de un BackRoom en el que se organizan recursos. |
| **Recurso** | Documento, presentación, audio, video o enlace externo almacenado o referenciado en una Sala. |
| **Modo Demo** | Versión de prueba gratuita con límites funcionales definidos en la sección 9. |
| **Contenido del Usuario** | Todo contenido que el Usuario suba, publique o genere en la Plataforma. |
| **Cuenta Demo / Planes** | Modalidades de uso vigentes o futuras de la Plataforma. |

## 5. Registro y requisitos de la cuenta

1. El Usuario debe proporcionar información **veraz, completa y actualizada** al momento del registro.
2. El registro y el uso de la Plataforma están restringidos a personas que acrediten la mayoría de edad (18 años) o, en el caso de menores de edad, que cuenten con la autorización previa, expresa e informada de sus padres o representantes legales, conforme al artículo 7 de la Ley 1581 de 2012 y a la normativa que lo reglamente.
3. La cuenta es personal e intransferible. El Usuario es responsable de mantener la confidencialidad de sus credenciales y de **todas las actividades** realizadas con su cuenta.
4. El Usuario debe notificar de inmediato cualquier uso no autorizado de su cuenta a [CORREO DE CONTACTO].
5. Está prohibido crear cuentas falsas, suplantar a otra persona o crear cuentas en nombre de terceros sin autorización.

## 6. Licencia de uso y conducta permitida

La Plataforma otorga al Usuario una licencia **limitada, no exclusiva, intransferible y revocable** de acceso y uso, exclusivamente para fines académicos, educativos y personales, de conformidad con estos Términos y con la ley colombiana.

Se prohíbe expresamente al Usuario:

1. Utilizar la Plataforma para actividades ilícitas o contrarias a la ley, la moral, el orden público o los derechos de terceros.
2. Subir, almacenar o difundir contenido que viole la propiedad intelectual de terceros, que sea difamatorio, fraudulento, discriminatorio, amenazante, violento o que vulnere la protección de datos personales de terceros.
3. Subir software malicioso, virus, gusanos, troyanos o cualquier código dañino (art. 269A y siguientes del Código Penal colombiano — Ley 1273 de 2009).
4. Intentar acceder, vulnerar o interferir con la seguridad, los sistemas, los datos o las cuentas de otros usuarios.
5. Realizar extracción automatizada de datos ("scraping"), minería de datos o ingeniería inversa sobre la Plataforma.
6. Suplantar la identidad de otra persona, entidad o del propio proyecto BackRoom.
7. Comercializar, revender o explotar económicamente la Plataforma o su contenido sin autorización previa y escrita.

## 7. Propiedad intelectual

1. **De la Plataforma:** todo el código fuente, diseño, interfaces, marcas, logotipos, textos y demás elementos que componen BackRoom son titularidad de sus desarrolladores o de sus licenciantes. Queda prohibida su reproducción, modificación o uso no autorizado.
2. **Del Contenido del Usuario:** el Usuario conserva la titularidad de su Contenido. Al usarlo en la Plataforma, otorga a BackRoom una licencia limitada y revocable para almacenarlo, procesarlo y mostrarlo con la única finalidad de prestar el servicio.
3. BackRoom podrá eliminar o bloquear cualquier Contenido del Usuario que, a su criterio razonable, infrinja estos Términos, la ley o derechos de terceros.

## 8. Protección de datos personales

El tratamiento de datos personales de los Usuarios se rige por la **Ley 1581 de 2012**, sus decretos reglamentarios (Decreto 1377 de 2013, Decreto 1074 de 2015, Decreto 2555 de 2022) y por la **Política de Tratamiento de Datos Personales** de la Plataforma, que hace parte integral de estos Términos. Al registrarse, el Usuario autoriza el tratamiento de sus datos conforme a dicha política.

## 9. Modo Demo y límites

1. El Modo Demo es gratuito y tiene límites funcionales (a la fecha: 100 MB de almacenamiento, 4 miembros, 3 niveles de profundidad de salas y 10 recursos por sala). Estos límites pueden cambiar en cualquier momento.
2. Al crear una Organización, los límites del Modo Demo dejan de aplicar, sujeto a las condiciones del plan aplicable.
3. La superación de un límite puede impedir realizar determinadas acciones dentro de la Plataforma.

## 10. Disponibilidad y suspensión del servicio

1. La Plataforma se presta "tal cual" y "según disponibilidad", sin garantía de disponibilidad continua o ininterrumpida, salvo las obligaciones legales imperativas aplicables.
2. BackRoom podrá suspender temporal o definitivamente el acceso de un Usuario que incumpla estos Términos, la ley o que ponga en riesgo la seguridad o integridad de la Plataforma o de otros usuarios, sin perjuicio de las acciones legales a que haya lugar.
3. BackRoom no será responsable por interrupciones atribuibles a proveedores de infraestructura (hosting, nube, conectividad), mantenimientos programados, caso fortuito o fuerza mayor.

## 11. Limitación de responsabilidad

1. En la máxima medida permitida por la ley colombiana, BackRoom y sus desarrolladores no serán responsables por daños indirectos, incidentales, especiales o consecuenciales derivados del uso o la imposibilidad de uso de la Plataforma.
2. La responsabilidad por el Contenido del Usuario corresponde exclusivamente al Usuario que lo publique.
3. La Plataforma no se hace responsable por el contenido de sitios externos a los que se acceda mediante enlaces publicados por los Usuarios.
4. Nada en estos Términos excluye o limita responsabilidades que la ley colombiana no permita excluir o limitar (por ejemplo, las derivadas de la Ley 1480 de 2011 cuando resulten aplicables a la relación de consumo).

## 12. Enlaces y contenido de terceros

La Plataforma puede contener enlaces a sitios o servicios de terceros. Estos enlaces se ofrecen únicamente por conveniencia y no implican aprobación, respaldo o control sobre su contenido. Su uso se rige por los términos y políticas del sitio respectivo.

## 13. Terminación

1. El Usuario podrá solicitar el cierre de su cuenta en cualquier momento, en cuyo caso se dará de baja el acceso conforme a la Política de Tratamiento de Datos Personales.
2. BackRoom podrá suspender o eliminar la cuenta de un Usuario ante el incumplimiento de estos Términos o de la ley.
3. Las disposiciones sobre propiedad intelectual, limitación de responsabilidad, ley aplicable y las que por su naturaleza deban subsistir, sobrevivirán a la terminación de estos Términos.

## 14. Modificaciones a los Términos

BackRoom podrá modificar estos Términos en cualquier momento. Las modificaciones se notificarán por la Plataforma (por ejemplo, mediante aviso en el sitio o al correo de contacto del Usuario) con antelación razonable. El uso continuado de la Plataforma tras la entrada en vigencia de la modificación implica su aceptación.

## 15. Ley aplicable y jurisdicción

Estos Términos se rigen por las leyes de la **República de Colombia**. Para la solución de controversias relacionadas con la protección de datos personales, será competente la **Superintendencia de Industria y Comercio (SIC)**. Las demás controversias se someterán a la jurisdicción ordinaria de [CIUDAD, COLOMBIA].

## 16. Contacto y quejas

Para consultas, quejas o reclamaciones sobre estos Términos, escríbanos a **[CORREO DE CONTACTO]** indicando el asunto y los datos de la cuenta. Atenderemos su solicitud en los términos previstos por la ley.
      `}
    </ReactMarkdown>
  </div>
);

export const PrivacyPolicy = () => (
  <div className="w-full">
    <ReactMarkdown components={MarkdownComponents}>
      {`
# Política de Tratamiento de Datos Personales — BackRoom

**Última actualización:** [FECHA]
**Versión:** 2.0

> **Nota de alcance:** documento elaborado para el proyecto académico BackRoom (SENA — ADSO). Cumple la estructura exigida por la Ley 1581 de 2012 y su normativa reglamentaria. Los contenidos marcados con **[CORCHETES]** son decisiones pendientes del equipo y deben confirmarse antes de tratarlo como versión definitiva. **No sustituye asesoría legal profesional.**

---

## 1. Responsable del tratamiento

| Campo | Valor |
|---|---|
| Nombre del proyecto/plataforma | BackRoom |
| Responsables | [NOMBRE COMPLETO INTEGRANTE 1], [NOMBRE COMPLETO INTEGRANTE 2] |
| Correo de contacto para temas de datos personales | [CORREO DE CONTACTO] |
| Domicilio | República de Colombia |

El **Responsable del Tratamiento** de los datos personales es quien decide sobre la recolección, almacenamiento, uso y supresión de los datos, según la definición de la Ley 1581 de 2012. Para los fines de esta política, el Responsable es el equipo del proyecto BackRoom.

## 2. Marco normativo

Esta política se rige por la normativa colombiana vigente sobre protección de datos personales, entre la que se incluye:

- **Ley 1581 de 2012** — Régimen General de Protección de Datos Personales.
- **Decreto 1377 de 2013** — reglamenta parcialmente la Ley 1581 de 2012 (autorización, deberes, menores, RNBD).
- **Decreto 1074 de 2015** — Decreto Único Reglamentario del Sector Comercio, Industria y Turismo (libro de protección de datos).
- **Decreto 2555 de 2022** — compila y actualiza las disposiciones reglamentarias en materia de protección de datos personales.
- **Ley 1266 de 2008** — Habeas Data financiero (aplica en lo pertinente).
- **Ley 527 de 1999** — comercio electrónico y mensajes de datos.
- **Ley 1273 de 2009** — delitos informáticos (obligación de protección de la información).
- **Ley 1480 de 2011** — Estatuto del Consumidor (aplica en la relación de consumo, en lo pertinente).
- La **Jurisprudencia de la Corte Constitucional** y la **doctrina de la Superintendencia de Industria y Comercio (SIC)**, autoridad nacional de protección de datos.

## 3. Principios del tratamiento

Conforme al artículo 4 de la Ley 1581 de 2012, el tratamiento de datos personales se sujeta a los siguientes principios:

1. **Legalidad:** el tratamiento se realiza conforme a la ley.
2. **Finalidad:** el tratamiento obedece a finalidades legítimas e informadas al Titular.
3. **Libertad:** el tratamiento solo puede ejercerse con autorización previa, expresa e informada del Titular.
4. **Veracidad o calidad:** la información debe ser veraz, completa, exacta, actualizada y comprobable.
5. **Transparencia:** el Titular puede obtener información sobre el tratamiento en cualquier momento.
6. **Acceso y circulación restringida:** los datos solo se tratan conforme a la autorización y la ley.
7. **Seguridad:** se adoptan medidas técnicas, humanas y administrativas para proteger la información.
8. **Confidencialidad:** se garantiza la reserva de la información, incluso después de finalizada la relación con el Titular.

## 4. Datos personales tratados

La Plataforma trata las siguientes categorías de datos:

- **Datos de identificación y contacto:** nombre de usuario, correo electrónico y demás datos suministrados al registrarse.
- **Datos de autenticación:** credenciales, datos de proveedores de identidad (por ejemplo, Google o GitHub, cuando el Usuario use estos métodos) y registros de inicio de sesión.
- **Datos de uso y técnicos:** dirección IP, fecha y hora de acceso, navegador, registros de actividad y de auditoría dentro de la Plataforma.
- **Contenido del Usuario:** los recursos y contenidos que el Usuario suba o genere.

**No se recolectan datos sensibles** (definidos en el artículo 5 de la Ley 1581 de 2012: origen racial o étnico, orientación política, convicciones religiosas o filosóficas, pertenencia a sindicatos, salud, vida sexual o datos biométricos), salvo que el Titular lo autorice de manera expresa y se cumplan las condiciones del artículo 6 de la ley.

## 5. Finalidades del tratamiento

Los datos personales se tratan con las siguientes finalidades:

1. Crear, autenticar y administrar la cuenta del Usuario.
2. Permitir el acceso a la Plataforma y garantizar la seguridad de las sesiones y de la información.
3. Habilitar las funcionalidades colaborativas: identificar quién crea una BackRoom, quién es miembro de una Organización, quién sube o modifica recursos y registrar la auditoría de las acciones.
4. Enviar comunicaciones **transaccionales** necesarias para el servicio (confirmación de cuenta, recuperación de contraseña, notificaciones de actividad).
5. Prevenir fraude, abuso y conductas contrarias a los Términos y Condiciones.
6. Cumplir obligaciones legales y atender requerimientos de autoridades competentes.
7. En el futuro, procesar pagos a través de una pasarela de pagos, si el Usuario contrata un plan de pago.

BackRoom **no** tratará los datos con fines de mercadeo, publicidad dirigida o venta de información a terceros sin una autorización adicional del Titular.

## 6. Autorización del Titular

La recolección y el tratamiento de los datos personales requieren la **autorización previa, expresa e informada** del Titular (artículo 9 de la Ley 1581 de 2012). Dicha autorización se obtiene de forma activa al momento del registro, mediante la casilla de verificación de aceptación de la Política de Tratamiento de Datos Personales y de los Términos y Condiciones.

La autorización podrá consultarse o solicitarse en cualquier momento. El Titular podrá revocarla cuando lo considere, en los términos del artículo 9 de la ley.

## 7. Derechos del Titular (Habeas Data)

Conforme al artículo 8 de la Ley 1581 de 2012 y al artículo 15 de la Constitución Política, el Titular tiene derecho a:

1. **Conocer, actualizar y rectificar** sus datos personales.
2. **Solicitar prueba de la autorización** otorgada.
3. **Ser informado**, previa solicitud, del uso que se ha dado a sus datos.
4. **Presentar quejas ante la SIC** por el incumplimiento de la normativa.
5. **Revocar la autorización** y/o solicitar la **supresión** de los datos cuando no se ajusten al tratamiento autorizado o se hayan vulnerado sus derechos.
6. **Acceder en forma gratuita** a sus datos personales que hayan sido objeto de tratamiento.

Para ejercer estos derechos, el Titular (o su representante acreditado) podrá contactar a **[CORREO DE CONTACTO]** mediante el procedimiento previsto en el artículo 14 de la Ley 1581 de 2012: consultas respondidas en **máximo 10 días hábiles** y reclamos en **máximo 15 días hábiles**, prorrogables por 15 días adicionales cuando las circunstancias lo exijan, previa comunicación al Titular.

## 8. Política de tratamiento de datos de menores

En cumplimiento del artículo 7 de la Ley 1581 de 2012 y del Decreto 1377 de 2013, la Plataforma **no recolecta ni trata datos personales de menores de edad**, salvo que se trate de datos de naturaleza pública o que el padre, madre o representante legal del menor otorgue autorización previa, expresa e informada, y se cumplan las condiciones legales y reglamentarias.

## 9. Almacenamiento, seguridad y confidencialidad

1. La Plataforma adopta **medidas técnicas, humanas y administrativas** razonables para proteger los datos contra acceso no autorizado, pérdida, alteración o divulgación (principio de seguridad, artículo 4 y 17 de la Ley 1581 de 2012; artículo 269A del Código Penal — Ley 1273 de 2009).
2. Entre las medidas se incluyen: cifrado en tránsito (HTTPS), cookies de sesión httpOnly, autenticación, control de accesos por roles y Row Level Security (RLS) en la base de datos, verificación de captcha y registros de auditoría.
3. La infraestructura puede operar mediante proveedores de nube (por ejemplo, **Supabase**, **Vercel** u otros). Dichos proveedores actúan como **Encargados del Tratamiento** y se vinculan mediante sus condiciones de servicio y garantías contractuales de confidencialidad y seguridad.
4. El acceso a los datos estará restringido a las personas autorizadas dentro del proyecto y solo para las finalidades autorizadas.

## 10. Transferencias y transmisiones internacionales

1. La Plataforma **no realiza transferencias internacionales** de datos a terceros ajenos al servicio.
2. Cuando los datos se transmitan a **proveedores de infraestructura ubicados fuera de Colombia** (por ejemplo, los servidores de Supabase o Vercel), ello se entiende como una **transmisión** (Encargado del Tratamiento) y no como una transferencia, por lo que se mantienen las garantías de confidencialidad, seguridad y finalidad, conforme a la Ley 1581 de 2012 y el Decreto 2555 de 2022.
3. En cualquier caso, el Titular será informado sobre dichos encargados y podrá conocerlos a través de **[CORREO DE CONTACTO]**.

## 11. Cookies y tecnologías similares

La Plataforma utiliza cookies y tecnologías similares:

1. **Cookies estrictamente necesarias:** para la sesión y el funcionamiento básico.
2. **Cookies de seguridad:** verificación anti-robot (por ejemplo, Google reCAPTCHA) y protección contra abuso.
3. **Cookies analíticas y funcionales:** en la medida en que se habiliten, para entender el uso de la Plataforma.

El Usuario puede configurar su navegador para rechazar o eliminar cookies; sin embargo, algunas funciones de la Plataforma podrían no funcionar correctamente. El tratamiento de datos a través de estas tecnologías se rige por esta política.

## 12. Conservación y retención

Los datos personales se conservarán mientras exista la cuenta o la relación del Usuario con la Plataforma, y posteriormente durante los plazos exigidos por las normas aplicables. Cuando el Titular solicite la supresión de sus datos o revoque la autorización, se procederá a su eliminación, salvo las retenciones obligatorias por ley o requerimiento de autoridad competente.

## 13. Vigencia y modificaciones de la política

Esta política rige a partir de su publicación y permanecerá vigente durante la existencia de la Plataforma. Cualquier modificación será informada a los Titulares a través de la Plataforma o del correo registrado, con antelación razonable a su entrada en vigor (artículo 12, Decreto 1377 de 2013). El uso continuado de la Plataforma después de la modificación implica su aceptación.

## 14. Autoridad competente y contacto

La **Superintendencia de Industria y Comercio (SIC)** es la autoridad nacional competente para conocer los reclamos sobre protección de datos personales. Los Titulares pueden ejercer sus derechos o presentar reclamaciones ante BackRoom escribiendo a **[CORREO DE CONTACTO]** o acudiendo directamente a la SIC (www.sic.gov.co).

Para el ejercicio de sus derechos, indique: nombre completo, correo de la cuenta, descripción de la solicitud y los documentos que acrediten su identidad o representación.
      `}
    </ReactMarkdown>
  </div>
);
