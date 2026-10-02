# Terminal

Curso gratuito, visual e interactivo de **desarrollo e ingeniería de software**, en español, para empezar
desde cero y llegar a crear tus propias aplicaciones y videojuegos, sola o en equipo.

El curso es un **mapa de metro**: 44 estaciones (módulos) repartidas en 9 líneas de colores. Cada estación
explica un tema con animaciones paso a paso, ejemplos que puedes ejecutar, ejercicios que se corrigen solos,
un proyecto, una autoevaluación, un glosario y videos recomendados.

| Línea | Tema | Estaciones |
|---|---|---|
| 1 | Fundamentos | Cómo aprender · La computadora · Internet · Pensar como programador · Tu taller |
| 2 | Programar con JavaScript | Primer programa · Variables · Decisiones · Bucles · Funciones · Colecciones · Depuración |
| 3 | La Web | HTML · CSS · DOM y eventos · Asincronía · Diseño y UX |
| 4 | Ciencias de la computación | Matemáticas · Estructuras de datos · Algoritmos · Paradigmas · Ejecución · TypeScript |
| 5 | Ingeniería de software | Git · Código limpio · Pruebas · Proceso y equipo · Arquitectura |
| 6 | Backend y datos | Backend · Bases de datos · Seguridad |
| 7 | Construir productos | React · Móvil y escritorio · Videojuegos · Publicar y operar |
| 8 | Python e IA | Python · IA de personajes · Buscar y decidir · Aprendizaje automático · Redes neuronales · Modelos de lenguaje |
| 9 | Profesional | Programar con IA · Proyecto final · Terminal (tu carrera) |

## Cómo abrir el curso

**Opción 1, la más fácil:** descarga este repositorio (botón verde «Code» → «Download ZIP»), descomprímelo y
abre el archivo `index.html` con doble clic. Se abre en tu navegador. No hace falta instalar nada.

**Opción 2, publicarlo gratis en internet con GitHub Pages:** en GitHub, entra a *Settings → Pages*, en
*Source* elige *Deploy from a branch*, selecciona la rama y la carpeta `/ (root)` y guarda. En uno o dos
minutos tendrás una dirección del tipo `https://tu-usuario.github.io/Curso-De-Software-Developer/`.

Tu progreso (estaciones completadas, ejercicios resueltos, código que escribiste) se guarda solo en tu
navegador. Si cambias de navegador o de computadora, empiezas con el progreso vacío.

## Qué hay dentro

```
index.html              Portada: mapa de metro, cómo funciona cada estación, horarios
glosario.html           Todos los términos del curso, con buscador
modulos/                Las 44 estaciones ya generadas (lo que se abre en el navegador)
assets/css/             El sistema visual (colores por línea, tipografía, componentes)
assets/js/              Los componentes interactivos: cápsulas animadas, talleres de código,
                        trazas paso a paso, autoevaluaciones, ordenar líneas y terminal simulada
fuente/modulos/         El contenido de cada estación (lo que se edita)
fuente/portada.html     Plantilla de la portada
datos/curso.json        Líneas, estaciones, títulos y horas estimadas
datos/pictos.json       Pictogramas de cada estación
datos/tiempo.json       Estimación de tiempo con sus fuentes
docs/GUIA-REDACCION.md  Cómo se escribe una estación (estilo, estructura y componentes)
herramientas/           Scripts para generar las páginas y comprobar los ejercicios
```

## Para quien quiera modificar el curso

Necesitas [Node.js](https://nodejs.org) (versión 22 o superior) y Python 3 para las pruebas.

```bash
node herramientas/construir.mjs        # genera index.html, glosario.html y modulos/*.html
node herramientas/probar-talleres.mjs  # ejecuta la solución de cada ejercicio contra su verificación
```

Edita siempre los archivos de `fuente/` y `datos/`, nunca los de `modulos/` (se regeneran). La guía
`docs/GUIA-REDACCION.md` explica cómo escribir una estación y el HTML exacto de cada componente.

## Créditos

- Tipografías: Barlow y Barlow Condensed (Jeremy Tribby) y Atkinson Hyperlegible Next y Mono
  (Braille Institute), desde Google Fonts.
- Resaltado de código: Prism. Python en el navegador: Brython. SQL en el navegador: sql.js (SQLite).
  Todo se carga desde cdnjs.
- Principios de diseño tomados como referencia: [impeccable](https://github.com/pbakaus/impeccable) y
  [21st.dev / Magic MCP](https://github.com/21st-dev/magic-mcp).
- Plan de estudios contrastado con SWEBOK v4, ACM/IEEE CS2023, roadmap.sh, OSSU, The Odin Project, CS50 y
  MDN Learn.
