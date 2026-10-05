"""Reads the project plan (.ai/ganttfort/plan.mmd, Mermaid Gantt) and syncs it into world.json.

The plan is the only source of deadlines and milestones:
- End date of a task = deadline (`due`), start date = planned start (`planned_start`).
- If an end date changes, the sync appends an entry to `moved` automatically.
- Tasks that do not exist in the world yet are added as `planned`.
- While `%% draft` is in the plan, nothing happens: the plan counts once you delete that line.

Supported Mermaid lines (a subset, everything else is ignored):
    section <region name or id>
    Title :id, 2026-10-01, 2026-10-09         start, end (end = deadline)
    Title :id, 2026-10-01, 5d                 start, duration in calendar days
    Title :id, after other-id, 3d             starts the day after other-id
    Title :crit, id, 2026-10-01, 2026-10-09   tags (done, active, crit) in front are allowed
    Beta  :milestone, beta, 2026-10-15, 0d    milestone on a date
    Beta  :milestone, beta, after a b, 0d     milestone when a and b should be done
    %% beta includes: a b c                   which tasks belong to a milestone
    %% package api-2: API 2.0 = a b c         large package: an umbrella over several tasks
"""
from __future__ import annotations

import re
from datetime import date, timedelta
from pathlib import Path

TAGS = {"done", "active", "crit", "milestone"}
DURATION = re.compile(r"^(\d+(?:\.\d+)?)\s*([dwh])$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
TYPE_WORDS = [  # first matching rule wins; the agent can correct the type later
    ("bugfix", ("fix", "bug", "fehler", "error")), ("test", ("test", "review", "check")),
    ("docs", ("doc", "manual", "handbuch", "readme", "guide", "write-up")),
    ("refactor", ("refactor", "rework", "cleanup", "clean up", "rename", "umbau", "aufräum")),
    ("performance", ("perf", "faster", "speed", "optimi", "schneller")),
    ("api", ("meeting", "align", "approval", "request", "api", "absprache", "abstimm", "freigabe")),
    ("infra", ("build", "ci", "setup", "set up", "install", "tooling", "einricht")),
    ("research", ("research", "investigat", "analys", "spike", "untersuch", "recherche")),
    ("experiment", ("experiment", "prototype", "try", "trial", "probe", "prototyp", "versuch")),
    ("typing", ("structure", "template", "form", "typing", "vorlage", "formular", "struktur")),
    ("pipeline", ("pipeline", "export", "import", "evaluat", "generat", "auswert")),
    ("handoff", ("handoff", "hand over", "handover", "submit", "release", "übergabe")),
]


def kebab(t: str) -> str:
    t = t.lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:48] or "task"


def guess_type(title: str) -> str:
    t = title.lower()
    for typ, words in TYPE_WORDS:
        if any(w in t for w in words):
            return typ
    return "feature"


def read_plan(path: Path) -> tuple[dict | None, list[str]]:
    """Mermaid Gantt -> {draft, tasks[], milestones[], packages[]}; second result: errors."""
    if not path.exists():
        return None, []
    errors, tasks, milestones, includes, packages = [], [], [], {}, []
    draft, section, prev_end = False, None, None
    end_of: dict[str, date] = {}
    for no, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        z = raw.strip()
        if not z or z.startswith("%%{"):
            continue
        if z.startswith("%%"):
            body = z[2:].strip()
            if body.lower() == "draft":
                draft = True
            p = re.match(r"^package\s+([\w-]+)\s*:\s*(.+?)\s*=\s*(.+)$", body, re.I)
            if p:
                packages.append({"id": p.group(1), "title": p.group(2).strip(), "tasks": re.split(r"[\s,]+", p.group(3).strip())})
                continue
            m = re.match(r"^([\w-]+)\s+includes\s*:\s*(.+)$", body, re.I)
            if m:
                includes.setdefault(m.group(1), []).extend(re.split(r"[\s,]+", m.group(2).strip()))
            continue
        word = z.split()[0].lower()
        if word in ("gantt", "title", "axisformat", "excludes", "includes", "todaymarker", "tickinterval", "weekday", "displaymode"):
            continue
        if word == "dateformat":
            if "YYYY-MM-DD" not in z:
                errors.append(f"plan.mmd line {no}: only 'dateFormat YYYY-MM-DD' is supported")
            continue
        if word == "section":
            section = z[7:].strip()
            continue
        if ":" not in z:
            continue
        title, meta = z.split(":", 1)
        title = title.strip()
        parts = [t.strip() for t in meta.split(",") if t.strip()]
        tags = []
        while parts and parts[0].lower() in TAGS:
            tags.append(parts.pop(0).lower())
        tid, start_s, end_s = None, None, None
        if len(parts) >= 3:
            tid, start_s, end_s = parts[0], parts[1], parts[2]
        elif len(parts) == 2:
            start_s, end_s = parts
        elif len(parts) == 1:
            end_s = parts[0]
        tid = tid or kebab(title)
        preds = []
        # start
        if start_s is None:
            start = (prev_end + timedelta(days=1)) if prev_end else None
        elif start_s.lower().startswith("after"):
            before = start_s.split()[1:]
            missing = [v for v in before if v not in end_of]
            if missing:
                errors.append(f"plan.mmd line {no}: 'after {' '.join(missing)}' – this id is not further up in the plan")
                continue
            start = max(end_of[v] for v in before) + timedelta(days=1)
            preds = before
            if "milestone" in tags:
                includes.setdefault(tid, []).extend(before)
        elif DATE.match(start_s):
            start = date.fromisoformat(start_s)
        else:
            errors.append(f"plan.mmd line {no}: start '{start_s}' is neither YYYY-MM-DD nor 'after <id>'")
            continue
        if start is None:
            errors.append(f"plan.mmd line {no}: '{title}' has no start")
            continue
        # end = deadline (for a duration: the last working day, calendar days)
        if end_s and DATE.match(end_s):
            end = date.fromisoformat(end_s)
        elif end_s and DURATION.match(end_s):
            n, unit = DURATION.match(end_s).groups()
            days = float(n) * (7 if unit == "w" else 1 / 24 if unit == "h" else 1)
            end = start + timedelta(days=max(0, round(days) - 1)) if "milestone" not in tags else start
        else:
            errors.append(f"plan.mmd line {no}: end '{end_s}' is neither YYYY-MM-DD nor a duration like 5d")
            continue
        if "milestone" in tags:
            end = start if not (start_s or "").lower().startswith("after") else start - timedelta(days=1)
            milestones.append({"id": tid, "title": title, "date": end.isoformat(), "section": section})
        else:
            if end < start:
                errors.append(f"plan.mmd line {no}: '{title}' ends before it starts")
            tasks.append({"id": tid, "title": title, "start": start.isoformat(), "due": end.isoformat(), "section": section,
                          "after": preds, "critical": "crit" in tags})
        end_of[tid] = end
        prev_end = end
    for m in milestones:
        m["tasks"] = list(dict.fromkeys(includes.get(m["id"], [])))
    ids = [a["id"] for a in tasks] + [m["id"] for m in milestones]
    double = {i for i in ids if ids.count(i) > 1}
    if double:
        errors.append(f"plan.mmd: duplicate id: {', '.join(sorted(double))}")
    id_set = set(ids)
    for p in packages:
        missing = [i for i in p["tasks"] if i not in id_set]
        if missing:
            errors.append(f"plan.mmd: package {p['id']} names ids that are not in the plan: {', '.join(missing)}")
    if len({p["id"] for p in packages}) != len(packages):
        errors.append("plan.mmd: duplicate package id")
    return {"draft": draft, "tasks": tasks, "milestones": milestones, "packages": packages}, errors


def sync(world: dict, plan: dict, today: str | None = None) -> tuple[list[str], list[str]]:
    """Transfers the plan into world.json. Result: (changes, errors)."""
    today = today or date.today().isoformat()
    changes, errors = [], []
    regions = world.get("regions", [])

    def region_for(section):
        if not section:
            return None
        s = section.strip().lower()
        for r in regions:
            if s in (str(r.get("id", "")).lower(), str(r.get("name", "")).lower()):
                return r["id"]
        return None

    world.setdefault("meta", {})["plan"] = {"file": "plan.mmd", "draft": plan["draft"],
                                            "tasks": len(plan["tasks"]), "milestones": len(plan["milestones"])}
    if plan["draft"]:
        return ["The plan is a draft (%% draft) – no deadlines taken over yet"], []
    tasks = world.setdefault("tasks", [])
    by_id = {f.get("id"): f for f in tasks}
    by_title = {str(f.get("title", "")).lower(): f for f in tasks}

    def set_deadline(obj, key, new, who):
        old = obj.get(key)
        if old == new:
            return
        if old:
            obj.setdefault("moved", []).append({"on": today, "from": old, "to": new})
            changes.append(f"{who}: deadline {old} -> {new} (recorded as moved)")
        else:
            changes.append(f"{who}: deadline {new}")
        obj[key] = new

    for a in plan["tasks"]:
        f = by_id.get(a["id"]) or by_title.get(a["title"].lower())
        if f is None:
            reg = region_for(a["section"])
            if not reg:
                errors.append(f"plan.mmd: task '{a['title']}' is new, but section '{a['section']}' matches no region "
                              f"({', '.join(r.get('name', r['id']) for r in regions)})")
                continue
            f = {"id": a["id"], "region": reg, "type": guess_type(a["title"]), "status": "planned", "title": a["title"],
                 "new": True}
            tasks.append(f)
            by_id[f["id"]] = f
            changes.append(f"{a['id']}: new planned task ({f['type']}, {reg})")
        if a["id"] != f["id"]:
            errors.append(f"plan.mmd: '{a['title']}' has id '{a['id']}', the task in the world is '{f['id']}' – change the id in the plan")
            continue
        f["planned_start"] = a["start"]
        for k, v in (("after", a["after"]), ("critical", a["critical"])):
            if v:
                f[k] = v
            else:
                f.pop(k, None)
        f["from_plan"] = True                          # comes from your project plan
        set_deadline(f, "due", a["due"], f["id"])

    ms_list = world.setdefault("milestones", [])
    ms_by = {m.get("id"): m for m in ms_list}
    for pm in plan["milestones"]:
        m = ms_by.get(pm["id"])
        if m is None:
            m = {"id": pm["id"], "title": pm["title"], "date": pm["date"], "tasks": []}
            ms_list.append(m)
            changes.append(f"Milestone {pm['id']}: new on {pm['date']}")
        else:
            set_deadline(m, "date", pm["date"], f"Milestone {pm['id']}")
        m["title"] = pm["title"]
        unknown = [i for i in pm["tasks"] if i not in by_id]
        if unknown:
            errors.append(f"plan.mmd: milestone {pm['id']} includes unknown ids: {', '.join(unknown)}")
        if pm["tasks"] and pm["tasks"] != m.get("tasks"):
            m["tasks"] = [i for i in pm["tasks"] if i in by_id]
            changes.append(f"Milestone {pm['id']}: includes {', '.join(m['tasks'])}")
        reg = region_for(pm["section"])
        if reg:
            m["region"] = reg

    # Large packages come entirely from the plan (no deadline of their own; end = latest end of their tasks)
    new_packages = [{"id": p["id"], "title": p["title"], "tasks": p["tasks"]} for p in plan.get("packages", [])]
    if new_packages != world.get("packages", []):
        if new_packages or "packages" in world:
            changes.append(f"Large packages: {', '.join(p['id'] for p in new_packages) or 'none'}")
        world["packages"] = new_packages

    in_plan = {a["id"] for a in plan["tasks"]}
    for f in tasks:
        if f.get("due") and f.get("id") not in in_plan and f.get("status") not in ("done", "dropped"):
            changes.append(f"Note: {f['id']} has a deadline but is no longer in the plan – the deadline stays. "
                           f"Not needed any more? Then set it to 'dropped'.")
    return changes, errors
