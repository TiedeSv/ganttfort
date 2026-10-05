# Project rules for the world: <project name>

Derived from `profile.md` (created by `/world-init`). During `/world-update` these rules take precedence over the general ones.

## Repos
| Repo id | Location | What counts |
|---|---|---|
| `<main_repo>` | this repo | all commits and uncommitted changes |
| `<other>` | `../<path>` ← adjust | e.g. **only my own** commits (`--author=<git config user.email>`) |

- **Write boundary:** In other repos, only read (`git log`, `git status`, `git diff`, reading files).
  Everything that belongs to the world lives only here under `.ai/ganttfort/`.
- Add files from other repos to `"files"` with the prefix `<repo-id>:`.

## Off limits
- <Folders that are not evaluated: e.g. vendor/, generated data, venv, caches>
- No customer names, credentials or absolute local paths in `world.json`.

## Regions (do not change ids)
| id | Repo | Paths | Biome |
|---|---|---|---|
| `<id>` | `<repo>` | `<path/>` | meadow · forest · steppe · rock · sand · snow · volcano (each island different) |

A task belongs to the region that holds most of its changed files.

## Type mapping (first matching rule wins)
<Derive from the project's commit conventions, e.g. Conventional Commits:>
1. `fix(...)` → `bugfix` · 2. `refactor(...)` → `refactor` · 3. `test(...)` → `test`
4. `perf(...)` → `performance` · 5. `docs(...)` → `docs` · 6. `build/ci/chore(...)` → `infra`
7. public interface changed → `api` · 8. otherwise → `feature`
More types, if they fit: `research`, `experiment`, `typing`, `pipeline`, `handoff`.

Store the commit subject (with ticket, if there is one) in `"source"`.

## Building sites
- <How do you recognize open work? e.g. every own, unmerged branch `feature/<ticket>-<name>` = one building site;
  uncommitted changes count toward the building site of the current branch.>
- When a building site is merged, it becomes a done task (same `id`).

## Done
- <e.g. merged into main / `Merged PR …` on the main branch. Open PR = still a building site.>

## Explanations
- Learning language: `<meta.learning_language>` → field `learn` = translation into this language.
- `code` = real excerpt (≤ 6 lines), `pitfall` = typical pitfall of the project language (heading: `meta.repos.<id>.pitfall_label`).

## Architecture diagram
`diagram.edges`: A → B = A depends on B; `"kind": "flow"` = data flow. Only change it when the structure changes.
