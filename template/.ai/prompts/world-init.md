# Set up the project world for a project (`/world-init`)

You set up the project world for **this** repository: profile, rules, islands, first tasks, project plan.
The engine is already there (`.ai/ganttfort/world.html`, `check_world.py`, `plan_sync.py`, `themes/`). You only create the
project-specific files.

## 0. Do not overwrite anything
- If `.ai/ganttfort/world.json` with tasks already exists, **stop** and ask whether I want to start over. If I say yes:
  first copy to `.ai/ganttfort/old-<YYYY-MM-DD>/` (world.json, plan.mmd, rules.md, profile.md).
- `.github/copilot-instructions.md` and other existing instructions stay untouched.

## 1. Four short questions (in **one** message, with a suggestion; without an answer you take the suggestion)
1. **Which repos belong to it?** Suggestion: only this one. Others with path and "only my commits?".
2. **Which language do you understand well, which hardly at all?** Suggest one based on the code (→ `meta.learning_language`, "About me").
3. **Which theme?** `medieval` (default), `scifi` or a custom one from `.ai/ganttfort/themes/` (→ `meta.theme`).
4. **Interface language of the map?** `en` or `de`. Suggestion: the language I write in (→ `meta.lang`).
After my answer (or without one) you work through to the end **without further questions**.

## 2. Profile
Follow `.ai/prompts/world-profile.md` for all named repos → `.ai/ganttfort/profile.md`.

## 3. Rules
Write `.ai/ganttfort/rules.md` from the template `.ai/ganttfort/templates/rules.template.md`, filled in from the profile:
repos, off-limits folders, 4–8 regions (ids short, kebab-case, **every island a different biome**), type mapping from the
actual commit conventions, how to recognize building sites and "done". Do not leave any placeholders.

## 4. Skeleton `.ai/ganttfort/world.json`
```json
{ "meta": { "project": "<Name>", "as_of": "<yesterday>", "main_repo": "<id>", "learning_language": "<Language>",
            "theme": "medieval", "lang": "<en|de>",
            "repos": { "<id>": { "name": "<Name>", "pitfall_label": "<Language> pitfall", "code": "<py|cpp|ts|…>" } } },
  "report": "New world: …", "regions": [ { "id": "…", "repo": "…", "name": "…", "biome": "…", "description": "1 sentence" } ],
  "tasks": [], "log": [ { "date": "<today>", "text": "World set up" } ],
  "diagram": { "text": "…", "direction": "LR", "edges": [ { "from": "a", "to": "b" } ] } }
```
`as_of` = yesterday, so that the first update covers the last days. Edges from the dependencies in the profile.

## 5. "About me" in `AGENTS.md`
Replace the placeholder in the section "About me" with 2–4 bullet points:
which languages I understand well or hardly at all, which language you answer in, which repos exist and what belongs where,
whether there are other instruction files.
In the section "Maintaining the world", name the prefix for other repos (`<repo-id>:path`).

## 6. First tasks
Follow `.ai/prompts/world-update.md`, but with a **start window of 4 weeks** (`git log --since="4 weeks ago"`):
finished work as tasks (grouped, one piece of work = one task, with `started`/`ended`), open branches as building sites,
3–8 planned tasks. Explanations only for building sites and the 5 most recent finished tasks.

## 7. Project plan
Follow `.ai/prompts/world-plan.md` → `.ai/ganttfort/plan.mmd` with `%% draft`.

## 8. Check and show
`python .ai/ganttfort/check_world.py` until "OK". Then open `.ai/ganttfort/world.html` (or tell me the path).

## 9. Answer (at most 8 lines)
Regions with biome, number of tasks (done/building site/planned), theme, interface language, where the plan comes from,
and the next steps:
"Check the plan in `.ai/ganttfort/plan.mmd` → delete `%% draft` → from then on run `/world-update` every morning."
