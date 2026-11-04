# mavr · 005 · Creación de componentes visuales

Ejercicios de la **UD3 · Creación de componentes visuales**. Al contrario que en las iteraciones 001–004, estos ejercicios **no están integrados en la interfaz mavr**: son páginas independientes en las que se construye, paso a paso, una librería propia de componentes.

Se han tomado del material de referencia (`Material_DI/003-Creación de componentes visuales`) cambiando `jocarsa` por `mavr` en el código, las clases y los nombres de archivo (`mavr-texto.js`, `mavr-ui.js`, `mavr-componentes.js`…). La lógica de cada ejercicio no se ha tocado.

## Contenido

| Carpeta | Contenidos de la UD | Qué hay |
|---|---|---|
| `001-Concepto de componente` | Concepto de componente | De `<mavr-texto>` a un editor de texto rico (`contenteditable`), pasando el código a `mavr-texto.js` / `.css` y usándolo dentro de un formulario. |
| `002-Propiedades, atributos y métodos` | Propiedades, atributos y métodos | Librería `mavr-ui.js` (v2 → v4.1) con la clase base `MavrControl` y los componentes `mavr-input`, `mavr-texto`, `mavr-markdown`, `mavr-editor`, `mavr-firma`, `mavr-tabla`, `mavr-arbol`, `mavr-calendario`, `mavr-semana` y `mavr-hora`. |
| `003-Eventos; asociación de acciones a eventos` | Eventos | Librería `mavr-componentes.js` (003 → 008 empaquetado) que busca los controles nativos de los formularios y los sustituye por versiones mejoradas. |
| `004` a `007` | Persistencia, herramientas, pruebas y empaquetado | Solo el índice de contenidos (`000-Introducción.md`); en el material original no hay código. |

## Cómo probarlo

Los formularios envían a `procesa.php`, así que conviene servir la carpeta con PHP:

```bash
php -S localhost:8000
```

y abrir, por ejemplo:

- `http://localhost:8000/002-Propiedades, atributos y métodos/006-mavr-componentes-v4.1/007-formulario-componentes.html`
- `http://localhost:8000/003-Eventos; asociación de acciones a eventos/008-empaquetado/002-reemplazar-input.html`

Si solo quieres ver los componentes sin enviar el formulario, basta con `python -m http.server 8000`.
