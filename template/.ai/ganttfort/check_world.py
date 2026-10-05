"""Checks .ai/ganttfort/world.json and writes world-data.js for world.html.

Run from the repo root:
    python .ai/ganttfort/check_world.py

If .ai/ganttfort/plan.mmd exists (the project plan as a Mermaid Gantt), deadlines and milestones
are taken from there before the check (see plan_sync.py).

Why an extra .js file? Browsers do not let a locally opened HTML file load a JSON file,
but a <script src="..."> works.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import date, timedelta
from pathlib import Path

from plan_sync import read_plan, sync

FOLDER = Path(__file__).parent
TYPES = {"feature", "bugfix", "refactor", "test", "infra", "docs", "performance", "research",
         "experiment", "typing", "pipeline", "handoff", "api", "other"}
STATUS = {"done", "in_progress", "planned", "dropped"}
BIOMES = {"meadow", "forest", "sand", "steppe", "snow", "rock", "volcano"}
EXPLANATION_KEYS = {"picture", "learn", "code", "pitfall", "check"}
PR_STATUS = ("open", "draft", "merged", "closed")
LANGS = ("en", "de")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
OLD_KEYS = ("felder", "regionen", "meilensteine", "tagesbericht")
REPORT_MAX = 450   # the report is shown in full at the top of the Status tab (about 8 lines)


def check(world: dict) -> list[str]:
    errors = []
    meta = world.get("meta") if isinstance(world.get("meta"), dict) else {}
    if not meta.get("as_of"):
        errors.append("meta.as_of is missing (date YYYY-MM-DD)")
    if meta.get("lang") and meta["lang"] not in LANGS:
        errors.append(f"meta.lang '{meta['lang']}' unknown (allowed: {', '.join(LANGS)})")

    if len(str(world.get("report") or "")) > REPORT_MAX:
        errors.append(f"report has {len(world['report'])} characters – at most {REPORT_MAX} (2–3 short sentences)")

    regions = world.get("regions", [])
    region_ids = [r.get("id") for r in regions]
    if len(region_ids) != len(set(region_ids)):
        errors.append("regions: duplicate id")
    for r in regions:
        if not r.get("name"):
            errors.append(f"region {r.get('id')}: name is missing")
        if r.get("biome") and r["biome"] not in BIOMES:
            errors.append(f"region {r['id']}: unknown biome '{r['biome']}' (allowed: {sorted(BIOMES)})")

    repos = meta.get("repos") or {}
    for r in regions:
        if repos and r.get("repo") not in repos:
            errors.append(f"region {r.get('id')}: repo '{r.get('repo')}' is missing in meta.repos {sorted(repos)}")

    task_ids = set()
    for f in world.get("tasks", []):
        fid = f.get("id", "?")
        if fid in task_ids:
            errors.append(f"task {fid}: duplicate id")
        task_ids.add(fid)
        if not f.get("title"):
            errors.append(f"task {fid}: title is missing")
        if f.get("region") not in region_ids:
            errors.append(f"task {fid}: region '{f.get('region')}' does not exist")
        if f.get("type") not in TYPES:
            errors.append(f"task {fid}: type '{f.get('type')}' unknown (allowed: {sorted(TYPES)})")
        if f.get("status") not in STATUS:
            errors.append(f"task {fid}: status '{f.get('status')}' unknown (allowed: {sorted(STATUS)})")
        expl = f.get("explanation", {})
        extra = set(expl) - EXPLANATION_KEYS
        if extra:
            errors.append(f"task {fid}: unknown explanation keys {sorted(extra)} (allowed: {sorted(EXPLANATION_KEYS)})")
        if f.get("status") == "in_progress" and not expl.get("check"):
            errors.append(f"task {fid}: work in progress without 'check' – this is exactly where you need the hint")

    for f in world.get("tasks", []):
        for k in ("ended", "started", "planned_start"):
            if f.get(k) and not DATE.match(str(f[k])):
                errors.append(f"task {f.get('id')}: {k} '{f[k]}' is not a date YYYY-MM-DD")
        if f.get("ended") and f.get("started") and str(f["started"]) > str(f["ended"]):
            errors.append(f"task {f.get('id')}: started is after ended")

    # ---------- deadlines, moves, milestones ----------
    def check_deadline(who, obj, key):
        if obj.get(key) is not None and not DATE.match(str(obj[key])):
            errors.append(f"{who}: {key} '{obj[key]}' is not a date YYYY-MM-DD")
        v = obj.get("moved")
        if v is None:
            return
        if not isinstance(v, list):
            errors.append(f"{who}: moved must be a list")
            return
        prev_on = ""
        for i, e in enumerate(v):
            if not isinstance(e, dict) or not all(DATE.match(str(e.get(k, ""))) for k in ("on", "from", "to")):
                errors.append(f"{who}: moved[{i}] needs on, from, to as YYYY-MM-DD")
                continue
            if str(e["on"]) < prev_on:
                errors.append(f"{who}: moved[{i}] is older than the entry before it (append in date order)")
            prev_on = str(e["on"])
            if i and str(v[i-1].get("to")) != str(e["from"]):
                errors.append(f"{who}: moved[{i}].from does not match moved[{i-1}].to")
        if v and isinstance(v[-1], dict) and obj.get(key) and str(v[-1].get("to")) != str(obj[key]):
            errors.append(f"{who}: {key} ({obj[key]}) must equal the last moved.to ({v[-1].get('to')})")

    for f in world.get("tasks", []):
        check_deadline(f"task {f.get('id')}", f, "due")
    ms_ids = set()
    for m in world.get("milestones", []) or []:
        mid = m.get("id", "?")
        if mid in ms_ids:
            errors.append(f"milestone {mid}: duplicate id")
        ms_ids.add(mid)
        if not m.get("title"):
            errors.append(f"milestone {mid}: title is missing")
        if not DATE.match(str(m.get("date", ""))):
            errors.append(f"milestone {mid}: date is missing or not YYYY-MM-DD")
        for fid in m.get("tasks", []) or []:
            if fid not in task_ids:
                errors.append(f"milestone {mid}: task '{fid}' does not exist")
        if m.get("region") and m["region"] not in region_ids:
            errors.append(f"milestone {mid}: region '{m['region']}' does not exist")
        check_deadline(f"milestone {mid}", m, "date")

    # large packages, dependencies, git details
    pk_ids = set()
    for p in world.get("packages", []) or []:
        if p.get("id") in pk_ids:
            errors.append(f"package {p.get('id')}: duplicate id")
        pk_ids.add(p.get("id"))
        for fid in p.get("tasks", []) or []:
            if fid not in task_ids:
                errors.append(f"package {p.get('id')}: task '{fid}' does not exist")
    for f in world.get("tasks", []):
        for v in f.get("after", []) or []:
            if v not in task_ids:
                errors.append(f"task {f.get('id')}: predecessor '{v}' does not exist")
        c = f.get("commits")
        if c is not None:
            if not isinstance(c, list) or not all(isinstance(x, dict) and x.get("hash") and DATE.match(str(x.get("date", ""))) for x in c):
                errors.append(f"task {f.get('id')}: commits = list of {{hash, date (YYYY-MM-DD), text, repo}}")
        pr = f.get("pr")
        if pr is not None and (not isinstance(pr, dict) or pr.get("status") not in PR_STATUS):
            errors.append(f"task {f.get('id')}: pr = {{number, status ({'|'.join(PR_STATUS)}), url}}")

    theme = meta.get("theme")
    if theme and theme != "scifi" and not (FOLDER / "themes" / f"{theme}.js").exists():
        errors.append(f"meta.theme '{theme}': .ai/ganttfort/themes/{theme}.js does not exist (available: scifi, "
                      + ", ".join(sorted(p.stem for p in (FOLDER / "themes").glob("*.js") if not p.stem.startswith("_"))) + ")")

    diagram = world.get("diagram") or {}
    for k in diagram.get("edges", []):
        for end in ("from", "to"):
            target = k.get(end, "")
            if target.startswith("repo:"):
                if repos and target[5:] not in repos:
                    errors.append(f"diagram.edges: {end} '{target}' – this repo does not exist")
            elif target not in region_ids:
                errors.append(f"diagram.edges: {end} '{target}' – this region does not exist")
        if k.get("kind") not in (None, "dep", "flow"):
            errors.append(f"diagram.edges: kind '{k.get('kind')}' unknown (dep | flow)")

    return errors


def last_world() -> dict | None:
    """Last checked state (world-data.js), to notice silent deadline changes."""
    try:
        t = (FOLDER / "world-data.js").read_text(encoding="utf-8")
        return json.loads(t[t.index("{"):t.rindex("}") + 1])
    except (OSError, ValueError):
        return None


def check_deadlines_kept(old: dict, new: dict) -> list[str]:
    """Only the human moves deadlines, and every move stays visible."""
    errors = []

    def compare(who, a, b, key):
        va, vb = a.get("moved") or [], b.get("moved") or []
        if vb[:len(va)] != va:
            errors.append(f"{who}: entries in moved were changed or deleted – history stays")
        if a.get(key) and not b.get(key):
            errors.append(f"{who}: {key} was removed – a deadline does not disappear, at most it is moved")
        elif a.get(key) and b.get(key) and a[key] != b[key]:
            if not any(e.get("from") == a[key] and e.get("to") == b[key] for e in vb[len(va):] if isinstance(e, dict)):
                errors.append(f"{who}: {key} changed from {a[key]} to {b[key]} without an entry in moved "
                              f'(append: {{"on": "<today>", "from": "{a[key]}", "to": "{b[key]}"}})')
    old_t = {f.get("id"): f for f in old.get("tasks", [])}
    for f in new.get("tasks", []):
        if f.get("id") in old_t:
            compare(f"task {f.get('id')}", old_t[f["id"]], f, "due")
    old_m = {m.get("id"): m for m in old.get("milestones", []) or []}
    new_m = {m.get("id"): m for m in new.get("milestones", []) or []}
    for mid, m in old_m.items():
        if mid not in new_m:
            errors.append(f"milestone {mid}: was deleted – milestones stay (lost ones too)")
        else:
            compare(f"milestone {mid}", m, new_m[mid], "date")
    return errors


def outlook(world: dict) -> list[str]:
    """A short look at the next decisions (16:00 on the day after the deadline)."""
    try:
        as_of = date.fromisoformat(world["meta"]["as_of"])
    except (KeyError, ValueError):
        return []
    ms_of = {}
    for m in world.get("milestones", []) or []:
        for fid in m.get("tasks", []) or []:
            ms_of.setdefault(fid, m)
    lines = []
    for f in world.get("tasks", []):
        due = f.get("due") or (ms_of.get(f.get("id")) or {}).get("date")
        if not due or f.get("status") in ("done", "dropped"):
            continue
        d = date.fromisoformat(due)
        days = (d - as_of).days
        if days < -1:
            lines.append(f"  🔥 {f['id']}: deadline {due} missed – burned down. A new deadline only if you set one.")
        elif days <= 7:
            lines.append(f"  ⚔ {f['id']}: deadline {due}, decision {(d + timedelta(days=1)).isoformat()} 16:00")
    return lines


def main() -> int:
    try:  # Windows consoles: do not fail on arrows and symbols with cp1252
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass
    source = FOLDER / "world.json"
    try:
        world = json.loads(source.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        print(f"ERROR: cannot read {source}: {e}")
        return 1
    if any(k in world for k in OLD_KEYS):
        print("ERROR: world.json is in the old German format. Convert it once: python .ai/ganttfort/convert_world.py old.json")
        return 1

    # take over the project plan (plan.mmd) first: it is the source of deadlines and milestones
    plan, plan_errors = read_plan(FOLDER / "plan.mmd")
    if plan_errors:
        print("ERROR in plan.mmd:")
        for f in plan_errors:
            print("  -", f)
        return 1
    if plan:
        before = json.dumps(world, ensure_ascii=False, sort_keys=True)
        changes, sync_errors = sync(world, plan)
        if sync_errors:
            print("ERROR while syncing plan.mmd:")
            for f in sync_errors:
                print("  -", f)
            return 1
        if json.dumps(world, ensure_ascii=False, sort_keys=True) != before:
            source.write_text(json.dumps(world, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if changes:
            print("Plan:")
            for a in changes:
                print("  -", a)

    errors = check(world)
    old = last_world()
    if old and not errors and not any(k in old for k in OLD_KEYS):
        errors += check_deadlines_kept(old, world)
    if errors:
        print("ERROR in world.json:")
        for f in errors:
            print("  -", f)
        return 1

    js = "// generated from world.json – do not edit by hand\nwindow.GANTTFORT_WORLD = " \
         + json.dumps(world, ensure_ascii=False, indent=1) + ";\n"
    (FOLDER / "world-data.js").write_text(js, encoding="utf-8")

    tasks = world.get("tasks", [])
    missing = [f["id"] for f in tasks if f.get("status") in ("done", "dropped") and not f.get("ended")]
    if missing:
        print(f"Note: {len(missing)} tasks without 'ended' – the timeline and the houses need dates "
              f"(the next /world-update fills them in).")
    count = lambda s: sum(1 for f in tasks if f.get("status") == s)
    ol = outlook(world)
    if ol:
        print("Deadlines:")
        print("\n".join(ol))
    print(f"OK – {len(tasks)} tasks: {count('done')} done, {count('in_progress')} in progress, "
          f"{count('planned')} planned. world-data.js written.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
