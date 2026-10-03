// Construye las estaciones de fuente-v2/ con el generador real del sitio, en una copia temporal,
// sin tocar fuente/, datos/ ni modulos/ (el sitio actual no cambia).
// Resultado: modulos-v2/NN-slug.html (usa ../assets y ../videos del repositorio).
// Uso: node herramientas/vista-previa-v2.mjs [--probar]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "terminal-v2-"));
try {
  for (const d of ["assets", "herramientas", "datos", "fuente"]) fs.cpSync(path.join(RAIZ, d), path.join(TMP, d), { recursive: true });
  fs.rmSync(path.join(TMP, "fuente/modulos"), { recursive: true, force: true });
  fs.mkdirSync(path.join(TMP, "fuente/modulos"), { recursive: true });

  const meta = JSON.parse(fs.readFileSync(path.join(RAIZ, "fuente-v2/meta/curso-v2-mini.json"), "utf8"));
  const { pictos: nuevos = {}, ...curso } = meta;
  fs.writeFileSync(path.join(TMP, "datos/curso.json"), JSON.stringify(curso, null, 2));
  const pictos = JSON.parse(fs.readFileSync(path.join(TMP, "datos/pictos.json"), "utf8"));
  fs.writeFileSync(path.join(TMP, "datos/pictos.json"), JSON.stringify({ ...pictos, ...nuevos }));
  fs.rmSync(path.join(TMP, "datos/tiempo.json"), { force: true });

  for (const f of fs.readdirSync(path.join(RAIZ, "fuente-v2/modulos")).filter((f) => f.endsWith(".html")))
    fs.copyFileSync(path.join(RAIZ, "fuente-v2/modulos", f), path.join(TMP, "fuente/modulos", f));

  const correr = (script, args = []) => spawnSync("node", [path.join("herramientas", script), ...args], { cwd: TMP, encoding: "utf8" });
  const b = correr("construir.mjs");
  process.stdout.write(b.stdout + b.stderr);
  let fallo = b.status !== 0;
  if (process.argv.includes("--probar")) {
    const p = correr("probar-talleres.mjs");
    process.stdout.write(p.stdout + p.stderr);
    fallo = fallo || p.status !== 0;
  }
  const salida = path.join(RAIZ, "modulos-v2");
  fs.mkdirSync(salida, { recursive: true });
  for (const m of curso.modulos) {
    const f = `${m.num}-${m.slug}.html`;
    fs.copyFileSync(path.join(TMP, "modulos", f), path.join(salida, f));
    console.log("Vista previa: modulos-v2/" + f);
  }
  process.exitCode = fallo ? 1 : 0;
} finally {
  fs.rmSync(TMP, { recursive: true, force: true });
}
