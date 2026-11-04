let entradas = document.querySelectorAll("input")

entradas.forEach(function(entrada){

  let contenedor = document.createElement("div")
  contenedor.classList.add("mavr-componentes")

  // Comprobamos si justo antes hay un label
  let anterior = entrada.previousElementSibling

  // Creamos el elemento editable
  let mielemento = document.createElement("div")
  mielemento.setAttribute("contenteditable", "true")

  // Copiamos el valor inicial del input
  mielemento.textContent = entrada.value

  // Creamos la caja que indica el tipo
  let tipo = document.createElement("span")
  tipo.classList.add("tipo-input")

  // Correspondencia entre tipos de input y símbolos
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
    range: "---",
    checkbox: "X",
    radio: "O",
    file: "FILE",
    hidden: "H",
    submit: "OK",
    reset: "R",
    button: "BTN"
  }

  // Obtenemos el símbolo correspondiente
  tipo.textContent = tipos[entrada.type] || "?"

  // Insertamos el nuevo contenedor después del input
  entrada.after(contenedor)

  // Si justo antes del input había un label,
  // lo movemos dentro del nuevo componente
  if(anterior && anterior.tagName === "LABEL"){
    contenedor.appendChild(anterior)
  }

  // Creamos una zona para el control
  let zonaControl = document.createElement("section")
  zonaControl.classList.add("control")

  zonaControl.appendChild(tipo)
  zonaControl.appendChild(mielemento)

  contenedor.appendChild(zonaControl)

  // Eliminamos el input original
  entrada.remove()

})