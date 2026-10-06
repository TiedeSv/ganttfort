# Ganttfort: guide

The world shows you every day what happened in your project: every task is a building on an island,
every deadline brings a wave of attackers. On top of that, it makes you think for yourself for a moment in two places. That is all.

---

## Set up once (10 minutes)

1. **Unpack** into the root of your repo. Folders that start with a dot are hidden.
   If you already have a `.vscode/settings.json`, copy only the two lines from it.
   Existing instruction files (e.g. `.github/copilot-instructions.md`) stay as they are.
2. **Set up:** In the agent chat (Claude Code, or Copilot in **Agent** mode) run `/world-init`. The agent asks briefly
   about repos, languages and theme, writes your profile, the rules and the islands, and creates the first tiles from the last four weeks.
   For the diagrams you need the Mermaid extension in VS Code (**Mermaid Chart**).
3. **Only for you?** If the map should not go into the shared repo, add these to `.git/info/exclude`:
   `.ai/ganttfort/world.json` and `.ai/ganttfort/world-data.js`. In a team, both belong in the shared repo.
4. **Bookmark** `.ai/ganttfort/world.html` in your browser. The page runs locally, without a server.
5. **Project plan:** `/world-plan`. The agent looks for a plan that is already in the repo
   (roadmap, Mermaid Gantt, GitHub milestones, or an export you attach) and takes it over. If it finds none,
   it suggests one. Either way it lands as a **draft** in `.ai/ganttfort/plan.mmd`. Open it (Mermaid preview), change
   what does not fit, and delete the line `%% draft` or say "accept the plan". Only then do attackers come.

---

## Every morning (5 minutes)

| Step | What you do |
|---|---|
| 1 | In the agent chat run `/world-update`. The answer is only one line on purpose. |
| 2 | Open the bookmark (or reload the page). |
| 3 | Sidebar: read **Recently**, then *Still this week*. What is threatened (warning sign on the island), what is due today? Press **G** to open the project plan. |
| 4 | Click the **Building site** and **New** markers, and in the panel read the picture and "Look here yourself". |
| 5 | Click **Architecture** at the top (or press **M**): where in the big picture is today's work, and what depends on it? |

---

## While you work

| Situation | What you do |
|---|---|
| You want to understand code | `/explain` (current diff) or `/explain src/tickets/purchase.py` |
| You want to change the plan | Edit `.ai/ganttfort/plan.mmd` yourself (end date = deadline) and run `python .ai/ganttfort/check_world.py`, or ask the agent |
| You set or move a deadline | `/deadline tickets Friday` (changes the line in the plan) |
| You plan a milestone | `/milestone "Launch at the harbor festival" 2026-10-15 tickets ticket-tests` |
| You want to ask "what's next?" | The agent answers directly, with reasons and an order. |
| The agent changes something | Small things it does right away. Larger or risky things only after your OK to the plan. |
| At the end of every answer | **Your question** (one, always there) plus 1–2 optional **A colleague might ask** questions. The agent does not wait for them; answer if you want. |
| Processes, dependencies | The agent draws a Mermaid diagram (dark color scheme), saves it in `.ai/diagrams/` and opens it in the Mermaid extension. |

---

## Reading the map

**Regions:** one island per large area of your project (4–8 of them, usually the top-level folders), each with its own landscape
(Pastures, Woodland, Fields, Highlands, Coast, Northmark, Ashlands). Which ones exist is set by `/world-init` in `rules.md`.

**Glowing edge = state**

| Edge | Meaning |
|---|---|
| green | done |
| orange, scaffolding and treadwheel crane | building site: an open branch or uncommitted changes |
| light, building plot with material at the island edge | planned (from your plan or suggested by the agent) |
| red, abandoned half-built building | dropped |
| glowing red, charred | burned ruin (deadline missed), overgrows with time |
| violet, castle | milestone |
| no edge | just landscape |

**Building = kind of task**

| Building (medieval) | Work type (`type`) | | Building (medieval) | Work type (`type`) |
|---|---|---|---|---|
| Farmstead | Create (`feature`) | | Alchemist's tower | Try out (`experiment`) |
| Smithy | Fix (`bugfix`) | | Stonemason's lodge | Structure (`typing`) |
| Windmill | Rework (`refactor`) | | Granary | Process (`pipeline`) |
| Watchtower | Check (`test`) | | Scriptorium | Write (`docs`) |
| Zeppelin field | Foundations (`infra`) | | Observatory | Research (`research`) |
| House | Other, and for now Improve (`performance`), Handover (`handoff`), Coordinate (`api`) | | Castle | Milestone |

Watermill, Landing stage and Town gate stay locked until they are finished; until then these work types show as House.

The **Legend** ("L Legend" at the very front of the bar at the bottom left, or key <kbd>L</kbd>) shows all of them as small 3D pictures. Clicking a row highlights that type on the map.

**Architecture view** (switch at the top or **M**): a diagram of all regions.
Solid arrow A → B = A depends on B, dashed = data flows. Frame color as on the map
(orange = building site, green = quiet, grey = still empty). Building sites and planned work hang as small capsules on the region.
Clicking a box jumps to that place on the map.

**Dropped (medieval):** A dropped task becomes an abandoned building site. Its walls stand as high as the task had got when it was dropped, and every day after that more nature grows over it (fully overgrown after about 20 days).

**Burned ruin (medieval):** A lost deadline leaves the burned-down building site behind: blackened walls as high as the building was on the day of the fire, one wall collapsed, charred scaffolding, a toppled treadwheel crane, catapult stones in the rubble. For the first 3 days it is still burning, up to 14 days it smoulders, after that it is cold ash; from 30 days weeds grow, from 60 days everything is overgrown. A stone wayside cross stays forever.

**Battles:** Scouts circle over the tile, a camp (in the medieval theme a war airship with catapults on deck) lands at the island edge, siege catapults roll up (the medieval theme has no foot soldiers: three catapults, five for large packages, line up in a half circle just in front of the wall and fire at it; other themes can do the same with `kampf:{ohneFussvolk:true}`). The tile defends itself with a shield, in the medieval theme with a town wall and corner towers that crumble piece by piece during the battle. On victory the knights ride out, and your own war airships attack the enemy airship until it sinks in flames.

**Zeppelin fields and airships:** Every finished Foundations tile (`infra`) is a zeppelin field with a mooring mast. Airships fly at random between all fields, to other islands too: they rise, fly in an arc over the buildings, dock nose first at the mast and pick a new destination after a short pause. If there is only one field, an airship flies a lap around its island and docks again.

**Weather:** One shared wind blows across the whole world: trees and grass sway, leaves drift past.

**Houses:** Finished tiles get houses in the free corners after 5, 10 and 20 days (2, 4, then 6), later with several storeys, lanterns and a meeting place. So old work is "lived in".

**Traffic:** Drones (carrier pigeons in the medieval theme) fly along the dependencies and the data flow between the regions. More activity, more messengers. The arcs themselves are no longer drawn (a theme can switch them back on with `verkehrslinien:true`).

**Controls:** Everything sits in one bar at the bottom: *Project plan*, *Legend*, the time-lapse, *Rearrange*, *Performance* and, in the repo version, *World / Architecture*. The *?* button shows all keys and mouse actions. On smaller screens the bar shows only the icons.

**Performance:** The gauge button *Normal* in the controls dock at the bottom switches between *Full* (all motion, fine shadows), *Normal* (fewer messengers, simpler shadows) and *Calm* (everything stands still: attacks show as a still image without shots, explosions or lights, no shadows, saves battery). A fire still shows where a building burns. The browser remembers your choice; if your system asks for reduced motion, *Calm* is the default.

**Rearrange:** Button *Rearrange* in the bar at the bottom (or **B**). Then drag a finished building with the left mouse button and drop it on another tile
**of the same island**: green frame = fits, red = not possible. On a landscape tile the building moves there,
on another finished building the two swap places. Building sites and planned work stay where the agent puts them.
The browser remembers the layout (per building), so it survives every `/world-update`. *Reset layout* puts everything back.

**Where the islands lie:** Every island keeps its own direction from the middle, taken from its position in the file: the first island sits in the centre, each next one in a fixed direction around it. When an island grows, the others only move further out along their direction, so the overall picture stays the same and only the gaps change. Add new areas at the end of `regions`; inserting one in the middle shifts the directions of all areas after it.

**Time-lapse:** Drag the slider at the bottom or press ▶. The world grows from the first date until today, building sites appear and get finished. To keep it calm, only the large war airships show during the time-lapse; scouts, catapults, walls and shots appear for today and in a battle replay. Castles, cathedrals and their lines appear once one of their tasks is planned.
It needs the dates `ended`/`started`, which `/world-update` fills in.

**Project plan file:** `.ai/ganttfort/plan.mmd` is a Mermaid Gantt and the only source for deadlines and milestones.
`check_world.py` transfers it on every run: end date of a task = deadline, start date = planned start,
`section` = region. New tasks in the plan are created as planned tiles. If you change an end date, it is recorded
as a move automatically, also for tasks that hang on it via `after`. Deleting a task from the plan does not remove
its deadline. As long as `%% draft` is at the top, the plan does not count yet.

**Large packages:** `%% package ticket-sales: Ticket sales = tickets ticket-tests traffic-peak` in the plan groups tasks into a parent package.
In the world it shows as a **large building**: a tower with one storey per task (built, scaffolded or charred; in the medieval theme a church building that goes up section by section from east to west: first task = choir, middle ones = nave bays, last one = west front. It levels up with the finished tasks: up to 3 done a chapel with a ridge turret, 4–6 a church with a west tower, from 7 a cathedral with side aisles, flying buttresses and two towers; its length depends on all tasks),
with lines leading to its tasks (red when one of them is under attack). The package has no deadline of its own;
every task has to meet its own. When everything is done, the tower gets a spire and a crown.

**Dependencies:** `after` in the plan becomes arrows in the Gantt and, for the selected tile, dashed lines in the world. The **critical path**
(the chain that sets the end of a milestone or large package) is marked red, and so are tasks with `crit`.

**Deadlines and attacks:** If a task has a deadline, attackers come. They announce themselves:

| Phase (label) | When | What you see |
|---|---|---|
| **Deadline ahead** · in 4 d | roughly in the last third of the time until the deadline (2–7 days before) | scouts circle over the tile |
| **Final stretch** · due tomorrow | 1–3 days before | a war airship anchors at the island edge |
| **Due today** | on the due day | catapults roll up, a town wall stands around the tile |
| **Overdue** · 9:14 h to hand-in | all of the next day | constant fire, the wall crumbles more and more until 16:00 |
| **Hand-in 16:00** | **next day, 16:00** | done (`ended` ≤ next day) → *Delivered on time*: the attackers are beaten back. Otherwise *Hand-in missed*: the building burns down. |

The labels use project language, the world shows the story. A deadline that is still far away shows *On track*.

- **Done earlier = earlier victory:** The attackers are beaten back as soon as the task is done. Done before *Deadline ahead*: no attack at all.
- **Fire:** The building burns until the next morning. The **burned ruin stays forever** on its tile; the rebuild
  goes up at the island edge. The ruin scars over: charred after 3 days, first green after 2 weeks, overgrown after a month,
  almost landscape again after two months. The memorial stone stays.
- **Moving** (`/deadline … new date`): Free before *Deadline ahead*. After that the attackers leave their **siege gear behind**,
  which rusts and slowly overgrows. Every move is shown in the panel and in the plan.
- **Dropped:** never attacked. The tile shows the half-built building of this task, fenced off, and it can be moved when you rearrange.
- **Milestones** (`/milestone`): a castle. On the date a large wave comes against the castle and every open
  task of the milestone (tasks without a deadline of their own inherit the date). Everything done: the castle flies golden banners.
- **Watch a battle:** In the panel of a tile, every victory and fire has a "replay" link. The map plays that day as a time-lapse.
- **World not up to date:** If 16:00 has passed but the data is older than the overdue day, the task stays *Overdue* ("waiting for /world-update").

**Project plan** (button at the bottom left or **G**): a Gantt chart of all tasks with a deadline, building sites and recently finished work, by region.
Bar = working time (orange building site, green done, dashed until the deadline), light frame = as planned, red zone = attack window, white flag = deadline,
violet flag = inherited from the milestone, pale flag with arrow = old deadline, flame = hand-in missed, shield = delivered on time,
warning triangle = moved after *Deadline ahead*, diamonds = milestones. The cyan line is the time of the world: it runs live,
follows the time-lapse, and **dragging along the day bar** jumps to a day. Clicking a row flies to the tile.

**Demo:** `world.html?demo` opens the example world "Harbor Town App" (made up), whose data is computed relative to today. There you can see all phases at once.
Add `&now=2026-10-02T15:58` to simulate another time, e.g. to watch the decision at 16:00 live.

**Themes:** Look, buildings, units and words come from a theme. **Medieval** is maintained, sci-fi is also built in
(Farmstead, Smithy, Windmill, Castle, Cathedral, raiders in a war airship, knights on horseback). Try it: `world.html?theme=medieval`
(or `world.html?demo&theme=medieval`). Permanently: `/world-theme medieval` or `"theme": "medieval"` in `meta` of `world.json`.
The agent builds an era of your own with `/world-theme "Steampunk"` from the template `.ai/ganttfort/themes/_template.js`. The template explains every field:
colors, light, landscape names, building names, one build function per building type, units, projectiles, texts of the attack phases.
View a single building: `world.html?preview=refactor:done:meadow&theme=medieval`.

**Language:** The interface is English by default. Switch on German with `"lang": "de"` in `meta` of `world.json` (or `?lang=de` in the URL).

**Other projects:** The same world for another repo: unpack the template package there and run `/world-init`. The agent asks briefly about
repos, languages and theme, writes your profile, the rules and the islands, creates the first tiles from the last four weeks and suggests a plan.

**Sidebar (three tabs):**
- **Status:** "Recently" with the status report and the last three events of the past 7 days (done, dropped, delivered on time, hand-in missed, deadline moved, log), one card per island (color, warning sign, done/total, progress bar) and *Deadlines & attacks*. A click on an event opens the tile; a click on an island flies there and opens its tasks.
- **Tasks:** the island cards as a filter ("All islands" removes it, the filter is kept when you reload) and all tasks by time: *Still this week* (overdue in red), *Next week*, *In 2 weeks*, *Later* (weeks from Monday to Sunday), then *No deadline* and *Done* (collapsed).
- **Tile:** the tile you clicked, in the world or in a list: status, deadline with all phases, large package, predecessors and successors, explanation, commits, and ready-made commands to copy (`/deadline … date`, "Report done", `/explain`), because the map itself cannot write files. Milestones and large packages show here too.
- The legend opens as a card over the world: "L Legend" at the front of the bar at the bottom left or key <kbd>L</kbd>, close with × or <kbd>Esc</kbd>. Legend and project plan close each other. In the Artifact there is a fourth tab *Project* for editing.
- History and the region overview are not in these tabs; the data stays in `world.json`. The old six tabs (Status, Tasks, Tile, History, Regions, Legend) come back with `"sidebar": "tabs"` in `meta`.

**In the world:**
- From the overview you only see the island names, each with its color, "(done/total)" (green when everything is done; follows the time slider) and warning signs: a yellow "!" from the scouts on, a pulsing red "!" from the camp on. Hovering over it names the affected tasks.
- Clicking an island (building, terrain or name) brings it closer. Only up close does a click select a building.
- Up close, for the island in the middle of the view, large packages, milestones, attacks and "New" badges appear. Task names show when you hover over a tile and in the panel.

**Controls**

| Action | Mouse | Keyboard |
|---|---|---|
| pan | drag left | W A S D / arrows |
| rotate | drag right | Q / E |
| zoom | mouse wheel | |
| open tile | click the tile or a marker | |
| show everything / clear selection | | F / Esc |
| project plan on/off | button *Project plan* | G |
| rearrange mode on/off | button *Rearrange* | B |
| world ↔ architecture | switch at the top | M |

---

## Repo and Claude Artifact

Ganttfort also runs as a Claude Artifact (no repo needed, a good way to start). If you use both, **the repo leads**:
`world.json` and `plan.mmd` in `.ai/ganttfort/` are the source, the Artifact is a copy.

- **Artifact → repo:** tab *Project* → *Data* → *Copy as JSON*, save it as `.ai/ganttfort/world.json`, then run `python .ai/ganttfort/check_world.py`.
- **Repo → Artifact:** tab *Project* → *Data* → *Import JSON*, paste `world.json`. The import replaces the Artifact's world;
  deadlines and their moves that the Artifact already has must still be there, otherwise the import is refused.
- An Artifact world from the old German version is moved to the new format automatically the first time its owner opens it.
  The old version stays stored as a backup.

---

## When something does not work

| Problem | Solution |
|---|---|
| Map is black or "The world cannot be loaded." | Run `python .ai/ganttfort/check_world.py` in the repo root. The script tells you which field is broken. |
| Data is still in the old German format (`.ai/welt/`, `welt.json`) | Run `python .ai/ganttfort/convert_world.py` once, then `python .ai/ganttfort/check_world.py`. |
| The agent does not write files | Copilot: the chat is not in **Agent** mode. Claude Code: allow writing. |
| `/world-update` is missing in the chat | Check that `.github/prompts/` and `.vscode/settings.json` are in the opened folder. |
| Regions of a second repo stay empty | The path in `rules.md` is wrong, or a different `user.email` is set there. |
| Too many tiles / building sites | Tighten the limits in `rules.md` (e.g. "only branches from the last 30 days"). |
| `check_world.py`: "due changed … without an entry in moved" | Someone edited `world.json` by hand. Change deadlines only in `plan.mmd`. |
| `check_world.py`: "section … matches no region" | The `section` in the plan must be named exactly like a region (name or id), e.g. `section App screens`. |
| `check_world.py`: "… has id …, the task in the world is …" | The task in the plan and the tile in the world are the same thing with different ids. Put the tile's id in the plan. |
| "Overdue · waiting for /world-update" | The map does not know whether you are done. Run `/world-update`, or set the task to `done` and run the check. |

---

## Files in the package

```
AGENTS.md                      rules for all agents (Copilot, Claude)
CLAUDE.md                      points Claude Code to AGENTS.md
THIRD_PARTY_NOTICES.md         which third-party parts are included and under which license
.ai/prompts/world-update.md     the daily prompt
.ai/prompts/explain.md         "Explain this to me"
.ai/prompts/world-profile.md    create your profile (only if you want to reshape the world)
.ai/prompts/world-plan.md       take over or suggest a project plan (/world-plan)
.ai/prompts/world-init.md       set up the world for a new project (/world-init)
.ai/prompts/world-theme.md      switch or build a theme (/world-theme)
.ai/prompts/deadline.md        set or move a deadline
.ai/prompts/milestone.md       create or change a milestone
.ai/ganttfort/world-demo.js        demo world "Harbor Town App" with all phases (world.html?demo)
.ai/ganttfort/world.html           the map
.ai/ganttfort/world.json           data of the map (created by /world-init, kept up to date by the agent)
.ai/ganttfort/rules.md             repos, regions, building mapping, building sites (created by /world-init)
.ai/ganttfort/profile.md           your profile (created by /world-init)
.ai/diagrams/                  the agent's Mermaid diagrams (.mmd)
.ai/ganttfort/check_world.py       checks world.json, transfers the plan, generates world-data.js
.ai/ganttfort/convert_world.py     one-time converter from the old German format
.ai/ganttfort/plan_sync.py         reads plan.mmd (Mermaid Gantt) and syncs deadlines/milestones
.ai/ganttfort/plan.mmd             your project plan (created by /world-plan)
.ai/ganttfort/themes/              themes: medieval.js, _template.js (put your own themes here)
.ai/ganttfort/templates/           template for rules.md (used by /world-init)
.ai/ganttfort/lib/three.min.js     3D library (local, no internet needed)
.ai/ganttfort/lib/mermaid.min.js   diagram library for the architecture view (local)
.ai/ganttfort/lib/*LICENSE*.txt, *-THIRD-PARTY.txt, fonts-OFL.txt   license texts of the third-party parts
.github/prompts/               /world-init, /world-update, /world-plan, /world-theme, /explain, /world-profile, /deadline, /milestone for Copilot
.claude/commands/              the same commands for Claude Code
.vscode/settings.json          turns on AGENTS.md and prompt files in VS Code
```
