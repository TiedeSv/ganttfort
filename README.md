# Ganttfort

*Your project plan as a fortified world.*

Ganttfort turns a project plan into a 3D medieval island world: every task is a building, every deadline brings a wave of attackers. Finish in time and your army holds the line; miss it and the building burns.

> Work in progress. The full English README, screenshots and a live demo follow before the first public release.

## Repository layout

| Folder | What it is |
|---|---|
| `template/` | What users copy into their own repository: the world (`.ai/ganttfort/world.html`), the medieval theme, agent rules and slash commands |
| `build/` | Build scripts and sources for the Claude Artifact and the single-file version |
| `release/` | Build output (not checked in) |

## Build

```
python build/build_all.py
```

Creates `release/ganttfort.html` (the whole world in one file, works offline) and `release/ganttfort-template.zip`. Only Python 3.8+ is needed.

Try it: open `template/.ai/ganttfort/world.html?demo` in a browser. The interface is English; `&lang=de` switches it to German.

Coming from the old German format (`.ai/welt/`)? Run `python .ai/ganttfort/convert_world.py` once in your repo.

## License

MIT, see [LICENSE](LICENSE). Third-party components: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
