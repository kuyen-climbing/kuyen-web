(function () {
  'use strict'

  /* Menú móvil: la hoja sube desde abajo sobre una capa oscura. Se cierra con
     la capa, con un enlace o con Escape, y queda inerte mientras está cerrado. */
  var menu = document.querySelector('[data-menu]')
  var abrir = document.querySelector('[data-menu-abrir]')
  if (menu && abrir) {
    var poner = function (abierto) {
      menu.classList.toggle('abierto', abierto)
      menu.inert = !abierto
      abrir.setAttribute('aria-expanded', String(abierto))
      abrir.setAttribute('aria-label', abierto ? 'Cerrar el menú' : 'Abrir el menú')
      document.body.style.overflow = abierto ? 'hidden' : ''
      if (abierto) {
        var primero = menu.querySelector('a')
        if (primero) primero.focus()
      }
    }
    abrir.addEventListener('click', function () {
      poner(!menu.classList.contains('abierto'))
    })
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a') || e.target.hasAttribute('data-menu-capa')) poner(false)
    })
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('abierto')) {
        poner(false)
        abrir.focus()
      }
    })
  }

  /* Mapa: el iframe de Google se crea recién al hacer clic. Hasta entonces la
     página no pide nada a Google. */
  document.querySelectorAll('[data-mapa]').forEach(function (boton) {
    boton.addEventListener('click', function () {
      var medio = boton.closest('.tarjeta__medio')
      var iframe = document.createElement('iframe')
      iframe.src = boton.getAttribute('data-mapa')
      iframe.title = boton.getAttribute('data-titulo')
      iframe.referrerPolicy = 'no-referrer-when-downgrade'
      medio.replaceChildren(iframe)
    })
  })
})()
