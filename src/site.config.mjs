/**
 * Fuente única de la configuración del sitio de Kuyen Climbing.
 *
 * Etapa de contenido (15-09-2026): cada template de TEMAS pasa a tener una
 * variante propia en src/variantes/<id>/, con el contenido, la tipografía y los
 * colores de Kuyen y la estructura del template. Mientras un template no tenga
 * variante, /t/<id> sirve su captura tal cual. El marco de la raíz muestra el
 * activo a pantalla completa con el ToggleTheme encima.
 *
 * Los textos y datos del negocio están en src/contenido.mjs.
 *
 * Dos variantes de sitio porque el dominio propio todavía no está comprado:
 *   - `cl`: el dominio definitivo (lleva CNAME).
 *   - `preview`: kuyen-climbing.github.io, sin CNAME y con noindex, para que
 *     el cliente lo mire mientras tanto.
 */

export const HOST = 'https://kuyenclimbing.cl'

export const SITES = {
  cl: {
    id: 'cl',
    host: HOST,
    lang: 'es-CL',
    locale: 'es_CL',
    addressCountry: 'CL',
    robots: 'index, follow',
    sitemap: true,
    // Kuyen confirmó el dominio el 22-09-2026 (pregunta L4) y queda a nombre de
    // Andrés Muñoz Castillo. Falta comprarlo; si termina siendo otro, se cambia
    // acá y en el archivo CNAME de la raíz.
    cname: 'kuyenclimbing.cl',
  },
  preview: {
    id: 'preview',
    host: 'https://kuyen-climbing.github.io',
    lang: 'es-CL',
    locale: 'es_CL',
    addressCountry: 'CL',
    robots: 'noindex, nofollow',
    sitemap: false,
    cname: null,
  },
}

/**
 * Los tres templates candidatos, en el orden en que los cicla el ToggleTheme.
 *
 * Hive salió de los candidatos el 14-09-2026 (pedido de Benjamín). Su captura
 * y su ajuste siguen en el historial: git checkout 3ba77fb -- src/temas/hive temas/hive
 *
 * Cada uno se sirve tal cual: el HTML capturado en src/temas/<id>/pagina.html
 * con sus propios estilos, scripts y assets bajo temas/<id>/. Se capturan con
 * `node --experimental-websocket tools/capturar-tema.mjs <id> <url>`.
 *
 * OJO: son templates comerciales de terceros. Están acá como material de
 * trabajo para elegir dirección visual, van con noindex y se reemplazan por
 * markup y assets propios de Kuyen cuando se elija uno.
 */
export const TEMAS = [
  {
    id: 'karate',
    nombre: 'Karate',
    resumen: 'Academia deportiva: rojo intenso, fotos grandes, horarios y programas.',
    fuente: 'https://karateacadamy.framer.website/',
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
    // Sin la sección "Built different. Training different." (pedido de Camilo,
    // 10-09-2026). Karate es Framer y se hidrata con React: sacar el bloque del
    // HTML dejaría a React sin el nodo que espera. Se oculta con CSS el bloque
    // entero, que Framer llama "Built Steps" (etiqueta, título, texto, "Meet the
    // team" y las tarjetas), y la sección siguiente sube a su lugar.
    ajustes: {
      css: '[data-framer-name="Built Steps"]{display:none!important}',
      ocultar: 'Built different.',
      contiguos: ['Feature Section', 'Schedule'],
    },
  },
  {
    id: 'hirael',
    nombre: 'Hirael',
    resumen: 'Agencia contemporánea: oscuro, serif de acento y bloques de mucho contraste.',
    fuente: 'https://hirael.com/embed/templates/agency-landing',
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>',
  },
  {
    id: 'nex',
    nombre: 'NexStudio',
    resumen: 'Estudio de producto: claro, retícula amplia, títulos grandes sin serif.',
    fuente: 'https://nexstudio.demos.tailgrids.com/',
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m6.08 9.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59"/><path d="m6.08 14.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59"/></svg>',
  },
]

/** El template que se muestra a quien entra por primera vez. */
export const TEMA_POR_DEFECTO = 'karate'

/** Ruta pública de un template: su variante propia o, mientras no exista, su captura. */
export const rutaTema = (id) => `/t/${id}`

/** Ruta de la captura original de un template. Solo existe en npm run dev. */
export const rutaReferencia = (id) => `/ref/${id}`

/**
 * Topes de SEO: los puntos donde Google trunca título y descripción.
 */
export const LIMITES = { title: 60, description: 158 }

/** Metadatos del marco, la única página propia por ahora. */
export const PAGINA = {
  title: 'Kuyen Climbing | Templates candidatos',
  description:
    'Los tres templates candidatos para el sitio de Kuyen Climbing, servidos tal cual, con un selector para pasar de uno al siguiente.',
}
