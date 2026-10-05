// Ganttfort world format: English key names (file format) <-> internal key names (engine).
// One source for world.html, the Artifact app, check_world.py and convert_world.py.
// Each context maps internal key -> [english key, child context or null]; "values" maps internal value -> english value.
// The object marked JSON/END below must stay plain JSON (Python reads it).
window.GF_SCHEMA = /*JSON*/{
 "contexts": {
  "root": {
   "meta": ["meta", "meta"], "tagesbericht": ["report", null], "regionen": ["regions", "region"],
   "felder": ["tasks", "task"], "meilensteine": ["milestones", "milestone"], "pakete": ["packages", "package"],
   "chronik": ["log", "logentry"], "diagramm": ["diagram", "diagram"], "ordnung": ["housekeeping", "housekeeping"],
   "rev": ["rev", null]
  },
  "meta": {
   "projekt": ["project", null], "stand": ["as_of", null], "hauptrepo": ["main_repo", null],
   "lernsprache": ["learning_language", null], "thema": ["theme", null], "code_sprache": ["code_language", null],
   "falle_titel": ["pitfall_title", null], "repos": ["repos", "repomap"], "plan": ["plan", "planinfo"],
   "seitenleiste": ["sidebar", null], "arbeitsarten": ["work_types", "worktypes"], "angelegt": ["created", null],
   "lang": ["lang", null]
  },
  "repo": { "name": ["name", null], "falle": ["pitfall_label", null], "code": ["code", null] },
  "planinfo": { "datei": ["file", null], "entwurf": ["draft", null], "aufgaben": ["tasks", null], "meilensteine": ["milestones", null] },
  "region": {
   "id": ["id", null], "repo": ["repo", null], "name": ["name", null], "biom": ["biome", null],
   "beschreibung": ["description", null], "ablauf": ["steps", null], "ablauf_richtung": ["steps_direction", null]
  },
  "task": {
   "id": ["id", null], "region": ["region", null], "typ": ["type", null], "status": ["status", null],
   "titel": ["title", null], "begonnen": ["started", null], "seit": ["ended", null], "neu": ["new", null],
   "quelle": ["source", null], "notiz": ["note", null], "kritisch": ["critical", null], "faellig": ["due", null],
   "plan_start": ["planned_start", null], "nach": ["after", null], "fertig_um": ["done_at", null],
   "dateien": ["files", null], "verschoben": ["moved", "move"], "branch": ["branch", null], "pr": ["pr", "pr"],
   "commits": ["commits", "commit"], "erklaerung": ["explanation", "explanation"], "angelegt": ["created", null],
   "aus_plan": ["from_plan", null]
  },
  "move": { "am": ["on", null], "von": ["from", null], "nach": ["to", null], "grund": ["reason", null] },
  "pr": { "nummer": ["number", null], "status": ["status", null], "url": ["url", null] },
  "commit": { "hash": ["hash", null], "datum": ["date", null], "text": ["text", null], "repo": ["repo", null] },
  "explanation": {
   "bild": ["picture", null], "python": ["learn", null], "cpp": ["code", null], "cpp_falle": ["pitfall", null],
   "achte_auf": ["check", null]
  },
  "milestone": {
   "id": ["id", null], "titel": ["title", null], "datum": ["date", null], "felder": ["tasks", null],
   "beschreibung": ["description", null], "verschoben": ["moved", "move"], "region": ["region", null],
   "angelegt": ["created", null]
  },
  "package": {
   "id": ["id", null], "titel": ["title", null], "felder": ["tasks", null], "beschreibung": ["description", null],
   "angelegt": ["created", null]
  },
  "logentry": { "datum": ["date", null], "text": ["text", null] },
  "diagram": { "text": ["text", null], "richtung": ["direction", null], "kanten": ["edges", "edge"] },
  "edge": { "von": ["from", null], "nach": ["to", null], "text": ["text", null], "art": ["kind", null] },
  "housekeeping": {
   "uebersicht": ["overview", null], "dateien": ["files", null], "ordner": ["folders", null], "neu": ["new", null],
   "hinweis": ["note", null]
  }
 },
 "maps": { "repomap": "repo", "worktypes": "@type" },
 "values": {
  "meta.thema": { "mittelalter": "medieval" },
  "meta.seitenleiste": { "reiter": "tabs", "liste": "list" },
  "region.biom": { "wiese": "meadow", "wald": "forest", "steppe": "steppe", "fels": "rock", "sand": "sand", "schnee": "snow", "vulkan": "volcano" },
  "task.typ": { "doku": "docs", "analyse": "research", "probe": "experiment", "sonst": "other" },
  "task.status": { "fertig": "done", "in_arbeit": "in_progress", "geplant": "planned", "verworfen": "dropped" },
  "pr.status": { "offen": "open", "entwurf": "draft", "gemergt": "merged", "abgelehnt": "closed" },
  "edge.art": { "abh": "dep", "fluss": "flow" }
 }
}/*END*/;

// Conversion in both directions. Unknown keys are kept as they are and reported in `unknown`.
window.GF_FORMAT = (function () {
  const S = window.GF_SCHEMA, C = S.contexts, inv = {}, invVal = {};
  for (const ctx in C) { inv[ctx] = {}; for (const k in C[ctx]) inv[ctx][C[ctx][k][0]] = [k, C[ctx][k][1]]; }
  for (const key in S.values) { invVal[key] = {}; for (const v in S.values[key]) invVal[key][S.values[key][v]] = v; }
  const typeKey = (k, toEn) => ((toEn ? S.values : invVal)["task.typ"] || {})[k] || k;
  function conv(o, ctx, toEn, path, unknown) {
    if (Array.isArray(o)) return o.map((x, i) => conv(x, ctx, toEn, path + "[" + i + "]", unknown));
    if (!o || typeof o !== "object") return o;
    const m = S.maps[ctx];
    if (m === "@type") { const r = {}; for (const k in o) r[typeKey(k, toEn)] = o[k]; return r; }
    if (m) { const r = {}; for (const k in o) r[k] = conv(o[k], m, toEn, path + "." + k, unknown); return r; }
    const table = toEn ? C[ctx] : inv[ctx], r = {};
    for (const k in o) {
      if (k.charAt(0) === "_") continue;                       // engine-internal helpers never leave the engine
      const e = table && table[k];
      if (!e) { r[k] = o[k]; unknown.push(path + "." + k); continue; }
      const internalKey = toEn ? k : e[0], vmap = (toEn ? S.values : invVal)[ctx + "." + internalKey];
      let v = o[k];
      if (e[1]) v = conv(v, e[1], toEn, path + "." + e[0], unknown);
      else if (vmap && typeof v === "string" && v in vmap) v = vmap[v];
      r[e[0]] = v;
    }
    return r;
  }
  const OLD_ROOT = ["felder", "regionen", "meilensteine", "tagesbericht"];
  return {
    // English file format -> internal objects used by the engine
    toInternal(w) { const unknown = []; const r = conv(w, "root", false, "", unknown); return { world: r, unknown }; },
    // internal objects -> English file format (what gets saved)
    toEnglish(w) { const unknown = []; const r = conv(w, "root", true, "", unknown); return { world: r, unknown }; },
    isOldFormat(w) { return !!w && typeof w === "object" && OLD_ROOT.some(k => k in w); }
  };
})();
