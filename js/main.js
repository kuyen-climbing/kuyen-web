/**
 * Comportamiento de las páginas propias de Kuyen Climbing (sin dependencias).
 *
 * - Menú móvil del header.
 *
 * El ToggleTheme no vive acá: va con su propio script en
 * src/partials/toggle-tema.html, junto al markup del toggle, para que el tema
 * se aplique sin depender de que este archivo haya cargado.
 */
(function () {
  'use strict'

  /* ---------- Menú móvil ---------- */
  document.querySelectorAll('[data-mobile-nav]').forEach(function (root) {
    var btn = root.querySelector('[data-mobile-toggle]')
    var overlay = root.querySelector('[data-mobile-overlay]')
    var panel = root.querySelector('[data-mobile-panel]')
    var iconMenu = root.querySelector('[data-icon-menu]')
    var iconClose = root.querySelector('[data-icon-close]')
    if (!btn || !panel) return

    function set(open) {
      btn.setAttribute('aria-expanded', String(open))
      btn.setAttribute('aria-label', open ? 'Cerrar la navegación' : 'Abrir la navegación')
      // Clase en vez del atributo hidden: el atributo pierde contra las
      // utilidades de display de Tailwind (flex, fixed) por especificidad.
      if (overlay) overlay.classList.toggle('hidden', !open)
      panel.classList.toggle('hidden', !open)
      panel.classList.toggle('flex', open)
      if (iconMenu) {
        iconMenu.classList.toggle('scale-90', open)
        iconMenu.classList.toggle('opacity-0', open)
      }
      if (iconClose) {
        iconClose.classList.toggle('scale-90', !open)
        iconClose.classList.toggle('opacity-0', !open)
      }
    }
    btn.addEventListener('click', function () {
      set(btn.getAttribute('aria-expanded') !== 'true')
    })
    if (overlay) overlay.addEventListener('click', function () { set(false) })
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) set(false) })
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false) })
  })

})()
