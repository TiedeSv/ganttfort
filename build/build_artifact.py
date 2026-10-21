"""Builds the Artifact version of Ganttfort from .ai/ganttfort/world.html.

dist/index.html        small shell (title, local fonts, three.js, app.js) – loads nothing from the network
dist/three.min.js      three.js, dist/fonts/ the fonts (both from template/.ai/ganttfort/lib/)
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
    assert n == anzahl, f"found {n}× instead of {anzahl}×: {alt[:80]!r}"
    return text.replace(alt, neu)


E = engine
# do not trigger keyboard shortcuts while typing in forms
E = E.replace('e.target.tagName==="TEXTAREA"', 'EINGABE(e)').replace('e.target.tagName!=="TEXTAREA"', '!EINGABE(e)')
E = ersetze(E, 'const W = window.WELT;', 'const W = window.WELT;\nconst EINGABE=e=>!!(e.target&&e.target.closest&&e.target.closest("input,textarea,select,[contenteditable],.dlg"));\nconst ED=()=>window.WELT_EDIT||null;')
# the architecture view (Mermaid, code projects) does not exist in the Artifact
E = ersetze(E, 'addEventListener("keydown",e=>{ if(!EINGABE(e) && e.key.toLowerCase()==="m") setzeAnsicht(ansicht==="welt"?"arch":"welt"); });', '')
# tile panel: actions at the top, note instead of the hint to /explain
E = ersetze(E, '${f.seit?`<div class="muted">${f.status==="fertig"?"fertig seit":"seit"} ${esc(f.seit)}</div>`:""}</div></div>`+fristBlock(f._ziel)+abhBlock(f);',
               '${f.seit?`<div class="muted">${f.status==="fertig"?"fertig seit":"seit"} ${esc(f.seit)}</div>`:""}</div></div>`+(ED()?ED().feld(f):"")+fristBlock(f._ziel)+abhBlock(f);')
E = ersetze(E, '  if(!Object.keys(e).length) h+=`<p class="muted" style="margin-top:16px">Noch keine Erklärung.',
               '  if(!ED()&&!Object.keys(e).length) h+=`<p class="muted" style="margin-top:16px">Noch keine Erklärung.')
E = ersetze(E, '    ${m.beschreibung?`<p class="lead" style="margin-top:12px">${esc(m.beschreibung)}</p>`:""}',
               '    ${ED()?ED().meilenstein(m):""}${m.beschreibung?`<p class="lead" style="margin-top:12px">${esc(m.beschreibung)}</p>`:""}')
E = ersetze(E, '    <p class="lead">Ein Großpaket hat keine eigene Frist:', '    ${ED()?ED().paket(P):""}<p class="lead">Ein Großpaket hat keine eigene Frist:')
# tasks tab: menu with direct actions instead of copied commands, button for a new task
E = ersetze(E, '      if(AMENUE===f.id){ const vor=', '      if(AMENUE===f.id&&ED()){ h+=ED().menue(f,d); }\n      else if(AMENUE===f.id){ const vor=')
E = ersetze(E, '  let h=`<h2>Aufgaben</h2><div class="chips">', '  let h=`<div class="kopfzeile-a"><h2>Aufgaben</h2>${ED()?ED().neuKnopf():""}</div><div class="chips">')
# plan hints and texts that point to slash commands
E = ersetze(E, 'function planHinweis(){\n', 'function planHinweis(){\n  if(ED()) return ED().planHinweis();\n')
E = ersetze(E, "'<li class=\"muted\">nichts geplant – <code>/world-plan</code> legt einen Plan an</li>'",
               "(ED()?'<li class=\"muted\">nichts geplant · neue Aufgaben legst du im Tab Aufgaben an</li>':'<li class=\"muted\">nichts geplant – <code>/world-plan</code> legt einen Plan an</li>')")
E = ersetze(E, '  h+=`<h3>Neu seit dem letzten Update</h3>', '  if(ED()) h+=ED().zuletzt(); else h+=`<h3>Neu seit dem letzten Update</h3>')
E = ersetze(E, '${hatCommits?"":" Commits pro Feld trägt der nächste <code>/world-update</code> ein."}', '${hatCommits||ED()?"":" Commits pro Feld trägt der nächste <code>/world-update</code> ein."}')
E = ersetze(E, 'zeitEl.title="Der Zeitraffer braucht Datumsangaben (seit/begonnen). Sie kommen mit dem nächsten /world-update.";',
               'zeitEl.title="Der Zeitraffer braucht Datumsangaben: Er füllt sich, sobald Aufgaben begonnen oder fertig werden.";')
# tabs: new tab "Project", wiring of the edit buttons
E = ersetze(E, '({heute:paneHeute,aufgaben:paneAufgaben,feld:paneFeld,verlauf:paneVerlauf,inseln:paneInseln,legende:paneLegende})[tab]()',
               '({heute:paneHeute,aufgaben:paneAufgaben,feld:paneFeld,verlauf:paneVerlauf,inseln:paneInseln,legende:paneLegende,projekt:()=>ED()?ED().projekt():""})[tab]()')
E = ersetze(E, 'function verdrahte(){\n', 'function verdrahte(){\n  if(ED()) ED().verdrahte(pane);\n')
# make the internals accessible to app.js (before the first panel())
E = ersetze(E, '/* ---------- Header ---------- */',
            'window.__weltIntern={felder,feldNach,regionen,proRegion,MEILENSTEINE,MS_FELDER,PAKETE,ZIELE,KRIT,NACHFOLGER,TYPEN,STATUS,BIOME,TX,lage,epocheBei,phasen,'
            'tag,tagText,tagVon,lokal,kurzDatum,esc,toast,kopiere,waehle,panel,fristVon,statusAm,planZeichnen,alleZeigen,'
            'zeit:()=>ZEIT, heute:()=>D_HEUTE, tab:(t)=>{ if(t){ tab=t; if(LISTE) LISTE_SONDER=(t==="projekt"||t==="legende")?t:null; panel(); } return tab; }, auswahl:()=>auswahl, planOffen:()=>planOffen, setzePlan:(a)=>setzePlan(a), cam:()=>cam};\n'
            '/* ---------- Header ---------- */')
# Nach dem Start: app.js darf Auswahl, Tab usw. wiederherstellen
E = ersetze(E, 'baueMarker(); panel(); setzePlan(planOffen); schleife();', 'baueMarker(); panel(); setzePlan(planOffen); schleife(); if(ED()&&ED().bereit) ED().bereit();')
# make deadline flags in the plan draggable: report row + date to app.js
E = ersetze(E, '        bar+=`<div class="flagge${letzt?"":" alt"}${Z.geerbt?" erbt":""}" style="left:${XD(e.d+1)}px"',
               '        bar+=`<div class="flagge${letzt?"":" alt"}${Z.geerbt?" erbt":""}"${letzt&&!Z.geerbt?` data-zieh="${esc(f.id)}" data-d="${e.d}"`:""} style="left:${XD(e.d+1)}px"')
E = ersetze(E, '      h+=`<div class="raute ${kl}" data-feld="${esc(P.id)}" style=', '      h+=`<div class="raute ${kl}" data-feld="${esc(P.id)}" data-zieh="${esc(P.id)}" data-d="${e.d}" style=')
E = ersetze(E, '  planJetzt();\n}\nfunction planJetzt(){', '  planJetzt(); if(ED()) ED().planGezeichnet(planKoerper,PLAN);\n}\nfunction planJetzt(){')

# completion time to the minute (fertig_um): whoever ticks off after 16:00 on the hand-in day no longer saves the building
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

# collapse the sidebar: see only the world (button at the edge of the sidebar, key P)
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

# Mermaid/architecture code needs elements that no longer exist: empty placeholders
markup += '<div hidden><div id="umschalter"></div><div id="arch"><div id="arch-text"></div><div id="arch-bild"></div></div></div>\n'

css += (HIER / "src" / "zusatz.css").read_text(encoding="utf-8")

DIST.mkdir(parents=True, exist_ok=True)
shutil.rmtree(DIST); DIST.mkdir(parents=True)
(DIST / "themes").mkdir(exist_ok=True)
(DIST / "world.css").write_text('@charset "utf-8";\n' + css, encoding="utf-8")
(DIST / "world-engine.js").write_text(E, encoding="utf-8")
VERSION = (HIER.parent / "VERSION").read_text(encoding="utf-8").strip()
app = (HIER / "src" / "app.js").read_text(encoding="utf-8").replace('/*VERSION*/""', '"' + VERSION + '"').replace("/*MARKUP*/``", "`" + markup.replace("`", "\\`").replace("${", "\\${") + "`")
(DIST / "app.js").write_text(app, encoding="utf-8")
shutil.copy(HIER / "examples" / "demo.js", DIST / "demo.js")
shutil.copy(QUELLE / "themes" / "medieval.js", DIST / "themes" / "medieval.js")
for f in ("schema.js", "i18n.js", "i18n-en.js"):
    shutil.copy(QUELLE / f, DIST / f)
shutil.copy(HIER / "src" / "index.html", DIST / "index.html")
# three.js and fonts travel with the Artifact: no requests to a CDN or Google Fonts
shutil.copy(QUELLE / "lib" / "three.min.js", DIST / "three.min.js")
shutil.copytree(QUELLE / "lib" / "fonts", DIST / "fonts")
shutil.copy(HIER / "src" / "THIRD_PARTY_NOTICES.md", DIST / "THIRD_PARTY_NOTICES.md")
shutil.copy(HIER / "src" / "LICENSE", DIST / "LICENSE")
print("built:", sorted(str(p.relative_to(DIST)) for p in DIST.rglob("*") if p.is_file()))

# demo world of the repo version from the same example world (one source: examples/demo.js)
import subprocess, sys
ziele = [QUELLE / "world-demo.js"]
subprocess.run([sys.executable, str(HIER / "build_repo_demo.py"), *map(str, ziele)], check=True)
