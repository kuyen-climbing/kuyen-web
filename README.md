# Kuyen Climbing: sitio web

Sitio de **Kuyen Climbing**, centro de escalada en boulder en Los Patagones 375, Padre Las
Casas, La Araucanía. Repo de la organización `kuyen-climbing`, servido por GitHub Pages.

Sigue el flujo de sitios estáticos documentado en
`C:\Proyectos\INCBA\docs\Flujo-Sitios-Web-GitHub-Pages.md`: generador propio, verificación
funcional y CI que impide publicar HTML desincronizado.

## Estado (26-09-2026): publicado

El sitio está **en vivo en https://kuyenclimbing.cl**. Kuyen eligió el template Hirael entre los
tres candidatos y el sitio dejó de ser una comparación: es una sola página, servida en la raíz
del dominio, con markup, CSS y JavaScript propios.

Publica los datos reales de Kuyen: horarios, los cuatro planes de clases, Kuyencit@s, el muro en
detalle con su graduación por color de chapa, quiénes lo construyeron y quiénes setean, la
historia, los productos, las comodidades, el reglamento, la primera visita, las reseñas de
Google y las tres formas de escribirles. No queda ningún `[POR CONFIRMAR]` a la vista ni ningún
hueco de foto.

Lo que Kuyen nunca fijó no se inventa ni se deja marcado: el horario de Kuyencit@s, que quedó
sin definir, se resuelve mandando a escribir, que es lo que pasaba igual.

Las 27 fotos entran una sola vez: ninguna se repite y ninguna queda sin usar. Cualquiera se
amplía al hacer clic, y las flechas recorren las de su grupo.

El estilo, elegido el 15-09-2026: títulos en Rubik Dirt y texto en Rubik, la página entera de
noche (tinta y gradiente del logo 2.0) con acento amarillo luna y movimiento en títulos, textos,
fotos y secciones. El hero abre sobre el cielo de estrellas que titilan, con la luna en el medio,
entrada orquestada y rastro de tiza; la cabecera queda fija arriba. El logo con la cordillera y
los gatos se apoya al pie del arco de la escaladora, nítido y a escala.

### Lo que se fue al elegir template

El 26-09-2026 salieron del repo el marco de la raíz con su selector, las rutas `/t/<id>`, las
capturas de los tres templates (23,5 MB de markup de terceros) y las herramientas para
capturarlos y compararlos. El repo bajó de 104 MB a 80.

Las variantes propias de NexStudio y de Karate siguen en `src/variantes/` como registro del
trabajo, pero el build ya no las toca y nadie las mantiene: se van a romper con el primer cambio
que se haga en las piezas compartidas.

Todo lo borrado sigue en el historial:

```bash
git checkout 8dd4bad -- src/temas temas src/partials/marco.html tools/capturar-tema.mjs
```


## Cómo se edita

**Los `.html` de la raíz son generados. No los edites.** Se editan las fuentes de `src/` y se
regenera:

```bash
npm run build        # -> index.html + sitemap.xml + robots.txt + CNAME
```

No hay dependencias que instalar: el generador es Node a secas.

### Trabajar en local

```bash
npm run dev
```

Genera el sitio en `dist/`, lo sirve en http://localhost:8100 y lo vuelve a generar solo cada
vez que cambia algo en `src/`. El servidor local responde sin caché, así que un cambio se ve con
solo recargar, sin esperar los 10 minutos que GitHub Pages guarda cada versión publicada.

| Qué querés cambiar | Dónde |
|---|---|
| Textos, datos del negocio, horarios, precios, eventos, reglamento y fotos | `src/contenido.mjs` |
| Título y descripción de la página | `SEO` en `src/contenido.mjs` |
| La estructura y el markup de la página | `src/variantes/hirael/pagina.mjs` |
| Sus estilos | `src/variantes/hirael/estilos.css` |
| Las piezas compartidas: escena, movimiento y visor | `src/compartido/` |
| Paleta, acento y tokens | `src/css/tokens.css` |
| El dominio y si el sitio se indexa | `SITES` en `src/site.config.mjs` |

Para verlo local con las URLs resueltas como las resuelve GitHub Pages:

```bash
node tools/build.mjs --out=dist
node tools/serve.mjs dist --port=8100
node tools/verify.mjs --port=8100
node --experimental-websocket tools/pruebas-ui.mjs http://localhost:8100
```

`verify.mjs` comprueba que la página responda, que esté bien formada, que no arrastre nada de
terceros, que cada asset que nombra exista, que `robots.txt` y `sitemap.xml` digan lo mismo que
la configuración y que no haya quedado material viejo publicado.

`pruebas-ui.mjs` no saca capturas: todo se comprueba leyendo el DOM y el resultado es texto.
Revisa:

- que haya un solo `<h1>`;
- que Rubik Dirt y Rubik carguen desde el sitio y que no se pida nada a otros dominios al abrir
  la página;
- el contraste AA de cada texto visible contra su fondo, gradientes incluidos;
- que no haya desborde a lo ancho en 375, 640, 768, 1024 y 1440 px;
- que el menú móvil abra y se cierre con Escape;
- que el mapa y las tres publicaciones de Instagram vengan incrustados, sin clic, y con
  `loading="lazy"`, que es lo que evita que la primera pantalla pida algo a Google o a Instagram;
- que la entrada del hero termine;
- que la cabecera quede a la vista al bajar por la página;
- que el logo de fondo del hero quede detrás del texto, difuminado y con poca opacidad, y que
  donde el logo no sea fondo ningún texto ni la marquesina lo tapen, en todos los anchos;
- que ninguna grilla deje un elemento solo en la última fila: mide el ancho que queda sin usar
  y reclama si sobra más de media columna, en los cinco anchos;
- que todas las fotos de contenido se puedan ampliar, que avisen con su marco y no con el cursor
  de lupa, y que el visor abra la foto en grande, cuente las de su grupo, avance con la flecha,
  al cerrarse con Escape devuelva el foco y quede oculto sin atrapar clics;
- que una galería de tres vaya en una sola fila desde 1024 px;
- que no haya errores de JavaScript al cargar.

Antes de medir el contraste recorre la página entera, porque los textos y las fotos que entran
al hacer scroll están invisibles hasta aparecer.

Desde WSL se corre con el Chrome de Linux: `CHROME=/usr/bin/google-chrome npm run test:ui`.

### La variante publicada

Cada template va a tener una variante con el contenido, la tipografía y los colores de Kuyen, y
la misma estructura del template: secciones, layout, componentes, espaciado y animaciones. El
markup, el CSS y el JavaScript de cada variante son propios.

| Qué | Dónde |
|---|---|
| Página de la variante | `src/variantes/<id>/pagina.mjs`, con su CSS y su JS en la misma carpeta |
| Textos y datos del negocio | `src/contenido.mjs`, sin HTML: lo leen todas las variantes |
| Qué publicaciones de Instagram se muestran | `INSTAGRAM` en `src/contenido.mjs`: solo públicas, sin precios ni horarios sin confirmar y sin marcas de terceros sin permiso. La publicación va incrustada y carga sola; `src/compartido/instagram.js` solo ajusta el alto que avisa Instagram |
| Paleta del logo 2.0, acento y tokens semánticos | `src/css/tokens.css` |
| Tipografías (Rubik Dirt y Rubik, licencia OFL) | `fonts/` y `src/css/fuentes.css` |
| Escena del logo y movimiento que comparten las variantes | `src/compartido/`: `escena.mjs` (cielo, luna, cordillera con los gatos, presas que flotan, telón de sección, títulos que se arman, marquesina y cifras), `movimiento.css` y `movimiento.js` (entrada del hero, profundidad con el puntero, paralaje, rastro de tiza y apariciones) |
| Visor de fotos | `src/compartido/visor.js`, con sus estilos en `movimiento.css` |
| Fotos y derivados de marca | `img/fotos/` e `img/marca/`, generados con `tools/assets.mjs` |

La página se sirve en la raíz. `VARIANTE` en `src/site.config.mjs` dice cuál se publica.

`pagina.mjs` exporta por defecto una función que recibe el contexto y devuelve el HTML completo:

- `contenido`: todo `src/contenido.mjs`.
- `esc(texto)`: escapa texto para HTML.
- `foto(id, opciones)`: una `<img>` con `srcset`, `sizes`, `width` y `height` de una foto de
  `FOTOS`.
- `cabeza(opciones)`: el `<head>` con metadatos, Open Graph, datos estructurados, fuentes,
  tokens y el CSS de la variante (`estilos`).
- `leer(nombre)`: un archivo de la carpeta de la variante.

- `galeria(...ids)`: una fila de fotos de `FOTOS`, todas con la proporción de la primera, que
  entran escalonadas y se inclinan hacia el puntero.
- `telon({ semilla, presas })`: fondo de escalada para una sección de poco texto, una cordillera
  al pie y unas presas grandes flotando, todo muy atenuado. Va como primer hijo de la sección,
  que además lleva la clase `m-con-telon`. Se puso en las secciones con menos texto por pantalla,
  medidas sobre la página generada: en Hirael el muro, las clases, Instagram y Visítanos; en Nex
  el equipo, las competencias, Instagram y Visítanos; en Karate los programas e Instagram.

Las grillas de tarjetas no dejan un elemento solo en la última fila. Con cuatro en tres columnas
pasan a dos por fila; cuando sobran dos, la última fila reparte el ancho entre las dos; y cuando
sobra uno, se lleva la fila entera. Las reglas usan `:has()` para contar los hijos desde el CSS,
así que agregar o sacar una tarjeta no obliga a tocar nada. La prueba de interfaz mide el ancho
que queda sin usar en la última fila de cada grilla, en los cinco anchos del estándar.

Cada dato que viene de la planilla de preguntas lleva el código de su pregunta entre paréntesis
(`H4` es horarios y tarifas, `C1` clases, `M5` el muro, y así). `POR_CONFIRMAR` sigue en
`src/contenido.mjs` como herramienta, pero ya no hay nada marcado: el sitio se entrega con lo
que Kuyen alcanzó a confirmar.

#### Fotos y marca

Los originales no entran al repo. Con ImageMagick instalado:

```bash
node tools/assets.mjs fotos --origen=<carpeta con los JPG>
node tools/assets.mjs marca --origen=<carpeta con los PNG del logo> --titulo=<RubikDirt.ttf> --texto=<Rubik.ttf>
node tools/assets.mjs escena --origen=<carpeta con el arte de 15 x 20>
```

`fotos` genera cada foto de `FOTOS` en WebP de 1600, 1200 y 800 px, con la orientación de la
cámara aplicada y bajo 300 KB, más `img/fotos/fotos.json` con las medidas. Si la foto trae
`recorte: { desde, zona }`, se recorta antes de escalar: así se deja fuera una marca de terceros
o se reencuadra sin tocar el original. `marca` recorta el
isotipo del logo 2.0 y genera los favicons, el logo completo y la imagen para redes
(`og-kuyen.jpg`, de 1200 x 630). Los TTF son las versiones de escritorio de las mismas familias
de `fonts/`, porque ImageMagick no lee woff2.

`escena` saca del arte de 15 x 20 dos capas con el cielo transparente: la cordillera con los dos
gatos y la luna con su goteo (`img/escena/`). Separa por saturación: el cielo del arte es un
gradiente muy saturado y lo demás es tinta, blanco o gris. Deja fuera las estrellas, porque el
sitio dibuja las suyas, que titilan.

Para agregar una foto: se suma a `FOTOS` en `src/contenido.mjs`, con su `id`, el archivo original,
su `orientacion` y el texto alternativo, y se vuelve a correr `fotos`. El crédito por defecto es
el de la sesión (`@vbizama.studio`); una foto puede traer el suyo.

Cualquier foto de contenido se amplía al hacer clic, y las flechas recorren las de su grupo: la
galería a la que pertenece o, si no está en una, su sección. Al pasar el mouse la foto crece
dentro de su marco y el marco se enciende con un aro del amarillo de la luna: esa es la señal de
que abre, no un cursor de lupa. El visor entra y sale con un fundido, y la foto que llega al
cambiar de una a otra también. Lo resuelve `src/compartido/visor.js`,
que arma el diálogo la primera vez que se abre, así la página generada no lleva nada oculto. Se
maneja con teclado (`Escape`, `←`, `→`), con el dedo (arrastre horizontal) y con el puntero. Las
dos fotos que Karate usa de fondo detrás de un texto van con `alt` vacío y quedan fuera, porque
son una capa de fondo y no una foto para mirar.

Kuyen entregó todo lo que tenía el 25-09-2026 y no va a subir más, así que el sitio se arma con
eso: **27 fotos**, cada una usada una sola vez en cada variante. Vienen de tres jornadas con
cámara y de un puñado de tomas de teléfono del propio equipo, que llevan su propio crédito.

Cinco originales quedaron fuera, en `FOTOS_EXCLUIDAS`: se ve el lienzo de Patagonia o la tarima
de Red Bull, y el permiso para mostrar marcas de terceros (pregunta 9) nunca llegó. Otras tres
se rescataron con `recorte`, que deja la marca fuera al generar el WebP sin tocar el original:
el panel del galpón lleva pegados los logos de @astroméridas y MORBID, y en un lienzo del fondo
se lee Patagonia.

No hay foto del equipo, del seteo, de los productos ni de una clase en acción. Esas secciones se
quedan con su texto: no llevan hueco ni relleno.

### Si el build falla

El generador valida antes de escribir y no deja nada a medias: título o descripción demasiado
largos, más o menos de un `<h1>`, tokens sin resolver, o una página sin sus
assets.

En las variantes revisa además que haya un solo `<h1>`, que no haya anclas rotas ni assets que
falten en el repo, y que no queden referencias a los templates o a terceros (rutas `/temas/`,
dominios de los templates, fuentes pedidas a Google) ni datos sin confirmar. En
`src/contenido.mjs`, falla si un horario o un precio queda en blanco, o si aparece alguno de
los valores de `DATOS_SIN_CONFIRMAR`. Esa búsqueda la hace `apareceDatoViejo`, que exige una
frontera a la izquierda del valor: así `2.000`, que es un dato viejo, no salta dentro de
`$32.000`, que sí es un precio vigente.

## El dominio

`kuyenclimbing.cl` queda a nombre de Andrés Muñoz Castillo (pregunta L4, confirmada el
22-09-2026). Está puesto en `SITES.cl` y en el archivo `CNAME` de la raíz.

Si el sitio se indexa o no lo dice `robots` y `sitemap` de cada entrada de `SITES`. El sitio
`cl` va con `index, follow` y sitemap desde el 26-09-2026; el `preview` va cerrado. El build
comprueba que el `<meta name="robots">` de la página sea el que declara su sitio, y borra el
`sitemap.xml` cuando el sitio no se indexa.

### Los registros del DNS

Para un dominio desnudo, GitHub Pages pide sus cuatro direcciones. El `www` se resuelve solo,
con un `CNAME` al dominio por defecto de la organización.

| Tipo | Nombre | Valor |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | kuyen-climbing.github.io |

Si el DNS queda en Cloudflare, los registros van en **"DNS only"** (nube gris). Con el proxy
activado, GitHub no puede emitir ni renovar el certificado HTTPS.

### Comprobarlo

```bash
node tools/verificar-dominio.mjs
```

Revisa en orden si el dominio está inscrito en NIC Chile, a qué servidores de nombre quedó
delegado, si los cuatro registros A son los de GitHub, si el `www` redirige, si responde por
HTTPS con certificado válido y si sirve lo de este repo. Sirve para saber en qué paso va la
configuración mientras el DNS propaga, que puede tardar hasta 24 horas.

## Publicación

Push a `main` publica desde la raíz del repo. El workflow `verificar.yml` corre en cada push y
en cada PR: regenera el HTML y lo compara contra lo comiteado, después levanta el servidor
local y corre la verificación funcional.

### El repo espejo

`kuyen-climbing/kuyen-climbing.github.io` se creó para previsualizar mientras no había dominio:
la URL genérica de este repo no servía, porque con `CNAME` redirige al dominio y sin él las
rutas absolutas se rompen bajo el subpath.

Con el dominio funcionando ya no hace falta como preview, y quedó redirigiendo a
`kuyenclimbing.cl`. Si alguna vez se necesita mirar un cambio antes de publicarlo,
`npm run preview:publicar` lo vuelve a llenar con la variante `preview` (sin `CNAME` y sin
indexar).

## Pendientes

### Del sitio

- **Marca**: el isotipo, los favicons, el logo completo y `og-kuyen.jpg` salen del logo 2.0 con
  `tools/assets.mjs marca`. La tipografía del logo es Sherman: viene en el Drive de Andy como
  `sherman Tipo de letra.zip` (L2). Falta el manual de marca, si existe.
- **Variantes sin mantener**: `src/variantes/nex` y `src/variantes/karate` siguen en el repo
  como registro, pero el build ya no las toca. Si estorban, se borran: están en el historial.

## Datos del negocio

Todos en `src/contenido.mjs`. La base se revisó el 14-09-2026 en la ficha de Google Maps,
Instagram, Linktree y el formulario de solicitud de ingreso; el 22-09-2026 Kuyen confirmó el
resto en la planilla de preguntas:

- Los Patagones 375, Padre Las Casas, La Araucanía. Razón social: Kuyen SpA
- +56 9 3502 8838, kuyen.climbing@gmail.com
- [@kuyen.climbing](https://www.instagram.com/kuyen.climbing/)
- [Ficha de Google](https://maps.app.goo.gl/v9F89L5peqFyxcJc9): 5,0 con 14 reseñas
- Lunes a domingo de 10:00 a 22:00, con horario bajo hasta las 16:00 y horario alto después
- Muro de boulder de 4,26 m, paredes de 0° a 40°, moonboard 2016 completa, más de 1000 presas,
  clases guiadas, el programa infantil Kuyencit@s y talleres
- Sigue **sin confirmar** y va como `[POR CONFIRMAR]`: los días y el horario de Kuyencit@s
- Reseñas: las cinco de Google que tienen texto, copiadas de la ficha el 23-09-2026 abriéndola
  en Chrome. De las 14 opiniones, las otras nueve son estrellas sin comentario. Kuyen no
  respondió T1, que preguntaba por el permiso; Benjamín decidió publicarlas igual, y si alguien
  pide bajar la suya se borra su entrada de `RESENAS`
- **No se declara `aggregateRating`** en los datos estructurados: las guías de Google no
  permiten marcar como valoración propia una nota recogida en su propia ficha
- Clases guiadas: las tres gráficas de precios que Andy subió el 25-09-2026 confirman todos
  los valores que ya estaban publicados y agregan tres que faltaban. 1 vez por semana $45.000,
  2 veces $52.000, 3 veces $72.000 y clase suelta $13.500. El plan de dos veces por semana es
  el que había salido del sitio en septiembre por no saber su valor
- Graduación de boulder: la dificultad va por color de chapa, según la gráfica que Kuyen
  publica en el muro. Azul V0-V1, verde V1-V2, amarillo V3-V4, rojo V5-V6, negro V7-V8 y
  blanco V9-V10, y los volúmenes valen para todas las rutas (M7, M8)
