// Owner mode of the Artifact app with a fake storage: opens every dialog and collects its texts.
// node collect_owner.js <url> <out.json> [new]
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [url, out, mode] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1500, height: 860 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.dismiss().catch(() => {}));
  await p.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(__dirname + '/../../template/.ai/ganttfort/lib/three.min.js'), contentType: 'text/javascript' }));
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  await p.addInitScript(([mode]) => {
    const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = cb => window.__stopRaf ? 0 : raf(cb);
    const store = {};
    window.claude = { use: async n => n === 'db' ? { doc: path => ({
        get: async () => { if (mode !== 'new' && !store[path] && window.DEMO_WORLD) store[path] = window.DEMO_WORLD(); return { exists: !!store[path], data: () => store[path] }; },
        set: async v => { store[path] = v; }, onSnapshot: () => () => {} }) }
      : n === 'user' ? { isOwner: async () => true, can: async () => true } : null };
  }, [mode || 'own']);
  await p.goto(url); await p.waitForTimeout(6000); await p.evaluate(() => { window.__stopRaf = true; }); await p.waitForTimeout(3000);
  const res = await p.evaluate(async () => {
    const seen = new Map(), sleep = ms => new Promise(r => setTimeout(r, ms)), ATTR = ["title", "data-tipp", "placeholder", "aria-label", "alt"];
    const grab = st => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { if (n.nodeType === 3) { if (/SCRIPT|STYLE|CODE|PRE/i.test(n.parentNode.nodeName)) continue; const t = n.nodeValue.trim(); if (t && !seen.has(t)) seen.set(t, st); }
        else { for (const a of ATTR) if (n.hasAttribute(a)) { const t = n.getAttribute(a).trim(); if (t && !seen.has(t)) seen.set(t, st); }
          if (n.tagName === "OPTION" || n.tagName === "TEXTAREA") { const t = (n.textContent || n.placeholder || "").trim(); if (t && !seen.has(t)) seen.set(t, st); } } } };
    const fire = a => { const b = document.createElement("button"); b.dataset.e = a; b.style.display = "none"; document.body.appendChild(b); b.click(); b.remove(); };
    const close = () => { const z = document.querySelector('[data-dlg="zu"]'); if (z) z.click(); };
    grab("start");
    for (const t of ["projekt", "aufgaben", "heute", "inseln", "legende"]) { const e = document.querySelector(`[data-tab="${t}"]`); if (e) e.click(); window.__weltIntern && window.__weltIntern.tab(t); await sleep(80); grab("tab " + t); }
    const W = window.WELT || {}; const f = (W.felder || []).find(x => x.faellig && x.status === "in_arbeit"), g = (W.felder || []).find(x => x.status === "geplant");
    const acts = ["einrichten:", "neu:", "projekt:", "arten:", "import:", "ms:", "pk:", "sektor:", f ? "bearbeiten:" + f.id : "", f ? "frist:" + f.id : "", g ? "frist:" + g.id : "",
      (W.meilensteine || [])[1] ? "ms:" + W.meilensteine[1].id : "", (W.meilensteine || [])[1] ? "msfrist:" + W.meilensteine[1].id : "", (W.pakete || [])[0] ? "pk:" + W.pakete[0].id : "", (W.regionen || [])[0] ? "sektor:" + W.regionen[0].id : ""];
    for (const a of acts.filter(Boolean)) { fire(a); await sleep(120); grab("dlg " + a); const sub = /:$/.test(a) && !/^(projekt|arten|import):/.test(a) ? document.querySelector("form [type=submit]") : null; if (sub) { sub.click(); await sleep(80); grab("submit " + a); } close(); await sleep(60); }
    for (const id of (W.felder || []).slice(0, 60).map(x => x.id)) { window.__weltIntern && window.__weltIntern.waehle && window.__weltIntern.waehle(id); await sleep(40); grab("feld " + id); }
    return [...seen].map(([t, s]) => ({ t, s }));
  });
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(res.length, 'texts; errors:', errors); await b.close();
})();
