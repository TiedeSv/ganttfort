# Set or move a deadline

Examples: `/deadline tickets 2026-10-09`, `/deadline "Holiday timetable" Friday`, `/deadline tickets +3 days`.

**Deadlines belong to me.** You set or change them only when I say so in this call.
All deadlines are in the project plan **`.ai/ganttfort/plan.mmd`** (Mermaid Gantt, see `.ai/prompts/world-plan.md`).
Never enter `due`/`moved` in `world.json` by hand; `check_world.py` does that from the plan.

1. **Date:** Convert relative dates ("Friday", "next week", "+3 days") from today into `YYYY-MM-DD`.
2. **Find the task in the plan** (by id or a similar title):
   - found: change only the **end date** (for `…, 5d` adjust the duration so the end is right,
     or switch to a fixed end date). If other tasks depend on it via `after`, tell me that they move too.
   - not in the plan: add a line in the matching `section` (region name), id = task id if the task exists.
   - **if there is no `plan.mmd` yet:** create it with exactly this one task (header as in the format in
     `world-plan.md`, **without** `%% draft`, because I set the deadline explicitly).
3. Run `python .ai/ganttfort/check_world.py` until it says "OK". The output shows whether it was recorded as a move.
4. **Answer (1–2 lines):** new deadline, decision (next day at 16:00). For a move, add the note:
   "If the scouts were already there, siege gear stays on the map."
