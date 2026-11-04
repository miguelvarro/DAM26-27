let entradas = document.querySelectorAll("input")

entradas.forEach(function(entrada){

  let contenedor = document.createElement("div")
  contenedor.classList.add("mavr-componentes")

  // Guardamos el tipo antes de eliminar el input
  let tipoOriginal = entrada.type

  // Comprobamos si justo antes hay un label
  let anterior = entrada.previousElementSibling

  // Creamos el elemento editable
  let mielemento = document.createElement("div")
  mielemento.setAttribute("contenteditable", "true")
  mielemento.classList.add("campo")

  // Guardamos el valor real
  let valorReal = entrada.value

  // Tipos de input
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
    checkbox: "X",
    radio: "O",
    file: "F",
    hidden: "H",
    submit: "OK",
    reset: "R",
    button: "BTN"
  }

  // Caja derecha
  let tipo = document.createElement("span")
  tipo.classList.add("tipo-input")
  tipo.textContent = tipos[tipoOriginal] || "?"

  // Contenedor del control
  let zonaControl = document.createElement("section")
  zonaControl.classList.add("control")

  // ----------------------------------------
  // PASSWORD
  // ----------------------------------------

  if(tipoOriginal === "password"){

    mielemento.textContent = "*".repeat(valorReal.length)

    let ojo = document.createElement("button")
    ojo.classList.add("ojo-password")
    ojo.type = "button"
    ojo.textContent = "◉"
    ojo.title = "Mostrar contraseña"

    let visible = false

    ojo.onclick = function(){

      visible = !visible

      if(visible){
        mielemento.textContent = valorReal
        ojo.classList.add("activo")
        ojo.title = "Ocultar contraseña"
      }else{
        mielemento.textContent = "*".repeat(valorReal.length)
        ojo.classList.remove("activo")
        ojo.title = "Mostrar contraseña"
      }

    }

    mielemento.addEventListener("input", function(){

      if(visible){
        valorReal = mielemento.textContent
      }else{

        /*
        Contenteditable no tiene un tipo password nativo.
        Por tanto, capturamos el contenido escrito.
        */

        let texto = mielemento.textContent

        if(!texto.includes("*")){
          valorReal = texto
        }

      }

    })

    zonaControl.appendChild(mielemento)
    zonaControl.appendChild(ojo)
    zonaControl.appendChild(tipo)

  }

  // ----------------------------------------
  // EMAIL
  // ----------------------------------------

  else if(tipoOriginal === "email"){

    mielemento.textContent = valorReal

    function validarEmail(){

      let email = mielemento.textContent.trim()

      // Vacío = estado neutro
      if(email === ""){
        mielemento.classList.remove("valido")
        mielemento.classList.remove("invalido")
        return
      }

      let expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if(expresion.test(email)){
        mielemento.classList.add("valido")
        mielemento.classList.remove("invalido")
      }else{
        mielemento.classList.add("invalido")
        mielemento.classList.remove("valido")
      }

    }

    mielemento.addEventListener("input", validarEmail)

    validarEmail()

    zonaControl.appendChild(mielemento)
    zonaControl.appendChild(tipo)

  }

  // ----------------------------------------
  // RESTO DE INPUTS
  // ----------------------------------------

  else{

    mielemento.textContent = valorReal

    zonaControl.appendChild(mielemento)
    zonaControl.appendChild(tipo)

  }

  // Insertamos el contenedor
  entrada.after(contenedor)

  // Movemos el label
  if(anterior && anterior.tagName === "LABEL"){
    contenedor.appendChild(anterior)
  }

  contenedor.appendChild(zonaControl)

  // Eliminamos input original
  entrada.remove()

})