// Collects every visible interface text of a Ganttfort page in many states (for the English dictionary).
// node collect_texts.js <url> <out.json> [--all]     (needs playwright; --all keeps texts that are already English)
const { chromium } = require('playwright');
(async () => {
  const [url, out] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1500, height: 860 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.dismiss().catch(() => {}));
  await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = cb => window.__stopRaf ? 0 : raf(cb); });
  await p.route('**/three.min.js', r => r.fulfill({ body: require('fs').readFileSync(__dirname + '/../../template/.ai/ganttfort/lib/three.min.js'), contentType: 'text/javascript' }));
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  const extra = process.argv.slice(4).join(" ");
  if (extra) await p.route('**/world-demo.js', async r => { const res = await r.fetch(); let body = await res.text();
    if (extra.includes('--tabs')) body = body.replace('window.GANTTFORT_WORLD=W;', 'W.meta.sidebar="tabs"; window.GANTTFORT_WORLD=W;');
    if (extra.includes('--scifi')) body = body.replace('window.GANTTFORT_WORLD=W;', 'W.meta.theme="scifi"; window.GANTTFORT_WORLD=W;');
    r.fulfill({ body, contentType: 'text/javascript' }); });
  await p.goto(url); await p.waitForTimeout(5000); await p.evaluate(() => { window.__stopRaf = true; }); await p.waitForTimeout(4000);
  const res = await p.evaluate(async () => {
    const seen = new Map(), sleep = ms => new Promise(r => setTimeout(r, ms));
    const ATTR = ["title", "data-tipp", "placeholder", "aria-label", "alt"];
    const grab = st => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { if (n.nodeType === 3) { if (/SCRIPT|STYLE|CODE|PRE/i.test(n.parentNode.nodeName)) continue; const t = n.nodeValue.trim(); if (t && !seen.has(t)) seen.set(t, st); }
        else for (const a of ATTR) if (n.hasAttribute(a)) { const t = n.getAttribute(a).trim(); if (t && !seen.has(t)) seen.set(t, st); } } };
    const click = sel => { const e = document.querySelector(sel); if (e) { e.click(); return true; } return false; };
    const key = k => { const ev = new KeyboardEvent("keydown", { key: k, bubbles: true }); document.body.dispatchEvent(ev); window.dispatchEvent(new KeyboardEvent("keydown", { key: k })); };
    grab("start");
    const tabs = [...document.querySelectorAll("[data-tab]")].map(e => e.dataset.tab);
    for (const t of tabs) { click(`[data-tab="${t}"]`); await sleep(60); grab("tab " + t); }
    const W = window.GANTTFORT_WORLD || window.DEMO_WORLD && window.DEMO_WORLD() || {};
    const ids = (W.tasks || []).map(f => f.id).concat((W.milestones || []).map(m => "ms-" + m.id), (W.packages || []).map(x => "pk-" + x.id));
    for (const id of ids) {
      if (!click(`[data-feld="${id}"]`)) { click('[data-tab="aufgaben"]'); await sleep(40); click(`[data-feld="${id}"]`); }
      await sleep(60); grab("feld " + id);
      document.querySelectorAll("[data-detail],[data-amenue]").forEach((x, i) => { if (i < 4) x.click(); }); await sleep(40); grab("detail " + id);
    }
    for (const i of [...new Set([...document.querySelectorAll("[data-insel]")].map(e => e.dataset.insel))]) { click(`[data-insel="${i}"]`); await sleep(60); grab("insel " + i); }
    click('[data-tab="aufgaben"]'); await sleep(40);
    document.querySelectorAll("[data-afilter],[data-afrist]").forEach(x => x.click()); await sleep(40); grab("filter");
    for (const k of ["g", "l", "m", "b"]) { key(k); await sleep(900); grab("key " + k); key(k); await sleep(200); key("Escape"); }
    const s = document.querySelector("input[type=range]"); if (s) { s.value = s.min; s.dispatchEvent(new Event("input", { bubbles: true })); await sleep(800); grab("past"); }
    const data = new Set(); const walk = o => { if (typeof o === "string") data.add(o.trim()); else if (o && typeof o === "object") Object.values(o).forEach(walk); }; walk(W);
    return [...seen].filter(([t]) => !data.has(t) && /[A-Za-zÄÖÜäöüß]{2}/.test(t)).map(([t, s]) => ({ t, s }));
  });
  require('fs').writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(res.length, 'texts; errors:', errors);
  await b.close();
})();
