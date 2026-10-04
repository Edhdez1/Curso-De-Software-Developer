# Firma única de cada estación

Este documento responde a una petición concreta: que cada estación tenga algo propio, para que no parezca «la misma clase con otro contenido».

**Estado honesto:** solo las estaciones 1 y 2 están construidas. Las otras 55 tienen aquí una *ficha de diseño* (una guía para cuando se escriban), no un contenido terminado. Los datos completos están en `datos/plan-v2/firmas.json`.

## Qué es una «firma»

Cada estación combina tres cosas que la distinguen de sus vecinas:

1. **Mecanismo:** la herramienta interactiva que usas en la página (por ejemplo, una tabla de combinaciones, un depurador paso a paso o un museo de errores).
2. **Modo de proyecto:** qué haces en el proyecto final de la estación (crear desde cero, reparar algo roto, extender un programa, traducirlo a otro lenguaje, etc.).
3. **Estilo del video:** cómo se ve la animación de la estación (paneles oscuros, cinta transportadora, pizarra, plano azul, etc.).

## Reglas que se cumplen

- Ninguna estación repite mecanismo, estilo de video ni modo de proyecto con la estación de al lado.
- Dentro de una misma línea no se repite el mecanismo ni el estilo de video.
- Cada estación usa como máximo un widget nuevo (una herramienta interactiva propia), hecho con los componentes del sitio.
- Desde la estación 38 (C#, MAUI, Unity, C, Rust, Go) ningún mecanismo ejecuta código tuyo en el navegador, porque el navegador no puede ejecutar esos lenguajes.
- Los 57 nombres de firma son distintos entre sí.

## Límites que conviene saber

- Hay 16 mecanismos, 14 estilos de video y 14 modos para 57 estaciones, así que cada uno se reutiliza entre 2 y 5 veces, nunca en estaciones contiguas ni en la misma línea (salvo el modo de proyecto, ver abajo). Tres estilos (pizarra, cuaderno y laboratorio) se usan 5 veces; añadir dos estilos nuevos (por ejemplo pixel art o serigrafía) los bajaría a 4. Eso lo decides tú; no se ha hecho.
- Los modos de proyecto sí se repiten dentro de una línea en cinco casos, siempre en estaciones no contiguas: 6 y 9, 12 y 15, 32 y 35, 38 y 41, 49 y 52.
- Las fichas «condensadas» (53 de 57) son un resumen. Antes de escribir cada estación hay que ampliarlas; `datos/plan-v2/firmas-borrador-detallado.json` guarda un borrador previo con más detalle que sirve de cantera de ideas, aunque algunos nombres y mecanismos cambiaron después de la revisión.
- Tres revisores independientes (repetición, viabilidad y didáctica) encontraron 86 problemas, 76 de severidad media o alta; las fichas se reasignaron para atenderlos. El detalle está en `datos/plan-v2/firmas-revision.json`.
- Varios videos comparten el mismo esqueleto (unos 45 segundos, cinco escenas, cierre con tres ideas). Cambiar el estilo del fondo no basta: conviene variar también la estructura y el cierre. Queda como mejora pendiente.

## Trabajo previo que algunas estaciones necesitan

Estas son condiciones de la plataforma que hay que cumplir antes de redactar las estaciones indicadas:

- Una protección contra bucles sin fin en la terminal simulada (estaciones 4, 5, 13 y 15).
- Un módulo compartido de Express para las estaciones 32 a 37.
- Un comprobador visible en lugar de casos ocultos en Python (estaciones 3, 21, 22, 23, 24 y 26).
- Un contrato fijo de tablas y columnas para la estación 25.
- Un subconjunto acotado de la API para la estación 35.
- Recortes de alcance en las estaciones 43, 46, 49 y 50.

## Las 57 firmas

| N.º | Estación | Nombre de la firma | Modo de proyecto | Mecanismo | Estilo del video |
|---|---|---|---|---|---|
| 1 | **Tu primer programa** | Arranque en Terminal | crear desde cero | terminal guiada | paneles oscuros codigo a pantalla |
| 2 | **Tipos de datos** | Aduana de Tipos | reparar codigo roto | laboratorio combinaciones | cinta transportadora aduana |
| 3 | Decisiones | Duelo de dados | mini juego o simulacion | adversario de pruebas | pizarra a mano trazos |
| 4 | Bucles | Rompecabezas de salida | deducir programa desde su salida | ordenar bloques | cuaderno cuadriculado |
| 5 | Proyecto: tareas | Ensamblaje de sesiones | integrar piezas existentes | constructor visual | plano azul arquitecto |
| 6 | Funciones | Banco de Cajas Negras | refactorizar y mejorar | caja negra | laboratorio cientifico diagramas |
| 7 | Módulos y librerías | Estantes del entorno | completar huecos guiado | terminal guiada | terminal retro crt |
| 8 | Objetos y clases | Taller de moldes | crear desde cero | simulador de memoria | tablero de juego |
| 9 | Herencia | Árbol de herencia | refactorizar y mejorar | mapa interactivo | tarjetas apiladas |
| 10 | Proyecto: carrito | Museo de Excepciones | escribir pruebas primero | museo de errores | tipografia cinetica |
| 11 | Listas y diccionarios | Quién apunta a quién | reparar codigo roto | simulador de memoria | cuaderno cuadriculado |
| 12 | Conjuntos | Bata y cronómetro | datos reales analizar | cronometro de complejidad | laboratorio cientifico diagramas |
| 13 | Buscar y ordenar | Carrera de pasos | medir y comparar | tablero visual de algoritmos | pizarra a mano trazos |
| 14 | Recursión | Detén la pila | escribir pruebas primero | depurador puntos ruptura | tipografia cinetica |
| 15 | Proyecto: analizador | Archivo hostil | datos reales analizar | adversario de pruebas | linea de tiempo horizontal |
| 16 | Bases de datos y SQL | Huecos de SQLite | completar huecos guiado | simulador de memoria | paneles oscuros codigo a pantalla |
| 17 | Consultas SQL | Tabla misteriosa | deducir programa desde su salida | caja negra | mapa de metro animado |
| 18 | SQLite y Python | Entrevista al código | revisar codigo ajeno | entrevista de codigo | terminal retro crt |
| 19 | ORM con SQLAlchemy | Pareja de versiones | refactorizar y mejorar | comparador lado a lado | isometrico 3d |
| 20 | Proyecto: reportes | Reporte por tres rutas | medir y comparar | cronometro de complejidad | tablero de juego |
| 21 | Ventanas con Tkinter | Armaventanas | extender programa dado | ordenar bloques | comic de paneles |
| 22 | Diseño de interfaz | Inspección de obra | reparar codigo roto | escenario ramificado | plano azul arquitecto |
| 23 | Archivos en la interfaz | Inspector de disco | crear desde cero | simulador de memoria | pizarra a mano trazos |
| 24 | Plantillas Jinja2 | Moldes y datos | completar huecos guiado | laboratorio combinaciones | cuaderno cuadriculado |
| 25 | Vault v1: datos | Anatomía del esquema | disenar antes de codificar | constructor visual | laboratorio cientifico diagramas |
| 26 | Vault v1: interfaz | Empalmes del Vault | integrar piezas existentes | simulador de red o sistema | cinta transportadora aduana |
| 27 | JavaScript básico | Tablero de equivalencias | traducir a otro lenguaje | tablero visual de algoritmos | tablero de juego |
| 28 | Async y promesas | Autopsia de una bitácora | deducir programa desde su salida | depurador puntos ruptura | linea de tiempo horizontal |
| 29 | Eventos y DOM | Mapa del clic | crear desde cero | mapa interactivo | comic de paneles |
| 30 | TypeScript | Reloj de errores | refactorizar y mejorar | laboratorio combinaciones | tipografia cinetica |
| 31 | Proyecto: galería | Ataques resistidos | integrar piezas existentes | adversario de pruebas | tarjetas apiladas |
| 32 | Express.js | El servidor que no termina | disenar antes de codificar | terminal guiada | isometrico 3d |
| 33 | Rutas | Cuaderno de hallazgos | extender programa dado | laboratorio combinaciones | cinta transportadora aduana |
| 34 | Acceso JWT | La revisión de Marta | revisar codigo ajeno | simulador de red o sistema | comic de paneles |
| 35 | Datos en Express | Dos modelos, un blog | disenar antes de codificar | comparador lado a lado | laboratorio cientifico diagramas |
| 36 | Pruebas de APIs | Cazamutantes | escribir pruebas primero | adversario de pruebas | paneles oscuros codigo a pantalla |
| 37 | Proyecto: backend | Líneas cortadas | integrar piezas existentes | mapa interactivo | mapa de metro animado |
| 38 | C# básico | Errores en lote | traducir a otro lenguaje | terminal guiada | tarjetas apiladas |
| 39 | POO en C# | Seis meses después | extender programa dado | comparador lado a lado | isometrico 3d |
| 40 | LINQ | Cinta de consultas | datos reales analizar | tablero visual de algoritmos | cinta transportadora aduana |
| 41 | APIs con ASP.NET | Contrato de nueve peticiones | traducir a otro lenguaje | laboratorio combinaciones | plano azul arquitecto |
| 42 | Proyecto: consola | Olores y commits | refactorizar y mejorar | ordenar bloques | cuaderno cuadriculado |
| 43 | Intro a MAUI | La Maqueta Viva | completar huecos guiado | constructor visual | comic de paneles |
| 44 | MVVM | El Circuito de Avisos | extender programa dado | simulador de red o sistema | pizarra a mano trazos |
| 45 | Acceso y datos | Comentarios que ayudan | revisar codigo ajeno | comparador lado a lado | cuaderno cuadriculado |
| 46 | Vault v2: estructura | Recorridos de la app | disenar antes de codificar | mapa interactivo | plano azul arquitecto |
| 47 | Vault v2: funciones | La Cadena de Montaje | integrar piezas existentes | ordenar bloques | linea de tiempo horizontal |
| 48 | Publicar en tiendas | Preflight de tiendas | reparar codigo roto | tablero visual de algoritmos | mapa de metro animado |
| 49 | Intro a Unity | Escena en blanco | mini juego o simulacion | constructor visual | tablero de juego |
| 50 | Gráficos y animación | Máquina de estados | completar huecos guiado | simulador de red o sistema | laboratorio cientifico diagramas |
| 51 | Audio y controles | Dos jugadas | extender programa dado | comparador lado a lado | tipografia cinetica |
| 52 | Juego 3D básico | El Cubo Fantasma | mini juego o simulacion | tablero visual de algoritmos | isometrico 3d |
| 53 | Proyecto: juego | Encrucijadas | disenar antes de codificar | escenario ramificado | tarjetas apiladas |
| 54 | C y memoria | Programa fantasma | deducir programa desde su salida | simulador de memoria | terminal retro crt |
| 55 | Rust | Galería de rustc | traducir a otro lenguaje | museo de errores | pizarra a mano trazos |
| 56 | Go | Hora punta | medir y comparar | simulador de red o sistema | mapa de metro animado |
| 57 | Proyecto final | Defensa del proyecto | crear desde cero | entrevista de codigo | linea de tiempo horizontal |

Las estaciones en negrita (1 y 2) ya están construidas. La línea de cada estación está en `datos/curso.json`.

## Cómo se usa al escribir una estación

1. Leer su ficha en `datos/plan-v2/firmas.json` (qué hace la persona, por qué no se parece a las vecinas, proyecto y video).
2. Ampliar la ficha si es condensada, consultando el borrador detallado.
3. Construir el widget propio, probarlo con datos reales de Python (o de la herramienta que corresponda) y dejar constancia de lo que no se pudo verificar.
4. Hacer el video con HyperFrames en el estilo indicado, diferente al de las estaciones vecinas.
