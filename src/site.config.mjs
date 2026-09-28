/**
 * Fuente única de la configuración del sitio de Kuyen Climbing.
 *
 * El 26-09-2026 Kuyen eligió Hirael entre los tres candidatos, y el sitio dejó
 * de ser una comparación: la variante propia de Hirael se sirve en la raíz del
 * dominio. Se fueron el marco con el selector, las rutas /t/<id> y las capturas
 * de los tres templates, que eran material de trabajo de terceros.
 *
 * Las variantes de NexStudio y de Karate siguen en src/variantes/ como registro
 * del trabajo, pero el build ya no las toca y nadie las mantiene. Lo publicado
 * es solo lo que sale de VARIANTE.
 *
 * Los textos y datos del negocio están en src/contenido.mjs.
 *
 * Dos sitios porque el preview sigue sirviendo para mirar un cambio antes de
 * publicarlo:
 *   - `cl`: kuyenclimbing.cl, el sitio de verdad (lleva CNAME).
 *   - `preview`: sin CNAME y sin indexar.
 */

export const HOST = 'https://kuyenclimbing.cl'

/**
 * Token de Search Console, si la propiedad se verifica con la etiqueta del
 * <head>. Google lo entrega al agregar kuyenclimbing.cl como propiedad de tipo
 * "prefijo de URL": es el `content` de su <meta name="google-site-verification">.
 *
 * Con la cadena vacía no se emite ninguna etiqueta. Si la propiedad se verifica
 * por DNS, que cubre el dominio entero y no solo esta dirección, esto se queda
 * vacío y no hace falta tocar nada.
 */
export const VERIFICACION_GOOGLE = ''

export const SITES = {
  cl: {
    id: 'cl',
    host: HOST,
    lang: 'es-CL',
    locale: 'es_CL',
    robots: 'index, follow',
    sitemap: true,
    // Kuyen confirmó el dominio el 22-09-2026 (pregunta L4) y queda a nombre de
    // Andrés Muñoz Castillo. Si termina siendo otro, se cambia acá y en el
    // archivo CNAME de la raíz.
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
 * La variante publicada. Sale del template Hirael, que Kuyen eligió el
 * 26-09-2026 entre los tres candidatos, y vive en src/variantes/hirael/ con el
 * contenido, la tipografía y los colores de Kuyen.
 *
 * `fuente` queda como crédito de dónde salió la estructura. El template en sí
 * ya no está en el repo: era material de trabajo de un tercero y se fue cuando
 * dejó de hacer falta. Sigue en el historial:
 *   git checkout 8dd4bad -- src/temas temas
 */
export const VARIANTE = {
  id: 'hirael',
  nombre: 'Hirael',
  fuente: 'https://hirael.com/embed/templates/agency-landing',
}

/** Quién desarrolló el sitio, para el crédito del pie. */
export const DESARROLLO = {
  nombre: 'INCBA',
  url: 'https://incba.cl',
}

/**
 * Topes de SEO: los puntos donde Google trunca título y descripción.
 */
export const LIMITES = { title: 60, description: 158 }
