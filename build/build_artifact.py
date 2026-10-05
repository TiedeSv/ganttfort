"""Builds the Artifact version of Ganttfort from .ai/ganttfort/world.html.

dist/index.html        small shell (title, fonts, three.js from the CDN, app.js)
dist/world.css         style of the world + additions for editing
dist/world-engine.js   the world itself (from world.html, with hooks for editing)
dist/app.js            storage (db), setup, editing
dist/schema.js         English file format <-> internal names
dist/i18n*.js          interface language (English, German)
dist/demo.js           example world "Harbor Town App" (build/examples/demo.js), dates relative to today
dist/themes/*.js       themes
"""
from __future__ import annotations
import re, shutil
from pathlib import Path

HIER = Path(__file__).parent
QUELLE = HIER.parent / "template" / ".ai" / "ganttfort"   # build/ sits next to template/
DIST = HIER / "dist" / "artifact"
html = (QUELLE / "world.html").read_text(encoding="utf-8")

css = html[html.index("<style>") + 7: html.index("</style>")]
markup = html[html.index("<body>") + 6: html.index('<script src="lib/three.min.js">')]
start = html.index("<script>\n(function(){")
engine = html[start + 8: html.rindex("</script>")]


def ersetze(text, alt, neu, anzahl=1):
    n = text.count(alt)
    assert n == anzahl, f"{n}× gefunden statt {anzahl}×: {alt[:80]!r}"
    return text.replace(alt, neu)


E = engine
# Tastenkürzel nicht auslösen, während man in Formularen tippt
E = E.replace('e.target.tagName==="TEXTAREA"', 'EINGABE(e)').replace('e.target.tagName!=="TEXTAREA"', '!EINGABE(e)')
E = ersetze(E, 'const W = window.WELT;', 'const W = window.WELT;\nconst EINGABE=e=>!!(e.target&&e.target.closest&&e.target.closest("input,textarea,select,[contenteditable],.dlg"));\nconst ED=()=>window.WELT_EDIT||null;')
# Architektur-Ansicht (Mermaid, Code-Projekte) gibt es im Artifact nicht
E = ersetze(E, 'addEventListener("keydown",e=>{ if(!EINGABE(e) && e.key.toLowerCase()==="m") setzeAnsicht(ansicht==="welt"?"arch":"welt"); });', '')
# Feld-Panel: Aktionen oben, Notiz statt Hinweis auf /explain
E = ersetze(E, '${f.seit?`<div class="muted">${f.status==="fertig"?"fertig seit":"seit"} ${esc(f.seit)}</div>`:""}</div></div>`+fristBlock(f._ziel)+abhBlock(f);',
               '${f.seit?`<div class="muted">${f.status==="fertig"?"fertig seit":"seit"} ${esc(f.seit)}</div>`:""}</div></div>`+(ED()?ED().feld(f):"")+fristBlock(f._ziel)+abhBlock(f);')
E = ersetze(E, '  if(!Object.keys(e).length) h+=`<p class="muted" style="margin-top:16px">Noch keine Erklärung.',
               '  if(!ED()&&!Object.keys(e).length) h+=`<p class="muted" style="margin-top:16px">Noch keine Erklärung.')
E = ersetze(E, '    ${m.beschreibung?`<p class="lead" style="margin-top:12px">${esc(m.beschreibung)}</p>`:""}',
               '    ${ED()?ED().meilenstein(m):""}${m.beschreibung?`<p class="lead" style="margin-top:12px">${esc(m.beschreibung)}</p>`:""}')
E = ersetze(E, '    <p class="lead">Ein Großpaket hat keine eigene Frist:', '    ${ED()?ED().paket(P):""}<p class="lead">Ein Großpaket hat keine eigene Frist:')
# Aufgaben-Tab: Menü mit direkten Aktionen statt kopierter Befehle, Knopf für neue Aufgabe
E = ersetze(E, '      if(AMENUE===f.id){ const vor=', '      if(AMENUE===f.id&&ED()){ h+=ED().menue(f,d); }\n      else if(AMENUE===f.id){ const vor=')
E = ersetze(E, '  let h=`<h2>Aufgaben</h2><div class="chips">', '  let h=`<div class="kopfzeile-a"><h2>Aufgaben</h2>${ED()?ED().neuKnopf():""}</div><div class="chips">')
# Plan-Hinweise und Texte, die auf Slash-Befehle zeigen
E = ersetze(E, 'function planHinweis(){\n', 'function planHinweis(){\n  if(ED()) return ED().planHinweis();\n')
E = ersetze(E, "'<li class=\"muted\">nichts geplant – <code>/world-plan</code> legt einen Plan an</li>'",
               "(ED()?'<li class=\"muted\">nichts geplant · neue Aufgaben legst du im Tab Aufgaben an</li>':'<li class=\"muted\">nichts geplant – <code>/world-plan</code> legt einen Plan an</li>')")
E = ersetze(E, '  h+=`<h3>Neu seit dem letzten Update</h3>', '  if(ED()) h+=ED().zuletzt(); else h+=`<h3>Neu seit dem letzten Update</h3>')
E = ersetze(E, '${hatCommits?"":" Commits pro Feld trägt der nächste <code>/world-update</code> ein."}', '${hatCommits||ED()?"":" Commits pro Feld trägt der nächste <code>/world-update</code> ein."}')
E = ersetze(E, 'zeitEl.title="Der Zeitraffer braucht Datumsangaben (seit/begonnen). Sie kommen mit dem nächsten /world-update.";',
               'zeitEl.title="Der Zeitraffer braucht Datumsangaben: Er füllt sich, sobald Aufgaben begonnen oder fertig werden.";')
# Tabs: neuer Tab „Projekt“, Verdrahtung der Bearbeiten-Knöpfe
E = ersetze(E, '({heute:paneHeute,aufgaben:paneAufgaben,feld:paneFeld,verlauf:paneVerlauf,inseln:paneInseln,legende:paneLegende})[tab]()',
               '({heute:paneHeute,aufgaben:paneAufgaben,feld:paneFeld,verlauf:paneVerlauf,inseln:paneInseln,legende:paneLegende,projekt:()=>ED()?ED().projekt():""})[tab]()')
E = ersetze(E, 'function verdrahte(){\n', 'function verdrahte(){\n  if(ED()) ED().verdrahte(pane);\n')
# Innenleben für app.js zugänglich machen (vor dem ersten panel())
E = ersetze(E, '/* ---------- Kopf ---------- */',
            'window.__weltIntern={felder,feldNach,regionen,proRegion,MEILENSTEINE,MS_FELDER,PAKETE,ZIELE,KRIT,NACHFOLGER,TYPEN,STATUS,BIOME,TX,lage,epocheBei,phasen,'
            'tag,tagText,tagVon,lokal,kurzDatum,esc,toast,kopiere,waehle,panel,fristVon,statusAm,planZeichnen,alleZeigen,'
            'zeit:()=>ZEIT, heute:()=>D_HEUTE, tab:(t)=>{ if(t){ tab=t; if(LISTE) LISTE_SONDER=(t==="projekt"||t==="legende")?t:null; panel(); } return tab; }, auswahl:()=>auswahl, planOffen:()=>planOffen, setzePlan:(a)=>setzePlan(a), cam:()=>cam};\n'
            '/* ---------- Kopf ---------- */')
# Nach dem Start: app.js darf Auswahl, Tab usw. wiederherstellen
E = ersetze(E, 'baueMarker(); panel(); setzePlan(planOffen); schleife();', 'baueMarker(); panel(); setzePlan(planOffen); schleife(); if(ED()&&ED().bereit) ED().bereit();')
# Frist-Flaggen im Plan ziehbar machen: Zeile + Datum an app.js melden
E = ersetze(E, '        bar+=`<div class="flagge${letzt?"":" alt"}${Z.geerbt?" erbt":""}" style="left:${XD(e.d+1)}px"',
               '        bar+=`<div class="flagge${letzt?"":" alt"}${Z.geerbt?" erbt":""}"${letzt&&!Z.geerbt?` data-zieh="${esc(f.id)}" data-d="${e.d}"`:""} style="left:${XD(e.d+1)}px"')
E = ersetze(E, '      h+=`<div class="raute ${kl}" data-feld="${esc(P.id)}" style=', '      h+=`<div class="raute ${kl}" data-feld="${esc(P.id)}" data-zieh="${esc(P.id)}" data-d="${e.d}" style=')
E = ersetze(E, '  planJetzt();\n}\nfunction planJetzt(){', '  planJetzt(); if(ED()) ED().planGezeichnet(planKoerper,PLAN);\n}\nfunction planJetzt(){')

# Fertig-Zeitpunkt minutengenau (fertig_um): wer nach 16:00 am Entscheidungstag abhakt, rettet das Gebäude nicht mehr
E = ersetze(E, '''  let t=-Infinity, fertig=false;
  for(const f of liste){ if(f.status!=="fertig"&&f.status!=="verworfen") return null;
    const s=tag(f.seit); t=Math.max(t,s==null?-Infinity:s); if(f.status==="fertig") fertig=true; }
  return liste.length?{tag:t,art:fertig?"fertig":"verworfen"}:null;''', '''  let t=-Infinity, ms=-Infinity, fertig=false;
  for(const f of liste){ if(f.status!=="fertig"&&f.status!=="verworfen") return null;
    const s=tag(f.seit); t=Math.max(t,s==null?-Infinity:s); if(f.status==="fertig") fertig=true;
    const u=f.fertig_um?Date.parse(f.fertig_um):NaN; ms=Math.max(ms,!isNaN(u)&&s!=null&&tagVon(u)===s?u:s==null?-Infinity:lokal(s,12)); }
  return liste.length?{tag:t,ms,art:fertig?"fertig":"verworfen"}:null;''')
E = ersetze(E, 'Z.eMs=Z.erledigt?(Z.erledigt.tag===-Infinity?-Infinity:lokal(Z.erledigt.tag,12)):Infinity;', 'Z.eMs=Z.erledigt?(Z.erledigt.tag===-Infinity?-Infinity:Z.erledigt.ms):Infinity;')
E = ersetze(E, 'if(E&&Z.eMs<e.bis&&E.tag<=P.d+1)', 'if(E&&Z.eMs<e.bis&&E.tag<=P.d+1&&Z.eMs<=P.T)')

# Seitenleiste einklappen: nur die Welt sehen (Knopf am Rand der Leiste, Taste P)
SCHON_PANEL = 'panelGriff' in html
if not SCHON_PANEL: E = ersetze(E, 'const PANEL_W=452;', 'const PANEL_BREIT=452; let PANEL_W=lies("welt-panel-zu")==="1"?0:PANEL_BREIT;')
if not SCHON_PANEL: E = ersetze(E, 'groesse(); alleZeigen();', '''function setzePanel(zu){
  PANEL_W=zu?0:PANEL_BREIT; schreib("welt-panel-zu",zu?"1":"0"); document.body.classList.toggle("panel-zu",zu);
  const g=document.getElementById("panelGriff"); if(g){ g.setAttribute("aria-expanded",String(!zu)); g.title=zu?"Seitenleiste zeigen (P)":"Seitenleiste einklappen (P)"; }
  dispatchEvent(new Event("resize"));
}
document.body.classList.toggle("panel-zu",PANEL_W===0);
document.getElementById("panelGriff").addEventListener("click",()=>setzePanel(PANEL_W>0));
addEventListener("keydown",e=>{ if(EINGABE(e)||e.ctrlKey||e.metaKey||e.altKey) return; if(e.key.toLowerCase()==="p") setzePanel(PANEL_W>0); });
groesse(); alleZeigen();''')

markup = ersetze(markup, '<button data-tab="legende">Legende</button>', '<button data-tab="legende">Legende</button>\n    <button data-tab="projekt">Projekt</button>')
markup = ersetze(markup, ' · <kbd>G</kbd> Plan · <kbd>M</kbd> Architektur</div>', ' · <kbd>G</kbd> Plan</div>')
if not SCHON_PANEL: markup = ersetze(markup, '<aside class="panel">', '<aside class="panel">\n  <button type="button" class="panel-griff" id="panelGriff" aria-controls="pane" aria-expanded="true" title="Seitenleiste einklappen (P)"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>')
markup = re.sub(r'<div class="umschalter".*?</div>\n', '', markup, flags=re.S)
markup = re.sub(r'<section id="arch">.*?</section>\n', '', markup, flags=re.S)
assert 'id="arch"' not in markup

# Mermaid-/Architektur-Code braucht Elemente, die es nicht mehr gibt: leere Platzhalter
markup += '<div hidden><div id="umschalter"></div><div id="arch"><div id="arch-text"></div><div id="arch-bild"></div></div></div>\n'

css += (HIER / "src" / "zusatz.css").read_text(encoding="utf-8")

DIST.mkdir(parents=True, exist_ok=True)
shutil.rmtree(DIST); DIST.mkdir(parents=True)
(DIST / "themes").mkdir(exist_ok=True)
(DIST / "world.css").write_text('@charset "utf-8";\n' + css, encoding="utf-8")
(DIST / "world-engine.js").write_text(E, encoding="utf-8")
app = (HIER / "src" / "app.js").read_text(encoding="utf-8").replace("/*MARKUP*/``", "`" + markup.replace("`", "\\`").replace("${", "\\${") + "`")
(DIST / "app.js").write_text(app, encoding="utf-8")
shutil.copy(HIER / "examples" / "demo.js", DIST / "demo.js")
shutil.copy(QUELLE / "themes" / "medieval.js", DIST / "themes" / "medieval.js")
for f in ("schema.js", "i18n.js", "i18n-en.js"):
    shutil.copy(QUELLE / f, DIST / f)
shutil.copy(HIER / "src" / "index.html", DIST / "index.html")
shutil.copy(HIER / "src" / "THIRD_PARTY_NOTICES.md", DIST / "THIRD_PARTY_NOTICES.md")
shutil.copy(HIER / "src" / "LICENSE", DIST / "LICENSE")
print("gebaut:", sorted(str(p.relative_to(DIST)) for p in DIST.rglob("*") if p.is_file()))

# Demo-Welt der Repo-Fassung aus derselben Beispielwelt (eine Quelle: examples/demo.js)
import subprocess, sys
ziele = [QUELLE / "world-demo.js"]
subprocess.run([sys.executable, str(HIER / "build_repo_demo.py"), *map(str, ziele)], check=True)
