document.addEventListener("DOMContentLoaded", function(){

  // ============================================================
  // CONFIGURACIÓN / UTILIDADES
  // ============================================================

  const TIPOS = {
    text: "T",
    number: "1",
    password: "*",
    email: "@",
    tel: "TEL",
    url: "URL",
    search: "?",
    date: "D",
    time: "H",
    "datetime-local": "DT",
    month: "M",
    week: "W",
    color: "RGB",
    range: "-",
    file: "F"
  }


  function crearContenedor(elemento){

    let contenedor = document.createElement("div")

    contenedor.classList.add(
      "mavr-componentes"
    )

    /*
      Guardamos información del control original
    */

    contenedor.dataset.name =
      elemento.name || ""

    contenedor.dataset.id =
      elemento.id || ""

    contenedor.dataset.required =
      elemento.required ? "true" : "false"


    /*
      Insertamos el nuevo componente justo
      después del elemento original.
    */

    elemento.after(contenedor)


    /*
      Si justo antes había un LABEL,
      lo movemos dentro del componente.
    */

    let anterior =
      elemento.previousElementSibling

    if(
      anterior &&
      anterior.tagName === "LABEL"
    ){

      contenedor.appendChild(
        anterior
      )

    }


    return contenedor
  }


  function crearControl(){

    let control =
      document.createElement("div")

    control.classList.add(
      "control"
    )

    return control
  }


  function crearCampo(valor = ""){

    let campo =
      document.createElement("div")

    campo.classList.add(
      "campo",
      "focusable"
    )

    campo.setAttribute(
      "contenteditable",
      "true"
    )

    campo.setAttribute(
      "tabindex",
      "0"
    )

    campo.textContent =
      valor

    return campo
  }


  function crearTipo(texto){

    let tipo =
      document.createElement("span")

    tipo.classList.add(
      "tipo-input"
    )

    tipo.textContent =
      texto

    return tipo
  }


  function estadoNeutro(campo){

    campo.classList.remove(
      "valido",
      "invalido"
    )
  }


  function estadoValido(campo){

    campo.classList.add(
      "valido"
    )

    campo.classList.remove(
      "invalido"
    )
  }


  function estadoInvalido(campo){

    campo.classList.add(
      "invalido"
    )

    campo.classList.remove(
      "valido"
    )
  }


  // ============================================================
  // VALIDADORES
  // ============================================================

  function validarEmail(valor){

    let expresion =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return expresion.test(valor)
  }


  function validarURL(valor){

    try{

      let url =
        new URL(valor)

      return (
        url.protocol === "http:" ||
        url.protocol === "https:"
      )

    }catch(error){

      return false
    }
  }


  function validarNumero(valor){

    if(valor.trim() === ""){
      return false
    }

    return (
      !isNaN(valor) &&
      isFinite(valor)
    )
  }


  // ============================================================
  // VALIDAR FORMULARIO MAVR
  // ============================================================

  function validarFormulario(formulario){

    let correcto = true

    let componentes =
      formulario.querySelectorAll(
        ".mavr-componentes[data-name]"
      )


    componentes.forEach(
      function(componente){

        let requerido =
          componente.dataset.required === "true"

        let tipo =
          componente.dataset.tipo

        let valor =
          componente.dataset.valor || ""


        // REQUIRED

        if(requerido){

          if(
            tipo === "checkbox" ||
            tipo === "radio"
          ){

            if(
              componente.dataset.checked !== "true"
            ){

              correcto = false

            }

          }else{

            if(valor.trim() === ""){

              correcto = false

              let campo =
                componente.querySelector(
                  ".campo"
                )

              if(campo){

                estadoInvalido(
                  campo
                )

              }

            }

          }

        }


        // EMAIL

        if(
          tipo === "email" &&
          valor !== "" &&
          !validarEmail(valor)
        ){

          correcto = false

        }


        // URL

        if(
          tipo === "url" &&
          valor !== "" &&
          !validarURL(valor)
        ){

          correcto = false

        }


        // NUMBER

        if(
          tipo === "number" &&
          valor !== "" &&
          !validarNumero(valor)
        ){

          correcto = false

        }

      }
    )


    return correcto
  }


  // ============================================================
  // ENVÍO POST
  // ============================================================

  function enviarFormularioMavr(
    formulario,
    botonSubmit = null
  ){

    if(
      !validarFormulario(
        formulario
      )
    ){

      console.warn(
        "Formulario no válido"
      )

      let primero =
        formulario.querySelector(
          ".campo.invalido"
        )

      if(primero){
        primero.focus()
      }

      return
    }


    /*
      Creamos un formulario temporal.
    */

    let formularioPost =
      document.createElement("form")


    formularioPost.method =
      formulario.dataset.mavrMethod ||
      "POST"


    formularioPost.action =
      formulario.dataset.mavrAction ||
      window.location.href


    /*
      Si había target, lo conservamos.
    */

    if(
      formulario.dataset.mavrTarget
    ){

      formularioPost.target =
        formulario.dataset.mavrTarget

    }


    /*
      Recorremos nuestros componentes.
    */

    let componentes =
      formulario.querySelectorAll(
        ".mavr-componentes[data-name]"
      )


    componentes.forEach(
      function(componente){

        let nombre =
          componente.dataset.name

        let tipo =
          componente.dataset.tipo

        let valor =
          componente.dataset.valor || ""


        /*
          Sin NAME no se envía.
        */

        if(!nombre){
          return
        }


        /*
          Checkbox desactivado:
          HTML normal tampoco lo envía.
        */

        if(
          tipo === "checkbox" &&
          componente.dataset.checked !== "true"
        ){
          return
        }


        /*
          Radio no seleccionado:
          tampoco se envía.
        */

        if(
          tipo === "radio" &&
          componente.dataset.checked !== "true"
        ){
          return
        }


        /*
          Creamos un input hidden temporal.
        */

        let hidden =
          document.createElement("input")

        hidden.type =
          "hidden"

        hidden.name =
          nombre

        hidden.value =
          valor


        formularioPost.appendChild(
          hidden
        )

      }
    )


    /*
      Si el submit tenía NAME/VALUE,
      también lo enviamos.
    */

    if(
      botonSubmit &&
      botonSubmit.dataset.name
    ){

      let hidden =
        document.createElement("input")

      hidden.type =
        "hidden"

      hidden.name =
        botonSubmit.dataset.name

      hidden.value =
        botonSubmit.dataset.valor || ""


      formularioPost.appendChild(
        hidden
      )

    }


    /*
      Añadimos temporalmente al DOM.
    */

    document.body.appendChild(
      formularioPost
    )


    /*
      POST real tradicional.
    */

    formularioPost.submit()

  }


  // ============================================================
  // PREPARAMOS LOS FORMULARIOS
  // ============================================================

  let formularios =
    document.querySelectorAll("form")


  formularios.forEach(
    function(formulario){

      /*
        Guardamos configuración original.
      */

      formulario.dataset.mavrAction =
        formulario.getAttribute("action") ||
        window.location.href

      formulario.dataset.mavrMethod =
        (
          formulario.getAttribute("method") ||
          "POST"
        ).toUpperCase()

      formulario.dataset.mavrTarget =
        formulario.getAttribute("target") ||
        ""

    }
  )


  // ============================================================
  // INPUTS
  // ============================================================

  let entradas =
    Array.from(
      document.querySelectorAll(
        "input"
      )
    )


  entradas.forEach(
    function(entrada){

      let tipoOriginal =
        entrada.type.toLowerCase()

      let valorOriginal =
        entrada.value

      let formulario =
        entrada.closest("form")


      // ========================================================
      // HIDDEN
      // ========================================================

      /*
        Aunque visualmente no existe,
        debemos conservar su valor para POST.
      */

      if(tipoOriginal === "hidden"){

        if(formulario){

          let almacen =
            document.createElement("div")

          almacen.classList.add(
            "mavr-componentes",
            "mavr-hidden"
          )

          almacen.dataset.tipo =
            "hidden"

          almacen.dataset.name =
            entrada.name || ""

          almacen.dataset.valor =
            entrada.value || ""

          almacen.style.display =
            "none"


          entrada.after(
            almacen
          )

        }

        entrada.remove()

        return
      }


      // ========================================================
      // SUBMIT
      // ========================================================

      if(tipoOriginal === "submit"){

        let contenedor =
          crearContenedor(
            entrada
          )

        contenedor.dataset.tipo =
          "submit"

        contenedor.dataset.valor =
          entrada.value || "Enviar"


        let control =
          crearControl()


        let boton =
          document.createElement(
            "div"
          )

        boton.classList.add(
          "boton-mavr",
          "clickable"
        )

        boton.setAttribute(
          "role",
          "button"
        )

        boton.setAttribute(
          "tabindex",
          "0"
        )

        boton.textContent =
          entrada.value ||
          "Enviar"


        function enviar(){

          if(formulario){

            enviarFormularioMavr(
              formulario,
              contenedor
            )

          }

        }


        boton.addEventListener(
          "click",
          enviar
        )


        boton.addEventListener(
          "keydown",
          function(event){

            if(
              event.key === "Enter" ||
              event.key === " "
            ){

              event.preventDefault()

              enviar()

            }

          }
        )


        control.appendChild(
          boton
        )

        contenedor.appendChild(
          control
        )


        entrada.remove()

        return
      }


      // ========================================================
      // RESET
      // ========================================================

      if(tipoOriginal === "reset"){

        let contenedor =
          crearContenedor(
            entrada
          )

        contenedor.dataset.tipo =
          "reset"


        let control =
          crearControl()


        let boton =
          document.createElement(
            "div"
          )

        boton.classList.add(
          "boton-mavr",
          "clickable"
        )

        boton.setAttribute(
          "role",
          "button"
        )

        boton.setAttribute(
          "tabindex",
          "0"
        )

        boton.textContent =
          entrada.value ||
          "Restablecer"


        control.appendChild(
          boton
        )

        contenedor.appendChild(
          control
        )


        entrada.remove()

        return
      }


      // ========================================================
      // BUTTON
      // ========================================================

      if(tipoOriginal === "button"){

        let contenedor =
          crearContenedor(
            entrada
          )

        contenedor.dataset.tipo =
          "button"


        let control =
          crearControl()


        let boton =
          document.createElement(
            "div"
          )

        boton.classList.add(
          "boton-mavr",
          "clickable"
        )

        boton.setAttribute(
          "role",
          "button"
        )

        boton.setAttribute(
          "tabindex",
          "0"
        )

        boton.textContent =
          entrada.value ||
          "Botón"


        control.appendChild(
          boton
        )

        contenedor.appendChild(
          control
        )


        entrada.remove()

        return
      }


      // ========================================================
      // CHECKBOX
      // ========================================================

      if(tipoOriginal === "checkbox"){

        let contenedor =
          crearContenedor(
            entrada
          )

        contenedor.dataset.tipo =
          "checkbox"

        contenedor.dataset.checkboxValue =
          entrada.value || "on"

        contenedor.dataset.checked =
          entrada.checked
            ? "true"
            : "false"

        contenedor.dataset.valor =
          entrada.checked
            ? (
                entrada.value ||
                "on"
              )
            : ""


        let control =
          crearControl()


        let switchControl =
          document.createElement(
            "div"
          )

        switchControl.classList.add(
          "switch",
          "clickable"
        )

        switchControl.setAttribute(
          "tabindex",
          "0"
        )

        switchControl.setAttribute(
          "role",
          "checkbox"
        )


        let circulo =
          document.createElement(
            "span"
          )

        switchControl.appendChild(
          circulo
        )


        function actualizar(){

          let activo =
            contenedor.dataset.checked ===
            "true"


          switchControl.classList.toggle(
            "activo",
            activo
          )

          switchControl.setAttribute(
            "aria-checked",
            activo
              ? "true"
              : "false"
          )


          contenedor.dataset.valor =
            activo
              ? contenedor.dataset.checkboxValue
              : ""

        }


        function cambiar(){

          let activo =
            contenedor.dataset.checked !==
            "true"

          contenedor.dataset.checked =
            activo
              ? "true"
              : "false"

          actualizar()

        }


        switchControl.addEventListener(
          "click",
          cambiar
        )


        switchControl.addEventListener(
          "keydown",
          function(event){

            if(
              event.key === " " ||
              event.key === "Enter"
            ){

              event.preventDefault()

              cambiar()

            }

          }
        )


        actualizar()


        control.appendChild(
          switchControl
        )

        contenedor.appendChild(
          control
        )


        entrada.remove()

        return
      }


      // ========================================================
      // RADIO
      // ========================================================

      if(tipoOriginal === "radio"){

        let contenedor =
          crearContenedor(
            entrada
          )

        contenedor.dataset.tipo =
          "radio"

        contenedor.dataset.valor =
          entrada.value || "on"

        contenedor.dataset.checked =
          entrada.checked
            ? "true"
            : "false"


        let control =
          crearControl()


        let radio =
          document.createElement(
            "div"
          )

        radio.classList.add(
          "radio-mavr",
          "clickable"
        )

        radio.setAttribute(
          "tabindex",
          "0"
        )

        radio.setAttribute(
          "role",
          "radio"
        )


        let interior =
          document.createElement(
            "span"
          )

        radio.appendChild(
          interior
        )


        function actualizar(){

          let activo =
            contenedor.dataset.checked ===
            "true"


          radio.classList.toggle(
            "activo",
            activo
          )

          radio.setAttribute(
            "aria-checked",
            activo
              ? "true"
              : "false"
          )

        }


        function activar(){

          /*
            Desactivamos solamente radios
            con el MISMO NAME.
          */

          if(formulario){

            let radios =
              formulario.querySelectorAll(
                '.mavr-componentes[data-tipo="radio"]'
              )


            radios.forEach(
              function(otro){

                if(
                  otro.dataset.name ===
                  contenedor.dataset.name
                ){

                  otro.dataset.checked =
                    "false"

                  let visual =
                    otro.querySelector(
                      ".radio-mavr"
                    )

                  if(visual){

                    visual.classList.remove(
                      "activo"
                    )

                    visual.setAttribute(
                      "aria-checked",
                      "false"
                    )

                  }

                }

              }
            )

          }


          contenedor.dataset.checked =
            "true"

          actualizar()

        }


        radio.addEventListener(
          "click",
          activar
        )


        radio.addEventListener(
          "keydown",
          function(event){

            if(
              event.key === " " ||
              event.key === "Enter"
            ){

              event.preventDefault()

              activar()

            }

          }
        )


        actualizar()


        control.appendChild(
          radio
        )

        contenedor.appendChild(
          control
        )


        entrada.remove()

        return
      }


      // ========================================================
      // INPUT NORMAL
      // ========================================================

      let contenedor =
        crearContenedor(
          entrada
        )

      contenedor.dataset.tipo =
        tipoOriginal

      contenedor.dataset.valor =
        valorOriginal


      /*
        Conservamos restricciones interesantes.
      */

      if(entrada.min !== ""){
        contenedor.dataset.min =
          entrada.min
      }

      if(entrada.max !== ""){
        contenedor.dataset.max =
          entrada.max
      }

      if(entrada.step !== ""){
        contenedor.dataset.step =
          entrada.step
      }

      if(entrada.placeholder){

        contenedor.dataset.placeholder =
          entrada.placeholder

      }


      let control =
        crearControl()


      let campo =
        crearCampo(
          valorOriginal
        )


      let tipo =
        crearTipo(
          TIPOS[tipoOriginal] ||
          "?"
        )


      // ========================================================
      // SINCRONIZACIÓN
      // ========================================================

      campo.addEventListener(
        "input",
        function(){

          if(
            tipoOriginal !==
            "password"
          ){

            contenedor.dataset.valor =
              campo.textContent

          }

        }
      )


      // ========================================================
      // EMAIL
      // ========================================================

      if(tipoOriginal === "email"){

        function comprobar(){

          let valor =
            campo.textContent.trim()

          contenedor.dataset.valor =
            valor


          if(valor === ""){

            estadoNeutro(
              campo
            )

          }else if(
            validarEmail(valor)
          ){

            estadoValido(
              campo
            )

          }else{

            estadoInvalido(
              campo
            )

          }

        }


        campo.addEventListener(
          "input",
          comprobar
        )

        comprobar()
      }


      // ========================================================
      // URL
      // ========================================================

      if(tipoOriginal === "url"){

        function comprobar(){

          let valor =
            campo.textContent.trim()

          contenedor.dataset.valor =
            valor


          if(valor === ""){

            estadoNeutro(
              campo
            )

          }else if(
            validarURL(valor)
          ){

            estadoValido(
              campo
            )

          }else{

            estadoInvalido(
              campo
            )

          }

        }


        campo.addEventListener(
          "input",
          comprobar
        )

        comprobar()
      }


      // ========================================================
      // NUMBER
      // ========================================================

      if(tipoOriginal === "number"){

        function comprobar(){

          let valor =
            campo.textContent.trim()

          contenedor.dataset.valor =
            valor


          if(valor === ""){

            estadoNeutro(
              campo
            )

            return
          }


          if(
            !validarNumero(valor)
          ){

            estadoInvalido(
              campo
            )

            return
          }


          let numero =
            Number(valor)


          if(
            contenedor.dataset.min !== undefined &&
            contenedor.dataset.min !== "" &&
            numero <
            Number(
              contenedor.dataset.min
            )
          ){

            estadoInvalido(
              campo
            )

            return
          }


          if(
            contenedor.dataset.max !== undefined &&
            contenedor.dataset.max !== "" &&
            numero >
            Number(
              contenedor.dataset.max
            )
          ){

            estadoInvalido(
              campo
            )

            return
          }


          estadoValido(
            campo
          )

        }


        campo.addEventListener(
          "input",
          comprobar
        )

        comprobar()
      }


      // ========================================================
      // PASSWORD
      // ========================================================

      if(tipoOriginal === "password"){

        let valorReal =
          valorOriginal

        let visible =
          false


        contenedor.dataset.valor =
          valorReal


        campo.textContent =
          "*".repeat(
            valorReal.length
          )


        let ojo =
          document.createElement(
            "div"
          )

        ojo.classList.add(
          "ojo-password",
          "clickable"
        )

        ojo.setAttribute(
          "role",
          "button"
        )

        ojo.setAttribute(
          "tabindex",
          "0"
        )


        let icono =
          document.createElement(
            "span"
          )

        icono.classList.add(
          "icono-ojo"
        )

        ojo.appendChild(
          icono
        )


        function mostrarOcultar(){

          visible =
            !visible


          if(visible){

            campo.textContent =
              valorReal

            ojo.classList.add(
              "activo"
            )

          }else{

            /*
              Si estaba visible,
              recogemos el valor editado.
            */

            valorReal =
              campo.textContent

            contenedor.dataset.valor =
              valorReal

            campo.textContent =
              "*".repeat(
                valorReal.length
              )

            ojo.classList.remove(
              "activo"
            )

          }

        }


        ojo.addEventListener(
          "click",
          mostrarOcultar
        )


        ojo.addEventListener(
          "keydown",
          function(event){

            if(
              event.key === " " ||
              event.key === "Enter"
            ){

              event.preventDefault()

              mostrarOcultar()

            }

          }
        )


        campo.addEventListener(
          "input",
          function(){

            if(visible){

              valorReal =
                campo.textContent

              contenedor.dataset.valor =
                valorReal

            }

          }
        )


        control.appendChild(
          campo
        )

        control.appendChild(
          ojo
        )

        control.appendChild(
          tipo
        )

      }else{

        control.appendChild(
          campo
        )

        control.appendChild(
          tipo
        )

      }


      contenedor.appendChild(
        control
      )


      /*
        AHORA SÍ:
        destruimos completamente
        el input original.
      */

      entrada.remove()

    }
  )


  // ============================================================
  // TEXTAREA
  // ============================================================

  let textareas =
    Array.from(
      document.querySelectorAll(
        "textarea"
      )
    )


  textareas.forEach(
    function(textarea){

      let contenedor =
        crearContenedor(
          textarea
        )


      contenedor.dataset.tipo =
        "textarea"

      contenedor.dataset.valor =
        textarea.value


      let control =
        crearControl()


      let campo =
        crearCampo(
          textarea.value
        )


      campo.classList.add(
        "campo-textarea"
      )


      let tipo =
        crearTipo("TXT")


      campo.addEventListener(
        "input",
        function(){

          contenedor.dataset.valor =
            campo.textContent

        }
      )


      control.appendChild(
        campo
      )

      control.appendChild(
        tipo
      )


      contenedor.appendChild(
        control
      )


      textarea.remove()

    }
  )


  // ============================================================
  // BUTTON NATIVO
  // ============================================================

  let botones =
    Array.from(
      document.querySelectorAll(
        "button"
      )
    )


  botones.forEach(
    function(botonOriginal){

      /*
        Ignoramos cualquier botón que ya
        pertenezca a nuestros componentes.
      */

      if(
        botonOriginal.closest(
          ".mavr-componentes"
        )
      ){
        return
      }


      let formulario =
        botonOriginal.closest(
          "form"
        )


      let tipoOriginal =
        (
          botonOriginal.type ||
          "submit"
        ).toLowerCase()


      let contenedor =
        crearContenedor(
          botonOriginal
        )


      contenedor.dataset.tipo =
        tipoOriginal

      contenedor.dataset.name =
        botonOriginal.name || ""

      contenedor.dataset.valor =
        botonOriginal.value || ""


      let control =
        crearControl()


      let boton =
        document.createElement(
          "div"
        )


      boton.classList.add(
        "boton-mavr",
        "clickable"
      )


      boton.setAttribute(
        "role",
        "button"
      )

      boton.setAttribute(
        "tabindex",
        "0"
      )


      boton.innerHTML =
        botonOriginal.innerHTML


      function ejecutar(){

        if(
          tipoOriginal === "submit"
        ){

          if(formulario){

            enviarFormularioMavr(
              formulario,
              contenedor
            )

          }

        }else if(
          tipoOriginal === "reset"
        ){

          /*
            Podemos implementar después
            restauración completa de estados.
          */

          console.log(
            "Reset MAVR"
          )

        }

      }


      boton.addEventListener(
        "click",
        ejecutar
      )


      boton.addEventListener(
        "keydown",
        function(event){

          if(
            event.key === " " ||
            event.key === "Enter"
          ){

            event.preventDefault()

            ejecutar()

          }

        }
      )


      control.appendChild(
        boton
      )

      contenedor.appendChild(
        control
      )


      botonOriginal.remove()

    }
  )

})