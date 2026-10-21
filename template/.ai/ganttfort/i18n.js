// Ganttfort interface language. English is the default; German via meta.lang = "de" (or ?lang=de).
// The engine writes its interface texts in German; in English mode every German text that reaches the page
// (text, title, tooltip, placeholder) is replaced by its English entry below. Your own data is never translated.
(function () {
  "use strict";
  let LANG = "en";
  const pick = l => (String(l || "").toLowerCase().slice(0, 2) === "de" ? "de" : "en");
  window.GF_LOCALE = () => (LANG === "de" ? "de-DE" : "en-GB");
  window.GF_LANG = () => LANG;

  // Placeholders in patterns: {D} short date, {LD} long date, {I} ISO date, {N} number, {T} clock time, {X} anything.
  // Captured parts are translated again (a date stays a date, "heute" becomes "today").
  const WD = "(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)", WDL = "(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)";
  const MON = "(?:January|February|March|April|May|June|July|August|September|October|November|December)";
  // the comma after the weekday depends on the browser's ICU version ("Wed, 21/10" or "Wed 21/10")
  const PH = { "{D}": "(" + WD + ",? \\d{2}/\\d{2})", "{LD}": "(" + WDL + " \\d{1,2} " + MON + ")", "{I}": "(\\d{4}-\\d{2}-\\d{2})",
    "{N}": "(\\d+)", "{T}": "(\\d{1,2}:\\d{2})", "{X}": "(.+?)" };
  const expand = s => s.replace(/\{(?:D|LD|I|N|T|X)\}/g, m => PH[m]);
  const EXACT = new Map(Object.entries(window.GF_TEXTS_EN || {}));
  const PATTERNS = (window.GF_PATTERNS_EN || []).map(([re, to]) => [new RegExp("^" + expand(re) + "$"), to]);
  const DATA = new Set();                                          // texts from the world itself are never translated
  function one(core, depth) {
    if (DATA.has(core)) return undefined;
    let out = EXACT.get(core);
    if (out !== undefined) return out;
    if (depth > 4) return undefined;
    if (core.indexOf("\n") >= 0) {                                // several lines: translate each line
      const lines = core.split("\n"), res = lines.map(x => { const c = x.trim(); const y = c ? one(c, depth + 1) : undefined; return y === undefined ? x : x.replace(c, y); });
      if (res.some((x, i) => x !== lines[i])) return res.join("\n");
    }
    if (core.indexOf("·") >= 0) {                                  // "Building · Type", "Title · Phase": translate each part
      const parts = core.split(/(\s*·\s*)/); let changed = false;
      const res = parts.map((x, i) => { if (i % 2 || !x) return x; const y = one(x, depth + 1); if (y !== undefined && y !== x) { changed = true; return y; } return x; });
      if (changed) return res.join("");
    }
    for (const [re, to] of PATTERNS) {
      const m = core.match(re);
      if (m) return to.replace(/\$(\d)/g, (_, i) => { const g = m[+i] || ""; const y = one(g, depth + 1); return y === undefined ? g : y; });
    }
    return undefined;
  }
  const T = s => {
    if (LANG === "de" || typeof s !== "string") return s;
    const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/), core = m[2];
    if (!core) return s;
    const out = one(core, 0);
    return out === undefined ? s : m[1] + out + m[3];
  };
  window.GF_T = T;

  const ATTRS = ["title", "data-tipp", "placeholder", "aria-label", "alt", "data-titel"];
  const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE"]);  // compared in upper case (SVG node names are lower case)
  function translateNode(n) {
    if (n.nodeType === 3) {
      const p = n.parentNode; if (!p || SKIP.has(p.nodeName.toUpperCase()) || (p.closest && p.closest("[data-roh],.mermaid-quelle"))) return;
      const v = n.nodeValue, t = T(v); if (t !== v) n.nodeValue = t;
    } else if (n.nodeType === 1) {
      if (n.hasAttribute("data-roh")) return;
      for (const a of ATTRS) { if (n.hasAttribute(a)) { const v = n.getAttribute(a), t = T(v); if (t !== v) n.setAttribute(a, t); } }
      if (SKIP.has(n.nodeName.toUpperCase())) return;              // attributes yes (placeholder), content no
      if (n.nodeName === "INPUT" && (n.type === "button" || n.type === "submit") && n.value) { const t = T(n.value); if (t !== n.value) n.value = t; }
      for (let c = n.firstChild; c; c = c.nextSibling) translateNode(c);
    }
  }
  let observer = null;
  window.GF_I18N = {
    start(lang) {
      LANG = pick(lang);
      document.documentElement.lang = LANG;
      if (LANG === "de" || observer) return;
      const run = () => {
        translateNode(document.body);
        observer = new MutationObserver(list => {
          for (const m of list) {
            if (m.type === "childList") m.addedNodes.forEach(translateNode);
            else if (m.type === "characterData") translateNode(m.target);
            else if (m.type === "attributes") translateNode(m.target);
          }
        });
        observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
      };
      if (document.body) run(); else document.addEventListener("DOMContentLoaded", run);
    },
    apply(el) { if (LANG !== "de" && el) translateNode(el); return el; },   // translate right away (before the layout is measured)
    protect(world) {
      const walk = o => { if (typeof o === "string") { const s = o.trim(); if (s) { DATA.add(s); if (s.indexOf("\n") >= 0) s.split("\n").forEach(x => x.trim() && DATA.add(x.trim())); } }
        else if (o && typeof o === "object") for (const k in o) { if (k.charAt(0) !== "_") walk(o[k]); } };
      walk(world);
    },
    langFrom(world) {
      const q = new URLSearchParams(location.search).get("lang");
      return pick(q || (world && world.meta && world.meta.lang) || "en");
    }
  };
})();
