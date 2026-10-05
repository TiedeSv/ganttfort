/* =====================================================================================
   Ganttfort als Artifact: Speicher, Einrichtung und Bearbeiten.
   Die Welt selbst (welt-engine.js) liest window.WELT und ruft window.WELT_EDIT für Knöpfe und Formulare.

   Gespeichert wird genau ein Dokument:  project/world  = { meta, regions, tasks, milestones, packages, log, report, rev }
   im englischen Dateiformat (schema.js). Intern arbeiten App und Welt mit den internen Namen (GF_FORMAT.toInternal/toEnglish).
   Regeln, die hier durchgesetzt werden (und die auch Claude beim Schreiben einhält):
   · Eine Frist wird nie still geändert: Jede Verschiebung hängt {am, von, nach, grund} an „verschoben“ an.
   · Einträge in „verschoben“ und Meilensteine werden nie gelöscht.
   · Fertig und verworfen gelten ab jetzt (seit = heute, fertig_um = Uhrzeit), nicht rückwirkend.
   ===================================================================================== */
(async function(){
"use strict";
const DOC = "project/world";
const F = window.GF_FORMAT;
const intern = w => F.toInternal(w).world, englisch = w => F.toEnglish(w).world;
const MARKUP = /*MARKUP*/``;
const lade = document.getElementById("lade");
const ladeText = t => { const el = document.getElementById("ladeText"); if (el) el.textContent = window.GF_T ? GF_T(t) : t; };

// ---------- kleine Helfer ----------
const pad = n => String(n).padStart(2, "0");
const datumText = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const heute = () => datumText(new Date());
const plusTage = (s, n) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return datumText(d); };
const istDatum = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + "T12:00:00"));
const kurz = s => istDatum(s) ? new Date(s + "T12:00:00").toLocaleDateString(GF_LOCALE(), { weekday: "short", day: "2-digit", month: "2-digit" }) : String(s || "");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const klon = o => JSON.parse(JSON.stringify(o));
const slug = t => String(t || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "eintrag";
const neueId = (t, vergeben) => { let b = slug(t), id = b, i = 2; while (vergeben.has(id)) id = b + "-" + i++; return id; };
const merke = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const hole = k => { try { const v = sessionStorage.getItem(k); sessionStorage.removeItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };

// ---------- Arbeitsarten: allgemeine Namen für die Gebäudetypen ----------
const ARTEN = {
  feature:     { name: "Erstellen",     sinn: "Etwas Neues entsteht: ein Ergebnis, das es vorher nicht gab." },
  doku:        { name: "Schreiben",     sinn: "Text, Bericht, Kapitel, Protokoll: Wissen wird festgehalten." },
  analyse:     { name: "Recherche",     sinn: "Etwas herausfinden, lesen, vergleichen, noch nichts bauen." },
  api:         { name: "Absprache",     sinn: "Mit anderen klären: Termin, Abstimmung, Freigabe, Anfrage." },
  test:        { name: "Prüfen",        sinn: "Kontrollieren, gegenlesen, testen, abnehmen." },
  bugfix:      { name: "Korrigieren",   sinn: "Etwas Kaputtes oder Falsches in Ordnung bringen." },
  refactor:    { name: "Überarbeiten",  sinn: "Umbauen und aufräumen, ohne dass sich das Ziel ändert." },
  infra:       { name: "Grundlagen",    sinn: "Vorbereitung, Werkzeuge, Ordnung: alles, worauf der Rest aufbaut. Wird ein Zeppelinplatz: Luftschiffe fliegen zwischen allen Plätzen hin und her, auch zu anderen Inseln." },
  performance: { name: "Verbessern",    sinn: "Schneller, günstiger, schöner: etwas Vorhandenes besser machen." },
  probe:       { name: "Ausprobieren",  sinn: "Ein Versuch, ein Prototyp, ein Probelauf." },
  pipeline:    { name: "Ablauf",        sinn: "Wiederkehrende Abläufe, Sammeln und Auswerten von Daten." },
  typing:      { name: "Ordnen",        sinn: "Formalien, Struktur, Vorlagen, Formulare." },
  handoff:     { name: "Übergabe",      sinn: "Abgeben, einreichen, verschicken, an jemanden übergeben." },
  sonst:       { name: "Sonstiges",     sinn: "Alles, was in keine andere Art passt." }
};
const ART_REIHE = Object.keys(ARTEN);
const THEMEN = { mittelalter: "Mittelalter", scifi: "Sci-Fi (Kolonie)" };
const BIOM_REIHE = ["wiese", "wald", "steppe", "fels", "sand", "schnee", "vulkan"];

// ---------- Oberfläche aufbauen ----------
document.body.insertAdjacentHTML("afterbegin", MARKUP);

// ---------- Speicher ----------
ladeText("Speicher wird verbunden …");
const cl = window.claude;
let db = null, nutzer = null, besitzer = false;
try { db = cl && cl.use ? await cl.use("db") : null; } catch (e) { db = null; }
try { nutzer = cl && cl.use ? await cl.use("user") : null; } catch (e) { nutzer = null; }
try { besitzer = nutzer ? !!(await nutzer.isOwner()) : false; } catch (e) { besitzer = false; }
let schreibRecht = null;
try { schreibRecht = nutzer && nutzer.can ? await nutzer.can("data.write") : null; } catch (e) { schreibRecht = null; }
const darfWohl = besitzer || schreibRecht === true;

let ROH = null;                       // gespeicherter Stand, unverändert
if (db) {
  ladeText("Welt wird geladen …");
  for (let versuch = 0; versuch < 2 && ROH === null; versuch++) {
    try { const s = await db.doc(DOC).get(); ROH = s.exists ? (s.data() || null) : false; if (ROH) { if (F.isOldFormat(ROH)) ROH = false; else ROH = intern(ROH); } }
    catch (e) { if (versuch) ROH = false; else await new Promise(r => setTimeout(r, 400 + Math.random() * 400)); }
  }
  if (ROH === false) ROH = null;
}
// Einmaliger Umzug aus der deutschen Fassung: Dort lag die Welt im Dokument „projekt/welt“ im alten Format.
// Das alte Format entspricht genau den internen Namen, also genügt englisch(). Das alte Dokument bleibt als Sicherung liegen.
const ALT_DOC = "projekt/welt";
let UMGEZOGEN = false;
if (db && ROH === null && darfWohl) {
  try {
    const s = await db.doc(ALT_DOC).get(), alt = s.exists ? s.data() : null;
    if (alt && F.isOldFormat(alt)) {
      alt.meta = alt.meta || {}; if (!alt.meta.lang) alt.meta.lang = "de";   // alte Welten sind deutsch geschrieben
      alt.rev = (alt.rev || 0) + 1;
      const neu = englisch(alt);
      await db.doc(DOC).set(neu);
      ROH = intern(neu); UMGEZOGEN = true;
    }
  } catch (e) { /* kein altes Dokument oder kein Zugriff: dann beginnt die Einrichtung wie bisher */ }
}
if (ROH) ROH = klon(ROH);

// eigen = echte Welt · neu = Besitzer, noch keine Welt · fremd = jemand anderes öffnet den Link · ohne = kein Speicher
const MODUS = ROH ? "eigen" : db && darfWohl ? "neu" : db ? "fremd" : "ohne";
const DARF = MODUS === "eigen" && darfWohl;
const DATEN = ROH ? klon(ROH) : intern(window.DEMO_WORLD());
DATEN.meta = DATEN.meta || {};
DATEN.meta.stand = heute();          // die Welt ist live: Sie kennt den Stand von jetzt
GF_I18N.protect(englisch(DATEN)); GF_I18N.start(GF_I18N.langFrom(DATEN));
window.WELT = DATEN;

// ---------- Thema und Arbeitsarten ----------
const thema = DATEN.meta.thema;
if (thema && thema !== "scifi" && /^[\w-]+$/.test(thema)) {
  ladeText("Thema wird geladen …");
  const datei = ((window.GF_SCHEMA.values || {})["meta.thema"] || {})[thema] || thema;
  await new Promise(ok => { const s = document.createElement("script"); s.charset = "utf-8"; s.src = "themes/" + datei + ".js"; s.onload = ok; s.onerror = ok; document.head.appendChild(s); });
}
window.THEMA = window.THEMA || {};
const eigeneArten = DATEN.meta.arbeitsarten || {};
window.THEMA.typen = window.THEMA.typen || {};
ART_REIHE.forEach(k => {
  const n = eigeneArten[k];
  window.THEMA.typen[k] = Object.assign({}, window.THEMA.typen[k] || {}, { name: (typeof n === "string" && n.trim()) || ARTEN[k].name, sinn: ARTEN[k].sinn });
});

// ---------- Regeln (Prüfung vor jedem Speichern) ----------
const STATUS_OK = ["fertig", "in_arbeit", "geplant", "verworfen"];
function pruefe(w) {
  const f = [];
  const rIds = (w.regionen || []).map(r => r.id);
  if (new Set(rIds).size !== rIds.length) f.push("Zwei Sektoren haben dieselbe id.");
  (w.regionen || []).forEach(r => { if (!r.id || !r.name) f.push("Ein Sektor hat keinen Namen."); if (r.biom && !BIOM_REIHE.includes(r.biom)) f.push(`Sektor ${r.name}: unbekannte Landschaft ${r.biom}.`); });
  const ids = new Set();
  const frist = (wer, o, key) => {
    if (o[key] != null && !istDatum(o[key])) f.push(`${wer}: ${key} ist kein Datum.`);
    const v = o.verschoben; if (v == null) return;
    if (!Array.isArray(v)) { f.push(`${wer}: verschoben muss eine Liste sein.`); return; }
    let vorher = "";
    v.forEach((e, i) => {
      if (!e || !istDatum(e.am) || !istDatum(e.von) || !istDatum(e.nach)) { f.push(`${wer}: verschoben[${i}] braucht am, von, nach.`); return; }
      if (e.am < vorher) f.push(`${wer}: Verschiebungen müssen in zeitlicher Reihenfolge stehen.`); vorher = e.am;
      if (i && v[i - 1].nach !== e.von) f.push(`${wer}: verschoben[${i}].von passt nicht zur Verschiebung davor.`);
    });
    if (v.length && o[key] && v[v.length - 1].nach !== o[key]) f.push(`${wer}: ${key} muss dem letzten verschoben.nach entsprechen.`);
  };
  (w.felder || []).forEach(x => {
    const wer = `Aufgabe „${x.titel || x.id}“`;
    if (!x.id) f.push("Eine Aufgabe hat keine id."); else if (ids.has(x.id)) f.push(`${wer}: id doppelt.`); ids.add(x.id);
    if (!x.titel) f.push(`${wer}: Titel fehlt.`);
    if (!rIds.includes(x.region)) f.push(`${wer}: Sektor ${x.region} gibt es nicht.`);
    if (!ARTEN[x.typ]) f.push(`${wer}: Art ${x.typ} unbekannt.`);
    if (!STATUS_OK.includes(x.status)) f.push(`${wer}: Status ${x.status} unbekannt.`);
    ["seit", "begonnen", "plan_start"].forEach(k => { if (x[k] != null && !istDatum(x[k])) f.push(`${wer}: ${k} ist kein Datum.`); });
    frist(wer, x, "faellig");
  });
  (w.felder || []).forEach(x => (x.nach || []).forEach(v => { if (!ids.has(v)) f.push(`Aufgabe „${x.titel}“ wartet auf ${v}, das gibt es nicht.`); }));
  const ms = new Set();
  (w.meilensteine || []).forEach(m => {
    const wer = `Meilenstein „${m.titel || m.id}“`;
    if (!m.id || ms.has(m.id)) f.push(`${wer}: id fehlt oder doppelt.`); ms.add(m.id);
    if (!istDatum(m.datum)) f.push(`${wer}: Datum fehlt.`);
    (m.felder || []).forEach(id => { if (!ids.has(id)) f.push(`${wer}: Aufgabe ${id} gibt es nicht.`); });
    frist(wer, m, "datum");
  });
  (w.pakete || []).forEach(p => (p.felder || []).forEach(id => { if (!ids.has(id)) f.push(`Großpaket „${p.titel}“: Aufgabe ${id} gibt es nicht.`); }));
  return f;
}
// Fristen verschiebt nur der Mensch, und jede Verschiebung bleibt sichtbar
function pruefeFristtreue(alt, neu) {
  const f = [];
  const vergl = (wer, a, b, key) => {
    const va = a.verschoben || [], vb = b.verschoben || [];
    if (JSON.stringify(vb.slice(0, va.length)) !== JSON.stringify(va)) f.push(`${wer}: Frühere Verschiebungen wurden geändert oder gelöscht. Die Geschichte bleibt stehen.`);
    if (a[key] && !b[key]) f.push(`${wer}: Die Frist wurde entfernt. Eine Frist verschwindet nicht, sie wird höchstens verschoben.`);
    else if (a[key] && b[key] && a[key] !== b[key] && !vb.slice(va.length).some(e => e && e.von === a[key] && e.nach === b[key]))
      f.push(`${wer}: Frist ${a[key]} → ${b[key]} ohne Eintrag in verschoben.`);
  };
  const af = {}; (alt.felder || []).forEach(x => af[x.id] = x);
  (neu.felder || []).forEach(x => { if (af[x.id]) vergl(`Aufgabe „${x.titel}“`, af[x.id], x, "faellig"); });
  const nf = new Set((neu.felder || []).map(x => x.id));
  (alt.felder || []).forEach(x => { if (!nf.has(x.id) && (x.faellig || (x.verschoben || []).length) && x.angelegt !== heute()) f.push(`Aufgabe „${x.titel}“ hat eine Frist und kann nicht gelöscht werden. Verwirf sie stattdessen.`); });
  const nm = {}; (neu.meilensteine || []).forEach(m => nm[m.id] = m);
  (alt.meilensteine || []).forEach(m => {
    if (!nm[m.id]) { if (m.angelegt !== heute()) f.push(`Meilenstein „${m.titel}“ wurde gelöscht. Meilensteine bleiben, auch verlorene.`); }
    else vergl(`Meilenstein „${m.titel}“`, m, nm[m.id], "datum");
  });
  return f;
}

// ---------- Speichern ----------
let speichertGerade = false;
async function speichere(neu, notiz) {
  if (!DARF || !db) { zeigeHinweis("Diese Welt kann hier nicht gespeichert werden."); return false; }
  if (speichertGerade) return false;
  neu.meta = neu.meta || {}; neu.meta.stand = heute();
  if (notiz) { neu.chronik = (neu.chronik || []).concat([{ datum: heute(), text: notiz }]).slice(-200); }
  const fehler = pruefe(neu).concat(pruefeFristtreue(ROH || {}, neu));
  if (fehler.length) { zeigeFehler(fehler); return false; }
  neu.rev = (ROH && ROH.rev || 0) + 1;
  speichertGerade = true;
  try { await db.doc(DOC).set(englisch(neu)); }
  catch (e) {
    speichertGerade = false;
    const code = e && e.code;
    zeigeFehler([code === "quota_exceeded" ? "Der Speicher ist voll. Lösch alte verworfene Aufgaben oder lass Claude die Chronik kürzen." :
      code === "invalid_argument" ? "Das Speichern wurde abgelehnt (keine Schreibrechte oder Welt zu groß)." : "Speichern hat nicht geklappt. Versuch es gleich noch einmal."]);
    return false;
  }
  neuLaden();
  return true;
}
function neuLaden(ui) {
  const I = window.__weltIntern;
  if (ui) merke("welt-ui", ui); else if (I) merke("welt-ui", { tab: I.tab(), auswahl: I.auswahl(), plan: I.planOffen(), scroll: (document.getElementById("pane") || {}).scrollTop || 0 });
  try { if (I) sessionStorage.setItem("welt-kamera", JSON.stringify(I.cam().ziel)); } catch (e) {}
  schliesseDialog();
  lade.hidden = false; ladeText("Welt wird neu gebaut …");
  setTimeout(() => location.reload(), 30);
}
function bearbeite(fn, notiz) { const neu = klon(ROH); if (fn(neu) === false) return; return speichere(neu, notiz); }

// ---------- Dialoge ----------
let dlg = null;
function dialog(titel, inhalt, knoepfe, beimOeffnen) {
  schliesseDialog();
  const hg = document.createElement("div"); hg.className = "dlg-hg";
  hg.innerHTML = `<form class="dlg" novalidate><div class="dlg-kopf"><h2>${titel}</h2><button type="button" class="dlg-x" data-dlg="zu" aria-label="Schließen">✕</button></div>
    <div class="dlg-inhalt">${inhalt}</div><div class="dlg-fehler" hidden></div><div class="dlg-fuss">${knoepfe}</div></form>`;
  document.body.appendChild(hg); dlg = hg;
  const form = hg.querySelector("form");
  ["keydown", "keyup"].forEach(t => hg.addEventListener(t, e => { e.stopPropagation(); if (e.key === "Escape") schliesseDialog(); }));
  hg.addEventListener("pointerdown", e => { if (e.target === hg) schliesseDialog(); });
  hg.addEventListener("wheel", e => e.stopPropagation());
  hg.querySelectorAll("[data-dlg=zu]").forEach(b => b.onclick = schliesseDialog);
  if (beimOeffnen) beimOeffnen(form);
  const erstes = form.querySelector("input:not([type=hidden]):not([type=checkbox]),textarea,select"); if (erstes) setTimeout(() => erstes.focus(), 30);
  return form;
}
let neuNachDialog = false;
function schliesseDialog() { if (dlg) { dlg.remove(); dlg = null; } if (neuNachDialog) { neuNachDialog = false; neuLaden(); } }
function zeigeFehler(liste) {
  const box = dlg && dlg.querySelector(".dlg-fehler");
  if (box) { box.hidden = false; box.innerHTML = liste.map(esc).join("<br>"); box.scrollIntoView({ block: "nearest" }); }
  else zeigeHinweis(liste.join(" "));
}
function zeigeHinweis(t) { const I = window.__weltIntern; if (I) I.toast(t); }
const wert = (form, name) => { const el = form.elements[name]; return el ? String(el.value || "").trim() : ""; };
const haken = (form, name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(i => i.value);

function optionen(liste, gewaehlt) { return liste.map(([v, t]) => `<option value="${esc(v)}"${v === gewaehlt ? " selected" : ""}>${esc(t)}</option>`).join(""); }
function sektorOptionen(w, g) { return optionen((w.regionen || []).map(r => [r.id, r.name]), g); }
function artOptionen(g) {
  const T = (window.__weltIntern || {}).TYPEN || window.THEMA.typen;
  return optionen(ART_REIHE.filter(k => !(T[k] && T[k].gesperrt) || k === g).map(k => [k, (T[k] && T[k].name || ARTEN[k].name) + (T[k] && T[k].gebaeude ? " · " + T[k].gebaeude : "")]), g);
}
function aufgabenHaken(w, name, gewaehlt, ohne) {
  const liste = (w.felder || []).filter(x => x.id !== ohne && x.status !== "verworfen");
  if (!liste.length) return `<p class="muted">Noch keine anderen Aufgaben.</p>`;
  const reg = {}; (w.regionen || []).forEach(r => reg[r.id] = r.name);
  return `<input type="search" class="hakensuche" placeholder="Aufgaben filtern" aria-label="Aufgaben filtern"><div class="haken">${liste
    .sort((a, b) => (a.status === "fertig") - (b.status === "fertig") || String(a.titel).localeCompare(String(b.titel)))
    .map(x => `<label data-such="${esc((x.titel + " " + (reg[x.region] || "")).toLowerCase())}"><input type="checkbox" name="${name}" value="${esc(x.id)}"${gewaehlt.includes(x.id) ? " checked" : ""}><span>${esc(x.titel)}</span><small>${esc(reg[x.region] || "")}${x.status === "fertig" ? " · fertig" : ""}</small></label>`).join("")}</div>`;
}
function hakenSuche(form) {
  form.querySelectorAll(".hakensuche").forEach(s => s.addEventListener("input", () => {
    const q = s.value.toLowerCase(); s.nextElementSibling.querySelectorAll("label").forEach(l => l.hidden = !!q && !l.dataset.such.includes(q));
  }));
}

// ---------- Aufgabe anlegen / bearbeiten ----------
function paketVon(w, id) { return (w.pakete || []).find(p => (p.felder || []).includes(id)); }
function msVon(w, id) { return (w.meilensteine || []).find(m => (m.felder || []).includes(id)); }
function darfLoeschen(x) { return x.angelegt === heute() || (!x.faellig && !(x.verschoben || []).length && x.status === "geplant"); }

function aufgabeDialog(id, vorgabe) {
  const w = ROH, x = id ? w.felder.find(f => f.id === id) : null;
  if (id && !x) return;
  const v = Object.assign({ region: (w.regionen[0] || {}).id, typ: "feature", status: "geplant" }, vorgabe || {});
  const pk = x ? paketVon(w, x.id) : null, ms = x ? msVon(w, x.id) : null;
  const h = heute();
  const fristFeld = x && x.faellig
    ? `<div class="feld"><span class="lbl">Frist</span><div class="zeile"><b>${esc(kurz(x.faellig))}</b><button type="button" class="mini" data-dlg="frist">Frist verschieben …</button></div></div>`
    : `<label class="feld"><span class="lbl">Frist <small>(optional, frühestens heute)</small></span><input type="date" name="faellig" min="${h}" value="${esc(v.faellig || "")}"></label>`;
  const inhalt = `
    <label class="feld"><span class="lbl">Titel</span><input name="titel" required maxlength="120" value="${esc(x ? x.titel : v.titel || "")}" placeholder="Was ist zu tun?"></label>
    <div class="spalten">
      <label class="feld"><span class="lbl">Sektor</span><select name="region">${sektorOptionen(w, x ? x.region : v.region)}</select></label>
      <label class="feld"><span class="lbl">Art · Gebäude</span><select name="typ">${artOptionen(x ? x.typ : v.typ)}</select></label>
    </div>
    ${x ? "" : `<div class="feld"><span class="lbl">Stand</span><div class="wahl">${[["geplant", "Geplant"], ["in_arbeit", "In Arbeit"], ["fertig", "Schon fertig"]].map(([k, t]) =>
      `<label><input type="radio" name="status" value="${k}"${v.status === k ? " checked" : ""}>${t}</label>`).join("")}</div></div>`}
    <div class="spalten">
      <label class="feld"><span class="lbl">Geplanter Beginn <small>(optional)</small></span><input type="date" name="plan_start" value="${esc(x ? x.plan_start || "" : v.plan_start || "")}"></label>
      ${fristFeld}
    </div>
    <div class="spalten">
      <label class="feld"><span class="lbl">Großpaket</span><select name="paket"><option value="">keins</option>${optionen((w.pakete || []).map(p => [p.id, p.titel]), pk ? pk.id : v.paket || "")}</select></label>
      <label class="feld"><span class="lbl">Meilenstein</span><select name="ms"><option value="">keiner</option>${optionen((w.meilensteine || []).map(m => [m.id, m.titel + " · " + kurz(m.datum)]), ms ? ms.id : v.ms || "")}</select></label>
    </div>
    <div class="feld"><span class="lbl">Wartet auf <small>(Vorgänger)</small></span>${aufgabenHaken(w, "nach", x ? x.nach || [] : [], x && x.id)}</div>
    <label class="feld"><span class="lbl">Notiz</span><textarea name="notiz" rows="3" maxlength="4000" placeholder="Worauf du achten willst, Links, Absprachen …">${esc(x ? x.notiz || "" : "")}</textarea></label>`;
  const knoepfe = `${x && darfLoeschen(x) ? `<button type="button" class="knopf gefahr" data-dlg="loeschen">Löschen</button>` : ""}<span class="platz"></span>
    <button type="button" class="knopf" data-dlg="zu">Abbrechen</button><button type="submit" class="knopf haupt">${x ? "Speichern" : "Anlegen"}</button>`;
  const form = dialog(x ? "Aufgabe bearbeiten" : "Neue Aufgabe", inhalt, knoepfe, hakenSuche);
  const fb = form.querySelector("[data-dlg=frist]"); if (fb) fb.onclick = () => fristDialog("feld", x.id);
  const lb = form.querySelector("[data-dlg=loeschen]"); if (lb) lb.onclick = () => {
    if (lb.dataset.sicher) return bearbeite(n => {
      n.felder = n.felder.filter(f => f.id !== x.id);
      n.felder.forEach(f => { if (f.nach) f.nach = f.nach.filter(v => v !== x.id); });
      (n.pakete || []).forEach(p => p.felder = (p.felder || []).filter(v => v !== x.id));
      (n.meilensteine || []).forEach(m => m.felder = (m.felder || []).filter(v => v !== x.id));
    });
    lb.dataset.sicher = 1; lb.textContent = "Wirklich löschen?";
  };
  form.onsubmit = e => {
    e.preventDefault();
    const titel = wert(form, "titel"); if (!titel) return zeigeFehler(["Gib der Aufgabe einen Titel."]);
    const faellig = wert(form, "faellig"), plan_start = wert(form, "plan_start");
    if (faellig && faellig < heute()) return zeigeFehler(["Eine neue Frist liegt frühestens heute."]);
    if (faellig && plan_start && plan_start > faellig) return zeigeFehler(["Der Beginn liegt nach der Frist."]);
    const paket = wert(form, "paket"), msId = wert(form, "ms"), nach = haken(form, "nach");
    bearbeite(n => {
      let f;
      if (x) f = n.felder.find(q => q.id === x.id);
      else {
        f = { id: neueId(titel, new Set(n.felder.map(q => q.id))), angelegt: heute() };
        const st = form.querySelector("input[name=status]:checked"); f.status = st ? st.value : "geplant";
        if (f.status === "in_arbeit") f.begonnen = heute();
        if (f.status === "fertig") { f.seit = heute(); f.fertig_um = new Date().toISOString(); }
        n.felder.push(f);
      }
      f.titel = titel; f.region = wert(form, "region"); f.typ = wert(form, "typ");
      if (plan_start) f.plan_start = plan_start; else delete f.plan_start;
      if (faellig) f.faellig = faellig;
      if (nach.length) f.nach = nach; else delete f.nach;
      const notiz = wert(form, "notiz"); if (notiz) f.notiz = notiz; else delete f.notiz;
      (n.pakete || []).forEach(p => { p.felder = (p.felder || []).filter(v => v !== f.id); if (p.id === paket) p.felder.push(f.id); });
      (n.meilensteine || []).forEach(m => { m.felder = (m.felder || []).filter(v => v !== f.id); if (m.id === msId) m.felder.push(f.id); });
      merke("welt-waehle", f.id);
    });
  };
}

// ---------- Frist setzen oder verschieben ----------
function fristDialog(art, id, vorschlag) {
  const w = ROH, liste = art === "meilenstein" ? w.meilensteine : w.felder, key = art === "meilenstein" ? "datum" : "faellig";
  const o = (liste || []).find(q => q.id === id); if (!o) return;
  const alt = o[key], I = window.__weltIntern;
  let warnung = "";
  if (alt && I) {
    const Z = I.ZIELE.find(z => z.obj.id === (art === "meilenstein" ? "ms-" + id : id));
    if (Z) {
      const L = I.lage(Z, I.zeit());
      if (["spaeher", "lager", "belagerung", "schlacht"].includes(L.phase))
        warnung = `<div class="note"><b>Die Angreifer sind schon da (${esc(I.TX[L.phase] || L.phase)}).</b> Du kannst die Frist verschieben, aber es bleibt sichtbar: Ihr Belagerungsgerät bleibt am Feld liegen, und im Plan steht die alte Frist.</div>`;
      else if (L.phase === "ruhe" && L.naechste) warnung = `<p class="muted">Noch keine Späher in Sicht: Bis ${esc(I.kurzDatum(I.tagVon(L.naechste)))} ist die Verschiebung frei und hinterlässt keine Spuren.</p>`;
    }
  }
  const inhalt = `<p class="lead">${esc(o.titel)}</p>
    ${alt ? `<div class="feld"><span class="lbl">Bisherige Frist</span><b>${esc(kurz(alt))}</b>${(o.verschoben || []).length ? ` <small class="muted">schon ${(o.verschoben || []).length}× verschoben</small>` : ""}</div>` : ""}
    ${warnung}
    <label class="feld"><span class="lbl">${alt ? "Neue Frist" : "Frist"}</span><input type="date" name="d" min="${heute()}" value="${esc(vorschlag || (alt && alt >= heute() ? alt : plusTage(heute(), 7)))}" required></label>
    ${alt ? `<label class="feld"><span class="lbl">Grund <small>(optional, steht im Verlauf)</small></span><input name="grund" maxlength="200" placeholder="Warum verschiebst du?"></label>` : ""}
    <p class="muted">Entschieden wird am Tag nach der Frist um 16:00. Späher kommen einige Tage vorher.</p>`;
  const form = dialog(alt ? "Frist verschieben" : "Frist setzen", inhalt, `<span class="platz"></span><button type="button" class="knopf" data-dlg="zu">Abbrechen</button><button type="submit" class="knopf haupt">${alt ? "Verschieben" : "Setzen"}</button>`);
  form.onsubmit = e => {
    e.preventDefault();
    const d = wert(form, "d"), grund = wert(form, "grund");
    if (!istDatum(d)) return zeigeFehler(["Wähl ein Datum."]);
    if (d < heute()) return zeigeFehler(["Die neue Frist liegt frühestens heute."]);
    if (d === alt) return schliesseDialog();
    bearbeite(n => {
      const q = (art === "meilenstein" ? n.meilensteine : n.felder).find(z => z.id === id);
      if (q[key]) { q.verschoben = (q.verschoben || []).concat([Object.assign({ am: heute(), von: q[key], nach: d }, grund ? { grund } : {})]); }
      q[key] = d;
    });
  };
}

// ---------- Status ----------
function setzeStatus(id, aktion) {
  return bearbeite(n => {
    const f = n.felder.find(q => q.id === id); if (!f) return false;
    const jetzt = new Date().toISOString();
    if (aktion === "beginnen") { f.status = "in_arbeit"; f.begonnen = f.begonnen || heute(); }
    if (aktion === "fertig") { f.status = "fertig"; f.seit = heute(); f.fertig_um = jetzt; f.begonnen = f.begonnen || heute(); }
    if (aktion === "verwerfen") { f.status = "verworfen"; f.seit = heute(); f.fertig_um = jetzt; }
    if (aktion === "zurueck") { if (f.seit !== heute()) return false; f.status = f.begonnen ? "in_arbeit" : "geplant"; delete f.seit; delete f.fertig_um; }
    merke("welt-waehle", id);
  });
}

// ---------- Meilenstein, Großpaket, Sektor ----------
function meilensteinDialog(id) {
  const w = ROH, m = id ? (w.meilensteine || []).find(q => q.id === id) : null;
  const inhalt = `
    <label class="feld"><span class="lbl">Titel</span><input name="titel" maxlength="120" value="${esc(m ? m.titel : "")}" placeholder="z. B. Zwischenpräsentation"></label>
    <div class="spalten">
      ${m ? `<div class="feld"><span class="lbl">Datum</span><div class="zeile"><b>${esc(kurz(m.datum))}</b><button type="button" class="mini" data-dlg="frist">Verschieben …</button></div></div>`
          : `<label class="feld"><span class="lbl">Datum</span><input type="date" name="datum" min="${heute()}" value="${plusTage(heute(), 14)}"></label>`}
      <label class="feld"><span class="lbl">Sektor <small>(sonst dort, wo die meisten Aufgaben liegen)</small></span><select name="region"><option value="">automatisch</option>${sektorOptionen(w, m ? m.region || "" : "")}</select></label>
    </div>
    <label class="feld"><span class="lbl">Beschreibung <small>(optional)</small></span><textarea name="beschreibung" rows="2" maxlength="600">${esc(m ? m.beschreibung || "" : "")}</textarea></label>
    <div class="feld"><span class="lbl">Gehört dazu</span>${aufgabenHaken(w, "felder", m ? m.felder || [] : [])}</div>
    <p class="muted">Am Meilenstein greift eine große Welle das Bollwerk und alle offenen Aufgaben darin an. Aufgaben ohne eigene Frist erben sein Datum. Meilensteine bleiben stehen, auch verlorene.</p>`;
  const form = dialog(m ? "Meilenstein bearbeiten" : "Neuer Meilenstein", inhalt,
    `${m && m.angelegt === heute() ? `<button type="button" class="knopf gefahr" data-dlg="loeschen">Löschen</button>` : ""}<span class="platz"></span><button type="button" class="knopf" data-dlg="zu">Abbrechen</button><button type="submit" class="knopf haupt">${m ? "Speichern" : "Anlegen"}</button>`, hakenSuche);
  const fb = form.querySelector("[data-dlg=frist]"); if (fb) fb.onclick = () => fristDialog("meilenstein", m.id);
  const lb = form.querySelector("[data-dlg=loeschen]"); if (lb) lb.onclick = () => bearbeite(n => { n.meilensteine = n.meilensteine.filter(q => q.id !== m.id); });
  form.onsubmit = e => {
    e.preventDefault();
    const titel = wert(form, "titel"); if (!titel) return zeigeFehler(["Gib dem Meilenstein einen Titel."]);
    const datum = wert(form, "datum"); if (!m && (!istDatum(datum) || datum < heute())) return zeigeFehler(["Das Datum liegt frühestens heute."]);
    bearbeite(n => {
      n.meilensteine = n.meilensteine || [];
      let q = m ? n.meilensteine.find(z => z.id === m.id) : null;
      if (!q) { q = { id: neueId(titel, new Set(n.meilensteine.map(z => z.id))), datum, angelegt: heute() }; n.meilensteine.push(q); }
      q.titel = titel; q.felder = haken(form, "felder");
      const r = wert(form, "region"); if (r) q.region = r; else delete q.region;
      const b = wert(form, "beschreibung"); if (b) q.beschreibung = b; else delete q.beschreibung;
      merke("welt-waehle", "ms-" + q.id);
    }, m ? "" : `Meilenstein „${titel}“ gesetzt`);
  };
}
function paketDialog(id) {
  const w = ROH, p = id ? (w.pakete || []).find(q => q.id === id) : null;
  const inhalt = `<label class="feld"><span class="lbl">Titel</span><input name="titel" maxlength="120" value="${esc(p ? p.titel : "")}" placeholder="z. B. Datenerhebung"></label>
    <div class="feld"><span class="lbl">Aufgaben darin</span>${aufgabenHaken(w, "felder", p ? p.felder || [] : [])}</div>
    <p class="muted">Ein Großpaket hat keine eigene Frist. Jede Aufgabe darin hält ihre eigene, und der Großbau wächst mit jeder fertigen Aufgabe um einen Abschnitt (im Mittelalter: Chor, Langhausjoche, Westfassade).</p>`;
  const form = dialog(p ? "Großpaket bearbeiten" : "Neues Großpaket", inhalt,
    `${p ? `<button type="button" class="knopf gefahr" data-dlg="loeschen">Auflösen</button>` : ""}<span class="platz"></span><button type="button" class="knopf" data-dlg="zu">Abbrechen</button><button type="submit" class="knopf haupt">${p ? "Speichern" : "Anlegen"}</button>`, hakenSuche);
  const lb = form.querySelector("[data-dlg=loeschen]"); if (lb) lb.onclick = () => {
    if (lb.dataset.sicher) return bearbeite(n => { n.pakete = n.pakete.filter(q => q.id !== p.id); });
    lb.dataset.sicher = 1; lb.textContent = "Wirklich auflösen? (Aufgaben bleiben)";
  };
  form.onsubmit = e => {
    e.preventDefault();
    const titel = wert(form, "titel"); if (!titel) return zeigeFehler(["Gib dem Großpaket einen Titel."]);
    const felder = haken(form, "felder");
    bearbeite(n => {
      n.pakete = n.pakete || [];
      let q = p ? n.pakete.find(z => z.id === p.id) : null;
      if (!q) { q = { id: neueId(titel, new Set(n.pakete.map(z => z.id))) }; n.pakete.push(q); }
      n.pakete.forEach(z => { if (z !== q) z.felder = (z.felder || []).filter(v => !felder.includes(v)); });
      q.titel = titel; q.felder = felder;
      merke("welt-waehle", "pk-" + q.id);
    }, p ? "" : `Großpaket „${titel}“ angelegt`);
  };
}
function sektorDialog(id) {
  const w = ROH, r = id ? w.regionen.find(q => q.id === id) : null, I = window.__weltIntern;
  const biome = BIOM_REIHE.map(b => [b, (I && I.BIOME[b] && I.BIOME[b].name) || b]);
  const frei = BIOM_REIHE.find(b => !w.regionen.some(q => q.biom === b)) || BIOM_REIHE[w.regionen.length % BIOM_REIHE.length];
  const leer = r && !w.felder.some(f => f.region === r.id);
  const inhalt = `<label class="feld"><span class="lbl">Name</span><input name="name" maxlength="60" value="${esc(r ? r.name : "")}" placeholder="z. B. Recherche"></label>
    <label class="feld"><span class="lbl">Landschaft der Insel</span><select name="biom">${optionen(biome, r ? r.biom || "wiese" : frei)}</select></label>
    <label class="feld"><span class="lbl">Beschreibung <small>(optional)</small></span><textarea name="beschreibung" rows="2" maxlength="300">${esc(r ? r.beschreibung || "" : "")}</textarea></label>`;
  const form = dialog(r ? "Sektor bearbeiten" : "Neuer Sektor", inhalt,
    `${leer && w.regionen.length > 1 ? `<button type="button" class="knopf gefahr" data-dlg="loeschen">Löschen</button>` : ""}<span class="platz"></span><button type="button" class="knopf" data-dlg="zu">Abbrechen</button><button type="submit" class="knopf haupt">${r ? "Speichern" : "Anlegen"}</button>`);
  const lb = form.querySelector("[data-dlg=loeschen]"); if (lb) lb.onclick = () => bearbeite(n => {
    n.regionen = n.regionen.filter(q => q.id !== r.id); (n.meilensteine || []).forEach(m => { if (m.region === r.id) delete m.region; }); });
  form.onsubmit = e => {
    e.preventDefault();
    const name = wert(form, "name"); if (!name) return zeigeFehler(["Gib dem Sektor einen Namen."]);
    bearbeite(n => {
      let q = r ? n.regionen.find(z => z.id === r.id) : null;
      if (!q) { q = { id: neueId(name, new Set(n.regionen.map(z => z.id))) }; n.regionen.push(q); }
      q.name = name; q.biom = wert(form, "biom");
      const b = wert(form, "beschreibung"); if (b) q.beschreibung = b; else delete q.beschreibung;
    }, r ? "" : `Sektor „${name}“ angelegt`);
  };
}
function projektDialog() {
  const w = ROH, m = w.meta || {};
  const inhalt = `<label class="feld"><span class="lbl">Projektname</span><input name="projekt" maxlength="80" value="${esc(m.projekt || "")}"></label>
    <label class="feld"><span class="lbl">Thema</span><select name="thema">${optionen(Object.entries(THEMEN), m.thema || "scifi")}</select></label>
    <label class="feld"><span class="lbl">Lagebericht <small>(steht oben im Tab Lage, höchstens 450 Zeichen, optional)</small></span><textarea name="bericht" rows="5" maxlength="450">${esc(w.tagesbericht || "")}</textarea></label>`;
  const form = dialog("Projekt", inhalt, `<span class="platz"></span><button type="button" class="knopf" data-dlg="zu">Abbrechen</button><button type="submit" class="knopf haupt">Speichern</button>`);
  form.onsubmit = e => {
    e.preventDefault();
    const name = wert(form, "projekt"); if (!name) return zeigeFehler(["Gib dem Projekt einen Namen."]);
    bearbeite(n => { n.meta.projekt = name; n.meta.thema = wert(form, "thema"); const b = wert(form, "bericht"); if (b) n.tagesbericht = b; else delete n.tagesbericht; });
  };
}
function artenDialog() {
  const w = ROH, eigen = (w.meta || {}).arbeitsarten || {}, T = window.__weltIntern.TYPEN;
  const inhalt = `<p class="muted">Jede Art hat ihr eigenes Gebäude. Gib den Arten Namen, die zu deinem Projekt passen, z. B. „Kapitel“ statt „Schreiben“. Leer lassen = Standardname.</p>
    <div class="arten">${ART_REIHE.map(k => `<label><span>${esc(T[k].gebaeude || k)}</span><input name="a_${k}" maxlength="40" placeholder="${esc(ARTEN[k].name)}" value="${esc(eigen[k] || "")}"></label>`).join("")}</div>`;
  const form = dialog("Arbeitsarten", inhalt, `<span class="platz"></span><button type="button" class="knopf" data-dlg="zu">Abbrechen</button><button type="submit" class="knopf haupt">Speichern</button>`);
  form.onsubmit = e => {
    e.preventDefault();
    bearbeite(n => { const a = {}; ART_REIHE.forEach(k => { const v = wert(form, "a_" + k); if (v) a[k] = v; }); if (Object.keys(a).length) n.meta.arbeitsarten = a; else delete n.meta.arbeitsarten; });
  };
}
function importDialog() {
  const inhalt = `<p class="muted">Füg hier eine Welt als JSON ein, z. B. eine <code>world.json</code> aus dem Repo oder eine Welt, die Claude für dich vorbereitet hat. Sie ersetzt die jetzige. Fristen und Verschiebungen, die hier schon stehen, müssen erhalten bleiben.</p>
    <label class="feld"><span class="lbl">JSON</span><textarea name="json" rows="12" spellcheck="false" class="mono"></textarea></label>`;
  const form = dialog("Welt importieren", inhalt, `<span class="platz"></span><button type="button" class="knopf" data-dlg="zu">Abbrechen</button><button type="submit" class="knopf haupt">Importieren</button>`);
  form.onsubmit = e => {
    e.preventDefault();
    let w; try { w = JSON.parse(wert(form, "json")); } catch (x) { return zeigeFehler(["Das ist kein gültiges JSON: " + x.message]); }
    if (F.isOldFormat(w)) return zeigeFehler(["Diese Welt ist noch im alten deutschen Format. Wandle sie einmal mit convert_world.py um."]);
    if (!w || typeof w !== "object" || !Array.isArray(w.regions)) return zeigeFehler(["Es fehlt die Liste „regions“ (Sektoren)."]);
    w = intern(w);
    w.meta = Object.assign({}, (ROH || {}).meta || {}, w.meta || {}); w.felder = w.felder || []; w.meilensteine = w.meilensteine || []; w.pakete = w.pakete || [];
    delete w.diagramm; delete w.ordnung;
    speichere(w, "Welt importiert");
  };
}

// ---------- Einrichtung (noch keine Welt) ----------
function einrichtung() {
  const inhalt = `<p class="lead">Jede Aufgabe wird ein Gebäude auf einer Insel. Nähert sich eine Frist, kommen Angreifer. Ist die Aufgabe rechtzeitig fertig, schlägt deine Armee sie zurück, sonst brennt das Gebäude nieder und die Ruine bleibt.</p>
    <label class="feld"><span class="lbl">Projektname</span><input name="projekt" maxlength="80" placeholder="z. B. Umzug, Abschlussarbeit, Vereinsfest"></label>
    <label class="feld"><span class="lbl">Sektoren <small>(eine Insel je Zeile, 1 bis 8)</small></span><textarea name="sektoren" rows="5" placeholder="Planung&#10;Umsetzung&#10;Abstimmung&#10;Abschluss"></textarea></label>
    <label class="feld"><span class="lbl">Thema</span><select name="thema">${optionen(Object.entries(THEMEN), "mittelalter")}</select></label>
    <p class="muted">Du kannst die Welt auch von Claude einrichten lassen: Beschreib ihm dein Projekt und sag, er soll die Ganttfort-Welt in diesem Artifact anlegen.</p>`;
  const form = dialog("Eigene Ganttfort-Welt anlegen", inhalt, `<span class="platz"></span><button type="button" class="knopf" data-dlg="zu">Erst die Beispielwelt ansehen</button><button type="submit" class="knopf haupt">Welt anlegen</button>`);
  form.onsubmit = async e => {
    e.preventDefault();
    const projekt = wert(form, "projekt"); if (!projekt) return zeigeFehler(["Gib dem Projekt einen Namen."]);
    const namen = wert(form, "sektoren").split("\n").map(s => s.trim()).filter(Boolean).slice(0, 8);
    if (!namen.length) return zeigeFehler(["Nenn mindestens einen Sektor."]);
    const ids = new Set();
    const w = { meta: { projekt, thema: wert(form, "thema"), stand: heute(), angelegt: heute() },
      regionen: namen.map((n, i) => { const id = neueId(n, ids); ids.add(id); return { id, name: n, biom: BIOM_REIHE[i % BIOM_REIHE.length] }; }),
      felder: [], meilensteine: [], pakete: [], chronik: [{ datum: heute(), text: "Welt angelegt" }], rev: 1 };
    const btn = form.querySelector("[type=submit]"); btn.disabled = true; btn.textContent = "Wird angelegt …";
    try { await db.doc(DOC).set(englisch(w)); neuLaden({ tab: "aufgaben" }); }
    catch (x) { btn.disabled = false; btn.textContent = "Welt anlegen"; zeigeFehler(["Anlegen hat nicht geklappt. Versuch es noch einmal."]); }
  };
}

// ---------- Knöpfe in der Welt (von welt-engine.js aufgerufen) ----------
const K = (a, t, cls = "") => `<button type="button" class="mini ${cls}" data-e="${a}">${t}</button>`;
function statusKnoepfe(f) {
  const s = f.status, b = [];
  if (s === "geplant") b.push(K(`beginnen:${f.id}`, "▶ Beginnen"));
  if (s === "geplant" || s === "in_arbeit") b.push(K(`fertig:${f.id}`, "✓ Fertig", "gut"), K(`verwerfen:${f.id}`, "Verwerfen"));
  if ((s === "fertig" || s === "verworfen") && f.seit === heute()) b.push(K(`zurueck:${f.id}`, "↺ Rückgängig"));
  if (s !== "fertig" && s !== "verworfen") b.push(K(`frist:${f.id}`, f.faellig ? "Frist verschieben" : "Frist setzen"));
  b.push(K(`bearbeiten:${f.id}`, "Bearbeiten"));
  return b.join("");
}
window.WELT_EDIT = {
  feld(f) {
    const roh = ROH && ROH.felder.find(q => q.id === f.id);
    let h = "";
    if (DARF && roh) h += `<div class="aktionen">${statusKnoepfe(roh)}</div>`;
    const notiz = (roh || f).notiz; if (notiz) h += `<h3>Notiz</h3><div class="notiz">${esc(notiz)}</div>`;
    return h;
  },
  meilenstein(m) { return DARF ? `<div class="aktionen">${K(`msfrist:${m.id}`, "Datum verschieben")}${K(`ms:${m.id}`, "Bearbeiten")}</div>` : ""; },
  paket(P) { return DARF ? `<div class="aktionen">${K(`pk:${P._pk.id}`, "Bearbeiten")}${K(`neu:paket=${P._pk.id}`, "+ Aufgabe darin")}</div>` : ""; },
  menue(f) {
    const roh = ROH && ROH.felder.find(q => q.id === f.id);
    if (!DARF || !roh) return `<li class="amenue"><span class="muted">${MODUS === "eigen" ? "Nur lesen." : "Beispielwelt: hier wird nichts gespeichert."}</span></li>`;
    return `<li class="amenue">${statusKnoepfe(roh)}</li>`;
  },
  neuKnopf() { return DARF ? K("neu:", "+ Aufgabe", "haupt") : ""; },
  planHinweis() {
    const w = window.WELT, hatFrist = (w.felder || []).some(f => f.faellig) || (w.meilensteine || []).length;
    if (hatFrist) return "";
    return DARF ? `<div class="look" style="margin-bottom:10px">Noch keine Fristen. Leg im Tab <b>Aufgaben</b> eine Aufgabe mit Frist an, oder setz im Tab <b>Projekt</b> einen Meilenstein.</div>` : "";
  },
  zuletzt() {
    const I = window.__weltIntern, grenze = plusTage(heute(), -7);
    const liste = (window.WELT.felder || []).filter(f => f.status === "fertig" && f.seit && f.seit >= grenze).sort((a, b) => String(b.seit).localeCompare(String(a.seit)));
    const reg = {}; (window.WELT.regionen || []).forEach(r => reg[r.id] = r.name);
    return `<h3>Fertig in den letzten 7 Tagen</h3><ul class="list">${liste.map(f => `<li data-feld="${esc(f.id)}"><span class="pdot" style="background:${I ? I.STATUS.fertig.farbe : "#6dffb0"}"></span><span class="t">${esc(f.titel)}</span><span class="r">${esc(kurz(f.seit))}</span></li>`).join("") || '<li class="muted">noch nichts</li>'}</ul>`;
  },
  projekt() {
    const w = window.WELT, m = w.meta || {}, I = window.__weltIntern;
    const speicher = { eigen: DARF ? "Gespeichert in diesem Artifact. Nur du siehst diese Welt, auch wenn du den Link teilst." : "Du siehst diese Welt nur lesend.",
      neu: "Noch keine eigene Welt. Das hier ist die Beispielwelt.", fremd: "Das ist die Beispielwelt dieser Vorlage. Die Welt des Besitzers bleibt privat.", ohne: "Kein Speicher verfügbar: Das ist die Beispielwelt." }[MODUS];
    let h = `<h2>${esc(m.projekt || "Projekt")}</h2><p class="muted" style="margin-top:-2px">${esc(speicher)}</p>`;
    if (MODUS === "neu") h += `<div class="aktionen">${K("einrichten:", "Eigene Welt anlegen", "haupt")}</div>`;
    if (MODUS === "fremd" || MODUS === "ohne") h += `<div class="look" style="margin-top:10px"><b>Eigene Welt?</b> Bitte deinen Claude: „Mach mir eine eigene Ganttfort-Welt aus dieser Vorlage“ und gib ihm den Link zu diesem Artifact. Er legt dir ein eigenes, privates Artifact an.</div>`;
    if (DARF) h += `<div class="aktionen">${K("projekt:", "Name, Thema, Lagebericht")}${K("arten:", "Arbeitsarten benennen")}</div>`;
    h += `<p class="muted">Thema: ${esc(THEMEN[m.thema || "scifi"] || m.thema)}</p>`;
    const liste = (titel, eintraege, neu) => `<div class="kopfzeile-a"><h3>${titel}</h3>${DARF && neu ? K(neu, "+ neu") : ""}</div><ul class="list">${eintraege || '<li class="muted">noch keine</li>'}</ul>`;
    h += liste("Sektoren", (w.regionen || []).map(r => `<li${DARF ? ` data-e="sektor:${esc(r.id)}"` : ""}><span class="pdot" style="background:#${((I && I.BIOME[r.biom] && I.BIOME[r.biom].top) || 0x4b6a4c).toString(16).padStart(6, "0")}"></span><span class="t">${esc(r.name)}</span><span class="r">${(w.felder || []).filter(f => f.region === r.id).length} Aufgaben</span></li>`).join(""), "sektor:");
    h += liste("Meilensteine", (w.meilensteine || []).slice().sort((a, b) => String(a.datum).localeCompare(String(b.datum))).map(q => `<li data-feld="ms-${esc(q.id)}"><span class="t">◆ ${esc(q.titel)}</span><span class="r">${esc(kurz(q.datum))}</span></li>`).join(""), "ms:");
    h += liste("Großpakete", (w.pakete || []).map(q => `<li data-feld="pk-${esc(q.id)}"><span class="t">▣ ${esc(q.titel)}</span><span class="r">${(q.felder || []).length} Aufgaben</span></li>`).join(""), "pk:");
    if (DARF) h += `<h3>Daten</h3><div class="aktionen">${K("json:", "Als JSON kopieren")}${K("import:", "JSON importieren")}</div>
      <p class="muted">Claude kann diese Welt direkt lesen und ändern, wenn du ihm den Link gibst. Er hält sich dabei an dieselben Regeln: Fristen verschiebt nur, wer es sagt, und jede Verschiebung bleibt sichtbar.</p>`;
    return h;
  },
  verdrahte() {},
  planGezeichnet(koerper, PLAN) {
    if (!DARF || koerper.dataset.ziehbar) return;
    koerper.dataset.ziehbar = 1;
    let z = null;
    koerper.addEventListener("pointerdown", e => {
      const el = e.target.closest("[data-zieh]"); if (!el || !PLAN_AKT()) return;
      e.stopPropagation(); e.preventDefault();
      z = { el, x0: e.clientX, d0: +el.dataset.d, id: el.dataset.zieh, dd: 0, px: PLAN_AKT().px };
      el.classList.add("zieht"); el.setPointerCapture && el.setPointerCapture(e.pointerId);
    });
    koerper.addEventListener("pointermove", e => {
      if (!z) return; const dd = Math.round((e.clientX - z.x0) / z.px); if (dd === z.dd) return; z.dd = dd;
      z.el.style.setProperty("--dx", (dd * z.px) + "px");
      z.el.dataset.tipp = dd ? plusTage(window.__weltIntern.tagText(z.d0), dd).split("-").reverse().slice(0, 2).join(".") + "." : "";
    });
    const ende = () => {
      if (!z) return; const { el, dd, d0, id } = z; z = null; el.classList.remove("zieht"); el.style.removeProperty("--dx"); el.dataset.tipp = "";
      if (!dd) return;
      const neu = plusTage(window.__weltIntern.tagText(d0), dd);
      if (id.startsWith("ms-")) fristDialog("meilenstein", id.slice(3), neu < heute() ? heute() : neu);
      else fristDialog("feld", id, neu < heute() ? heute() : neu);
    };
    koerper.addEventListener("pointerup", ende); koerper.addEventListener("pointercancel", ende);
  },
  bereit() {
    const I = window.__weltIntern;
    lade.hidden = true;
    const ui = hole("welt-ui"), wahl = hole("welt-waehle");
    if (ui) { if (ui.plan != null && ui.plan !== I.planOffen()) I.setzePlan(ui.plan); if (ui.tab) I.tab(ui.tab); }
    if (wahl) I.waehle(wahl, !!(ui && ui.tab && ui.tab !== "feld"));
    else if (ui && ui.auswahl) I.waehle(ui.auswahl, true);
    if (ui && ui.scroll) { const p = document.getElementById("pane"); if (p) p.scrollTop = ui.scroll; }
    // keine Hinweisleiste mehr über der Welt (Beispielwelt/Vorlage): Infos stehen im Reiter Projekt
    if (MODUS === "neu" && !ui) einrichtung();
    if (UMGEZOGEN) zeigeHinweis("Deine Welt wurde ins neue Format übernommen. Die alte Fassung bleibt als Sicherung gespeichert.");
    beobachte();
  }
};
const PLAN_AKT = () => { const k = document.getElementById("planKoerper"); return k && k.querySelector(".skala") ? { px: (k.querySelector(".skala .tg") || {}).offsetWidth || 20 } : null; };

// Klicks auf data-e (Panel, Dialog-freie Knöpfe)
document.addEventListener("click", e => {
  const b = e.target.closest("[data-e]"); if (!b) return;
  e.stopPropagation(); e.preventDefault();
  const [a, ...rest] = b.dataset.e.split(":"), id = rest.join(":");
  if (a === "neu") { const v = {}; id.split("&").filter(Boolean).forEach(p => { const [k, x] = p.split("="); v[k] = x; });
    if (v.paket) { const p = (ROH.pakete || []).find(q => q.id === v.paket), f0 = p && ROH.felder.find(f => (p.felder || []).includes(f.id)); if (f0) v.region = f0.region; }
    return aufgabeDialog(null, v); }
  if (a === "bearbeiten") return aufgabeDialog(id);
  if (a === "frist") return fristDialog("feld", id);
  if (a === "msfrist") return fristDialog("meilenstein", id);
  if (["beginnen", "fertig", "verwerfen", "zurueck"].includes(a)) { b.disabled = true; return setzeStatus(id, a); }
  if (a === "ms") return meilensteinDialog(id || null);
  if (a === "pk") return paketDialog(id || null);
  if (a === "sektor") return sektorDialog(id || null);
  if (a === "projekt") return projektDialog();
  if (a === "arten") return artenDialog();
  if (a === "import") return importDialog();
  if (a === "einrichten") return einrichtung();
  if (a === "tab") return window.__weltIntern.tab(id);
  if (a === "json") { const w = englisch(klon(ROH)); delete w.rev; return window.__weltIntern.kopiere(JSON.stringify(w, null, 1)); }
}, true);

// ---------- Hinweisleiste ----------
function banner() {
  const t = { neu: ["Beispielwelt", "Das ist eine Beispielwelt. Deine eigene legst du mit einem Klick an.", "einrichten:", "Eigene Welt anlegen"],
    fremd: ["Vorlage", "Du siehst die Beispielwelt. Die Welt des Besitzers ist privat.", "", ""],
    ohne: ["Beispielwelt", "Ohne Speicher: Änderungen sind hier nicht möglich.", "", ""] }[MODUS];
  if (!t) return;
  const d = document.createElement("div"); d.className = "banner";
  d.innerHTML = `<b>${t[0]}</b><span>${t[1]}</span>${t[2] ? `<button type="button" class="mini haupt" data-e="${t[2]}">${t[3]}</button>` : ""}<button type="button" class="mini" data-e="tab:projekt">Mehr</button>`;
  document.body.appendChild(d);
}

// ---------- Änderungen von außen (z. B. Claude) ----------
function beobachte() {
  if (MODUS !== "eigen" || !db) return;
  let erst = true;
  db.doc(DOC).onSnapshot(s => {
    if (erst) { erst = false; return; }
    if (!s.exists || s.metadata.hasPendingWrites || speichertGerade) return;
    const d = s.data() || {}; if ((d.rev || 0) === ((ROH && ROH.rev) || 0)) return;
    if (dlg) { zeigeHinweis("Die Welt wurde gerade anderswo geändert. Nach dem Schließen wird neu geladen."); neuNachDialog = true; return; }
    zeigeHinweis("Die Welt wurde geändert, sie wird neu gebaut …"); setTimeout(() => neuLaden(), 900);
  }, () => {});
}

// ---------- Welt starten ----------
ladeText("Welt wird gebaut …");
if (!window.THREE) { ladeText("Die 3D-Bibliothek konnte nicht geladen werden. Lade die Seite neu."); return; }
const s = document.createElement("script"); s.charset = "utf-8"; s.src = "world-engine.js";
s.onerror = () => ladeText("Die Welt konnte nicht geladen werden. Lade die Seite neu.");
document.body.appendChild(s);
})();
