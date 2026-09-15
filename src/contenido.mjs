/**
 * Contenido de Kuyen Climbing: todos los textos y datos del sitio, sin HTML.
 *
 * Las variantes de /t/<id> leen de este módulo, así que un dato se corrige en
 * un solo lugar. Todo sale de fuentes públicas de Kuyen (Instagram, ficha de
 * Google Maps, Linktree y su formulario de solicitud de ingreso), revisadas el
 * 14-09-2026.
 *
 * Lo que Kuyen no confirmó lleva POR_CONFIRMAR y un comentario "Falta:" con lo
 * que hay que preguntar. El build falla si un horario o un precio tiene otro
 * valor, y si en el sitio aparece alguno de DATOS_SIN_CONFIRMAR.
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
    'Centro de escalada técnica en boulder en Padre Las Casas, La Araucanía: desplomes hasta 25°, moonboard, clases guiadas y comunidad.',
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
  // Solo se carga cuando la persona hace clic en "Ver mapa": al abrir la página
  // no se pide nada a Google.
  mapaEmbebido: 'https://www.google.com/maps?q=-38.7605438,-72.5918641&z=16&output=embed',
}

export const CONTACTO = {
  telefono: '+56 9 3502 8838',
  telefonoE164: '+56935028838',
  whatsapp: 'https://wa.me/56935028838',
  instagram: 'https://www.instagram.com/kuyen.climbing/',
  instagramUsuario: '@kuyen.climbing',
  // En todas sus publicaciones piden escribir por mensaje directo.
  canalHabitual: 'Mensaje directo de Instagram',
  // Falta: correo de contacto para el sitio, o confirmar que el contacto es solo
  // por mensaje directo y WhatsApp (pregunta 6).
  correo: POR_CONFIRMAR,
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
}

/** Cifras confirmadas, con su fuente. `valor` es numérico cuando se puede animar. */
export const CIFRAS = [
  { id: 'rutas', valor: 500, sufijo: '+', etiqueta: 'rutas creadas', fuente: 'Instagram, 24-05-2025' },
  { id: 'desplome', valor: 25, sufijo: '°', etiqueta: 'de desplome continuo', fuente: 'Reseñas de Google' },
  { id: 'google', valor: '5,0', sufijo: '', etiqueta: 'en Google, con 14 reseñas', fuente: 'Google Maps, 14-09-2026' },
  { id: 'anios', valor: 3, sufijo: '', etiqueta: 'años de comunidad', fuente: 'Tercer aniversario, 16-05-2026' },
]

export const MURO = {
  resumen: 'Muro de boulder: bloques sin cuerda, sobre colchonetas, para todos los niveles.',
  caracteristicas: [
    {
      id: 'desplome',
      titulo: 'Desplomes hasta 25°',
      texto: 'Un muro de boulder con desplomes continuos de hasta 25 grados.',
    },
    {
      id: 'moonboard',
      titulo: 'Moonboard',
      texto: 'Tablero de entrenamiento con bloques que se comparten en la app Moon Climbing.',
    },
    {
      id: 'rutas',
      titulo: 'Rutas nuevas',
      texto: 'Más de 500 rutas creadas hasta mayo de 2025, y rutas nuevas de forma periódica.',
    },
    {
      id: 'sombra',
      titulo: 'Hacer sombra',
      texto: 'Hacemos sombra a toda persona que escala: cuidar al compañero es la ley primera en Kuyen.',
    },
  ],
  // Proceso de renovación mostrado en Instagram (septiembre de 2025).
  renovacion: 'Sacamos las presas, las lavamos, instalamos volúmenes y armamos rutas nuevas.',
}

export const SERVICIOS = [
  {
    id: 'escalada-libre',
    nombre: 'Escalada libre',
    resumen: 'Boulder para todos los niveles, desde principiantes hasta escaladores con experiencia.',
    detalles: [
      'Dos tramos: horario bajo y horario normal.',
      'Mensualidad de escalada libre.',
      'Se paga al ingresar y se escala con calzado.',
    ],
    // Falta: si arriendan pies de gato y venden magnesio, y a qué valor (pregunta 5).
    equipo: POR_CONFIRMAR,
  },
  {
    id: 'clases',
    nombre: 'Clases guiadas',
    resumen: 'Desde marzo de 2026: un plan de 8 clases al mes, 2 veces por semana.',
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
    // Falta: días y horarios, cupos y quién las dicta (pregunta 4).
    dias: POR_CONFIRMAR,
    cupos: POR_CONFIRMAR,
    profesor: POR_CONFIRMAR,
  },
  {
    id: 'kuyencitos',
    nombre: 'Kuyencit@s',
    resumen: 'El programa de escalada para niñas y niños.',
    // Falta: edades, días, horario y valor del programa (pregunta 3).
    edades: POR_CONFIRMAR,
    dias: POR_CONFIRMAR,
  },
  {
    id: 'talleres',
    nombre: 'Talleres y mediciones',
    resumen: 'Talleres de routesetting y mediciones de fuerza de dedos para ver tu progreso.',
  },
]

/**
 * Horarios. Kuyen trabaja con un horario bajo (mañana y primera tarde) y un
 * horario normal (tarde y noche), pero las fuentes públicas no coinciden en las
 * horas.
 * Falta: horario vigente por día, con los dos tramos, y fines de semana (pregunta 1).
 */
export const HORARIOS = {
  tramos: [
    { id: 'bajo', nombre: 'Horario bajo', descripcion: 'Menos frío, menos gente, más muro para ti.', dias: POR_CONFIRMAR, horas: POR_CONFIRMAR },
    { id: 'normal', nombre: 'Horario normal', descripcion: 'Tarde y noche.', dias: POR_CONFIRMAR, horas: POR_CONFIRMAR },
  ],
  semana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia) => ({
    dia,
    horas: POR_CONFIRMAR,
    tramo: POR_CONFIRMAR,
  })),
}

/**
 * Precios. Ninguno está confirmado como tarifa vigente.
 * Falta: valores vigentes y si sigue el descuento del primer mes de clases (pregunta 2).
 */
export const PRECIOS = [
  { id: 'pase-bajo', nombre: 'Pase diario, horario bajo', detalle: 'Escalada libre', valor: POR_CONFIRMAR },
  { id: 'pase-normal', nombre: 'Pase diario, horario normal', detalle: 'Escalada libre', valor: POR_CONFIRMAR },
  { id: 'mensualidad', nombre: 'Mensualidad de escalada libre', detalle: 'Todo el mes', valor: POR_CONFIRMAR },
  { id: 'clases', nombre: 'Plan de clases guiadas', detalle: '8 clases al mes, 2 veces por semana', valor: POR_CONFIRMAR },
  { id: 'kuyencitos', nombre: 'Kuyencit@s', detalle: 'Programa infantil', valor: POR_CONFIRMAR },
]

export const COMUNIDAD = {
  resumen: 'La comunidad es el centro de Kuyen: competencias, encuentros, talleres, celebraciones y sorteos.',
  publico: 'Desde principiantes hasta escaladores con años de muro, con programa infantil y foco en la escalada femenina.',
  inclusion: 'En Google, Kuyen figura como espacio amigable con LGBTQ+.',
  anuncios: 'Las fechas y novedades se anuncian en Instagram.',
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

export const SOLICITUD = {
  titulo: 'Solicitud de ingreso',
  url: LINKS.solicitudIngreso,
  resumen:
    'Antes de tu primera visita, completa la solicitud de ingreso: confirmas que leíste el reglamento y dejas un contacto de emergencia.',
  // Texto de bienvenida del formulario, tal cual.
  bienvenida:
    '¡Bienvenid@s a Kuyen Climbing! Esto es una pequeña solicitud, de que la persona está de acuerdo con nuestros reglamentos, a la vez proporcionarnos cierta información en caso de emergencia, para así tener una mejor convivencia, poder cuidarnos entre todos y practicar el deporte que nos gusta.',
}

export const PANCITA = {
  nombre: 'Pancita',
  descripcion: 'Nuestra jefa de seguridad, vigilante y dueña absoluta del muro.',
}

/**
 * Testimonios.
 * Falta: los textos de las reseñas y el permiso de cada persona para publicarlas
 * con su nombre.
 */
export const TESTIMONIOS = [1, 2, 3, 4, 5].map((n) => ({
  id: `testimonio-${n}`,
  cita: POR_CONFIRMAR,
  autor: POR_CONFIRMAR,
  detalle: POR_CONFIRMAR,
}))

/**
 * Fotos entregadas por Kuyen. Las genera `node tools/assets.mjs fotos` en
 * img/fotos/<id>-<ancho>.webp, con la orientación EXIF aplicada.
 * Falta: crédito del fotógrafo de cada foto (pregunta 10).
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
].map((foto) => ({ ...foto, anchos: [1600, 1200, 800], credito: POR_CONFIRMAR }))

/**
 * Fotos entregadas que no se usan mientras Kuyen no autorice mostrar marcas de
 * terceros. Falta: permiso para las marcas patrocinadoras (pregunta 9).
 */
export const FOTOS_EXCLUIDAS = [
  { original: 'DSC_0165.JPG', motivo: 'Se ve el lienzo de Patagonia' },
  { original: 'DSC_0330.JPG', motivo: 'Se ven Patagonia y la tarima de Red Bull' },
]

/** Palabras de la marquesina, en lugar de logos de marcas. */
export const MARQUESINA = ['Boulder', 'Moonboard', 'Comunidad', 'Hacer sombra', 'Rutas nuevas', 'Kuyencit@s']

/** Textos de interfaz compartidos por las variantes. */
export const TEXTOS = {
  acciones: {
    solicitud: 'Solicitud de ingreso',
    escribenos: 'Escríbenos',
    whatsapp: 'Escríbenos por WhatsApp',
    instagram: 'Síguenos en Instagram',
    verMapa: 'Ver mapa',
    abrirMaps: 'Abrir en Google Maps',
  },
  mapa: 'El mapa se carga desde Google Maps al hacer clic.',
}

/**
 * Valores que circulan en publicaciones viejas, en promociones o en eventos
 * puntuales, y que Kuyen no confirmó como vigentes. Si alguno aparece en una
 * página generada, el build falla.
 */
export const DATOS_SIN_CONFIRMAR = [
  '16:00 a 22:00',
  '14:00 a 22:00',
  '10:00 a 16:00',
  '3.500',
  '2.000',
  '45.000',
  '9.000',
  '7.000',
  '6.000',
  '8.000',
]
