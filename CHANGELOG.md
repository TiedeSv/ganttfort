# Changelog

All notable changes to Ganttfort. The version number is in [VERSION](VERSION); every release on GitHub has the tag `v` + version.

## [Unreleased]

## [0.1.0] – 2026-10-21

First public release.

### The world
- Tasks become buildings on islands (regions); the kind of work decides the building (farmstead, smithy, windmill,
  watchtower, zeppelin field, scriptorium, observatory, alchemist's tower, stonemason's lodge, granary).
- Deadlines bring attackers: *Deadline ahead*, *Final stretch*, *Due today*, *Overdue*, hand-in at 16:00 on the day
  after the deadline. Done in time: the attackers are beaten back; otherwise the building burns down and the ruin stays.
- Milestones are castles (golden banners when held), large packages are churches that grow into a cathedral.
- Finished buildings attract houses over the weeks; dropped tasks stay as overgrowing building sites.
- Project plan (Gantt) with dependencies, critical path and every moved deadline; time-lapse slider and battle replay.
- Rearrange mode: move finished buildings, castles and finished cathedrals within their island.
- Medieval theme; performance modes *Full*, *Normal* and *Calm*.

### Ways to use it
- `ganttfort.html`: the whole world in one file, works offline.
- `ganttfort-template.zip`: for a repository, kept up to date by an AI agent (Claude Code, GitHub Copilot) with
  `/world-init`, `/world-update`, `/world-plan`, `/deadline`, `/milestone`, `/explain`, `/world-theme`, `/world-profile`.
- `ganttfort-skill.zip`: one skill for Claude Code and the claude.ai chat (repo setup or a Claude Artifact).

### Data and language
- English file format (`world.json`), checked by `check_world.py`; `convert_world.py` converts worlds from the old
  German format once.
- Interface in English, German via `meta.lang: "de"` or `?lang=de`.

[Unreleased]: https://github.com/TiedeSv/ganttfort/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/TiedeSv/ganttfort/releases/tag/v0.1.0
