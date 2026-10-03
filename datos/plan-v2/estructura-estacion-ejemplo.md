# Estructura de Estación Completa - Ejemplo: Estación 1

## Datos (JSON)
```json
{
  "id": 1,
  "nombre": "Tu Primer Programa en Python",
  "linea": 1,
  "horas": 16,
  "temas": [
    "Instalación de Python",
    "Configuración del editor",
    "Hello World",
    "print() y variables"
  ],
  "descripcion": "Aprenderás a instalar Python, configura tu entorno y escribirás tu primer programa. Entenderás qué es una variable y cómo almacenar datos.",
  "ejercicios": [
    "Imprime tu nombre y edad",
    "Crea 3 variables y muéstralas en pantalla",
    "Programa que pide tu nombre y lo salude"
  ],
  "proyecto": "Presentador Personal - Programa que pregunta tu nombre, edad, ciudad y muestra un resumen",
  "herramientas": [
    "Python 3.11+",
    "Visual Studio Code",
    "Git Bash (Windows) o Terminal (Mac/Linux)"
  ],
  "librerías": [],
  "pluginsRecomendados": [
    "Python Extension (Microsoft)",
    "Code Runner (Jun Han)",
    "Better Comments (Aaron Bond)"
  ],
  "animacionHyperframes": {
    "titulo": "Animación: Tu Primer Programa",
    "descripcion": "Video de 1 minuto explicando qué es Python y cómo ejecutar tu primer programa",
    "duracion_segundos": 60,
    "archivo": "animaciones/estacion-01.html",
    "temas_visuales": [
      "Instalación de Python (visual del proceso)",
      "Estructura de un programa Python",
      "Variables y tipos de datos",
      "Función print() en acción"
    ],
    "herramientasAnimacion": [
      "HyperFrames (HTML + GSAP)",
      "FFmpeg (renderizado)",
      "Node.js 22+ (CLI)"
    ]
  }
}
```

---

## Archivos Físicos

### `/estaciones/01-tu-primer-programa/`
```
├── README.md                    # Lección principal
├── leccion.md                   # Explicación detallada
├── ejercicios.py               # Ejercicios para practicar
├── solucion.py                 # Solución de ejercicios
├── proyecto.py                 # Proyecto integrador base
└── animaciones/
    ├── estacion-01.html        # Composición HyperFrames
    ├── estacion-01.mp4         # Video renderizado (generado)
    └── frames/                 # Assets (imágenes, iconos)
        ├── python-logo.png
        └── terminal-animation.svg
```

---

## Contenido: Lección (README.md)

```markdown
# Estación 1: Tu Primer Programa en Python

## Duración: 16 horas

### Qué aprenderás
- [ ] Instalar Python 3.11+ en tu computadora
- [ ] Configurar VS Code para Python
- [ ] Entender qué es una variable
- [ ] Usar la función print()
- [ ] Ejecutar tu primer programa

### Video Animado
[Ver animación](animaciones/estacion-01.html)
- Duración: 1 minuto
- Explica: Instalación, estructura de programa, variables

### Herramientas que necesitas
1. **Python 3.11+** - El lenguaje
   - Descargar: https://python.org
   - Verificar: `python --version` en terminal

2. **VS Code** - Tu editor
   - Descargar: https://code.visualstudio.com
   - Extensión: Python Extension (Microsoft)

3. **Git** - Control de versiones
   - Windows: Git Bash
   - Mac/Linux: Terminal nativa

### Librerías
Ninguna en esta estación (Python puro)

### Plugins VS Code Recomendados
- **Python Extension** (Microsoft) - Autocompletado, debugger
- **Code Runner** (Jun Han) - Ejecutar Python con un clic
- **Better Comments** (Aaron Bond) - Comentarios más visuales

---

## Tema 1: Instalación de Python

### Windows
1. Ir a https://python.org/downloads
2. Descargar Python 3.11+ (64-bit)
3. Ejecutar instalador
4. **IMPORTANTE:** Marcar "Add Python to PATH"

### Mac
\`\`\`bash
brew install python3
\`\`\`

### Linux (Ubuntu/Debian)
\`\`\`bash
sudo apt-get install python3
\`\`\`

### Verificar instalación
\`\`\`bash
python --version
# Debe mostrar: Python 3.11.x o superior
\`\`\`

---

## Tema 2: Tu Primer Programa

Crea archivo `hola.py`:

\`\`\`python
# Mi primer programa en Python
print("¡Hola, mundo!")
\`\`\`

Ejecuta:
\`\`\`bash
python hola.py
\`\`\`

Resultado:
\`\`\`
¡Hola, mundo!
\`\`\`

---

## Tema 3: Variables

\`\`\`python
# Crear variables
nombre = "Juan"
edad = 25
altura = 1.75

# Mostrar variables
print(nombre)      # Juan
print(edad)        # 25
print(altura)      # 1.75
\`\`\`

---

## Ejercicios

### Ejercicio 1
Crea un programa que defina 3 variables (nombre, edad, ciudad) y las imprima en pantalla.

**Solución en:** [ejercicios.py](./ejercicios.py)

### Ejercicio 2
Crea un programa que pida tu nombre (usa `input()`) y lo imprima:

\`\`\`python
nombre = input("¿Cuál es tu nombre? ")
print("Hola, " + nombre + "!")
\`\`\`

---

## Proyecto: Presentador Personal

Crea un programa que:
1. Pregunte nombre, edad, ciudad
2. Calcule año de nacimiento (aproximado)
3. Muestre un resumen:

\`\`\`
Bienvenido a Presentador Personal
====================================
Nombre: Juan
Edad: 25
Ciudad: Madrid
Año de nacimiento aprox: 1999
\`\`\`

**Base en:** [proyecto.py](./proyecto.py)

---

## Recursos
- [Documentación oficial Python](https://docs.python.org/3/)
- [VS Code + Python](https://code.visualstudio.com/docs/languages/python)
- [Comunidad Discord](link)

---

## Siguiente Estación
Estación 2: Tipos de Datos Esenciales
\`\`\`

---

## Contenido: Animación (HyperFrames HTML)

```html
<!-- animaciones/estacion-01.html -->
<div id="stage" data-composition-id="estacion-01" 
     data-start="0" data-width="1920" data-height="1080">
  
  <!-- Fondo -->
  <div style="width: 100%; height: 100%; background: #0d1117;"></div>
  
  <!-- Título: "Tu Primer Programa" -->
  <h1 id="title" class="clip" data-start="0" data-duration="2" 
      style="color: #58a6ff; font-size: 72px; margin-top: 100px;">
    Tu Primer Programa en Python
  </h1>
  
  <!-- Código Python aparece lentamente -->
  <pre id="code" class="clip" data-start="2" data-duration="8"
       style="color: #79c0ff; font-size: 36px; margin-left: 100px;">
print("¡Hola, mundo!")
  </pre>
  
  <!-- Terminal output aparece -->
  <div id="output" class="clip" data-start="10" data-duration="5"
       style="color: #7ee787; background: #0d1117; 
              padding: 20px; margin-left: 100px;">
    ¡Hola, mundo!
  </div>
  
  <!-- Animación con GSAP -->
  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.from("#title", { opacity: 0, y: -50, duration: 0.8 }, 0);
    tl.from("#code", { opacity: 0, x: -100, duration: 1 }, 2);
    tl.from("#output", { opacity: 0, scale: 0.8, duration: 0.6 }, 10);
    window.__timelines = window.__timelines || {};
    window.__timelines['estacion-01'] = tl;
  </script>
</div>
```

**Generar video:**
```bash
npx hyperframes render animaciones/estacion-01.html --output videos/estacion-01.mp4
```

---

## Contenido: Ejercicios

```python
# ejercicios.py - Estación 1

# EJERCICIO 1: Tres variables
nombre = "Juan"
edad = 25
ciudad = "Madrid"

print(nombre)
print(edad)
print(ciudad)

# EJERCICIO 2: Con input()
nombre = input("¿Cuál es tu nombre? ")
print("Hola, " + nombre + "!")

# EJERCICIO 3: Calcular año de nacimiento
edad = int(input("¿Cuántos años tienes? "))
año_nacimiento = 2026 - edad
print(f"Año de nacimiento aprox: {año_nacimiento}")
```

---

## Resumen

✅ **Completaste Estación 1 si:**
- [ ] Python instalado y verificado
- [ ] VS Code con Python Extension
- [ ] Ejecutaste `print("Hola")`
- [ ] Creaste 3 variables y las imprimiste
- [ ] Completaste el Proyecto Presentador Personal

🎯 **Siguiente:** Estación 2 - Tipos de Datos Esenciales
