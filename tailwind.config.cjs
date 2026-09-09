// Configuración de Tailwind del sitio de Kuyen Climbing.
//
// Misma escala tipográfica y de radios que el generador base (ver
// C:\Proyectos\INCBA\docs\Flujo-Sitios-Web-GitHub-Pages.md), con una paleta
// propia: el nombre viene de "küyen", luna en mapudungun, así que el sitio
// trabaja sobre fondo de noche con acentos cálidos.
//
// PROPUESTA, no paleta oficial: Kuyen todavía no entregó sus archivos de
// marca. Los valores salen de la identidad visible en Instagram (círculo azul
// muy oscuro, luna clara). Cuando lleguen el logo y los colores reales se
// reemplazan acá y se regenera el sitio.
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.html', './js/**/*.js', './tools/build.mjs'],
  theme: {
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.5rem' }],
      base: ['1rem', { lineHeight: '1.75rem' }],
      lg: ['1.125rem', { lineHeight: '2rem' }],
      xl: ['1.25rem', { lineHeight: '2rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['2rem', { lineHeight: '2.5rem' }],
      '4xl': ['2.5rem', { lineHeight: '3.5rem' }],
      '5xl': ['3rem', { lineHeight: '3.5rem' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1.1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    extend: {
      colors: {
        // Fondo de noche: la base del sitio.
        noche: {
          50: '#f4f6fb',
          100: '#e6eaf4',
          200: '#c7d0e6',
          300: '#98a8ce',
          400: '#6479b0',
          500: '#435795',
          600: '#33427a',
          700: '#2a3563',
          800: '#1c2444',
          900: '#131a33',
          950: '#0a0e1d',
        },
        // Luna: los claros, para texto y superficies sobre el fondo oscuro.
        luna: {
          50: '#fdfcf8',
          100: '#f7f4ea',
          200: '#ece5d1',
          300: '#dcd0ad',
          400: '#c7b583',
        },
        // Presa: el acento cálido, el color de las presas del muro.
        presa: {
          400: '#ff9b57',
          500: '#f97a2c',
          600: '#e35f11',
          700: '#bc490c',
        },
      },
      borderRadius: { '4xl': '2rem' },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Lexend', ...defaultTheme.fontFamily.sans],
      },
      maxWidth: { '2xl': '40rem' },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
