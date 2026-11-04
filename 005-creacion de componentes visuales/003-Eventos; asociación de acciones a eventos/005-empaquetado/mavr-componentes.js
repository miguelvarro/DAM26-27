// ============================================================
// MAVR COMPONENTES
// ============================================================

document.addEventListener("DOMContentLoaded", function(){

  // ----------------------------------------------------------
  // UTILIDADES
  // ----------------------------------------------------------

  function crearContenedor(elemento){

    let contenedor = document.createElement("div")
    contenedor.classList.add("mavr-componentes")

    let anterior = elemento.previousElementSibling

    elemento.after(contenedor)

    // Si hay un label justo antes, lo movemos al componente
    if(anterior && anterior.tagName === "LABEL"){
      contenedor.appendChild(anterior)
    }

    return contenedor
  }


  function crearControl(){
    let control = document.createElement("div")
    control.classList.add("control")
    return control
  }


  function crearCampo(valor = ""){
    let campo = document.createElement("div")
    campo.classList.add("campo")
    campo.setAttribute("contenteditable", "true")
    campo.textContent = valor
    return campo
  }


  function crearTipo(texto){
    let tipo = document.createElement("span")
    tipo.classList.add("tipo-input")
    tipo.textContent = texto
    return tipo
  }


  function estadoNeutro(campo){
    campo.classList.remove("valido")
    campo.classList.remove("invalido")
  }


  function estadoValido(campo){
    campo.classList.add("valido")
    campo.classList.remove("invalido")
  }


  function estadoInvalido(campo){
    campo.classList.add("invalido")
    campo.classList.remove("valido")
  }


  // ==========================================================
  // INPUTS
  // ==========================================================

  let entradas = document.querySelectorAll("input")

  entradas.forEach(function(entrada){

    let tipoOriginal = entrada.type
    let valorOriginal = entrada.value

    let contenedor = crearContenedor(entrada)
    let control = crearControl()

    // --------------------------------------------------------
    // CHECKBOX
    // --------------------------------------------------------

    if(tipoOriginal === "checkbox"){

      let switchControl = document.createElement("div")
      switchControl.classList.add("switch")

      let circulo = document.createElement("span")
      switchControl.appendChild(circulo)

      if(entrada.checked){
        switchControl.classList.add("activo")
      }

      switchControl.onclick = function(){
        switchControl.classList.toggle("activo")
      }

      control.appendChild(switchControl)

      contenedor.appendChild(control)

      entrada.remove()

      return
    }


    // --------------------------------------------------------
    // RADIO
    // --------------------------------------------------------

    if(tipoOriginal === "radio"){

      let radio = document.createElement("div")
      radio.classList.add("radio-mavr")

      let interior = document.createElement("span")
      radio.appendChild(interior)

      if(entrada.checked){
        radio.classList.add("activo")
      }

      radio.onclick = function(){

        // Desactivamos radios hermanos
        let radios = document.querySelectorAll(".radio-mavr")

        radios.forEach(function(r){
          r.classList.remove("activo")
        })

        radio.classList.add("activo")
      }

      control.appendChild(radio)

      contenedor.appendChild(control)

      entrada.remove()

      return
    }


    // --------------------------------------------------------
    // RESTO DE INPUTS
    // --------------------------------------------------------

    let campo = crearCampo(valorOriginal)

    let tipos = {
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
      file: "F",
      hidden: "H"
    }

    let tipo = crearTipo(
      tipos[tipoOriginal] || "?"
    )


    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    if(tipoOriginal === "email"){

      function validarEmail(){

        let valor = campo.textContent.trim()

        if(valor === ""){
          estadoNeutro(campo)
          return
        }

        let expresion =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if(expresion.test(valor)){
          estadoValido(campo)
        }else{
          estadoInvalido(campo)
        }
      }

      campo.addEventListener(
        "input",
        validarEmail
      )

      validarEmail()
    }


    // --------------------------------------------------------
    // URL
    // --------------------------------------------------------

    if(tipoOriginal === "url"){

      function validarURL(){

        let valor = campo.textContent.trim()

        if(valor === ""){
          estadoNeutro(campo)
          return
        }

        try{

          let url = new URL(valor)

          if(
            url.protocol === "http:" ||
            url.protocol === "https:"
          ){
            estadoValido(campo)
          }else{
            estadoInvalido(campo)
          }

        }catch(error){
          estadoInvalido(campo)
        }
      }

      campo.addEventListener(
        "input",
        validarURL
      )

      validarURL()
    }


    // --------------------------------------------------------
    // NUMBER
    // --------------------------------------------------------

    if(tipoOriginal === "number"){

      function validarNumero(){

        let valor = campo.textContent.trim()

        if(valor === ""){
          estadoNeutro(campo)
          return
        }

        if(
          valor !== "" &&
          !isNaN(valor) &&
          isFinite(valor)
        ){
          estadoValido(campo)
        }else{
          estadoInvalido(campo)
        }
      }

      campo.addEventListener(
        "input",
        validarNumero
      )

      validarNumero()
    }


    // --------------------------------------------------------
    // PASSWORD
    // --------------------------------------------------------

    if(tipoOriginal === "password"){

      let valorReal = valorOriginal
      let visible = false

      campo.textContent =
        "*".repeat(valorReal.length)

      let ojo = document.createElement("button")
      ojo.type = "button"
      ojo.classList.add("ojo-password")

      /*
        Icono de ojo dibujado con CSS.
        Sin emoji.
      */

      let iconoOjo = document.createElement("span")
      iconoOjo.classList.add("icono-ojo")

      ojo.appendChild(iconoOjo)

      ojo.onclick = function(){

        visible = !visible

        if(visible){

          campo.textContent = valorReal
          ojo.classList.add("activo")

        }else{

          valorReal = campo.textContent

          campo.textContent =
            "*".repeat(valorReal.length)

          ojo.classList.remove("activo")
        }
      }

      campo.addEventListener(
        "input",
        function(){

          if(visible){
            valorReal = campo.textContent
          }

        }
      )

      control.appendChild(campo)
      control.appendChild(ojo)
      control.appendChild(tipo)

    }else{

      control.appendChild(campo)
      control.appendChild(tipo)

    }

    contenedor.appendChild(control)

    entrada.remove()
  })


  // ==========================================================
  // TEXTAREA
  // ==========================================================

  let textareas =
    document.querySelectorAll("textarea")

  textareas.forEach(function(textarea){

    let valor = textarea.value

    let contenedor =
      crearContenedor(textarea)

    let control =
      crearControl()

    let campo =
      crearCampo(valor)

    campo.classList.add(
      "campo-textarea"
    )

    let tipo =
      crearTipo("TXT")

    control.appendChild(campo)
    control.appendChild(tipo)

    contenedor.appendChild(control)

    textarea.remove()
  })


  // ==========================================================
  // BUTTON
  // ==========================================================

  let botones =
    document.querySelectorAll("button")

  botones.forEach(function(boton){

    /*
      No transformamos botones internos
      creados por este mismo script.
    */

    if(
      boton.classList.contains(
        "ojo-password"
      )
    ){
      return
    }

    let contenedor =
      crearContenedor(boton)

    contenedor.classList.add(
      "contenedor-boton"
    )

    let nuevoBoton =
      document.createElement("div")

    nuevoBoton.classList.add(
      "boton-mavr"
    )

    nuevoBoton.setAttribute(
      "role",
      "button"
    )

    nuevoBoton.setAttribute(
      "tabindex",
      "0"
    )

    nuevoBoton.textContent =
      boton.textContent

    contenedor.appendChild(
      nuevoBoton
    )

    boton.remove()
  })

})