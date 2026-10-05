# Working rules for AI agents in this repo

These rules apply to all agents (GitHub Copilot, Claude Code, …).
Goal: I (the human) want to understand and think along, without you slowing me down with questions.

## About me
<!-- world-init:about-me -->
- *(filled by `/world-init`: which languages I understand well or hardly at all, which language you answer in,
  which repos exist and what belongs where, which other instruction files apply)*
<!-- /world-init -->

## How you answer
Answer in the language set in "About me" (default: the language I write in).
Every answer with real content has three parts in this order. Within the parts you are free.

1. **What changed** (only if you changed or created something): a short summary
   in sentences, plus **every changed file as a Markdown link** with a relative path, e.g.
   [rules.md](.ai/ganttfort/rules.md), and half a sentence on what is different there. You also add the same files
   to the matching world task under `"files"` (see "Maintaining the world").
2. **Explanation:** detailed prose, several paragraphs are fine. Explain *why* something is the way it is, how
   the parts fit together and what follows from it. Choose structure, subheadings, lists, tables and
   length to suit the topic.
   - Use analogies, translations into my learning language, pitfalls of the project language, API surprises (statically documented vs.
     observed at runtime) and diagrams **when they really help**. Embed them in the text,
     not as fixed sections.
   - **No rigid label sections** like "Picture:", "Code core:", "Pitfall:", "Check:". Show code
     only when the topic is code; for docs or configuration changes, link the file instead.
   - Where I should look more closely myself, say so in the text.
3. **Questions** (see below).

## Working without fuss
- **Small, clear changes** (one file, obvious fix, docs, tests): do them right away
  and explain afterwards. Do not ask for permission first.
- **Larger or risky changes** (several files, API or contract changes, deleting, code in other repos):
  show the plan briefly and wait for my OK.
- Ask questions **only** if you would really continue in the wrong direction without an answer. Otherwise make the
  most reasonable assumption, state it in one sentence and carry on.
- If I ask "What's next?": answer directly, with reasons and an order.

## Questions at the end of every answer with content
Every answer that explains or changes something ends with this block (the only fixed part). You do **not** wait for my
answer before you continue working; the questions are there to help me think along.

> **Your question:** *(exactly one, fixed)* One concrete comprehension question about exactly this message,
> whose answer I can find myself in the code, the diff or the diagram. Name the place, not the answer.
>
> **A colleague might ask:** *(optional, 1–2)* Questions another developer would ask in a review or
> in the daily about this topic (e.g. edge cases, side effects, tests, backward compatibility,
> "why not differently?"). Only if they are really obvious.

If I answer the fixed question, tell me briefly whether it is right and add what is missing.

## Mermaid diagrams
- Feel free to create diagrams without being asked when they make a flow, a dependency or a state clearer.
- **Save and open:** Create the diagram as a file `.ai/diagrams/<topic>.mmd` in *this* repo
  (never in other repos). Then open it:
  1. If a tool of the Mermaid extension is available (validator / preview, e.g. `mermaid-diagram-validator`,
     `mermaid-diagram-preview`): validate first, then open the preview with it.
  2. Otherwise run `code .ai/diagrams/<topic>.mmd` in the terminal; the Mermaid extension shows the preview.
  Also put the diagram into the answer as a ```` ```mermaid ```` block.
- **Dark background:** Always use this header and these color classes, and give every node a class:

```mermaid
%%{init: {"theme":"dark","themeVariables":{"background":"#0d1117","primaryColor":"#16202c","primaryTextColor":"#e6edf3","lineColor":"#8b98a9","fontSize":"15px"}}}%%
flowchart LR
  classDef source fill:#0f2a33,stroke:#5ee6ff,color:#dff8ff,stroke-width:2px
  classDef step fill:#16202c,stroke:#6f8aa6,color:#e6edf3
  classDef ok fill:#0f2b20,stroke:#3fd99a,color:#dcffef,stroke-width:2px
  classDef warn fill:#2e2212,stroke:#ffb347,color:#fff1dc,stroke-width:2px
  classDef stop fill:#2e1616,stroke:#ff6b6b,color:#ffe3e3,stroke-width:2px
  classDef external fill:#221a33,stroke:#b69cff,color:#efe8ff,stroke-dasharray:4 3
  linkStyle default stroke:#8b98a9,stroke-width:1.6px
```
  Meaning: `source` = input/start, `step` = normal step, `ok` = result/allowed,
  `warn` = decision/caution, `stop` = forbidden/error, `external` = other repo/system.
  Edges with short labels (`-- yes -->`), at most ~15 nodes, otherwise split into two diagrams.

## Maintaining the world
My project map lives in `.ai/ganttfort/world.json` (guide: `.ai/prompts/world-update.md`,
project rules: `.ai/ganttfort/rules.md`).
- When you **start** a task: set the matching task to `"in_progress"` (or create it).
- When a task is **done**: set the task to `"done"`, `"ended": <today>`, `"new": true`, add the explanation.
  If the task has a deadline, record it and check right away: at 16:00 on the day after the deadline the map decides
  with the state it has.
- **Deadlines and milestones** are in the project plan `.ai/ganttfort/plan.mmd` (Mermaid Gantt; set it up with `/world-plan`).
  You only change it when I say so (`/deadline`, `/milestone` or in words). Never on your own, not even
  to prevent a fire. `due`/`moved` in `world.json` are written only by `check_world.py`.
- Add changed files to the task's `"files"` (relative paths, prefix `<repo-id>:` for files from other repos).
- Then run `python .ai/ganttfort/check_world.py`.
- The big daily sync is done by the prompt `/world-update`.
