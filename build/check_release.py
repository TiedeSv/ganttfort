#!/usr/bin/env python3
"""Checks the build output before a release. Run after build_all.py:

  python build/check_release.py

1. release/ganttfort.html and the Artifact shell load nothing from the network.
2. An old German world converts with convert_world.py and then passes check_world.py.
3. The skill zip contains SKILL.md, every Artifact file and the template zip.

Only needs Python 3.8+. Exits with 1 on the first failed check.
"""
import json, pathlib, re, shutil, subprocess, sys, tempfile, zipfile

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
RELEASE = ROOT / "release"
ARTIFACT = HERE / "dist" / "artifact"
TEMPLATE = ROOT / "template" / ".ai" / "ganttfort"

OLD_WORLD = {   # a small world in the old German format (.ai/welt/welt.json)
    "meta": {"projekt": "Check", "stand": "2026-10-01", "thema": "mittelalter"},
    "tagesbericht": "A small world for the release check.",
    "regionen": [{"id": "app", "name": "App", "biom": "wiese"}, {"id": "docs", "name": "Docs", "biom": "wald"}],
    "felder": [
        {"id": "login", "region": "app", "typ": "feature", "status": "fertig", "titel": "Login", "begonnen": "2026-09-20", "seit": "2026-09-25"},
        {"id": "guide", "region": "docs", "typ": "doku", "status": "in_arbeit", "titel": "Guide", "begonnen": "2026-09-28",
         "erklaerung": {"bild": "A map for newcomers.", "achte_auf": "The install steps."}},
        {"id": "search", "region": "app", "typ": "probe", "status": "geplant", "titel": "Search prototype"},
    ],
    "chronik": [{"datum": "2026-10-01", "text": "World created"}],
}
failed = []


def check(name, ok, detail=""):
    print(("ok    " if ok else "FAIL  ") + name + (f" – {detail}" if detail and not ok else ""))
    if not ok:
        failed.append(name)


def external_refs(html):
    return re.findall(r'(?:src|href)="(https?://[^"]+)"', html)


# 1. no network
single = (RELEASE / "ganttfort.html").read_text(encoding="utf-8")
check("single file loads nothing from the network", not external_refs(single), str(external_refs(single)[:3]))
shell = (ARTIFACT / "index.html").read_text(encoding="utf-8")
check("Artifact shell loads nothing from the network", not external_refs(shell), str(external_refs(shell)[:3]))
missing = [s for s in re.findall(r'(?:src|href)="([^"]+)"', shell) if not (ARTIFACT / s).exists()]
check("every file the Artifact shell references exists", not missing, str(missing))

# 2. old world -> convert -> check
with tempfile.TemporaryDirectory() as tmp:
    repo = pathlib.Path(tmp)
    shutil.copytree(TEMPLATE, repo / ".ai" / "ganttfort", ignore=shutil.ignore_patterns("world.json", "world-data.js", "plan.mmd", "__pycache__"))
    (repo / ".ai" / "welt").mkdir(parents=True)
    (repo / ".ai" / "welt" / "welt.json").write_text(json.dumps(OLD_WORLD, ensure_ascii=False), encoding="utf-8")
    run = lambda script: subprocess.run([sys.executable, str(repo / ".ai" / "ganttfort" / script)], cwd=repo,
                                        capture_output=True, text=True, encoding="utf-8", errors="replace")
    r = run("convert_world.py")
    check("convert_world.py converts an old German world", r.returncode == 0 and (repo / ".ai" / "ganttfort" / "world.json").exists(), r.stdout + r.stderr)
    r = run("check_world.py")
    check("check_world.py accepts the converted world", r.returncode == 0 and (repo / ".ai" / "ganttfort" / "world-data.js").exists(), r.stdout + r.stderr)
    world = json.loads((repo / ".ai" / "ganttfort" / "world.json").read_text(encoding="utf-8")) if (repo / ".ai" / "ganttfort" / "world.json").exists() else {}
    task = {t["id"]: t for t in world.get("tasks", [])}
    check("converted values are English", task.get("guide", {}).get("type") == "docs" and task.get("search", {}).get("type") == "experiment"
          and task.get("login", {}).get("status") == "done" and world.get("meta", {}).get("theme") == "medieval", json.dumps(task)[:200])

# 3. skill zip
with zipfile.ZipFile(RELEASE / "ganttfort-skill.zip") as z:
    names = set(z.namelist())
need = {"ganttfort/SKILL.md", "ganttfort/ganttfort-template.zip"} | {"ganttfort/artifact/" + p.relative_to(ARTIFACT).as_posix() for p in ARTIFACT.rglob("*") if p.is_file()}
check("skill zip contains SKILL.md, the Artifact files and the template", need <= names, str(sorted(need - names)[:5]))

print("\nAll checks passed." if not failed else f"\n{len(failed)} check(s) failed.")
sys.exit(1 if failed else 0)
