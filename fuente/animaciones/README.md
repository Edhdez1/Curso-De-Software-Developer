# Animaciones de las estaciones (HyperFrames)

Cada estación tiene un video corto, sin voz, hecho con [HyperFrames](https://github.com/heygen-com/hyperframes) (Apache 2.0): se escribe una página HTML con animaciones y HyperFrames la convierte en un MP4. Los videos terminados están en `../../videos/`.

| Estación | Proyecto | Estilo visual | Video |
|---|---|---|---|
| 1. Tu primer programa | `01-primer-programa/` | Paneles oscuros: del código a la pantalla | `videos/01-primer-programa.mp4` (45 s) |
| 2. Tipos de datos | `02-tipos-de-datos/` | Papel crema, cinta transportadora y aduana de datos | `videos/02-tipos-de-datos.mp4` (48,5 s) |
| 3. Control de flujo | `03-control-de-flujo/` | Pizarra verde a mano, una sola toma con la cámara recorriendo la pizarra | `videos/03-control-de-flujo.mp4` (48 s) |
| 4 a 57 | pendientes | cada una con un estilo propio | pendientes |

Cada estación debe tener un estilo distinto, para que no se sienta como la misma clase con otro tema.

## Rehacer un video

Necesitas Node.js 22 o posterior y FFmpeg. Desde la carpeta del proyecto (por ejemplo `02-tipos-de-datos/`):

```bash
npx hyperframes check
npx hyperframes render --output ../../../videos/02-tipos-de-datos.mp4 --fps 30 --crf 25
```

`check` revisa errores, diseño y contraste. Algunas notas aprendidas:

- Cada `index.html` carga GSAP desde el CDN oficial; para renderizar hace falta conexión a internet. Si tu entorno no puede descargarlo, trabaja en una copia con `gsap.min.js` local y no la subas.
- Un `check` que no pudo cargar GSAP no prueba nada (la línea de tiempo no se construye): exige `runtime.errorCount` 0 en `npx hyperframes check --json`.
- HyperFrames antepone la tipografía Inter a las familias genéricas (`sans-serif`, `monospace`), por lo que el código sale en tipografía proporcional en el video.
- HyperFrames envía contadores de uso anónimos; para desactivarlos: `HYPERFRAMES_NO_TELEMETRY=1`.
- Si usas el Chromium de Playwright, indica el navegador con `HYPERFRAMES_BROWSER_PATH`.

Los pasos para escribir una estación están en `docs/GUIA-REDACCION.md`.
