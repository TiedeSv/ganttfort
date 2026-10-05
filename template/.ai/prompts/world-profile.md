# Project profile for the project world

Analyze this repository and write a profile to `.ai/ganttfort/profile.md`.
It is used to tailor the 3D project world (regions, building types, building sites) to this project.
Only read and analyze, do not change any code. Do not copy secrets, customer names or credentials.

Use: folder structure, build files (CMake etc.), README/docs, `git log` of the last 3 months
(`git log --since="3 months ago" --pretty=format:"%s" --name-only`), branch names, TODO/FIXME.

## Structure of profile.md (brief, bullet points, numbers where possible)

1. **Kind of project** – what the product does, in 2 sentences. Domain (e.g. embedded, desktop, server),
   target hardware/platform, languages with their rough share.
2. **Regions** – 4–8 large areas that should each be shown as an island of their own:
   name · folder · 1 sentence on the purpose · size (files/lines, rough) · how active (commits in 3 months).
   Which areas depend on each other (A → B)?
3. **Kinds of work** – How is the work of the last 3 months distributed? Count commits roughly by:
   feature, bugfix, refactoring, tests, build/CI, docs, performance, research.
   **Important:** Which recurring kinds of work fit into NONE of these categories?
   (e.g. hardware integration, protocols, security, release/versioning, configuration,
   dependency updates, calibration, code review follow-up). For each kind: frequency + 2 example commits.
4. **How do you recognize a building site?** – branch name patterns, ticket prefixes in commits,
   WIP markers, how long building sites typically stay open.
5. **What does "done" feel like?** – Are there releases/tags, reviews, a definition of done?
6. **Language focus** – Which language concepts show up especially often (e.g. in C++: templates, smart pointers,
   threads, macros; in Python: async, typing, metaclasses; in JS/TS: promises, generics)? Top 8, each with one file.
   Which of them are typical pitfalls for someone who does not know the language well?
7. **Suggestions for the world** – Which 2–4 additional building types would you introduce,
   what should they mean, and which picture (building) fits them? Which regions suit
   which landscape (Pastures, Woodland, Fields, Highlands, Coast, Northmark, Ashlands)?

8. **Several repos?** – Do other repos belong to it by subject (product ↔ docs/tools)? Which paths, which role,
   is it read-only there? (Only include them if I named them or they are in the workspace.)

At the end, write only this in the chat: "The profile is in `.ai/ganttfort/profile.md`."
