// Genera las páginas del curso a partir de:
//   datos/curso.json          (líneas y estaciones)
//   datos/pictos.json         (pictogramas de cada estación)
//   datos/tiempo.json         (estimación de horas, opcional)
//   fuente/modulos/NN-slug.html  (contenido de cada módulo: solo <section>…)
// Uso: node herramientas/construir.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const leer = (p) => fs.readFileSync(path.join(RAIZ, p), "utf8");
const existe = (p) => fs.existsSync(path.join(RAIZ, p));
const escribir = (p, t) => { fs.mkdirSync(path.dirname(path.join(RAIZ, p)), { recursive: true }); fs.writeFileSync(path.join(RAIZ, p), t); };

const curso = JSON.parse(leer("datos/curso.json"));
const pictos = JSON.parse(leer("datos/pictos.json"));
const tiempo = existe("datos/tiempo.json") ? JSON.parse(leer("datos/tiempo.json")) : null;
const modulos = curso.modulos;
const avisos = [];

const esc = (t) => String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const archivoModulo = (m) => `${m.num}-${m.slug}.html`;
const lineaDe = (n) => curso.lineas.find((l) => l.n === n);
const horasTexto = (h) => (h === 1 ? "1 hora" : `${String(h).replace(".", ",")} horas`);

const FUENTES = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@400;600&family=Atkinson+Hyperlegible+Next:ital,wght@0,400;0,700;0,800;1,400&family=Barlow+Condensed:wght@600;700;800&family=Barlow+Semi+Condensed:wght@600;700&display=swap">';
const TEMA_TEMPRANO = "<script>try{var t=JSON.parse(localStorage.getItem('terminal-curso:v1')||'{}').tema;if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>";

const ICO = {
  reloj: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  mapa: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h5l3-6 4 12 3-6h3"/></svg>',
  libro: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"/></svg>',
  tema: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path class="ico-relleno" d="M12 4a8 8 0 0 1 0 16z"/></svg>',
  flechaIzq: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  flechaDer: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  requisito: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h9M10 7l5 5-5 5"/><path d="M19 5v14"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="6.5" r="2" fill="currentColor"/><path d="M12 11v8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  ojo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3L2 21h20z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M12 10v5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="18" r="1.4" fill="currentColor"/></svg>',
  error: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M6 6l12 12" stroke="currentColor" stroke-width="2.6"/></svg>',
  analogia: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/></svg>',
  clave: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="currentColor"/></svg>',
  oficio: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 6.5a4 4 0 0 0 5 5L11 20a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5"/></svg>',
};
const SENALES = {
  nota: { ico: ICO.info, titulo: "Dato" },
  ojo: { ico: ICO.ojo, titulo: "Cuidado" },
  error: { ico: ICO.error, titulo: "Error común" },
  analogia: { ico: ICO.analogia, titulo: "Para entenderlo" },
  clave: { ico: ICO.clave, titulo: "Idea clave" },
  oficio: { ico: ICO.oficio, titulo: "Consejo de oficio" },
};

const marca = (claseLinea = "var(--lc)") => `<svg viewBox="0 0 32 20" aria-hidden="true"><rect x="0" y="7" width="27" height="6" rx="3" fill="${claseLinea}"/><circle cx="10" cy="10" r="4.2" fill="var(--suelo)" stroke="var(--tinta)" stroke-width="2"/><rect x="25" y="1" width="6" height="18" rx="2" fill="var(--tinta)"/></svg>`;

const pictoSvg = (slug) => `<svg viewBox="0 0 48 48" aria-hidden="true">${(pictos[slug] || "<circle cx='24' cy='24' r='14'/>").replace(/'/g, '"')}</svg>`;

// ---------------------------------------------------------------------------
// Transformaciones del contenido de los módulos
// ---------------------------------------------------------------------------
function expandirSenales(html) {
  // <aside class="senal ojo" data-titulo="…"> contenido </aside>  ->  placa + cuerpo
  return html.replace(/<aside class="senal ([a-z]+)"([^>]*)>([\s\S]*?)<\/aside>/g, (todo, tipo, attrs, cuerpo) => {
    const def = SENALES[tipo];
    if (!def) { avisos.push(`Señal desconocida: ${tipo}`); return todo; }
    const t = (attrs.match(/data-titulo="([^"]*)"/) || [])[1];
    const titulo = t === undefined ? def.titulo : t;
    return `<aside class="senal ${tipo}"${attrs.replace(/\s*data-titulo="[^"]*"/, "")}><div class="senal-placa">${def.ico}</div><div class="senal-cuerpo">${titulo ? `<p class="senal-titulo">${titulo}</p>` : ""}${cuerpo.trim()}</div></aside>`;
  });
}

function expandirVideos(html) {
  // <a class="video" href="https://www.youtube.com/watch?v=ID" data-canal="…" data-idioma="es" data-nivel="intro" data-duracion="12 min">Título</a>
  return html.replace(/<a class="video"([^>]*)>([\s\S]*?)<\/a>/g, (todo, attrs, titulo) => {
    const href = (attrs.match(/href="([^"]+)"/) || [])[1] || "";
    const id = (href.match(/[?&]v=([\w-]{11})/) || href.match(/youtu\.be\/([\w-]{11})/) || [])[1];
    const canal = (attrs.match(/data-canal="([^"]*)"/) || [])[1] || "";
    const idioma = (attrs.match(/data-idioma="([^"]*)"/) || [])[1] || "es";
    const nivel = (attrs.match(/data-nivel="([^"]*)"/) || [])[1] || "";
    const duracion = (attrs.match(/data-duracion="([^"]*)"/) || [])[1] || "";
    const por = (attrs.match(/data-por-que="([^"]*)"/) || [])[1] || "";
    if (!id) avisos.push(`Video sin ID válido: ${href}`);
    const nivelTexto = { intro: "Introducción", profundo: "A fondo", curso: "Curso completo" }[nivel] || nivel;
    const miniatura = id ? `<img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg" alt="" loading="lazy" decoding="async" onerror="this.remove()">` : "";
    return `<a class="video" href="${esc(href)}"><span class="video-pantalla">${miniatura}<span class="reproducir"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path class="ico-relleno" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg></span><span class="canal-inicial">${esc(canal)}</span></span><span class="video-titulo">${titulo.trim()}</span><span class="video-meta"><span>${esc(canal)}</span>${duracion ? `<span>${esc(duracion)}</span>` : ""}<span class="chip">${idioma === "en" ? "Inglés (subtítulos)" : "Español"}</span>${nivelTexto ? `<span class="chip">${esc(nivelTexto)}</span>` : ""}</span>${por ? `<span class="nota-margen">${esc(por)}</span>` : ""}</a>`;
  });
}

function nivelEjercicios(html) {
  // <article class="ejercicio" data-nivel="guiado|semi|reto" id="…"><h3>…</h3>
  return html.replace(/<article class="ejercicio" data-nivel="(guiado|semi|reto)"([^>]*)>\s*<h3>([\s\S]*?)<\/h3>/g, (todo, nivel, attrs, titulo) => {
    const n = { guiado: 1, semi: 2, reto: 3 }[nivel];
    const texto = { guiado: "Guiado", semi: "Semiguiado", reto: "Reto" }[nivel];
    const barras = [1, 2, 3].map((i) => `<i${i <= n ? ' class="on"' : ""}></i>`).join("");
    return `<article class="ejercicio" data-nivel="${nivel}"${attrs}><header class="ejercicio-cabeza"><h3>${titulo}</h3><span class="nivel">${barras}${texto}</span></header>`;
  });
}

function seccionesDe(html) {
  const lista = [];
  const re = /<section id="([^"]+)"([^>]*)>\s*<h2[^>]*>([\s\S]*?)<\/h2>/g;
  let m;
  while ((m = re.exec(html))) {
    const corto = (m[2].match(/data-parada="([^"]*)"/) || [])[1];
    lista.push({ id: m[1], titulo: corto || m[3].replace(/<[^>]+>/g, "").trim() });
  }
  return lista;
}

function lenguajesDe(html) {
  const set = new Set();
  for (const m of html.matchAll(/language-([\w-]+)/g)) set.add(m[1]);
  for (const m of html.matchAll(/data-lenguaje="([\w-]+)"/g)) set.add(m[1]);
  if (/class="taller"/.test(html) || /class="traza"/.test(html)) set.add("js");
  return set;
}

const PRISM = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/";
const PRISM_DEPS = {
  js: ["clike", "javascript"], javascript: ["clike", "javascript"], ts: ["clike", "javascript", "typescript"], typescript: ["clike", "javascript", "typescript"],
  jsx: ["clike", "javascript", "jsx"], tsx: ["clike", "javascript", "jsx", "typescript", "tsx"], html: [], markup: [], css: [], xml: [], svg: [],
  bash: ["bash"], sh: ["bash"], shell: ["bash"], consola: ["bash"], json: ["json"], python: ["python"], py: ["python"], sql: ["sql"],
  yaml: ["yaml"], docker: ["docker"], dockerfile: ["docker"], gdscript: ["gdscript"], csharp: ["clike", "csharp"], cs: ["clike", "csharp"],
  java: ["clike", "java"], c: ["clike", "c"], cpp: ["clike", "c", "cpp"], go: ["clike", "go"], rust: ["rust"], diff: ["diff"], git: ["git"],
  regex: ["regex"], http: ["http"], ini: ["ini"], toml: ["toml"], markdown: ["markdown"], md: ["markdown"], text: [], txt: [], plain: [],
};
function scriptsPrism(lenguajes) {
  const orden = ["markup", "css", "clike"];
  for (const l of lenguajes) {
    const deps = PRISM_DEPS[l];
    if (!deps) { avisos.push(`Lenguaje sin resaltado conocido: ${l}`); continue; }
    for (const d of deps) if (!orden.includes(d)) orden.push(d);
  }
  if (orden.includes("javascript") && !orden.includes("clike")) orden.splice(2, 0, "clike");
  return [`<script src="${PRISM}prism-core.min.js" data-manual></script>`, ...orden.map((c) => `<script src="${PRISM}prism-${c}.min.js"></script>`)].join("\n");
}

// ---------------------------------------------------------------------------
// Diagrama de línea para el cartel (tira)
// ---------------------------------------------------------------------------
function tiraLinea(m) {
  const deLinea = modulos.filter((x) => x.linea === m.linea);
  const W = 1000, y = 30, x0 = 30, x1 = 970;
  const paso = deLinea.length > 1 ? (x1 - x0) / (deLinea.length - 1) : 0;
  const idx = deLinea.findIndex((x) => x.slug === m.slug);
  const xs = deLinea.map((_, i) => (deLinea.length > 1 ? x0 + i * paso : W / 2));
  const xActual = xs[idx];
  const xPrevio = idx > 0 ? xs[idx - 1] : xActual;
  const partes = [];
  partes.push(`<line class="tira-via" x1="${x0 - 22}" y1="${y}" x2="${x1 + 22}" y2="${y}"/>`);
  deLinea.forEach((x, i) => {
    const actual = x.slug === m.slug;
    const nombre = esc(x.estacion);
    const lineasNombre = partirNombre(x.estacion, 16);
    const texto = lineasNombre.map((t, k) => `<tspan x="${xs[i]}" dy="${k === 0 ? 0 : 17}">${esc(t)}</tspan>`).join("");
    const circulo = actual
      ? `<circle class="tira-anillo" cx="${xs[i]}" cy="${y}" r="17"/><circle class="tira-parada actual" cx="${xs[i]}" cy="${y}" r="11"/>`
      : `<circle class="tira-parada" cx="${xs[i]}" cy="${y}" r="9"/>`;
    const etiqueta = `<text class="tira-nombre${actual ? " actual" : ""}" x="${xs[i]}" y="${y + 40}" text-anchor="middle">${texto}</text>`;
    partes.push(actual
      ? `<g data-slug="${x.slug}" aria-current="page">${circulo}${etiqueta}</g>`
      : `<a href="${archivoModulo(x)}" data-slug="${x.slug}" aria-label="Estación ${x.num}: ${nombre}"><g>${circulo}${etiqueta}</g></a>`);
  });
  const tren = `<g transform="translate(${xActual} ${y - 34})"><g class="tira-tren-grupo" data-desde="${xPrevio}" data-hasta="${xActual}"><rect class="tira-tren" x="-17" y="-9" width="34" height="16" rx="5"/><rect class="tira-tren-vent" x="-11" y="-5" width="7" height="6" rx="1.5"/><rect class="tira-tren-vent" x="-2" y="-5" width="7" height="6" rx="1.5"/><rect class="tira-tren-vent" x="7" y="-5" width="4" height="6" rx="1.5"/></g></g>`;
  return `<div class="tira" aria-label="Estaciones de la Línea ${m.linea}"><svg viewBox="0 -12 ${W} 118" role="group">${partes.join("")}${tren}</svg></div>`;
}
function partirNombre(t, max) {
  const palabras = t.split(" ");
  const lineas = [];
  let actual = "";
  for (const p of palabras) {
    if ((actual + " " + p).trim().length > max && actual) { lineas.push(actual); actual = p; }
    else actual = (actual + " " + p).trim();
  }
  if (actual) lineas.push(actual);
  return lineas;
}

// ---------------------------------------------------------------------------
// Página de módulo
// ---------------------------------------------------------------------------
const OBLIGATORIAS = ["ruta", "resumen", "practica", "proyecto", "autoevaluacion", "glosario", "videos", "profundizar"];

function paginaModulo(m, i) {
  const ruta = `fuente/modulos/${archivoModulo(m)}`;
  let cuerpo;
  if (existe(ruta)) cuerpo = leer(ruta);
  else {
    avisos.push(`Falta el contenido de ${ruta}`);
    cuerpo = `<section id="ruta" data-parada="En construcción"><h2>Estación en construcción</h2><p class="entradilla">Este módulo todavía se está escribiendo.</p></section>`;
  }
  cuerpo = nivelEjercicios(expandirVideos(expandirSenales(cuerpo)));
  const secciones = seccionesDe(cuerpo);
  if (existe(ruta)) for (const id of OBLIGATORIAS) if (!secciones.some((s) => s.id === id)) avisos.push(`${m.slug}: falta la sección #${id}`);
  const linea = lineaDe(m.linea);
  const previo = modulos[i - 1], siguiente = modulos[i + 1];
  const requisitos = (m.requisitos || []).map((s) => modulos.find((x) => x.slug === s)).filter(Boolean);
  const niveles = [1, 2, 3, 4, 5].map((k) => `<i${k <= m.dificultad ? ' class="on"' : ""}></i>`).join("");
  const descripcion = `${m.titulo}. ${m.promesa}`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(m.estacion === "Terminal" ? m.titulo : m.estacion)} · Terminal</title>
<meta name="description" content="${esc(descripcion)}">
${TEMA_TEMPRANO}
${FUENTES}
<link rel="stylesheet" href="../assets/css/terminal.css">
</head>
<body data-linea="${m.linea}" data-modulo="${m.slug}">
<a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="barra">
  <a class="marca" href="../index.html" aria-label="Terminal: volver al mapa del curso">${marca()}<span class="marca-texto">Terminal</span></a>
  <span class="barra-lugar"><span class="roundel" aria-hidden="true">${m.linea}</span>Línea ${m.linea} · ${esc(linea.nombre)} · Estación ${Number(m.num)} de ${modulos.length}</span>
  <nav class="barra-acciones" aria-label="Navegación general">
    <a class="barra-enlace" href="../index.html#red">${ICO.mapa}<span>Mapa</span></a>
    <a class="barra-enlace" href="../glosario.html">${ICO.libro}<span>Glosario</span></a>
    <button class="boton-icono" type="button" data-accion="tema" aria-label="Cambiar tema claro u oscuro">${ICO.tema}</button>
  </nav>
  <div class="barra-progreso" aria-hidden="true"><span></span></div>
</header>

<header class="cartel">
  <div class="cartel-interior">
    <div class="cartel-cabeza">
      <div class="picto">${pictoSvg(m.slug)}</div>
      <div>
        <h1>${esc(m.titulo)}</h1>
      </div>
    </div>
    <p class="cartel-promesa">${esc(m.promesa)}</p>
    <div class="cartel-datos">
      <span><span class="roundel" aria-hidden="true">${m.linea}</span>Línea ${m.linea}: ${esc(linea.nombre)}</span>
      <span>${ICO.reloj}Unas ${horasTexto(m.horas)} con práctica</span>
      <span><span class="nivel-barras" aria-hidden="true">${niveles}</span>Dificultad ${m.dificultad} de 5</span>
      ${requisitos.length ? `<span>${ICO.requisito}Antes: ${requisitos.map((r) => `<a href="${archivoModulo(r)}" style="color:inherit">${esc(r.estacion)}</a>`).join(", ")}</span>` : ""}
    </div>
    ${tiraLinea(m)}
  </div>
</header>

<div class="recorrido">
  <nav class="paradas" aria-label="Paradas de esta estación">
    <p class="paradas-titulo">Paradas de esta estación</p>
    <ol>
${secciones.map((s) => `      <li><a href="#${s.id}">${esc(s.titulo)}</a></li>`).join("\n")}
    </ol>
    <div class="paradas-tren" aria-hidden="true"><svg viewBox="0 0 24 30"><rect class="t-cuerpo" x="1" y="1" width="22" height="28" rx="7"/><rect class="t-vent" x="5" y="5" width="14" height="8" rx="2"/><circle class="t-vent" cx="8" cy="21" r="2"/><circle class="t-vent" cx="16" cy="21" r="2"/></svg></div>
  </nav>
  <main class="contenido" id="contenido">
${cuerpo.trim()}
  </main>
</div>

<footer class="cierre">
  <div class="completar" data-texto="¿Terminaste las prácticas y la autoevaluación?">
    <p>¿Terminaste las prácticas y la autoevaluación?</p>
    <button class="boton" type="button">Marcar estación como completada</button>
  </div>
  <nav class="direcciones" aria-label="Estaciones vecinas">
    ${previo ? `<a class="direccion" href="${archivoModulo(previo)}" data-linea="${previo.linea}"><span class="flecha">${ICO.flechaIzq}</span><span><small>Estación anterior</small><strong><span class="roundel" aria-hidden="true">${previo.linea}</span>${esc(previo.estacion)}</strong></span></a>` : `<a class="direccion" href="../index.html"><span class="flecha">${ICO.flechaIzq}</span><span><small>Volver</small><strong>Mapa del curso</strong></span></a>`}
    ${siguiente ? `<a class="direccion siguiente" href="${archivoModulo(siguiente)}" data-linea="${siguiente.linea}"><span><small>Próxima estación${siguiente.linea !== m.linea ? ` · correspondencia con la Línea ${siguiente.linea}` : ""}</small><strong><span class="roundel" aria-hidden="true">${siguiente.linea}</span>${esc(siguiente.estacion)}</strong></span><span class="flecha">${ICO.flechaDer}</span></a>` : `<a class="direccion siguiente" href="../index.html"><span><small>Fin del recorrido</small><strong>Volver al mapa</strong></span><span class="flecha">${ICO.flechaDer}</span></a>`}
  </nav>
</footer>
<footer class="pie"><div class="pie-interior"><span>Terminal · curso libre de desarrollo e ingeniería de software</span><span>Tu progreso se guarda solo en este navegador.</span></div></footer>
${scriptsPrism(lenguajesDe(cuerpo))}
<script src="../assets/js/motor.js"></script>
<script src="../assets/js/terminal.js"></script>
<script src="../assets/js/practicas.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Mapa de la red (portada): espiral hacia el centro, donde está la Terminal
// ---------------------------------------------------------------------------
function mapaRed() {
  const W = 1440, H = 800;
  const P = [[200, 610], [200, 140], [250, 90], [1190, 90], [1240, 140], [1240, 670], [1190, 720], [390, 720], [340, 670], [340, 280], [390, 230], [1050, 230], [1100, 280], [1100, 530], [1050, 580], [600, 580]];
  const seg = [];
  let total = 0;
  for (let i = 0; i < P.length - 1; i++) {
    const [ax, ay] = P[i], [bx, by] = P[i + 1];
    const l = Math.hypot(bx - ax, by - ay);
    seg.push({ ax, ay, bx, by, l, desde: total });
    total += l;
  }
  const punto = (d) => {
    const s = seg.find((s) => d <= s.desde + s.l + 1e-6) || seg[seg.length - 1];
    const t = (d - s.desde) / s.l;
    return { x: s.ax + (s.bx - s.ax) * t, y: s.ay + (s.by - s.ay) * t, dx: (s.bx - s.ax) / s.l, dy: (s.by - s.ay) / s.l };
  };
  const n = modulos.length;
  // Distancia a lo largo del recorrido; las estaciones que caen en un chaflán se desplazan al tramo recto más cercano.
  const ajustar = (d) => {
    const s = seg.find((s) => d <= s.desde + s.l + 1e-6) || seg[seg.length - 1];
    const diagonal = Math.abs(s.bx - s.ax) > 1 && Math.abs(s.by - s.ay) > 1;
    if (!diagonal) return d;
    return d - s.desde < s.l / 2 ? s.desde - 14 : s.desde + s.l + 14;
  };
  const est = modulos.map((m, i) => { const d = i === 0 || i === n - 1 ? (total * i) / (n - 1) : ajustar((total * i) / (n - 1)); return { m, d, ...punto(d) }; });
  const cx = 720, cy = 405;
  // Tramos de color: desde la primera estación de la línea hasta la primera de la siguiente.
  const vias = [];
  curso.lineas.forEach((l) => {
    const suyas = est.filter((e) => e.m.linea === l.n);
    const ini = suyas[0].d;
    const sig = est.find((e) => e.m.linea === l.n + 1);
    const fin = sig ? sig.d : total;
    const pts = [punto(ini)];
    P.forEach((_, k) => {
      if (k === 0) return;
      const dk = seg[k - 1].desde + seg[k - 1].l;
      if (dk > ini + 1e-6 && dk < fin - 1e-6) pts.push({ x: P[k][0], y: P[k][1] });
    });
    pts.push(punto(fin));
    vias.push(`<polyline class="mapa-via" style="stroke:var(--l${l.n})" data-linea="${l.n}" points="${pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}"/>`);
  });
  const estaciones = est.map((e, i) => {
    const m = e.m;
    const esInicioLinea = i > 0 && modulos[i - 1].linea !== m.linea;
    const esTerminal = i === n - 1;
    // Normal hacia afuera de la espiral
    let nx = -e.dy, ny = e.dx;
    if ((e.x - cx) * nx + (e.y - cy) * ny < 0) { nx = -nx; ny = -ny; }
    const horizontal = Math.abs(e.dx) > 0.9, vertical = Math.abs(e.dy) > 0.9;
    let tx = e.x + nx * 22, ty = e.y + ny * 22, ancla = "middle";
    const lineas = partirNombre(m.estacion, 13);
    if (horizontal) { ty = ny < 0 ? e.y - 22 - (lineas.length - 1) * 17 : e.y + 33; }
    else if (vertical) { ancla = nx < 0 ? "end" : "start"; tx = e.x + nx * 20; ty = e.y + 5 - (lineas.length - 1) * 8.5; }
    else { ancla = nx < 0 ? "end" : "start"; tx = e.x + nx * 18; ty = e.y + ny * 18 + 5 - (ny < 0 ? (lineas.length - 1) * 17 : 0); }
    if (esTerminal) { ancla = "end"; tx = e.x - 20; ty = e.y + 8; }
    const texto = lineas.map((t, k) => `<tspan x="${tx.toFixed(1)}" dy="${k === 0 ? 0 : 17}">${esc(t)}</tspan>`).join("");
    const marcaEst = esTerminal
      ? `<rect class="mapa-terminal" x="${(e.x - 6).toFixed(1)}" y="${(e.y - 22).toFixed(1)}" width="12" height="44" rx="3"/><circle class="mapa-parada" cx="${e.x.toFixed(1)}" cy="${e.y.toFixed(1)}" r="9" style="--c:var(--l${m.linea})"/>`
      : esInicioLinea || i === 0
        ? `<circle class="mapa-correspondencia" cx="${e.x.toFixed(1)}" cy="${e.y.toFixed(1)}" r="13"/><circle class="mapa-parada" cx="${e.x.toFixed(1)}" cy="${e.y.toFixed(1)}" r="7" style="--c:var(--l${m.linea})"/>`
        : `<circle class="mapa-parada" cx="${e.x.toFixed(1)}" cy="${e.y.toFixed(1)}" r="8" style="--c:var(--l${m.linea})"/>`;
    const roundel = esInicioLinea || i === 0
      ? `<g class="mapa-roundel" transform="translate(${(e.x - nx * 34).toFixed(1)} ${(e.y - ny * 34).toFixed(1)})"><circle r="14" style="fill:var(--l${m.linea})"/><text y="6" text-anchor="middle" style="fill:var(--l${m.linea}-on)">${m.linea}</text></g>`
      : "";
    const meta = `Línea ${m.linea} · Estación ${Number(m.num)} · ${horasTexto(m.horas)}`;
    return `<a class="mapa-estacion" href="modulos/${archivoModulo(m)}" data-slug="${m.slug}" data-linea="${m.linea}" data-x="${e.x.toFixed(1)}" data-y="${e.y.toFixed(1)}" data-titulo="${esc(m.titulo)}" data-promesa="${esc(m.promesa)}" data-meta="${esc(meta)}" aria-label="Estación ${Number(m.num)}, ${esc(m.estacion)}: ${esc(m.titulo)}">${roundel}${marcaEst}<text class="mapa-nombre${esTerminal ? " mapa-nombre-terminal" : ""}" x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${ancla}">${texto}</text></a>`;
  });
  const inicio = est[0];
  const tren = `<g class="mapa-tren" transform="translate(${inicio.x} ${inicio.y})" aria-hidden="true"><g transform="translate(0 -26)"><rect x="-18" y="-10" width="36" height="18" rx="6" class="mapa-tren-cuerpo"/><rect x="-12" y="-5.5" width="7" height="7" rx="1.5" class="mapa-tren-vent"/><rect x="-2.5" y="-5.5" width="7" height="7" rx="1.5" class="mapa-tren-vent"/><rect x="7" y="-5.5" width="5" height="7" rx="1.5" class="mapa-tren-vent"/><path d="M0 8v8" class="mapa-tren-poste"/></g></g>`;
  return `<svg class="mapa-red" viewBox="0 0 ${W} ${H}" role="group" aria-label="Mapa del curso: 39 estaciones en 8 líneas">
<text class="mapa-inicio" x="${inicio.x - 20}" y="${inicio.y + 58}" text-anchor="start">Salida</text>
<path class="mapa-inicio-flecha" d="M${inicio.x} ${inicio.y + 40}v-24"/>
${vias.join("\n")}
${estaciones.join("\n")}
${tren}
</svg>`;
}

// Filas del índice de líneas (portada): cada línea como diagrama de línea
function indiceLineas() {
  return curso.lineas.map((l) => {
    const suyas = modulos.filter((m) => m.linea === l.n);
    const horas = suyas.reduce((a, m) => a + m.horas, 0);
    return `<li class="fila-linea" data-linea="${l.n}">
  <div class="fila-cabeza"><span class="roundel" aria-hidden="true">${l.n}</span><div><h3>Línea ${l.n} · ${esc(l.nombre)}</h3><p>${esc(l.resumen)}</p></div><span class="fila-horas">${ICO.reloj}${horasTexto(horas)}</span></div>
  <ol class="fila-estaciones">
${suyas.map((m) => `    <li><a href="modulos/${archivoModulo(m)}" data-slug="${m.slug}"><span class="fila-punto" aria-hidden="true"></span><span class="fila-picto">${pictoSvg(m.slug)}</span><span class="fila-nombre"><b>${esc(m.estacion)}</b><small>${esc(m.titulo)}</small></span></a></li>`).join("\n")}
  </ol>
</li>`;
  }).join("\n");
}

function notasTiempo() {
  if (!tiempo) return "";
  const lista = (xs) => (xs || []).map((x) => `<li>${esc(x)}</li>`).join("");
  const fuentes = (tiempo.fuentes || []).map((f) => `<li><a href="${esc(f.url)}">${esc(f.titulo)}</a><p>${esc(f.dato)}</p></li>`).join("");
  return `<div class="horarios-notas">
  <h3>Cómo se calculó</h3>
  <ul>${lista(tiempo.supuestos)}</ul>
  <h3>Consejos para sostener el ritmo</h3>
  <ul>${lista(tiempo.consejos)}</ul>
  <details class="pista"><summary>Fuentes consultadas (${(tiempo.fuentes || []).length})</summary><ul class="recursos">${fuentes}</ul></details>
</div>`;
}

function portada() {
  const totalHoras = modulos.reduce((a, m) => a + m.horas, 0);
  const consolidacion = tiempo?.consolidacion ?? 300;
  const datos = { modulos: modulos.map((m) => ({ slug: m.slug, estacion: m.estacion, url: `modulos/${archivoModulo(m)}` })) };
  const filasHorario = curso.lineas.map((l) => {
    const h = modulos.filter((m) => m.linea === l.n).reduce((a, m) => a + m.horas, 0);
    return `<tr data-linea-horas="${h}" data-linea="${l.n}"><th scope="row"><span class="roundel" aria-hidden="true">${l.n}</span> ${esc(l.nombre)}</th><td>${h} h</td><td data-meses></td><td data-acumulado></td></tr>`;
  }).join("\n");
  const plantilla = leer("fuente/portada.html");
  return plantilla
    .replaceAll("{{FUENTES}}", FUENTES)
    .replaceAll("{{TEMA_TEMPRANO}}", TEMA_TEMPRANO)
    .replaceAll("{{MARCA}}", marca("var(--l1)"))
    .replaceAll("{{ICO_TEMA}}", ICO.tema)
    .replaceAll("{{ICO_LIBRO}}", ICO.libro)
    .replaceAll("{{ICO_RELOJ}}", ICO.reloj)
    .replaceAll("{{MAPA}}", mapaRed())
    .replaceAll("{{INDICE_LINEAS}}", indiceLineas())
    .replaceAll("{{FILAS_HORARIO}}", filasHorario)
    .replaceAll("{{TOTAL_HORAS}}", String(totalHoras))
    .replaceAll("{{CONSOLIDACION}}", String(consolidacion))
    .replaceAll("{{NUM_MODULOS}}", String(modulos.length))
    .replaceAll("{{PRIMER_MODULO}}", `modulos/${archivoModulo(modulos[0])}`)
    .replaceAll("{{DATOS_CURSO}}", JSON.stringify(datos).replace(/</g, "\\u003c"))
    .replaceAll("{{TIEMPO_NOTAS}}", notasTiempo())
    .replaceAll("{{PRISM}}", scriptsPrism(new Set(["js"])));
}

// ---------------------------------------------------------------------------
// Glosario global
// ---------------------------------------------------------------------------
function glosario() {
  const terminos = [];
  for (const m of modulos) {
    const ruta = `fuente/modulos/${archivoModulo(m)}`;
    if (!existe(ruta)) continue;
    const html = leer(ruta);
    const dl = (html.match(/<dl class="glosario">([\s\S]*?)<\/dl>/) || [])[1];
    if (!dl) continue;
    for (const par of dl.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)) {
      terminos.push({ termino: par[1].trim(), definicion: par[2].trim(), m });
    }
  }
  const norm = (t) => t.replace(/<[^>]+>/g, "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  // Un término que aparece en varias estaciones se muestra una vez (definición de la primera) con enlace a todas.
  const unicos = new Map();
  for (const t of terminos) {
    const clave = norm(t.termino).replace(/\s*\(.*?\)\s*/g, " ").trim();
    if (!unicos.has(clave)) unicos.set(clave, { ...t, otros: [] });
    else if (unicos.get(clave).m !== t.m && !unicos.get(clave).otros.includes(t.m)) unicos.get(clave).otros.push(t.m);
  }
  terminos.length = 0;
  terminos.push(...unicos.values());
  terminos.sort((a, b) => norm(a.termino).localeCompare(norm(b.termino), "es"));
  const grupos = {};
  for (const t of terminos) {
    const letra = norm(t.termino).replace(/^[^a-z0-9]+/, "").charAt(0).toUpperCase() || "#";
    (grupos[letra] ||= []).push(t);
  }
  const letras = Object.keys(grupos).sort((a, b) => a.localeCompare(b, "es"));
  const plantilla = leer("fuente/glosario.html");
  const cuerpo = letras.map((l) => `<section id="letra-${l}" class="glosario-letra"><h2>${l}</h2><dl class="glosario">\n${grupos[l].map((t) => `<dt>${t.termino}</dt><dd>${t.definicion} ${[t.m, ...t.otros].map((m) => `<a class="glosario-origen" href="modulos/${archivoModulo(m)}#glosario" data-linea="${m.linea}"><span class="roundel" aria-hidden="true">${m.linea}</span>${esc(m.estacion)}</a>`).join("")}</dd>`).join("\n")}\n</dl></section>`).join("\n");
  return plantilla
    .replaceAll("{{FUENTES}}", FUENTES)
    .replaceAll("{{TEMA_TEMPRANO}}", TEMA_TEMPRANO)
    .replaceAll("{{MARCA}}", marca("var(--l1)"))
    .replaceAll("{{ICO_TEMA}}", ICO.tema)
    .replaceAll("{{ICO_MAPA}}", ICO.mapa)
    .replaceAll("{{NUM_TERMINOS}}", String(terminos.length))
    .replaceAll("{{LETRAS}}", letras.map((l) => `<a href="#letra-${l}">${l}</a>`).join(""))
    .replaceAll("{{TERMINOS}}", cuerpo || '<p class="entradilla">El glosario se llena a medida que se escriben los módulos.</p>');
}

// ---------------------------------------------------------------------------
modulos.forEach((m, i) => escribir(`modulos/${archivoModulo(m)}`, paginaModulo(m, i)));
if (existe("fuente/portada.html")) escribir("index.html", portada());
if (existe("fuente/glosario.html")) escribir("glosario.html", glosario());
console.log(`Generadas ${modulos.length} páginas de módulo${existe("fuente/portada.html") ? ", portada" : ""}${existe("fuente/glosario.html") ? " y glosario" : ""}.`);
if (avisos.length) { console.log(`\nAvisos (${avisos.length}):`); for (const a of avisos) console.log(" - " + a); }
