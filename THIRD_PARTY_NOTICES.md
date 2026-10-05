# Third-party components and licenses

The project's own code (the engine `world.html`, themes, scripts, templates, texts, example worlds) is licensed under the MIT license in [`LICENSE`](LICENSE).
This file lists everything that comes from others and where the license texts are.

As of: 2026-10-05

## Bundled libraries

| Component | Version | License (SPDX) | Where | License text |
|---|---|---|---|---|
| [three.js](https://github.com/mrdoob/three.js) | r149 (0.149.0) | MIT | `template/.ai/ganttfort/lib/three.min.js` | [`three-LICENSE.txt`](template/.ai/ganttfort/lib/three-LICENSE.txt) |
| [Mermaid](https://github.com/mermaid-js/mermaid) | 11.17.2 | MIT | `template/.ai/ganttfort/lib/mermaid.min.js` (only the architecture view of the repo version) | [`mermaid-LICENSE.txt`](template/.ai/ganttfort/lib/mermaid-LICENSE.txt) |

The Artifact version loads three.js 0.149.0 from jsdelivr instead of `lib/`; license and version are the same.

### Included in the Mermaid bundle

`mermaid.min.js` is a bundle and contains further libraries. Their license texts are collected in [`mermaid-THIRD-PARTY.txt`](template/.ai/ganttfort/lib/mermaid-THIRD-PARTY.txt) (generated from an npm installation of Mermaid 11.17.2, rather too much than too little).

| Libraries | License (SPDX) |
|---|---|
| d3 and its modules, internmap, delaunator | ISC |
| d3-sankey, d3-ease, rw and older d3-array/-path/-shape | BSD-3-Clause |
| DOMPurify | MPL-2.0 OR Apache-2.0 (used here: Apache-2.0) |
| Chevrotain (embedded in `@mermaid-js/parser`) | Apache-2.0 |
| Langium, vscode-languageserver, vscode-jsonrpc, vscode-uri (embedded in `@mermaid-js/parser`) | MIT |
| robust-predicates | Unlicense |
| cytoscape (with extensions), dagre-d3-es, dayjs, es-toolkit, fastdom, katex, khroma, lodash-es, marked, roughjs, stylis, uuid and others | MIT |

None of these libraries ships a NOTICE file in the sense of the Apache-2.0 license (checked for DOMPurify and Chevrotain).

## Fonts

| Font | License (SPDX) | Used for |
|---|---|---|
| [Space Grotesk](https://github.com/floriankarsten/space-grotesk) | OFL-1.1 | interface headings |
| [Inter](https://github.com/rsms/inter) | OFL-1.1 | interface body text |
| [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) | OFL-1.1 | numbers, dates, code |
| [Cinzel](https://github.com/NDISCOVER/Cinzel) | OFL-1.1 | headings in the medieval theme |

The fonts are shipped (latin subset, woff2): in the repo version under `template/.ai/ganttfort/lib/fonts/` (loaded through `fonts.css`), in the single-file version embedded as data URIs. There are no requests to Google Fonts. Copyright notices and the license text are in [`fonts-OFL.txt`](template/.ai/ganttfort/lib/fonts-OFL.txt). None of the four fonts has a "Reserved Font Name", so subsets may keep their names. The fonts must not be sold on their own.

## No third-party content otherwise

All buildings, figures, landscapes and units are built in code from simple shapes. There are no third-party images, 3D models, icons or sounds.

## Trademarks

"Claude" is a trademark of Anthropic. This project is independent and works with Claude, but it is not an Anthropic product. GitHub and Copilot are trademarks of GitHub, Inc.
