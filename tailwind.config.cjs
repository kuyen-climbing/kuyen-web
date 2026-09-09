// Configuración de Tailwind del sitio de Kuyen Climbing.
//
// Los colores, el radio y las tipografías salen de variables CSS, no de valores
// fijos: así el ToggleTheme cambia el tema entero poniendo una clase en <html>,
// igual que en Pagos Pendientes. Las definiciones de cada tema están en
// src/css/tailwind.css.
const defaultTheme = require('tailwindcss/defaultTheme')

// hsl(var(--x) / <alpha-value>) deja que sigan funcionando las opacidades
// de Tailwind (bg-fondo/60) sobre un color que viene de una variable.
const token = (nombre) => `hsl(var(--${nombre}) / <alpha-value>)`

module.exports = {
  content: ['./src/partials/**/*.html', './src/sections/**/*.html', './js/**/*.js', './tools/build.mjs'],
  theme: {
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.5rem' }],
      base: ['1rem', { lineHeight: '1.75rem' }],
      lg: ['1.125rem', { lineHeight: '2rem' }],
      xl: ['1.25rem', { lineHeight: '2rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['2rem', { lineHeight: '2.5rem' }],
      '4xl': ['2.5rem', { lineHeight: '3rem' }],
      '5xl': ['3rem', { lineHeight: '3.25rem' }],
      '6xl': ['3.75rem', { lineHeight: '1.05' }],
      '7xl': ['4.5rem', { lineHeight: '1.05' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    extend: {
      colors: {
        fondo: token('fondo'),
        texto: token('texto'),
        superficie: token('superficie'),
        'superficie-texto': token('superficie-texto'),
        suave: token('suave'),
        'suave-texto': token('suave-texto'),
        borde: token('borde'),
        primario: token('primario'),
        'primario-texto': token('primario-texto'),
        contraste: token('contraste'),
        'contraste-texto': token('contraste-texto'),
      },
      borderRadius: {
        tema: 'var(--radio)',
        boton: 'var(--radio-boton)',
      },
      fontFamily: {
        sans: ['var(--fuente-texto)', ...defaultTheme.fontFamily.sans],
        display: ['var(--fuente-display)', ...defaultTheme.fontFamily.sans],
        acento: ['var(--fuente-acento)', ...defaultTheme.fontFamily.serif],
      },
      maxWidth: { '2xl': '40rem' },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
