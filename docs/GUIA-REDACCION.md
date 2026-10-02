# Guía de redacción de estaciones

Esta guía explica cómo se escribe una estación (módulo) del curso **Terminal**. La referencia viva es
`fuente/modulos/07-variables.html`: léela entera antes de escribir y copia su nivel de detalle, su tono y su
estructura.

## 1. Para quién escribimos

- Una persona hispanohablante adulta con conocimiento de programación **nulo o casi nulo**.
  No sabe qué es una terminal, ni un archivo `.js`, ni inglés técnico.
- Quiere llegar a crear apps y videojuegos, sola o en equipo. Estudia en su tiempo libre, a menudo cansada.
- Si una frase necesita conocimiento que no se ha enseñado antes, está mal escrita.

## 2. Voz y estilo

- Español neutro latinoamericano, tuteo (`tú`), frases cortas (idealmente menos de 25 palabras).
- Cada término técnico nuevo se **define la primera vez** que aparece, en la misma frase o la siguiente,
  y se pone en **negrita** esa primera vez. Si el término viene del inglés, di cómo se llama en inglés.
- Nunca: «simplemente», «obviamente», «es fácil», «como todos saben», «trivial». Si algo es fácil, no hace falta decirlo.
- Voz activa y concreta. Ejemplos del mundo real: tiendas, videojuegos, redes sociales, recetas, el metro.
- Nada de relleno ni frases de marketing. Nada de guiones largos (—) como muletilla; usa punto o coma.
- Analogías sí, pero con su límite: si la analogía falla en algún punto, dilo.
- Honestidad técnica: nada inventado. Versiones y datos vigentes a septiembre de 2026 (ver sección 9).

## 3. Método didáctico (basado en evidencia)

1. **Primero el porqué**: cada sección abre con el problema que resuelve el concepto.
2. **Ejemplos resueltos antes que ejercicios** (efecto del ejemplo resuelto, Sweller): muestra, explica, luego pide.
3. **Predice → ejecuta → investiga → modifica → crea** (PRIMM): antes de un taller de ejemplo, pide predecir la salida.
4. **Máquina nocional**: usa `traza` para mostrar qué hace la computadora línea por línea, y `capsula` para animar
   el modelo mental (memoria, red, flujo de datos).
5. **Carga cognitiva baja**: un concepto nuevo por bloque. Divide en secciones de 5–15 minutos de lectura.
6. **Errores reales**: señales `error` con las confusiones típicas de principiantes, y ejercicios de «arregla el código».
7. **Dificultad creciente con desvanecimiento**: ejercicios guiados (casi todo hecho) → semiguiados → retos.
8. **Recuperación**: autoevaluación al final con distractores basados en errores reales, y explicación de cada opción.
9. **Conexiones**: enlaza estaciones anteriores (lo que se da por sabido) y posteriores (lo que se verá después).

## 4. El archivo

- Ruta: `fuente/modulos/NN-slug.html` (número y slug de `datos/curso.json`).
- Contiene **solo** elementos `<section>` seguidos. Sin `<html>`, `<head>`, `<body>` ni estilos globales:
  el generador (`node herramientas/construir.mjs`) añade la cabecera, el cartel de la estación, el riel de paradas,
  la navegación y los scripts.
- Cada sección: `<section id="id-corto" data-parada="Nombre corto">` y su primer hijo es un `<h2>`.
  `data-parada` es el texto del índice lateral (1–4 palabras).
- Enlaces a otras estaciones: `href="NN-slug.html"` (misma carpeta). A secciones: `href="NN-slug.html#id"`.

### Orden obligatorio de secciones

| id | Contenido |
|---|---|
| `ruta` | «Lo que vas a lograr»: entradilla (`<p class="entradilla">`), objetivos (`<ul class="objetivos">`, 6–10) y una señal `nota` «Antes de empezar» con los requisitos enlazados. |
| (5–9 secciones de contenido) | La enseñanza. Ids cortos en minúsculas sin acentos. |
| `resumen` | Lista de 6–10 ideas clave. |
| `practica` | 6–10 ejercicios `article.ejercicio` (≥2 guiados, ≥2 semiguiados, ≥2 retos). |
| `proyecto` | Proyecto de la estación con pasos (`ol.pasos`), taller o instrucciones y solución de referencia. |
| `autoevaluacion` | 8–12 preguntas `div.quiz`. |
| `glosario` | 12–25 términos `dl.glosario`. Se juntan en el glosario global. |
| `videos` | 2–4 videos verificados (`ul.videos`). |
| `profundizar` | 3–6 recursos verificados (`ul.recursos`). |

### Mínimos de calidad por estación

- Al menos **2 cápsulas animadas** y, si la estación tiene código, **1 traza**.
- Al menos **3 talleres** dentro de las secciones de contenido (predice/modifica), además de los de la práctica.
- Al menos **1 diagrama** SVG (`figure.diagrama`) o tabla comparativa donde ayude.
- Señales repartidas: `analogia`, `ojo`, `error`, `clave`, `oficio`, `nota` donde aporten (no decorar).
- Extensión orientativa: 6 000–12 000 palabras de contenido visible. Detalle > brevedad.

## 5. Componentes (HTML exacto)

### Señales

```html
<aside class="senal analogia"><p>Texto…</p></aside>
<aside class="senal ojo" data-titulo="Título propio opcional"><p>…</p></aside>
```

Tipos: `nota` (Dato), `ojo` (Cuidado), `error` (Error común), `analogia` (Para entenderlo), `clave` (Idea clave),
`oficio` (Consejo de oficio: cómo se hace en la industria). `data-titulo=""` quita el título.
Para impacto ético o social usa `nota` con `data-titulo="Impacto"`.

### Código

```html
<pre><code class="language-js">const x = 1;</code></pre>
```

Lenguajes: `js`, `html`, `css`, `ts`, `jsx`, `tsx`, `json`, `bash`, `python`, `sql`, `yaml`, `docker`, `gdscript`,
`csharp`, `diff`, `text`. Escapa `<`, `>` y `&` dentro de `<pre>` (`&lt;` `&gt;` `&amp;`).
Terminal (comandos y su salida):

```html
<pre class="consola"><code><span class="prompt">$</span> ls
<span class="salida">notas.txt  proyecto</span></code></pre>
```

Comparar bien/mal: `div.comparar` con dos `div` que tienen `p.comparar-rotulo.mal` / `.bien` y su `pre`.
Tablas: siempre dentro de `<div class="tabla"><table>…</table></div>`.
Procedimientos donde el orden importa: `<ol class="pasos"><li><div><p>…</p></div></li></ol>`.
Teclas: `<kbd>Ctrl</kbd>`.

### Diagrama SVG estático

```html
<figure class="diagrama">
  <svg viewBox="0 0 720 300" role="img" aria-label="Descripción completa del diagrama">…</svg>
  <figcaption>Qué muestra el diagrama.</figcaption>
</figure>
```

Nunca uses colores literales: usa clases (respetan el tema claro/oscuro):
`d-caja` (rectángulo con borde), `d-caja-suave`, `d-linea`, `d-flecha`, `d-punteada`, `d-acento` (relleno del color
de la línea), `d-acento-trazo`, `d-sobre-acento` (texto sobre el acento), `d-tenue` (texto secundario),
`d-fondo`, `d-fondo-2`, `d-tinta`, `d-mono`, `d-rotulo`, `d-titulo`, `d-peq`, `d-ok`/`d-mal`/`d-aviso` (rellenos
semánticos), `d-ok-trazo`/`d-mal-trazo`, `d-sobre-ok`/`d-sobre-mal`/`d-sobre-aviso` (texto legible encima de esos rellenos), `d-l1`…`d-l8` (rellenos de color de cada línea), `d-t1`…`d-t8` (trazos),
`d-codigo` (fondo de código), `d-solido`/`d-solido-trazo` (oscuro en los dos temas: muros, bloques sólidos), `d-codigo-texto`, `d-codigo-tenue`, `d-resalte` (resaltado de línea; es translúcido: si hay líneas detrás, pon debajo una forma `d-fondo`).
El `<svg>` pone color de tinta, tipografía y 16px por herencia: una clase en un `<g>` (por ejemplo `d-peq` o `d-ok`) afecta a todos sus textos. En `data-texto`, `data-clases` y `data-mover` las entradas se separan con `;` seguido del número de paso, así que un texto puede contener `;` siempre que no vaya seguido de «número:». Deja margen en el `viewBox` para etiquetas.
Puntas de flecha: dibújalas como `<path class="d-tinta" d="M… l12 8 -12 8z"/>` (sin `marker`).
Geometría precisa, nada de dibujos «a mano alzada» ni figuras humanas.

### Cápsula animada (explicación paso a paso con controles de video)

```html
<figure class="capsula" data-titulo="Título corto">
  <div class="capsula-escena">
    <svg viewBox="0 0 720 270" role="img" aria-label="Resumen de toda la animación">
      <g data-pasos="2-">…</g>                          <!-- visible desde el paso 2 -->
      <text data-pasos="2-3">…</text>                    <!-- visible en los pasos 2 y 3 -->
      <rect data-pasos="1,4"/>                           <!-- visible en los pasos 1 y 4 -->
      <g data-mover="3:translate(120px,0px); 5:translate(240px,40px)">…</g>
      <rect class="d-caja" data-clases="2:d-acento; 4:d-ok"/>   <!-- clases según el paso -->
      <text data-texto="1:0; 2:1; 3:2">0</text>          <!-- texto según el paso -->
    </svg>
  </div>
  <figcaption>
    <ol class="capsula-pasos">
      <li>Narración del paso 1.</li>
      <li data-duracion="6">Paso 2 (segundos opcionales; por defecto 5).</li>
    </ol>
  </figcaption>
</figure>
```

Reglas: 3–8 pasos. Si un elemento rotado (`transform="rotate(…)"`) también se anima o cambia de texto, envuélvelo en un `<g>` y pon las marcas en el `<g>`. No pongas `opacity` en el atributo `style` de un elemento animado: usa `fill-opacity` o `stroke-opacity`. Cada `li` explica lo que cambia en ese paso. El paso 1 debe entenderse solo (es lo que se ve
en reposo). `data-mover`, `data-clases` y `data-texto` aplican el último valor cuyo número de paso sea ≤ al actual.
En los pasos anteriores a la primera entrada de `data-clases`, esas clases se quitan del elemento aunque estén en su
atributo `class`: si una clase debe verse desde el principio, añade también la entrada `1:clase`.
Usa `px` en `translate`. Para contenido HTML (no SVG) la escena puede tener `div`s con las mismas marcas.

### Traza (máquina paso a paso)

```html
<div class="traza" data-titulo="Qué hace este programa">
  <pre><code class="language-js">let a = 2;
let b = a * 3;
console.log(b);</code></pre>
  <script type="application/json">[
    {"linea": 1, "vars": {"a": "2"}, "nota": "Qué pasó en esta línea."},
    {"linea": 2, "vars": {"a": "2", "b": "6"}, "nota": "…"},
    {"linea": 3, "vars": {"a": "2", "b": "6"}, "salida": "6", "nota": "…"}
  ]</script>
</div>
```

`linea` es la línea que se acaba de ejecutar; `vars` es la memoria completa **después** de ejecutarla (valores como
texto; los strings con comillas: `"\"Ana\""`); `salida` es lo que esa línea imprime. Para bucles, repite pasos por
cada vuelta. `data-rotulo-memoria` cambia el título «Memoria (variables)». `data-sin-salida` oculta el panel de consola (útil en trazas de HTML o CSS); `data-rotulo-salida` cambia el título «Consola» (por ejemplo, «Pantalla»). Si el primer paso tiene `"linea": 0`, se usa como estado inicial (por ejemplo, variables que ya existían).

### Taller (editor que ejecuta código de verdad)

JavaScript (se ejecuta en un Web Worker, sin DOM):

```html
<div class="taller" id="taller-unico" data-titulo="Pruébalo">
  <textarea class="taller-codigo">console.log("hola");</textarea>
  <script type="text/plain" class="taller-verificar">
    // salida: líneas de console.log; codigo: texto del editor; errores: líneas de console.error/warn
    if (!codigo.includes("let")) return "Usa let para…";
    return salida[0] === "hola" || "La primera línea debería ser «hola».";
  </script>
</div>
```

- `data-esperado="línea 1&#10;línea 2"` es un atajo: compara la salida exacta (ignora los espacios al principio y al final de cada línea; para arte ASCII o sangrías escribe una verificación propia).
- La verificación devuelve `true` (correcto) o un texto que explica qué falta. Escribe mensajes útiles y amables.
- Formato de la consola (igual que Node.js): strings tal cual; arrays `[ 1, 2 ]`; objetos `{ a: 1, b: 'x' }`;
  Map `Map(1) { 'a' => 1 }`. Prefiere verificar valores simples.
- Opcionales: `data-tiempo="10"` (segundos máximos, por defecto 5), `data-exito="mensaje"`.
- Probar funciones de la persona con casos ocultos: `data-exponer="aEstrella, vecinos"` en el taller. La verificación
  recibe un cuarto parámetro, `expuesto`, con esos nombres del código de la persona (funciones, clases o variables de
  nivel superior): `return expuesto.aEstrella && expuesto.aEstrella(mapa, a, b).length === 7 || "…"`. Si el programa se
  rompe antes de terminar o el nombre no existe, `expuesto.aEstrella` vale `undefined`: devuelve un mensaje que lo diga
  («No encuentro la función aEstrella: ¿se llama así y el programa terminó sin errores?»). No hace falta que la persona
  escriba nada especial.
- La verificación de un taller JS (no web) es **síncrona**: no soporta que devuelva una Promise. Si necesitas probar una
  función `async` de la persona (por ejemplo, con reintentos o una demora simulada), no esperes su resultado desde la
  verificación; haz que el propio código del taller (que sí corre dentro de un IIFE `async` con `await` de nivel
  superior) ejecute los casos de prueba y deje el resultado ya resuelto en una variable de nivel superior
  (`var resultados = …`), y pruébala con `data-exponer="resultados"` en vez de con la función async directamente.
- Hay `console.log/info/dir/error/warn/table/group/groupEnd/count/time/timeEnd/assert/trace`, `setTimeout`, promesas y `await` de nivel superior. No hay `document`, `prompt` ni `alert` útiles.
- `fetch` a otros sitios **no funciona en la versión publicada** del curso (el visor bloquea las peticiones
  externas). En talleres, simula la red con una función que devuelve una promesa (`setTimeout` + datos de ejemplo)
  y muestra el `fetch` real como bloque de código para probar en la consola del navegador o en Node.
- Dentro de `<textarea>` el código va literal (no escapes `<`), pero nunca escribas `</textarea>`.
  Dentro de `<script type="text/plain">` nunca escribas `</script>`. Un taller no contiene `</div>` interno.

Página web (HTML/CSS/JS con vista previa):

```html
<div class="taller" data-modo="web" data-titulo="…" data-alto="22rem" data-auto>
  <textarea class="taller-codigo" data-lenguaje="html">&lt;h1&gt;Hola&lt;/h1&gt;</textarea>
  <textarea class="taller-codigo" data-lenguaje="css">h1 { color: tomato; }</textarea>
  <textarea class="taller-codigo" data-lenguaje="js">console.log("listo");</textarea>
  <script type="text/plain" class="taller-verificar">
    // corre dentro de la página: tienes document; codigo = { html, css, js }
    return document.querySelector("h1") !== null || "Falta el h1.";
  </script>
</div>
```

Cuándo se verifica un taller web: 0,15 s después de cargar la vista previa. Si la página necesita tiempo (una animación,
un entrenamiento, un temporizador), usa `data-esperar="2"` (segundos) o haz que la verificación devuelva una promesa.
Además, la propia página puede llamar a `comprobar()` para verificar otra vez, por ejemplo cuando la persona mueve un
deslizador o cuando termina un entrenamiento: así la verificación ve el estado nuevo. Lo más robusto es verificar
funciones globales puras (`window.clasifica`, `window.pasoDeEntrenamiento`) y no el estado de una animación en marcha.
`data-auto` ejecuta al cargar (útil para demos). En la vista previa la validación nativa de formularios funciona (required, pattern…); al enviar un formulario válido o pulsar un enlace externo se muestra un aviso en la consola en vez de navegar; los enlaces `#id` desplazan dentro de la vista previa. `localStorage` y `sessionStorage` funcionan dentro del taller web: los datos de `localStorage` duran entre ejecuciones del mismo taller y «Reiniciar» los borra (no hace falta ningún ayudante propio). Los errores indican la línea contando desde la pestaña JS, y `console.log` de un elemento muestra su etiqueta (`<p id="n">`). El HTML puede cargar librerías con
`<script src="https://cdnjs.cloudflare.com/ajax/libs/...">` (versiones exactas), por ejemplo React 18.3.1 UMD
(`react/18.3.1/umd/react.development.js` y `react-dom/18.3.1/umd/react-dom.development.js`) con
`babel-standalone/7.26.4/babel.min.js` para JSX, o `phaser/3.90.0/phaser.min.js`. Solo cdnjs, solo scripts. Pon
`crossorigin="anonymous"` en esas etiquetas: sin él, un error que salte dentro de la librería (por ejemplo, un JSX mal
escrito que compila Babel) solo aparece como «Script error.». Verificar talleres de React: React actualiza el DOM de
forma asíncrona, así que en la verificación envuelve los clics simulados en `ReactDOM.flushSync(() => boton.click())`
y, para escribir en un campo controlado, usa el setter nativo de `value` y dispara un evento `input` con `bubbles: true`.
`console.log` entiende las sustituciones `%s`, `%d`, `%i`, `%f`, `%o` y `%c` como Node y los navegadores. Con Phaser, pon `banner: false` en la
configuración del juego para que no llene la consola del taller con su anuncio.

Python (se ejecuta con Brython en el navegador; se verifica con Python real en las pruebas):

```html
<div class="taller" data-modo="python" data-titulo="…">
  <textarea class="taller-codigo">print("hola")</textarea>
  <script type="text/plain" class="taller-verificar">return salida[0] === "hola" || "…";</script>
</div>
```

No uses `input()` en talleres (no funciona en todos los visores). En Brython, `random` no reproduce las secuencias de
CPython aunque uses la misma semilla (las pruebas se ejecutan con Python real): no verifiques números aleatorios exactos;
si necesitas azar reproducible, escribe un generador de pocas líneas en el propio taller. La biblioteca estándar (`random`, `math`, `json`,
`datetime`…) funciona; paquetes externos (`requests`, `pandas`…) no.

JavaScript con código de preparación oculto: `<script type="text/plain" class="taller-preparacion">…</script>` dentro
de un taller JS se ejecuta antes que el código de la persona, que puede usar lo que declara (por ejemplo, un
simulador pequeño de una biblioteca). No se ve en el editor y no cambia los números de línea de los errores. Úsalo
cuando el mismo código de apoyo se repetiría en varios talleres (también para dar datos, un simulador de API o una
biblioteca pequeña ya hecha).

SQL (SQLite real en el navegador):

```html
<div class="taller" data-modo="sql" data-titulo="…">
  <script type="text/plain" class="taller-preparacion">CREATE TABLE …; INSERT INTO …;</script>
  <textarea class="taller-codigo">SELECT * FROM personas;</textarea>
  <script type="text/plain" class="taller-verificar">
    // resultados: [{ columns: [...], values: [[...], ...] }] por cada consulta que devuelve filas
    return resultados[0] && resultados[0].values.length === 2 || "…";
  </script>
</div>
```

### Ejercicio

```html
<article class="ejercicio" data-nivel="guiado" id="ej-nombre-corto">
  <h3>Título del ejercicio</h3>
  <p>Enunciado claro, con la salida exacta esperada si aplica.</p>
  <div class="taller" id="taller-ej-nombre" data-titulo="Ejercicio 1">…</div>
  <details class="pista"><summary>Pista 1</summary><p>…</p></details>
  <details class="pista"><summary>Pista 2</summary><p>…</p></details>
  <details class="solucion"><summary>Ver una solución</summary>
    <pre><code class="language-js">…solución completa que pasa la verificación…</code></pre>
    <p>Por qué funciona / alternativas.</p>
  </details>
</article>
```

`data-nivel`: `guiado`, `semi` o `reto`. La primera `details.solucion` después de un taller es su solución y
**debe pasar la verificación** (lo comprueba `node herramientas/probar-talleres.mjs`). El código inicial no debe
pasarla ya. En estaciones sin código ejecutable (por ejemplo, conceptos o herramientas que se instalan), los
ejercicios pueden ser tareas guiadas con lista de comprobación, preguntas de predicción o talleres JS que simulan
el concepto.

### Ordenar líneas (problema de Parsons)

```html
<div class="parsons" data-titulo="Ordena el algoritmo" data-lenguaje="text">
  <ol>
    <li>Primera línea en el orden correcto</li>
    <li data-sangria="1">Segunda (sangría opcional de 1 nivel)</li>
    <li>Tercera</li>
  </ol>
</div>
```

Opcional: `data-exito="mensaje"` cambia el mensaje de acierto. `data-sangria` admite de 0 a 4 niveles. Escribe las líneas **en el orden correcto**: la página las desordena y la persona las ordena. Si varias líneas pueden ir en cualquier orden entre sí, dales el mismo `data-grupo="a"`: la corrección acepta cualquier orden dentro del grupo.

### Terminal simulada (comandos y Git sin instalar nada)

```html
<div class="terminal-sim" data-titulo="Tu primera carpeta" data-inicio="/home/tu">
  <script type="application/json" class="terminal-sistema">{"notas.txt": "hola", "fotos": {}}</script>
  <script type="text/plain" class="terminal-mision">
    // sistema: objeto de carpetas/archivos actual; historial: comandos escritos; git: estado del repositorio
    return !!(sistema.proyecto && sistema.proyecto["index.html"] !== undefined) || "Crea la carpeta proyecto con un index.html dentro.";
  </script>
</div>
```

Dentro del JSON de `terminal-sistema`, un `</script>` literal corta el bloque: escríbelo `<\/script>` (es JSON válido y
significa lo mismo). `construir.mjs` avisa si el JSON no es válido.

Instrucciones visibles dentro de la terminal (opcional): `<div class="terminal-instrucciones"><p>…</p></div>` dentro del
`div.terminal-sim`. La misión recibe también `salida` (líneas que imprimieron los comandos y `node`).
Comandos: `pwd ls cd mkdir touch cat echo (con > y >>) rm rmdir mv cp clear help history`, `node archivo.js` (ejecuta el archivo con el motor de los talleres; `node -v`), `cp -r`, comodines `*` y `?`, y
`git init status (-s) add (respeta .gitignore) commit (-m, -am, --amend) log (--oneline) show branch switch checkout merge (con conflictos y --abort) diff restore config`.
El `git` que recibe la misión (o `null` sin repositorio) es `{ raiz, rama, ramas: [nombres], punteros: { rama: idDelCommit }, commits: [{ id, mensaje, padres, arbol, rama }], preparados: [archivos], conflictos: [archivos], fusionEnCurso, limpio }`.

### Objetivos, autoevaluación, glosario, videos, recursos

```html
<ul class="objetivos"><li>Crear…</li></ul>

<div class="quiz">
  <div class="pregunta" data-correcta="2">          <!-- número de la opción correcta, desde 1 -->
    <p class="enunciado">¿…?</p>
    <ol class="opciones">
      <li>Opción A<p class="explica">Por qué no (o por qué sí).</p></li>
      …4 opciones, cada una con su explicación…
    </ol>
  </div>
</div>

<dl class="glosario"><dt>Término</dt><dd>Definición sencilla en una o dos frases.</dd></dl>

El glosario global junta los términos con el mismo nombre (sin contar lo que va entre paréntesis) y muestra la
definición de la primera estación. Si un término significa otra cosa en tu estación, dale un nombre distinto: por
ejemplo, «Token de un modelo de lenguaje» (no «Token», que ya es el del analizador léxico de la Estación 22) o
«Agente de aprendizaje por refuerzo» (no «Agente»).

<ul class="videos">
  <li><a class="video" href="https://www.youtube.com/watch?v=ID11CARACT" data-canal="Nombre exacto del canal"
     data-idioma="es" data-nivel="intro|profundo|curso" data-duracion="12 min" data-por-que="Una frase.">Título</a></li>
</ul>

<ul class="recursos">
  <li><a href="https://…">Título (Fuente)</a><p>Para qué sirve.</p></li>
</ul>
```

Varía la posición de la respuesta correcta en la autoevaluación. Los distractores son errores que de verdad comete
la gente.

## 6. Videos y enlaces: verificación obligatoria

- Cada video se verifica con
  `curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json"`.
  Solo se incluyen videos cuya respuesta es JSON; el título y el canal se copian de esa respuesta
  (puedes quitar emojis del título). Nunca inventes un ID.
- Prioriza español y canales educativos reconocidos; marca `data-idioma="en"` si es en inglés.
- Cada enlace de `recursos` se verifica con `curl -sL -o /dev/null -w "%{http_code}"` (200; con GET, porque algunos sitios responden 404 a HEAD).
  Prioriza MDN en español, documentación oficial y javascript.info en español.

## 7. Comprobaciones antes de terminar

```bash
node herramientas/construir.mjs            # sin avisos para tu estación
node herramientas/probar-talleres.mjs NN   # todo correcto
```

Revisa además: HTML bien cerrado, ids únicos en la página, todos los `<` escapados dentro de `<pre>`,
nada de colores literales, ningún emoji, y que cada término técnico esté explicado antes de usarse.

## 8. Qué no hacer

- No repetir en detalle lo que es dueño de otra estación: enlázala (`mustNotReteach`).
- No usar iconos emoji ni caracteres Unicode como iconos; no incrustar iframes de YouTube.
- No usar `<style>` ni colores literales; no añadir fuentes. Si necesitas un widget propio, colócalo en un
  `<div class="widget" id="…">` con un `<script>` en IIFE que no cree variables globales, que use las clases y tokens
  existentes y que funcione en tema claro y oscuro y en móvil (hazlo solo si ningún componente sirve).

## 9. Datos vigentes (septiembre de 2026)

- Node.js 24 «Krypton» es la LTS activa (24.21.0 a finales de septiembre de 2026); Node.js 26 pasa a LTS el 28 de
  octubre de 2026. Recomienda «la versión LTS más reciente» y muestra cómo comprobarla (`node --version`).
- VS Code publica versión estable cada semana: evita capturas de pantalla, describe las zonas con diagramas.
- Chrome activa «Usar siempre conexiones seguras» por defecto desde la versión 154.
- Cuando no estés seguro de una versión o comportamiento actual, compruébalo en la documentación oficial.
