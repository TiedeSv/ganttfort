<p align="center"><img src="docs/icon.svg" alt="" width="128"></p>

<h1 align="center">Ganttfort</h1>

<p align="center"><em>Your project plan as a fortified world.</em></p>

<p align="center">
  <a href="https://github.com/TiedeSv/ganttfort/releases/latest"><img src="https://img.shields.io/github/v/release/TiedeSv/ganttfort?color=e8b85a&label=release" alt="Latest release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/TiedeSv/ganttfort?color=e8b85a" alt="MIT license"></a>
  <a href="https://tiedesv.github.io/ganttfort/"><img src="https://img.shields.io/badge/live_demo-play-a6d46a" alt="Live demo"></a>
  <a href="https://ko-fi.com/ganttfort"><img src="https://img.shields.io/badge/Ko--fi-buy_a_stone-e8604a?logo=ko-fi&logoColor=white" alt="Support on Ko-fi"></a>
</p>

<p align="center">
  <a href="https://tiedesv.github.io/ganttfort/"><b>▶ Try the live demo</b></a> ·
  <a href="https://github.com/TiedeSv/ganttfort/releases/latest">Download</a> ·
  <a href="template/GUIDE.md">Guide</a>
</p>

Ganttfort turns a project plan into a 3D medieval island world. Every task is a building, every area of the project an
island, every deadline a wave of attackers. Finish in time and the attackers are beaten back; miss the hand-in and the
building burns down – the ruin stays, and slowly grows over.

![The example world "Harbor Town App": seven islands, building sites, a castle, a war airship at the island edge, and the status panel](docs/screenshot.jpg)

The live demo comes with a guided tour through every feature (English; add `?lang=de` for German).

## How it works

### Every kind of work has its building

Planned tasks are building plots, started ones building sites with scaffolding and a crane. A finished task becomes a
building, and the kind of work decides which one:

![Ten buildings, one per kind of work: farmstead (feature), smithy (bugfix), windmill (refactor), watchtower (tests), zeppelin field (infrastructure), scriptorium (docs), observatory (research), alchemist's tower (experiment), stonemason's lodge (typing), granary (pipeline)](docs/buildings.jpg)

Old work gets lived in: finished buildings attract houses over the weeks. Milestones are castles, large packages are
churches that grow into a cathedral with every finished task.

### Deadlines bring attackers

A deadline is a wave of attackers that comes closer day by day. The **hand-in is at 16:00 on the day after the deadline**:
done by then, the attackers are beaten back; otherwise the building burns down.

![The six stages of a deadline: scouts circle (Deadline ahead), a war airship anchors at the island edge (Final stretch), siege on the due day (Due today), battle on the day after (Overdue), a burning ruin when the hand-in is missed, and a victory banner when the task is done in time](docs/deadline-phases.jpg)

- **Moving a deadline is allowed – but visible.** Before *Deadline ahead* it is free; afterwards the attackers leave
  their siege gear behind.
- **A project plan comes with it:** a Gantt chart with dependencies, the critical path and every move of a deadline,
  plus a time-lapse slider to watch the world grow.

Everything runs locally in the browser. Nothing is sent anywhere.

## Three ways to use it

| You want to … | Take | How |
|---|---|---|
| just look at it, or plan something without a repo | `ganttfort.html` | Download it from the [latest release](https://github.com/TiedeSv/ganttfort/releases/latest) and open it. One file, works offline. |
| see your code project as a world, kept up to date by your AI agent | `ganttfort-template.zip` | Unpack it into the root of your repository and run `/world-init` in Claude Code or GitHub Copilot (agent mode). Details: [GUIDE.md](template/GUIDE.md). |
| have Claude set it up for you – in a repo or as a Claude Artifact in the claude.ai chat | `ganttfort-skill.zip` | Upload it as a custom skill in claude.ai, or unpack it into `~/.claude/skills/` for Claude Code, and say e.g. *"Create a Ganttfort world for my move to a new flat."* |

### In a repository

After `/world-init` the agent keeps the world up to date:

| Command | What it does |
|---|---|
| `/world-update` | Daily update from git: finished work, building sites, plans, explanations. |
| `/world-plan` | Takes over a plan that already exists in the repo (or suggests one) as a Mermaid Gantt in `.ai/ganttfort/plan.mmd`. |
| `/deadline tickets Friday` | Sets or moves a deadline – only when you say so. |
| `/milestone "Beta" 2026-11-15 a b` | Creates or changes a milestone. |
| `/explain` | Explains the current diff or a file. |
| `/world-theme` | Switches the theme or builds a new one. |

The world opens as `.ai/ganttfort/world.html` in the browser, without a server. Your data lives in
`.ai/ganttfort/world.json`; `python .ai/ganttfort/check_world.py` checks it and enforces the rules (for example: a
deadline never changes silently).

Coming from the old German version (`.ai/welt/`)? Run `python .ai/ganttfort/convert_world.py` once.

## Requirements

- A browser with WebGL (any current Chrome, Edge, Firefox or Safari).
- For the repo version: Python 3.8+ for `check_world.py`; an AI agent with file access (Claude Code, GitHub Copilot in agent mode); optionally the VS Code extension *Mermaid Chart* for diagrams.

## Build from source

```
python build/build_all.py
```

Only Python 3.8+ is needed. It creates in `release/`:

- `ganttfort.html` – the whole world in one file (works offline)
- `ganttfort-template.zip` – what goes into your repo
- `ganttfort-skill.zip` – the skill for Claude Code and the claude.ai chat

and in `build/dist/` the Claude Artifact version and the tour. To try the repo version directly, open
`template/.ai/ganttfort/world.html?demo`.

| Folder | What it is |
|---|---|
| `template/` | What users copy into their repository: the world, the medieval theme, agent rules, prompts and commands |
| `build/` | Build scripts, the Artifact app and the example world |
| `skill/` | The Ganttfort skill |
| `release/` | Build output (not checked in; attached to every GitHub release) |

## Support

Ganttfort is free. If it helps you, you can [buy it a stone on Ko-fi](https://ko-fi.com/ganttfort) – every tip goes into new buildings.

## License

MIT, see [LICENSE](LICENSE). Third-party components (three.js, Mermaid, fonts): [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
"Claude" is a trademark of Anthropic; this project is independent.
