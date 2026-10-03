# Plan v2: estaciones nuevas (en construcción)

Aquí vive el contenido del plan nuevo (Python primero, luego JavaScript, C# y más). **El sitio actual no usa nada de esta carpeta**: sigue construyéndose con `datos/curso.json` y `fuente/modulos/`.

## Qué hay hoy

| Estación | Lección | Video (HyperFrames) |
|---|---|---|
| 1. Tu primer programa en Python | `modulos/01-primer-programa.html` (escrita) | `animaciones/01-primer-programa/` → `../videos/01-primer-programa.mp4` |
| 2. Tipos de datos | `modulos/02-tipos-de-datos.html` (en revisión) | `animaciones/02-tipos-de-datos/` → `../videos/02-tipos-de-datos.mp4` |
| 3 a 57 | pendientes | pendientes |

## Ver las estaciones

En línea: `https://edhdez1.github.io/Curso-De-Software-Developer/modulos-v2/01-primer-programa.html` (y la 02 con el mismo patrón, una vez fusionada). En tu computadora, lo más seguro es un servidor web local: ejecuta `python3 -m http.server` en la raíz del repositorio y entra a `http://localhost:8000/modulos-v2/01-primer-programa.html`. Así se probó. Los ejercicios de Python descargan el intérprete (Brython) de internet, así que hace falta conexión.

## Reconstruir la vista previa y probar los ejercicios

```bash
node herramientas/vista-previa-v2.mjs --probar
```

Copia el sitio a una carpeta temporal, construye la estación con el generador real (`construir.mjs`) y ejecuta los talleres con Python real. No modifica `fuente/`, `datos/` ni `modulos/`. Deja el resultado en `modulos-v2/`.

Los metadatos de las estaciones (número, título, promesa, horas) están en `meta/curso-v2-mini.json`. Cuando el plan v2 pase al sitio, esos datos se integran en `datos/curso.json`.

## Rehacer el video

Necesitas Node.js 22 o posterior y FFmpeg. Desde `animaciones/01-primer-programa/`:

```bash
npx hyperframes check
npx hyperframes render --output ../../../videos/01-primer-programa.mp4 --fps 30 --crf 24
```

HyperFrames envía contadores de uso anónimos; para desactivarlos: `HYPERFRAMES_NO_TELEMETRY=1`.

## Cómo se escribe una estación

Sigue `docs/GUIA-REDACCION.md` (formato, componentes, mínimos de calidad y verificación de enlaces y videos).
