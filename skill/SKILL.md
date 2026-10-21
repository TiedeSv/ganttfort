---
name: ganttfort
description: "Ganttfort turns a project plan into a 3D medieval island world (every task a building, every deadline a wave of attackers). Use it to set up Ganttfort in a code repository (Claude Code), to create a Ganttfort Artifact in the claude.ai chat, to update an existing Ganttfort Artifact to the current version, or to read and change a world: tasks, deadlines, milestones, large packages, status. Also for moving a world between a repo and an Artifact, and for old German \"Projektwelt\" worlds."
---

# Ganttfort

Ganttfort shows a project as a world of islands. Every task is a building on an island (region). A deadline brings
attackers: *Deadline ahead* (scouts, 2–7 days before), *Final stretch* (war airship at the island edge, 1–3 days before),
*Due today* (siege), *Overdue* (battle all of the next day), and the **hand-in on the day after the deadline at 16:00**.
Done by then (`done_at` counts to the minute): the attackers are beaten back. Otherwise the building burns down; the ruin
stays forever and slowly overgrows, the rebuild appears at the island edge. Milestones are castles, large packages are
church buildings.

Speak with the person in their language. The world itself has an English interface; `meta.lang: "de"` switches it to German.

## Which way?

| Situation | Go to |
|---|---|
| You work in a code repository with file and shell tools (Claude Code) | **R** – Ganttfort in a repo |
| claude.ai chat, the person wants their own world | **A1** – new Artifact |
| claude.ai chat, a Ganttfort Artifact already exists (link given or found in the person's artifacts) | **A2** – change the world, **A3** – update the engine |
| A `world.json` from a repo should go into an Artifact, or the other way round | **A4** |

This skill ships **Ganttfort {{VERSION}}**. Files that come with it: `artifact/` (the Artifact version: text files only;
three.js loads from cdn.jsdelivr.net and the fonts from Google Fonts, both allowed in Artifacts) and
`ganttfort-template.zip` (what goes into a repo).

Which version runs where: an Artifact shows it in the tab *Project* (and `app.js` contains `const VERSION = "…"`),
a repo has it in `.ai/ganttfort/VERSION`. If either is older than {{VERSION}}, offer the update (A3 or R step 2).

## Rules for every change to a world

These are the same rules the page and `check_world.py` enforce. Follow them in every way below.

1. **Deadlines and milestone dates only when the person explicitly asks.** Never on your own, not even to save a building.
2. **Every move of a deadline is appended, never silent:** `moved += {"on": today, "from": old, "to": new, "reason": "…"}`,
   then `due` (task) or `date` (milestone) = new. Never change or delete earlier entries. A first deadline is set directly.
3. **New deadlines are today at the earliest.**
4. **Milestones are never deleted**, lost ones neither. Tasks with a deadline are not deleted but set to `dropped`.
5. **Done and dropped count from now:** `ended` = today, `done_at` = current ISO time; never backdate. Whoever ticks a task
   off after 16:00 on the hand-in day no longer saves the building – that is intended. Exception: when a world is first
   set up, tasks that were already finished and have no deadline may get a past `ended`.
6. `in_progress` gets `started` = today if it is empty.
7. Consistency: `after`, `milestones[].tasks` and `packages[].tasks` only point to existing tasks; a task belongs to at
   most one package; tasks without their own deadline inherit the date of their milestone.
8. No credentials and no sensitive personal data in a world. `report` has at most 450 characters.

Before the scouts arrive (*Deadline ahead*), moving a deadline leaves no trace. Afterwards, siege gear stays behind.
With duration = days from `started` (or `planned_start`) to the deadline d: *Deadline ahead* starts at
d − clamp(round(0.4 · duration), 2, 7) days, *Final stretch* at d − clamp(round(0.15 · duration), 1, 3) days, both at 08:00.

## World format (`world.json` and the Artifact database)

```json
{
  "meta": {"project": "Moving to Jena", "as_of": "YYYY-MM-DD", "theme": "medieval", "lang": "en",
           "work_types": {"docs": "Chapter"}},
  "report": "optional, 2–3 sentences, shown at the top of the Status tab",
  "regions": [{"id": "flat", "name": "Flat", "biome": "meadow", "description": "optional"}],
  "tasks": [{
    "id": "movers", "title": "Book the movers", "region": "flat", "type": "api", "status": "in_progress",
    "started": "YYYY-MM-DD", "planned_start": "YYYY-MM-DD", "due": "YYYY-MM-DD",
    "moved": [{"on": "…", "from": "…", "to": "…", "reason": "…"}], "after": ["other-id"], "critical": true,
    "note": "…", "ended": "YYYY-MM-DD", "done_at": "ISO time", "new": true, "created": "YYYY-MM-DD"
  }],
  "milestones": [{"id": "keys", "title": "Key handover", "date": "YYYY-MM-DD", "tasks": ["id"],
                  "region": "optional", "description": "optional", "moved": []}],
  "packages": [{"id": "boxes", "title": "Boxes & transport", "tasks": ["id"]}],
  "log": [{"date": "YYYY-MM-DD", "text": "…"}],
  "rev": 1
}
```

Allowed values:
- **status:** `planned`, `in_progress`, `done`, `dropped`
- **type** (each has its own building): `feature` create · `docs` write · `research` research · `api` coordinate ·
  `test` check · `bugfix` fix · `refactor` rework · `infra` foundations · `performance` improve · `experiment` try out ·
  `pipeline` process · `typing` organise · `handoff` hand over · `other`
- **biome** (landscape of an island, give every region its own): `meadow`, `forest`, `steppe`, `rock`, `sand`, `snow`, `volcano`
- **theme:** `medieval` (maintained, use it) or `scifi`; **lang:** `en` or `de`

Ids are short slugs (a–z, 0–9, -). 1 to 8 regions. Repo worlds may also contain `diagram`, `housekeeping`, `commits`,
`branch`, `pr`, `files`, `explanation`, `source`, `from_plan`; the full key list is in `template/.ai/ganttfort/schema.js`
inside `ganttfort-template.zip`.

## R – Ganttfort in a repo (Claude Code)

1. **Old German version?** If `.ai/welt/` exists, run `python .ai/ganttfort/convert_world.py` after step 2. It writes
   `world.json`, `rules.md`, `profile.md` and `plan.mmd` into `.ai/ganttfort/` and leaves `.ai/welt/` untouched; the person
   deletes it after checking.
2. **Install:** unpack `ganttfort-template.zip` into the repo root. Do not overwrite files the person already has:
   - `AGENTS.md`: keep theirs and append the section *Maintaining the world* from the template's `AGENTS.md`.
   - `CLAUDE.md`: keep theirs; it must load `AGENTS.md` (the template's `CLAUDE.md` is only a pointer to it).
   - `.vscode/settings.json`: add only the two keys from the template.
   - Existing `.ai/ganttfort/world.json`, `plan.mmd`, `rules.md`, `profile.md`: never overwrite (that is the person's world).
   Updating an existing installation is the same unpacking, keeping those files and their `AGENTS.md`/`CLAUDE.md`.
3. **Set up or continue:** for a new world follow `.ai/prompts/world-init.md` (the `/world-init` command). Afterwards the
   person works with `/world-update` (daily), `/world-plan`, `/deadline`, `/milestone`, `/explain`, `/world-theme`.
   Those prompt files are the source for the details – do not invent other rules.
4. Every change ends with `python .ai/ganttfort/check_world.py` until it reports OK. The world opens as
   `.ai/ganttfort/world.html` in a browser, without a server.

## A1 – new Artifact in the claude.ai chat

1. Ask briefly for what is missing: project name, main areas (become regions), known tasks and dates, language.
2. Read `artifact/index.html` once before publishing. The JS files are the engine; skim them for anything unusual
   instead of reading them in full.
3. Publish `artifact/index.html` as a **new** Artifact (no `url`):
   - `icon`: `map`
   - `root`: the folder `artifact`
   - `files`: every other file in `artifact/` under the same path: `world.css`, `world-engine.js`, `app.js`, `schema.js`,
     `i18n.js`, `i18n-en.js`, `demo.js`, `themes/medieval.js`, `LICENSE`, `THIRD_PARTY_NOTICES.md`
   - `capabilities`: `{"db": {"rules": [{"path": "", "read": "owner", "write": "owner"}]}, "user": {}}`
4. Then create the world with `ArtifactData` `set`: collection `project`, document `world`, in the format above,
   `rev: 1`, `meta.theme: "medieval"`, `meta.lang` in the person's language, `log: [{"date": today, "text": "World created"}]`.
   Deadlines and milestones only if the person named them. Alternatively leave the database empty: the owner then sees a
   setup form over the example world, which is fine if the person wants to do it themselves.
5. Say in one sentence what the world shows, and that only the owner sees their world, even when sharing the link.

## A2 – change the world in an existing Artifact

1. `ArtifactData` `get`: collection `project`, document `world`. Keep the version you read.
2. Make the change following the rules above, set `rev` + 1 and `meta.as_of` = today.
3. `ArtifactData` `set` (with the version check if the tool offers it). On a conflict read again and repeat the change.
   The open page notices the new `rev` and rebuilds the world.
4. Say in one sentence what changes in the world, e.g. "The deadline is now 12 Oct; *Deadline ahead* starts on 7 Oct."

If `project/world` does not exist but `projekt/welt` does, this is an old German "Projektwelt" Artifact: update it as in
A3 first. When its owner opens the updated page, the world moves to `project/world` by itself (the old document stays as
a backup). Do not write `projekt/welt`.

## A3 – update an existing Artifact to this version

Publish the files from `artifact/` again exactly as in A1 step 3, but **with the `url` of the existing Artifact** (read it
first). The world lives in the database and is kept. For an old "Projektwelt" Artifact also remove the old engine files by
passing `null` for `welt.css`, `welt-engine.js` and `themen/mittelalter.js`; for an Artifact that still has `three.min.js` or
`fonts/` from an earlier version, pass `null` for those too.

## A4 – between repo and Artifact

The repo leads; an Artifact is a copy. Both use the same format.
- **Repo → Artifact:** read `.ai/ganttfort/world.json` and write it with A2 (keep `rev` counting up from the Artifact's
  value). Deadlines and moves the Artifact already has must still be in it. `diagram` and `housekeeping` are not shown in
  the Artifact and can be left out.
- **Artifact → repo:** `get` the document, drop `rev`, write it to `.ai/ganttfort/world.json`, run `check_world.py`.
  The person can also do this by hand: tab *Project* → *Data* → *Copy as JSON* / *Import JSON*.
- A JSON in the old German format (keys like `felder`, `regionen`) is converted first with
  `python .ai/ganttfort/convert_world.py old.json` (writes `old.en.json`).
