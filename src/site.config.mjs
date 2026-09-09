/**
 * Fuente única de la configuración del sitio de Kuyen Climbing.
 *
 * Reusa el generador documentado en
 * C:\Proyectos\INCBA\docs\Flujo-Sitios-Web-GitHub-Pages.md. La plantilla y las
 * visuales son propias de Kuyen: fondo de noche, hero a pantalla completa y
 * secciones de centro de escalada. No se hereda nada de la maqueta de Isaminga
 * más allá del generador, la verificación y el flujo de publicación.
 *
 * ESTADO (09-09-2026): primera versión. El contenido sale de fuentes públicas
 * verificadas (Instagram @kuyen.climbing, ficha de Google Maps y la revista
 * Destino Temuco). Todo lo que necesita confirmación de Kuyen queda marcado
 * con el comentario POR CONFIRMAR en la sección correspondiente y listado en
 * el README.
 *
 * Dos variantes de sitio porque el dominio propio todavía no está comprado:
 *   - `cl`: el dominio definitivo (lleva CNAME y se indexa).
 *   - `preview`: kuyen-climbing.github.io, sin CNAME y con noindex, para que
 *     el cliente lo mire mientras tanto sin competirle en Google al definitivo.
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
 * Los cuatro temas del sitio, en el orden en que los cicla el ToggleTheme.
 *
 * Cada tema son los tokens visuales (color, tipografía, radio y tracking) de
 * uno de los templates candidatos, aplicados al mismo contenido de Kuyen. Las
 * definiciones viven en src/css/tailwind.css bajo `.tema-<id>`, y el toggle
 * cambia entre ellas poniendo esa clase en <html>, igual que el ToggleTheme de
 * Pagos Pendientes.
 *
 * `fuente` es el template del que salieron los tokens y las tipografías. Se
 * captura tal cual con `node tools/capturar-tema.mjs <id> <url> --render` para
 * poder comparar contra el original en /t/<id>; esa captura es material de
 * referencia de terceros, va con noindex y fuera del sitemap.
 */
export const TEMAS = [
  {
    id: 'hive',
    nombre: 'Hive',
    resumen: 'Estudio editorial: tipografía serif enorme, monocromo y mucho aire.',
    fuente: 'https://hive-nextjs-template.vercel.app/',
    credito: 'https://21st.dev/@shadcnblockscom/templates/hive',
    render: true,
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/></svg>',
    // El template monta dos escenas 3D con su propio JavaScript, que la captura
    // no reusa. Sin ese JavaScript dejan un cartel de error rojo; se saca.
    limpiar: [/<div style="text-align: center; padding: 1rem;[^"]*">[\s\S]*?<\/div>/g],
  },
  {
    id: 'karate',
    nombre: 'Karate',
    resumen: 'Academia deportiva: rojo intenso, fotos grandes, horarios y programas.',
    fuente: 'https://karateacadamy.framer.website/',
    credito: 'https://21st.dev/@dhileepkumargm/templates/karate',
    render: true,
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
  },
  {
    id: 'hirael',
    nombre: 'Hirael',
    resumen: 'Agencia contemporánea: oscuro, serif de acento y bloques de mucho contraste.',
    fuente: 'https://hirael.com/embed/templates/agency-landing',
    credito: 'https://21st.dev/@mohammadshehadeh/templates/hirael-agency-landing',
    render: true,
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>',
  },
  {
    id: 'nex',
    nombre: 'NexStudio',
    resumen: 'Estudio de producto: claro, retícula amplia, títulos grandes sin serif.',
    fuente: 'https://nexstudio.demos.tailgrids.com/',
    credito: 'https://21st.dev/@tailgrids/templates/tailgrids-nexstudio',
    render: true,
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m6.08 9.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59"/><path d="m6.08 14.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59"/></svg>',
  },
]

/**
 * Menú del sitio. Mientras todo viva en una página, son anclas de esa misma
 * página; cuando se abran las páginas internas pasan a ser rutas.
 */
export const MENU = [
  { href: '#el-muro', texto: 'El muro' },
  { href: '#clases', texto: 'Clases' },
  { href: '#visitanos', texto: 'Visítanos' },
]

/** El tema con el que se sirve la página a quien entra por primera vez. */
export const TEMA_POR_DEFECTO = 'hive'

/** Ruta pública de la captura de referencia de un template. */
export const rutaTema = (id) => `/t/${id}`

/**
 * Piso de palabras de contenido por página. Bajo mientras el contenido es
 * borrador; subir a 300-450 cuando Kuyen confirme los textos.
 */
export const MINIMO_PALABRAS_DEFAULT = 120

/**
 * Topes de SEO: los puntos donde Google trunca título y descripción.
 */
export const LIMITES = { title: 60, description: 158 }

/**
 * Páginas del sitio. Cada una lista las secciones de src/sections/ que la
 * componen, en orden, y lleva exactamente un <h1>.
 *
 * El sitio es de una sola página por ahora: el contenido todavía es el que se
 * pudo verificar de fuentes públicas. Cuando Kuyen confirme textos, horarios y
 * precios se abren las páginas internas (el muro, clases, precios, cómo
 * llegar), que hoy son anclas de esta misma página.
 */
export const PAGES = [
  {
    slug: '',
    title: 'Kuyen Climbing | Escalada en Padre Las Casas',
    description:
      'Centro de escalada en boulder en Padre Las Casas: desplomes hasta 25 grados, moonboard y clases guiadas. Los Patagones 375.',
    nav: null,
    breadcrumb: null,
    sections: ['hero', 'el-muro', 'clases', 'comunidad', 'visitanos'],
  },
]
