/* Motor de ejecución de los talleres de código.
   Construye el código fuente de un Web Worker que ejecuta el programa del
   estudiante, captura console.log/error/warn con un formato parecido al de
   Node.js, espera temporizadores y promesas, y corre la verificación.
   Lo usan el navegador (terminal.js) y la herramienta de pruebas en Node. */
(function (raiz) {
  "use strict";

  // Todo lo que va dentro del worker. Se serializa como texto.
  function preludio() {
    var __enviar = function (tipo, datos) { self.postMessage({ tipo: tipo, datos: datos }); };
    var __lineas = [];
    var __pendientes = 0;

    function __formato(valor, profundidad, anidado, vistos) {
      profundidad = profundidad || 0;
      vistos = vistos || [];
      var t = typeof valor;
      if (valor === null) return "null";
      if (t === "undefined") return "undefined";
      if (t === "string") return anidado ? "'" + valor.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n") + "'" : valor;
      if (t === "number") return Object.is(valor, -0) ? "-0" : String(valor);
      if (t === "bigint") return String(valor) + "n";
      if (t === "boolean") return String(valor);
      if (t === "symbol") return valor.toString();
      if (t === "function") {
        if (/^class\s/.test(Function.prototype.toString.call(valor))) return "[class " + (valor.name || "(anónima)") + "]";
        return valor.name ? "[Function: " + valor.name + "]" : "[Function (anonymous)]";
      }
      if (vistos.indexOf(valor) !== -1) return "[Circular *]";
      if (valor instanceof Error) return (valor.name || "Error") + ": " + valor.message;
      if (valor instanceof Date) return isNaN(valor) ? "Invalid Date" : valor.toISOString();
      if (valor instanceof RegExp) return String(valor);
      if (profundidad > 2) return Array.isArray(valor) ? "[Array]" : "[Object]";
      var sig = vistos.concat([valor]);
      var f = function (v) { return __formato(v, profundidad + 1, true, sig); };
      if (Array.isArray(valor)) {
        if (valor.length === 0) return "[]";
        var partes = [];
        var huecos = 0;
        for (var i = 0; i < valor.length; i++) {
          if (!(i in valor)) { huecos++; continue; }
          if (huecos) { partes.push("<" + huecos + " empty item" + (huecos > 1 ? "s" : "") + ">"); huecos = 0; }
          partes.push(f(valor[i]));
        }
        if (huecos) partes.push("<" + huecos + " empty item" + (huecos > 1 ? "s" : "") + ">");
        return "[ " + partes.join(", ") + " ]";
      }
      if (valor instanceof Map) {
        if (valor.size === 0) return "Map(0) {}";
        var pm = [];
        valor.forEach(function (v, k) { pm.push(f(k) + " => " + f(v)); });
        return "Map(" + valor.size + ") { " + pm.join(", ") + " }";
      }
      if (valor instanceof Set) {
        if (valor.size === 0) return "Set(0) {}";
        var ps = [];
        valor.forEach(function (v) { ps.push(f(v)); });
        return "Set(" + valor.size + ") { " + ps.join(", ") + " }";
      }
      if (typeof Promise !== "undefined" && valor instanceof Promise) return "Promise { <pending> }";
      var claves = Object.keys(valor);
      var proto = Object.getPrototypeOf(valor);
      var nombre = proto && proto.constructor && proto.constructor.name && proto.constructor !== Object ? proto.constructor.name + " " : "";
      if (proto === null) nombre = "[Object: null prototype] ";
      if (claves.length === 0) return nombre + "{}";
      var po = claves.map(function (k) {
        var clave = /^[A-Za-z_$][\w$]*$/.test(k) ? k : "'" + k + "'";
        return clave + ": " + f(valor[k]);
      });
      return nombre + "{ " + po.join(", ") + " }";
    }

    var __errores = [];
    var __sangria = "";
    function __imprimir(tipo, args) {
      var texto = Array.prototype.map.call(args, function (a) { return __formato(a, 0, false); }).join(" ");
      if (__sangria) texto = texto.split("\n").map(function (l) { return __sangria + l; }).join("\n");
      if (tipo === "log") __lineas.push(texto); else __errores.push(texto);
      __enviar(tipo, texto);
    }
    // console.table con el formato de caja de Node.js
    function __tabla(datos, columnas) {
      if (datos === null || typeof datos !== "object") { __imprimir("log", [datos]); return; }
      var filas = Object.keys(datos), cols = [], hayValor = false;
      filas.forEach(function (k) {
        var v = datos[k];
        if (v !== null && typeof v === "object") Object.keys(v).forEach(function (c) { if (cols.indexOf(c) === -1) cols.push(c); });
        else hayValor = true;
      });
      if (columnas) cols = columnas.slice();
      var cab = ["(index)"].concat(cols); if (hayValor) cab.push("Values");
      var cuerpo = filas.map(function (k) {
        var v = datos[k], fila = [k];
        cols.forEach(function (c) { fila.push(v !== null && typeof v === "object" && c in v ? __formato(v[c], 1, true) : ""); });
        if (hayValor) fila.push(v !== null && typeof v === "object" ? "" : __formato(v, 1, true));
        return fila;
      });
      var anchos = cab.map(function (c, i) { return Math.max(String(c).length, cuerpo.reduce(function (m, f) { return Math.max(m, String(f[i]).length); }, 0)) + 2; });
      var linea = function (a, b, c) { return a + anchos.map(function (w) { return Array(w + 1).join("─"); }).join(b) + c; };
      var fila = function (f) { return "│" + f.map(function (v, i) { v = String(v); return " " + v + Array(anchos[i] - v.length).join(" "); }).join("│") + "│"; };
      var out = [linea("┌", "┬", "┐"), fila(cab), linea("├", "┼", "┤")].concat(cuerpo.map(fila)).concat([linea("└", "┴", "┘")]);
      __imprimir("log", [out.join("\n")]);
    }
    var __contadores = {}, __tiempos = {};
    var console = {
      log: function () { __imprimir("log", arguments); },
      info: function () { __imprimir("log", arguments); },
      debug: function () { __imprimir("log", arguments); },
      dir: function (v) { __imprimir("log", [v]); },
      error: function () { __imprimir("error", arguments); },
      warn: function () { __imprimir("aviso", arguments); },
      table: function (d, c) { __tabla(d, c); },
      group: function () { if (arguments.length) __imprimir("log", arguments); __sangria += "  "; },
      groupCollapsed: function () { if (arguments.length) __imprimir("log", arguments); __sangria += "  "; },
      groupEnd: function () { __sangria = __sangria.slice(2); },
      count: function (e) { e = e === undefined ? "default" : String(e); __contadores[e] = (__contadores[e] || 0) + 1; __imprimir("log", [e + ": " + __contadores[e]]); },
      countReset: function (e) { __contadores[e === undefined ? "default" : String(e)] = 0; },
      time: function (e) { __tiempos[e === undefined ? "default" : String(e)] = Date.now(); },
      timeLog: function (e) { e = e === undefined ? "default" : String(e); __imprimir("log", [e + ": " + (Date.now() - (__tiempos[e] || Date.now())) + "ms"]); },
      timeEnd: function (e) { e = e === undefined ? "default" : String(e); __imprimir("log", [e + ": " + (Date.now() - (__tiempos[e] || Date.now())) + "ms"]); delete __tiempos[e]; },
      assert: function (cond) { if (!cond) { var resto = Array.prototype.slice.call(arguments, 1); __imprimir("error", ["Assertion failed" + (resto.length ? ": " + resto.map(function (a) { return __formato(a, 0, false); }).join(" ") : "")]); } },
      trace: function () { __imprimir("error", ["Trace: " + Array.prototype.map.call(arguments, function (a) { return __formato(a, 0, false); }).join(" ")]); },
      clear: function () { __enviar("limpiar"); }
    };
    self.console = console;

    var __setTimeout = self.setTimeout.bind(self);
    var __clearTimeout = self.clearTimeout.bind(self);
    var __setInterval = self.setInterval.bind(self);
    var __clearInterval = self.clearInterval.bind(self);
    var __activos = {};
    var setTimeout = function (fn, ms) {
      var args = Array.prototype.slice.call(arguments, 2);
      __pendientes++;
      var id = __setTimeout(function () {
        delete __activos[id];
        try { if (typeof fn === "function") fn.apply(null, args); } catch (e) { __errorEjecucion(e); }
        __pendientes--; __quizaTerminar();
      }, ms);
      __activos[id] = "t";
      return id;
    };
    var clearTimeout = function (id) { if (__activos[id] === "t") { delete __activos[id]; __pendientes--; __quizaTerminar(); } __clearTimeout(id); };
    var setInterval = function (fn, ms) {
      var args = Array.prototype.slice.call(arguments, 2);
      __pendientes++;
      var id = __setInterval(function () { try { fn.apply(null, args); } catch (e) { __errorEjecucion(e); } }, ms);
      __activos[id] = "i";
      return id;
    };
    var clearInterval = function (id) { if (__activos[id] === "i") { delete __activos[id]; __pendientes--; __quizaTerminar(); } __clearInterval(id); };
    self.setTimeout = setTimeout; self.clearTimeout = clearTimeout;
    self.setInterval = setInterval; self.clearInterval = clearInterval;
    // Sin DOM ni red en el taller de consola: prompt/alert se simulan.
    var alert = function (m) { __imprimir("log", ["[alert] " + (m === undefined ? "" : m)]); };
    var prompt = function (m) { __imprimir("aviso", ["prompt() no está disponible aquí; se usará una respuesta vacía."]); return ""; };

    var __principalTerminado = false;
    var __terminado = false;
    function __errorEjecucion(e) {
      var linea = null;
      var pila = e && e.stack ? String(e.stack) : "";
      var m = pila.match(/(?:blob:|<anonymous>|evalmachine\.<anonymous>|codigo-usuario)[^\n]*?:(\d+):(\d+)/);
      if (m) linea = parseInt(m[1], 10) - __DESFASE__;
      __enviar("excepcion", { nombre: e && e.name ? e.name : "Error", mensaje: e && e.message !== undefined ? String(e.message) : String(e), linea: linea > 0 ? linea : null });
    }
    function __quizaTerminar() {
      if (__terminado || !__principalTerminado || __pendientes > 0) return;
      __terminado = true;
      __verificar();
    }
    return { formato: __formato };
  }

  function construirFuente(codigo, verificacion) {
    var cuerpo = preludio.toString();
    cuerpo = cuerpo.slice(cuerpo.indexOf("{") + 1, cuerpo.lastIndexOf("return {"));
    var lineasPreludio = cuerpo.split("\n").length;
    var verif = verificacion && verificacion.trim()
      ? "function __verificar(){ var __r; try { __r = (function(salida, codigo, errores){\n" + verificacion + "\n})(__lineas.slice(), " + JSON.stringify(codigo) + ", __errores.slice()); } catch (e) { __r = 'La verificación falló: ' + (e && e.message); } __enviar('veredicto', __r === undefined ? true : __r); __enviar('fin'); }"
      : "function __verificar(){ __enviar('fin'); }";
    var cabecera = "(function(){\n" + cuerpo + "\n" + verif + "\n(async function(){\n";
    var desfase = cabecera.split("\n").length - 1;
    cabecera = cabecera.replace("__DESFASE__", String(desfase));
    var fuente = cabecera + codigo + "\n})().then(function(){ __principalTerminado = true; __quizaTerminar(); }, function(e){ __errorEjecucion(e); __principalTerminado = true; __quizaTerminar(); });\n})();\n";
    return { fuente: fuente, desfase: desfase, lineasPreludio: lineasPreludio };
  }

  // Explicaciones en español para los errores más comunes de principiantes.
  function explicarError(nombre, mensaje) {
    var m = String(mensaje || "");
    var r;
    if ((r = m.match(/^(.+?) is not defined$/))) return "No existe nada llamado «" + r[1] + "». Revisa que esté bien escrito (mayúsculas incluidas) y que lo hayas declarado antes de usarlo.";
    if ((r = m.match(/^Cannot access '(.+?)' before initialization$/))) return "Usaste «" + r[1] + "» antes de la línea donde se crea con let/const. Mueve la declaración más arriba.";
    if (/Assignment to constant variable/.test(m)) return "Intentaste cambiar el valor de una constante (const). Si necesitas cambiarla, declárala con let.";
    if ((r = m.match(/^(.+?) is not a function$/))) return "Intentaste llamar como función a «" + r[1] + "», pero no es una función. ¿Está bien escrito el nombre? ¿Faltan o sobran paréntesis?";
    if ((r = m.match(/Cannot read properties of (undefined|null) \(reading '(.+?)'\)/))) return "Intentaste leer «." + r[2] + "» de algo que vale " + r[1] + ". El valor que esperabas todavía no existe: revisa de dónde viene.";
    if ((r = m.match(/Cannot set properties of (undefined|null)/))) return "Intentaste guardar una propiedad dentro de algo que vale " + r[1] + ".";
    if (/Maximum call stack size exceeded/.test(m)) return "Una función se llamó a sí misma sin parar (recursión sin caso base). Revisa la condición que detiene la recursión.";
    if (/Unexpected end of input/.test(m)) return "El programa terminó antes de tiempo: probablemente falta cerrar una llave }, un paréntesis ) o unas comillas.";
    if (/Invalid or unexpected token/.test(m)) return "Hay un carácter que JavaScript no entiende. Suele ser una comilla sin cerrar o comillas «tipográficas» copiadas de otro sitio.";
    if (/missing \) after argument list/.test(m)) return "Falta cerrar un paréntesis ) o hay una coma o comilla de más dentro de los argumentos.";
    if ((r = m.match(/Unexpected token '?(.+?)'?$/))) return "Hay algo inesperado cerca de «" + r[1] + "». Revisa la sintaxis de esa línea: llaves, paréntesis, comas y puntos y coma.";
    if (/Unexpected identifier/.test(m)) return "Hay una palabra en un lugar donde JavaScript no la esperaba. ¿Falta un operador, una coma o unas comillas?";
    if (/Identifier '(.+?)' has already been declared/.test(m)) return "Declaraste dos veces la misma variable con let/const. Usa otro nombre o quita la segunda declaración.";
    if (/Invalid array length/.test(m)) return "Intentaste crear un arreglo con un tamaño imposible (negativo o demasiado grande).";
    if (/is not iterable/.test(m)) return "Intentaste recorrer con for...of (o desestructurar) algo que no es una colección.";
    if (/await is only valid/.test(m)) return "Solo puedes usar await dentro de una función async.";
    if (nombre === "SyntaxError") return "Error de sintaxis: el código no está bien escrito y no se pudo ejecutar. Revisa la línea indicada.";
    return "";
  }

  // Tabla de texto para resultados de SQL (mismo formato en el navegador y en las pruebas).
  function tablaTexto(columnas, filas) {
    var celda = function (v) { return v === null || v === undefined ? "NULL" : String(v); };
    var anchos = columnas.map(function (c, i) {
      return Math.max(String(c).length, filas.reduce(function (m, f) { return Math.max(m, celda(f[i]).length); }, 0));
    });
    var fila = function (valores) { return valores.map(function (v, i) { var t = celda(v); return t + Array(anchos[i] - t.length + 1).join(" "); }).join(" | ").replace(/\s+$/, ""); };
    var lineas = [fila(columnas), anchos.map(function (a) { return Array(a + 1).join("-"); }).join("-+-")];
    filas.forEach(function (f) { lineas.push(fila(f)); });
    lineas.push("(" + filas.length + (filas.length === 1 ? " fila)" : " filas)"));
    return lineas;
  }

  var api = { construirFuente: construirFuente, explicarError: explicarError, preludio: preludio, tablaTexto: tablaTexto };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else raiz.TerminalMotor = api;
})(typeof self !== "undefined" ? self : this);
