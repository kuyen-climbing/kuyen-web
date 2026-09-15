(function () {
  'use strict'

  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* Cabecera: al bajar pasa a tinta translúcida con desenfoque y sombra. */
  var cabecera = document.querySelector('[data-cabecera]')
  if (cabecera) {
    var marcar = function () { cabecera.classList.toggle('cabecera--movida', window.scrollY > 50) }
    window.addEventListener('scroll', marcar, { passive: true })
    marcar()
  }

  /* Menú de móvil y tablet: el botón cambia entre Menú y Cerrar. Se cierra con
     un enlace o con Escape, y queda inerte mientras está cerrado. */
  var menu = document.querySelector('[data-menu]')
  var abrir = document.querySelector('[data-menu-abrir]')
  if (menu && abrir) {
    var texto = abrir.querySelector('[data-menu-texto]')
    var poner = function (abierto) {
      menu.classList.toggle('abierto', abierto)
      menu.inert = !abierto
      if (cabecera) cabecera.classList.toggle('cabecera--abierta', abierto)
      abrir.setAttribute('aria-expanded', String(abierto))
      texto.textContent = abierto ? 'Cerrar' : 'Menú'
    }
    abrir.addEventListener('click', function () {
      poner(!menu.classList.contains('abierto'))
    })
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) poner(false)
    })
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('abierto')) {
        poner(false)
        abrir.focus()
      }
    })
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) {
      if (m.matches) poner(false)
    })
  }

  /* Carrusel de reseñas: las flechas avanzan de a una tarjeta y vuelven al
     principio al llegar al final. Avanza solo cada 3 s mientras está en
     pantalla, salvo con el puntero o el foco encima o con movimiento reducido. */
  var pista = document.querySelector('[data-carrusel]')
  if (pista) {
    var mover = function (sentido) {
      var tarjeta = pista.firstElementChild
      if (!tarjeta) return
      var paso = tarjeta.getBoundingClientRect().width + (parseFloat(getComputedStyle(pista).columnGap) || 0)
      var fin = pista.scrollWidth - pista.clientWidth
      if (sentido > 0 && pista.scrollLeft >= fin - 4) pista.scrollTo({ left: 0 })
      else if (sentido < 0 && pista.scrollLeft <= 4) pista.scrollTo({ left: fin })
      else pista.scrollBy({ left: sentido * paso })
    }
    document.querySelectorAll('[data-carrusel-anterior]').forEach(function (b) {
      b.addEventListener('click', function () { mover(-1) })
    })
    document.querySelectorAll('[data-carrusel-siguiente]').forEach(function (b) {
      b.addEventListener('click', function () { mover(1) })
    })
    if (!calmo && 'IntersectionObserver' in window) {
      var zona = pista.closest('[data-carrusel-zona]') || pista
      var quieto = false
      var enPantalla = false
      zona.addEventListener('pointerenter', function () { quieto = true })
      zona.addEventListener('pointerleave', function () { quieto = false })
      zona.addEventListener('focusin', function () { quieto = true })
      zona.addEventListener('focusout', function () { quieto = false })
      new IntersectionObserver(function (entradas) {
        enPantalla = entradas[0].isIntersecting
      }).observe(pista)
      setInterval(function () {
        if (enPantalla && !quieto && !document.hidden) mover(1)
      }, 3000)
    }
  }

  /* Mapa: el iframe de Google se crea recién al hacer clic. Hasta entonces la
     página no pide nada a Google. */
  document.querySelectorAll('[data-mapa]').forEach(function (boton) {
    boton.addEventListener('click', function () {
      var recuadro = boton.closest('.mapa')
      var iframe = document.createElement('iframe')
      iframe.src = boton.getAttribute('data-mapa')
      iframe.title = boton.getAttribute('data-titulo')
      iframe.referrerPolicy = 'no-referrer-when-downgrade'
      recuadro.replaceChildren(iframe)
    })
  })
})()
