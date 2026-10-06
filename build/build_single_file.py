#!/usr/bin/env python3
"""Baut aus dist/ eine einzige HTML-Datei (Ein-Datei-Fassung).

Alles steckt in der Datei: three.js, Motor, App, Thema, Beispielwelt, Stile und die Schriften.
Die Datei lädt nichts aus dem Internet (keine Google Fonts, kein CDN). Gedacht für das Artifact
im claude.ai-Chat (dort ist nur eine Datei erlaubt) und als Download zum lokalen Öffnen.

Aufruf: python3 build_single_file.py [ziel.html]   (Standard: dist/single/ganttfort.html)
"""
import base64, pathlib, re, sys

HIER = pathlib.Path(__file__).resolve().parent
DIST = HIER / "dist" / "artifact"
LIB = HIER.parent / "template" / ".ai" / "ganttfort" / "lib"
THREE = LIB / "three.min.js"
THREE_LIZENZ = LIB / "three-LICENSE.txt"
FONTS = HIER / "src" / "fonts"
ZIEL = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else HIER / "dist" / "single" / "ganttfort.html"

SCHRIFTEN = [  # (Familie, Gewicht, Datei)
    ("Space Grotesk", 500, "space-grotesk-latin-500-normal.woff2"),
    ("Space Grotesk", 600, "space-grotesk-latin-600-normal.woff2"),
    ("Inter", 400, "inter-latin-400-normal.woff2"),
    ("Inter", 500, "inter-latin-500-normal.woff2"),
    ("Inter", 600, "inter-latin-600-normal.woff2"),
    ("JetBrains Mono", 400, "jetbrains-mono-latin-400-normal.woff2"),
    ("JetBrains Mono", 500, "jetbrains-mono-latin-500-normal.woff2"),
    ("Cinzel", 500, "cinzel-latin-500-normal.woff2"),
    ("Cinzel", 700, "cinzel-latin-700-normal.woff2"),
]


def lies(p):
    return pathlib.Path(p).read_text(encoding="utf-8")


def sicher(js):
    """Inhalt darf ein umgebendes <script> nicht vorzeitig schließen."""
    return js.replace("</script", "<\\/script").replace("<!--", "<\\!--")


def kommentar(text):
    return text.replace("--", "- -")


def main():
    html = lies(DIST / "index.html")
    css = lies(DIST / "world.css")
    app = lies(DIST / "app.js")
    motor = lies(DIST / "world-engine.js")
    demo = lies(HIER / "examples" / "demo.js")   # example world "Harbor Town App", not the owner's world
    thema = lies(DIST / "themes" / "medieval.js")
    three = lies(THREE)

    # Schriften nicht mehr von Google laden
    thema = re.sub(r'schrift:\s*"https://fonts\.googleapis\.com[^"]*"', 'schrift:""', thema)
    assert "fonts.googleapis.com" not in thema, "Thema lädt noch Google Fonts"
    faces = "".join(
        f'@font-face{{font-family:"{fam}";font-style:normal;font-weight:{w};font-display:swap;'
        f'src:url(data:font/woff2;base64,{base64.b64encode((FONTS / f).read_bytes()).decode()}) format("woff2")}}\n'
        for fam, w, f in SCHRIFTEN)

    # Lader in app.js: Thema und Motor aus eingebetteten Blöcken statt aus Dateien
    alt_thema = 's.src = "themes/" + datei + ".js"; s.onload = ok; s.onerror = ok; document.head.appendChild(s);'
    neu_thema = ('const q = document.getElementById("gf-theme-" + datei); '
                 'if (q) { s.textContent = q.textContent; document.head.appendChild(s); ok(); } '
                 'else { s.src = "themes/" + datei + ".js"; s.onload = ok; s.onerror = ok; document.head.appendChild(s); }')
    alt_motor = 's.src = "world-engine.js";'
    neu_motor = 's.textContent = document.getElementById("gf-motor").textContent;'
    assert app.count(alt_thema) == 1 and app.count(alt_motor) == 1, "Lader in app.js nicht gefunden"
    app = app.replace(alt_thema, neu_thema).replace(alt_motor, neu_motor)

    # Hülle: externe Verweise raus
    html = re.sub(r'<link rel="preconnect"[^>]*>\n?', "", html)
    html = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>\n?', "", html)
    html = re.sub(r'<link rel="stylesheet" href="fonts/fonts\.css"[^>]*>\n?', "", html)   # faces are inlined below
    html = html.replace('<link rel="stylesheet" href="world.css">', "<style>\n" + faces + css + "\n</style>")
    html = html.replace('<script charset="utf-8" src="three.min.js"></script>',
                        "<script>" + sicher(three) + "</script>")
    html = html.replace('<script charset="utf-8" src="demo.js"></script>', "<script>" + sicher(demo) + "</script>")
    for f in ("schema.js", "i18n-en.js", "i18n.js"):
        html = html.replace(f'<script charset="utf-8" src="{f}"></script>', "<script>" + sicher(lies(DIST / f)) + "</script>")
    bloecke = ('<script type="text/plain" id="gf-theme-medieval">' + sicher(thema) + "</script>\n"
               '<script type="text/plain" id="gf-motor">' + sicher(motor) + "</script>\n")
    html = html.replace('<script charset="utf-8" src="app.js"></script>', bloecke + "<script>" + sicher(app) + "</script>")
    assert 'src="' not in re.sub(r"<script>.*?</script>|<script type=\"text/plain\".*?</script>", "", html, flags=re.S), \
        "noch ein externer Verweis in der Hülle"

    lizenzen = (
        "Ganttfort – single-file version\n\n"
        + lies(HIER / "src" / "LICENSE")
        + "\n\nThird-party components in this file:\n\n"
        "three.js r149 (embedded)\n" + lies(THREE_LIZENZ)
        + "\n\nFonts embedded as data URIs:\n" + lies(FONTS / "fonts-OFL.txt")
    )
    kopf = "<!doctype html>\n<!--\n" + kommentar(lizenzen) + "\n-->\n<meta charset=\"utf-8\">\n"
    ZIEL.parent.mkdir(parents=True, exist_ok=True)
    ZIEL.write_text(kopf + html, encoding="utf-8")
    print(f"single file: {ZIEL} ({ZIEL.stat().st_size/1024/1024:.2f} MB)")


if __name__ == "__main__":
    main()
