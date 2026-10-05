# Create or change a milestone

Example: `/milestone "Plugin system beta" 2026-10-15 plugin-loader plugin-tests`

**Milestones belong to me.** You create or change them only when I say so in this call.
They are in the project plan **`.ai/ganttfort/plan.mmd`** (see `.ai/prompts/world-plan.md`); `check_world.py` transfers them.

1. Enter it in `plan.mmd` (best in `section Milestones`), two options:
   - fixed date: `Plugin system beta :milestone, plugin-beta, 2026-10-15, 0d` and below it
     `%% plugin-beta includes: plugin-loader plugin-tests`
   - "when these should be done": `Plugin system beta :milestone, plugin-beta, after plugin-loader plugin-tests, 0d`
   If I name tasks that are not in the plan yet, add them in the matching region. If there is no
   `plan.mmd` yet, create it (without `%% draft`).
2. **Change the date:** change only the line in the plan; `check_world.py` records the move itself.
3. **Add/remove tasks:** change only the `includes` line or the `after` list. Never delete milestones.
4. Run `python .ai/ganttfort/check_world.py` until it says "OK".
5. Answer in 1–2 lines: milestone, date, how many tasks belong to it.
