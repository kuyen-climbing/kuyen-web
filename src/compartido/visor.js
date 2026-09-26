/**
 * Visor de fotos: al hacer clic en una foto de contenido se abre ampliada, y
 * las flechas recorren las de su grupo (25-09-2026, pedido de Benjamín).
 *
 * El grupo es la galería más cercana y, si no hay, la sección. Así una foto del
 * muro recorre las cuatro de su fila y las dos de "Qué es Kuyen" se recorren
 * entre ellas, sin saltar a otra parte de la página.
 *
 * El diálogo se arma la primera vez que se abre, no en el HTML generado: la
 * página servida no cambia y nada oculto entra en las pruebas de contraste ni
 * de desborde.
 */
(function () {
  'use strict'

  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* Fotos de contenido: las que salen de FOTOS y tienen texto alternativo. Las
     decorativas van con alt vacío (los fondos del llamado y del carrusel) y se
     quedan fuera, igual que el isotipo de los avatares, que no vive en fotos/. */
  var fotos = [].slice
    .call(document.querySelectorAll('img[src^="/img/fotos/"]'))
    .filter(function (img) {
      if (!img.getAttribute('alt')) return false
      for (var n = img; n && n.nodeType === 1; n = n.parentElement) {
        if (n.getAttribute('aria-hidden') === 'true') return false
        if (n.tagName === 'A' && n.getAttribute('href')) return false
      }
      return true
    })

  if (!fotos.length) return

  function grupoDe(img) {
    return img.closest('.m-galeria') || img.closest('section') || document.body
  }

  /* Cada foto queda activable: role de botón, foco por tabulación y el nombre
     que oye un lector de pantalla. No se envuelve en nada nuevo, porque hay
     selectores que cuelgan del padre directo (.m-caja img, .pila__foto img). */
  fotos.forEach(function (img) {
    img.setAttribute('role', 'button')
    img.setAttribute('tabindex', '0')
    img.setAttribute('aria-haspopup', 'dialog')
    img.setAttribute('aria-label', 'Ampliar foto: ' + img.getAttribute('alt'))
    img.classList.add('visor-activa')
    // El marco es lo que dibuja el aro y lo que recorta el crecimiento de la
    // foto. Todos los contenedores de fotos del sitio ya recortan (.m-caja,
    // .m-foto y los suyos), así que basta con marcarlos.
    if (img.parentElement) img.parentElement.classList.add('visor-marco')
  })

  /** El derivado más grande que tenga la foto: la última entrada del srcset. */
  function grande(img) {
    var set = img.getAttribute('srcset')
    if (!set) return img.currentSrc || img.src
    var partes = set.split(',')
    return partes[partes.length - 1].trim().split(/\s+/)[0]
  }

  var ICONOS = {
    cerrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    atras: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    siguiente: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  }

  var visor = null
  var partes = {}
  var grupo = []
  var indice = 0
  var origen = null

  function armar() {
    visor = document.createElement('div')
    visor.className = 'visor'
    visor.setAttribute('role', 'dialog')
    visor.setAttribute('aria-modal', 'true')
    visor.setAttribute('aria-label', 'Foto ampliada')
    visor.innerHTML =
      '<div class="visor__fondo" data-visor-fondo></div>' +
      '<button type="button" class="visor__boton visor__boton--cerrar" data-visor-cerrar aria-label="Cerrar">' + ICONOS.cerrar + '</button>' +
      '<button type="button" class="visor__boton visor__boton--atras" data-visor-atras aria-label="Foto anterior">' + ICONOS.atras + '</button>' +
      '<button type="button" class="visor__boton visor__boton--siguiente" data-visor-siguiente aria-label="Foto siguiente">' + ICONOS.siguiente + '</button>' +
      '<figure class="visor__figura" data-visor-figura>' +
      '<img class="visor__foto" data-visor-foto alt="">' +
      '<figcaption class="visor__pie"><span class="visor__texto" data-visor-texto></span><span class="visor__contador" data-visor-contador></span></figcaption>' +
      '</figure>'

    partes = {
      fondo: visor.querySelector('[data-visor-fondo]'),
      cerrar: visor.querySelector('[data-visor-cerrar]'),
      atras: visor.querySelector('[data-visor-atras]'),
      siguiente: visor.querySelector('[data-visor-siguiente]'),
      figura: visor.querySelector('[data-visor-figura]'),
      foto: visor.querySelector('[data-visor-foto]'),
      texto: visor.querySelector('[data-visor-texto]'),
      contador: visor.querySelector('[data-visor-contador]'),
    }

    partes.cerrar.addEventListener('click', cerrar)
    partes.fondo.addEventListener('click', cerrar)
    partes.atras.addEventListener('click', function () { mover(-1) })
    partes.siguiente.addEventListener('click', function () { mover(1) })
    visor.addEventListener('keydown', teclado)

    // Arrastre horizontal en táctil, con un umbral que no se dispara al hacer
    // scroll: solo cuenta si el movimiento es más horizontal que vertical.
    var x0 = null
    var y0 = null
    partes.figura.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY })
    partes.figura.addEventListener('pointerup', function (e) {
      if (x0 === null) return
      var dx = e.clientX - x0
      var dy = e.clientY - y0
      x0 = null
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) mover(dx < 0 ? 1 : -1)
    })

    if (calmo) visor.classList.add('visor--calmo')
    document.body.appendChild(visor)
  }

  /** Pide la vecina para que el salto sea inmediato. */
  function precargar(i) {
    if (!grupo[i]) return
    var img = new Image()
    img.src = grande(grupo[i])
  }

  function pintar() {
    var img = grupo[indice]
    var url = grande(img)
    // La foto entra con un fundido: se apaga, se pide la nueva y se enciende
    // cuando termina de cargar. Si ya estaba en caché, se enciende al toque.
    partes.foto.classList.remove('visor__foto--lista')
    partes.foto.onload = function () { partes.foto.classList.add('visor__foto--lista') }
    partes.foto.src = url
    if (partes.foto.complete && partes.foto.naturalWidth) partes.foto.classList.add('visor__foto--lista')
    partes.foto.alt = img.getAttribute('alt')
    partes.texto.textContent = img.getAttribute('alt')
    var solas = grupo.length < 2
    partes.contador.textContent = solas ? '' : indice + 1 + ' de ' + grupo.length
    partes.atras.hidden = solas
    partes.siguiente.hidden = solas
    precargar(indice + 1)
    precargar(indice - 1)
  }

  function mover(paso) {
    if (grupo.length < 2) return
    indice = (indice + paso + grupo.length) % grupo.length
    pintar()
  }

  function enfocables() {
    return [].slice.call(visor.querySelectorAll('button')).filter(function (b) { return !b.hidden })
  }

  function teclado(e) {
    if (e.key === 'Escape') { e.preventDefault(); cerrar(); return }
    if (e.key === 'ArrowRight') { e.preventDefault(); mover(1); return }
    if (e.key === 'ArrowLeft') { e.preventDefault(); mover(-1); return }
    if (e.key !== 'Tab') return
    // El foco no se escapa del diálogo mientras está abierto.
    var lista = enfocables()
    if (!lista.length) return
    var primero = lista[0]
    var ultimo = lista[lista.length - 1]
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus() }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus() }
  }

  function abrir(img) {
    if (!visor) armar()
    origen = img
    grupo = fotos.filter(function (f) { return grupoDe(f) === grupoDe(img) })
    if (grupo.indexOf(img) === -1) grupo = [img]
    indice = grupo.indexOf(img)
    pintar()
    document.body.classList.add('visor-abierto')
    visor.classList.add('visor--abierto')
    partes.cerrar.focus()
  }

  function cerrar() {
    if (!visor) return
    visor.classList.remove('visor--abierto')
    partes.foto.classList.remove('visor__foto--lista')
    document.body.classList.remove('visor-abierto')
    // La foto se suelta para que no quede pedida en memoria, pero recién cuando
    // terminó el fundido: si se saca antes, el visor se vacía a la vista.
    setTimeout(function () {
      if (!visor.classList.contains('visor--abierto')) partes.foto.removeAttribute('src')
    }, calmo ? 0 : 340)
    if (origen) { origen.focus(); origen = null }
  }

  fotos.forEach(function (img) {
    img.addEventListener('click', function () { abrir(img) })
    img.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return
      e.preventDefault()
      abrir(img)
    })
  })
})()
