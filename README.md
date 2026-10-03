# Terminal

Curso gratuito, visual e interactivo de **desarrollo de software**, en español, para empezar
desde cero y llegar a crear tus propias aplicaciones y videojuegos, sola o en equipo.

El curso es un **mapa de metro**: 57 estaciones (módulos) repartidas en 11 líneas de colores. Empieza con Python y sigue
con JavaScript, C#, apps para celular y escritorio (y, opcionalmente, videojuegos con Unity y lenguajes de sistemas).
Cada estación explica un tema con animaciones paso a paso, ejemplos que puedes ejecutar, ejercicios que se
corrigen solos, un proyecto, una autoevaluación, un glosario y videos recomendados.

**Estado:** las estaciones en **negrita** ya están escritas (hoy, las 2 primeras); las demás se publican en orden y
mientras tanto aparecen como «próximamente». El curso anterior (9 líneas, JavaScript primero, 44 estaciones) se
conserva en [`anterior/`](anterior/index.html) y en el commit `56bbcc7` del historial.

| Línea | Tema | Estaciones |
|---|---|---|
| 1 | Python: primeros pasos | **Tu primer programa** · **Tipos de datos** · Decisiones · Bucles · Proyecto: tareas |
| 2 | Python: funciones y objetos | Funciones · Módulos y librerías · Objetos y clases · Herencia · Proyecto: carrito |
| 3 | Estructuras de datos y algoritmos | Listas y diccionarios · Conjuntos · Buscar y ordenar · Recursión · Proyecto: analizador |
| 4 | Bases de datos | Bases de datos y SQL · Consultas SQL · SQLite y Python · ORM con SQLAlchemy · Proyecto: reportes |
| 5 | Interfaces gráficas y primer proyecto | Ventanas con Tkinter · Diseño de interfaz · Archivos en la interfaz · Plantillas Jinja2 · Vault v1: datos · Vault v1: interfaz |
| 6 | JavaScript y TypeScript | JavaScript básico · Async y promesas · Eventos y DOM · TypeScript · Proyecto: galería |
| 7 | Servidores con Node.js | Express.js · Rutas · Acceso JWT · Datos en Express · Pruebas de APIs · Proyecto: backend |
| 8 | C# y .NET | C# básico · POO en C# · LINQ · APIs con ASP.NET · Proyecto: consola |
| 9 | Apps multiplataforma | Intro a MAUI · MVVM · Acceso y datos · Vault v2: estructura · Vault v2: funciones · Publicar en tiendas |
| 10 | Videojuegos con Unity (opcional) | Intro a Unity · Gráficos y animación · Audio y controles · Juego 3D básico · Proyecto: juego |
| 11 | Sistemas: C, Rust y Go (opcional) | C y memoria · Rust · Go · Proyecto final |

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
modulos/                Las estaciones ya generadas (lo que se abre en el navegador)
assets/css/             El sistema visual (colores por línea, tipografía, componentes)
assets/js/              Los componentes interactivos: cápsulas animadas, talleres de código,
                        trazas paso a paso, autoevaluaciones, ordenar líneas y terminal simulada
fuente/modulos/         El contenido de cada estación (lo que se edita)
fuente/portada.html     Plantilla de la portada
datos/curso.json        Líneas, estaciones, títulos y horas estimadas (fuente de verdad del curso)
datos/plan-v2/          Plan detallado de las 57 estaciones (temas, ejercicios, proyectos)
videos/                 Un video corto por estación (HyperFrames)
anterior/               Copia fija del curso anterior, solo lectura
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
