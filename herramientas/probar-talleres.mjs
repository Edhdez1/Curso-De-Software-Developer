// Ejecuta en Node todos los talleres de los módulos y comprueba que:
//  - la solución de cada ejercicio pasa su propia verificación;
//  - el código inicial no lanza errores inesperados (salvo ejercicios de «arreglar»);
//  - el código inicial de un ejercicio con verificación NO pasa ya (sería un ejercicio roto).
// Uso: node herramientas/probar-talleres.mjs [slug-o-archivo ...]
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const Motor = require(path.join(RAIZ, "assets/js/motor.js"));

const desescapar = (t) => t.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, "&");
const atributo = (attrs, nombre) => {
  const m = attrs.match(new RegExp(`${nombre}="([^"]*)"`));
  return m ? desescapar(m[1]) : null;
};

function verificacionEsperada(esperado) {
  return "var esp = " + JSON.stringify(esperado.replace(/\r/g, "")) + ".trim().split('\\n').map(function(s){return s.trim();});\n" +
    "var real = salida.join('\\n').trim().split('\\n').map(function(s){return s.trim();});\n" +
    "if (real.join('\\n') === esp.join('\\n')) return true;\n" +
    "for (var i = 0; i < esp.length; i++) { if (real[i] !== esp[i]) return 'La línea ' + (i+1) + ' debería ser «' + esp[i] + '» y es «' + (real[i] === undefined ? '(nada)' : real[i]) + '».'; }\n" +
    "return 'Imprimiste más líneas de las esperadas. Sobra: «' + real[esp.length] + '».';";
}

export function ejecutar(codigo, verificacion, tiempo = 4000) {
  return new Promise((resolver) => {
    const { fuente } = Motor.construirFuente(codigo, verificacion || "");
    const r = { salida: [], errores: [], excepcion: null, veredicto: undefined, fin: false, tiempoAgotado: false };
    const temporizadores = new Set();
    let terminado = false;
    const acabar = () => {
      if (terminado) return;
      terminado = true;
      for (const t of temporizadores) { clearTimeout(t); clearInterval(t); }
      clearTimeout(limite);
      resolver(r);
    };
    const self = {
      postMessage: (m) => {
        if (m.tipo === "log") r.salida.push(m.datos);
        else if (m.tipo === "error" || m.tipo === "aviso") r.errores.push(m.datos);
        else if (m.tipo === "excepcion") r.excepcion = m.datos;
        else if (m.tipo === "veredicto") r.veredicto = m.datos;
        else if (m.tipo === "fin") { r.fin = true; acabar(); }
      },
      setTimeout: (f, ms, ...a) => { const t = setTimeout(() => { temporizadores.delete(t); f(...a); }, Math.min(ms || 0, 2000)); temporizadores.add(t); return t; },
      clearTimeout: (t) => { temporizadores.delete(t); clearTimeout(t); },
      setInterval: (f, ms, ...a) => { const t = setInterval(f, Math.max(ms || 0, 1), ...a); temporizadores.add(t); return t; },
      clearInterval: (t) => { temporizadores.delete(t); clearInterval(t); },
    };
    const ctx = vm.createContext({ self, structuredClone, queueMicrotask, TextEncoder, TextDecoder, URL, URLSearchParams });
    const limite = setTimeout(() => { r.tiempoAgotado = true; acabar(); }, tiempo);
    try {
      vm.runInContext(fuente, ctx, { filename: "codigo-usuario", timeout: tiempo });
    } catch (e) {
      r.excepcion = { nombre: e && e.name, mensaje: e && e.message, linea: null };
      if (e && /Script execution timed out/.test(e.message)) r.tiempoAgotado = true;
      acabar();
    }
  });
}

import { spawnSync } from "node:child_process";

function verificarEn(verificacion, salida, codigo, resultados) {
  if (!verificacion) return undefined;
  try {
    const f = vm.runInNewContext("(function(salida, codigo, resultados){\n" + verificacion + "\n})", {});
    const r = f(salida.slice(), codigo, resultados || []);
    return r === undefined ? true : r;
  } catch (e) { return "La verificación falló: " + e.message; }
}

export function ejecutarPython(codigo, verificacion) {
  const p = spawnSync("python3", ["-c", codigo], { encoding: "utf8", timeout: 5000 });
  const salida = p.stdout ? p.stdout.replace(/\n$/, "").split("\n").filter((l, i, a) => !(a.length === 1 && l === "")) : [];
  const excepcion = p.status !== 0 ? { nombre: "PythonError", mensaje: (p.stderr || "").trim().split("\n").pop(), linea: null } : null;
  return { salida, excepcion, veredicto: verificarEn(verificacion, salida, codigo), tiempoAgotado: !!p.error };
}

const AYUDANTE_SQL = `
import sqlite3, json, sys
datos = json.loads(sys.stdin.read())
db = sqlite3.connect(":memory:")
res = []
error = None
try:
    if datos["prep"].strip():
        db.executescript(datos["prep"])
except Exception as e:
    error = "Error en los datos de ejemplo: " + str(e)
if not error:
    try:
        buf = ""
        for linea in datos["sql"].splitlines(True):
            buf += linea
            if sqlite3.complete_statement(buf):
                cur = db.execute(buf)
                if cur.description:
                    res.append({"columns": [d[0] for d in cur.description], "values": [list(f) for f in cur.fetchall()]})
                buf = ""
        if buf.strip():
            cur = db.execute(buf)
            if cur.description:
                res.append({"columns": [d[0] for d in cur.description], "values": [list(f) for f in cur.fetchall()]})
    except Exception as e:
        error = "Error de SQL: " + str(e)
print(json.dumps({"res": res, "error": error}))
`;
export function ejecutarSQL(codigo, preparacion, verificacion) {
  const p = spawnSync("python3", ["-c", AYUDANTE_SQL], { input: JSON.stringify({ sql: codigo, prep: preparacion || "" }), encoding: "utf8", timeout: 5000 });
  let datos = { res: [], error: p.stderr || "sin salida" };
  try { datos = JSON.parse(p.stdout); } catch (e) { /* queda el error */ }
  const salida = [];
  for (const r of datos.res) salida.push(...Motor.tablaTexto(r.columns, r.values));
  if (!datos.res.length && !datos.error) salida.push("Listo: la instrucción se ejecutó y no devolvió filas.");
  const excepcion = datos.error ? { nombre: "SQLError", mensaje: datos.error, linea: null } : null;
  return { salida, excepcion, veredicto: verificarEn(verificacion, salida, codigo, datos.res), tiempoAgotado: false };
}

function talleresDe(html) {
  const lista = [];
  const re = /<div class="taller"([^>]*)>([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1], cuerpo = m[2];
    const fuentes = [...cuerpo.matchAll(/<textarea class="taller-codigo"([^>]*)>([\s\S]*?)<\/textarea>/g)].map((t) => ({ lenguaje: atributo(t[1], "data-lenguaje"), codigo: desescapar(t[2]).replace(/^\n/, "") }));
    const verif = (cuerpo.match(/<script type="text\/plain" class="taller-verificar">([\s\S]*?)<\/script>/) || [])[1] || "";
    const prep = (cuerpo.match(/<script type="text\/plain" class="taller-preparacion">([\s\S]*?)<\/script>/) || [])[1] || "";
    const esperado = atributo(attrs, "data-esperado");
    const fin = m.index + m[0].length;
    const siguiente = html.indexOf('<div class="taller"', fin);
    const tramo = html.slice(fin, siguiente === -1 ? undefined : siguiente);
    const sol = tramo.match(/<details class="solucion">[\s\S]*?<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/);
    const ejercicio = html.slice(0, m.index).lastIndexOf('<article class="ejercicio"') > html.slice(0, m.index).lastIndexOf("</article>");
    lista.push({
      id: atributo(attrs, "id") || `(taller ${lista.length + 1})`,
      titulo: atributo(attrs, "data-titulo") || "",
      modo: atributo(attrs, "data-modo") || "js",
      tiempo: (parseFloat(atributo(attrs, "data-tiempo")) || 4) * 1000,
      fuentes, preparacion: prep, verificacion: verif || (esperado !== null ? verificacionEsperada(esperado) : ""),
      solucion: sol ? desescapar(sol[1]) : null,
      ejercicio,
      arreglar: /arregl|corrig|error|bug|depur/i.test(atributo(attrs, "data-titulo") + " " + html.slice(Math.max(0, m.index - 1500), m.index).split('<article class="ejercicio"').pop()),
    });
  }
  return lista;
}

async function probarArchivo(archivo) {
  const html = fs.readFileSync(archivo, "utf8");
  const talleres = talleresDe(html);
  const problemas = [];
  let probados = 0;
  for (const t of talleres) {
    if (t.modo === "web") continue;
    const inicial = t.fuentes[0] ? t.fuentes[0].codigo : "";
    probados++;
    const correr = (codigo, verif) => t.modo === "python" ? ejecutarPython(codigo, verif) : t.modo === "sql" ? ejecutarSQL(codigo, t.preparacion, verif) : ejecutar(codigo, verif, t.tiempo);
    const ri = await correr(inicial, t.verificacion);
    if (ri.tiempoAgotado && !t.arreglar) problemas.push(`${t.id}: el código inicial no termina (¿bucle infinito o setInterval?)`);
    if (t.ejercicio && t.verificacion && ri.veredicto === true) problemas.push(`${t.id}: el código inicial YA pasa la verificación (el ejercicio no exige nada)`);
    if (!t.ejercicio && ri.excepcion && !t.arreglar) problemas.push(`${t.id}: el ejemplo lanza ${ri.excepcion.nombre}: ${ri.excepcion.mensaje}`);
    if (t.verificacion && !t.solucion && t.ejercicio) problemas.push(`${t.id}: tiene verificación pero no hay <details class="solucion"> con <pre><code> después`);
    if (t.solucion && t.verificacion) {
      const rs = await correr(t.solucion, t.verificacion);
      if (rs.excepcion) problemas.push(`${t.id}: la SOLUCIÓN lanza ${rs.excepcion.nombre}: ${rs.excepcion.mensaje}${rs.excepcion.linea ? " (línea " + rs.excepcion.linea + ")" : ""}`);
      else if (rs.veredicto !== true) problemas.push(`${t.id}: la SOLUCIÓN no pasa la verificación → ${JSON.stringify(rs.veredicto)} | salida: ${JSON.stringify(rs.salida).slice(0, 300)}`);
    } else if (t.solucion) {
      const rs = await correr(t.solucion, "");
      if (rs.excepcion) problemas.push(`${t.id}: la SOLUCIÓN lanza ${rs.excepcion.nombre}: ${rs.excepcion.mensaje}`);
    }
  }
  // Soluciones sueltas de ejercicios sin taller JS no se pueden verificar aquí.
  return { archivo: path.relative(RAIZ, archivo), talleres: talleres.length, probados, problemas };
}

const args = process.argv.slice(2);
const dir = path.join(RAIZ, "fuente/modulos");
let archivos = fs.readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => path.join(dir, f));
if (args.length) archivos = archivos.filter((f) => args.some((a) => f.includes(a)));
let total = 0;
for (const f of archivos.sort()) {
  const r = await probarArchivo(f);
  total += r.problemas.length;
  console.log(`${r.problemas.length ? "✗" : "✓"} ${r.archivo}: ${r.probados}/${r.talleres} talleres ejecutados${r.problemas.length ? "" : ", todo correcto"}`);
  for (const p of r.problemas) console.log("    - " + p);
}
process.exitCode = total ? 1 : 0;
