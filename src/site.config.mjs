/**
 * Fuente única de la configuración del sitio de Kuyen Climbing.
 *
 * Etapa actual: los cuatro templates candidatos servidos tal cual, cada uno en
 * /t/<id>, y un marco en la raíz que muestra el activo a pantalla completa con
 * el ToggleTheme encima. Los templates no se adaptan todavía: eso viene
 * después, cuando se elija uno.
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
    // POR CONFIRMAR: el dominio no está comprado. Si termina siendo otro,
    // se cambia acá y en el archivo CNAME de la raíz.
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
 * Datos del negocio verificados el 09-09-2026. Los usan los partials, las
 * secciones y los datos estructurados, para tener un solo lugar donde
 * corregirlos.
 */
export const NEGOCIO = {
  nombre: 'Kuyen Climbing',
  calle: 'Los Patagones 375',
  comuna: 'Padre Las Casas',
  region: 'La Araucanía',
  codigoPostal: '4850000',
  lat: -38.7605438,
  lng: -72.5918641,
  // Ficha de Google Maps y perfil de Instagram.
  telefono: '+56 9 3502 8838',
  telefonoE164: '+56935028838',
  whatsapp: 'https://wa.me/56935028838',
  instagram: 'https://www.instagram.com/kuyen.climbing/',
  instagramUser: '@kuyen.climbing',
  maps: 'https://maps.app.goo.gl/v9F89L5peqFyxcJc9',
  // POR CONFIRMAR: Kuyen no publica correo. Mientras tanto el sitio contacta
  // por WhatsApp e Instagram, que son los canales que sí usa.
  correo: null,
}

/**
 * Los cuatro templates candidatos, en el orden en que los cicla el ToggleTheme.
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
    id: 'hive',
    nombre: 'Hive',
    resumen: 'Estudio editorial: tipografía serif enorme, monocromo y mucho aire.',
    fuente: 'https://hive-nextjs-template.vercel.app/',
    credito: 'https://21st.dev/@shadcnblockscom/templates/hive',
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/></svg>',
  },
  {
    id: 'karate',
    nombre: 'Karate',
    resumen: 'Academia deportiva: rojo intenso, fotos grandes, horarios y programas.',
    fuente: 'https://karateacadamy.framer.website/',
    credito: 'https://21st.dev/@dhileepkumargm/templates/karate',
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
  },
  {
    id: 'hirael',
    nombre: 'Hirael',
    resumen: 'Agencia contemporánea: oscuro, serif de acento y bloques de mucho contraste.',
    fuente: 'https://hirael.com/embed/templates/agency-landing',
    credito: 'https://21st.dev/@mohammadshehadeh/templates/hirael-agency-landing',
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>',
  },
  {
    id: 'nex',
    nombre: 'NexStudio',
    resumen: 'Estudio de producto: claro, retícula amplia, títulos grandes sin serif.',
    fuente: 'https://nexstudio.demos.tailgrids.com/',
    credito: 'https://21st.dev/@tailgrids/templates/tailgrids-nexstudio',
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m6.08 9.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59"/><path d="m6.08 14.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59"/></svg>',
  },
]

/** El template que se muestra a quien entra por primera vez. */
export const TEMA_POR_DEFECTO = 'hive'

/** Ruta pública de un template. */
export const rutaTema = (id) => `/t/${id}`

/**
 * Topes de SEO: los puntos donde Google trunca título y descripción.
 */
export const LIMITES = { title: 60, description: 158 }

/** Metadatos del marco, la única página propia por ahora. */
export const PAGINA = {
  title: 'Kuyen Climbing | Templates candidatos',
  description:
    'Los cuatro templates candidatos para el sitio de Kuyen Climbing, servidos tal cual, con un selector para pasar de uno al siguiente.',
}
