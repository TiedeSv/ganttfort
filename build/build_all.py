#!/usr/bin/env python3
"""One build step for everything.

  python build/build_all.py [--update N]

1. build_artifact.py     -> build/dist/artifact/  (Artifact version, several files) + template demo world
2. build/dist/roadmap/   -> copy with its own title (the owner's roadmap world)
3. build/dist/tour/      -> copy plus the guided tour (build/examples/tour.js), the public live demo
4. build_single_file.py  -> build/dist/single/ganttfort.html (everything in one file, works offline)
5. release/              -> ganttfort.html, ganttfort-template.zip (the template folder),
                            ganttfort-skill.zip (skill/SKILL.md + the Artifact files + the template zip),
                            with --update N: ganttfort-update-N.zip (without your own files)

Only needs Python 3.8+. dist/ and release/ are build output and not checked in.
"""
import pathlib, shutil, subprocess, sys, zipfile

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
RELEASE = ROOT / "release"
VERSION = (ROOT / "VERSION").read_text(encoding="utf-8").strip()
VORLAGE = ROOT / "template"
DIST = HERE / "dist"

UPDATE_DATEIEN = [   # everything except your own files (AGENTS.md, CLAUDE.md, world.json, world-data.js, plan.mmd, rules.md, profile.md)
    *[p.relative_to(VORLAGE).as_posix() for p in sorted((VORLAGE / ".ai" / "ganttfort").rglob("*"))
      if p.is_file() and "__pycache__" not in p.parts and p.name not in ("world.json", "world-data.js", "plan.mmd", "rules.md", "profile.md")],
    *[p.relative_to(VORLAGE).as_posix() for d in (".ai/prompts", ".claude/commands", ".github/prompts", ".ai/diagrams")
      for p in sorted((VORLAGE / d).glob("*")) if p.is_file()],
    "GUIDE.md",
]


def run(*args):
    subprocess.run([sys.executable, *map(str, args)], check=True, cwd=HERE)


def zip_folder(target, source, prefix=""):
    target.unlink(missing_ok=True)
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(source.rglob("*")):
            if p.is_file() and "__pycache__" not in p.parts:
                z.write(p, prefix + str(p.relative_to(source)))


def copy_artifact(name, title, extra_script=None):
    target = DIST / name
    shutil.rmtree(target, ignore_errors=True)
    shutil.copytree(DIST / "artifact", target)
    idx = target / "index.html"
    html = idx.read_text(encoding="utf-8").replace("<title>Ganttfort</title>", f"<title>{title}</title>")
    if extra_script:
        shutil.copy(HERE / "examples" / extra_script, target / extra_script)
        html = html.rstrip("\n") + f'\n<script charset="utf-8" src="{extra_script}"></script>\n'
    idx.write_text(html, encoding="utf-8")


def build_skill():
    """release/ganttfort-skill.zip: one skill for Claude Code and the claude.ai chat (folder ganttfort/ inside)."""
    target = RELEASE / "ganttfort-skill.zip"
    target.unlink(missing_ok=True)
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("ganttfort/SKILL.md", (ROOT / "skill" / "SKILL.md").read_text(encoding="utf-8").replace("{{VERSION}}", VERSION))
        for p in sorted((DIST / "artifact").rglob("*")):
            if p.is_file():
                z.write(p, "ganttfort/artifact/" + p.relative_to(DIST / "artifact").as_posix())
        z.write(RELEASE / "ganttfort-template.zip", "ganttfort/ganttfort-template.zip")


def main():
    run(HERE / "build_artifact.py")
    copy_artifact("roadmap", "Ganttfort Roadmap")
    copy_artifact("tour", "Ganttfort Tour", "tour.js")
    run(HERE / "build_single_file.py")
    RELEASE.mkdir(exist_ok=True)
    shutil.copy(DIST / "single" / "ganttfort.html", RELEASE / "ganttfort.html")
    zip_folder(RELEASE / "ganttfort-template.zip", VORLAGE)
    with zipfile.ZipFile(RELEASE / "ganttfort-template.zip", "a", zipfile.ZIP_DEFLATED) as z:
        z.writestr(".ai/ganttfort/VERSION", VERSION + "\n")      # which version a repo runs
    build_skill()

    if "--update" in sys.argv:
        n = sys.argv[sys.argv.index("--update") + 1]
        target = RELEASE / f"ganttfort-update-{n}.zip"
        target.unlink(missing_ok=True)
        with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as z:
            for d in UPDATE_DATEIEN:
                z.write(VORLAGE / d, d)
        print("repo update:", target)
    for p in [RELEASE / "ganttfort-template.zip", RELEASE / "ganttfort-skill.zip", RELEASE / "ganttfort.html"]:
        print(f"{p.name}: {p.stat().st_size/1024:.0f} KB")


if __name__ == "__main__":
    main()
