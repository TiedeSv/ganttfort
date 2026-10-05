# Daily world update

You update my project world: a hex map (`.ai/ganttfort/world.html`) that reads its data from
`.ai/ganttfort/world.json`. I open it once a day to get up to date.
**I want to read the map, not the chat.** So keep the chat answer short; everything important is on the map.

## Steps

0. **Project rules:** If `.ai/ganttfort/rules.md` exists, read it first. It takes priority over everything here
   (repos, regions, type mapping, building sites, explanation format, off-limits folders).
   If it names several repos, do steps 2–3 for every repo; the result goes into one `world.json`.
1. **Read the old state:** `.ai/ganttfort/world.json`. The date is in `meta.as_of`.
   If the file is missing, create it (format below) and start with the last ~2 weeks.
2. **What happened?** Since `meta.as_of`:
   - `git log --since=<meta.as_of> --stat` (other branches too, if it makes sense)
   - `git status` and `git diff` → open work = **building sites**
   - new or resolved `TODO`/`FIXME` in the code
3. **Update the tasks:**
   - First set `"new": false` on **all** tasks.
   - **Dates (for the time-lapse, houses, traffic):** `ended` = day the task was done/dropped
     (commit or merge date). `started` = day the work on it started (first commit or branch creation).
     For building sites set `started` and keep it when the task is done. If `ended` is missing on old tasks, fill it in from
     `git log` (search for the subject in `source`). Format always `YYYY-MM-DD`.
   - Finished work → `"status": "done"`, `"ended": <date>`, `"new": true`.
   - Work in progress right now (uncommitted, open branch) → `"in_progress"`, `"new": true` if it is new.
   - **Planned:** What do you think has to happen next? Think for yourself
     (missing tests, open TODOs, follow-up work from commits, risks). 3–8 tasks, concrete.
   - Work that will no longer be done → `"dropped"` with the reason in `check`.
   - Do not delete tasks. Keep existing `id`s, regions and explanations.
   - **Deadlines and milestones come from the project plan** `.ai/ganttfort/plan.mmd`; `check_world.py` transfers them.
     Do not touch `due`, `moved`, `planned_start` and `milestones` in `world.json`, and change `plan.mmd`
     only when I say so. If there is no plan yet, write half a sentence in the report: "No plan yet: `/world-plan`".
   - **Set `ended` honestly:** For tasks with a deadline, `ended` decides between victory and fire (done by 16:00
     on the day after the deadline = victory). Use the real commit or merge date, never an earlier one.
   - Group many small commits into one task. One task = one piece of work I recognize.
   - **Git per task** (for the history, Gantt dots and the task panel), for new and changed tasks:
     `commits` = the related commits, newest first, at most 12: `{ "hash": "a41f9c2", "date": "YYYY-MM-DD",
     "text": "Subject", "repo": "<repo-id>" }`. Keep existing entries, add new ones at the front.
     `branch` = branch of the building site. `pr` = `{ "number": "!812", "status": "open|draft|merged|closed", "url": "…" }`,
     if there is a pull request (from `Merged PR …` commits or the open PR of the branch, see `rules.md`).
4. **Explanations** (required for everything that is `new` or `in_progress`, otherwise optional):
   format as in `AGENTS.md`, as fields in `explanation`:
   - `picture`: everyday analogy, 1–2 sentences
   - `learn`: translation into my learning language (`meta.learning_language`, default Python), ≤ 6 lines, shows the logic
   - `code`: the real excerpt from the code, ≤ 6 lines (optional; the language is in `meta.code_language`)
   - `pitfall`: 1 sentence, only if there is one (the heading is in `meta.pitfall_title`)
   - `check`: 1 sentence, the one place to check yourself (required for building sites)
5. **Architecture diagram:** `diagram.text` = 2–3 sentences that explain today's diagram:
   where something is moving right now, which dependency is affected, what depends on it next.
   Change `diagram.edges` only if the
   structure really changed. The map draws building sites, the plan and numbers itself.
6. **Report:** `report` = 2–3 sentences on what happened since yesterday, **at most 450 characters** (it is shown in full at the top of the Status tab; `check_world.py` refuses longer ones).
   If a decision was made since the last state (deadline + 1 day, 16:00), name it in half a sentence
   ("Tickets defended" / "Storm warnings burned down"). The output of `check_world.py` shows the next deadlines.
   `log`: append one line for today. `meta.as_of` = today's date.
6b. **Housekeeping:** fill in `housekeeping` (only the main repo `meta.main_repo`, without off-limits folders):
   `files` = number of versioned files (`git ls-files | wc -l`), `folders` = number of folders in the top two levels,
   `new` = files created since `meta.as_of`, `overview` = path of the central overview (default `OVERVIEW.md`).
   `note` = 1–2 sentences: Is the overview up to date? Are there duplicates, orphaned files or files/folders that could be merged?
   If everything is tidy, say so briefly. Do not delete or move anything, only point it out.
7. **Check:** `python .ai/ganttfort/check_world.py`. This also transfers the project plan. Fix all errors until it says "OK".
   If the sync reports a task from the plan with a different id than its task in the world, align the id **in the plan** (only the id, no dates).
8. **Chat answer:** at most 2 lines, e.g.
   "World updated: 3 new tasks, 1 building site. Open `.ai/ganttfort/world.html`."

## Format of world.json

```json
{
  "meta": { "project": "Name", "as_of": "YYYY-MM-DD",
            "repos": { "<repo-id>": { "name": "…", "pitfall_label": "Pitfall", "code": "py" } },
            "main_repo": "<repo-id of this repo>", "learning_language": "Python", "theme": "medieval|scifi|…", "lang": "en|de" },
  "report": "2–3 sentences, at most 450 characters",
  "housekeeping": { "overview": "OVERVIEW.md", "files": 0, "folders": 0, "new": 0, "note": "1–2 sentences" },
  "regions": [
    { "id": "app", "repo": "<repo-id>", "name": "App screens", "biome": "meadow", "description": "1 sentence" }
  ],
  "tasks": [
    { "id": "kebab-case-unique", "region": "app", "type": "bugfix", "status": "done",
      "title": "short, something I recognize", "started": "YYYY-MM-DD", "ended": "YYYY-MM-DD", "new": true, "source": "Commit subject",
      "due": "…", "planned_start": "…", "moved": [ … ], "after": ["predecessor-id"],   ← written only by check_world.py from plan.mmd
      "branch": "feature/tickets", "pr": { "number": "#42", "status": "open", "url": "…" },
      "commits": [ { "hash": "a41f9c2", "date": "YYYY-MM-DD", "text": "Subject", "repo": "<repo-id>" } ],
      "files": ["path/relative/to/this/repo.md", "<other-repo-id>:src/…"],
      "explanation": { "picture": "…", "learn": "…", "code": "…", "pitfall": "…", "check": "…" } }
  ],
  "milestones": [ { "id": "kebab-case", "title": "…", "date": "YYYY-MM-DD", "tasks": ["task-id"], "moved": [] } ],
  "log": [ { "date": "YYYY-MM-DD", "text": "1 line" } ],
  "diagram": { "text": "2–3 sentences", "direction": "LR",
               "edges": [ { "from": "app", "to": "server" },
                          { "from": "repo:<repo-id>", "to": "app", "text": "Data", "kind": "flow" } ] }
}
```

Planned tasks land at the island edge automatically; the map fills in forests, meadows and ponds itself.
You do not need to care about positions.

**Diagram edges:** `A → B` means "A depends on B" (leave out `kind`). `"kind": "flow"` = dashed
arrow for data flow. `from`/`to` are region ids or `repo:<id>` for a whole repo.
A region can have `"steps": ["Step 1", "Step 2", …]`; then the diagram shows its inner flow.

**Regions** = islands = large areas of the project (usually top-level folders under `src/`).
4–8 of them. `biome`: `meadow`, `forest`, `steppe`, `rock`, `sand`, `snow`, `volcano`
(every island a different one; it decides the landscape of the island).

**type** decides the building:

| type | kind of work | building (medieval) | when |
|---|---|---|---|
| `feature` | Create | Farmstead | something new is made |
| `bugfix` | Fix | Smithy | an error or something wrong was fixed |
| `refactor` | Rework | Windmill | rebuilt, cleaned up, same goal |
| `test` | Check | Watchtower | tests, control, proofreading |
| `infra` | Foundations | Zeppelin field | build, CI, tools, setup |
| `docs` | Write | Scriptorium | documentation, texts, reports |
| `research` | Research | Observatory | investigated, nothing built yet |
| `experiment` | Try out | Alchemist's tower | attempt, prototype, trial run |
| `typing` | Structure | Stonemason's lodge | structure, templates, formalities |
| `pipeline` | Process | Granary | recurring processes, collecting and evaluating data |
| `performance` | Improve | House (Watermill locked) | faster, leaner, nicer |
| `handoff` | Handover | House (Landing stage locked) | hand over, submit, deliver |
| `api` | Coordinate | House (Town gate locked) | clearing things with others, interfaces |
| `other` | Other | House | everything that fits no other kind |

**status:** `done` (building) · `in_progress` (building site) · `planned` (blueprint) · `dropped` (abandoned)

**Deadlines** (`due`, `moved`, `milestones`): The map calculates attack waves, victories, fires and
ruins from them itself. You do not enter anything for that: no ruins, no positions.
