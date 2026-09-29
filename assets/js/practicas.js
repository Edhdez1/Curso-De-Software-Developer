/* TERMINAL — prácticas extra: ordenar líneas (Parsons) y terminal simulada con Git.
   Se carga después de terminal.js. Sin dependencias. */
(function () {
  "use strict";
  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  function crear(tag, attrs, hijos) {
    var el = doc.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "texto") el.textContent = attrs[k];
      else if (k === "html") el.innerHTML = attrs[k];
      else el.setAttribute(k, attrs[k]);
    });
    (hijos || []).forEach(function (h) { if (h) el.appendChild(typeof h === "string" ? doc.createTextNode(h) : h); });
    return el;
  }
  function escapar(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function resaltar(texto, leng) {
    var P = window.Prism, alias = { js: "javascript", html: "markup", py: "python", sh: "bash" };
    var l = alias[leng] || leng;
    if (P && l && P.languages[l]) { try { return P.highlight(texto, P.languages[l], l); } catch (e) { /* sin color */ } }
    return escapar(texto);
  }
  var ICO_PARSONS = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h10M4 12h14M4 18h8"/><path d="M19 4v6M17 8l2 2 2-2"/></svg>';
  var ICO_TERMINAL = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M12 15h5"/></svg>';
  var ICO_OK = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var ICO_MAL = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v6"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>';

  /* =====================================================================
     Ordenar líneas (problema de Parsons)
     ===================================================================== */
  function iniciarParsons(caja, n) {
    var fuente = $$("ol > li", caja).map(function (li, i) {
      return { id: i, texto: li.textContent.replace(/^\s+|\s+$/g, ""), sangria: parseInt(li.getAttribute("data-sangria"), 10) || 0 };
    });
    if (fuente.length < 2) return;
    var leng = caja.getAttribute("data-lenguaje") || "text";
    var conSangria = fuente.some(function (f) { return f.sangria > 0; });
    var titulo = caja.getAttribute("data-titulo") || "Ordena las líneas";
    // Barajado determinista que nunca deja el orden correcto.
    var orden = fuente.map(function (f) { return { id: f.id, sangria: 0 }; });
    var semilla = 7 + n * 13;
    for (var i = orden.length - 1; i > 0; i--) {
      semilla = (semilla * 9301 + 49297) % 233280;
      var j = Math.floor(semilla / 233280 * (i + 1));
      var t = orden[i]; orden[i] = orden[j]; orden[j] = t;
    }
    if (orden.every(function (o, k) { return o.id === k; })) orden.push(orden.shift());

    caja.innerHTML = "";
    caja.classList.add("js");
    var cabeza = crear("div", { "class": "parsons-cabeza", html: ICO_PARSONS + "<span></span>" });
    cabeza.lastChild.textContent = titulo;
    var ayuda = crear("p", { "class": "parsons-ayuda", texto: conSangria
      ? "Ordena las líneas con las flechas (o arrastrándolas) y ajusta la sangría con ← →. Después pulsa «Comprobar»."
      : "Ordena las líneas con las flechas o arrastrándolas. Después pulsa «Comprobar»." });
    var lista = crear("ol", { "class": "parsons-lista", "aria-label": titulo });
    var pie = crear("div", { "class": "parsons-pie" });
    var bComprobar = crear("button", { type: "button", "class": "boton boton-mini", texto: "Comprobar" });
    var bMezclar = crear("button", { type: "button", "class": "boton boton-sec boton-mini", texto: "Volver a mezclar" });
    var veredicto = crear("p", { "class": "parsons-veredicto", role: "status" });
    pie.appendChild(bComprobar); pie.appendChild(bMezclar); pie.appendChild(veredicto);
    [cabeza, ayuda, lista, pie].forEach(function (x) { caja.appendChild(x); });

    function pintar(enfocar) {
      lista.innerHTML = "";
      orden.forEach(function (o, pos) {
        var f = fuente[o.id];
        var li = crear("li", { "class": "parsons-linea", draggable: "true", "data-pos": String(pos) });
        li.style.setProperty("--sangria", o.sangria);
        var code = crear("code", { html: resaltar(f.texto, leng) });
        var botones = crear("span", { "class": "parsons-botones" });
        var FLECHAS = { "↑": "M12 19V5M6 11l6-6 6 6", "↓": "M12 5v14M6 13l6 6 6-6", "←": "M19 12H5M11 6l-6 6 6 6", "→": "M5 12h14M13 6l6 6-6 6" };
        var mk = function (txt, etiqueta, fn, dis) {
          var b = crear("button", { type: "button", "aria-label": etiqueta, html: '<svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="' + FLECHAS[txt] + '"/></svg>' });
          if (dis) b.disabled = true;
          b.addEventListener("click", function () { fn(); pintar(etiqueta + pos); });
          return b;
        };
        botones.appendChild(mk("↑", "Subir línea " + (pos + 1), function () { mover(pos, pos - 1); }, pos === 0));
        botones.appendChild(mk("↓", "Bajar línea " + (pos + 1), function () { mover(pos, pos + 1); }, pos === orden.length - 1));
        if (conSangria) {
          botones.appendChild(mk("←", "Quitar sangría a la línea " + (pos + 1), function () { o.sangria = Math.max(0, o.sangria - 1); }, o.sangria === 0));
          botones.appendChild(mk("→", "Añadir sangría a la línea " + (pos + 1), function () { o.sangria = Math.min(4, o.sangria + 1); }, o.sangria >= 4));
        }
        li.appendChild(code); li.appendChild(botones);
        li.addEventListener("dragstart", function (e) { e.dataTransfer.setData("text/plain", String(pos)); li.classList.add("arrastrando"); });
        li.addEventListener("dragend", function () { li.classList.remove("arrastrando"); });
        li.addEventListener("dragover", function (e) { e.preventDefault(); li.classList.add("destino"); });
        li.addEventListener("dragleave", function () { li.classList.remove("destino"); });
        li.addEventListener("drop", function (e) { e.preventDefault(); var de = parseInt(e.dataTransfer.getData("text/plain"), 10); mover(de, pos); pintar(); });
        lista.appendChild(li);
      });
      if (enfocar) {
        var b = $$("button", lista).filter(function (x) { return x.getAttribute("aria-label") && enfocar.indexOf(x.getAttribute("aria-label").replace(/\d+$/, "")) === 0; })[0];
        if (b && !b.disabled) b.focus();
      }
      veredicto.textContent = ""; veredicto.className = "parsons-veredicto";
    }
    function mover(de, a) {
      if (a < 0 || a >= orden.length || de === a) return;
      var x = orden.splice(de, 1)[0]; orden.splice(a, 0, x);
    }
    bComprobar.addEventListener("click", function () {
      var bien = 0;
      $$(".parsons-linea", lista).forEach(function (li, pos) {
        var o = orden[pos];
        var ok = o.id === pos && (!conSangria || o.sangria === fuente[pos].sangria);
        li.classList.toggle("ok", ok); li.classList.toggle("mal", !ok);
        if (ok) bien++;
      });
      if (bien === orden.length) {
        veredicto.className = "parsons-veredicto ok"; veredicto.innerHTML = ICO_OK + "<span>¡Correcto! Así queda el orden de ejecución.</span>";
      } else {
        veredicto.className = "parsons-veredicto mal"; veredicto.innerHTML = ICO_MAL + "<span></span>";
        veredicto.lastChild.textContent = bien + " de " + orden.length + " líneas están en su lugar" + (conSangria ? " (con la sangría correcta)" : "") + ". Las marcadas en rojo todavía no.";
      }
    });
    bMezclar.addEventListener("click", function () {
      for (var i = orden.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = orden[i]; orden[i] = orden[j]; orden[j] = t; }
      orden.forEach(function (o) { o.sangria = 0; });
      pintar();
    });
    pintar();
  }

  /* =====================================================================
     Terminal simulada con sistema de archivos y Git
     ===================================================================== */
  function iniciarTerminal(caja) {
    var inicio = caja.getAttribute("data-inicio") || "/home/tu";
    var usuario = caja.getAttribute("data-usuario") || "tu";
    var titulo = caja.getAttribute("data-titulo") || "Terminal de práctica";
    var jsonEl = $("script.terminal-sistema", caja);
    var misionEl = $("script.terminal-mision", caja);
    var sistemaInicial = {};
    try { sistemaInicial = jsonEl ? JSON.parse(jsonEl.textContent) : {}; } catch (e) { sistemaInicial = {}; }
    var mision = misionEl ? misionEl.textContent : "";
    var instrucciones = $$(".terminal-instrucciones", caja).map(function (x) { return x.cloneNode(true); });

    var raiz, cwd, historial, git, contadorCommit;
    function nodoDesde(obj) {
      var d = { tipo: "dir", hijos: {} };
      Object.keys(obj || {}).forEach(function (k) {
        var v = obj[k];
        d.hijos[k] = v !== null && typeof v === "object" ? nodoDesde(v) : { tipo: "archivo", contenido: v === null || v === undefined ? "" : String(v) };
      });
      return d;
    }
    function reiniciarEstado() {
      raiz = { tipo: "dir", hijos: {} };
      var partes = inicio.split("/").filter(Boolean);
      var d = raiz;
      partes.forEach(function (p, i) {
        d.hijos[p] = i === partes.length - 1 ? nodoDesde(sistemaInicial) : { tipo: "dir", hijos: {} };
        d = d.hijos[p];
      });
      cwd = inicio.replace(/\/+$/, "") || "/";
      historial = [];
      git = null;
      contadorCommit = 0;
    }
    reiniciarEstado();

    // ---------- Rutas ----------
    function normalizar(ruta) {
      if (!ruta || ruta === "~") return inicio;
      if (ruta.indexOf("~/") === 0) ruta = inicio + ruta.slice(1);
      var abs = ruta.charAt(0) === "/" ? ruta : cwd + "/" + ruta;
      var pila = [];
      abs.split("/").forEach(function (p) {
        if (!p || p === ".") return;
        if (p === "..") pila.pop(); else pila.push(p);
      });
      return "/" + pila.join("/");
    }
    function obtener(abs) {
      if (abs === "/") return raiz;
      var d = raiz;
      var partes = abs.split("/").filter(Boolean);
      for (var i = 0; i < partes.length; i++) {
        if (!d || d.tipo !== "dir" || !d.hijos[partes[i]]) return null;
        d = d.hijos[partes[i]];
      }
      return d;
    }
    function padreYNombre(abs) {
      var i = abs.lastIndexOf("/");
      return { padre: obtener(abs.slice(0, i) || "/"), nombre: abs.slice(i + 1) };
    }
    function mostrarRuta(abs) { return abs === inicio ? "~" : abs.indexOf(inicio + "/") === 0 ? "~" + abs.slice(inicio.length) : abs; }
    function copiar(n) { return JSON.parse(JSON.stringify(n)); }

    // ---------- Git (simplificado, un repositorio) ----------
    function arbolDe(dirAbs) {
      var mapa = {};
      (function recorrer(nodo, prefijo) {
        Object.keys(nodo.hijos).sort().forEach(function (k) {
          if (k === ".git") return;
          var h = nodo.hijos[k];
          if (h.tipo === "dir") recorrer(h, prefijo + k + "/"); else mapa[prefijo + k] = h.contenido;
        });
      })(obtener(dirAbs), "");
      return mapa;
    }
    function dentroDelRepo() { return git && (cwd === git.raiz || cwd.indexOf(git.raiz + "/") === 0); }
    function commitDe(rama) { var id = git.ramas[rama]; return id ? git.commits[id] : null; }
    function arbolHead() { var c = git.head ? commitDe(git.head) : null; return c ? c.arbol : {}; }
    function relativa(abs) { return abs === git.raiz ? "" : abs.slice(git.raiz.length + 1); }
    function escribirArbol(arbol) {
      var repo = obtener(git.raiz);
      Object.keys(repo.hijos).forEach(function (k) { if (k !== ".git") delete repo.hijos[k]; });
      Object.keys(arbol).forEach(function (ruta) {
        var partes = ruta.split("/"), d = repo;
        partes.forEach(function (p, i) {
          if (i === partes.length - 1) d.hijos[p] = { tipo: "archivo", contenido: arbol[ruta] };
          else { if (!d.hijos[p]) d.hijos[p] = { tipo: "dir", hijos: {} }; d = d.hijos[p]; }
        });
      });
    }
    function nuevoId() {
      contadorCommit++;
      var base = (contadorCommit * 2654435761 >>> 0).toString(16);
      return ("0000000" + base).slice(-7);
    }
    function estadoGit() {
      var trabajo = arbolDe(git.raiz), indice = git.indice, head = arbolHead();
      var preparados = [], sinPreparar = [], nuevos = [];
      var todas = {};
      [trabajo, indice, head].forEach(function (a) { Object.keys(a).forEach(function (k) { todas[k] = 1; }); });
      Object.keys(todas).sort().forEach(function (k) {
        var enH = k in head, enI = k in indice, enT = k in trabajo;
        if (enI && (!enH || head[k] !== indice[k])) preparados.push({ archivo: k, tipo: enH ? "modified" : "new file" });
        if (!enI && enH) preparados.push({ archivo: k, tipo: "deleted" });
        if (enI && enT && trabajo[k] !== indice[k]) sinPreparar.push({ archivo: k, tipo: "modified" });
        if (enI && !enT) sinPreparar.push({ archivo: k, tipo: "deleted" });
        if (!enI && !enH && enT) nuevos.push(k);
      });
      return { preparados: preparados, sinPreparar: sinPreparar, nuevos: nuevos };
    }
    function comandoGit(args) {
      var sub = args[0];
      if (!sub) return ["usage: git <command> [<args>]", "Prueba: git init, git status, git add, git commit -m \"mensaje\", git log --oneline"];
      if (sub === "init") {
        if (git && dentroDelRepo()) return ["Reinitialized existing Git repository in " + git.raiz + "/.git/"];
        git = { raiz: cwd, ramas: { main: null }, head: "main", indice: {}, commits: {} };
        obtener(cwd).hijos[".git"] = { tipo: "dir", hijos: {}, oculto: true };
        return ["Initialized empty Git repository in " + cwd + "/.git/"];
      }
      if (!dentroDelRepo()) return { error: "fatal: not a git repository (or any of the parent directories): .git", ayuda: "Todavía no hay un repositorio aquí. Usa «git init» dentro de la carpeta del proyecto." };
      if (sub === "status") {
        var e = estadoGit(), out = ["On branch " + git.head];
        if (!commitDe(git.head)) out.push("", "No commits yet");
        if (e.preparados.length) { out.push("", "Changes to be committed:", "  (use \"git restore --staged <file>...\" to unstage)"); e.preparados.forEach(function (p) { out.push("\t" + (p.tipo + ":").padEnd(12) + p.archivo); }); }
        if (e.sinPreparar.length) { out.push("", "Changes not staged for commit:", "  (use \"git add <file>...\" to update what will be committed)"); e.sinPreparar.forEach(function (p) { out.push("\t" + (p.tipo + ":").padEnd(12) + p.archivo); }); }
        if (e.nuevos.length) { out.push("", "Untracked files:", "  (use \"git add <file>...\" to include in what will be committed)"); e.nuevos.forEach(function (p) { out.push("\t" + p); }); }
        if (!e.preparados.length && !e.sinPreparar.length && !e.nuevos.length) out.push(commitDe(git.head) ? "nothing to commit, working tree clean" : "nothing to commit (create/copy files and use \"git add\" to track)");
        else if (!e.preparados.length) out.push("", e.sinPreparar.length ? "no changes added to commit (use \"git add\" and/or \"git commit -a\")" : "nothing added to commit but untracked files present (use \"git add\" to track)");
        return out;
      }
      if (sub === "add") {
        var rutas = args.slice(1);
        if (!rutas.length) return { error: "Nothing specified, nothing added.", ayuda: "Indica qué archivo añadir, por ejemplo «git add index.html», o «git add .» para todos." };
        var trabajo = arbolDe(git.raiz);
        for (var i = 0; i < rutas.length; i++) {
          var r = rutas[i], abs = normalizar(r), rel = relativa(abs);
          if (r === "." || r === "-A" || r === "--all" || abs === git.raiz) {
            git.indice = copiar(trabajo);
            continue;
          }
          var nodo = obtener(abs);
          var coincide = false;
          Object.keys(trabajo).forEach(function (k) { if (k === rel || k.indexOf(rel + "/") === 0) { git.indice[k] = trabajo[k]; coincide = true; } });
          Object.keys(git.indice).forEach(function (k) { if ((k === rel || k.indexOf(rel + "/") === 0) && !(k in trabajo)) { delete git.indice[k]; coincide = true; } });
          if (!nodo && !coincide) return { error: "fatal: pathspec '" + r + "' did not match any files", ayuda: "No existe un archivo llamado «" + r + "». Revisa el nombre con «ls»." };
        }
        return [];
      }
      if (sub === "commit") {
        var iM = args.indexOf("-m");
        if (args.indexOf("-am") !== -1) { iM = args.indexOf("-am"); Object.keys(arbolHead()).forEach(function (k) { var t = arbolDe(git.raiz); if (k in t) git.indice[k] = t[k]; else delete git.indice[k]; }); }
        if (iM === -1 || !args[iM + 1]) return { error: "Aborting commit due to empty commit message.", ayuda: "Escribe el mensaje con -m, entre comillas: git commit -m \"Añade la portada\"" };
        var e2 = estadoGit();
        if (!e2.preparados.length) return [ "On branch " + git.head, e2.nuevos.length || e2.sinPreparar.length ? "no changes added to commit (use \"git add\" and/or \"git commit -a\")" : "nothing to commit, working tree clean" ];
        var id = nuevoId(), padre = git.ramas[git.head];
        git.commits[id] = { id: id, mensaje: args[iM + 1], padres: padre ? [padre] : [], arbol: copiar(git.indice), rama: git.head };
        var primero = !padre;
        git.ramas[git.head] = id;
        return ["[" + git.head + (primero ? " (root-commit)" : "") + " " + id + "] " + args[iM + 1], " " + e2.preparados.length + " file" + (e2.preparados.length === 1 ? "" : "s") + " changed"];
      }
      if (sub === "log") {
        var c = commitDe(git.head);
        if (!c) return { error: "fatal: your current branch '" + git.head + "' does not have any commits yet", ayuda: "Todavía no hay commits. Haz uno con git add y git commit -m." };
        var out2 = [], vistos = {}, pendientes = [c.id], corto = args.indexOf("--oneline") !== -1;
        while (pendientes.length) {
          var idc = pendientes.shift(); if (vistos[idc]) continue; vistos[idc] = 1;
          var cc = git.commits[idc];
          var etiquetas = Object.keys(git.ramas).filter(function (r) { return git.ramas[r] === idc; });
          var deco = etiquetas.length ? " (" + etiquetas.map(function (r) { return r === git.head ? "HEAD -> " + r : r; }).join(", ") + ")" : "";
          if (corto) out2.push(idc + deco + " " + cc.mensaje);
          else out2.push("commit " + idc + "0000000000000000000000000000000000".slice(0, 33) + deco, "Author: " + usuario + " <" + usuario + "@ejemplo.com>", "", "    " + cc.mensaje, "");
          pendientes = pendientes.concat(cc.padres);
        }
        return out2;
      }
      if (sub === "branch") {
        if (!args[1]) return Object.keys(git.ramas).sort().map(function (r) { return (r === git.head ? "* " : "  ") + r; });
        if (args[1] === "-d" || args[1] === "-D") { if (!git.ramas.hasOwnProperty(args[2])) return { error: "error: branch '" + args[2] + "' not found" }; if (args[2] === git.head) return { error: "error: cannot delete branch '" + args[2] + "' used by worktree" }; delete git.ramas[args[2]]; return ["Deleted branch " + args[2] + "."]; }
        if (!git.ramas[git.head]) return { error: "fatal: not a valid object name: '" + git.head + "'", ayuda: "Haz al menos un commit antes de crear ramas." };
        if (git.ramas.hasOwnProperty(args[1])) return { error: "fatal: a branch named '" + args[1] + "' already exists" };
        git.ramas[args[1]] = git.ramas[git.head];
        return [];
      }
      if (sub === "switch" || sub === "checkout") {
        var crearRama = args[1] === "-c" || args[1] === "-b";
        var nombre = crearRama ? args[2] : args[1];
        if (!nombre) return { error: "fatal: missing branch or commit argument" };
        if (sub === "checkout" && !crearRama && !git.ramas.hasOwnProperty(nombre) && obtener(normalizar(nombre))) {
          var relc = relativa(normalizar(nombre)), h0 = arbolHead();
          if (relc in git.indice) { escribirArchivo(normalizar(nombre), git.indice[relc]); return ["Updated 1 path from the index"]; }
          if (relc in h0) { escribirArchivo(normalizar(nombre), h0[relc]); return ["Updated 1 path from the index"]; }
        }
        if (crearRama) {
          if (git.ramas.hasOwnProperty(nombre)) return { error: "fatal: a branch named '" + nombre + "' already exists" };
          git.ramas[nombre] = git.ramas[git.head]; git.head = nombre;
          return ["Switched to a new branch '" + nombre + "'"];
        }
        if (!git.ramas.hasOwnProperty(nombre)) return { error: "fatal: invalid reference: " + nombre, ayuda: "Esa rama no existe. Mira las ramas con «git branch» o créala con «git switch -c " + nombre + "»." };
        var e3 = estadoGit();
        if (e3.preparados.length || e3.sinPreparar.length) return { error: "error: Your local changes to the following files would be overwritten by checkout:", ayuda: "Tienes cambios sin guardar en un commit. Haz commit antes de cambiar de rama." };
        git.head = nombre;
        var arbol = commitDe(nombre) ? commitDe(nombre).arbol : {};
        var nuevosT = arbolDe(git.raiz);
        e3.nuevos.forEach(function (k) { arbol[k] = nuevosT[k]; });
        escribirArbol(arbol);
        git.indice = copiar(commitDe(nombre) ? commitDe(nombre).arbol : {});
        return ["Switched to branch '" + nombre + "'"];
      }
      if (sub === "merge") {
        var otra = args[1];
        if (!otra || !git.ramas.hasOwnProperty(otra)) return { error: "merge: " + (otra || "") + " - not something we can merge" };
        var a = git.ramas[git.head], b = git.ramas[otra];
        if (!b || a === b) return ["Already up to date."];
        var ancestros = function (id) { var s = {}, p = [id]; while (p.length) { var x = p.shift(); if (!x || s[x]) continue; s[x] = 1; p = p.concat(git.commits[x].padres); } return s; };
        var deB = ancestros(b), deA = ancestros(a);
        if (deB[a] || !a) {
          git.ramas[git.head] = b; escribirArbol(copiar(git.commits[b].arbol)); git.indice = copiar(git.commits[b].arbol);
          return ["Updating " + (a || "0000000") + ".." + b, "Fast-forward"];
        }
        if (deA[b]) return ["Already up to date."];
        var base = null; Object.keys(deA).forEach(function (x) { if (deB[x] && (!base || x > base)) base = x; });
        var ta = git.commits[a].arbol, tb = git.commits[b].arbol, tbase = base ? git.commits[base].arbol : {};
        var resultado = {}, conflictos = [], claves = {};
        [ta, tb, tbase].forEach(function (t) { Object.keys(t).forEach(function (k) { claves[k] = 1; }); });
        Object.keys(claves).forEach(function (k) {
          var va = ta[k], vb = tb[k], vbase = tbase[k];
          if (va === vb) { if (va !== undefined) resultado[k] = va; }
          else if (va === vbase) { if (vb !== undefined) resultado[k] = vb; }
          else if (vb === vbase) { if (va !== undefined) resultado[k] = va; }
          else { conflictos.push(k); resultado[k] = "<<<<<<< HEAD\n" + (va || "") + "\n=======\n" + (vb || "") + "\n>>>>>>> " + otra; }
        });
        escribirArbol(resultado);
        if (conflictos.length) {
          git.indice = copiar(ta);
          return conflictos.map(function (k) { return "CONFLICT (content): Merge conflict in " + k; }).concat(["Automatic merge failed; fix conflicts and then commit the result."]);
        }
        var idm = nuevoId();
        git.commits[idm] = { id: idm, mensaje: "Merge branch '" + otra + "'", padres: [a, b], arbol: copiar(resultado), rama: git.head };
        git.ramas[git.head] = idm; git.indice = copiar(resultado);
        return ["Merge made by the 'ort' strategy."];
      }
      if (sub === "diff") {
        var trabajo2 = arbolDe(git.raiz), comparar = args.indexOf("--staged") !== -1 ? arbolHead() : git.indice, contra = args.indexOf("--staged") !== -1 ? git.indice : trabajo2;
        var out3 = [];
        Object.keys(Object.assign({}, comparar, contra)).sort().forEach(function (k) {
          if (!(k in comparar) && args.indexOf("--staged") === -1) return;
          if (comparar[k] === contra[k]) return;
          out3.push("diff --git a/" + k + " b/" + k, "--- a/" + k, "+++ b/" + k);
          String(comparar[k] || "").split("\n").forEach(function (l) { if (comparar[k] !== undefined && String(contra[k] || "").split("\n").indexOf(l) === -1) out3.push("-" + l); });
          String(contra[k] || "").split("\n").forEach(function (l) { if (contra[k] !== undefined && String(comparar[k] || "").split("\n").indexOf(l) === -1) out3.push("+" + l); });
        });
        return out3;
      }
      if (sub === "restore") {
        var staged = args.indexOf("--staged") !== -1;
        var objetivos = args.slice(1).filter(function (x) { return x !== "--staged"; });
        objetivos.forEach(function (r) {
          var rel2 = relativa(normalizar(r)), head2 = arbolHead();
          if (staged) { if (rel2 in head2) git.indice[rel2] = head2[rel2]; else delete git.indice[rel2]; }
          else if (rel2 in git.indice) escribirArchivo(normalizar(r), git.indice[rel2]);
        });
        return [];
      }
      if (sub === "remote" || sub === "push" || sub === "pull" || sub === "clone") return { error: "Esta terminal de práctica no tiene conexión a internet.", ayuda: "«git " + sub + "» se practica con GitHub en tu computadora (lo verás en la estación de Git)." };
      return { error: "git: '" + sub + "' is not a git command. See 'git --help'." };
    }
    function escribirArchivo(abs, contenido, anadir) {
      var pn = padreYNombre(abs);
      if (!pn.padre || pn.padre.tipo !== "dir") return false;
      var ex = pn.padre.hijos[pn.nombre];
      if (ex && ex.tipo === "dir") return false;
      pn.padre.hijos[pn.nombre] = { tipo: "archivo", contenido: anadir && ex ? ex.contenido + contenido : contenido };
      return true;
    }

    // ---------- Intérprete de comandos ----------
    function trocear(linea) {
      var partes = [], actual = "", comilla = null, hay = false;
      for (var i = 0; i < linea.length; i++) {
        var ch = linea.charAt(i);
        if (comilla) { if (ch === comilla) comilla = null; else actual += ch; }
        else if (ch === "\"" || ch === "'") { comilla = ch; hay = true; }
        else if (ch === " " || ch === "\t") { if (actual || hay) { partes.push(actual); actual = ""; hay = false; } }
        else if (ch === ">") {
          if (actual || hay) { partes.push(actual); actual = ""; hay = false; }
          if (linea.charAt(i + 1) === ">") { partes.push(">>"); i++; } else partes.push(">");
        }
        else actual += ch;
      }
      if (comilla) return null;
      if (actual || hay) partes.push(actual);
      return partes;
    }
    var COMANDOS = "pwd, ls, cd, mkdir, touch, cat, echo, rm, rmdir, mv, cp, clear, history, help y git";
    function ejecutarLinea(linea) {
      var t = trocear(linea);
      if (t === null) return { error: "Falta cerrar unas comillas.", ayuda: "Si abres comillas \" tienes que cerrarlas." };
      if (!t.length) return [];
      var cmd = t[0], args = t.slice(1);
      var red = args.indexOf(">") !== -1 ? ">" : args.indexOf(">>") !== -1 ? ">>" : null;
      var destino = null;
      if (red) { var ir = args.indexOf(red); destino = args[ir + 1]; args = args.slice(0, ir); if (!destino) return { error: "bash: error de sintaxis cerca del elemento inesperado «newline»" }; }
      var res;
      switch (cmd) {
        case "pwd": res = [cwd]; break;
        case "whoami": res = [usuario]; break;
        case "help": res = ["Comandos disponibles en esta terminal de práctica:", "  " + COMANDOS, "Ejemplos: ls   cd carpeta   cd ..   mkdir proyecto   touch index.html   echo \"hola\" > notas.txt"]; break;
        case "history": res = historial.map(function (h, i) { return String(i + 1).padStart(4) + "  " + h; }); break;
        case "clear": return { limpiar: true };
        case "ls": {
          var todo = args.indexOf("-a") !== -1 || args.indexOf("-la") !== -1 || args.indexOf("-al") !== -1;
          var larga = args.indexOf("-l") !== -1 || args.indexOf("-la") !== -1 || args.indexOf("-al") !== -1;
          var rutasLs = args.filter(function (a) { return a.charAt(0) !== "-"; });
          var abs = normalizar(rutasLs[0] || ".");
          var n = obtener(abs);
          if (!n) return { error: "ls: no se puede acceder a '" + rutasLs[0] + "': No existe el archivo o el directorio" };
          if (n.tipo === "archivo") { res = [rutasLs[0]]; break; }
          var nombres = Object.keys(n.hijos).sort().filter(function (k) { return todo || k.charAt(0) !== "."; });
          if (larga) res = nombres.map(function (k) { var h = n.hijos[k]; return (h.tipo === "dir" ? "drwxr-xr-x " : "-rw-r--r-- ") + String(h.tipo === "dir" ? 4096 : h.contenido.length).padStart(5) + " " + k + (h.tipo === "dir" ? "/" : ""); });
          else res = nombres.length ? [nombres.map(function (k) { return n.hijos[k].tipo === "dir" ? k + "/" : k; }).join("  ")] : [];
          break;
        }
        case "cd": {
          var abs2 = normalizar(args[0] || "~");
          var n2 = obtener(abs2);
          if (!n2) return { error: "bash: cd: " + args[0] + ": No existe el archivo o el directorio", ayuda: "Usa «ls» para ver qué carpetas hay aquí." };
          if (n2.tipo !== "dir") return { error: "bash: cd: " + args[0] + ": No es un directorio" };
          cwd = abs2; res = []; break;
        }
        case "mkdir": {
          var p = args.indexOf("-p") !== -1;
          var nombresM = args.filter(function (a) { return a !== "-p"; });
          if (!nombresM.length) return { error: "mkdir: falta un operando", ayuda: "Escribe el nombre de la carpeta: mkdir proyecto" };
          for (var i = 0; i < nombresM.length; i++) {
            var absM = normalizar(nombresM[i]);
            if (obtener(absM)) { if (p) continue; return { error: "mkdir: no se puede crear el directorio «" + nombresM[i] + "»: El archivo ya existe" }; }
            if (p) {
              var dM = raiz; absM.split("/").filter(Boolean).forEach(function (seg) { if (!dM.hijos[seg]) dM.hijos[seg] = { tipo: "dir", hijos: {} }; dM = dM.hijos[seg]; });
            } else {
              var pnM = padreYNombre(absM);
              if (!pnM.padre) return { error: "mkdir: no se puede crear el directorio «" + nombresM[i] + "»: No existe el archivo o el directorio", ayuda: "La carpeta de dentro no existe. Créala primero o usa mkdir -p." };
              pnM.padre.hijos[pnM.nombre] = { tipo: "dir", hijos: {} };
            }
          }
          res = []; break;
        }
        case "touch": {
          if (!args.length) return { error: "touch: falta un operando de archivo" };
          for (var j = 0; j < args.length; j++) {
            var absT = normalizar(args[j]);
            if (obtener(absT)) continue;
            if (!escribirArchivo(absT, "")) return { error: "touch: no se puede efectuar 'touch' sobre '" + args[j] + "': No existe el archivo o el directorio" };
          }
          res = []; break;
        }
        case "cat": {
          if (!args.length) return { error: "cat: falta el nombre del archivo" };
          res = [];
          for (var k = 0; k < args.length; k++) {
            var nC = obtener(normalizar(args[k]));
            if (!nC) return { error: "cat: " + args[k] + ": No existe el archivo o el directorio" };
            if (nC.tipo === "dir") return { error: "cat: " + args[k] + ": Es un directorio" };
            if (nC.contenido) res = res.concat(nC.contenido.replace(/\n$/, "").split("\n"));
          }
          break;
        }
        case "echo": res = [args.join(" ")]; break;
        case "rm": {
          var rec = args.some(function (a) { return /^-[rf]+$/.test(a); });
          var objetivos = args.filter(function (a) { return !/^-[rf]+$/.test(a); });
          if (!objetivos.length) return { error: "rm: falta un operando" };
          for (var m = 0; m < objetivos.length; m++) {
            var absR = normalizar(objetivos[m]), nR = obtener(absR);
            if (!nR) return { error: "rm: no se puede borrar '" + objetivos[m] + "': No existe el archivo o el directorio" };
            if (nR.tipo === "dir" && !rec) return { error: "rm: no se puede borrar '" + objetivos[m] + "': Es un directorio", ayuda: "Para borrar una carpeta con su contenido: rm -r " + objetivos[m] + " (¡cuidado, no hay papelera!)" };
            if (cwd === absR || cwd.indexOf(absR + "/") === 0) return { error: "rm: no se puede borrar la carpeta en la que estás" };
            var pnR = padreYNombre(absR); delete pnR.padre.hijos[pnR.nombre];
          }
          res = []; break;
        }
        case "rmdir": {
          var nD = obtener(normalizar(args[0] || ""));
          if (!nD || nD.tipo !== "dir") return { error: "rmdir: fallo al borrar '" + (args[0] || "") + "': No existe el directorio" };
          if (Object.keys(nD.hijos).length) return { error: "rmdir: fallo al borrar '" + args[0] + "': El directorio no está vacío" };
          var pnD = padreYNombre(normalizar(args[0])); delete pnD.padre.hijos[pnD.nombre]; res = []; break;
        }
        case "mv": case "cp": {
          if (args.length < 2) return { error: cmd + ": falta el archivo de destino" };
          var origen = normalizar(args[0]), nO = obtener(origen);
          if (!nO) return { error: cmd + ": no se puede efectuar stat sobre '" + args[0] + "': No existe el archivo o el directorio" };
          var absDest = normalizar(args[1]), nDest = obtener(absDest);
          if (nDest && nDest.tipo === "dir") absDest = absDest + "/" + origen.split("/").pop();
          var pnDest = padreYNombre(absDest);
          if (!pnDest.padre) return { error: cmd + ": no se puede crear '" + args[1] + "': No existe el archivo o el directorio" };
          pnDest.padre.hijos[pnDest.nombre] = cmd === "cp" ? copiar(nO) : nO;
          if (cmd === "mv") { var pnO = padreYNombre(origen); delete pnO.padre.hijos[pnO.nombre]; }
          res = []; break;
        }
        case "git": res = comandoGit(args); break;
        case "node": case "npm": case "code": case "python": case "python3": case "sudo": case "cls": case "dir":
          return { error: cmd + ": comando no disponible en esta terminal de práctica", ayuda: cmd === "cls" || cmd === "dir" ? "«" + cmd + "» es de la consola de Windows (cmd). En bash se usa «" + (cmd === "cls" ? "clear" : "ls") + "»." : "Aquí solo hay: " + COMANDOS + ". Ese comando lo usarás en tu computadora." };
        default:
          return { error: cmd + ": no se encontró la orden", ayuda: "¿Está bien escrito? Escribe «help» para ver los comandos disponibles." };
      }
      if (res && res.error) return res;
      if (red) {
        if (!escribirArchivo(normalizar(destino), res.join("\n") + "\n", red === ">>")) return { error: "bash: " + destino + ": No existe el archivo o el directorio" };
        return [];
      }
      return res;
    }

    // ---------- Interfaz ----------
    caja.innerHTML = "";
    caja.classList.add("js");
    var cabeza = crear("div", { "class": "terminal-cabeza", html: ICO_TERMINAL + "<span></span>" });
    cabeza.lastChild.textContent = titulo;
    var bReiniciar = crear("button", { type: "button", "class": "boton boton-sec boton-mini", texto: "Reiniciar" });
    cabeza.appendChild(bReiniciar);
    caja.appendChild(cabeza);
    instrucciones.forEach(function (x) { caja.appendChild(x); });
    var pantalla = crear("div", { "class": "terminal-pantalla", role: "log", "aria-live": "polite", "aria-label": "Salida de la terminal" });
    var fila = crear("div", { "class": "terminal-fila" });
    var prompt = crear("span", { "class": "terminal-prompt" });
    var idE = "term-" + Math.random().toString(36).slice(2, 8);
    var entrada = crear("input", { type: "text", id: idE, "class": "terminal-entrada", autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-label": "Escribe un comando y pulsa Enter" });
    fila.appendChild(prompt); fila.appendChild(entrada);
    pantalla.appendChild(fila);
    caja.appendChild(pantalla);
    var veredicto = crear("div", { "class": "taller-veredicto", role: "status" });
    caja.appendChild(veredicto);
    var posHist = -1;

    function textoPrompt() { return usuario + "@terminal:" + mostrarRuta(cwd) + "$ "; }
    function actualizarPrompt() { prompt.textContent = textoPrompt(); }
    function imprimir(texto, clase) { pantalla.insertBefore(crear("div", { "class": "terminal-linea" + (clase ? " " + clase : ""), texto: texto }), fila); }
    function bienvenida() {
      imprimir("Terminal de práctica. Escribe «help» para ver los comandos. Nada de lo que hagas aquí afecta a tu computadora.", "tenue");
    }
    var verificador = null, ultimoPedido = 0;
    function mostrarMision(r) {
      if (r === true) {
        veredicto.className = "taller-veredicto ok"; veredicto.innerHTML = ICO_OK + "<span>¡Misión cumplida!</span>";
      } else if (typeof r === "string" && historial.length) {
        veredicto.className = "taller-veredicto pendiente"; veredicto.innerHTML = "<span></span>"; veredicto.lastChild.textContent = r;
      }
    }
    function comprobar() {
      if (!mision) return;
      var sistema = (function convertir(n) { var o = {}; Object.keys(n.hijos).forEach(function (k) { var h = n.hijos[k]; o[k] = h.tipo === "dir" ? convertir(h) : h.contenido; }); return o; })(obtener(inicio) || { hijos: {} });
      var e = git ? estadoGit() : null;
      var estadoRepo = git ? { raiz: git.raiz, rama: git.head, ramas: Object.keys(git.ramas), commits: Object.keys(git.commits).map(function (id) { return git.commits[id]; }), preparados: e.preparados.map(function (p) { return p.archivo; }), limpio: !e.preparados.length && !e.sinPreparar.length && !e.nuevos.length } : null;
      var datos = { sistema: sistema, historial: historial.slice(), git: estadoRepo, cwd: cwd, n: ++ultimoPedido };
      try {
        if (!verificador) {
          var fuente = "onmessage=function(ev){var d=ev.data,r;try{r=(function(sistema,historial,git,cwd){\n" + mision + "\n})(d.sistema,d.historial,d.git,d.cwd);}catch(err){r=null;}postMessage({n:d.n,r:r===undefined?true:r});};";
          var url = URL.createObjectURL(new Blob([fuente], { type: "text/javascript" }));
          verificador = new Worker(url);
          verificador.onmessage = function (ev) { if (ev.data.n === ultimoPedido) mostrarMision(ev.data.r); };
        }
        verificador.postMessage(datos);
      } catch (err) {
        try { mostrarMision(new Function("sistema", "historial", "git", "cwd", mision)(datos.sistema, datos.historial, datos.git, datos.cwd)); } catch (e2) { /* sin verificación */ }
      }
    }
    entrada.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var linea = entrada.value;
        imprimir(textoPrompt() + linea, "orden");
        entrada.value = "";
        if (linea.trim()) historial.push(linea.trim());
        posHist = -1;
        var r = ejecutarLinea(linea.trim());
        if (r && r.limpiar) { $$(".terminal-linea", pantalla).forEach(function (l) { l.remove(); }); }
        else if (r && r.error) { imprimir(r.error, "error"); if (r.ayuda) imprimir("Pista: " + r.ayuda, "aviso"); }
        else if (r) r.forEach(function (l) { imprimir(l); });
        actualizarPrompt();
        pantalla.scrollTop = pantalla.scrollHeight;
        comprobar();
      } else if (e.key === "ArrowUp") {
        if (!historial.length) return; e.preventDefault();
        posHist = posHist === -1 ? historial.length - 1 : Math.max(0, posHist - 1);
        entrada.value = historial[posHist];
      } else if (e.key === "ArrowDown") {
        if (posHist === -1) return; e.preventDefault();
        posHist = posHist + 1; if (posHist >= historial.length) { posHist = -1; entrada.value = ""; } else entrada.value = historial[posHist];
      } else if (e.key === "Tab") {
        var v = entrada.value, partes = v.split(" "), ult = partes.pop();
        if (!ult) return;
        e.preventDefault();
        var dirRuta = ult.lastIndexOf("/") !== -1 ? ult.slice(0, ult.lastIndexOf("/") + 1) : "";
        var base = obtener(normalizar(dirRuta || "."));
        if (!base || base.tipo !== "dir") return;
        var pref = ult.slice(dirRuta.length);
        var cand = Object.keys(base.hijos).filter(function (k) { return k.indexOf(pref) === 0 && k.charAt(0) !== "."; });
        if (cand.length === 1) { partes.push(dirRuta + cand[0] + (base.hijos[cand[0]].tipo === "dir" ? "/" : "")); entrada.value = partes.join(" "); }
        else if (cand.length > 1) imprimir(cand.join("  "), "tenue");
      }
    });
    pantalla.addEventListener("click", function () { if (!window.getSelection().toString()) entrada.focus({ preventScroll: true }); });
    bReiniciar.addEventListener("click", function () {
      reiniciarEstado();
      $$(".terminal-linea", pantalla).forEach(function (l) { l.remove(); });
      veredicto.className = "taller-veredicto";
      bienvenida(); actualizarPrompt();
    });
    bienvenida(); actualizarPrompt();
  }

  function iniciar() {
    $$(".parsons").forEach(iniciarParsons);
    $$(".terminal-sim").forEach(iniciarTerminal);
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
