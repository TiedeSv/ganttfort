# Translation brief: Ganttfort template docs German -> English

Ganttfort turns a project plan into a 3D medieval island world: every task is a building on an island (region),
every deadline from the Gantt plan brings attackers. The data lives in `.ai/ganttfort/world.json` (English format since this release),
deadlines/milestones come from the Mermaid Gantt `.ai/ganttfort/plan.mmd`. Agents (Claude Code, GitHub Copilot) keep the world up to date.

## Rules
- Translate the meaning faithfully into clear, plain English (no marketing tone, short sentences, no em-dash asides).
  Keep the Markdown structure, headings order, code blocks, tables and front matter keys.
- Keep it general: no company, product, customer or employer names. Examples use the made-up "Harbor Town App" (see ids below).
- Everything that refers to files, folders, keys, values and commands must use the NEW English names below. Never leave an old German key in a JSON example.
- The user of the template may speak any language. Where the German text says the agent answers in German, write: answer in the language
  set in "About me" (default: the language the user writes in).
- The answer format sections: "Was sich geändert hat" -> "What changed", "Erklärung" -> "Explanation", "Deine Frage" -> "Your question",
  "Könnte ein Kollege fragen" -> "A colleague might ask". "Hier schaust du selbst hin" -> "Look here yourself".
- Do not change behaviour or rules (e.g. deadlines are only changed when the human says so – keep that strictly).

## Names: folders, files, commands
| old | new |
|---|---|
| `.ai/welt/` | `.ai/ganttfort/` |
| `welt.html` `welt.json` `welt-data.js` `welt-demo.js` | `world.html` `world.json` `world-data.js` `world-demo.js` |
| `pruefe_welt.py` | `check_world.py` (also new: `convert_world.py` = one-time converter from the old German format) |
| `themen/mittelalter.js` `themen/_vorlage.js` | `themes/medieval.js` `themes/_template.js` |
| `regeln.md` `profil.md` `vorlagen/regeln.vorlage.md` | `rules.md` `profile.md` `templates/rules.template.md` |
| `.ai/diagramme/` `ANLEITUNG.md` | `.ai/diagrams/` `GUIDE.md` |
| `/weltinit` `/weltplan` `/weltupdate` `/weltprofil` `/weltthema` | `/world-init` `/world-plan` `/world-update` `/world-profile` `/world-theme` |
| `/frist` `/meilenstein` `/erklaer` | `/deadline` `/milestone` `/explain` |
| prompt files `.ai/prompts/weltupdate.md` etc. | `.ai/prompts/world-update.md`, `deadline.md`, `milestone.md`, `explain.md`, `world-init.md`, `world-plan.md`, `world-profile.md`, `world-theme.md` |
| URL `?thema=` `&jetzt=` `&vorschau=` | `?theme=` `&now=` `&preview=` ; new: `?lang=de` |
| plan comments `%% entwurf`, `%% x umfasst: a b`, `%% paket id: Titel = a b` | `%% draft`, `%% x includes: a b`, `%% package id: Title = a b` |

## JSON keys (world.json)
- top level: `tagesbericht`->`report`, `regionen`->`regions`, `felder`->`tasks`, `meilensteine`->`milestones`, `pakete`->`packages`,
  `chronik`->`log`, `diagramm`->`diagram`, `ordnung`->`housekeeping`, `meta` stays.
- meta: `projekt`->`project`, `stand`->`as_of`, `hauptrepo`->`main_repo`, `lernsprache`->`learning_language`, `thema`->`theme`,
  `code_sprache`->`code_language`, `falle_titel`->`pitfall_title`, `repos` stays (each repo: `name`, `falle`->`pitfall_label`, `code`),
  `plan` (`datei`->`file`, `entwurf`->`draft`), `seitenleiste`->`sidebar`, `arbeitsarten`->`work_types`, new `lang` (`"en"`/`"de"`, interface language).
- region: `id`, `repo`, `name`, `biom`->`biome`, `beschreibung`->`description`, `ablauf`->`steps`, `ablauf_richtung`->`steps_direction`.
- task: `id`, `region`, `typ`->`type`, `status`, `titel`->`title`, `begonnen`->`started`, `seit`->`ended`, `neu`->`new`, `quelle`->`source`,
  `notiz`->`note`, `kritisch`->`critical`, `faellig`->`due`, `plan_start`->`planned_start`, `nach`->`after` (predecessor ids),
  `fertig_um`->`done_at`, `dateien`->`files`, `verschoben`->`moved` (entries `{am,von,nach,grund}`->`{on,from,to,reason}`),
  `branch`, `pr` (`nummer`->`number`, `status`, `url`), `commits` (`hash`, `datum`->`date`, `text`, `repo`),
  `erklaerung`->`explanation` (`bild`->`picture`, `python`->`learn`, `cpp`->`code`, `cpp_falle`->`pitfall`, `achte_auf`->`check`), `aus_plan`->`from_plan`.
- milestone: `titel`->`title`, `datum`->`date`, `felder`->`tasks`, `beschreibung`->`description`, `verschoben`->`moved`, `region`.
- package: `titel`->`title`, `felder`->`tasks`. log entry: `datum`->`date`, `text`.
- diagram: `text`, `richtung`->`direction`, `kanten`->`edges` (`von`->`from`, `nach`->`to`, `text`, `art`->`kind`).
- housekeeping: `uebersicht`->`overview`, `dateien`->`files`, `ordner`->`folders`, `neu`->`new`, `hinweis`->`note`.

## Values
- status: `fertig`->`done`, `in_arbeit`->`in_progress`, `geplant`->`planned`, `verworfen`->`dropped`
- PR status: `offen`->`open`, `entwurf`->`draft`, `gemergt`->`merged`, `abgelehnt`->`closed`
- type: `doku`->`docs`, `analyse`->`research`, `probe`->`experiment`, `sonst`->`other`; unchanged: feature, bugfix, refactor, test, infra, typing, pipeline, performance, handoff, api
- biome: `wiese`->`meadow`, `wald`->`forest`, `steppe`, `fels`->`rock`, `sand`, `schnee`->`snow`, `vulkan`->`volcano`
- theme: `mittelalter`->`medieval` (`scifi` stays); edge kind: `abh`->`dep`, `fluss`->`flow`
- dates stay `YYYY-MM-DD` (German "JJJJ-MM-TT" -> "YYYY-MM-DD").

## Game words (UI terms, use these)
Feld -> tile (the hex), Aufgabe -> task, Insel -> island, Sektor -> region, Baustelle -> building site (status in_progress),
Bauplan/Bauplatz -> blueprint / building plot (planned), verworfen -> dropped, Frist -> deadline, Meilenstein -> milestone (a castle),
Großpaket -> large package (a church building: chapel, church, cathedral), Späher/Kundschafter -> scouts, Lager/Heerlager -> camp/war camp,
Belagerung -> siege, Schlacht -> battle, Entscheidung um 16:00 -> decision at 16:00, Brandruine -> burned ruin, Neubau am Inselrand -> rebuild at the island edge,
verschieben (Frist) -> move (a deadline), Zeitraffer -> time-lapse, Umbauen -> rearrange, Legende -> legend, Lage -> Status (tab), Verlauf -> History,
Wohnhäuser -> houses, Boten -> messengers, Lernsprache -> learning language, Stolperfalle -> pitfall, Tagesbericht -> report, Chronik -> log.
Buildings (medieval): Gehöft Farmstead (feature, Create), Schmiede Smithy (bugfix, Fix), Windmühle Windmill (refactor, Rework),
Wachturm Watchtower (test, Check), Zeppelinplatz Zeppelin field (infra, Foundations), Skriptorium Scriptorium (docs, Write),
Sternwarte Observatory (research, Research), Alchemistenturm Alchemist's tower (experiment, Try out), Steinmetzhütte Stonemason's lodge (typing, Structure),
Kornspeicher Granary (pipeline, Process), Haus House (performance Improve / handoff Handover / api Coordinate are locked and show as House; Wassermühle Watermill, Anlegestelle Landing stage, Stadttor Town gate).
Biome names (medieval): Pastures (meadow), Woodland (forest), Fields (steppe), Highlands (rock), Coast (sand), Northmark (snow), Ashlands (volcano).

## Example world ids (Harbor Town App, replace old German example ids)
regions: `app` App screens, `server` Server & interfaces, `data` Timetable data, `map` Town map, `ops` Operations & build, `quality` Quality, `launch` Launch.
tasks (old -> new): tickets->tickets, echtzeit->live-positions, fusswege->footpaths, barrierefrei->accessibility, lastspitze->traffic-peak,
sturmwarnung->storm-warning, vorlesen->read-aloud, englisch->german (German translation), ticket-tests->ticket-tests, zahlung->payment, quittung->receipt,
api-fahrplan->api-timetable, datenmodell->data-model, verspaetung->delay-alert, suche->search, kalender->events, handbuch->manual, uebergabe->handover.
milestones: testbetrieb->trial-run (Trial run at the town office), hafenfest->harbor-festival (Launch at the harbor festival).
packages: ticketverkauf->ticket-sales, stadtplan->town-map, fahrplankern->timetable-core.
The town is called Gullhaven.
