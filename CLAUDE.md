# Ganttfort – notes for Claude Code (development of this repo)

This file is for working **on** Ganttfort. The file `template/CLAUDE.md` is a different one: it ships to users.

## Talk to the maintainer
- The maintainer (GitHub: TiedeSv) writes German. **Answer in German.** Code, file names, commit messages and everything in the public release are English. The interface is English by default, German via `meta.lang`.
- Every answer that changes or explains something has three parts:
  1. **Was sich geändert hat** – short summary, every changed file as a Markdown link with a relative path and half a sentence on what changed.
  2. **Erklärung** – prose: why it is like this, how the parts connect, what follows. Tables or lists only where they help.
  3. A closing block:
     > **Deine Frage:** exactly one comprehension question about this message whose answer can be found in the code or diff (name the place, not the answer).
     > **Könnte ein Kollege fragen:** optional, 1–2 review-style questions.
- Small, clear changes: just do them and explain afterwards. Larger or risky changes (many files, renames, deletions, data format changes): show the plan first and wait for an OK.
- Ask only if you would otherwise work in the wrong direction; otherwise state your assumption in one sentence and continue.

## Hard rules
- **Nothing from the maintainer's day job** in this repo: no employer, product, customer or project names, no internal paths, no real work data. Examples use the fictional "Harbor Town App" (`build/examples/demo.js`).
- **No personal data, no credentials.** Never commit a real `world.json`, `world-data.js`, `plan.mmd`, `rules.md` or `profile.md` (see `.gitignore`).
- **Deadlines and milestones are set only when the maintainer says so** – never on your own, not even to prevent a building from burning.
- **Only ship what is finished and polished; start with a minimum.** Unfinished buildings stay locked (`gesperrteTypen` in the theme: Stadttor/api, Wassermühle/performance, Anlegestelle/handoff show as Haus).
- Third-party code needs its license in `THIRD_PARTY_NOTICES.md` (root and `template/.ai/ganttfort/`) and `template/.ai/ganttfort/lib/`. Current: three.js (MIT), Mermaid + bundled libs (MIT/ISC/BSD-3/Apache-2.0/Unlicense), fonts (OFL-1.1). No other external code, images, models or sounds.
- Only the medieval theme (`template/.ai/ganttfort/themes/medieval.js`) is maintained; the built-in sci-fi look stays as it is.

## Repository layout
| Path | What |
|---|---|
| `template/` | What users copy into their repo: the world `.ai/ganttfort/world.html` (three.js, ~3700 lines), theme `.ai/ganttfort/themes/medieval.js`, file format `schema.js` (English keys ↔ internal names), interface language `i18n.js` + `i18n-en.js`, checker `check_world.py`, Gantt sync `plan_sync.py`, one-time converter `convert_world.py`, license files, prompts (`.ai/prompts/`, `.claude/commands/`, `.github/prompts/`), `AGENTS.md`, `CLAUDE.md`, `GUIDE.md` |
| `build/build_all.py` | One build step for everything (artifact, roadmap, tour, single file, release zips) |
| `build/build_artifact.py` | Claude Artifact version → `build/dist/artifact/` (several files, storage via the artifact database) |
| `build/build_single_file.py` | Single-file version → `build/dist/single/ganttfort.html` (everything inlined incl. fonts, works offline, no external requests) |
| `build/build_repo_demo.py` | Generates `template/.ai/ganttfort/world-demo.js` from `build/examples/demo.js` – **do not edit `world-demo.js` by hand** |
| `build/examples/tour.js` | Guided tour for the public demo (`build/dist/tour/`) |
| `build/tools/` | `collect_texts.js` / `collect_owner.js` list interface texts per state (find untranslated German), `german_left.py` filters them |
| `build/src/` | Artifact app (`app.js`), shell, fonts, license files |
| `skill/SKILL.md` | The Ganttfort skill (Claude Code and claude.ai chat). `build_all.py` packs it with the Artifact files and the template zip into `release/ganttfort-skill.zip` |
| `release/` | Build output: `ganttfort.html`, `ganttfort-template.zip`, `ganttfort-skill.zip`, `ganttfort-update-N.zip` (not committed) |

## Build and check
```
python build/build_all.py            # Python 3.8+, no other dependencies
```
Then check visually:
- `template/.ai/ganttfort/world.html?demo` in a browser (demo world relative to today; `&now=2026-10-07T15:58` simulates a time, `&lang=de` German interface).
- Single building: `world.html?theme=medieval&preview=<type>:done:meadow[:angle:age:zoom]`.
- Performance: `world.html?demo&debug` exposes `window.__gf` (renderer, scene, ANIM, views) for measuring draw calls, running animations and memory; the performance mode is stored per browser in `localStorage["welt-leistung"]` (`voll`/`normal`/`ruhig`).
- New interface text: write it in German in the source and add the English line to `i18n-en.js` (exact text or pattern). Check with `node build/tools/collect_texts.js <url> out.json` + `python build/tools/german_left.py out.json`. Texts from the world data are never translated.
- `release/ganttfort.html` must open with **no network** and no console errors.

Quality rule for anything visible (buildings, units, landscape): look at it from 3–4 sides up close, and **with houses around it** (age 12 and 25 days). Check for floating parts, parts outside the hex (flat side at 0.87 · radius), twisted beams, hidden gables, overlaps, figures not facing their work, unintended readings (e.g. a crane that looks like a gallows). Only report done when it is clean.

## Game rules in one paragraph
Tasks are buildings on islands (regions). A deadline brings attackers: scouts (2–7 days before, label "Deadline ahead"), camp (1–3 days before, war airship at the island edge, "Final stretch"), siege on the due day ("Due today"), battle the next day ("Overdue"), **hand-in the next day at 16:00**. Labels in the UI use project language, the 3D world shows the medieval story; internal phase keys stay `spaeher/lager/belagerung/schlacht`. Done by then (`done_at` counts to the minute): victory. Otherwise the building burns; the ruin stays forever and slowly overgrows, the rebuild appears at the island edge. Moving a deadline is free before the scouts arrive, afterwards siege gear is left behind. Milestones are castles (held = golden banners), large packages are church buildings. Details: `template/GUIDE.md`.

## Roadmap (dates set by the maintainer)
| Task | Due | Status / notes |
|---|---|---|
| English data format + commands + one-time converter | 07.10.2026 | done 05.10. (hard cut; `schema.js`, `convert_world.py`) |
| Data source (repo leads, Artifact as entry, export/import) | 07.10. | done 05.10.: repo leads, the Artifact is a copy (export/import as JSON, `template/GUIDE.md` → "Repo and Claude Artifact"); old Artifact worlds (`projekt/welt`) move to `project/world` on the owner's first open, the old document stays as a backup |
| Engine + Artifact app on the English format | 09.10. | done 05.10. (engine keeps internal names, converts on load/save) |
| UI texts English by default, German switchable (`meta.lang`) | 10.10. | done 05.10. (`i18n.js`, `i18n-en.js`) |
| English README, guide, agent rules, prompts | 10.10. | done 05.10.; code comments in engine/theme are still German |
| One skill for Claude Code and claude.ai chat | 11.10. | done 06.10.: `skill/SKILL.md` → `release/ganttfort-skill.zip` (repo setup, new Artifact, change a world, update an Artifact, repo ↔ Artifact). Still to try once on claude.ai. The old `projektwelt` skill expects the German format – do not use it any more. |
| Public repo (license, README, sponsor links, releases) | 13.10. | open: GitHub Sponsors + Ko-fi via `.github/FUNDING.yml`; GitHub Action that builds `ganttfort.html` per release. `LICENSE`/`THIRD_PARTY_NOTICES.md` already moved to `template/.ai/ganttfort/`. |
| Tour world as public live demo | 14.10. | English tour (`build/dist/tour/`); fonts and three.js are shipped with the Artifact version since 06.10. (no network requests). Open: publish it. |

The roadmap is also kept as a Ganttfort world in a claude.ai Artifact owned by the maintainer; update it from a claude.ai session, not from here.
