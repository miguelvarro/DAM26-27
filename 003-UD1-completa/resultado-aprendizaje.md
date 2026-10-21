# Resultado de aprendizaje · UD1 Generación de interfaces de usuario

**Proyecto:** mavr | interfaz integrada (`003-UD1-completa`)
**Autor:** Miguel Angel Vargas Rodriguez

## Resultado de aprendizaje

Genera interfaces gráficos de usuario mediante editores visuales utilizando las funcionalidades del editor y adaptando el código generado.

## Criterios de evaluación

### a) Se han analizado las herramientas y librerías disponibles para la generación de interfaces gráficos.

En mi proyecto he analizado los componentes nativos que ofrece HTML para construir interfaces multiplataforma, que funcionan igual en Windows, macOS y Linux desde el navegador. Los he reunido en la vista **Controles**, donde aparecen todos los tipos de `input`, `textarea`, `select` con `optgroup`, `button`, `fieldset` y `legend`, `label`, `datalist`, `output`, `progress` y `meter`. También he comparado este enfoque web con otras librerías, como Tkinter en escritorio o el XML de Android, y he estudiado sistemas de diseño consistentes como Material Design, Microsoft Office o el propio jocarsa-iu antes de definir el mío.

### b) Se ha creado un interfaz gráfico utilizando las herramientas de un editor visual.

En mi proyecto he creado una interfaz gráfica de gestión con VS Code, usando su vista previa para comprobar el resultado mientras editaba. La interfaz sigue el patrón de una aplicación de gestión: cabecera con buscador y usuario, columna de módulos, columna de vistas, escenario de trabajo y barra de estado. Además he creado una pantalla de login independiente (`login.html`) y un manual de identidad visual con mis colores, mi tipografía, mis formas y mi logotipo, cada uno con su significado.

### c) Se han utilizado las funciones del editor para ubicar los componentes del interfaz.

En mi proyecto he ubicado los componentes con etiquetas semánticas (`header`, `nav`, `section`, `main`, `aside`, `article` y `footer`) y los he distribuido con CSS Flexbox y CSS Grid. Las tres columnas se pueden redimensionar arrastrando los separadores y minimizar con un botón, y al restaurarlas recuperan el ancho anterior. Los formularios se colocan solos en una rejilla adaptable, y el panel lateral pasa de una a dos columnas cuando supera el 25 % del ancho de la ventana.

### d) Se han modificado las propiedades de los componentes para adecuarlas a las necesidades de la aplicación.

En mi proyecto he definido la identidad en variables CSS dentro de `:root` (colores, radios, sombras y anchos) para cambiar el aspecto de toda la aplicación desde un único sitio. He suavizado la paleta original a grafito y naranja suave, he sustituido las esquinas cuadradas por esquinas redondeadas y botones en forma de píldora, y he ajustado las propiedades de los controles: `required`, `min`, `max`, `step`, `pattern`, `minlength`, `maxlength`, `placeholder` y `accent-color`. Los estados de foco, error y elemento activo tienen su propio estilo.

### e) Se ha analizado el código generado por el editor visual.

En mi proyecto he analizado el código base de jocarsa-iu: la estructura del HTML, los selectores del CSS y las funciones de JavaScript. Detecté que la cabecera general también afectaba a las cabeceras del modal y del panel lateral, que los componentes flotantes no tenían estilos para ocultarse y que algunos textos se insertaban en el HTML sin escapar. También vi que el formulario y la tabla repetían la misma lógica en varios sitios y se podían reutilizar.

### f) Se ha modificado el código generado por el editor visual.

En mi proyecto he modificado el código en tres iteraciones (001, 002 y 003). Cambié la marca y los nombres y limité la cabecera general a `body > header`. Separé los componentes en plantillas externas (`templates/*.html`), y los datos en JSON: `menu.json` indica qué tabla y qué formulario usa cada módulo. Una misma clase pinta tablas con formatos de JSON distintos, la de clientes y la de productos. Por último, reorganicé todo el JavaScript en clases dentro del namespace `mavr.iu`: `AplicacionIU`, `TablaIU`, `FormularioIU`, `DrawerIU`, `ModalIU`, `ToastIU`, `GestorColumnas` y `BarraEstado`, cada una con su constructor, sus propiedades y sus métodos.

### g) Se han asociado a los eventos las acciones correspondientes.

En mi proyecto he asociado acciones a eventos con `addEventListener`:

- **Ratón:** `click` en módulos, vistas y cabeceras para ordenar la tabla; `dblclick` en las filas para editarlas; `contextmenu` y `wheel` en el laboratorio de eventos.
- **Teclado:** `Ctrl+K` lleva al buscador, `Alt+N` crea un registro nuevo, `Esc` cierra el modal o el panel e `Intro` edita la fila seleccionada.
- **Formulario:** `input` para la búsqueda en directo y el campo calculado; `change`, `submit` y `reset`; `invalid` escuchado en fase de captura para avisar con un toast.
- **Arrastrar y soltar:** `dragstart`, `dragover`, `dragleave` y `drop` para abrir una vista arrastrándola al escenario.
- **Puntero:** `pointerdown`, `pointermove` y `pointerup` con captura del puntero para redimensionar las columnas y el panel.
- **Ventana:** `DOMContentLoaded`, `hashchange` para que funcionen atrás y adelante, `online`/`offline` y `resize`.

En la vista **Eventos** he preparado un laboratorio que registra en directo los eventos de ratón, teclado, foco y portapapeles, y demuestra la propagación en burbuja y en captura y el efecto de `stopPropagation()`. También uso delegación de eventos: un único escuchador para todo un formulario o un grupo de botones.

### h) Se ha desarrollado una aplicación que incluye el interfaz gráfico obtenido.

En mi proyecto he desarrollado una aplicación de gestión funcional con los módulos de Clientes y Productos, que cargan sus datos desde archivos JSON. Permite buscar, ordenar, crear, editar y eliminar registros desde un panel lateral, con confirmación en una ventana modal y avisos mediante toasts. Además incluye una librería de componentes reutilizables (formularios, toasts, modal, panel lateral y login), una barra de estado que informa del módulo, la vista, el número de registros y el último evento, y la navegación por URL para que el historial del navegador funcione.
