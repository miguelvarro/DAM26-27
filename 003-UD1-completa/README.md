# mavr | interfaz integrada · 003 · UD1 completa

Proyecto final de la **UD1 · Generación de interfaces de usuario**. Parte de `001-Uniendo` (rediseño mavr) y `002-mejoras` (login, toasts y minimizar con memoria) e integra todo lo trabajado en las subunidades 001 a 010.

## Ejecutar

El proyecto usa `fetch()` para los JSON y las plantillas, así que no funciona abriendo `index.html` con doble clic (`file://`). Desde esta carpeta:

```bash
python -m http.server 8000
```

Después abre `http://localhost:8000`.

## Estructura

```
003-UD1-completa/
├── index.html          estructura semántica: header, nav, section, main, footer, aside
├── login.html          pantalla de acceso a pantalla completa
├── css/estilo.css      identidad mavr (variables en :root) y componentes con prefijo mv-
├── js/componentes.js   clases en el namespace mavr.iu
├── templates/          componentes externos: nav, tarjeta, fila y toast
├── data/               orígenes de datos JSON
│   ├── menu.json       módulos y qué JSON usa cada uno
│   ├── entidades.json  vistas de la columna central
│   ├── clientes.json   tabla de clientes (formato columnas/registros)
│   ├── datos.json      formulario de clientes (formato campos/datos)
│   ├── productos.json  tabla y formulario de productos (formato campos/datos)
│   └── identidad.json  manual de identidad corporativa
└── img/logo.svg
```

## Qué subunidad cubre cada parte

| Subunidad | Dónde se ve en la interfaz |
|---|---|
| **001 · Patrones de arquitectura** | Patrón de aplicación de gestión: cabecera + módulos + vistas + escenario + barra de estado. Vista **Identidad**: manual de identidad (colores con significado, tipografía, formas y logo) leído de `identidad.json` y de las variables CSS. |
| **002 · Librerías de componentes** | Vista **Controles**: todos los controles nativos (20 tipos de `input`; `submit` y `reset` como `button`, `textarea`, `select` con `optgroup`, `button`, `fieldset`/`legend`, `label`, `datalist`, `output`, `progress` y `meter`). |
| **003 · Herramientas de edición** | Proyecto editado en VS Code; las carpetas 001 → 002 → 003 muestran la evolución del código. |
| **004 · Lenguajes descriptivos** | `index.html` usa `header`, `nav`, `section`, `main`, `aside`, `article` y `footer`; el estilo está separado en `css/estilo.css`. |
| **005 · Componentes** | `<template>` cargados desde `templates/*.html` y clonados con `cloneNode()`: fichas del menú, tarjetas de vistas, filas de tabla y toasts. Librería de componentes reutilizables: toast, modal, panel lateral y login. |
| **006 · Enlace a orígenes de datos** | `menu.json` dice qué JSON usa cada módulo. La misma clase `TablaIU` pinta clientes y productos aunque tengan formatos distintos, y `FormularioIU` genera el formulario de cada módulo desde su JSON (reutilización). |
| **007 · Acciones y eventos** | Clic en módulos, vistas y cabeceras de tabla (ordenar). Doble clic o Intro en una fila para editar. Búsqueda en directo (`input`). Arrastrar una vista al escenario (drag & drop). Separadores redimensionables (pointer events). Minimizar y restaurar columnas. |
| **008 · Edición del código generado** | Código del tutor adaptado: nombres, paleta suavizada, formas redondeadas, drawer en dos columnas, barra de estado y vistas nuevas. |
| **009 · Clases, propiedades, métodos** | Todo el JS está en clases (`AplicacionIU`, `TablaIU`, `FormularioIU`, `DrawerIU`, `ModalIU`, `ToastIU`, `GestorColumnas`, `BarraEstado`…) con constructor, propiedades y métodos, expuestas en `window.mavr.iu`. |
| **010 · Eventos y escuchadores** | Vista **Eventos**: laboratorio con ratón, teclado, foco, portapapeles y propagación (burbuja, captura y `stopPropagation`). Delegación de eventos en Controles y Toasts. `invalid` escuchado en fase de captura. Eventos de ventana: `hashchange` (atrás/adelante), `online`/`offline`, `resize`, `DOMContentLoaded`. |

## Atajos de teclado

| Atajo | Acción |
|---|---|
| `Ctrl` + `K` | Ir al buscador |
| `Alt` + `N` | Nuevo registro en el panel lateral |
| `Esc` | Cerrar el modal o el panel lateral |
| `Intro` | Editar la fila seleccionada / abrir la vista enfocada |

## Notas

- Los cambios (crear, editar y eliminar) se guardan solo en memoria: al recargar vuelven los datos del JSON.
- La URL guarda el módulo y la vista (`#productos/listado`), así que los botones atrás y adelante del navegador funcionan.
- Pedidos y Configuración no tienen JSON todavía: muestran un estado vacío. Para activarlos basta con crear su JSON y enlazarlo en `menu.json`.
