#!/usr/bin/env python3
"""
Genera archivos.json: el catálogo estático que lee el index.html principal.

Antes, el index.html pedía la lista de archivos a la API REST de GitHub.
Sin autenticación esa API solo admite 60 peticiones por hora y por IP, así
que en un aula (muchos alumnos detrás de la misma IP) devolvía error 403.

Ahora la lista se genera una sola vez, en GitHub Actions, con cada push a
main. El navegador solo descarga un archivo JSON estático: sin límites,
sin tokens y sin depender de la API.

Uso (desde cualquier carpeta dentro del repositorio):
    python scripts/generar-catalogo.py              -> crea ./archivos.json en la raíz
    python scripts/generar-catalogo.py salida.json  -> ruta de salida personalizada
"""

import json
import subprocess
import sys
from pathlib import Path

# Extensiones que se muestran en el catálogo (HTML, CSS, JS, Python, PHP,
# Markdown y PDF). El resto (imágenes, JSON de datos, SVG...) se sigue
# publicando en Pages para que los proyectos funcionen, pero no se lista.
EXTENSIONES = {".html", ".htm", ".css", ".js", ".py", ".php", ".md", ".pdf"}

# Carpetas que nunca deben aparecer en el catálogo.
CARPETAS_EXCLUIDAS = {"node_modules", ".git", ".github", "scripts"}

# Archivos de la raíz que pertenecen al propio sistema de publicación.
ARCHIVOS_RAIZ_EXCLUIDOS = {"index.html", "archivos.json", "CLAUDE.md"}


def raiz_repositorio() -> Path:
    """Devuelve la carpeta raíz del repositorio git."""
    salida = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        check=True, capture_output=True, text=True, encoding="utf-8",
    )
    return Path(salida.stdout.strip())


def archivos_versionados(raiz: Path) -> list[str]:
    """
    Lista los archivos que git tiene versionados.

    -z separa las rutas con el carácter nulo y desactiva el "entrecomillado"
    que git aplica por defecto a rutas con tildes o espacios
    (p. ej. "000- Identidad de marca/dise\\303\\261o.html"). Así obtenemos las
    rutas tal cual, en UTF-8.
    """
    salida = subprocess.run(
        ["git", "-C", str(raiz), "ls-files", "-z"],
        check=True, capture_output=True,
    )
    texto = salida.stdout.decode("utf-8")
    return [ruta for ruta in texto.split("\0") if ruta]


def es_visible(ruta: str) -> bool:
    """Decide si una ruta debe aparecer en el catálogo."""
    partes = ruta.split("/")

    # index.html principal, el propio catálogo, etc. (solo en la raíz:
    # los index.html de cada proyecto SÍ se muestran).
    if len(partes) == 1 and ruta in ARCHIVOS_RAIZ_EXCLUIDOS:
        return False

    # Carpetas excluidas y cualquier archivo o carpeta oculta (empieza por ".").
    if any(parte in CARPETAS_EXCLUIDAS or parte.startswith(".") for parte in partes):
        return False

    return Path(ruta).suffix.lower() in EXTENSIONES


def main() -> None:
    raiz = raiz_repositorio()
    destino = Path(sys.argv[1]) if len(sys.argv) > 1 else raiz / "archivos.json"

    rutas = sorted(r for r in archivos_versionados(raiz) if es_visible(r))

    # Misma forma que devolvía la API de GitHub (tree -> path / type), para que
    # el JavaScript del index.html siga funcionando prácticamente igual.
    catalogo = {
        "truncated": False,
        "tree": [{"path": ruta, "type": "blob"} for ruta in rutas],
    }

    # ensure_ascii=False conserva tildes y eñes legibles dentro del JSON.
    destino.write_text(
        json.dumps(catalogo, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Catálogo generado: {destino} ({len(rutas)} archivos)")


if __name__ == "__main__":
    main()
