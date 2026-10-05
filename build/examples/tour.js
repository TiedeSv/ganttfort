// Guided tour through the example world: step by step to every feature, the camera follows. English and German texts.
(function () {
  const S_DE = [
    { t: "Willkommen in Gullhaven", x: "Das ist ein erfundenes Projekt: eine App für Fährfahrplan, Tickets und Stadtplan. Jede Aufgabe ist ein Feld, jedes Feld ein Gebäude. Gesteuert wird alles über eine einfache JSON-Datei. Die Oberfläche gibt es auf Englisch und Deutsch.", a: W => { W.alleZeigen(); W.tab("heute"); } },
    { t: "Inseln sind Bereiche", x: "Jede Insel ist ein Bereich des Projekts (App, Server, Daten, Karte, Betrieb, Qualität, Start). Das Biom (Wiese, Fels, Wald, Schnee …) ist nur Optik und hilft beim Wiederfinden.", a: W => { W.alleZeigen(); W.tab("inseln"); } },
    { t: "Gebäude zeigen die Art der Arbeit", x: "Eine fertige Aufgabe ist ein Gebäude. Welches, hängt vom Typ ab: Gehöft = Feature, Schmiede = Bugfix, Steinmetzhütte = Typing, Sternwarte = Analyse … Die ganze Zuordnung steht in der Legende.", a: W => W.waehle("data-model") },
    { t: "Wohnhäuser zeigen das Alter", x: "Je länger eine Aufgabe fertig ist, desto mehr Leute ziehen hin: nach 5, 10 und 20 Tagen 2, 4 und 6 Häuser, ab 20 Tagen eine Dorflinde. Das Projektgerüst hier ist zwei Monate alt.", a: W => W.waehle("scaffold") },
    { t: "Heute fertig", x: "Ganz frisch abgehakt: Das Gebäude steht, noch ohne Nachbarn. Im Panel stehen die Erklärung, ein Code-Beispiel und die geänderten Dateien.", a: W => W.waehle("delay-alert") },
    { t: "Zeppeline verbinden die Infrastruktur", x: "Infrastruktur-Aufgaben werden Zeppelinplätze. Zwischen allen Zeppelinplätzen pendeln Luftschiffe: Diese Teile versorgen das ganze Projekt.", a: W => W.waehle("ci") },
    { t: "Geplant: der Bauplatz", x: "Noch nicht begonnen: Material liegt bereit, der Rohbau ist abgesteckt. Am Inselrand, damit fertige Gebäude in der Mitte bleiben.", a: W => W.waehle("german") },
    { t: "In Arbeit: die Baustelle", x: "Eine begonnene Aufgabe ist eine Baustelle mit Gerüst und Kran. Mit Frist wachsen die Mauern mit der Zeit bis zur Frist, ohne Frist bleiben sie niedrig.", a: W => W.waehle("cache") },
    { t: "Fristen bringen Angreifer: Kundschafter", x: "Eine Frist im Projektplan ruft Angreifer. Einige Tage vorher (höchstens eine Woche) kreisen Kundschafter über der Baustelle. Im Panel siehst du alle Phasen mit Datum.", a: W => W.waehle("live-positions") },
    { t: "Heerlager", x: "Ein bis drei Tage vor der Frist liegt ein Kriegsluftschiff am Inselrand, der Himmel über der Insel färbt sich rot.", a: W => W.waehle("footpaths") },
    { t: "Belagerung", x: "Am Fristtag wird die Baustelle belagert. Diese Aufgabe ist zusätzlich als kritisch markiert.", a: W => W.waehle("accessibility") },
    { t: "Schlacht und Entscheidung um 16:00", x: "Am Tag nach der Frist tobt die Schlacht. Wird die Aufgabe bis 16:00 fertig, ist sie gewonnen. Sonst brennt das Gebäude ab.", a: W => W.waehle("traffic-peak") },
    { t: "Brandruine", x: "Hier wurde die Frist verpasst. Die Ruine glimmt erst, dann wächst sie über Tage zu. Ein Sühnekreuz bleibt für immer. Weitergebaut wird am Inselrand: Die Kamera zeigt den Neubau. Mit „ansehen“ im Panel spielst du den Brand noch einmal ab.", a: W => W.waehle("storm-warning") },
    { t: "Sieg", x: "Am Schlachttag vor 16:00 fertig geworden: Die Angreifer sind abgezogen, das Gebäude steht. Auch hier spielt „ansehen“ im Panel die Schlacht noch einmal ab.", a: W => W.waehle("search") },
    { t: "Frist verschoben", x: "Wird eine Frist vor der Entscheidung verschoben, ziehen die Angreifer ab. Im Panel steht, wann, von wann auf wann und warum.", a: W => W.waehle("read-aloud") },
    { t: "Verworfen", x: "Aufgegebene Aufgaben bleiben als halb gebaute Ruine stehen. Die Mauerhöhe zeigt, wie weit es kam; je länger her, desto mehr wächst zu. Die Smartwatch-App wurde vor 25 Tagen verworfen.", a: W => W.waehle("smartwatch") },
    { t: "Großpaket: Kapelle, Kirche, Kathedrale", x: "Mehrere Aufgaben unter einem Dach werden ein Kirchenbau. Er wächst mit den fertigen Aufgaben: bis 3 eine Kapelle, bis 6 eine Kirche, danach eine Kathedrale. Die Linien zeigen, welche Aufgaben dazugehören.", a: W => W.waehle("pk-timetable-core") },
    { t: "Kleines Paket", x: "Der Ticketverkauf hat erst zwei fertige Abschnitte: noch eine Kapelle.", a: W => W.waehle("pk-ticket-sales") },
    { t: "Meilenstein: die Burg", x: "Ein Meilenstein ist eine Burg. Gehalten (alles rechtzeitig fertig) trägt sie goldene Banner. Der nächste Meilenstein, der Start zum Hafenfest, steht in sechs Tagen an.", a: W => W.waehle("ms-trial-run") },
    { t: "Projektplan", x: "Alle Fristen und Meilensteine als Gantt-Diagramm. Hier entstehen die Angriffswellen: Jede Frist im Plan ist eine Welle. Taste G öffnet und schließt den Plan.", a: W => { W.waehle(null); W.tab("aufgaben"); W.setzePlan(true); } },
    { t: "Zeitraffer und Tagesbericht", x: "Mit dem Regler unten spulst du durch die Projektgeschichte und siehst Baustellen wachsen und Angriffe kommen. Im Tab Heute stehen der Tagesbericht und was gerade ansteht. Viel Spaß beim Erkunden!", a: W => { W.setzePlan(false); W.alleZeigen(); W.tab("heute"); } }
  ];
  const S_EN = [
    { t: "Welcome to Gullhaven", x: "This is a made-up project: an app for the ferry timetable, tickets and a town map. Every task is a tile, every tile a building. Everything is driven by one simple JSON file.", a: W => { W.alleZeigen(); W.tab("heute"); } },
    { t: "Islands are areas", x: "Every island is one area of the project (app, server, data, map, operations, quality, launch). The landscape (pastures, highlands, woodland, snow …) is just looks and helps you find things again.", a: W => { W.alleZeigen(); W.tab("inseln"); } },
    { t: "Buildings show the kind of work", x: "A finished task is a building. Which one depends on the type: farmstead = feature, smithy = bugfix, stonemason's lodge = typing, observatory = research … The full list is in the legend.", a: W => W.waehle("data-model") },
    { t: "Houses show the age", x: "The longer a task has been done, the more people move in: after 5, 10 and 20 days 2, 4 and 6 houses, from 20 days a village lime tree. The project scaffold here is two months old.", a: W => W.waehle("scaffold") },
    { t: "Done today", x: "Just ticked off: the building stands, still without neighbours. The panel shows the explanation, a code example and the changed files.", a: W => W.waehle("delay-alert") },
    { t: "Zeppelins connect the infrastructure", x: "Infrastructure tasks become zeppelin fields. Airships travel between all zeppelin fields: these parts supply the whole project.", a: W => W.waehle("ci") },
    { t: "Planned: the building plot", x: "Not started yet: material is ready, the shell is staked out. At the island edge, so finished buildings stay in the middle.", a: W => W.waehle("german") },
    { t: "In progress: the building site", x: "A started task is a building site with scaffolding and a crane. With a deadline the walls grow over time until the deadline, without one they stay low.", a: W => W.waehle("cache") },
    { t: "Deadlines bring attackers: scouts", x: "A deadline in the project plan calls attackers. A few days before (a week at most) scouts circle over the building site. The panel lists every phase with its date.", a: W => W.waehle("live-positions") },
    { t: "War camp", x: "One to three days before the deadline a war airship lies at the island edge, and the sky over the island turns red.", a: W => W.waehle("footpaths") },
    { t: "Siege", x: "On the due day the building site is under siege. This task is also marked as critical.", a: W => W.waehle("accessibility") },
    { t: "Battle and decision at 16:00", x: "On the day after the deadline the battle rages. If the task is done by 16:00, it is won. Otherwise the building burns down.", a: W => W.waehle("traffic-peak") },
    { t: "Burned ruin", x: "Here the deadline was missed. The ruin smoulders first, then overgrows over the days. A wayside cross stays forever. Work goes on at the island edge: the camera shows the rebuild. \u201creplay\u201d in the panel plays the fire again.", a: W => W.waehle("storm-warning") },
    { t: "Victory", x: "Done on the day of the battle before 16:00: the attackers withdrew, the building stands. Here too, \u201creplay\u201d in the panel plays the battle again.", a: W => W.waehle("search") },
    { t: "Deadline moved", x: "If a deadline is moved before the decision, the attackers withdraw. The panel shows when, from when to when and why.", a: W => W.waehle("read-aloud") },
    { t: "Dropped", x: "Abandoned tasks stay as half-built ruins. The wall height shows how far it got; the longer ago, the more it overgrows. The smartwatch app was dropped 25 days ago.", a: W => W.waehle("smartwatch") },
    { t: "Large package: chapel, church, cathedral", x: "Several tasks under one roof become a church building. It grows with the finished tasks: up to 3 a chapel, up to 6 a church, then a cathedral. The lines show which tasks belong to it.", a: W => W.waehle("pk-timetable-core") },
    { t: "Small package", x: "Ticket sales has only two finished stages so far: still a chapel.", a: W => W.waehle("pk-ticket-sales") },
    { t: "Milestone: the castle", x: "A milestone is a castle. Held (everything done in time) it carries golden banners. The next milestone, the launch at the harbor festival, is six days away.", a: W => W.waehle("ms-trial-run") },
    { t: "Project plan", x: "All deadlines and milestones as a Gantt chart. This is where the attack waves come from: every deadline in the plan is one wave. The G key opens and closes the plan.", a: W => { W.waehle(null); W.tab("aufgaben"); W.setzePlan(true); } },
    { t: "Time-lapse and report", x: "With the slider at the bottom you scrub through the project's history and watch building sites grow and attacks come. The Status tab shows the report and what is coming up. Have fun exploring!", a: W => { W.setzePlan(false); W.alleZeigen(); W.tab("heute"); } }
  ];
  const DE = window.GF_LANG && window.GF_LANG() === "de", S = DE ? S_DE : S_EN;
  const TXT = DE ? { close: "Rundgang schließen", back: "Zurück", next: "Weiter", done: "Fertig", tour: "Rundgang" }
                 : { close: "Close the tour", back: "Back", next: "Next", done: "Done", tour: "Tour" };
  const css = `.rg{position:fixed;left:16px;top:150px;z-index:50;width:min(360px,calc(100vw - 32px));background:rgba(16,22,30,.94);border:1px solid rgba(232,184,90,.45);border-radius:12px;padding:14px 16px 12px;color:#e6edf5;font:14px/1.45 Inter,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.45);backdrop-filter:blur(6px)}
.rg h4{margin:0 0 6px;font:600 16px/1.3 "Space Grotesk",Inter,sans-serif;color:#f0cf86;padding-right:22px}.rg p{margin:0 0 12px;color:#c9d3df}
.rg .rgz{display:flex;align-items:center;gap:8px}.rg .rgn{flex:1;font:12px "JetBrains Mono",monospace;color:#8b98a9}
.rg button{font:inherit;font-size:13px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#e6edf5;padding:5px 12px;cursor:pointer}
.rg button.h{background:#e8b85a;border-color:#e8b85a;color:#1a1408;font-weight:600}.rg button:disabled{opacity:.35;cursor:default}
.rg .rgx{position:absolute;top:8px;right:8px;border:0;background:none;padding:4px 8px;color:#8b98a9;font-size:16px}
.rgauf{position:fixed;left:16px;top:150px;z-index:50;font:600 13px Inter,sans-serif;background:#e8b85a;color:#1a1408;border:0;border-radius:999px;padding:7px 14px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.4)}
.rg .rgbalken{height:3px;background:rgba(255,255,255,.08);border-radius:2px;margin:0 0 10px;overflow:hidden}.rg .rgbalken i{display:block;height:100%;background:#e8b85a}
@media (max-width:700px){.rg,.rgauf{top:auto;bottom:16px}}`;
  let i = 0, box, auf;
  function W() { return window.__weltIntern; }
  function zeig() {
    const s = S[i];
    box.innerHTML = `<button class="rgx" title="${TXT.close}" aria-label="${TXT.close}" data-roh>✕</button><div class="rgbalken"><i style="width:${(i + 1) / S.length * 100}%"></i></div><h4>${s.t}</h4><p>${s.x}</p>
      <div class="rgz"><span class="rgn">${i + 1} / ${S.length}</span><button data-r="-1" ${i ? "" : "disabled"}>${TXT.back}</button><button class="h" data-r="1">${i < S.length - 1 ? TXT.next : TXT.done}</button></div>`;
    try { s.a(W()); } catch (e) { console.warn("Tour:", e); }
  }
  function start() {
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    box = document.createElement("div"); box.className = "rg"; box.setAttribute("data-roh", ""); document.body.appendChild(box);
    auf = document.createElement("button"); auf.className = "rgauf"; auf.textContent = TXT.tour; auf.setAttribute("data-roh", ""); auf.hidden = true; document.body.appendChild(auf);
    box.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return;
      if (b.classList.contains("rgx")) { box.hidden = true; auf.hidden = false; return; }
      const r = +b.dataset.r; if (r > 0 && i === S.length - 1) { box.hidden = true; auf.hidden = false; i = 0; return; }
      i = Math.max(0, Math.min(S.length - 1, i + r)); zeig(); });
    auf.addEventListener("click", () => { box.hidden = false; auf.hidden = true; zeig(); });
    zeig();
  }
  (function warte(n) { if (W() && W().waehle && !document.getElementById("lade")?.offsetParent) return setTimeout(start, 300); if (n > 200) return; setTimeout(() => warte(n + 1), 150); })(0);
})();
