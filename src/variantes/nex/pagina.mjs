/**
 * Variante NexStudio: la estructura del template NexStudio con el contenido, la
 * tipografía y los colores de Kuyen.
 *
 * Sigue la ficha de estructura de la fase 0, sección por sección:
 *   0  Cabecera arriba que cambia al bajar, con menú Menú y Cerrar.
 *   1  Hero centrado: título con un tramo destacado, párrafo y dos botones.
 *   2  Marquesina y portada a lo ancho.
 *   3  Banda oscura: título, dos párrafos y dos cifras que suben.
 *   4  Por qué: cuatro características con ícono.
 *   5  Servicios: lista #1 a #4.
 *   6  Proyectos: banda redondeada con dos tarjetas y botón.
 *   7  Reseñas: título, flechas y carrusel.
 *   8  Blog: dos entradas con imagen 16:9.
 *   9  Llamado: título y botón en mitades.
 *   10 Pie con cuatro columnas, marca en contorno y enlaces al pie.
 *
 * Secciones agregadas con componentes del mismo template (decisión del
 * 15-09-2026): "Horarios y valores" y "Reglamento" con la lista de Servicios, y
 * "Visítanos" con el llamado y la portada.
 *
 * Diferencias con el template:
 * - Toda la página va de noche, con títulos en Rubik Dirt y acento amarillo luna.
 *   El tramo en itálica de los títulos pasa a color, porque Rubik Dirt no tiene
 *   itálica, y las etiquetas monoespaciadas pasan a Rubik en mayúsculas.
 * - La apertura (hero, marquesina y portada) comparte el cielo del logo: estrellas
 *   que titilan, la luna en el medio sobre el título, los pernos del muro que se
 *   iluminan donde apunta el mouse, como con una linterna frontal, presas que
 *   flotan, rastro de tiza y entrada orquestada. La cordillera con los gatos
 *   asoma chica detrás de la portada, a la izquierda, y la portada se abre a lo
 *   ancho al bajar.
 * - La cabecera queda fija arriba (pedido del 15-09-2026).
 * - La marquesina lleva la jerga del muro en vez de logos de clientes.
 * - Las reseñas quedan [POR CONFIRMAR] hasta tener textos y permisos.
 * - El blog pasa a próximos eventos, y en móvil la portada es más alta que en el
 *   template para que se vea el muro.
 */
import { cielo, luna, cordillera, presa, titulo, marquesina } from '../../compartido/escena.mjs'

const ICONOS = {
  flecha:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  flechaAtras:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  // Estrella de cuatro puntas, como las del cielo del logo.
  estrella:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1c.9 6.6 4.4 10.1 11 11-6.6.9-10.1 4.4-11 11-.9-6.6-4.4-10.1-11-11 6.6-.9 10.1-4.4 11-11z"/></svg>',
  // Íconos de las características del muro, dibujados para el sitio.
  desplome:
    '<svg viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 49h44"/><path d="M19 49 34 7"/><path d="M30 49a11 11 0 0 0-7.3-10.4"/><circle cx="26.5" cy="29" r="2.6" fill="currentColor"/><circle cx="31" cy="16" r="2.6" fill="currentColor"/></svg>',
  moonboard:
    '<svg viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="11" y="5" width="34" height="46" rx="3"/><g fill="currentColor" stroke="none"><circle cx="19" cy="14" r="2.4"/><circle cx="37" cy="20" r="2.4"/><circle cx="28" cy="28" r="2.4"/><circle cx="19" cy="36" r="2.4"/><circle cx="36" cy="43" r="2.4"/></g></svg>',
  rutas:
    '<svg viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 48c7-4 3-11 10-15s12 2 15-5 1-11 6-15" stroke-dasharray="4 5"/><circle cx="12" cy="48" r="3.2" fill="currentColor"/><path d="M45 3c.5 3.6 2.4 5.5 6 6-3.6.5-5.5 2.4-6 6-.5-3.6-2.4-5.5-6-6 3.6-.5 5.5-2.4 6-6z" fill="currentColor" stroke="none"/></svg>',
  sombra:
    '<svg viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="28" cy="11" r="5.5"/><path d="M28 17v13M28 21l-9-6M28 21l9-6"/><path d="M8 51c1-8 5-12 10-12l4 5M48 51c-1-8-5-12-10-12l-4 5"/></svg>',
}

// Foto de cada evento y cada competencia: van a Instagram, donde Kuyen publica el detalle.
const FOTO_EVENTO = {
  'encuentro-femenino': 'escaladora-desplome',
  'taller-routesetting': 'escalador-desplome-amarillo',
  'aniversario-3': 'joven-escalando',
  'competencia-escolar': 'nino-escalando',
}

export default function pagina({ site, contenido, esc, foto, cabeza, leer, compartido }) {
  const {
    POR_CONFIRMAR,
    MARCA,
    UBICACION,
    CONTACTO,
    LINKS,
    HISTORIA,
    CIFRAS,
    MURO,
    SERVICIOS,
    HORARIOS,
    PRECIOS,
    COMUNIDAD,
    EVENTOS,
    REGLAMENTO,
    SOLICITUD,
    TESTIMONIOS,
    MARQUESINA,
    TEXTOS,
  } = contenido

  const externo = ' target="_blank" rel="noopener"'
  const retraso = (ms) => (ms ? ` style="--m-retraso: ${ms}ms"` : '')
  const cifra = (id) => CIFRAS.find((c) => c.id === id)
  const servicio = (id) => SERVICIOS.find((s) => s.id === id)
  const acento = (texto) => ({ texto, clase: 'm-acento' })

  /** Dato que Kuyen no confirmó: visible en la página y comentado en el código. */
  const pendiente = (falta) => `<!-- POR CONFIRMAR: ${falta} --><span class="pendiente">${POR_CONFIRMAR}</span>`

  /** Texto que rueda hacia arriba en hover: la segunda copia es solo visual. */
  const rueda = (texto) => `<span class="rueda"><span>${esc(texto)}</span><span aria-hidden="true">${esc(texto)}</span></span>`

  /** Botón píldora en mayúsculas, con flecha opcional. */
  const boton = ({ texto, href, variante = 'primario', afuera = false, flecha = false, clase = '', extra = '' }) =>
    `<a class="boton boton--${variante}${clase ? ` ${clase}` : ''}" href="${esc(href)}"${afuera ? externo : ''}${extra}>${rueda(texto)}${flecha ? ICONOS.flecha : ''}</a>`

  const enlacesMenu = [
    ['#kuyen', 'Kuyen'],
    ['#muro', 'El muro'],
    ['#servicios', 'Servicios'],
    ['#visitanos', 'Visítanos'],
  ]

  const enlacePie = (href, texto, afuera = false) => `<li><a href="${esc(href)}"${afuera ? externo : ''}>${esc(texto)}</a></li>`

  // "Tu espacio seguro de escalada", con "de escalada" destacado.
  const [inicioFrase, finFrase] = MARCA.frases.espacioSeguro.split(' de ')
  // "Un proyecto hecho por escaladores para escaladores", con el final destacado.
  const [inicioLema, finLema] = MARCA.lema.split(' para ')

  const rutas = cifra('rutas')
  const anios = cifra('anios')
  // Kuyen publica el detalle de sus eventos en Instagram. `proximo` se revisa a mano después del 03-10-2026.
  const proximos = EVENTOS.filter((e) => e.proximo).slice(0, 2)
  const competencias = ['aniversario-3', 'competencia-escolar'].map((id) => EVENTOS.find((e) => e.id === id))

  const textoServicio = {
    'escalada-libre': `${esc(servicio('escalada-libre').resumen)} ${esc(servicio('escalada-libre').detalles[0])}`,
    clases: `${esc(servicio('clases').resumen)} Días y horarios: ${pendiente('días, horarios y cupos de las clases guiadas (pregunta 4)')}`,
    kuyencitos: `${esc(servicio('kuyencitos').resumen)} Edades, días y valor: ${pendiente('edades, días, horario y valor de Kuyencit@s (pregunta 3)')}`,
    talleres: esc(servicio('talleres').resumen),
  }

  return `<!DOCTYPE html>
<html lang="${site.lang}">
${cabeza({ estilos: `${compartido('movimiento.css')}\n${leer('estilos.css')}` })}
<body>
  <script>document.documentElement.classList.add('m-js')</script>
  <a class="saltar" href="#contenido">Saltar al contenido</a>

  <header class="cabecera" data-cabecera>
    <nav class="contenedor cabecera__barra" aria-label="Principal">
      <a class="marca" href="#contenido" aria-label="${esc(MARCA.nombre)}, inicio">
        <img class="marca__isotipo" src="/img/marca/isotipo-256.webp" width="256" height="256" alt="">
        <span class="marca__nombre">${esc(MARCA.nombreLogo)}</span>
      </a>
      <ul class="cabecera__enlaces">
        ${enlacesMenu.map(([href, texto]) => `<li><a href="${href}">${rueda(texto)}</a></li>`).join('\n        ')}
      </ul>
      <div class="cabecera__acciones">
        ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true, clase: 'boton--cabecera' })}
        <button type="button" class="cabecera__menu" aria-expanded="false" aria-controls="menu-movil" data-menu-abrir><span data-menu-texto>Menú</span></button>
      </div>
    </nav>
    <div class="menu" id="menu-movil" data-menu inert>
      <nav class="contenedor menu__enlaces" aria-label="Menú">
        ${enlacesMenu.map(([href, texto]) => `<a href="${href}">${esc(texto)}</a>`).join('\n        ')}
        ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true, flecha: true })}
      </nav>
    </div>
  </header>

  <div class="apertura tono-gradiente" data-m-puntero data-m-entrada data-m-tiza="255,255,255|247,231,180|201,185,240">
    ${cielo({ estrellas: 70, semilla: 211, alto: 62 })}
    <div class="apertura__pernos" aria-hidden="true"></div>

    <section class="hero" id="contenido" tabindex="-1">
      <div class="contenedor">
        <div class="hero__interior">
          ${luna({ clase: 'hero__luna m-entra-sube', paralaje: -0.12, prof: 14, tamanos: '(min-width: 1024px) 9rem, 6rem' })}
          <h1 class="hero__titulo" data-m-revelar style="--m-retraso: 250ms">${titulo([[inicioFrase, acento(`de ${finFrase}`)]])}</h1>
          <p class="hero__texto" data-m-aparece style="--m-retraso: 750ms">${esc(MARCA.bio)} Muro de boulder en ${esc(UBICACION.comuna)}, ${esc(UBICACION.region)}.</p>
          <div class="hero__acciones" data-m-aparece style="--m-retraso: 900ms">
            ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true, flecha: true, extra: ' data-m-iman' })}
            ${boton({ texto: TEXTOS.acciones.escribenos, href: CONTACTO.whatsapp, afuera: true, variante: 'borde' })}
          </div>
        </div>
      </div>
      ${presa({ forma: 'canto', color: 'var(--kuyen-luna)', clase: 'm-entra-escala hero__presa--escritorio', x: 9, y: 24, tam: 7, prof: 40, paralaje: 0.22, giro: 14, retraso: 1100, duracion: 9 })}
      ${presa({ forma: 'roma', color: 'var(--kuyen-lila)', clase: 'm-entra-escala hero__presa--escritorio', x: 83, y: 12, tam: 8, prof: 26, paralaje: 0.12, giro: -18, retraso: 1250, duracion: 11 })}
      ${presa({ forma: 'pinza', color: 'var(--kuyen-blanco)', clase: 'm-entra-escala hero__presa--escritorio', x: 17, y: 68, tam: 4.5, prof: 60, paralaje: 0.34, giro: -10, retraso: 1400, duracion: 7 })}
      ${presa({ forma: 'regleta', color: 'var(--kuyen-luna)', clase: 'm-entra-escala hero__presa--escritorio', x: 78, y: 66, tam: 6, prof: 50, paralaje: 0.28, giro: 20, retraso: 1500, duracion: 8 })}
      ${presa({ forma: 'volumen', color: 'var(--kuyen-lila)', clase: 'm-entra-escala hero__presa--escritorio', x: 3, y: 50, tam: 4.5, prof: 34, paralaje: 0.18, giro: 30, retraso: 1200, duracion: 10 })}
      ${presa({ forma: 'pinza', color: 'var(--kuyen-blanco)', clase: 'm-entra-escala hero__presa--movil', x: 12, y: 5, tam: 9, prof: 0, paralaje: 0.2, giro: -10, retraso: 1100, duracion: 7 })}
      ${presa({ forma: 'canto', color: 'var(--kuyen-luna)', clase: 'm-entra-escala hero__presa--movil', x: 77, y: 3, tam: 11, prof: 0, paralaje: 0.14, giro: 14, retraso: 1250, duracion: 9 })}
    </section>

    ${marquesina([MARQUESINA.flat()], { clase: 'marquesina' })}

    <div class="portada">
      <div class="portada__interior">
        ${cordillera({ clase: 'portada__cordillera m-entra-sube', paralaje: -0.06, prof: 10, tamanos: '(min-width: 1024px) 24vw, 50vw' })}
        <div class="portada__foto" data-m-progreso="0.35">
          ${foto('escalador-muro-blanco', { tamanos: '(min-width: 1440px) 1392px, 100vw' })}
        </div>
      </div>
    </div>
  </div>

  <main>
    <section class="banda tono-oscuro" id="kuyen">
      <div class="contenedor banda__interior">
        <h2 class="titulo-seccion banda__titulo" data-m-revelar>${titulo([[inicioLema, acento(`para ${finLema}`)]])}</h2>
        <div class="banda__texto">
          <p class="banda__destacado" data-m-aparece>${esc(MARCA.significado)} ${esc(MARCA.definicion)} en ${esc(UBICACION.comuna)}, abierto desde ${HISTORIA.desde}.</p>
          <p class="banda__parrafo" data-m-aparece style="--m-retraso: 120ms"><span>${esc(COMUNIDAD.publico.split(', con ')[0])}</span>, con ${esc(COMUNIDAD.publico.split(', con ')[1])}</p>
          <div class="banda__cifras" data-m-cifras>
            ${[rutas, anios]
              .map(
                (c, n) => `<div class="banda__cifra" data-m-aparece${retraso(200 + n * 120)}>
              <p class="banda__numero" data-m-contar="${c.valor}" data-m-decimales="0" data-m-sufijo="${esc(c.sufijo)}">${c.valor}${esc(c.sufijo)}</p>
              <p class="banda__rotulo">${esc(c.etiqueta)}</p>
            </div>`
              )
              .join('\n            ')}
          </div>
        </div>
      </div>
    </section>

    <section class="seccion tono-oscuro tono-noche" id="muro">
      <div class="contenedor">
        <h2 class="titulo-seccion porque__titulo" data-m-revelar>${titulo([['Por qué escalar', acento('en Kuyen')]])}</h2>
        <div class="porque">
          ${MURO.caracteristicas
            .map(
              (c, n) => `<article class="porque__item" data-m-aparece${retraso(n * 120)}>
            ${ICONOS[c.id]}
            <h3 class="porque__nombre">${esc(c.titulo)}</h3>
            <p class="porque__texto">${esc(c.texto)}</p>
          </article>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>

    <section class="seccion tono-oscuro tono-noche" id="servicios">
      <div class="contenedor">
        <h2 class="titulo-seccion lista__titulo" data-m-revelar>${titulo([['Nuestros', acento('servicios')]])}</h2>
        <ul class="lista">
          ${SERVICIOS.map(
            (s, n) => `<li class="lista__item" data-m-aparece${retraso(n * 90)}>
            <span class="lista__marca">#${n + 1}</span>
            <h3 class="lista__nombre">${esc(s.nombre)}</h3>
            <p class="lista__texto">${textoServicio[s.id]}</p>
          </li>`
          ).join('\n          ')}
        </ul>
      </div>
    </section>

    <section class="seccion tono-oscuro" id="horarios">
      <div class="contenedor">
        <div class="lista__cabeza">
          <h2 class="titulo-seccion" data-m-revelar>${titulo([['Horarios y', acento('valores')]])}</h2>
          <p class="lista__bajada" data-m-aparece>Se paga al ingresar. Para cualquier duda, <a class="enlace" href="${esc(CONTACTO.whatsapp)}"${externo}>escríbenos por WhatsApp</a>.</p>
        </div>
        <ul class="lista">
          ${HORARIOS.tramos
            .map(
              (tramo, n) => `<li class="lista__item" data-m-aparece${retraso(n * 90)}>
            <span class="lista__marca">Tramo</span>
            <h3 class="lista__nombre">${esc(tramo.nombre)}</h3>
            <p class="lista__texto">${esc(tramo.descripcion)} Días y horas: ${pendiente(`días y horas del ${tramo.nombre.toLowerCase()} (pregunta 1)`)}</p>
          </li>`
            )
            .join('\n          ')}
          ${PRECIOS.map(
            (precio, n) => `<li class="lista__item" data-m-aparece${retraso((n + 2) * 90)}>
            <span class="lista__marca">Valor</span>
            <h3 class="lista__nombre">${esc(precio.nombre)}</h3>
            <p class="lista__texto">${esc(precio.detalle)}. Valor: ${pendiente(`valor de ${precio.nombre.toLowerCase()} (pregunta 2)`)}</p>
          </li>`
          ).join('\n          ')}
        </ul>
      </div>
    </section>

    <section class="seccion proyectos tono-gradiente" id="competencias">
      <div class="contenedor">
        <h2 class="titulo-seccion proyectos__titulo" data-m-revelar>${titulo([['Competencias y', acento('encuentros')]])}</h2>
        <div class="proyectos__grilla">
          ${competencias
            .map(
              (e, n) => `<article class="proyecto">
            <h3 class="proyecto__titulo" data-m-aparece${retraso(n * 120)}><a href="${esc(CONTACTO.instagram)}"${externo}>${esc(e.nombre)}</a></h3>
            <div class="proyecto__meta" data-m-aparece${retraso(n * 120 + 80)}><span>${esc(e.formato || e.tipo)}</span><span>${esc(e.fechaTexto)}</span></div>
            <a class="proyecto__foto m-foto m-foto--zoom" href="${esc(CONTACTO.instagram)}"${externo}${retraso(n * 120 + 150)} aria-label="${esc(e.nombre)} en Instagram">
              ${foto(FOTO_EVENTO[e.id], { tamanos: '(min-width: 640px) 45vw, 100vw' })}
            </a>
          </article>`
            )
            .join('\n          ')}
        </div>
        <div data-m-aparece>
          ${boton({ texto: 'Ver más en Instagram', href: CONTACTO.instagram, afuera: true, variante: 'claro', flecha: true })}
        </div>
      </div>
    </section>

    <section class="seccion tono-oscuro tono-noche resenas" id="comunidad" data-carrusel-zona>
      <div class="resenas__interior">
        <div class="resenas__fila">
          <div class="resenas__cabeza">
            <h2 class="titulo-seccion resenas__titulo" data-m-revelar>${titulo([['Lo que dice', acento('la comunidad')]])}</h2>
            <div class="resenas__flechas" data-m-aparece>
              <button type="button" class="flecha" aria-label="Reseña anterior" data-carrusel-anterior>${ICONOS.flechaAtras}</button>
              <button type="button" class="flecha" aria-label="Reseña siguiente" data-carrusel-siguiente>${ICONOS.flecha}</button>
            </div>
          </div>
          <div class="resenas__ventana" data-m-aparece style="--m-retraso: 150ms">
            <ul class="resenas__pista" data-carrusel>
              ${TESTIMONIOS.slice(0, 3)
                .map(
                  () => `<li class="resena">
                <span class="resena__icono">${ICONOS.estrella}</span>
                <p class="resena__cita">${pendiente('texto de la reseña y permiso de la persona para publicarla con su nombre')}</p>
                <div>
                  <p class="resena__autor">${pendiente('nombre de quien escribe la reseña')}</p>
                  <p class="resena__detalle">${pendiente('desde cuándo escala en Kuyen o qué hace ahí')}</p>
                </div>
              </li>`
                )
                .join('\n              ')}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="seccion tono-oscuro tono-noche" id="eventos">
      <div class="contenedor">
        <h2 class="titulo-seccion entradas__titulo" data-m-revelar>${titulo([['Próximos', acento('eventos')]])}</h2>
        <div class="entradas">
          ${proximos
            .map(
              (e, n) => `<article class="entrada">
            <a class="entrada__foto m-foto m-foto--zoom" href="${esc(CONTACTO.instagram)}"${externo}${retraso(n * 120)} aria-label="${esc(e.nombre)} en Instagram">
              ${foto(FOTO_EVENTO[e.id], { tamanos: '(min-width: 640px) 45vw, 100vw' })}
            </a>
            <div class="entrada__meta" data-m-aparece${retraso(n * 120 + 150)}><span>${esc(e.tipo)}</span><span>${esc(e.fechaTexto)}</span></div>
            <h3 class="entrada__titulo" data-m-aparece${retraso(n * 120 + 220)}><a href="${esc(CONTACTO.instagram)}"${externo}>${esc(e.nombre)}</a></h3>
          </article>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>

    <section class="seccion tono-oscuro" id="reglamento">
      <div class="contenedor">
        <div class="lista__cabeza">
          <h2 class="titulo-seccion" data-m-revelar>${titulo([['Para cuidarnos', acento('entre todos')]])}</h2>
          <p class="lista__bajada" data-m-aparece>${esc(SOLICITUD.resumen)}</p>
        </div>
        <ul class="reglas">
          ${REGLAMENTO.map(
            (regla, n) => `<li class="reglas__item" data-m-aparece${retraso((n % 3) * 80)}>
            <span class="lista__marca">#${n + 1}</span>
            <span class="reglas__texto">${esc(regla)}</span>
          </li>`
          ).join('\n          ')}
        </ul>
        <div data-m-aparece>
          ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true, flecha: true })}
        </div>
      </div>
    </section>

    <section class="seccion tono-oscuro tono-noche visitanos" id="visitanos">
      <div class="contenedor">
        <div class="llamado__fila">
          <div class="llamado__mitad">
            <h2 class="titulo-seccion" data-m-revelar>${titulo([['Visítanos en', acento(UBICACION.calle)]])}</h2>
          </div>
          <div class="llamado__mitad llamado__acciones" data-m-aparece>
            ${boton({ texto: TEXTOS.acciones.abrirMaps, href: UBICACION.maps, afuera: true, variante: 'borde' })}
          </div>
        </div>
        <div class="mapa" data-m-aparece>
          <div class="mapa__medio">
            ${luna({ clase: 'mapa__luna', paralaje: -0.05, tamanos: '6rem' })}
            <p class="mapa__direccion">${esc(UBICACION.calle)}<br>${esc(UBICACION.comuna)}, ${esc(UBICACION.region)}</p>
            <p class="mapa__nota">Plus code ${esc(UBICACION.plusCode)}. ${esc(UBICACION.referencia)}. ${esc(TEXTOS.mapa)}</p>
            <button type="button" class="boton boton--primario" data-mapa="${esc(UBICACION.mapaEmbebido)}" data-titulo="${esc(`Mapa de ${MARCA.nombre} en ${UBICACION.calle}, ${UBICACION.comuna}`)}">${rueda(TEXTOS.acciones.verMapa)}</button>
          </div>
        </div>
        <p class="visitanos__contacto" data-m-aparece>Escríbenos por WhatsApp al <a class="enlace" href="${esc(CONTACTO.whatsapp)}"${externo}>${esc(CONTACTO.telefono)}</a> o por mensaje directo en Instagram, <a class="enlace" href="${esc(CONTACTO.instagram)}"${externo}>${esc(CONTACTO.instagramUsuario)}</a>.</p>
      </div>
    </section>

    <section class="llamado tono-gradiente">
      <div class="contenedor llamado__fila">
        <div class="llamado__mitad">
          <h2 class="titulo-seccion" data-m-revelar>${titulo(['¿Primera vez', ['en', acento('Kuyen?')]])}</h2>
        </div>
        <div class="llamado__mitad llamado__acciones" data-m-aparece>
          ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true, variante: 'borde', flecha: true })}
        </div>
      </div>
    </section>
  </main>

  <footer class="pie tono-oscuro">
    <div class="contenedor pie__interior">
      <a class="marca pie__logo" href="#contenido" aria-label="${esc(MARCA.nombre)}, inicio">
        <img class="marca__isotipo" src="/img/marca/isotipo-256.webp" width="256" height="256" alt="">
        <span class="marca__nombre">${esc(MARCA.nombreLogo)}</span>
      </a>
      <div class="pie__grilla">
        <nav class="pie__columna" aria-label="Kuyen" data-m-aparece>
          <h3 class="pie__titulo">Kuyen</h3>
          <ul>
            ${enlacePie('#kuyen', 'Qué es Kuyen')}
            ${enlacePie('#muro', 'El muro')}
            ${enlacePie('#horarios', 'Horarios y valores')}
            ${enlacePie('#reglamento', 'Reglamento')}
            ${enlacePie('#visitanos', 'Visítanos')}
          </ul>
        </nav>
        <nav class="pie__columna" aria-label="Servicios" data-m-aparece style="--m-retraso: 100ms">
          <h3 class="pie__titulo">Servicios</h3>
          <ul>
            ${SERVICIOS.map((s) => enlacePie('#servicios', s.nombre)).join('\n            ')}
            ${enlacePie('#eventos', 'Eventos')}
          </ul>
        </nav>
        <nav class="pie__columna" aria-label="Herramientas" data-m-aparece style="--m-retraso: 200ms">
          <h3 class="pie__titulo">Herramientas</h3>
          <ul>
            ${LINKS.apps.map((app) => enlacePie(app.url, app.nombre, true)).join('\n            ')}
            ${enlacePie(LINKS.linktree, 'Linktree', true)}
            ${enlacePie(LINKS.solicitudIngreso, TEXTOS.acciones.solicitud, true)}
          </ul>
        </nav>
        <nav class="pie__columna" aria-label="Contacto" data-m-aparece style="--m-retraso: 300ms">
          <h3 class="pie__titulo">Contacto</h3>
          <ul>
            ${enlacePie(CONTACTO.whatsapp, 'WhatsApp', true)}
            ${enlacePie(CONTACTO.instagram, 'Instagram', true)}
            ${enlacePie(UBICACION.maps, 'Google Maps', true)}
            <li><span>Correo: ${pendiente('correo de contacto (pregunta 6)')}</span></li>
          </ul>
        </nav>
      </div>
      <div class="pie__contorno" aria-hidden="true">KÜYEN</div>
      <div class="pie__legal">
        <div class="pie__legal-enlaces">
          <a href="${esc(CONTACTO.instagram)}"${externo}>Instagram</a>
          <a href="${esc(CONTACTO.whatsapp)}"${externo}>WhatsApp</a>
          <a href="${esc(LINKS.linktree)}"${externo}>Linktree</a>
        </div>
        <p>© 2026 ${esc(MARCA.nombre)}.</p>
      </div>
    </div>
  </footer>

  <script>
${compartido('movimiento.js')};
${leer('script.js')};
  </script>
</body>
</html>
`
}
