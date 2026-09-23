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

  /* Cabecera fija: suma su sombra cuando la página ya no está arriba de todo. */
  var cabecera = document.querySelector('[data-cabecera]')
  if (cabecera) {
    var marcar = function () { cabecera.classList.toggle('cabecera--movida', window.scrollY > 8) }
    window.addEventListener('scroll', marcar, { passive: true })
    marcar()
  }

})()
