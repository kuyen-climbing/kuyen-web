/**
 * Comportamiento de las páginas propias de Kuyen Climbing (sin dependencias).
 *
 * - Menú móvil del header, cuando el sitio tenga más de una página.
 * - Selector de templates: marca cuál se estuvo mirando.
 *
 * El ToggleTheme que va dentro de cada página de template no vive acá: se
 * inyecta con su propio script en src/partials/toggle-tema.html, porque esas
 * páginas son capturas de terceros y no cargan este archivo.
 */
(function () {
  'use strict'

  var CLAVE = 'kuyen-tema'

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

  /* ---------- Selector de templates ---------- */
  var tarjetas = document.querySelectorAll('[data-tema]')
  if (!tarjetas.length) return

  var ultimo = null
  try { ultimo = localStorage.getItem(CLAVE) } catch (e) {}
  if (!ultimo) return

  tarjetas.forEach(function (t) {
    if (t.getAttribute('data-tema') !== ultimo) return
    t.classList.add('ring-2', 'ring-presa-400')
    var marca = document.createElement('span')
    marca.className = 'mt-4 inline-flex w-fit items-center rounded-full bg-presa-500/15 px-2.5 py-1 text-xs font-semibold text-presa-400'
    marca.textContent = 'El último que viste'
    t.appendChild(marca)
  })
})()
