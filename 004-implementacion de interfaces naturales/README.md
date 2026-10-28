# mavr | interfaz integrada · 004 · Implementación de interfaces naturales

Iteración de la **UD2 · Generación de interfaces naturales de usuario**. Parte de `003-UD1-completa` y le añade, igual que en el proyecto de referencia (`Material_DI/002-…/002-Interfaces naturales/005-Habla`), un **asistente flotante** que combina tres interfaces naturales:

| Interfaz natural | Tecnología | Qué hace en la interfaz |
|---|---|---|
| Lenguaje natural | Modelo local con **Ollama** (`phi3:mini`) a través de `ollama.php` | Escribes una petición en lenguaje natural y la respuesta (en Markdown) se pinta en el escenario: títulos, listas, tablas, citas y código. |
| Voz a texto | Web Speech API · `SpeechRecognition` | El botón 🎤 dicta la petición en español (`es-ES`). |
| Texto a voz | Web Speech API · `SpeechSynthesis` | Con el interruptor «Hablar respuesta» la respuesta se lee en voz alta. `Esc` detiene la lectura. |

La ventana del asistente se **arrastra** desde su barra, se **minimiza** con «—» y se **redimensiona** desde la esquina inferior derecha.

## Requisitos para ejecutarlo

Esta versión ya no basta con `python -m http.server`, porque necesita PHP para hablar con Ollama.

1. Instala **Ollama** (https://ollama.com) y descarga el modelo:
   ```bash
   ollama pull phi3:mini
   ```
2. Comprueba que tienes PHP con la extensión `curl` activada (en XAMPP ya viene).
3. Desde esta carpeta, arranca el servidor de PHP:
   ```bash
   php -S localhost:8000
   ```
4. Abre `http://localhost:8000` en **Chrome o Edge** (Firefox no tiene `SpeechRecognition`; en ese caso el micrófono aparece desactivado).

El micrófono solo funciona en `localhost` o con HTTPS, y el navegador pedirá permiso la primera vez.

Para cambiar de modelo, edita la variable `$modelo` al principio de `ollama.php`.

## Qué se ha añadido respecto a 003

```
004-implementacion de interfaces naturales/
├── ollama.php          NUEVO · puente navegador → Ollama (localhost:11434)
├── index.html          + bloque <section id="mvAsistente">
├── css/estilo.css      + sección 16: asistente, interruptor y respuesta Markdown
└── js/componentes.js   + clases MarkdownIU, VozIU y AsistenteIU
```

| Clase | Responsabilidad |
|---|---|
| `MarkdownIU` | Convierte el Markdown del modelo en HTML seguro (todo se escapa). Corrige errores típicos de los LLM: respuesta envuelta en un bloque `markdown`, tablas dentro de un bloque de código, barras y guiones Unicode y espacios invisibles. |
| `VozIU` | Encapsula la Web Speech API: `escuchar()` con `SpeechRecognition` y `hablar()` con `SpeechSynthesisUtterance`, eligiendo una voz `es-ES` si el sistema la tiene. Comprueba si el navegador lo soporta. |
| `AsistenteIU` | Ventana flotante: envía el prompt con `fetch()` a `ollama.php`, pinta la respuesta en el escenario, gestiona el micrófono, el interruptor de voz, el arrastre, el minimizado y el redimensionado con pointer events. |

Otros ajustes:

- Los toasts pasan arriba a la derecha para no quedar tapados por el asistente.
- La barra de estado anota los eventos del asistente (`submit`, `start`, `result`, `change`…).
- Si Ollama no está en marcha, `ollama.php` responde con un error 502 y la interfaz muestra un toast explicando qué revisar.

## Qué hay en el material de la UD2 y qué se integra

| Subunidad del material | ¿Integrada en la interfaz? |
|---|---|
| 001 · Herramientas de aprendizaje automático (chatbot con Ollama) | **Sí**: es el motor del asistente (`ollama.php`). |
| 002 · Interfaces naturales (proyecto de la UD1 + prompt IA) | **Sí**: es la base de esta iteración. |
| 003 · Voz y habla (síntesis y reconocimiento) | **Sí**: micrófono e interruptor «Hablar respuesta». |
| 004 · Partes y movimientos del cuerpo (MediaPipe: cara, manos, avatar) | No, porque no aporta nada a una aplicación de gestión. Copiados con el estilo mavr en `ejercicios/cuerpo/`. |
| 005 · Realidad aumentada (A-Frame) | No, por el mismo motivo. Copiados con el estilo mavr en `ejercicios/realidad-aumentada/`. |

## Ejercicios independientes

Con el servidor en marcha, entra en `http://localhost:8000/ejercicios/`: es un índice con todos los ejercicios de cuerpo y realidad aumentada.

```
ejercicios/
├── index.html             índice con tarjetas
├── css/ejercicios.css     estilo mavr común (se carga después del <style> de cada ejercicio)
├── cuerpo/                11 ejercicios + spritesheet.png y spritesheetA.png
└── realidad-aumentada/    8 ejercicios
```

Cambios respecto al material original (la lógica de cada ejercicio no se ha tocado):

- Cabecera mavr con logo y botón «← Ejercicios» (o un botón flotante en los de pantalla completa).
- Tipografía, paleta grafito + naranja y esquinas redondeadas.
- Colores de dibujo del canvas (recuadros, puntos, mallas) pasados a la paleta mavr.
- Los avatares con chat usan el `ollama.php` de la raíz (`../../ollama.php`).
- `006-raton.html` muestra además las coordenadas en pantalla, no solo en la consola.

Necesitan cámara (y los avatares, micrófono), y cargan MediaPipe y A-Frame desde internet.
