/**
 * mavr | iu
 * Control de la interfaz mediante programación orientada a objetos.
 *
 * JavaScript no admite "|" dentro de un identificador, así que el
 * namespace técnico equivalente es `mavr.iu`.
 *
 * Índice de clases
 *   DOM, Utilidades .......... ayudas generales
 *   OrigenDatos .............. carga de JSON con fetch()
 *   Plantillas ............... carga de componentes externos (templates/*.html)
 *   EstadoIU ................. datos que comparte toda la aplicación
 *   FichaIU .................. círculo de color con la inicial
 *   BarraEstado .............. pie de página con el estado y el último evento
 *   ToastIU, ModalIU, DrawerIU  componentes flotantes
 *   FormularioIU ............. formulario generado desde JSON
 *   TablaIU .................. tabla generada desde JSON
 *   GestorColumnas ........... minimizar y redimensionar columnas
 *   MarkdownIU, VozIU, AsistenteIU  UD2 · interfaces naturales (IA + voz)
 *   AplicacionIU ............. orquesta todo lo anterior y pinta las vistas
 */
window.mavr = window.mavr || {};
window.mavr.iu = window.mavr.iu || {};

(() => {
  "use strict";

  /* =========================================================
     Ayudas generales
     ========================================================= */
  class DOM {
    static uno(selector, contexto = document) {
      return contexto.querySelector(selector);
    }

    static todos(selector, contexto = document) {
      return [...contexto.querySelectorAll(selector)];
    }
  }

  class Utilidades {
    static hashTexto(texto) {
      let hash = 0;
      for (const caracter of texto) {
        hash = caracter.charCodeAt(0) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    }

    /** Color suave y estable para cada texto (misma palabra = mismo color). */
    static colorTexto(texto) {
      const h = Utilidades.hashTexto(texto);
      return `hsl(${16 + (h % 20)},${55 + (h % 15)}%,${52 + (h % 10)}%)`;
    }

    /** Evita que un texto se interprete como HTML. */
    static escapar(texto) {
      return String(texto ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      }[c]));
    }

    /** "Configuración" -> "configuracion" (para usarlo en la URL). */
    static slug(texto) {
      return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "-");
    }

    static hora() {
      return new Date().toLocaleTimeString("es-ES");
    }
  }

  /* =========================================================
     Orígenes de datos (subunidad 006)
     ========================================================= */
  class OrigenDatos {
    static cache = new Map();

    static async cargarJSON(url) {
      if (!OrigenDatos.cache.has(url)) {
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
          throw new Error(`No se pudo cargar ${url}`);
        }
        OrigenDatos.cache.set(url, await respuesta.json());
      }
      return OrigenDatos.cache.get(url);
    }
  }

  /* =========================================================
     Componentes externos (subunidad 005)
     Cada archivo de templates/ se convierte en un <template>.
     ========================================================= */
  class Plantillas {
    static async cargar(nombres) {
      await Promise.all(nombres.map(async (nombre) => {
        const respuesta = await fetch(`templates/${nombre}.html`);
        if (!respuesta.ok) {
          throw new Error(`No se pudo cargar templates/${nombre}.html`);
        }
        const plantilla = document.createElement("template");
        plantilla.id = `tpl-${nombre}`;
        plantilla.innerHTML = (await respuesta.text()).trim();
        document.body.appendChild(plantilla);
      }));
    }

    /** Devuelve una copia del primer elemento de la plantilla. */
    static clonar(nombre) {
      return DOM.uno(`#tpl-${nombre}`).content.firstElementChild.cloneNode(true);
    }
  }

  /* =========================================================
     Estado compartido
     ========================================================= */
  class EstadoIU {
    constructor() {
      this.menu = [];
      this.entidades = [];
      this.identidad = null;
      this.modulo = null;      // elemento de menu.json activo
      this.vista = "listado";  // vista activa de entidades.json
      this.tabla = null;       // datos de la tabla del módulo
      this.formulario = null;  // campos del formulario del módulo
      this.filtro = "";
    }
  }

  class FichaIU {
    static completar(elemento, texto) {
      const ficha = DOM.uno(".ficha", elemento);
      ficha.textContent = texto.charAt(0).toUpperCase();
      ficha.style.background = Utilidades.colorTexto(texto);
      DOM.uno(".etiqueta", elemento).textContent = texto;
      elemento.title = texto;
    }
  }

  /* =========================================================
     Barra de estado (footer)
     ========================================================= */
  class BarraEstado {
    constructor() {
      this.modulo = DOM.uno("#estadoModulo");
      this.vista = DOM.uno("#estadoVista");
      this.registros = DOM.uno("#estadoRegistros");
      this.evento = DOM.uno("#estadoEvento");
      this.conexion = DOM.uno("#estadoConexion");

      // Eventos de conexión de la ventana
      window.addEventListener("online", () => this.actualizarConexion());
      window.addEventListener("offline", () => this.actualizarConexion());
      this.actualizarConexion();
    }

    actualizar({ modulo, vista, registros }) {
      if (modulo !== undefined) this.modulo.textContent = `Módulo: ${modulo}`;
      if (vista !== undefined) this.vista.textContent = `Vista: ${vista}`;
      if (registros !== undefined) this.registros.textContent = registros === null ? "" : `${registros} registros`;
    }

    anotar(texto) {
      this.evento.textContent = `${Utilidades.hora()} · ${texto}`;
    }

    actualizarConexion() {
      const enLinea = navigator.onLine;
      this.conexion.textContent = enLinea ? "● En línea" : "● Sin conexión";
      this.conexion.classList.toggle("offline", !enLinea);
    }
  }

  /* =========================================================
     Componentes flotantes
     ========================================================= */
  class ToastIU {
    constructor() {
      this.pila = DOM.uno("#mvToasts");
      this.iconos = { exito: "✓", info: "i", aviso: "!", error: "×" };
    }

    mostrar(tipo = "info", titulo = "Información", texto = "") {
      const toast = Plantillas.clonar("toast");
      toast.classList.add(tipo);
      DOM.uno(".mv-toast-icono", toast).textContent = this.iconos[tipo] || "i";
      DOM.uno(".mv-toast-titulo", toast).textContent = titulo;
      DOM.uno(".mv-toast-texto", toast).textContent = texto;

      const cerrar = () => {
        toast.classList.add("leaving");
        setTimeout(() => toast.remove(), 240);
      };
      DOM.uno(".mv-toast-cerrar", toast).addEventListener("click", cerrar);
      this.pila.appendChild(toast);
      setTimeout(cerrar, 5000);
    }
  }

  class ModalIU {
    constructor() {
      this.capa = DOM.uno("#mvModal");
      this.titulo = DOM.uno("#mvModalTitulo");
      this.cuerpo = DOM.uno("#mvModalCuerpo");
      DOM.todos("[data-modal-cerrar]", this.capa).forEach((nodo) =>
        nodo.addEventListener("click", () => this.cerrar())
      );
    }

    get abierto() {
      return this.capa.getAttribute("aria-hidden") === "false";
    }

    abrir(titulo, html) {
      this.titulo.textContent = titulo;
      this.cuerpo.innerHTML = html;
      this.capa.setAttribute("aria-hidden", "false");
      DOM.uno(".mv-modal-cerrar", this.capa).focus();
    }

    /** Ventana de confirmación: ejecuta alAceptar solo si se pulsa Aceptar. */
    confirmar(titulo, mensaje, alAceptar) {
      this.abrir(titulo, `
        <p>${Utilidades.escapar(mensaje)}</p>
        <div class="mv-botones">
          <button class="mv-btn" type="button" id="mvConfirmarSi">Aceptar</button>
          <button class="mv-btn secundario" type="button" id="mvConfirmarNo">Cancelar</button>
        </div>`);
      DOM.uno("#mvConfirmarSi").addEventListener("click", () => { this.cerrar(); alAceptar(); });
      DOM.uno("#mvConfirmarNo").addEventListener("click", () => this.cerrar());
    }

    cerrar() {
      this.capa.setAttribute("aria-hidden", "true");
    }
  }

  class DrawerIU {
    constructor() {
      this.panel = DOM.uno("#mvDrawer");
      this.overlay = DOM.uno("#mvDrawerOverlay");
      this.cuerpo = DOM.uno("#mvDrawerCuerpo");
      this.modo = DOM.uno("#mvDrawerModo");
      this.titulo = DOM.uno("#mvDrawerTitulo");
      this.resizer = DOM.uno("#mvDrawerResizer");
      this.anchoMinimo = 300;

      DOM.uno("#mvDrawerCerrar").addEventListener("click", () => this.cerrar());
      this.overlay.addEventListener("click", () => this.cerrar());
      this.resizer.addEventListener("pointerdown", (e) => this.iniciarRedimension(e));
      window.addEventListener("resize", () => this.ajustarAlViewport());
    }

    get abierto() {
      return this.panel.getAttribute("aria-hidden") === "false";
    }

    /** El máximo es siempre el 50 % del ancho de la ventana. */
    anchoMaximo() {
      return Math.max(this.anchoMinimo, window.innerWidth * 0.5);
    }

    abrir({ modo = "CREAR", titulo = "Nuevo registro", contenido }) {
      this.modo.textContent = modo;
      this.titulo.textContent = titulo;
      this.cuerpo.replaceChildren(contenido);
      this.ajustarAlViewport();
      this.panel.setAttribute("aria-hidden", "false");
      this.overlay.setAttribute("aria-hidden", "false");
      setTimeout(() => DOM.uno("input,select,textarea", this.cuerpo)?.focus(), 320);
    }

    cerrar() {
      this.panel.setAttribute("aria-hidden", "true");
      this.overlay.setAttribute("aria-hidden", "true");
    }

    iniciarRedimension(evento) {
      evento.preventDefault();
      const inicio = evento.clientX;
      const anchoInicial = this.panel.getBoundingClientRect().width;
      this.resizer.setPointerCapture(evento.pointerId);
      this.panel.style.transition = "none";
      document.body.classList.add("redimensionando-drawer");

      const mover = (e) => {
        const ancho = Math.min(this.anchoMaximo(), Math.max(this.anchoMinimo, anchoInicial + inicio - e.clientX));
        this.panel.style.setProperty("--ancho-drawer", `${ancho}px`);
        this.actualizarColumnas(ancho);
      };
      const terminar = () => {
        this.resizer.removeEventListener("pointermove", mover);
        this.panel.style.transition = "";
        document.body.classList.remove("redimensionando-drawer");
      };
      this.resizer.addEventListener("pointermove", mover);
      this.resizer.addEventListener("pointerup", terminar, { once: true });
      this.resizer.addEventListener("pointercancel", terminar, { once: true });
    }

    /** Hasta el 25 % de la ventana: una columna. Más ancho: dos columnas. */
    actualizarColumnas(ancho = this.panel.getBoundingClientRect().width) {
      this.panel.classList.toggle("dos-columnas", ancho > window.innerWidth * 0.25);
    }

    ajustarAlViewport() {
      const actual = this.panel.getBoundingClientRect().width;
      const maximo = this.anchoMaximo();
      if (actual > maximo) {
        this.panel.style.setProperty("--ancho-drawer", `${maximo}px`);
      }
      this.actualizarColumnas(Math.min(actual, maximo));
    }
  }

  /* =========================================================
     Formulario generado desde JSON (subunidades 005 y 006)
     ========================================================= */
  class FormularioIU {
    /**
     * @param campos  array de {nombre, etiqueta, tipo, opciones?}
     * @param valores registro con los valores iniciales (modo edición)
     * @param textoBoton texto del botón de envío
     */
    static construir(campos, valores = {}, textoBoton = "Guardar") {
      const formulario = document.createElement("form");
      formulario.className = "mv-form";

      campos.forEach((campo) => formulario.appendChild(FormularioIU.campo(campo, valores[campo.nombre])));

      const botones = document.createElement("div");
      botones.className = "mv-botones mv-form-completo";
      botones.innerHTML = `
        <button class="mv-btn" type="submit">${Utilidades.escapar(textoBoton)}</button>
        <button class="mv-btn secundario" type="reset">Limpiar</button>`;
      formulario.appendChild(botones);
      return formulario;
    }

    static campo(campo, valor) {
      const etiqueta = document.createElement("label");
      const texto = document.createElement("span");
      texto.textContent = campo.etiqueta;
      let control;

      if (campo.tipo === "textarea") {
        control = document.createElement("textarea");
        etiqueta.classList.add("mv-form-completo");
      } else if (campo.tipo === "select") {
        control = document.createElement("select");
        (campo.opciones || []).forEach((opcion) => control.add(new Option(opcion, opcion)));
      } else if (campo.tipo === "datalist") {
        // input + datalist: escribe libremente o elige una sugerencia
        control = document.createElement("input");
        const lista = document.createElement("datalist");
        lista.id = `lista-${campo.nombre}`;
        (campo.opciones || []).forEach((opcion) => lista.appendChild(new Option(opcion)));
        control.setAttribute("list", lista.id);
        etiqueta.appendChild(lista);
      } else {
        control = document.createElement("input");
        control.type = campo.tipo || "text";
      }

      control.name = campo.nombre;
      if (campo.requerido) control.required = true;
      if (campo.nombre === "id") control.min = 1;

      if (campo.tipo === "checkbox") {
        etiqueta.classList.add("mv-check", "mv-form-completo");
        control.checked = Boolean(valor);
        etiqueta.append(control, texto);
      } else {
        if (valor !== undefined && valor !== null) control.value = valor;
        etiqueta.append(texto, control);
      }
      return etiqueta;
    }

    /** Convierte el formulario en un objeto respetando los tipos del JSON. */
    static leer(formulario, campos) {
      const datos = new FormData(formulario);
      const registro = {};
      campos.forEach((campo) => {
        if (campo.tipo === "checkbox") {
          registro[campo.nombre] = datos.has(campo.nombre);
        } else if (campo.tipo === "number") {
          const valor = datos.get(campo.nombre);
          registro[campo.nombre] = valor === "" ? "" : Number(valor);
        } else {
          registro[campo.nombre] = datos.get(campo.nombre) ?? "";
        }
      });
      return registro;
    }
  }

  /* =========================================================
     Tabla generada desde JSON (subunidad 006)
     Acepta los dos formatos del material:
       { titulo, columnas:[{campo,etiqueta}], registros:[] }
       { campos:[{nombre,etiqueta,tipo}], datos:[] }
     ========================================================= */
  class TablaIU {
    static normalizar(datos, tituloPorDefecto) {
      const columnas = datos.columnas
        ? datos.columnas.map((c) => ({ campo: c.campo, etiqueta: c.etiqueta, tipo: c.tipo }))
        : datos.campos
            .filter((c) => c.tipo !== "textarea")
            .map((c) => ({ campo: c.nombre, etiqueta: c.etiqueta, tipo: c.tipo }));
      return {
        titulo: datos.titulo || `Listado de ${tituloPorDefecto.toLowerCase()}`,
        columnas,
        registros: datos.registros || datos.datos || []
      };
    }

    constructor(datos, { alEditar, alAnotar }) {
      this.datos = datos;
      this.alEditar = alEditar;
      this.alAnotar = alAnotar;
      this.orden = { campo: null, asc: true };
    }

    filtrar(filtro) {
      const texto = filtro.toLowerCase();
      const filtrados = this.datos.registros.filter((r) =>
        Object.values(r).join(" ").toLowerCase().includes(texto)
      );
      if (this.orden.campo) {
        const { campo, asc } = this.orden;
        filtrados.sort((a, b) => {
          const x = a[campo] ?? "", y = b[campo] ?? "";
          const resultado = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "es");
          return asc ? resultado : -resultado;
        });
      }
      return filtrados;
    }

    renderizar(filtro = "") {
      const registros = this.filtrar(filtro);
      const { titulo, columnas } = this.datos;
      const tabla = document.createElement("table");

      tabla.innerHTML = `
        <caption>${Utilidades.escapar(titulo)}</caption>
        <thead><tr></tr></thead>
        <tbody></tbody>
        <tfoot><tr>
          <th colspan="${Math.max(1, columnas.length - 1)}">Total</th>
          <td>${registros.length}</td>
        </tr></tfoot>`;

      // Cabecera: clic para ordenar
      const filaCabecera = DOM.uno("thead tr", tabla);
      columnas.forEach((columna) => {
        const th = document.createElement("th");
        th.textContent = columna.etiqueta;
        th.title = "Clic para ordenar";
        if (this.orden.campo === columna.campo) {
          th.setAttribute("aria-sort", this.orden.asc ? "ascending" : "descending");
        }
        th.addEventListener("click", () => {
          this.orden.asc = this.orden.campo === columna.campo ? !this.orden.asc : true;
          this.orden.campo = columna.campo;
          this.alAnotar(`click en cabecera · ordenar por ${columna.etiqueta}`);
          tabla.replaceWith(this.renderizar(filtro));
        });
        filaCabecera.appendChild(th);
      });

      // Cuerpo: una fila por registro, clonada del template fila.html
      const cuerpo = DOM.uno("tbody", tabla);
      registros.forEach((registro) => {
        const fila = Plantillas.clonar("fila");
        columnas.forEach((columna) => {
          const celda = document.createElement("td");
          const valor = registro[columna.campo];
          if (columna.tipo === "checkbox" || typeof valor === "boolean") {
            const marca = document.createElement("input");
            marca.type = "checkbox";
            marca.disabled = true;
            marca.checked = Boolean(valor);
            celda.appendChild(marca);
          } else {
            celda.textContent = valor ?? "";
          }
          fila.appendChild(celda);
        });

        fila.addEventListener("click", () => {
          DOM.todos("tr.seleccionada", cuerpo).forEach((f) => f.classList.remove("seleccionada"));
          fila.classList.add("seleccionada");
          this.alAnotar(`click en fila ${registro.id ?? ""}`);
        });
        fila.addEventListener("dblclick", () => this.alEditar(registro));
        fila.addEventListener("keydown", (e) => {
          if (e.key === "Enter") this.alEditar(registro);
        });
        cuerpo.appendChild(fila);
      });

      return tabla;
    }
  }

  /* =========================================================
     Columnas minimizables y redimensionables (subunidad 007)
     ========================================================= */
  class GestorColumnas {
    constructor(alAnotar) {
      this.alAnotar = alAnotar;
      this.anchoMinimo = 100;
      this.anchoMaximo = 600;
    }

    activar() {
      DOM.todos(".minimizar").forEach((boton) => {
        const columna = boton.closest("nav,section");
        boton.addEventListener("click", () => this.alternar(columna, boton));
      });
      DOM.todos(".separador").forEach((separador) => {
        separador.addEventListener("pointerdown", (e) => this.iniciarRedimension(separador, e));
        separador.addEventListener("dblclick", () => this.restaurar(separador.previousElementSibling));
      });
    }

    alternar(columna, boton) {
      if (columna.classList.contains("compacto")) {
        // Restauramos el ancho que tenía antes de contraerse
        const ancho = parseFloat(columna.dataset.ancho) || 220;
        columna.classList.remove("compacto");
        columna.style.width = columna.style.flexBasis = `${ancho}px`;
        boton.textContent = "◀";
        boton.title = "Minimizar";
      } else {
        columna.dataset.ancho = columna.getBoundingClientRect().width;
        columna.classList.add("compacto");
        boton.textContent = "▶";
        boton.title = "Restaurar";
      }
      this.alAnotar(`click en minimizar · ${columna.getAttribute("aria-label")}`);
    }

    restaurar(columna) {
      if (!columna || columna.classList.contains("compacto")) return;
      columna.style.width = columna.style.flexBasis = "";
      this.alAnotar(`dblclick en separador · ancho original`);
    }

    iniciarRedimension(separador, evento) {
      const columna = separador.previousElementSibling;
      if (!columna || columna.classList.contains("compacto")) return;
      evento.preventDefault();

      const inicio = evento.clientX;
      const anchoInicial = columna.getBoundingClientRect().width;
      columna.style.transition = "none";
      separador.classList.add("activo");
      document.body.classList.add("redimensionando");
      separador.setPointerCapture(evento.pointerId);

      const mover = (e) => {
        const ancho = Math.min(this.anchoMaximo, Math.max(this.anchoMinimo, anchoInicial + e.clientX - inicio));
        columna.style.width = columna.style.flexBasis = `${ancho}px`;
        columna.dataset.ancho = ancho;
      };
      const terminar = () => {
        separador.removeEventListener("pointermove", mover);
        columna.style.transition = "";
        separador.classList.remove("activo");
        document.body.classList.remove("redimensionando");
        this.alAnotar(`pointerup en separador · ${Math.round(columna.getBoundingClientRect().width)} px`);
      };
      separador.addEventListener("pointermove", mover);
      separador.addEventListener("pointerup", terminar, { once: true });
      separador.addEventListener("pointercancel", terminar, { once: true });
    }
  }

  /* =========================================================
     UD2 · Interfaces naturales
     Asistente flotante: lenguaje natural (Ollama local),
     voz a texto (SpeechRecognition) y texto a voz (SpeechSynthesis)
     ========================================================= */

  /**
   * Convierte el Markdown que devuelve el modelo en HTML seguro.
   * Soporta títulos, párrafos, listas, citas, código y tablas.
   * Todo el texto se escapa antes de insertarlo.
   */
  class MarkdownIU {
    static inline(texto) {
      return Utilidades.escapar(texto)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>");
    }

    /** Los modelos a veces usan barras y guiones Unicode o espacios invisibles. */
    static normalizar(texto) {
      return String(texto || "")
        .replace(/\r/g, "")
        .replace(/[｜¦│]/g, "|")
        .replace(/[‐‑‒–—−]/g, "-")
        .replace(/ /g, " ")
        .replace(/[​-‍﻿]/g, "");
    }

    static celdas(linea) {
      return linea.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
    }

    static esFila(linea) {
      return linea.includes("|") && MarkdownIU.celdas(linea).length >= 2;
    }

    static esSeparador(linea) {
      return MarkdownIU.esFila(linea) && MarkdownIU.celdas(linea).every((c) => /^:?-{2,}:?$/.test(c.replace(/\s+/g, "")));
    }

    static convertir(markdown) {
      let md = MarkdownIU.normalizar(markdown).trim();

      // 1. Si el modelo envuelve todo en ```markdown … ```, lo desenvolvemos
      md = md.replace(/```(?:markdown|md)\s*\n([\s\S]*?)```/gi, (_, cuerpo) => cuerpo.trim());

      // 2. Una tabla metida por error en un bloque ``` sin lenguaje sale del bloque
      md = md.replace(/```(text|txt)?\s*\n([\s\S]*?)```/gi, (todo, _lang, cuerpo) => {
        const lineas = cuerpo.split("\n").filter((l) => l.trim());
        return lineas.length >= 2 && MarkdownIU.esFila(lineas[0]) && MarkdownIU.esSeparador(lineas[1]) ? cuerpo : todo;
      });

      // 3. Apartamos los bloques de código reales para no tocarlos
      const bloques = [];
      md = md.replace(/```[^\n]*\n([\s\S]*?)```/g, (_, cuerpo) => `@@CODIGO${bloques.push(cuerpo) - 1}@@`);

      const lineas = md.split("\n");
      const html = [];
      let i = 0;

      while (i < lineas.length) {
        const linea = lineas[i];
        let m;

        if (MarkdownIU.esFila(linea) && MarkdownIU.esSeparador(lineas[i + 1] || "")) {
          const cabecera = MarkdownIU.celdas(linea);
          const filas = [];
          i += 2;
          while (i < lineas.length && lineas[i].trim() && MarkdownIU.esFila(lineas[i])) {
            filas.push(MarkdownIU.celdas(lineas[i++]));
          }
          html.push(`<div class="mv-ia-tabla"><table>
            <thead><tr>${cabecera.map((c) => `<th>${MarkdownIU.inline(c)}</th>`).join("")}</tr></thead>
            <tbody>${filas.map((f) => `<tr>${cabecera.map((_, j) => `<td>${MarkdownIU.inline(f[j] || "")}</td>`).join("")}</tr>`).join("")}</tbody>
          </table></div>`);
          continue;
        }

        if (/^\s*[-*]\s+/.test(linea) || /^\s*\d+\.\s+/.test(linea)) {
          const ordenada = /^\s*\d+\.\s+/.test(linea);
          const patron = ordenada ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/;
          const elementos = [];
          while (i < lineas.length && patron.test(lineas[i])) {
            elementos.push(`<li>${MarkdownIU.inline(lineas[i++].replace(patron, ""))}</li>`);
          }
          html.push(ordenada ? `<ol>${elementos.join("")}</ol>` : `<ul>${elementos.join("")}</ul>`);
          continue;
        }

        if ((m = linea.match(/^(#{1,3})\s+(.+)/))) {
          const nivel = m[1].length + 1; // # -> h2, ## -> h3, ### -> h4
          html.push(`<h${nivel}>${MarkdownIU.inline(m[2])}</h${nivel}>`);
        } else if ((m = linea.match(/^>\s?(.*)/))) {
          html.push(`<blockquote>${MarkdownIU.inline(m[1])}</blockquote>`);
        } else if ((m = linea.trim().match(/^@@CODIGO(\d+)@@$/))) {
          html.push(`<pre><code>${Utilidades.escapar(bloques[m[1]])}</code></pre>`);
        } else if (linea.trim()) {
          html.push(`<p>${MarkdownIU.inline(linea)}</p>`);
        }
        i++;
      }
      return html.join("\n");
    }

    /** Texto limpio para leerlo en voz alta (sin símbolos de Markdown ni código). */
    static aTextoPlano(markdown) {
      return String(markdown || "")
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/\|/g, " ")
        .replace(/[#*_>`~-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  /**
   * Web Speech API: reconocimiento (voz -> texto) y síntesis (texto -> voz).
   */
  class VozIU {
    constructor(idioma = "es-ES") {
      this.idioma = idioma;
      this.Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.reconocimiento = null;
      this.escuchando = false;
    }

    get puedeEscuchar() {
      return Boolean(this.Reconocimiento);
    }

    get puedeHablar() {
      return "speechSynthesis" in window;
    }

    /** Escucha una frase y llama a alResultado con el texto reconocido. */
    escuchar({ alEmpezar, alResultado, alError, alTerminar }) {
      if (this.escuchando) {
        this.reconocimiento.stop();
        return;
      }
      this.reconocimiento = new this.Reconocimiento();
      this.reconocimiento.lang = this.idioma;
      this.reconocimiento.interimResults = false;
      this.reconocimiento.continuous = false;

      this.reconocimiento.addEventListener("start", () => { this.escuchando = true; alEmpezar?.(); });
      this.reconocimiento.addEventListener("result", (e) => alResultado(e.results[0][0].transcript));
      this.reconocimiento.addEventListener("error", (e) => alError?.(e.error));
      this.reconocimiento.addEventListener("end", () => { this.escuchando = false; alTerminar?.(); });
      this.reconocimiento.start();
    }

    /** Lee un texto en voz alta con una voz en español si el sistema la tiene. */
    hablar(texto) {
      if (!this.puedeHablar || !texto) return;
      speechSynthesis.cancel();
      const mensaje = new SpeechSynthesisUtterance(texto);
      mensaje.lang = this.idioma;
      const voz = speechSynthesis.getVoices().find((v) => v.lang === this.idioma);
      if (voz) mensaje.voice = voz;
      speechSynthesis.speak(mensaje);
    }

    callar() {
      if (this.puedeHablar) speechSynthesis.cancel();
    }
  }

  /**
   * Ventana flotante del asistente: se arrastra, se minimiza y se redimensiona.
   * Envía el prompt a ollama.php y pinta la respuesta en el escenario.
   */
  class AsistenteIU {
    constructor(aplicacion) {
      this.app = aplicacion;
      this.voz = new VozIU("es-ES");
      this.enviando = false;

      this.ventana = DOM.uno("#mvAsistente");
      this.asa = DOM.uno("#mvAsistenteBarra");
      this.entrada = DOM.uno("#mvAsistenteEntrada");
      this.microfono = DOM.uno("#mvAsistenteMicro");
      this.enviar = DOM.uno("#mvAsistenteEnviar");
      this.hablarRespuesta = DOM.uno("#mvAsistenteHablar");
      this.estado = DOM.uno("#mvAsistenteEstado");
      this.minimizar = DOM.uno("#mvAsistenteMinimizar");
      this.redimensionador = DOM.uno("#mvAsistenteRedimensionar");

      this.activarEventos();
      this.ajustarAltura();
    }

    activarEventos() {
      // Escribir: Intro envía, Mayús + Intro hace salto de línea
      this.entrada.addEventListener("input", () => this.ajustarAltura());
      this.entrada.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.preguntar();
        }
      });
      this.enviar.addEventListener("click", () => this.preguntar());

      // Voz
      if (this.voz.puedeEscuchar) {
        this.microfono.addEventListener("click", () => this.dictar());
      } else {
        this.microfono.disabled = true;
        this.microfono.title = "Reconocimiento de voz no disponible en este navegador (usa Chrome o Edge)";
      }
      if (!this.voz.puedeHablar) {
        this.hablarRespuesta.disabled = true;
      }
      this.hablarRespuesta.addEventListener("change", () => {
        if (!this.hablarRespuesta.checked) this.voz.callar();
        this.app.anotar(`change · hablar respuesta ${this.hablarRespuesta.checked ? "activado" : "desactivado"}`);
      });

      // Ventana
      this.asa.addEventListener("pointerdown", (e) => this.iniciarArrastre(e));
      this.minimizar.addEventListener("click", () => this.alternarMinimizado());
      this.redimensionador.addEventListener("pointerdown", (e) => this.iniciarRedimension(e));
      window.addEventListener("resize", () => this.mantenerDentro());
    }

    /* ---------- Lenguaje natural ---------- */
    async preguntar() {
      const texto = this.entrada.value.trim();
      if (!texto || this.enviando) return;

      this.ocupado(true, "El modelo está generando la respuesta…");
      this.app.anotar("submit · prompt al asistente");
      try {
        const respuesta = await fetch("ollama.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mensaje: texto })
        });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const datos = await respuesta.json();
        const contenido = datos.respuesta ?? "No he podido responder.";

        this.mostrarRespuesta(texto, contenido);
        if (this.hablarRespuesta.checked) {
          this.voz.hablar(MarkdownIU.aTextoPlano(contenido));
        }
        this.entrada.value = "";
        this.ajustarAltura();
        this.avisar("Escenario actualizado.", 2200);
      } catch (error) {
        console.error(error);
        this.avisar("No se ha podido conectar con Ollama.");
        this.app.toast.mostrar("error", "Asistente no disponible",
          "Comprueba que Ollama está en marcha y que sirves el proyecto con PHP (php -S localhost:8000).");
      } finally {
        this.ocupado(false);
        this.entrada.focus();
      }
    }

    mostrarRespuesta(pregunta, contenido) {
      const tarjeta = this.app.tarjeta(`
        <p class="mv-ia-pregunta"><span>Tú</span>${Utilidades.escapar(pregunta)}</p>
        <div class="mv-ia-resultado">${MarkdownIU.convertir(contenido)}</div>`);
      this.app.pintar(tarjeta);
      this.app.barra.actualizar({ vista: "Asistente", registros: null });
      DOM.todos("#entidades article").forEach((a) => a.classList.remove("activo"));
    }

    /* ---------- Voz a texto ---------- */
    dictar() {
      this.voz.escuchar({
        alEmpezar: () => {
          this.microfono.classList.add("escuchando");
          this.avisar("Escuchando…");
          this.app.anotar("start · reconocimiento de voz");
        },
        alResultado: (texto) => {
          this.entrada.value = this.entrada.value.trim() ? `${this.entrada.value.trim()} ${texto}` : texto;
          this.ajustarAltura();
          this.entrada.focus();
          this.app.anotar(`result · «${texto}»`);
        },
        alError: (error) => {
          this.avisar(error === "not-allowed" ? "Permiso de micrófono denegado." : "No se ha podido reconocer la voz.");
        },
        alTerminar: () => {
          this.microfono.classList.remove("escuchando");
          if (this.estado.textContent === "Escuchando…") this.avisar("");
        }
      });
    }

    /* ---------- Estado de la ventana ---------- */
    ocupado(valor, mensaje = "") {
      this.enviando = valor;
      this.enviar.disabled = valor;
      this.microfono.disabled = valor || !this.voz.puedeEscuchar;
      this.ventana.classList.toggle("ocupado", valor);
      if (mensaje) this.avisar(mensaje);
    }

    avisar(texto, borrarEn = 0) {
      this.estado.textContent = texto;
      if (borrarEn) {
        setTimeout(() => { if (this.estado.textContent === texto) this.estado.textContent = ""; }, borrarEn);
      }
    }

    ajustarAltura() {
      this.entrada.style.height = "auto";
      this.entrada.style.height = `${Math.min(this.entrada.scrollHeight, 150)}px`;
    }

    /** Pasa de "centrado abajo" a coordenadas fijas para poder moverla. */
    fijarPosicion() {
      const r = this.ventana.getBoundingClientRect();
      Object.assign(this.ventana.style, { right: "auto", bottom: "auto", left: `${r.left}px`, top: `${r.top}px` });
    }

    limitar(left, top) {
      const r = this.ventana.getBoundingClientRect();
      const margen = 8;
      const arriba = DOM.uno("body > header").offsetHeight + margen;
      return {
        left: Math.max(margen, Math.min(left, window.innerWidth - r.width - margen)),
        top: Math.max(arriba, Math.min(top, window.innerHeight - r.height - margen))
      };
    }

    mantenerDentro() {
      if (!this.ventana.style.top) return;
      const r = this.ventana.getBoundingClientRect();
      const p = this.limitar(r.left, r.top);
      Object.assign(this.ventana.style, { left: `${p.left}px`, top: `${p.top}px` });
    }

    iniciarArrastre(e) {
      if (e.button !== 0 || e.target.closest("button")) return;
      this.fijarPosicion();
      const r = this.ventana.getBoundingClientRect();
      const dx = e.clientX - r.left;
      const dy = e.clientY - r.top;
      this.ventana.classList.add("arrastrando");
      this.asa.setPointerCapture(e.pointerId);

      const mover = (ev) => {
        const p = this.limitar(ev.clientX - dx, ev.clientY - dy);
        Object.assign(this.ventana.style, { left: `${p.left}px`, top: `${p.top}px` });
      };
      const soltar = () => {
        this.ventana.classList.remove("arrastrando");
        this.asa.removeEventListener("pointermove", mover);
      };
      this.asa.addEventListener("pointermove", mover);
      this.asa.addEventListener("pointerup", soltar, { once: true });
      this.asa.addEventListener("pointercancel", soltar, { once: true });
    }

    alternarMinimizado() {
      this.fijarPosicion();
      const minimizada = this.ventana.classList.toggle("minimizado");
      this.minimizar.textContent = minimizada ? "□" : "—";
      this.minimizar.title = minimizada ? "Restaurar" : "Minimizar";
      requestAnimationFrame(() => this.mantenerDentro());
      this.app.anotar(`click · asistente ${minimizada ? "minimizado" : "restaurado"}`);
    }

    iniciarRedimension(e) {
      e.preventDefault();
      e.stopPropagation();
      this.fijarPosicion();
      const r = this.ventana.getBoundingClientRect();
      const x0 = e.clientX, y0 = e.clientY;
      this.redimensionador.setPointerCapture(e.pointerId);

      const mover = (ev) => {
        this.ventana.style.width = `${Math.max(360, Math.min(r.width + ev.clientX - x0, window.innerWidth - r.left - 8))}px`;
        this.ventana.style.height = `${Math.max(110, Math.min(r.height + ev.clientY - y0, window.innerHeight - r.top - 8))}px`;
      };
      const soltar = () => this.redimensionador.removeEventListener("pointermove", mover);
      this.redimensionador.addEventListener("pointermove", mover);
      this.redimensionador.addEventListener("pointerup", soltar, { once: true });
      this.redimensionador.addEventListener("pointercancel", soltar, { once: true });
    }
  }

  /* =========================================================
     Aplicación
     ========================================================= */
  class AplicacionIU {
    constructor() {
      this.estado = new EstadoIU();
      this.escenario = DOM.uno("#escenario");
      this.buscador = DOM.uno("#buscador");
      this.anotar = (texto) => this.barra.anotar(texto);

      // Cada vista de entidades.json tiene su método
      this.vistas = {
        listado: () => this.vistaListado(),
        formulario: () => this.vistaFormulario(),
        controles: () => this.vistaControles(),
        eventos: () => this.vistaEventos(),
        toasts: () => this.vistaToasts(),
        modal: () => this.vistaModal(),
        login: () => this.vistaLogin(),
        identidad: () => this.vistaIdentidad()
      };
    }

    async iniciar() {
      try {
        await Plantillas.cargar(["nav", "tarjeta", "fila", "toast"]);
        [this.estado.menu, this.estado.entidades, this.estado.identidad] = await Promise.all([
          OrigenDatos.cargarJSON("data/menu.json"),
          OrigenDatos.cargarJSON("data/entidades.json"),
          OrigenDatos.cargarJSON("data/identidad.json")
        ]);
      } catch (error) {
        this.escenario.innerHTML = `
          <article class="mv-card">
            <h2>No se pudieron cargar los orígenes de datos</h2>
            <p>Sirve esta carpeta mediante HTTP, por ejemplo: <code>python -m http.server 8000</code></p>
            <pre>${Utilidades.escapar(error.message)}</pre>
          </article>`;
        return;
      }

      this.barra = new BarraEstado();
      this.toast = new ToastIU();
      this.modal = new ModalIU();
      this.drawer = new DrawerIU();
      this.columnas = new GestorColumnas(this.anotar);
      this.asistente = new AsistenteIU(this);

      this.renderMenu();
      this.renderEntidades();
      this.columnas.activar();
      this.activarEventosGlobales();

      // La URL guarda el módulo y la vista: #clientes/listado
      await this.aplicarHash();
    }

    /* ---------- Navegación por hash (eventos de historial) ---------- */
    irA(modulo = this.estado.modulo?.texto, vista = this.estado.vista) {
      const nuevo = `#${Utilidades.slug(modulo)}/${vista}`;
      if (location.hash === nuevo) {
        this.aplicarHash();
      } else {
        location.hash = nuevo; // dispara hashchange
      }
    }

    async aplicarHash() {
      const [moduloSlug, vista] = location.hash.slice(1).split("/");
      const modulo = this.estado.menu.find((m) => Utilidades.slug(m.texto) === moduloSlug)
        || this.estado.menu.find((m) => m.activo)
        || this.estado.menu[0];
      const vistaValida = this.vistas[vista] ? vista : (this.estado.entidades.find((e) => e.activo)?.vista || "listado");

      if (modulo !== this.estado.modulo) {
        await this.cambiarModulo(modulo);
      }
      this.estado.vista = vistaValida;
      this.marcarActivos();
      this.vistas[vistaValida]();
      const textoVista = this.estado.entidades.find((e) => e.vista === vistaValida)?.texto;
      this.barra.actualizar({ modulo: modulo.texto, vista: textoVista });
    }

    async cambiarModulo(modulo) {
      this.estado.modulo = modulo;
      this.estado.filtro = "";
      this.buscador.value = "";
      this.buscador.placeholder = `Buscar en ${modulo.texto}…`;
      this.estado.tabla = null;
      this.estado.formulario = null;

      try {
        if (modulo.tabla) {
          const datos = await OrigenDatos.cargarJSON(modulo.tabla);
          this.estado.tabla = TablaIU.normalizar(datos, modulo.texto);
        }
        if (modulo.formulario) {
          this.estado.formulario = (await OrigenDatos.cargarJSON(modulo.formulario)).campos;
        }
      } catch (error) {
        this.toast.mostrar("error", "Error al cargar datos", error.message);
      }
    }

    marcarActivos() {
      DOM.todos("#navegacion a").forEach((a) => a.classList.toggle("activo", a.dataset.texto === this.estado.modulo.texto));
      DOM.todos("#entidades article").forEach((a) => a.classList.toggle("activo", a.dataset.vista === this.estado.vista));
    }

    /* ---------- Columnas ---------- */
    renderMenu() {
      const contenedor = DOM.uno("#navegacion .contenido-columna");
      contenedor.innerHTML = "";
      this.estado.menu.forEach((elemento) => {
        const enlace = Plantillas.clonar("nav");
        FichaIU.completar(enlace, elemento.texto);
        enlace.href = `#${Utilidades.slug(elemento.texto)}/${this.estado.vista}`;
        enlace.dataset.texto = elemento.texto;
        enlace.addEventListener("click", (evento) => {
          evento.preventDefault();
          this.anotar(`click en módulo · ${elemento.texto}`);
          this.irA(elemento.texto, this.estado.vista);
        });
        contenedor.appendChild(enlace);
      });
    }

    renderEntidades() {
      const contenedor = DOM.uno("#entidades .contenido-columna");
      contenedor.innerHTML = "";
      this.estado.entidades.forEach((elemento) => {
        const tarjeta = Plantillas.clonar("tarjeta");
        FichaIU.completar(tarjeta, elemento.texto);
        tarjeta.dataset.vista = elemento.vista;

        tarjeta.addEventListener("click", () => {
          this.anotar(`click en vista · ${elemento.texto}`);
          this.irA(undefined, elemento.vista);
        });
        tarjeta.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.irA(undefined, elemento.vista);
          }
        });
        // Arrastrar una vista y soltarla en el escenario
        tarjeta.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", elemento.vista);
          tarjeta.classList.add("arrastrando");
          this.anotar(`dragstart · ${elemento.texto}`);
        });
        tarjeta.addEventListener("dragend", () => tarjeta.classList.remove("arrastrando"));
        contenedor.appendChild(tarjeta);
      });
    }

    /* ---------- Vistas ---------- */
    pintar(...nodos) {
      this.escenario.replaceChildren(...nodos);
      this.escenario.scrollTop = 0;
    }

    tarjeta(html) {
      const articulo = document.createElement("article");
      articulo.className = "mv-card";
      articulo.innerHTML = html;
      return articulo;
    }

    /** Estado vacío para módulos que todavía no tienen datos. */
    vistaVacia(que) {
      const modulo = this.estado.modulo.texto;
      const tarjeta = this.tarjeta(`
        <div class="mv-vacio">
          <div class="ficha" style="background:${Utilidades.colorTexto(modulo)}">${Utilidades.escapar(modulo.charAt(0))}</div>
          <h2>${Utilidades.escapar(modulo)}</h2>
          <p>Este módulo todavía no tiene ${que}. Añade su archivo JSON en <code>data/</code> y enlázalo en <code>menu.json</code>.</p>
        </div>`);
      this.barra.actualizar({ registros: null });
      this.pintar(tarjeta);
    }

    vistaListado() {
      if (!this.estado.tabla) return this.vistaVacia("listado");
      const tabla = new TablaIU(this.estado.tabla, {
        alEditar: (registro) => this.editar(registro),
        alAnotar: this.anotar
      });
      this.pintar(tabla.renderizar(this.estado.filtro));
      this.barra.actualizar({ registros: tabla.filtrar(this.estado.filtro).length });
    }

    vistaFormulario() {
      if (!this.estado.formulario) return this.vistaVacia("formulario");
      const campos = this.estado.formulario;
      const tarjeta = this.tarjeta(`
        <h2>Nuevo registro · ${Utilidades.escapar(this.estado.modulo.texto)}</h2>
        <p>Formulario generado desde <code>${Utilidades.escapar(this.estado.modulo.formulario)}</code>.</p>`);
      const formulario = FormularioIU.construir(campos, {}, "Guardar");
      this.escucharFormulario(formulario, (datos) => {
        this.guardar(datos);
        this.modal.abrir("Evento submit capturado", `<p>Datos enviados:</p><pre>${Utilidades.escapar(JSON.stringify(datos, null, 2))}</pre>`);
        formulario.reset();
      });
      tarjeta.appendChild(formulario);
      this.barra.actualizar({ registros: null });
      this.pintar(tarjeta);
    }

    /** submit, reset e invalid comunes a todos los formularios generados. */
    escucharFormulario(formulario, alEnviar) {
      formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        this.anotar("submit en formulario");
        alEnviar(FormularioIU.leer(formulario, this.estado.formulario));
      });
      formulario.addEventListener("reset", () => {
        this.anotar("reset en formulario");
        this.toast.mostrar("info", "Formulario limpio", "Se han vaciado todos los campos.");
      });
      // invalid no burbujea: lo capturamos en fase de captura
      formulario.addEventListener("invalid", (e) => {
        this.anotar(`invalid · ${e.target.name}`);
        this.toast.mostrar("aviso", "Revisa el formulario", `El campo «${e.target.name}» no es válido.`);
      }, true);
    }

    vistaControles() {
      const tarjeta = this.tarjeta(`
        <h2>Librería · Controles de formulario</h2>
        <p>Todos los componentes nativos de HTML agrupados por tipo. Al enviar se muestran los datos en una ventana modal.</p>
        <form class="mv-form" id="formControles">
          <fieldset>
            <legend>Texto</legend>
            <label><span>Texto *</span><input type="text" name="texto" required placeholder="Tu nombre"></label>
            <label><span>Contraseña</span><input type="password" name="password" minlength="6"></label>
            <label><span>Email *</span><input type="email" name="email" required></label>
            <label><span>Teléfono</span><input type="tel" name="telefono" pattern="[0-9 +]{9,15}"></label>
            <label><span>URL</span><input type="url" name="url" placeholder="https://"></label>
            <label><span>Búsqueda</span><input type="search" name="busqueda"></label>
            <label class="mv-form-completo"><span>Área de texto</span><textarea name="comentario" maxlength="200"></textarea>
              <small class="mv-ayuda"><output id="contador">0</output> / 200 caracteres</small></label>
          </fieldset>

          <fieldset>
            <legend>Números</legend>
            <label><span>Número (1-10, paso 0,1)</span><input type="number" name="numero" min="1" max="10" step="0.1"></label>
            <label><span>Rango <output id="salidaRango">50</output></span><input type="range" name="rango" min="0" max="100" value="50"></label>
            <label><span>Medidor (meter)</span><meter id="medidor" min="0" max="100" low="30" high="80" optimum="50" value="50"></meter></label>
          </fieldset>

          <fieldset>
            <legend>Fecha y hora</legend>
            <label><span>Fecha</span><input type="date" name="fecha"></label>
            <label><span>Hora</span><input type="time" name="hora"></label>
            <label><span>Fecha y hora</span><input type="datetime-local" name="fechaHora"></label>
            <label><span>Mes</span><input type="month" name="mes"></label>
            <label><span>Semana</span><input type="week" name="semana"></label>
          </fieldset>

          <fieldset>
            <legend>Selección</legend>
            <label><span>Lista (select + optgroup)</span>
              <select name="ciclo">
                <optgroup label="Informática">
                  <option>DAM</option><option>DAW</option><option>ASIR</option>
                </optgroup>
                <optgroup label="Otros">
                  <option>SMR</option><option>Otro</option>
                </optgroup>
              </select></label>
            <label><span>Lenguaje (input + datalist)</span>
              <input name="lenguaje" list="lenguajes" placeholder="Escribe o elige">
              <datalist id="lenguajes">
                <option value="Python"><option value="Java"><option value="JavaScript"><option value="PHP"><option value="C++">
              </datalist></label>
            <label><span>Color <output id="salidaColor">#ec8a4b</output></span><input type="color" name="color" value="#ec8a4b"></label>
            <div class="mv-campo"><span>Turno (radio)</span>
              <div class="mv-grupo-opciones">
                <label class="mv-check"><input type="radio" name="turno" value="mañana" checked><span>Mañana</span></label>
                <label class="mv-check"><input type="radio" name="turno" value="tarde"><span>Tarde</span></label>
              </div></div>
            <label class="mv-check"><input type="checkbox" name="acepto"><span>Acepto las condiciones (checkbox)</span></label>
          </fieldset>

          <fieldset>
            <legend>Archivos y campos especiales</legend>
            <label><span>Archivo</span><input type="file" name="archivo"></label>
            <div class="mv-campo"><span>Archivo elegido</span><output id="salidaArchivo">Ninguno</output></div>
            <input type="hidden" name="origen" value="vista-controles">
            <div class="mv-campo"><span>Input tipo button</span><input type="button" class="mv-btn secundario" value="Pulsar" id="inputBoton"></div>
            <div class="mv-campo"><span>Input tipo image (envía)</span><input type="image" src="img/logo.svg" alt="Enviar" width="34" height="34"></div>
          </fieldset>

          <fieldset>
            <legend>Campo calculado y progreso</legend>
            <label><span>Precio (€)</span><input type="number" name="precio" min="0" step="0.01" value="100"></label>
            <label><span>Cantidad</span><input type="number" name="cantidad" min="1" value="1"></label>
            <label><span>IVA</span><select name="iva"><option value="0.21">21 %</option><option value="0.10">10 %</option><option value="0.04">4 %</option></select></label>
            <div class="mv-campo"><span>Total con IVA (output)</span><output id="total">121,00 €</output></div>
            <div class="mv-campo mv-form-completo"><span>Campos obligatorios completados (progress)</span><progress id="progreso" max="2" value="0"></progress></div>
          </fieldset>

          <div class="mv-botones mv-form-completo">
            <button class="mv-btn" type="submit">Enviar</button>
            <button class="mv-btn secundario" type="reset">Limpiar</button>
          </div>
        </form>`);

      const form = DOM.uno("#formControles", tarjeta);
      const actualizarCalculos = () => {
        const total = Number(form.precio.value || 0) * Number(form.cantidad.value || 0) * (1 + Number(form.iva.value));
        DOM.uno("#total", form).value = total.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
        DOM.uno("#salidaRango", form).value = form.rango.value;
        DOM.uno("#medidor", form).value = form.rango.value;
        DOM.uno("#salidaColor", form).value = form.color.value;
        DOM.uno("#contador", form).value = form.comentario.value.length;
        const obligatorios = DOM.todos("[required]", form);
        DOM.uno("#progreso", form).value = obligatorios.filter((c) => c.validity.valid).length;
      };

      // Un solo escuchador para todo el formulario (delegación de eventos)
      form.addEventListener("input", (e) => {
        actualizarCalculos();
        this.anotar(`input · ${e.target.name}`);
      });
      form.addEventListener("change", (e) => {
        if (e.target.type === "file") {
          DOM.uno("#salidaArchivo", form).value = e.target.files[0]?.name || "Ninguno";
        }
        this.anotar(`change · ${e.target.name}`);
      });
      form.addEventListener("reset", () => setTimeout(actualizarCalculos));
      form.addEventListener("invalid", (e) => {
        this.toast.mostrar("aviso", "Campo no válido", `Revisa «${e.target.name}».`);
      }, true);
      DOM.uno("#inputBoton", form).addEventListener("click", () =>
        this.toast.mostrar("info", "input type=\"button\"", "No envía el formulario: solo dispara su evento click.")
      );
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const datos = {};
        new FormData(form).forEach((valor, clave) => {
          datos[clave] = valor instanceof File ? (valor.name || "(sin archivo)") : valor;
        });
        this.modal.abrir("Datos del formulario", `<pre>${Utilidades.escapar(JSON.stringify(datos, null, 2))}</pre>`);
        this.anotar("submit en controles");
      });

      actualizarCalculos();
      this.barra.actualizar({ registros: null });
      this.pintar(tarjeta);
    }

    vistaEventos() {
      const tarjeta = this.tarjeta(`
        <h2>Laboratorio de eventos</h2>
        <p>Interactúa con cada zona y observa en el registro qué evento se dispara y en qué orden.</p>
        <div class="mv-lab">
          <div class="mv-lab-caja">
            <h3>Ratón</h3>
            <div class="mv-zona" id="zonaRaton" tabindex="0">Haz clic, doble clic,<br>clic derecho o usa la rueda<br><small id="coordenadas">x: 0 · y: 0</small></div>
          </div>
          <div class="mv-lab-caja">
            <h3>Teclado, foco y portapapeles</h3>
            <div class="mv-form"><label><span>Escribe, copia o pega aquí</span><input id="campoEventos" autocomplete="off"></label></div>
            <p class="mv-ayuda">Atajos de la aplicación:</p>
            <div class="mv-teclas"><span><kbd>Ctrl</kbd>+<kbd>K</kbd> buscar</span><span><kbd>Alt</kbd>+<kbd>N</kbd> nuevo</span><span><kbd>Esc</kbd> cerrar</span></div>
          </div>
          <div class="mv-lab-caja">
            <h3>Propagación (burbuja)</h3>
            <div class="mv-burbuja" data-nombre="exterior">exterior
              <div class="mv-burbuja" data-nombre="medio">medio
                <div class="mv-burbuja" data-nombre="interior">interior</div>
              </div>
            </div>
            <div class="mv-form" style="margin-top:10px">
              <label class="mv-check"><input type="checkbox" id="detener"><span>stopPropagation() en «interior»</span></label>
              <label class="mv-check"><input type="checkbox" id="captura"><span>Escuchar también en fase de captura</span></label>
            </div>
          </div>
        </div>
        <div class="mv-botones" style="margin:14px 0 8px;justify-content:space-between">
          <h3 style="margin:0">Registro de eventos</h3>
          <button class="mv-btn secundario" type="button" id="limpiarRegistro">Limpiar</button>
        </div>
        <ol class="mv-registro" id="registro" reversed></ol>`);

      const registro = DOM.uno("#registro", tarjeta);
      const log = (tipo, detalle = "") => {
        const linea = document.createElement("li");
        linea.innerHTML = `${Utilidades.hora()} <b>${Utilidades.escapar(tipo)}</b> ${Utilidades.escapar(detalle)}`;
        registro.prepend(linea);
        while (registro.children.length > 60) registro.lastElementChild.remove();
      };

      // Ratón
      const zona = DOM.uno("#zonaRaton", tarjeta);
      ["click", "dblclick", "mousedown", "mouseup", "mouseenter", "mouseleave"].forEach((tipo) =>
        zona.addEventListener(tipo, () => log(tipo))
      );
      zona.addEventListener("contextmenu", (e) => { e.preventDefault(); log("contextmenu", "(menú del navegador cancelado)"); });
      zona.addEventListener("wheel", (e) => log("wheel", e.deltaY > 0 ? "hacia abajo" : "hacia arriba"), { passive: true });
      zona.addEventListener("mousemove", (e) => {
        DOM.uno("#coordenadas", zona).textContent = `x: ${e.offsetX} · y: ${e.offsetY}`;
      });

      // Teclado, foco, formulario y portapapeles
      const campo = DOM.uno("#campoEventos", tarjeta);
      campo.addEventListener("focus", () => log("focus"));
      campo.addEventListener("blur", () => log("blur"));
      campo.addEventListener("keydown", (e) => log("keydown", `tecla «${e.key}»`));
      campo.addEventListener("input", () => log("input", `valor «${campo.value}»`));
      campo.addEventListener("change", () => log("change", "(al salir del campo)"));
      ["copy", "cut", "paste"].forEach((tipo) => campo.addEventListener(tipo, () => log(tipo)));

      // Propagación: el mismo escuchador en las tres cajas
      const cajas = DOM.todos(".mv-burbuja", tarjeta);
      const escuchar = (fase) => (e) => {
        const caja = e.currentTarget;
        log(`click (${fase})`, `en «${caja.dataset.nombre}» · origen «${e.target.dataset.nombre}»`);
        caja.classList.add("destello");
        setTimeout(() => caja.classList.remove("destello"), 400);
        if (fase === "burbuja" && caja.dataset.nombre === "interior" && DOM.uno("#detener", tarjeta).checked) {
          e.stopPropagation();
          log("stopPropagation()", "la burbuja se detiene aquí");
        }
      };
      const enCaptura = escuchar("captura");
      cajas.forEach((caja) => caja.addEventListener("click", escuchar("burbuja")));
      DOM.uno("#captura", tarjeta).addEventListener("change", (e) => {
        cajas.forEach((caja) => e.target.checked
          ? caja.addEventListener("click", enCaptura, true)
          : caja.removeEventListener("click", enCaptura, true));
        log(e.target.checked ? "addEventListener" : "removeEventListener", "fase de captura");
      });

      DOM.uno("#limpiarRegistro", tarjeta).addEventListener("click", () => registro.replaceChildren());
      log("DOMContentLoaded", "ya ocurrió al cargar la página: así arranca la aplicación");

      this.barra.actualizar({ registros: null });
      this.pintar(tarjeta);
    }

    vistaToasts() {
      const tarjeta = this.tarjeta(`
        <h2>Librería · Toasts</h2>
        <p>Mensajes emergentes que se apilan abajo a la derecha, se cierran solos a los 5 segundos o con la ×.</p>
        <div class="mv-botones">
          <button class="mv-btn" data-toast="exito">Éxito</button>
          <button class="mv-btn secundario" data-toast="info">Información</button>
          <button class="mv-btn secundario" data-toast="aviso">Aviso</button>
          <button class="mv-btn secundario" data-toast="error">Error</button>
        </div>`);
      const textos = {
        exito: ["Guardado correctamente", "La operación se ha completado."],
        info: ["Información", "Este es un mensaje informativo."],
        aviso: ["Revisión necesaria", "Conviene revisar los datos antes de continuar."],
        error: ["Operación fallida", "No se ha podido completar la operación."]
      };
      // Delegación: un único escuchador para los cuatro botones
      tarjeta.addEventListener("click", (e) => {
        const boton = e.target.closest("[data-toast]");
        if (boton) this.toast.mostrar(boton.dataset.toast, ...textos[boton.dataset.toast]);
      });
      this.barra.actualizar({ registros: null });
      this.pintar(tarjeta);
    }

    vistaModal() {
      const tarjeta = this.tarjeta(`
        <h2>Librería · Modal y panel lateral</h2>
        <p>Dos patrones para acciones que no deben sustituir el contenido del escenario.</p>
        <div class="mv-rejilla">
          <div>
            <h3>Ventana modal</h3>
            <p>Bloquea la interfaz para avisos o confirmaciones. Se cierra con la ×, haciendo clic fuera o con Escape.</p>
            <div class="mv-botones">
              <button class="mv-btn" id="demoModal">Abrir modal</button>
              <button class="mv-btn secundario" id="demoConfirmar">Confirmación</button>
            </div>
          </div>
          <div>
            <h3>Panel lateral</h3>
            <p>Entra desde la derecha y mantiene el contexto visible. Arrastra su borde izquierdo: a partir del 25 % de la ventana el formulario pasa a dos columnas.</p>
            <button class="mv-btn" id="demoDrawer">Abrir panel de creación</button>
          </div>
        </div>`);
      DOM.uno("#demoModal", tarjeta).addEventListener("click", () =>
        this.modal.abrir("Ejemplo de ventana modal", "<p>Ventana modal reutilizable de <strong>mavr | iu</strong>.</p>")
      );
      DOM.uno("#demoConfirmar", tarjeta).addEventListener("click", () =>
        this.modal.confirmar("¿Seguro?", "Esta acción es solo una demostración.", () =>
          this.toast.mostrar("exito", "Confirmado", "Has pulsado Aceptar.")
        )
      );
      DOM.uno("#demoDrawer", tarjeta).addEventListener("click", () => this.crear());
      this.barra.actualizar({ registros: null });
      this.pintar(tarjeta);
    }

    vistaLogin() {
      const contenedor = document.createElement("div");
      contenedor.innerHTML = `
        <main class="mv-login incrustado">
          <article class="mv-login-marca">
            <img src="img/logo.svg" alt="">
            <h1>${Utilidades.escapar(this.estado.identidad.nombre)}</h1>
            <p>Pantalla de acceso como componente reutilizable.</p>
          </article>
          <article class="mv-login-tarjeta">
            <h2>Iniciar sesión</h2>
            <form class="mv-form" id="loginDemo">
              <label><span>Email</span><input type="email" required></label>
              <label><span>Contraseña</span><input type="password" required minlength="4"></label>
              <label class="mv-check"><input type="checkbox"><span>Mantener la sesión</span></label>
              <div class="mv-login-acciones">
                <button class="mv-btn">Entrar</button>
                <a class="mv-enlace" href="login.html">Abrir pantalla completa</a>
              </div>
            </form>
          </article>
        </main>`;
      DOM.uno("#loginDemo", contenedor).addEventListener("submit", (e) => {
        e.preventDefault();
        this.toast.mostrar("exito", "Acceso simulado", "El evento submit del login se ha capturado.");
      });
      this.barra.actualizar({ registros: null });
      this.pintar(contenedor);
    }

    vistaIdentidad() {
      const id = this.estado.identidad;
      const estilos = getComputedStyle(document.documentElement);
      const colores = id.colores.map((c) => {
        const valor = estilos.getPropertyValue(c.variable).trim();
        return `
          <div class="mv-color">
            <div class="mv-color-muestra" style="background:${valor}"></div>
            <div><strong>${Utilidades.escapar(c.nombre)}</strong> <code>${valor} · ${c.variable}</code>
              <p class="mv-ayuda">${Utilidades.escapar(c.significado)}</p></div>
          </div>`;
      }).join("");

      const tarjeta = this.tarjeta(`
        <h2>Manual de identidad · ${Utilidades.escapar(id.nombre)}</h2>
        <p>${Utilidades.escapar(id.lema)} Los colores se leen en directo de las variables CSS de <code>:root</code>.</p>
        <h3>Colores</h3>
        <div class="mv-paleta">${colores}</div>
        <div class="mv-identidad-fila">
          <img src="${Utilidades.escapar(id.logo.archivo)}" alt="Logotipo">
          <div><h3>Logotipo</h3><p class="mv-ayuda">${Utilidades.escapar(id.logo.motivo)}</p></div>
        </div>
        <div class="mv-identidad-fila">
          <div style="font-size:32px;width:64px;text-align:center">Aa</div>
          <div><h3>Tipografía</h3><p class="mv-ayuda"><code>${Utilidades.escapar(id.tipografia.familia)}</code> · ${Utilidades.escapar(id.tipografia.motivo)}</p></div>
        </div>
        <div class="mv-identidad-fila">
          <div class="mv-muestra-forma"><span style="border-radius:50%"></span><span style="border-radius:10px"></span></div>
          <div><h3>Formas</h3><p class="mv-ayuda">${Utilidades.escapar(id.formas.radio)} ${Utilidades.escapar(id.formas.motivo)}</p></div>
        </div>`);
      this.barra.actualizar({ registros: null });
      this.pintar(tarjeta);
    }

    /* ---------- Alta y edición en el panel lateral ---------- */
    crear() {
      if (!this.estado.formulario) {
        this.toast.mostrar("aviso", "Sin formulario", `El módulo ${this.estado.modulo.texto} todavía no tiene formulario.`);
        return;
      }
      const formulario = FormularioIU.construir(this.estado.formulario, {}, "Crear");
      this.escucharFormulario(formulario, (datos) => {
        this.guardar(datos);
        this.drawer.cerrar();
      });
      this.drawer.abrir({ modo: "CREAR", titulo: `Nuevo · ${this.estado.modulo.texto}`, contenido: formulario });
    }

    editar(registro) {
      if (!this.estado.formulario) return;
      this.anotar(`editar registro ${registro.id ?? ""}`);
      const formulario = FormularioIU.construir(this.estado.formulario, registro, "Guardar cambios");
      const borrar = document.createElement("button");
      borrar.type = "button";
      borrar.className = "mv-btn secundario";
      borrar.textContent = "Eliminar";
      borrar.addEventListener("click", () =>
        this.modal.confirmar("Eliminar registro", `¿Seguro que quieres eliminar «${registro.nombre ?? registro.id}»?`, () => {
          const registros = this.estado.tabla.registros;
          registros.splice(registros.indexOf(registro), 1);
          this.drawer.cerrar();
          this.toast.mostrar("exito", "Registro eliminado", "La tabla se ha actualizado.");
          this.refrescarListado();
        })
      );
      DOM.uno(".mv-botones", formulario).appendChild(borrar);

      this.escucharFormulario(formulario, (datos) => {
        Object.assign(registro, datos);
        this.drawer.cerrar();
        this.toast.mostrar("exito", "Registro actualizado", "Los cambios ya se ven en la tabla.");
        this.refrescarListado();
      });
      const nombre = [registro.nombre, registro.apellidos].filter(Boolean).join(" ") || "registro";
      this.drawer.abrir({ modo: "EDITAR", titulo: nombre, contenido: formulario });
    }

    /** Añade el registro a la tabla del módulo (solo en memoria). */
    guardar(datos) {
      if (!this.estado.tabla) return;
      const registros = this.estado.tabla.registros;
      if (!datos.id) {
        datos.id = Math.max(0, ...registros.map((r) => Number(r.id) || 0)) + 1;
      }
      registros.push(datos);
      this.toast.mostrar("exito", "Registro creado", `Se ha añadido a ${this.estado.modulo.texto.toLowerCase()}.`);
      this.refrescarListado();
    }

    refrescarListado() {
      if (this.estado.vista === "listado") this.vistaListado();
    }

    /* ---------- Eventos globales ---------- */
    activarEventosGlobales() {
      // Historial: atrás / adelante del navegador
      window.addEventListener("hashchange", () => this.aplicarHash());

      // Búsqueda en directo
      this.buscador.addEventListener("input", (e) => {
        this.estado.filtro = e.target.value;
        if (this.estado.vista !== "listado") {
          this.irA(undefined, "listado");
        } else {
          this.vistaListado();
        }
      });

      DOM.uno("#nuevo").addEventListener("click", () => {
        this.anotar("click en + Nuevo");
        this.crear();
      });

      // Soltar una vista en el escenario
      this.escenario.addEventListener("dragover", (e) => {
        e.preventDefault();
        this.escenario.classList.add("drag-over");
      });
      this.escenario.addEventListener("dragleave", (e) => {
        if (!this.escenario.contains(e.relatedTarget)) this.escenario.classList.remove("drag-over");
      });
      this.escenario.addEventListener("drop", (e) => {
        e.preventDefault();
        this.escenario.classList.remove("drag-over");
        const vista = e.dataTransfer.getData("text/plain");
        if (this.vistas[vista]) {
          this.anotar(`drop · ${vista}`);
          this.irA(undefined, vista);
        }
      });

      // Teclado
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.asistente.voz.callar(); // Escape también detiene la lectura en voz alta
          if (this.modal.abierto) this.modal.cerrar();
          else if (this.drawer.abierto) this.drawer.cerrar();
        } else if (e.ctrlKey && e.key.toLowerCase() === "k") {
          e.preventDefault();
          this.buscador.focus();
          this.anotar("Ctrl + K · buscar");
        } else if (e.altKey && e.key.toLowerCase() === "n") {
          e.preventDefault();
          this.crear();
          this.anotar("Alt + N · nuevo");
        }
      });
    }
  }

  // Exponemos las clases en el namespace mavr.iu
  Object.assign(window.mavr.iu, {
    DOM, Utilidades, OrigenDatos, Plantillas, EstadoIU, FichaIU, BarraEstado,
    ToastIU, ModalIU, DrawerIU, FormularioIU, TablaIU, GestorColumnas,
    MarkdownIU, VozIU, AsistenteIU, AplicacionIU
  });

  document.addEventListener("DOMContentLoaded", () => {
    window.mavr.iu.aplicacion = new AplicacionIU();
    window.mavr.iu.aplicacion.iniciar();
  });
})();
