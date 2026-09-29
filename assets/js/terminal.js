/* TERMINAL — componentes interactivos del curso.
   Sin dependencias obligatorias. Si Prism (resaltado de sintaxis) está cargado,
   se usa; si no, el código se muestra sin colores. */
(function () {
  "use strict";

  var doc = document;
  var raiz = doc.documentElement;
  var CLAVE = "terminal-curso:v1";
  var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Almacenamiento (puede fallar: ventana privada, vista previa) ---------- */
  var almacen = {
    leer: function () {
      try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; }
    },
    guardar: function (datos) {
      try { localStorage.setItem(CLAVE, JSON.stringify(datos)); return true; } catch (e) { return false; }
    },
    cambiar: function (fn) { var d = almacen.leer(); fn(d); almacen.guardar(d); return d; }
  };
  window.TerminalAlmacen = almacen;

  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var crear = function (etiqueta, atributos, hijos) {
    var el = doc.createElement(etiqueta);
    if (atributos) Object.keys(atributos).forEach(function (k) {
      if (k === "texto") el.textContent = atributos[k];
      else if (k === "html") el.innerHTML = atributos[k];
      else if (k.indexOf("on") === 0) el.addEventListener(k.slice(2), atributos[k]);
      else el.setAttribute(k, atributos[k]);
    });
    (hijos || []).forEach(function (h) { if (h) el.appendChild(typeof h === "string" ? doc.createTextNode(h) : h); });
    return el;
  };
  var ICONOS = {
    play: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path class="ico-relleno" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    pausa: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect class="ico-relleno" x="6" y="5" width="4" height="14" rx="1"/><rect class="ico-relleno" x="14" y="5" width="4" height="14" rx="1"/></svg>',
    ant: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    sig: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    reiniciar: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/></svg>',
    ok: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    mal: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v6"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>',
    capsula: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path class="ico-relleno" d="M10 9v6l5-3z"/></svg>',
    traza: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h10M4 12h16M4 18h8"/><path class="ico-relleno" d="M17 3l4 3-4 3z"/></svg>',
    taller: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></svg>'
  };

  /* ---------- Tema claro/oscuro ---------- */
  function iniciarTema() {
    var guardado = almacen.leer().tema;
    if (guardado === "light" || guardado === "dark") raiz.setAttribute("data-theme", guardado);
    $$("[data-accion='tema']").forEach(function (b) {
      b.addEventListener("click", function () {
        var actual = raiz.getAttribute("data-theme");
        if (!actual) actual = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        var nuevo = actual === "dark" ? "light" : "dark";
        raiz.setAttribute("data-theme", nuevo);
        almacen.cambiar(function (d) { d.tema = nuevo; });
        b.setAttribute("aria-label", nuevo === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
      });
    });
  }

  /* ---------- Aviso flotante ---------- */
  var avisoEl = null, avisoT = null;
  function avisar(texto) {
    if (!avisoEl) { avisoEl = crear("div", { "class": "aviso-flotante", role: "status", "aria-live": "polite" }); doc.body.appendChild(avisoEl); }
    avisoEl.textContent = texto;
    avisoEl.classList.add("ver");
    clearTimeout(avisoT);
    avisoT = setTimeout(function () { avisoEl.classList.remove("ver"); }, 2600);
  }
  window.TerminalAvisar = avisar;

  /* ---------- Resaltado de sintaxis ---------- */
  var ALIAS = { js: "javascript", javascript: "javascript", ts: "typescript", html: "markup", xml: "markup", svg: "markup", sh: "bash", shell: "bash", consola: "bash", py: "python", gd: "gdscript" };
  function lenguajeDe(el) {
    var m = (el.className || "").match(/language-([\w-]+)/);
    return m ? (ALIAS[m[1]] || m[1]) : null;
  }
  function resaltar(texto, lenguaje) {
    var P = window.Prism;
    if (P && lenguaje && P.languages[lenguaje]) {
      try { return P.highlight(texto, P.languages[lenguaje], lenguaje); } catch (e) { /* sigue sin color */ }
    }
    return escapar(texto);
  }
  function escapar(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function iniciarBloquesCodigo() {
    $$("pre > code").forEach(function (code) {
      var pre = code.parentNode;
      if (pre.closest(".taller, .traza, .editor")) return;
      var lenguaje = lenguajeDe(code);
      if (lenguaje && window.Prism && window.Prism.languages[lenguaje] && !code.dataset.resaltado) {
        code.innerHTML = resaltar(code.textContent, lenguaje);
        code.dataset.resaltado = "1";
      }
      if (pre.classList.contains("consola") || pre.dataset.sinCopiar !== undefined) return;
      var envoltura = pre.parentNode.classList && pre.parentNode.classList.contains("bloque-codigo") ? pre.parentNode : null;
      if (!envoltura) {
        envoltura = crear("div", { "class": "bloque-codigo" });
        pre.parentNode.insertBefore(envoltura, pre);
        envoltura.appendChild(pre);
      }
      var boton = crear("button", { type: "button", "class": "copiar", texto: "Copiar" });
      boton.addEventListener("click", function () {
        var texto = code.textContent;
        var hecho = function () { boton.textContent = "Copiado"; setTimeout(function () { boton.textContent = "Copiar"; }, 1600); };
        try {
          navigator.clipboard.writeText(texto).then(hecho, function () { seleccionar(code); boton.textContent = "Selecciona y copia"; });
        } catch (e) { seleccionar(code); }
      });
      envoltura.appendChild(boton);
    });
  }
  function seleccionar(el) {
    var r = doc.createRange(); r.selectNodeContents(el);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }

  /* ---------- Paradas (índice del módulo con el tren que avanza) ---------- */
  function iniciarParadas() {
    var nav = $(".paradas");
    var barra = $(".barra-progreso span");
    var secciones = $$(".contenido > section[id]");
    if (!secciones.length) return;
    var items = nav ? $$("li", nav) : [];
    var tren = nav ? $(".paradas-tren", nav) : null;
    var actual = -1;

    function marcar(i) {
      if (i === actual) return;
      actual = i;
      items.forEach(function (li, j) {
        li.classList.toggle("actual", j === i);
        li.classList.toggle("pasada", j < i);
        var a = li.querySelector("a");
        if (a) { if (j === i) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current"); }
      });
      if (tren && items[i]) {
        var caja = items[i].getBoundingClientRect(), base = nav.getBoundingClientRect();
        tren.style.transform = "translateY(" + (caja.top - base.top + nav.scrollTop + caja.height / 2 - 15) + "px)";
      }
    }
    function alDesplazar() {
      var y = window.scrollY + window.innerHeight * 0.3;
      var i = 0;
      for (var k = 0; k < secciones.length; k++) { if (secciones[k].offsetTop <= y) i = k; }
      marcar(i);
      if (barra) {
        var cont = $(".contenido");
        var ini = cont.offsetTop, fin = cont.offsetTop + cont.offsetHeight - window.innerHeight;
        var p = Math.max(0, Math.min(1, (window.scrollY - ini) / Math.max(1, fin - ini)));
        barra.style.width = (p * 100).toFixed(2) + "%";
      }
    }
    var pendiente = false;
    window.addEventListener("scroll", function () {
      if (pendiente) return; pendiente = true;
      requestAnimationFrame(function () { pendiente = false; alDesplazar(); });
    }, { passive: true });
    window.addEventListener("resize", function () { actual = -1; alDesplazar(); });
    alDesplazar();
  }

  /* ---------- Cápsula animada ---------- */
  function rango(expr, paso) {
    expr = String(expr).trim();
    return expr.split(",").some(function (parte) {
      parte = parte.trim();
      if (!parte) return false;
      if (parte.indexOf("-") === -1) return paso === parseInt(parte, 10);
      var ab = parte.split("-");
      var a = ab[0] === "" ? -Infinity : parseInt(ab[0], 10);
      var b = ab[1] === "" ? Infinity : parseInt(ab[1], 10);
      return paso >= a && paso <= b;
    });
  }
  function entradas(expr) {
    return String(expr).split(";").map(function (p) {
      var i = p.indexOf(":");
      if (i === -1) return null;
      return { paso: parseInt(p.slice(0, i), 10), valor: p.slice(i + 1).trim() };
    }).filter(function (e) { return e && !isNaN(e.paso); }).sort(function (a, b) { return a.paso - b.paso; });
  }
  function vigente(lista, paso) {
    var r = null;
    lista.forEach(function (e) { if (e.paso <= paso) r = e; });
    return r;
  }

  function iniciarCapsula(fig, n) {
    var pasos = $$(".capsula-pasos > li", fig);
    if (!pasos.length) return;
    fig.classList.add("js");
    var total = pasos.length;
    var paso = 1, reproduciendo = false, temporizador = null;
    var titulo = fig.getAttribute("data-titulo") || "Explicación animada";
    var duraciones = pasos.map(function (li) { return (parseFloat(li.getAttribute("data-duracion")) || 5) * 1000; });
    var totalSeg = Math.round(duraciones.reduce(function (a, b) { return a + b; }, 0) / 1000);

    var cabeza = crear("div", { "class": "capsula-cabeza" });
    cabeza.innerHTML = ICONOS.capsula + "<span></span><span class='capsula-duracion'></span>";
    cabeza.children[1].textContent = titulo;
    cabeza.children[2].textContent = Math.floor(totalSeg / 60) + ":" + String(totalSeg % 60).padStart(2, "0");
    fig.insertBefore(cabeza, fig.firstChild);

    var controles = crear("div", { "class": "capsula-controles" });
    var bAnt = crear("button", { type: "button", "class": "boton boton-sec boton-mini", "aria-label": "Paso anterior", html: ICONOS.ant });
    var bPlay = crear("button", { type: "button", "class": "boton boton-mini", "aria-label": "Reproducir", html: ICONOS.play + "<span>Reproducir</span>" });
    var bSig = crear("button", { type: "button", "class": "boton boton-sec boton-mini", "aria-label": "Paso siguiente", html: ICONOS.sig });
    var barra = crear("div", { "class": "capsula-barra", role: "group", "aria-label": "Pasos" });
    var segmentos = pasos.map(function (li, i) {
      var b = crear("button", { type: "button", "aria-label": "Ir al paso " + (i + 1) });
      b.appendChild(crear("span"));
      b.addEventListener("click", function () { detener(); ir(i + 1); });
      barra.appendChild(b);
      return b;
    });
    var contador = crear("span", { "class": "capsula-contador", "aria-live": "polite" });
    [bAnt, bPlay, bSig, barra, contador].forEach(function (x) { controles.appendChild(x); });
    fig.appendChild(controles);

    var conPasos = $$("[data-pasos]", fig);
    var conClases = $$("[data-clases]", fig).map(function (el) {
      var lista = entradas(el.getAttribute("data-clases"));
      var todas = [];
      lista.forEach(function (e) { e.valor.split(/\s+/).forEach(function (c) { if (c && todas.indexOf(c) === -1) todas.push(c); }); });
      return { el: el, lista: lista, todas: todas };
    });
    var conTransform = $$("[data-mover]", fig).map(function (el) { return { el: el, lista: entradas(el.getAttribute("data-mover")) }; });
    var conTexto = $$("[data-texto]", fig).map(function (el) { return { el: el, lista: entradas(el.getAttribute("data-texto")), original: el.textContent }; });

    function pintar() {
      pasos.forEach(function (li, i) { li.classList.toggle("actual", i + 1 === paso); });
      conPasos.forEach(function (el) { el.classList.toggle("fuera", !rango(el.getAttribute("data-pasos"), paso)); });
      conClases.forEach(function (o) {
        var v = vigente(o.lista, paso);
        var activas = v ? v.valor.split(/\s+/) : [];
        o.todas.forEach(function (c) { o.el.classList.toggle(c, activas.indexOf(c) !== -1); });
      });
      conTransform.forEach(function (o) { var v = vigente(o.lista, paso); o.el.style.transform = v ? v.valor : ""; });
      conTexto.forEach(function (o) { var v = vigente(o.lista, paso); o.el.textContent = v ? v.valor : o.original; });
      segmentos.forEach(function (s, i) {
        var span = s.firstChild;
        span.style.transition = "none";
        s.classList.toggle("hecho", i + 1 < paso);
        span.style.transform = i + 1 < paso ? "scaleX(1)" : "scaleX(0)";
        if (i + 1 === paso) s.setAttribute("aria-current", "step"); else s.removeAttribute("aria-current");
      });
      contador.textContent = "Paso " + paso + " de " + total;
      bAnt.disabled = paso === 1;
      bSig.disabled = paso === total;
    }
    function animarSegmento() {
      var span = segmentos[paso - 1].firstChild;
      void span.offsetWidth;
      span.style.transition = "transform " + duraciones[paso - 1] + "ms linear";
      span.style.transform = "scaleX(1)";
    }
    function ir(p) { paso = Math.max(1, Math.min(total, p)); pintar(); }
    function programar() {
      clearTimeout(temporizador);
      if (!reproduciendo) return;
      animarSegmento();
      temporizador = setTimeout(function () {
        if (paso >= total) { detener(); segmentos[total - 1].classList.add("hecho"); return; }
        ir(paso + 1); programar();
      }, duraciones[paso - 1]);
    }
    function reproducir() {
      if (paso >= total) ir(1);
      reproduciendo = true;
      bPlay.innerHTML = ICONOS.pausa + "<span>Pausa</span>"; bPlay.setAttribute("aria-label", "Pausar");
      programar();
    }
    function detener() {
      reproduciendo = false; clearTimeout(temporizador);
      bPlay.innerHTML = ICONOS.play + "<span>" + (paso >= total ? "Ver de nuevo" : "Reproducir") + "</span>";
      bPlay.setAttribute("aria-label", "Reproducir");
      pintar();
    }
    bPlay.addEventListener("click", function () { if (reproduciendo) detener(); else reproducir(); });
    bAnt.addEventListener("click", function () { detener(); ir(paso - 1); });
    bSig.addEventListener("click", function () { detener(); ir(paso + 1); });
    fig.addEventListener("keydown", function (e) {
      if (e.target.closest("input, textarea")) return;
      if (e.key === "ArrowRight") { detener(); ir(paso + 1); }
      if (e.key === "ArrowLeft") { detener(); ir(paso - 1); }
    });
    pintar();
  }

  /* ---------- Traza: ejecución paso a paso ---------- */
  function iniciarTraza(caja) {
    var codeEl = $("pre code", caja) || $("pre", caja);
    var json = $("script[type='application/json']", caja);
    if (!codeEl || !json) return;
    var pasos;
    try { pasos = JSON.parse(json.textContent); } catch (e) { return; }
    var lenguaje = lenguajeDe(codeEl) || "javascript";
    var lineas = codeEl.textContent.replace(/\n$/, "").split("\n");
    var titulo = caja.getAttribute("data-titulo") || "Paso a paso";
    pasos.unshift({ linea: 0, vars: {}, nota: caja.getAttribute("data-inicio") || "Antes de empezar: la memoria está vacía y no se ha ejecutado ninguna línea. Pulsa «Siguiente»." });

    var pre = crear("pre", { "class": "traza-codigo" });
    var code = crear("code");
    lineas.forEach(function (l) {
      var span = crear("span", { "class": "ln" });
      span.innerHTML = resaltar(l, lenguaje) || " ";
      code.appendChild(span);
    });
    pre.appendChild(code);
    var memoria = crear("div", { "class": "traza-memoria", "aria-live": "polite" });
    var salida = crear("pre", { "class": "traza-salida" });
    var nota = crear("p", { "class": "traza-nota", "aria-live": "polite" });
    var panel = crear("div", { "class": "traza-panel" }, [
      crear("div", null, [crear("div", { "class": "traza-rotulo", texto: caja.getAttribute("data-rotulo-memoria") || "Memoria (variables)" }), memoria]),
      crear("div", null, [crear("div", { "class": "traza-rotulo", texto: "Consola" }), salida]),
      crear("div", null, [crear("div", { "class": "traza-rotulo", texto: "Qué está pasando" }), nota])
    ]);
    var cabeza = crear("div", { "class": "traza-cabeza", html: ICONOS.traza + "<span></span>" });
    cabeza.lastChild.textContent = titulo;
    var cuerpo = crear("div", { "class": "traza-cuerpo" }, [pre, panel]);
    var bAnt = crear("button", { type: "button", "class": "boton boton-sec boton-mini", html: ICONOS.ant + "<span>Anterior</span>" });
    var bSig = crear("button", { type: "button", "class": "boton boton-mini", html: "<span>Siguiente</span>" + ICONOS.sig });
    var bIni = crear("button", { type: "button", "class": "boton boton-sec boton-mini", "aria-label": "Volver al inicio", html: ICONOS.reiniciar });
    var id = "traza-" + Math.random().toString(36).slice(2, 8);
    var rangoEl = crear("input", { type: "range", min: "0", max: String(pasos.length - 1), value: "0", id: id, "aria-label": "Paso de la ejecución" });
    var contador = crear("span", { "class": "traza-contador" });
    var controles = crear("div", { "class": "traza-controles" }, [bIni, bAnt, bSig, rangoEl, contador]);
    caja.innerHTML = "";
    [cabeza, cuerpo, controles].forEach(function (x) { caja.appendChild(x); });

    var i = 0;
    var spans = $$(".ln", code);
    function pintar() {
      var p = pasos[i], previo = pasos[i - 1];
      spans.forEach(function (s, k) {
        s.classList.toggle("actual", k + 1 === p.linea);
        s.classList.toggle("hecha", pasos.slice(1, i).some(function (q) { return q.linea === k + 1; }) && k + 1 !== p.linea);
      });
      memoria.innerHTML = "";
      var claves = Object.keys(p.vars || {});
      if (!claves.length) memoria.appendChild(crear("span", { "class": "traza-vacia", texto: "(sin variables todavía)" }));
      claves.forEach(function (k) {
        var cambio = !previo || !previo.vars || previo.vars[k] !== p.vars[k];
        memoria.appendChild(crear("div", { "class": "traza-var" + (cambio && i > 0 ? " cambio" : "") }, [crear("b", { texto: k }), crear("span", { texto: String(p.vars[k]) })]));
      });
      var acumulada = [];
      pasos.slice(0, i + 1).forEach(function (q) { if (q.salida !== undefined && q.salida !== null) acumulada.push(q.salida); });
      salida.textContent = acumulada.join("\n");
      nota.textContent = p.nota || "";
      rangoEl.value = String(i);
      contador.textContent = i === 0 ? "Inicio" : "Paso " + i + " de " + (pasos.length - 1);
      bAnt.disabled = i === 0; bSig.disabled = i === pasos.length - 1;
    }
    bAnt.addEventListener("click", function () { if (i > 0) { i--; pintar(); } });
    bSig.addEventListener("click", function () { if (i < pasos.length - 1) { i++; pintar(); } });
    bIni.addEventListener("click", function () { i = 0; pintar(); });
    rangoEl.addEventListener("input", function () { i = parseInt(rangoEl.value, 10) || 0; pintar(); });
    pintar();
  }

  /* ---------- Editor de código (textarea sobre un <pre> resaltado) ---------- */
  function crearEditor(valorInicial, lenguaje, etiqueta) {
    var envoltura = crear("div", { "class": "editor" });
    var numeros = crear("div", { "class": "numeros", "aria-hidden": "true" });
    var pre = crear("pre", { "aria-hidden": "true" });
    var code = crear("code");
    pre.appendChild(code);
    var id = "ed-" + Math.random().toString(36).slice(2, 9);
    var area = crear("textarea", { id: id, spellcheck: "false", autocapitalize: "off", autocomplete: "off", "aria-label": etiqueta || "Editor de código" });
    area.setAttribute("autocorrect", "off");
    area.value = valorInicial;
    [numeros, pre, area].forEach(function (x) { envoltura.appendChild(x); });
    function actualizar() {
      var v = area.value;
      code.innerHTML = resaltar(v + (v.slice(-1) === "\n" ? " " : ""), lenguaje);
      var n = v.split("\n").length;
      var t = []; for (var k = 1; k <= n; k++) t.push(k);
      numeros.textContent = t.join("\n");
      var alto = Math.max(8 * 16, pre.scrollHeight);
      envoltura.style.height = alto + "px";
    }
    area.addEventListener("input", actualizar);
    area.addEventListener("scroll", function () { pre.scrollLeft = area.scrollLeft; numeros.scrollTop = area.scrollTop; pre.scrollTop = area.scrollTop; });
    area.addEventListener("keydown", function (e) {
      if (e.key === "Tab" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        // Tab inserta dos espacios; Escape y luego Tab permite salir del editor.
        if (area.dataset.salir === "1") { area.dataset.salir = ""; return; }
        e.preventDefault();
        var ini = area.selectionStart, fin = area.selectionEnd;
        area.setRangeText("  ", ini, fin, "end");
        actualizar();
      } else if (e.key === "Escape") {
        area.dataset.salir = "1";
      } else if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        var antes = area.value.slice(0, area.selectionStart);
        var lineaActual = antes.slice(antes.lastIndexOf("\n") + 1);
        var sangria = (lineaActual.match(/^\s*/) || [""])[0];
        if (/[{[(]\s*$/.test(lineaActual)) sangria += "  ";
        e.preventDefault();
        area.setRangeText("\n" + sangria, area.selectionStart, area.selectionEnd, "end");
        actualizar();
      } else {
        area.dataset.salir = "";
      }
    });
    setTimeout(actualizar, 0);
    return { el: envoltura, area: area, valor: function () { return area.value; }, poner: function (v) { area.value = v; actualizar(); }, actualizar: actualizar };
  }

  /* ---------- Taller: ejecutar código ---------- */
  function iniciarTaller(caja) {
    var modo = caja.getAttribute("data-modo") || "js";
    var titulo = caja.getAttribute("data-titulo") || "Pruébalo";
    var fuentes = $$("textarea.taller-codigo", caja);
    var verificarEl = $("script.taller-verificar", caja);
    var verificacion = verificarEl ? verificarEl.textContent : "";
    var esperado = caja.getAttribute("data-esperado");
    if (esperado !== null && !verificacion) {
      verificacion = "var esp = " + JSON.stringify(esperado.replace(/\r/g, "")) + ".trim().split('\\n').map(function(s){return s.trim();});\n" +
        "var real = salida.join('\\n').trim().split('\\n').map(function(s){return s.trim();});\n" +
        "if (real.join('\\n') === esp.join('\\n')) return true;\n" +
        "for (var i = 0; i < esp.length; i++) { if (real[i] !== esp[i]) return 'La línea ' + (i+1) + ' debería ser «' + esp[i] + '» y es «' + (real[i] === undefined ? '(nada)' : real[i]) + '».'; }\n" +
        "return 'Imprimiste más líneas de las esperadas. Sobra: «' + real[esp.length] + '».';";
    }
    var tiempoMax = (parseFloat(caja.getAttribute("data-tiempo")) || 5) * 1000;
    var clave = caja.id ? "taller:" + location.pathname + "#" + caja.id : null;

    var enMarco = modo === "web" || modo === "python" || modo === "sql";
    var prepEl = $("script.taller-preparacion", caja);
    var preparacion = prepEl ? prepEl.textContent : "";
    var LENG_MODO = { web: "markup", python: "python", sql: "sql" };
    var editores = fuentes.map(function (t) {
      var leng = t.getAttribute("data-lenguaje") || LENG_MODO[modo] || caja.getAttribute("data-lenguaje") || "js";
      return { lenguaje: ALIAS[leng] || leng, nombre: leng === "markup" ? "html" : leng, inicial: t.value.replace(/^\n/, "").replace(/\s+$/, "") + "\n" };
    });
    if (!editores.length) editores.push({ lenguaje: ALIAS[LENG_MODO[modo]] || "javascript", nombre: LENG_MODO[modo] || "js", inicial: "\n" });
    if (clave) {
      var guardados = (almacen.leer().talleres || {})[clave];
      if (guardados && guardados.length === editores.length) editores.forEach(function (e, i) { e.guardado = guardados[i]; });
    }

    caja.innerHTML = "";
    var bEjecutar = crear("button", { type: "button", "class": "boton", html: ICONOS.play + "<span>Ejecutar</span>" });
    var bReiniciar = crear("button", { type: "button", "class": "boton boton-sec", html: ICONOS.reiniciar + "<span>Reiniciar</span>" });
    var tituloEl = crear("span", { "class": "taller-titulo", html: ICONOS.taller + "<span></span>" });
    tituloEl.lastChild.textContent = titulo;
    var barra = crear("div", { "class": "taller-barra" }, [tituloEl, bReiniciar, bEjecutar]);
    caja.appendChild(barra);

    var pestanas = null;
    var zona = crear("div", { "class": "taller-editor" });
    editores.forEach(function (e, i) {
      e.editor = crearEditor(e.guardado !== undefined ? e.guardado : e.inicial, e.lenguaje, "Editor de código " + e.nombre.toUpperCase() + " — " + titulo);
      if (i > 0) e.editor.el.hidden = true;
      zona.appendChild(e.editor.el);
      e.editor.area.addEventListener("input", guardarLuego);
      e.editor.area.addEventListener("keydown", function (ev) {
        if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") { ev.preventDefault(); ejecutar(); }
      });
    });
    if (editores.length > 1) {
      pestanas = crear("div", { "class": "taller-pestanas", role: "tablist" });
      editores.forEach(function (e, i) {
        var b = crear("button", { type: "button", role: "tab", "aria-selected": i === 0 ? "true" : "false", texto: e.nombre.toUpperCase() });
        b.addEventListener("click", function () {
          editores.forEach(function (o, j) { o.editor.el.hidden = j !== i; pestanas.children[j].setAttribute("aria-selected", j === i ? "true" : "false"); });
          e.editor.actualizar();
        });
        pestanas.appendChild(b);
      });
      caja.appendChild(pestanas);
    }
    caja.appendChild(zona);

    var salida = crear("div", { "class": "taller-salida", "aria-live": "polite" });
    salida.appendChild(crear("div", { "class": "taller-salida-rotulo", texto: modo === "web" ? "Consola de la página" : modo === "sql" ? "Resultado" : "Consola" }));
    var cuerpoSalida = crear("div");
    cuerpoSalida.appendChild(crear("div", { "class": "vacio", texto: "Pulsa «Ejecutar» (o Ctrl + Enter) para ver el resultado aquí." }));
    salida.appendChild(cuerpoSalida);
    var vista = null, iframe = null;
    if (enMarco) {
      vista = crear("div", { "class": "taller-vista" });
      iframe = crear("iframe", { title: (modo === "web" ? "Vista previa — " : "Ejecución — ") + titulo, sandbox: "allow-scripts allow-modals", loading: "lazy" });
      if (caja.getAttribute("data-alto")) iframe.style.height = caja.getAttribute("data-alto");
      vista.appendChild(iframe);
      if (modo !== "web") vista.hidden = true;
      caja.appendChild(vista);
    }
    caja.appendChild(salida);
    var veredicto = crear("div", { "class": "taller-veredicto", role: "status" });
    caja.appendChild(veredicto);

    var tGuardar = null;
    function guardarLuego() {
      if (!clave) return;
      clearTimeout(tGuardar);
      tGuardar = setTimeout(function () {
        almacen.cambiar(function (d) { d.talleres = d.talleres || {}; d.talleres[clave] = editores.map(function (e) { return e.editor.valor(); }); });
      }, 500);
    }
    function linea(tipo, texto) {
      if (cuerpoSalida.firstChild && cuerpoSalida.firstChild.classList.contains("vacio")) cuerpoSalida.innerHTML = "";
      cuerpoSalida.appendChild(crear("div", { "class": "l " + tipo, texto: texto }));
      salida.scrollTop = salida.scrollHeight;
    }
    function mostrarVeredicto(r) {
      if (r === true) {
        veredicto.className = "taller-veredicto ok";
        veredicto.innerHTML = ICONOS.ok + "<span></span>";
        veredicto.lastChild.textContent = caja.getAttribute("data-exito") || "¡Correcto! Tu programa hace lo que se pedía.";
      } else if (r === null) {
        veredicto.className = "taller-veredicto";
      } else {
        veredicto.className = "taller-veredicto mal";
        veredicto.innerHTML = ICONOS.mal + "<span></span>";
        veredicto.lastChild.textContent = typeof r === "string" ? r : "Todavía no. Revisa el enunciado y vuelve a intentarlo.";
      }
    }
    function informarError(d) {
      var texto = d.nombre + ": " + d.mensaje + (d.linea ? "  (línea " + d.linea + ")" : "");
      linea("error", texto);
      var ayuda = window.TerminalMotor ? window.TerminalMotor.explicarError(d.nombre, d.mensaje) : "";
      if (ayuda) linea("aviso", "Pista: " + ayuda);
    }

    var trabajador = null, tLimite = null;
    function terminar() {
      clearTimeout(tLimite);
      if (trabajador) { trabajador.terminate(); trabajador = null; }
      bEjecutar.disabled = false;
    }
    function ejecutar() {
      terminar();
      cuerpoSalida.innerHTML = "";
      mostrarVeredicto(null);
      if (enMarco) return ejecutarMarco();
      var codigo = editores[0].editor.valor();
      if (!window.TerminalMotor) { linea("error", "No se pudo cargar el motor de ejecución."); return; }
      var fuente = window.TerminalMotor.construirFuente(codigo, verificacion);
      var hubo = false;
      bEjecutar.disabled = true;
      try {
        var url = URL.createObjectURL(new Blob([fuente.fuente], { type: "text/javascript" }));
        trabajador = new Worker(url);
        URL.revokeObjectURL(url);
      } catch (e) {
        linea("error", "Este navegador no permite ejecutar el código aquí (" + e.message + "). Copia el código y pruébalo en la consola del navegador (F12).");
        bEjecutar.disabled = false;
        return;
      }
      trabajador.onmessage = function (ev) {
        var m = ev.data;
        if (m.tipo === "log") { hubo = true; linea("", m.datos); }
        else if (m.tipo === "error") { hubo = true; linea("error", m.datos); }
        else if (m.tipo === "aviso") { hubo = true; linea("aviso", m.datos); }
        else if (m.tipo === "limpiar") { cuerpoSalida.innerHTML = ""; }
        else if (m.tipo === "excepcion") { hubo = true; informarError(m.datos); }
        else if (m.tipo === "veredicto") { mostrarVeredicto(m.datos); if (m.datos === true) marcarEjercicio(caja); }
        else if (m.tipo === "fin") { if (!hubo) cuerpoSalida.appendChild(crear("div", { "class": "vacio", texto: "(El programa terminó sin imprimir nada.)" })); terminar(); }
      };
      trabajador.onerror = function (ev) {
        ev.preventDefault();
        var msg = String(ev.message || "Error").replace(/^Uncaught\s+/, "");
        var partes = msg.match(/^(\w*Error):\s*([\s\S]*)$/);
        var lin = ev.lineno ? ev.lineno - fuente.desfase : null;
        informarError({ nombre: partes ? partes[1] : "Error", mensaje: partes ? partes[2] : msg, linea: lin > 0 ? lin : null });
        terminar();
      };
      tLimite = setTimeout(function () {
        linea("aviso", "Se detuvo el programa tras " + tiempoMax / 1000 + " s. ¿Hay un bucle que nunca termina, o un setInterval sin clearInterval?");
        terminar();
      }, tiempoMax);
    }

    var CDN = "https://cdnjs.cloudflare.com/ajax/libs/";
    function ejecutarMarco() {
      var partes = { html: "", css: "", js: "", python: "", sql: "" };
      editores.forEach(function (e) { partes[e.nombre === "javascript" ? "js" : e.nombre] = e.editor.valor(); });
      var sinCierre = function (t) { return String(t).replace(/<\/script/gi, "<\\/script"); };
      var idJ = JSON.stringify(idTaller);
      var puente = "<script>(function(){var P=parent;function f(v){try{if(typeof v==='string')return v;return JSON.stringify(v);}catch(e){return String(v);}}" +
        "window.__salida=[];var PY=" + (modo === "python") + ",buf={log:'',error:''};function emitir(k,a){if(PY){if(/error in loaders|handle error|frame obj/.test(a))return;a=a.replace(/File \"[^\"]*principal\"/,'File \"tu_programa.py\"');}if(k==='log'||k==='info')window.__salida.push(a);P.postMessage({terminalTaller:" + idJ + ",tipo:k==='error'?'error':(k==='warn'?'aviso':'log'),datos:a},'*');}" +
        "window.__vaciar=function(){['log','error'].forEach(function(k){if(buf[k]){emitir(k,buf[k]);buf[k]='';}});};" +
        "['log','info','warn','error'].forEach(function(k){var o=console[k];console[k]=function(){var a=[].slice.call(arguments).map(f).join(' ');" +
        "if(PY&&(k==='log'||k==='error')){buf[k]+=a;var partes=buf[k].split('\\n');buf[k]=partes.pop();partes.forEach(function(l){emitir(k,l);});}else emitir(k,a);o&&o.apply(console,arguments);};});" +
        "window.addEventListener('error',function(e){P.postMessage({terminalTaller:" + idJ + ",tipo:'excepcion',datos:{nombre:(e.error&&e.error.name)||'Error',mensaje:(e.error&&e.error.message)||e.message,linea:e.lineno||null}},'*');});" +
        "window.__terminar=function(extra){window.__vaciar();var r=true;" + (verificacion ? "try{r=(function(salida,codigo,resultados){" + sinCierre(verificacion) + "\n})(window.__salida.slice()," + sinCierre(JSON.stringify(modo === "web" ? partes : (partes[modo] || ""))) + ",window.__resultados||[]);}catch(e){r='La verificación falló: '+e.message;}" : "") +
        "P.postMessage({terminalTaller:" + idJ + ",tipo:'fin',datos:" + (verificacion ? "(r===undefined?true:r)" : "null") + "},'*');};})();<\/script>";
      var cabeza = "<!doctype html><html lang='es'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>" + puente;
      var html;
      if (modo === "python") {
        html = cabeza + "<script src='" + CDN + "brython/3.14.3/brython.min.js'><\/script><script src='" + CDN + "brython/3.14.3/brython_stdlib.js'><\/script></head><body>" +
          "<brython-options indexeddb='false' cache='false'></brython-options><script type='text/python' id='principal'>\n" + sinCierre(partes.python) + "\n<\/script>" +
          "<script>window.addEventListener('load',function(){if(!window.__BRYTHON__){console.error('No se pudo cargar el intérprete de Python.');}setTimeout(window.__terminar,300);});<\/script></body></html>";
      } else if (modo === "sql") {
        html = cabeza + "<script src='" + CDN + "sql.js/1.14.2/sql-asm.js'><\/script></head><body><script>" +
          "var tablaTexto=" + window.TerminalMotor.tablaTexto.toString() + ";" +
          "initSqlJs().then(function(SQL){var db=new SQL.Database();window.__resultados=[];" +
          "try{db.run(" + sinCierre(JSON.stringify(preparacion)) + ");}catch(e){console.error('Error en los datos de ejemplo: '+e.message);}" +
          "try{var res=db.exec(" + sinCierre(JSON.stringify(partes.sql)) + ");res.forEach(function(r){window.__resultados.push(r);tablaTexto(r.columns,r.values).forEach(function(l){console.log(l);});});" +
          "if(!res.length)console.log('Listo: la instrucción se ejecutó y no devolvió filas.');}catch(e){console.error('Error de SQL: '+e.message);}" +
          "window.__terminar();}).catch(function(e){console.error('No se pudo cargar SQLite: '+e.message);window.__terminar();});<\/script></body></html>";
      } else {
        html = cabeza + "<style>" + partes.css + "</style></head><body>" + partes.html + "<script>" + sinCierre(partes.js) + "\n<\/script>" +
          "<script>window.addEventListener('load',function(){setTimeout(window.__terminar,150);});<\/script></body></html>";
      }
      if (modo !== "web") linea("vacio", modo === "python" ? "Ejecutando Python…" : "Ejecutando SQL…");
      iframe.srcdoc = html;
    }
    var idTaller = "t" + Math.random().toString(36).slice(2, 9);
    if (enMarco) {
      window.addEventListener("message", function (ev) {
        var m = ev.data;
        if (!m || m.terminalTaller !== idTaller) return;
        var primero = cuerpoSalida.firstChild;
        if (primero && primero.classList.contains("vacio")) cuerpoSalida.innerHTML = "";
        if (m.tipo === "excepcion") informarError(m.datos);
        else if (m.tipo === "fin") {
          if (!cuerpoSalida.firstChild) cuerpoSalida.appendChild(crear("div", { "class": "vacio", texto: "(El programa terminó sin imprimir nada.)" }));
          if (m.datos !== null && m.datos !== undefined) { mostrarVeredicto(m.datos); if (m.datos === true) marcarEjercicio(caja); }
        }
        else linea(m.tipo === "log" ? "" : m.tipo, m.datos);
      });
    }

    bEjecutar.addEventListener("click", ejecutar);
    bReiniciar.addEventListener("click", function () {
      terminar();
      editores.forEach(function (e) { e.editor.poner(e.inicial); });
      if (clave) almacen.cambiar(function (d) { if (d.talleres) delete d.talleres[clave]; });
      cuerpoSalida.innerHTML = "";
      cuerpoSalida.appendChild(crear("div", { "class": "vacio", texto: "Código restaurado. Pulsa «Ejecutar» para probarlo." }));
      mostrarVeredicto(null);
      if (iframe) iframe.srcdoc = "";
    });
    if (enMarco && caja.hasAttribute("data-auto")) setTimeout(ejecutar, 50);
  }

  function marcarEjercicio(caja) {
    var ej = caja.closest(".ejercicio");
    if (!ej || !ej.id) return;
    var modulo = doc.body.getAttribute("data-modulo");
    almacen.cambiar(function (d) { d.ejercicios = d.ejercicios || {}; d.ejercicios[modulo + "#" + ej.id] = Date.now(); });
    ej.classList.add("resuelto");
  }

  /* ---------- Autoevaluación ---------- */
  function iniciarQuiz(quiz) {
    var preguntas = $$(".pregunta", quiz);
    var aciertos = 0, respondidas = 0;
    var modulo = doc.body.getAttribute("data-modulo") || "";
    var resultado = crear("p", { "class": "quiz-resultado", "aria-live": "polite", hidden: "" });
    preguntas.forEach(function (pq, n) {
      var correcta = parseInt(pq.getAttribute("data-correcta"), 10);
      var enunciado = $(".enunciado", pq);
      if (enunciado && !$(".num", enunciado)) enunciado.insertBefore(crear("span", { "class": "num", texto: (n + 1) + "." }), enunciado.firstChild);
      var opciones = $$(".opciones > li", pq);
      opciones.forEach(function (li, i) {
        var explica = $(".explica", li);
        if (explica) li.removeChild(explica);
        var boton = crear("button", { type: "button", "class": "opcion" });
        boton.appendChild(crear("span", { "class": "letra", "aria-hidden": "true", texto: "ABCDEFG"[i] }));
        var texto = crear("span");
        while (li.firstChild) texto.appendChild(li.firstChild);
        boton.appendChild(texto);
        li.appendChild(boton);
        if (explica) li.appendChild(explica);
        boton.addEventListener("click", function () {
          if (pq.classList.contains("respondida")) return;
          pq.classList.add("respondida");
          respondidas++;
          var bien = i + 1 === correcta;
          if (bien) aciertos++;
          opciones.forEach(function (o, j) {
            var b = $(".opcion", o);
            b.disabled = true;
            if (j + 1 === correcta) b.classList.add("correcta");
            if (j === i && !bien) b.classList.add("incorrecta");
            var ex = $(".explica", o);
            if (ex && (j === i || j + 1 === correcta)) ex.classList.add("mostrar");
          });
          boton.setAttribute("aria-label", (bien ? "Correcto. " : "Incorrecto. ") + boton.textContent);
          if (respondidas === preguntas.length) {
            resultado.hidden = false;
            resultado.textContent = "Resultado: " + aciertos + " de " + preguntas.length + ". " +
              (aciertos === preguntas.length ? "¡Perfecto! Estás listo para la próxima estación." :
                aciertos >= preguntas.length * 0.7 ? "Muy bien. Repasa las explicaciones de las que fallaste." :
                "Vale la pena repasar las secciones de este módulo antes de seguir. No pasa nada: repasar es parte de aprender.");
            almacen.cambiar(function (d) { d.quiz = d.quiz || {}; var prev = d.quiz[modulo] || 0; d.quiz[modulo] = Math.max(prev, aciertos / preguntas.length); });
          }
        });
      });
    });
    var reintentar = crear("button", { type: "button", "class": "boton boton-sec", html: ICONOS.reiniciar + "<span>Reintentar la autoevaluación</span>" });
    reintentar.addEventListener("click", function () {
      aciertos = 0; respondidas = 0; resultado.hidden = true;
      preguntas.forEach(function (pq) {
        pq.classList.remove("respondida");
        $$(".opcion", pq).forEach(function (b) { b.disabled = false; b.classList.remove("correcta", "incorrecta"); b.removeAttribute("aria-label"); });
        $$(".explica", pq).forEach(function (e) { e.classList.remove("mostrar"); });
      });
    });
    quiz.appendChild(resultado);
    quiz.appendChild(crear("div", null, [reintentar]));
  }

  /* ---------- Objetivos (lista para marcar) ---------- */
  function iniciarObjetivos() {
    var modulo = doc.body.getAttribute("data-modulo") || "";
    var guardados = (almacen.leer().objetivos || {})[modulo] || [];
    $$(".objetivos").forEach(function (lista) {
      $$(":scope > li", lista).forEach(function (li, i) {
        var id = "obj-" + modulo + "-" + i;
        var caja = crear("input", { type: "checkbox", id: id });
        caja.checked = guardados.indexOf(i) !== -1;
        var etiqueta = crear("label", { "for": id });
        var texto = crear("span");
        while (li.firstChild) texto.appendChild(li.firstChild);
        etiqueta.appendChild(caja); etiqueta.appendChild(texto);
        li.appendChild(etiqueta);
        caja.addEventListener("change", function () {
          almacen.cambiar(function (d) {
            d.objetivos = d.objetivos || {};
            var l = d.objetivos[modulo] || [];
            if (caja.checked && l.indexOf(i) === -1) l.push(i);
            if (!caja.checked) l = l.filter(function (x) { return x !== i; });
            d.objetivos[modulo] = l;
          });
        });
      });
    });
  }

  /* ---------- Completar módulo ---------- */
  function iniciarCompletar() {
    var modulo = doc.body.getAttribute("data-modulo");
    if (!modulo) return;
    almacen.cambiar(function (d) { d.ultima = modulo; });
    var cajas = $$(".completar");
    function pintar() {
      var hecho = !!((almacen.leer().completadas || {})[modulo]);
      cajas.forEach(function (c) {
        c.classList.toggle("hecho", hecho);
        var p = $("p", c), b = $("button", c);
        if (p) p.textContent = hecho ? "Estación completada. ¡Buen trabajo!" : (c.getAttribute("data-texto") || "¿Terminaste las prácticas y la autoevaluación?");
        if (b) { b.textContent = hecho ? "Desmarcar" : "Marcar estación como completada"; b.classList.toggle("boton-sec", hecho); }
      });
      $$(".tira-parada.actual").forEach(function (p) { p.classList.toggle("hecha", hecho); });
    }
    cajas.forEach(function (c) {
      var b = $("button", c);
      if (!b) return;
      b.addEventListener("click", function () {
        var ahora = almacen.cambiar(function (d) {
          d.completadas = d.completadas || {};
          if (d.completadas[modulo]) delete d.completadas[modulo]; else d.completadas[modulo] = Date.now();
        });
        pintar();
        avisar(ahora.completadas && ahora.completadas[modulo] ? "Estación completada. Tu progreso quedó guardado en este navegador." : "Estación marcada como pendiente.");
      });
    });
    pintar();
  }

  /* ---------- Tira de estaciones: estados y tren ---------- */
  function iniciarTira() {
    var completadas = almacen.leer().completadas || {};
    $$(".tira [data-slug]").forEach(function (g) {
      var p = $(".tira-parada", g);
      if (p && completadas[g.getAttribute("data-slug")]) p.classList.add("hecha");
    });
    var tren = $(".tira-tren-grupo");
    if (tren && !reducido) {
      var desde = parseFloat(tren.getAttribute("data-desde")), hasta = parseFloat(tren.getAttribute("data-hasta"));
      if (!isNaN(desde) && !isNaN(hasta) && desde !== hasta) {
        tren.style.transform = "translateX(" + (desde - hasta) + "px)";
        tren.getBoundingClientRect();
        tren.style.transition = "transform 1.4s cubic-bezier(0.16, 1, 0.3, 1) .25s";
        tren.style.transform = "translateX(0)";
      }
    }
  }

  /* ---------- Enlaces externos ---------- */
  function iniciarEnlaces() {
    $$("a[href^='http']").forEach(function (a) {
      if (a.host === location.host) return;
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
  }

  /* ---------- Portada: progreso en el mapa ---------- */
  function iniciarPortada() {
    var datosEl = $("#datos-curso");
    if (!datosEl) return;
    var curso;
    try { curso = JSON.parse(datosEl.textContent); } catch (e) { return; }
    var d = almacen.leer();
    var completadas = d.completadas || {};
    var hechas = 0;
    curso.modulos.forEach(function (m) {
      var hecho = !!completadas[m.slug];
      if (hecho) hechas++;
      $$("[data-slug='" + m.slug + "']").forEach(function (el) { el.classList.toggle("hecha", hecho); });
    });
    var siguiente = null;
    for (var i = 0; i < curso.modulos.length; i++) { if (!completadas[curso.modulos[i].slug]) { siguiente = curso.modulos[i]; break; } }
    var destino = d.ultima && !completadas[d.ultima] ? curso.modulos.filter(function (m) { return m.slug === d.ultima; })[0] : siguiente;
    $$("[data-continuar]").forEach(function (a) {
      if (!destino || hechas === 0 && !d.ultima) return;
      a.setAttribute("href", destino.url);
      var t = $("span", a) || a;
      t.textContent = "Continuar en " + destino.estacion;
    });
    $$("[data-progreso-texto]").forEach(function (el) {
      el.textContent = hechas === 0 ? "Aún no empiezas. Tu progreso se guardará en este navegador." :
        hechas + " de " + curso.modulos.length + " estaciones completadas";
    });
    $$("[data-progreso-barra]").forEach(function (el) { el.style.width = (hechas / curso.modulos.length * 100).toFixed(1) + "%"; });
    var marcaTren = $(".mapa-tren");
    if (marcaTren && destino) {
      var est = $(".mapa-estacion[data-slug='" + destino.slug + "']");
      if (est) {
        var x = est.getAttribute("data-x"), y = est.getAttribute("data-y");
        marcaTren.setAttribute("transform", "translate(" + x + " " + y + ")");
        marcaTren.removeAttribute("hidden");
        marcaTren.style.display = "";
      }
    }
  }

  /* ---------- Calculadora de horarios ---------- */
  function iniciarHorarios() {
    var caja = $("[data-horarios]");
    if (!caja) return;
    var entrada = $("input[type='range']", caja);
    var salidaHoras = $("[data-horas-semana]", caja);
    var filas = $$("[data-linea-horas]", caja);
    var totalEl = $("[data-total-meses]", caja);
    var juniorEl = $("[data-junior-meses]", caja);
    var totalHoras = parseFloat(caja.getAttribute("data-total-horas"));
    var consolidacion = parseFloat(caja.getAttribute("data-consolidacion"));
    function meses(h, porSemana) { return h / porSemana / 4.345; }
    function formato(m) {
      if (m < 1) return Math.max(1, Math.round(m * 4.345)) + " sem.";
      if (m < 24) return (Math.round(m * 2) / 2).toString().replace(".", ",") + " meses";
      return (Math.round(m / 12 * 10) / 10).toString().replace(".", ",") + " años";
    }
    function pintar() {
      var h = parseFloat(entrada.value);
      salidaHoras.textContent = h + " h por semana";
      var acumulado = 0;
      filas.forEach(function (f) {
        var horas = parseFloat(f.getAttribute("data-linea-horas"));
        acumulado += horas;
        var celda = $("[data-meses]", f);
        if (celda) celda.textContent = formato(meses(horas, h));
        var hasta = $("[data-acumulado]", f);
        if (hasta) hasta.textContent = formato(meses(acumulado, h));
      });
      if (totalEl) totalEl.textContent = formato(meses(totalHoras, h));
      if (juniorEl) juniorEl.textContent = formato(meses(totalHoras + consolidacion, h));
      almacen.cambiar(function (d) { d.horasSemana = h; });
    }
    var previo = almacen.leer().horasSemana;
    if (previo) entrada.value = previo;
    entrada.addEventListener("input", pintar);
    pintar();
  }

  /* ---------- Mapa: resaltar estación y conexiones ---------- */
  function iniciarMapa() {
    var mapa = $(".mapa-red");
    if (!mapa) return;
    var ficha = $("[data-ficha]");
    $$(".mapa-estacion", mapa).forEach(function (g) {
      var mostrar = function () {
        mapa.classList.add("enfocado");
        g.classList.add("foco");
        if (ficha) {
          $("[data-ficha-titulo]", ficha).textContent = g.getAttribute("data-titulo");
          $("[data-ficha-texto]", ficha).textContent = g.getAttribute("data-promesa");
          $("[data-ficha-meta]", ficha).textContent = g.getAttribute("data-meta");
          ficha.setAttribute("data-linea", g.getAttribute("data-linea"));
          ficha.hidden = false;
        }
      };
      var ocultar = function () { mapa.classList.remove("enfocado"); g.classList.remove("foco"); };
      g.addEventListener("mouseenter", mostrar); g.addEventListener("mouseleave", ocultar);
      g.addEventListener("focusin", mostrar); g.addEventListener("focusout", ocultar);
    });
  }

  function iniciar() {
    iniciarTema();
    iniciarBloquesCodigo();
    $$(".capsula").forEach(iniciarCapsula);
    $$(".traza").forEach(iniciarTraza);
    $$(".taller").forEach(iniciarTaller);
    $$(".quiz").forEach(iniciarQuiz);
    iniciarObjetivos();
    iniciarParadas();
    iniciarCompletar();
    iniciarTira();
    iniciarEnlaces();
    iniciarPortada();
    iniciarHorarios();
    iniciarMapa();
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
