/* mavr-ui.js - Mavr Components Library */
(function(){
  "use strict";

  class MavrControl {
    static estilosInstalados = false;

    constructor(elemento, tipo){
      this.elemento = elemento;
      this.tipo = tipo;
      this.name = elemento.getAttribute("name") || "";
      this.value = elemento.getAttribute("value") || elemento.textContent.trim() || "";
      this.placeholder = elemento.getAttribute("placeholder") || "";
      this.required = elemento.hasAttribute("required");
      this.disabled = elemento.hasAttribute("disabled");
      this.instalarEstilos();

      this.raiz = document.createElement("div");
      this.raiz.className = `mavr-control mavr-${tipo}`;
      elemento.after(this.raiz);
      elemento.remove();
    }

    instalarEstilos(){
      if(MavrControl.estilosInstalados) return;
      MavrControl.estilosInstalados = true;
      const style = document.createElement("style");
      style.textContent = `
        .mavr-control{width:100%;max-width:720px;font-family:Arial,sans-serif;border:1px solid #aaa;border-radius:6px;overflow:hidden;background:#fff;box-sizing:border-box;margin:8px 0}
        .mavr-barra{display:flex;gap:4px;flex-wrap:wrap;padding:6px;background:#eee;border-bottom:1px solid #aaa}
        .mavr-barra button{min-width:32px;height:30px;padding:0 8px;border:1px solid #aaa;border-radius:3px;background:#fff;cursor:pointer}
        .mavr-barra button:hover{background:#ddd}.mavr-barra button.activo{background:#333;color:#fff}
        .mavr-area{min-height:240px;padding:12px;box-sizing:border-box;outline:none;overflow:auto}
        .mavr-codigo,.mavr-markdown textarea,.mavr-texto textarea{display:block;width:100%;min-height:240px;padding:12px;border:0;outline:none;resize:vertical;box-sizing:border-box;font:14px/1.5 monospace;tab-size:2}
        .mavr-markdown .mavr-preview{min-height:240px;padding:12px;box-sizing:border-box;outline:none;overflow:auto}
        .mavr-editor .mavr-codigo{margin:0;background:#181818;color:#eee;white-space:pre;overflow:auto}
        .mavr-editor textarea.mavr-hidden-input,.mavr-hidden-input{display:none!important}
        .mavr-firma canvas{display:block;width:100%;height:260px;background:#fff;touch-action:none;cursor:crosshair}
        .mavr-firma .mavr-firma-info{padding:6px 10px;font-size:12px;color:#666;border-top:1px solid #ddd}
      `;
      document.head.appendChild(style);
    }

    barra(){
      const barra = document.createElement("div");
      barra.className = "mavr-barra";
      this.raiz.appendChild(barra);
      return barra;
    }

    boton(barra, texto, fn, titulo=""){
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = texto;
      b.title = titulo;
      b.addEventListener("click", fn);
      barra.appendChild(b);
      return b;
    }

    campoOculto(tipo="textarea"){
      const campo = document.createElement(tipo);
      campo.className = "mavr-hidden-input";
      if(this.name) campo.name = this.name;
      if(this.required) campo.required = true;
      if(this.disabled) campo.disabled = true;
      campo.value = this.value;
      this.raiz.appendChild(campo);
      this.campo = campo;
      return campo;
    }

    setValue(valor){
      this.value = valor;
      if(this.campo) this.campo.value = valor;
      this.raiz.dispatchEvent(new CustomEvent("mavr-change", {detail:{value:valor}}));
    }
  }

  class MavrTexto extends MavrControl {
    constructor(elemento){
      super(elemento,"texto");
      const barra = this.barra();
      const editor = document.createElement("article");
      editor.className = "mavr-area";
      editor.contentEditable = !this.disabled;
      editor.innerHTML = this.value;
      if(this.placeholder) editor.dataset.placeholder = this.placeholder;
      this.raiz.appendChild(editor);

      const codigo = document.createElement("textarea");
      codigo.style.display = "none";
      codigo.value = this.value;
      if(this.name) codigo.name = this.name;
      if(this.required) codigo.required = true;
      this.raiz.appendChild(codigo);
      this.campo = codigo;

      const cmd=(t,c,v=null)=>this.boton(barra,t,()=>{editor.focus();document.execCommand(c,false,v);sync();});
      cmd("<b>B</b>","bold"); cmd("<i>I</i>","italic"); cmd("<u>U</u>","underline");
      cmd("H1","formatBlock","h1"); cmd("H2","formatBlock","h2"); cmd("P","formatBlock","p");
      cmd("•","insertUnorderedList"); cmd("1.","insertOrderedList");
      cmd("←","justifyLeft"); cmd("↔","justifyCenter"); cmd("→","justifyRight");
      cmd("↶","undo"); cmd("↷","redo");
      this.boton(barra,"🔗",()=>{const u=prompt("Introduce la URL:");if(u){editor.focus();document.execCommand("createLink",false,u);sync();}});
      this.boton(barra,"Tx",()=>{editor.focus();document.execCommand("removeFormat",false,null);sync();});
      this.boton(barra,"&lt;/&gt;",()=>{
        const verCodigo = codigo.style.display === "none";
        if(verCodigo){sync(); editor.style.display="none"; codigo.style.display="block";}
        else{editor.innerHTML=codigo.value; editor.style.display="block"; codigo.style.display="none"; sync();}
      },"Ver HTML");

      const sync=()=>this.setValue(editor.innerHTML);
      editor.addEventListener("input",sync);
      codigo.addEventListener("input",()=>{this.value=codigo.value;});
    }
  }

  class MavrMarkdown extends MavrControl {
    constructor(elemento){
      super(elemento,"markdown");
      const barra=this.barra();
      const preview=document.createElement("div");
      preview.className="mavr-preview";
      preview.contentEditable=!this.disabled;
      const codigo=document.createElement("textarea");
      codigo.value=this.value;
      if(this.name) codigo.name=this.name;
      if(this.required) codigo.required=true;
      codigo.style.display="none";
      this.raiz.append(preview,codigo);
      this.campo=codigo;

      const escapar=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const render=md=>{
        let h=escapar(md);
        h=h.replace(/^### (.*)$/gm,"<h3>$1</h3>").replace(/^## (.*)$/gm,"<h2>$1</h2>").replace(/^# (.*)$/gm,"<h1>$1</h1>");
        h=h.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>");
        h=h.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
        h=h.replace(/^[-*] (.*)$/gm,"<li>$1</li>");
        h=h.replace(/(?:<li>.*<\/li>\n?)+/g,m=>"<ul>"+m+"</ul>");
        return h.split(/\n{2,}/).map(x=>/^<(h\d|ul|ol|blockquote)/.test(x)?x:`<p>${x.replace(/\n/g,"<br>")}</p>`).join("");
      };
      const htmlAMarkdown=()=>{
        let h=preview.innerHTML;
        h=h.replace(/<h1[^>]*>(.*?)<\/h1>/gi,"# $1\n\n").replace(/<h2[^>]*>(.*?)<\/h2>/gi,"## $1\n\n").replace(/<h3[^>]*>(.*?)<\/h3>/gi,"### $1\n\n");
        h=h.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi,"**$2**").replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi,"*$2*");
        h=h.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi,"[$2]($1)");
        h=h.replace(/<li[^>]*>(.*?)<\/li>/gi,"- $1\n").replace(/<br\s*\/?\s*>/gi,"\n").replace(/<\/p>/gi,"\n\n").replace(/<p[^>]*>/gi,"");
        const tmp=document.createElement("div"); tmp.innerHTML=h; return tmp.textContent.replace(/\n{3,}/g,"\n\n").trim();
      };
      const syncPreview=()=>{codigo.value=htmlAMarkdown();this.value=codigo.value;};
      const envolver=(a,b=a)=>{const s=codigo.selectionStart,e=codigo.selectionEnd,t=codigo.value;codigo.value=t.slice(0,s)+a+t.slice(s,e)+b+t.slice(e);codigo.focus();codigo.selectionStart=s+a.length;codigo.selectionEnd=e+a.length;this.setValue(codigo.value);};
      this.boton(barra,"<b>B</b>",()=>envolver("**")); this.boton(barra,"<i>I</i>",()=>envolver("*"));
      this.boton(barra,"H1",()=>envolver("# ","")); this.boton(barra,"H2",()=>envolver("## ",""));
      this.boton(barra,"🔗",()=>{const u=prompt("Introduce la URL:");if(u) envolver("[","]("+u+")");});
      this.boton(barra,"MD",()=>{
        if(codigo.style.display==="none"){syncPreview();preview.style.display="none";codigo.style.display="block";}
        else{this.setValue(codigo.value);preview.innerHTML=render(codigo.value);codigo.style.display="none";preview.style.display="block";}
      },"Código Markdown / WYSIWYG");
      preview.innerHTML=render(this.value);
      preview.addEventListener("input",syncPreview);
      codigo.addEventListener("input",()=>{this.value=codigo.value;});
    }
  }

  class MavrEditor extends MavrControl {
    constructor(elemento){
      super(elemento,"editor");
      const barra=this.barra();
      const lenguaje=elemento.getAttribute("language")||elemento.getAttribute("lenguaje")||"texto";
      const etiqueta=document.createElement("span"); etiqueta.textContent=lenguaje; etiqueta.style.marginRight="auto"; etiqueta.style.padding="6px"; barra.appendChild(etiqueta);
      const codigo=document.createElement("textarea");
      codigo.className="mavr-codigo"; codigo.spellcheck=false; codigo.value=this.value; codigo.placeholder=this.placeholder;
      if(this.name) codigo.name=this.name; if(this.required) codigo.required=true; if(this.disabled) codigo.disabled=true;
      this.raiz.appendChild(codigo); this.campo=codigo;
      this.boton(barra,"Copiar",()=>navigator.clipboard?.writeText(codigo.value));
      codigo.addEventListener("keydown",e=>{if(e.key==="Tab"){e.preventDefault();const s=codigo.selectionStart,en=codigo.selectionEnd;codigo.setRangeText("  ",s,en,"end");}});
      codigo.addEventListener("input",()=>this.setValue(codigo.value));
    }
  }

  class MavrFirma extends MavrControl {
    constructor(elemento){
      super(elemento,"firma");
      const barra=this.barra();
      const canvas=document.createElement("canvas");
      const info=document.createElement("div"); info.className="mavr-firma-info"; info.textContent="Firma dentro del recuadro";
      this.raiz.append(canvas,info);
      const campo=this.campoOculto("textarea");
      const ctx=canvas.getContext("2d"); let dibujando=false, ultimo=null;
      const ajustar=()=>{const r=canvas.getBoundingClientRect(),d=window.devicePixelRatio||1;canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);ctx.setTransform(d,0,0,d,0,0);ctx.lineWidth=2;ctx.lineCap="round";ctx.lineJoin="round";};
      ajustar();
      const punto=e=>{const r=canvas.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return{x:p.clientX-r.left,y:p.clientY-r.top};};
      const inicio=e=>{e.preventDefault();dibujando=true;ultimo=punto(e);};
      const mover=e=>{if(!dibujando)return;e.preventDefault();const p=punto(e);ctx.beginPath();ctx.moveTo(ultimo.x,ultimo.y);ctx.lineTo(p.x,p.y);ctx.stroke();ultimo=p;};
      const fin=()=>{if(!dibujando)return;dibujando=false;this.setValue(canvas.toDataURL("image/png"));};
      canvas.addEventListener("pointerdown",inicio); canvas.addEventListener("pointermove",mover); window.addEventListener("pointerup",fin);
      this.boton(barra,"Limpiar",()=>{ctx.clearRect(0,0,canvas.width,canvas.height);this.setValue("");});
    }
  }

  class Mavr {
    static controles={
      "mavr-texto":MavrTexto,
      "mavr-markdown":MavrMarkdown,
      "mavr-editor":MavrEditor,
      "mavr-firma":MavrFirma
    };
    static iniciar(){
      Object.entries(this.controles).forEach(([selector,Clase])=>document.querySelectorAll(selector).forEach(el=>new Clase(el)));
    }
  }

  window.Mavr=Mavr;
  window.MavrControl=MavrControl;
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>Mavr.iniciar()); else Mavr.iniciar();
})();
