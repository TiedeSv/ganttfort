# Switch the theme of the project world or build a new one (`/world-theme`)

Examples: `/world-theme medieval` (activate an existing theme) · `/world-theme "Steampunk"` (build a new one) ·
`/world-theme medieval: houses with slate roofs, robbers in green` (adjust an existing one).

Themes live in `.ai/ganttfort/themes/<name>.js`. Structure and toolbox: `.ai/ganttfort/themes/_template.js`.
A complete example with all buildings, units and texts: `.ai/ganttfort/themes/medieval.js`.
The keys inside a theme file keep the engine's internal names (e.g. `szene`, `texte`, `bau`); `_template.js` explains each one.

## Activate an existing theme
Set `meta.theme` in `.ai/ganttfort/world.json` (`scifi` = built in, no file needed), run `python .ai/ganttfort/check_world.py`, done.

## Build a new theme
1. Copy `_template.js` to `themes/<name>.js` (name: a-z, 0-9, -).
2. **Mood first:** `ui` (colors, background, maybe a web font), `szene` (scene: light, fog), `farben` (colors), `biome` (names), `texte` (texts).
   With that the world already looks different, even with the built-in buildings.
3. **Names:** `typen.<type>.gebaeude` (building name) and `sinn` (meaning) for all 13 types, matching the era.
4. **Buildings:** one function per type in `bau` (sizes and tools are in the template). Order: the most frequent
   types of the project first (see the distribution in `world.json`), then `meilenstein` (milestone), `paket` (large package),
   `baustelle` (building site), `wohnhaus` (house).
   Shared parts (house, tower, roof …) as helper functions at the top of the file, as in `medieval.js`.
5. **Units:** `laeufer` (foot soldier), `armee` (army), `drohne` (scout), `geschuetz` (gun), `lager` (camp), `bote` (messenger);
   `schuss` (projectiles: colors, arc) and `bahn` (trail: colors).
   The required parts in `userData` are listed in the template.
6. **Test:** `world.html?demo&theme=<name>` (all phases), single buildings with
   `world.html?preview=<type>:done:meadow&theme=<name>` (type, status, biome as in world.json; the internal German names work too).
   The browser console must be free of errors.
   If a screenshot tool is available, look at the preview of every type and fix overlaps and scale.
7. Only when everything works: set `meta.theme` and check.

## Rules
- Only change files under `.ai/ganttfort/themes/` and `meta.theme`, never `world.html`.
- Do not copy brands, logos or well-known characters; use your own, generic shapes.
- Answer (at most 5 lines): what you changed, how to look at it, what still has the built-in look.
