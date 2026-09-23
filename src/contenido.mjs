/**
 * Contenido de Kuyen Climbing: todos los textos y datos del sitio, sin HTML.
 *
 * Las variantes de /t/<id> leen de este módulo, así que un dato se corrige en
 * un solo lugar. La base salió de fuentes públicas de Kuyen (Instagram, ficha
 * de Google Maps, Linktree y su formulario de solicitud de ingreso), revisadas
 * el 14-09-2026.
 *
 * El 22-09-2026 Kuyen respondió la planilla de preguntas y con eso se completó
 * casi todo. Cada dato que viene de ahí lleva el código de su pregunta entre
 * paréntesis: H4 son horarios y tarifas, C clases, K Kuyencit@s, U contacto y
 * ubicación, F fotos, T testimonios, M el muro, S servicios, P productos, R
 * primera visita y reglas, V comunidad y eventos, E equipo e historia, L marca
 * y datos legales, D lo que Kuyen quiere destacar.
 *
 * Lo que sigue sin respuesta lleva POR_CONFIRMAR y un comentario "Falta:" con
 * lo que hay que preguntar. El build falla si un horario o un precio queda en
 * blanco, y si en el sitio aparece alguno de DATOS_SIN_CONFIRMAR.
 */

export const POR_CONFIRMAR = '[POR CONFIRMAR]'

export const MARCA = {
  nombre: 'Kuyen Climbing',
  // Así se escribe en el logo, con diéresis.
  nombreLogo: 'KÜYEN CLIMBING',
  significado: 'Küyen significa luna en mapudungun.',
  definicion: 'Centro de escalada técnica',
  lema: 'Un proyecto hecho por escaladores para escaladores',
  // Bio de Linktree.
  bio: 'Hola, somos Kuyen Climbing, un lugar donde puedes ir a entrenar y escalar.',
  // Frases que Kuyen usa en sus publicaciones.
  frases: {
    espacioSeguro: 'Tu espacio seguro de escalada',
    despedida: 'Nos vemos en las presas',
    cuidado: 'Cuidar al compañero es la ley primera en Kuyen',
    horarioBajo: 'Menos frío, menos gente, más muro para ti',
    clases: 'Te preparamos para conquistar tus límites',
  },
}

/** Título y descripción de las variantes (topes en LIMITES de src/site.config.mjs). */
export const SEO = {
  titulo: 'Kuyen Climbing | Escalada en boulder en Padre Las Casas',
  descripcion:
    'Centro de escalada técnica en boulder en Padre Las Casas, La Araucanía: paredes de 0° a 40°, moonboard, clases guiadas y comunidad.',
}

export const UBICACION = {
  calle: 'Los Patagones 375',
  comuna: 'Padre Las Casas',
  region: 'La Araucanía',
  pais: 'CL',
  codigoPostal: '4850000',
  plusCode: '6CQ5+Q7 Padre Las Casas',
  referencia: 'A un costado de Temuco',
  lat: -38.7605438,
  lng: -72.5918641,
  maps: 'https://maps.app.goo.gl/v9F89L5peqFyxcJc9',
  // El mapa va incrustado y carga solo (22-09-2026). Como lleva loading="lazy",
  // el navegador se lo pide a Google recién cuando se acerca a la pantalla.
  mapaEmbebido: 'https://www.google.com/maps?q=-38.7605438,-72.5918641&z=16&output=embed',
}

export const CONTACTO = {
  telefono: '+56 9 3502 8838',
  telefonoE164: '+56935028838',
  whatsapp: 'https://wa.me/56935028838',
  instagram: 'https://www.instagram.com/kuyen.climbing/',
  instagramUsuario: '@kuyen.climbing',
  // Kuyen pide usar los dos canales por igual (U2).
  canalHabitual: 'WhatsApp o mensaje directo de Instagram',
  correo: 'kuyen.climbing@gmail.com', // U1
  horarioRespuesta: 'Respondemos los mensajes a toda hora.', // U3
  // U4, respondida el 23-09-2026.
  tiktok: 'https://www.tiktok.com/@kuyen.climbing',
  facebook: 'https://www.facebook.com/profile.php?id=61556312955426',
}

export const LINKS = {
  solicitudIngreso:
    'https://docs.google.com/forms/d/e/1FAIpQLSfA0HoO-PmDaaSRjXqLt1VF37dFQKTdcsL2kD1co3wM-rGGIQ/viewform?usp=pp_url',
  linktree: 'https://linktr.ee/kuyen.climbing',
  apps: [
    {
      nombre: 'Moon Climbing',
      uso: 'La app del moonboard',
      url: 'https://play.google.com/store/search?q=moon%20climbing&c=apps&hl=es_419',
    },
    {
      nombre: 'Boulder Creator',
      uso: 'Para crear y compartir bloques',
      url: 'https://play.google.com/store/search?q=boulder+creator&c=apps&hl=es_419',
    },
  ],
}

export const HISTORIA = {
  // El 24-05-2025 celebraron el segundo aniversario: abrieron en 2023.
  desde: 2023,
  aniversarios: [
    { numero: 2, fecha: '2025-05-24' },
    { numero: 3, fecha: '2026-05-16' },
  ],
  // Cómo nació Kuyen, contado por Andy (E3). Acá va resumido y en tercera
  // persona; el relato completo está en la planilla de preguntas.
  relato: [
    'Kuyen empezó como una conversación entre hermanos: qué bacán sería tener una moonboard para entrenar.',
    'Años después, Andy y Camila volvieron sobre la idea de abrir un muro y empezar de a poco. Buscando arriendo en Temuco no aparecía nada, hasta que dieron con una casa que ya tenía el galpón.',
    'Se lo contaron a Aracely, que los apañó desde el primer día, y después se sumó Juany, la madre de Andy y Gerardo. Gerardo vio el potencial y se unió al proyecto.',
    'Cada uno cubre una parte distinta, y por eso el muro tiene una personalidad propia. Kuyen es eso: un lugar para sumarse a la comunidad.',
  ],
}

/** Cifras confirmadas, con su fuente. `valor` es numérico cuando se puede animar. */
export const CIFRAS = [
  // M12: Kuyen ya perdió la cuenta de las rutas creadas, así que el 500+ de
  // mayo de 2025 queda como piso, no como cifra al día.
  { id: 'rutas', valor: 500, sufijo: '+', etiqueta: 'rutas creadas', fuente: 'Instagram, 24-05-2025' },
  { id: 'presas', valor: 1000, sufijo: '+', etiqueta: 'presas en el muro', fuente: 'Kuyen, planilla M3' },
  { id: 'inclinacion', valor: 40, sufijo: '°', etiqueta: 'de inclinación máxima', fuente: 'Kuyen, planilla M5' },
  { id: 'google', valor: '5,0', sufijo: '', etiqueta: 'en Google, con 14 reseñas', fuente: 'Google Maps, 23-09-2026' },
  { id: 'anios', valor: 3, sufijo: '', etiqueta: 'años de comunidad', fuente: 'Tercer aniversario, 16-05-2026' },
]

/**
 * La valoración de Kuyen en Google, leída de la ficha el 23-09-2026: 5,0 con 14
 * opiniones, todas de cinco estrellas. Es la única fuente de la nota; la cifra
 * `google` de CIFRAS sale de acá.
 *
 * Google no da un enlace directo para escribir una reseña sin el identificador
 * del lugar, que no tenemos, así que la invitación abre la ficha, donde está el
 * botón, y el texto lo dice.
 *
 * Ojo, para el día que se publique: no se declara aggregateRating en los datos
 * estructurados. Las guías de Google no permiten marcar como valoración propia
 * una nota recogida en otro sitio, y su propia ficha cuenta como otro sitio.
 */
export const VALORACION = {
  nota: '5,0',
  maximo: 5,
  total: 14,
  conTexto: 5,
  fuente: 'Google',
  url: UBICACION.maps,
  leida: '23-09-2026',
  resumen: 'Las 14 opiniones de Kuyen en Google son de cinco estrellas.',
  enlace: 'Leerlas en Google',
  invitacion: '¿Ya escalaste acá? Déjanos tu reseña en Google.',
}

export const MURO = {
  resumen: 'Muro de boulder: bloques sin cuerda, sobre colchonetas, para todos los niveles.',
  altura: '4,26 metros de altura', // M4
  caracteristicas: [
    {
      id: 'inclinaciones',
      titulo: 'De 0° a 40°',
      texto: 'Una pared plana, una de 15 grados, una de 25 y una de 40: hay dónde empezar y dónde complicarse.', // M5
    },
    {
      id: 'moonboard',
      titulo: 'Moonboard 2016',
      texto: 'El set completo del 2016, a 40 grados. Lo puede usar cualquiera, con los cuidados que pide un muro así.', // M9
    },
    {
      id: 'presas',
      titulo: 'Más de 1000 presas',
      texto: 'De resina y de madera, sobre volúmenes de terciado. Varias presas y todos los volúmenes los fabrica Kuyen.', // M1, M2, M3
    },
    {
      id: 'rutas',
      titulo: 'Rutas nuevas',
      texto: 'Cada mes se mueve al menos una sección del muro, y la dificultad de cada ruta va marcada con chapas.', // M7, M8
    },
    {
      id: 'colchonetas',
      titulo: 'Colchonetas de 30 cm',
      texto: 'Colchonetas de 30 centímetros y densidad 35, que cubren la mayor parte del muro.', // M6
    },
    {
      id: 'sombra',
      titulo: 'Hacer sombra',
      texto: 'Hacemos sombra a toda persona que escala: cuidar al compañero es la ley primera en Kuyen.',
    },
  ],
  // Material de entrenamiento además del muro (M11).
  entrenamiento: [
    'Campus de distintas medidas',
    'Tablas multipresa',
    'Kettlebells',
    'Barra semiolímpica para piernas, peso muerto y elevaciones',
  ],
  // Proceso de renovación mostrado en Instagram (septiembre de 2025).
  renovacion: 'Sacamos las presas, las lavamos, instalamos volúmenes y armamos rutas nuevas.',
}

/**
 * Quiénes están detrás de Kuyen (E1, E2, M10).
 * Falta: la foto del equipo. Kuyen dijo que la van a subir pronto (E1, F10).
 */
export const EQUIPO = {
  resumen: 'Kuyen lo levantan sus dueños, los seteadores y los profes, y lo vigila una gata.',
  duenos: ['Andy', 'Camila', 'Gerardo'], // M10
  construccion:
    'El muro lo construyeron Andy, Camila y Gerardo con la ayuda de unos amigos: estructura de madera, anclada al piso y al metal del galpón.',
  profesores: [
    { nombre: 'Andrés Muñoz', detalle: 'Estudiante de entrenador olímpico del COCH' },
    { nombre: 'Ingelin Daniels', detalle: 'Profesora de educación física' },
  ], // C5
  seteadores: {
    resumen: 'Las rutas las arman Andy, Keka, Fergus, Gus y Bastián.',
    headsetter: 'Andy',
    nombres: ['Andy', 'Keka', 'Fergus', 'Gus', 'Bastián'],
  },
}

/** Lo que se vende en el muro (P1, P3). Kuyen no entregó precios. */
export const PRODUCTOS = {
  resumen: 'En el muro vendemos lo que hace falta para una sesión.',
  lista: [
    'Magnesio en cubo y en bolsa',
    'Cinta de dedos',
    'Cepillos',
    'Magneseras',
    'Brownies para entrenar los dedos',
    'Snacks',
  ],
  proximamente: 'Estamos preparando más poleras de Kuyen y otros productos de la marca.',
}

/** Cómo es llegar y estar en Kuyen (R6, R7, U5, U7). */
export const COMODIDADES = {
  lista: ['Dos baños', 'Agua', 'Hervidor y mate', 'Calefacción'],
  seguridad: 'Tenemos botiquín y personas con curso de primeros auxilios.', // R6
  estacionamiento: 'Hay dónde estacionar en la calle, que es bien transitada, y una Copec cerca.', // U5
  referencia: 'Todavía no tenemos letrero en la entrada, pero viene pronto.', // U7
}

/** Actividades de otras personas que pasan en el espacio de Kuyen (S5, S6). */
export const INVITADOS = [
  {
    id: 'aerial',
    nombre: 'Aerial Temuco',
    resumen: 'Acrobacia aérea en el trapecio, la lira y la tela de Kuyen. Aquí hacen sus muestras.',
    url: 'https://www.instagram.com/aerial_tco',
  },
  {
    id: 'kelluwun',
    nombre: 'Kelluwün, terapia en movimiento',
    resumen:
      'Bienestar corporal con técnicas manuales: masaje de relajación, descontracturante, mixto y exprés en silla ergonómica.',
    url: 'https://www.instagram.com/kelluwun_masajestemuco', // S6, respondida el 23-09-2026
  },
]

export const SERVICIOS = [
  {
    id: 'escalada-libre',
    nombre: 'Escalada libre',
    resumen: 'Boulder para todos los niveles, desde principiantes hasta escaladores con experiencia.',
    detalles: [
      'Dos tramos: horario bajo y horario alto.',
      'Pase diario, packs de 5 y 10 pases, o mensualidad.',
      'Se paga al ingresar y se escala con calzado.',
    ],
    // S1: los pies de gato son de Decathlon, la primera vez salen gratis.
    equipo: 'Arrendamos pies de gato de la talla 36 a la 44: la primera vez son gratis. También vendemos magnesio.',
  },
  {
    id: 'clases',
    nombre: 'Clases guiadas',
    // C2: Andy confirmó el 22-09-2026 que el plan es de una vez por semana. El de
    // 8 clases al mes que Kuyen lanzó en marzo sale del sitio hasta saber si
    // sigue existiendo y a qué valor.
    resumen: 'Desde marzo de 2026: un plan de 4 clases al mes, una vez por semana.',
    desde: 'Desde marzo de 2026',
    plan: '4 clases al mes',
    descuento: 'El primer mes va con descuento.',
    temas: [
      'Técnica',
      'Seguridad',
      'Lectura de rutas',
      'Fuerza',
      'Mente',
      'Superar la barrera del miedo',
      'Preparación para escalar en roca',
    ],
    cita: 'Empieza a entrenar: técnicas, enfoque, mente, fitness, camaradería.',
    dias: 'Lunes a viernes de 20:00 a 22:00, y lunes y jueves de 18:00 a 20:00.', // C1
    cupos: 'De 6 a 7 personas por grupo.', // C4
    profesores: EQUIPO.profesores, // C5
    nivel: 'Las clases parten desde cero. Al llegar te indicamos el grupo que va con tu nivel.', // C3
    prueba: 'Agendamos clases de prueba grupales, para que veas cómo es escalar acompañado.', // C7
    incluyeEntrada: 'El día de tu clase puedes quedarte en el muro todo el día.', // C6
  },
  {
    id: 'kuyencitos',
    nombre: 'Kuyencit@s',
    resumen: 'El programa de escalada para niñas y niños.',
    edades: 'Dos grupos: de 7 a 9 años y de 10 a 15 años.', // K1
    // Falta: días y horario de Kuyencit@s. Kuyen está ajustando los horarios (K2).
    dias: POR_CONFIRMAR,
    acompanamiento: 'Acompañan los profesores. Al principio conviene que venga también su tutor, para que agarren confianza.', // K4
    autorizacion: 'Pedimos un consentimiento: la escalada es un deporte de riesgo y, con todas las medidas de seguridad, un accidente siempre es posible.', // K5
  },
  {
    id: 'talleres',
    nombre: 'Talleres y mediciones',
    resumen: 'Talleres de routesetting y mediciones de fuerza de dedos para ver tu progreso.',
    // S4: los talleres se arman buscando a la persona indicada para dictarlos.
    detalles: [
      'Los talleres son puntuales: para cada uno buscamos a la persona indicada.',
      'La medición de fuerza de dedos te la puedes tomar tú, o bajo la supervisión de un profesor si estás en clases.',
    ],
  },
]

/**
 * Horarios. Kuyen abre los siete días de 10:00 a 22:00 (H1, H2) y cobra dos
 * tarifas: horario bajo y horario alto (H4). Kuyen validó el corte de las 16:00
 * entre un tramo y el otro (22-09-2026).
 */
export const HORARIOS = {
  abre: '10:00',
  cierra: '22:00',
  tramos: [
    { id: 'bajo', nombre: 'Horario bajo', descripcion: 'Menos frío, menos gente, más muro para ti.', dias: 'Lunes a domingo', horas: '10:00 a 16:00' },
    { id: 'alto', nombre: 'Horario alto', descripcion: 'Tarde y noche.', dias: 'Lunes a domingo', horas: '16:00 a 22:00' },
  ],
  semana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia) => ({
    dia,
    horas: '10:00 a 22:00',
    tramo: 'Horario bajo y alto',
  })),
  aviso: 'Conviene escribirnos unos días antes para confirmar.', // H1
  verano: 'En verano alargamos una hora por el calor. Lo avisamos en Instagram.', // H3
  pago: 'Aceptamos todos los medios de pago: efectivo, débito, crédito y transferencia.', // H8
}

/**
 * Precios vigentes (H4, H5, H6, C2, K3, S1). Los valores de estudiante necesitan
 * credencial.
 */
export const PRECIOS = [
  { id: 'pase-bajo', nombre: 'Pase diario, horario bajo', detalle: '10:00 a 16:00', valor: '$4.000', valorEstudiante: '$3.500' },
  { id: 'pase-alto', nombre: 'Pase diario, horario alto', detalle: '16:00 a 22:00', valor: '$5.000', valorEstudiante: '$4.500' },
  { id: 'mensualidad', nombre: 'Mensualidad de escalada libre', detalle: 'Todo el mes', valor: '$30.000', valorEstudiante: '$25.000' },
  { id: 'pack-5', nombre: 'Pack de 5 pases libres', detalle: 'Escalada libre', valor: '$18.000' },
  { id: 'pack-10', nombre: 'Pack de 10 pases libres', detalle: 'Escalada libre', valor: '$32.000' },
  { id: 'clases', nombre: 'Plan de clases guiadas', detalle: '4 clases al mes, una vez por semana. Descuento el primer mes', valor: '$45.000' },
  // K3: Kuyen aclaró el 23-09-2026 que los dos planes son por semana.
  { id: 'kuyencitos-1', nombre: 'Kuyencit@s, 1 clase por semana', detalle: 'Programa infantil', valor: '$40.000' },
  { id: 'kuyencitos-2', nombre: 'Kuyencit@s, 2 clases por semana', detalle: 'Programa infantil', valor: '$52.000' },
  { id: 'kuyencitos-suelta', nombre: 'Kuyencit@s, clase suelta', detalle: 'Programa infantil', valor: '$9.000' },
  { id: 'arriendo-pies', nombre: 'Arriendo de pies de gato', detalle: 'Por jornada, tallas 36 a 44. La primera vez es gratis', valor: '$1.500' },
]

export const COMUNIDAD = {
  resumen: 'La comunidad es el centro de Kuyen: competencias, encuentros, talleres, celebraciones y sorteos.',
  publico: 'Desde principiantes hasta escaladores con años de muro, con programa infantil y foco en la escalada femenina.',
  inclusion: 'En Google, Kuyen figura como espacio amigable con LGBTQ+.',
  anuncios: 'Las fechas y novedades se anuncian en Instagram y en Facebook.', // V4
  // V6: cómo quiere Kuyen presentar el foco en la escalada femenina y la inclusión.
  foco: 'A este muro se viene a hacer comunidad y a practicar el deporte que amamos.',
  // D2: a quién le habla el sitio.
  destinatario: 'Queremos que la comunidad escaladora crezca en La Araucanía, y le hablamos a todos por igual.',
  valores: ['Comunidad', 'Seguridad', 'Inclusión', 'Progreso personal', 'Conexión con la montaña'],
}

/**
 * Eventos publicados por Kuyen. Van sin precios ni horas: los valores de
 * entrada eran solo para cada evento y se confunden con las tarifas.
 * `proximo` se marca a mano; revisar después del 03-10-2026.
 */
export const EVENTOS = [
  {
    id: 'encuentro-femenino',
    nombre: 'Encuentro Femenino Vol. 01',
    tipo: 'Encuentro',
    fecha: '2026-10-03',
    fechaTexto: '3 de octubre de 2026',
    proximo: true,
    resumen:
      'Charlas, comida, música, escalada libre y curso de armado de rutas. Un día pensado y creado por mujeres, para mujeres que viven la escalada.',
  },
  {
    id: 'taller-routesetting',
    nombre: 'Taller de routesetting',
    tipo: 'Taller',
    fecha: '2026-10-02',
    fechaTexto: '2 de octubre de 2026',
    proximo: true,
    resumen:
      'Creación, diseño y armado de rutas. Jornada completa dictada por Karla Mercado, con 7 cupos y orientada a mujeres escaladoras.',
  },
  {
    id: 'dia-mundial',
    nombre: 'Día Mundial de la Escalada',
    tipo: 'Celebración',
    fecha: '2026-07-18',
    fechaTexto: '18 de julio de 2026',
    proximo: false,
    resumen: 'Navegado, empanadas, cine de escalada, juegos y premios.',
  },
  {
    id: 'aniversario-3',
    nombre: 'Competencia de tercer aniversario',
    tipo: 'Competencia',
    fecha: '2026-05-16',
    fechaTexto: '16 de mayo de 2026',
    proximo: false,
    formato: 'Ronda americana',
    resumen: 'Formato ronda americana: 5 pegues por ruta y puntaje por las últimas 5 rutas logradas.',
    categorias: [
      { nombre: 'Novicio', detalle: 'Hasta 1 año escalando, de V0 a V2' },
      { nombre: 'Avanzado', detalle: 'Más de 1 año, de V2 a V4' },
      { nombre: 'Experto', detalle: 'Más de 5 años, de V5 en adelante' },
      { nombre: 'Sensei', detalle: 'Experiencia y estrategia' },
    ],
  },
  {
    id: 'competencia-escolar',
    nombre: 'Competencia escolar de escalada',
    tipo: 'Competencia',
    fecha: '2025-07',
    fechaTexto: 'Julio de 2025',
    proximo: false,
    resumen: 'Una competencia con colegios, profesores y apoderados de la zona.',
  },
]

/** Cómo funcionan los eventos (V2, V3). */
export const EVENTOS_INFO = {
  inscripcion: 'Para inscribirte, escríbenos por Instagram o WhatsApp, o pásate el mismo día y lo gestionamos.',
  repiten:
    'El aniversario y el Día Mundial de la Escalada se repiten todos los años. Las competencias escolares y el encuentro femenino llevan dos años seguidos.',
}

/**
 * Publicaciones de Instagram que muestra el sitio. Desde el 22-09-2026 cada
 * tarjeta incrusta la publicación, que carga sola al acercarse a la pantalla, y
 * alrededor va el texto propio de este módulo.
 *
 * El campo `foto` quedó sin usarse cuando la publicación pasó a incrustarse. Se
 * mantiene porque el build comprueba que apunte a una foto de FOTOS, y porque es
 * la foto que llevaría la tarjeta si se volviera a la carga por clic.
 *
 * Para elegir una publicación: que sea pública, que no muestre precios ni
 * horarios sin confirmar, y que no se vean marcas sin permiso (pregunta 9). Por
 * eso quedan fuera el Encuentro Femenino, que muestra el valor de la entrada, y
 * el agradecimiento del aniversario, que nombra a los auspiciadores.
 * Revisar después del 02-10-2026: el taller de routesetting queda viejo.
 * De reserva, sin precios: p/DXGDRheDIDI (Pancita) y p/DMZTDsfsk2u (competencia
 * escolar).
 */
export const INSTAGRAM = {
  perfil: CONTACTO.instagram,
  // El enlace de cada publicación es base + ruta, y la página lo abre en Instagram.
  base: 'https://www.instagram.com/',
  publicaciones: [
    {
      id: 'taller',
      ruta: 'p/DdG5vAJSeuA',
      tipo: 'Publicación',
      titulo: 'Taller de routesetting',
      fechaTexto: EVENTOS.find((e) => e.id === 'taller-routesetting').fechaTexto,
      detalle: 'Creación, diseño y armado de rutas, para mujeres escaladoras.',
      foto: 'escalador-desplome-amarillo',
    },
    {
      id: 'sombra',
      ruta: 'p/DXGCPpyjKfi',
      tipo: 'Publicación',
      titulo: 'Hacer sombra',
      fechaTexto: 'Abril de 2026',
      detalle: MARCA.frases.cuidado + '.',
      foto: 'escaladora-muro-azul',
    },
    {
      id: 'rutas',
      ruta: 'reel/DOenM9lElP2',
      tipo: 'Video',
      titulo: 'Rutas nuevas',
      fechaTexto: 'Septiembre de 2025',
      detalle: MURO.renovacion,
      foto: 'escalador-muro-blanco',
    },
  ],
}

/** Reglamento de Kuyen Climbing, tal cual lo publica en su solicitud de ingreso. */
export const REGLAMENTO = [
  'Saludar al ingresar',
  'Cancelar al momento de ingresar',
  'No traer animales',
  'No ingresar a la casa',
  'No fumar ni beber alcohol',
  'Ordenar sus pertenencias',
  'Ordenar el material de entrenamiento',
  'Escalar con calzado',
  'Hacer sombra a toda persona',
  'Cuidado con rutas expuestas',
  'No sacarse la polera',
  'No gritar intencionalmente',
  'No manipular las presas del muro',
  'No ingresar a la recepción',
  'Al retirarse despídase',
]

/**
 * Preguntas frecuentes, compartidas por las tres variantes. Sin HTML: cada
 * entrada puede traer `respuesta` (texto), `lista` (viñetas o pasos) y
 * `enlaces`, y cada variante decide cómo pintarlas.
 */
export const FAQ = [
  {
    id: 'primera-visita',
    pregunta: '¿Qué hago antes de mi primera visita?',
    respuesta: 'Completa la solicitud de ingreso y vente a Kuyen. No hace falta reservar.', // R1
    enlaces: [{ texto: 'Completar la solicitud de ingreso', url: LINKS.solicitudIngreso }],
  },
  {
    id: 'reglas',
    pregunta: '¿Cuáles son las reglas del muro?',
    respuesta: `El reglamento tiene ${REGLAMENTO.length} puntos, y sigue vigente tal cual:`, // R5
    lista: REGLAMENTO,
    ordenada: true,
  },
  {
    id: 'horarios-valores',
    pregunta: '¿Cuáles son los horarios y valores?',
    // H1, H4, H8: abren todos los días y cobran dos tarifas.
    respuesta:
      'Abrimos de lunes a domingo de 10:00 a 22:00, con dos tarifas: horario bajo hasta las 16:00 y horario alto después. Se paga al ingresar y aceptamos todos los medios de pago.',
  },
  {
    id: 'experiencia',
    pregunta: '¿Necesito experiencia para escalar?',
    // R2: la charla de seguridad de la primera vez es gratis.
    respuesta:
      'No. Si nunca has escalado, avísanos al llegar y te damos una charla de seguridad, sin costo, para que empieces tranquilo.',
  },
  {
    id: 'que-traer',
    pregunta: '¿Qué conviene traer la primera vez?',
    respuesta: 'Muchas ganas de aprender y de caer. El mate lo ponemos nosotros.', // R3
  },
  {
    id: 'calzado',
    pregunta: '¿Qué calzado necesito?',
    // S1: el reglamento pide escalar con calzado; los pies de gato se arriendan.
    respuesta:
      'El reglamento pide escalar con calzado. Arrendamos pies de gato de la talla 36 a la 44: la primera vez son gratis y después son $1.500 por jornada. También vendemos magnesio.',
  },
  {
    id: 'ninas-ninos',
    pregunta: '¿Hay escalada para niñas y niños?',
    // K1 y K6: el programa va de 7 a 15, y a escalada libre se puede desde los 5 con tutor.
    respuesta:
      'Sí. Kuyencit@s tiene dos grupos, de 7 a 9 y de 10 a 15 años. A escalada libre se puede venir desde los 5, siempre con un tutor a cargo.',
  },
  {
    id: 'maximo',
    pregunta: '¿Hay un máximo de personas en el muro?',
    respuesta: 'No. Cuando somos varios el muro se siente más acogedor y se nota más la comunidad.', // R4
  },
  {
    id: 'grupos',
    pregunta: '¿Reciben grupos, colegios o empresas?',
    // S3: se coordina por cualquiera de los canales, o pasando por el muro.
    respuesta:
      'Sí. Escríbenos por Instagram, WhatsApp o correo, llámanos, o pásate directamente por el muro y lo coordinamos.',
  },
  {
    id: 'cumpleanos',
    pregunta: '¿Celebran cumpleaños en el muro?',
    // S2: por ahora no, porque hay actividades casi todos los días.
    respuesta: 'Por ahora no. Tenemos actividades casi todos los días y se nos complica reagendar clases.',
  },
  {
    id: 'apps',
    pregunta: '¿Qué apps usan en el muro?',
    respuesta: 'Dos, para el moonboard y para armar bloques.',
    enlaces: LINKS.apps.map((app) => ({ texto: app.nombre, url: app.url, detalle: app.uso })),
  },
  {
    id: 'eventos',
    pregunta: '¿Dónde se anuncian los eventos?',
    respuesta: 'En Instagram y en Facebook. Para inscribirte, escríbenos o pásate el mismo día.', // V3, V4
    enlaces: [{ texto: CONTACTO.instagramUsuario, url: CONTACTO.instagram }],
  },
]

export const SOLICITUD = {
  titulo: 'Solicitud de ingreso',
  url: LINKS.solicitudIngreso,
  resumen:
    'Antes de tu primera visita, completa la solicitud de ingreso: confirmas que leíste el reglamento y dejas un contacto de emergencia.',
  // Texto de bienvenida del formulario, tal cual.
  bienvenida:
    '¡Bienvenid@s a Kuyen Climbing! Esto es una pequeña solicitud, de que la persona está de acuerdo con nuestros reglamentos, a la vez proporcionarnos cierta información en caso de emergencia, para así tener una mejor convivencia, poder cuidarnos entre todos y practicar el deporte que nos gusta.',
}

/**
 * Cómo es llegar por primera vez a Kuyen, paso por paso (R1, R2, R3, S1, K6).
 * Kuyen dijo que la acción que más le importa es que la gente complete la
 * solicitud de ingreso (D3), así que el primer paso es ese.
 */
export const PRIMERA_VISITA = {
  titulo: 'Tu primera vez',
  resumen: 'No hace falta reservar ni tener experiencia. Son cuatro pasos.',
  pasos: [
    {
      id: 'solicitud',
      titulo: 'Completa la solicitud de ingreso',
      texto: 'Confirmas que leíste el reglamento y dejas un contacto de emergencia.', // R1
      enlace: { texto: 'Completar la solicitud', url: LINKS.solicitudIngreso },
    },
    {
      id: 'charla',
      titulo: 'Avísanos que es tu primera vez',
      texto: 'Si nunca has escalado, dilo al llegar: te damos una charla de seguridad, sin costo.', // R2
    },
    {
      id: 'calzado',
      titulo: 'Arrienda pies de gato',
      texto: 'Tenemos de la talla 36 a la 44. La primera vez son gratis.', // S1
    },
    {
      id: 'ganas',
      titulo: 'Trae ganas de aprender y de caer',
      texto: 'El mate lo ponemos nosotros, y siempre hay para compartir.', // R3
    },
  ],
  menores: 'A escalada libre se puede venir desde los 5 años, siempre con un tutor a cargo.', // K6
  aviso: HORARIOS.aviso, // H1
}

/** Datos legales para el pie de página y la solicitud de ingreso (L6, L7). */
export const LEGAL = {
  razonSocial: 'Kuyen SpA',
  privacidad:
    'Los datos de emergencia de la solicitud los ven solo las personas que atienden el muro, y solo si pasa algo.',
}

export const PANCITA = {
  nombre: 'Pancita',
  descripcion: 'Nuestra jefa de seguridad, vigilante y dueña absoluta del muro.',
}

/**
 * Reseñas de Google, copiadas de la ficha el 23-09-2026 abriéndola en Chrome,
 * porque Google Maps las carga con JavaScript. De las 14 opiniones, estas cinco
 * son las únicas con texto; las otras nueve son estrellas sin comentario. Todas
 * son de cinco estrellas.
 *
 * Van tal cual las escribieron, sin corregir redacción, ortografía ni
 * mayúsculas, y ordenadas por cuántas reseñas tiene cada persona, que es el
 * criterio que pidió Benjamín: primero quienes tienen recuento visible.
 *
 * Kuyen no llegó a responder T1, que preguntaba si se podían publicar con
 * nombre. Benjamín decidió el 23-09-2026 publicarlas igual: son públicas y, si
 * alguien pide bajar la suya, se borra su entrada de este array y listo.
 *
 * `perfil` es lo que Google muestra bajo el nombre. Cuando está vacío, la
 * variante firma solo con el nombre.
 */
export const RESENAS = [
  {
    id: 'jonathan-sanhueza',
    cita: 'Gran boulder para entrenar. Un muro versátil que cuenta con un moonboard para escaladores exigentes. Dan clases de escalada. Tienen aparatos aéreos como trapecio, lira y tela para entrenar de forma paralela dentro del mismo gimnasio, esto se planifica con aerial_Temuco',
    autor: 'jonathan sanhueza',
    perfil: 'Local Guide · 11 opiniones',
    fechaTexto: 'Hace 6 meses',
  },
  {
    id: 'gustavo-carrasco',
    cita: 'Excelente muro, para todo tipo de escaladores.',
    autor: 'Gustavo Carrasco',
    perfil: '4 opiniones',
    fechaTexto: 'Hace 2 años',
  },
  {
    id: 'shutaro-fujiwara',
    cita: 'Excelente muro de escalada muy amplio con desplomes continuos hasta 25° y un moonboard!',
    autor: 'Shutaro Fujiwara',
    perfil: '2 opiniones',
    fechaTexto: 'Hace 2 años',
  },
  {
    // Google la mostraba cortada y el botón "Más" no la expandió en ninguna de
    // las cuatro lecturas: este es el fragmento visible, sin los puntos.
    id: 'kamal-munoz',
    cita: 'Excelente lugar para escalar y compartir con amigos',
    autor: 'kamal muñoz',
    perfil: '',
    fechaTexto: 'Hace 2 años',
  },
  {
    id: 'ivette-silva',
    cita: 'Buen ambiente',
    autor: 'Ivette Silva',
    perfil: '',
    fechaTexto: 'Hace un año',
  },
].map((r) => ({ ...r, fuente: VALORACION.fuente }))

/** Nombre viejo, que es el que leen las tres variantes. */
export const TESTIMONIOS = RESENAS

/**
 * Fotos entregadas por Kuyen. Las genera `node tools/assets.mjs fotos` en
 * img/fotos/<id>-<ancho>.webp, con la orientación EXIF aplicada.
 *
 * F1: las tomó @vbizama.studio, que es quien se encarga de las fotos de Kuyen.
 * F2: las personas que aparecen dieron permiso para salir en la página.
 */
export const FOTOS = [
  {
    id: 'escaladora-muro-azul',
    original: 'DSC_0033.JPG',
    orientacion: 'vertical',
    alt: 'Escaladora con polera naranja en un muro azul y amarillo, mientras otra persona la observa desde abajo',
  },
  {
    id: 'escalador-desplome-gris',
    original: 'DSC_0011.JPG',
    orientacion: 'vertical',
    alt: 'Escalador con polerón morado en un desplome gris y azul, bajo el techo de zinc del gimnasio',
  },
  {
    id: 'escaladora-desplome',
    original: 'DSC_0178.JPG',
    orientacion: 'vertical',
    alt: 'Escaladora con polera negra y pantalón camuflado en un desplome amarillo y azul',
  },
  {
    id: 'escalador-desplome-amarillo',
    original: 'DSC_0106.JPG',
    orientacion: 'horizontal',
    alt: 'Escalador con polera verde colgado de un desplome amarillo y azul',
  },
  {
    id: 'comunidad-evento',
    original: 'DSC_0149.JPG',
    orientacion: 'horizontal',
    alt: 'Mucha gente reunida dentro del gimnasio durante un evento, con los muros al fondo',
  },
  {
    id: 'escalador-muro-blanco',
    original: '_DSC0086.JPG',
    orientacion: 'horizontal',
    alt: 'Escalador en un muro blanco, amarillo, azul y gris',
  },
  {
    id: 'nino-escalando',
    original: '_DSC0219.JPG',
    orientacion: 'horizontal',
    alt: 'Niño escalando mientras el público lo mira desde abajo',
  },
  {
    id: 'joven-escalando',
    original: '_DSC0234.JPG',
    orientacion: 'horizontal',
    alt: 'Joven escalando visto desde arriba, con público alrededor',
  },
  {
    id: 'pancita',
    original: '_DSC0366.JPG',
    orientacion: 'horizontal',
    alt: 'Pancita, la gata de Kuyen, mirando a la cámara con el muro de fondo',
  },
].map((foto) => ({ ...foto, anchos: [1600, 1200, 800], credito: '@vbizama.studio' }))

/**
 * Fotos que Kuyen todavía no manda: F3 a F14 de la planilla quedaron todas en
 * blanco. Cada una se muestra en su sitio como un recuadro que dice qué falta,
 * con la misma lógica que POR_CONFIRMAR: lo que no está se ve, no se disimula,
 * así Andy sabe de un vistazo qué tiene que sacar y dónde va.
 *
 * El build comprueba que cada id aparezca en las tres variantes, para que
 * ninguna quede olvidada al mover secciones.
 */
export const FOTOS_PENDIENTES = [
  { id: 'muro-vacio', pregunta: 'F5', formato: 'horizontal', pide: 'El muro completo sin gente, con buena luz.' },
  { id: 'presas-cerca', pregunta: 'F4', formato: 'horizontal', pide: 'Presas y volúmenes de cerca, donde se vean los colores y la textura.' },
  { id: 'moonboard', pregunta: 'F7', formato: 'vertical', pide: 'El moonboard completo, y otra con alguien escalando.' },
  { id: 'seteo', pregunta: 'F12', formato: 'horizontal', pide: 'El armado de rutas: seteo, lavado de presas o instalación de volúmenes.' },
  { id: 'equipo', pregunta: 'F10', formato: 'horizontal', pide: 'El equipo: una foto de cada persona, o una grupal.' },
  { id: 'clase', pregunta: 'F8', formato: 'horizontal', pide: 'Una clase guiada en acción.' },
  { id: 'kuyencitos', pregunta: 'F9', formato: 'horizontal', pide: 'Kuyencit@s escalando, con autorización de sus apoderados.' },
  { id: 'productos', pregunta: 'F13', formato: 'horizontal', pide: 'Los productos a la venta, cada uno sobre un fondo simple.' },
  { id: 'recepcion', pregunta: 'F11', formato: 'horizontal', pide: 'La recepción y la zona de descanso.' },
  { id: 'fachada', pregunta: 'F6', formato: 'horizontal', pide: 'La fachada y la entrada, para reconocer el lugar al llegar.' },
]

/**
 * Lo que falta y no es una foto para una sección: va en la lista de pendientes
 * del README, no en un recuadro dentro de la página.
 */
export const MATERIAL_PENDIENTE = [
  { pregunta: 'F3', pide: 'Los originales de la sesión de fotos de abril de 2026, con crédito de @vbizama.studio.' },
  { pregunta: 'F14', pide: 'Videos cortos del muro o de gente escalando, de 10 a 30 segundos.' },
]

/**
 * Fotos entregadas que no se usan mientras Kuyen no autorice mostrar marcas de
 * terceros. Falta: permiso para las marcas patrocinadoras (pregunta 9).
 */
export const FOTOS_EXCLUIDAS = [
  { original: 'DSC_0165.JPG', motivo: 'Se ve el lienzo de Patagonia' },
  { original: 'DSC_0330.JPG', motivo: 'Se ven Patagonia y la tarima de Red Bull' },
]

/** Jerga que Kuyen usa en sus publicaciones, para la marquesina: una lista por fila. */
export const MARQUESINA = [
  ['Pegue', 'Bloque', 'Desplome', 'Hacer sombra', 'Moonboard', 'Rutas nuevas'],
  ['Kuyencit@s', 'Proyecto', 'Encadenar', 'Seteo', 'Comunidad', 'Nos vemos en las presas'],
]

/** Textos de interfaz compartidos por las variantes. */
export const TEXTOS = {
  acciones: {
    solicitud: 'Solicitud de ingreso',
    escribenos: 'Escríbenos',
    whatsapp: 'Escríbenos por WhatsApp',
    instagram: 'Síguenos en Instagram',
    abrirMaps: 'Abrir en Google Maps',
    abrirInstagram: 'Abrir en Instagram',
  },
  // El mapa y las publicaciones se incrustan y cargan solos (22-09-2026).
  mapa: 'El mapa lo sirve Google Maps.',
  instagram: 'Las publicaciones las sirve Instagram.',
}

/**
 * Valores que circulan en publicaciones viejas, en promociones o en eventos
 * puntuales, y que Kuyen no confirmó como vigentes. Si alguno aparece en una
 * página generada, el build falla.
 *
 * La comparación la hace `apareceDatoViejo` en tools/build.mjs, que exige una
 * frontera a la izquierda: así "2.000" no salta dentro de $32.000, que sí es un
 * precio vigente.
 *
 * Salieron de esta lista, porque Kuyen los confirmó el 22-09-2026: "3.500",
 * "9.000", "10:00 a 16:00", "16:00 a 22:00" y "45.000".
 */
export const DATOS_SIN_CONFIRMAR = [
  '14:00 a 22:00',
  '2.000',
  '7.000',
  '6.000',
  '8.000',
]
