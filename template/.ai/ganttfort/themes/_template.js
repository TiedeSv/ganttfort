// =====================================================================================
//  TEMPLATE for your own theme of the project world
//
//  1. Copy the file:   themes/_template.js  →  themes/<name>.js   (name: only a-z, 0-9, -)
//  2. Try it out:      world.html?theme=<name>          (demo data: world.html?demo&theme=<name>)
//     Look at a single building up close: world.html?theme=<name>&preview=<type>:done:meadow
//        <type>:<status>:<biome> as in world.json, e.g. docs:in_progress:snow
//        type also: meilenstein (milestone castle), paket (large package)
//        more fields: :<angle>:<age in days>:<zoom>   e.g. preview=feature:done:meadow:90:25:1.4
//  3. Permanently:     in world.json → "meta": { "theme": "<name>" }  and  python .ai/ganttfort/check_world.py
//
//  Everything is optional. Whatever you leave out stays as in the built-in sci-fi theme.
//  A complete example with all buildings: themes/medieval.js
//  With the agent: /world-theme "Steampunk" (see .ai/prompts/world-theme.md)
// =====================================================================================
(function(){
"use strict";

// ---------- Sizes, so buildings fit on the tile ----------
// You build a building inside a group g that is already placed at the center of the tile (y = 0 is the ground).
// The tile is a hexagon with a radius of ≈ 0.8 in these units; stay within ~0.6 of the center.
// Heights: normal building 0.15–0.45, tower up to 0.7. A person is about 0.1 tall.
// Axes: x to the right, z forward (toward the camera), y up. Rotation around y in radians.

// ---------- The toolbox H (passed to every build function) ----------
//  H.THREE                       the 3D library (three.js r1xx)
//  H.box(g, color, w, h, d, x, y, z, rotY)       box, its bottom stands on y
//  H.cyl(g, color, radius, h, x, y, z)           cylinder, stands on y
//  H.gbox / H.gcyl                               like box/cyl, but glowing (windows, lamps)
//  H.mesh(geometry, color, sx,sy,sz, x,y,z, rotY, rotX, rotZ)   any shape, centered at (x,y,z) → call g.add(...) yourself
//  H.GEO.box | cyl8 | cyl12 | cyl20 | cone6 | cone8 | dome20 | ico | dode | okta | torus | pylon   unit shapes
//  H.M(color)                    material (for your own THREE.Mesh)
//  H.leucht(mesh)                makes a mesh glow
//  H.halo(g, x,y,z, size, color, opacity)       soft glow of light (sprite)
//  H.anim(object, t => {...})    moves an object on every frame (t = seconds since start)
//  H.baum(g,x,z,size,r,"laub"|"nadel"|"schnee")  tree (leaf | conifer | snowy) · H.busch bush · H.gras grass · H.blumen flowers
//                                · H.fels rock · H.stein stone · H.stamm trunk · H.kristall crystal
//  H.rauch(g,x,z,strength,height,color,y0) smoke · H.feuer(g,x,z,size,y0) fire
//  H.streu(r, count, radius, free, spacing)    random points that do not overlap [[x,z],…]
//  H.mix(colorA, colorB, share) · H.pick(r, list) · H.rng(text) · H.hexRing(inner, outer)
//  H.zeppelin()      only for type "infra": {name, theta} → rotate the group by theta; mooring mast at x = 0.18, top at height 0.62 (airships dock there)
//  H.luftschiff(k)   the theme's airship (nose toward +z)
//  H.paketStand()    only for type "paket" (large package): {seg:[{s:"fertig"|"offen"|"brand", narbe}], komplett, fertig, n}
//                    (fertig = done, offen = open, brand = burned, narbe = scar, komplett = complete)
//  H.meilensteinGold() only for type "meilenstein" (milestone): true if the milestone was held
//  r is a random generator per tile (r() → 0..1): same task = same look on every load.

window.THEMA = {
  name: "My theme",

  // ---------- Interface (CSS variables) ----------
  ui: {
    // "--bg": "#0d1219", "--glass": "rgba(14,19,27,.86)", "--ink": "#e6edf5", "--ink2": "#b3c0cf", "--muted": "#7d8a9b",
    // "--line": "rgba(255,255,255,.08)", "--cyan": "#5ee6ff" (accent color), "--amber": "#ffb347", "--green": "#6dffb0", "--red": "#ff6b6b",
    // "--head": "'Space Grotesk',sans-serif", "--sans": "'Inter',sans-serif",
    // hintergrund (background): "radial-gradient(ellipse at 36% 42%,#1c2735 0%,#121a25 45%,#090c12 100%)"
  },
  // schrift: "https://fonts.googleapis.com/css2?family=…",   // schrift (font): extra web font for --head/--sans

  // ---------- 3D scene (szene) ----------
  szene: {
    // nebel (fog): 0x121a25, gitter (grid): [0x2b5a70, 0x1c3442],
    // hemi: [skyColor, groundColor, strength], sonne (sun): [color, strength], gegenlicht (back light): [color, strength]
  },

  // ---------- Base colors (farben, used by the built-in buildings) ----------
  farben: {
    // hull, hull2, metal, dark, glass, plate, cyan (glow/hologram color), amber, green, red, warm, violet,
    // rock, rockD, sand, snow, water, schild (protective shield during attacks)
  },

  // ---------- Landscapes: name and colors per biome ----------
  // Keys: wiese = meadow, wald = forest, steppe, fels = rock, sand, schnee = snow, vulkan = volcano
  biome: {
    // wiese: { name: "Green zone", top: 0x4b6a4c, side: 0x252b33 }, wald, steppe, fels, sand, schnee, vulkan
  },

  // ---------- Names of the buildings (legend, panel) ----------
  // Lock types while their building in the theme is not finished yet: tasks of these types stand as a fallback building (bau.sonst),
  // do not appear in the legend and cannot be chosen again in the Artifact.
  // gesperrteTypen (locked types): ["api"], ersatzName (fallback name): "House",
  // typen keys are the engine's type names: doku = docs, analyse = research, probe = experiment.
  // gebaeude = building name, sinn = what it means.
  typen: {
    // feature: { gebaeude: "Habitat", sinn: "Something new was built." },
    // bugfix, refactor, test, infra, doku, performance, analyse, probe, typing, pipeline, handoff, api
  },
  // status keys: geplant = planned, in_arbeit = in progress, fertig = done, verworfen = dropped
  status: {
    // geplant: { name: "Planned" }, in_arbeit: { name: "Building site" }, fertig: …, verworfen: …
  },

  // ---------- Words in the game (texte) ----------
  texte: {
    // spaeher: "Scouts", lager: "Camp", belagerung: "Siege", schlacht: "Battle", verteidigt: "Defended",
    // brennt: "Burning down", abzug: "Attackers withdraw", armee: "Army", grossbau: "Large building",
    // phasen: { spaeher: "Scouts sighted", lager: "Camp set up", sieg: "Army moves out", brand: "Burning" }
    // Legend (descriptions that match the look of the theme):
    // leg_fertig (done), leg_baustelle (building site), leg_geplant (planned), leg_verworfen (dropped),
    // leg_ruine0, leg_ruine2, leg_ruine4 (burned ruin, young to overgrown),
    // leg_meilenstein_name, leg_meilenstein (milestone), leg_landschaft (landscape)
  },

  // ---------- Projectiles (schuss) ----------
  schuss: {
    // feind (enemy): 0xff4a3a, geschuetz (gun): 0xff6a3a, eigen (own): 0x5ee6ff, treffer_feind (enemy hit): 0xff6a4a, treffer_eigen (own hit): 0x9ff3ff,
    // bogen (arc): 0 (0 = straight laser, 0.08 = arrow arc), laenge (length): 0.07
  },


  // ---------- Buildings (bau): one function per type (g = group, r = random, H = toolbox) ----------
  bau: {
    // Example: a simple house for features
    // feature(g, r, H) {
    //   H.box(g, 0xe7ddc7, .3, .14, .2, 0, 0, 0);                              // walls
    //   g.add(H.mesh(H.GEO.cone6, 0x9a3b2b, .24, .12, .18, 0, .2, 0, Math.PI/6)); // roof
    //   H.gbox(g, 0xffc870, .03, .03, .003, .06, .06, .101);                      // window
    //   H.baum(g, .4, -.3, .5, r, "laub");
    // },
    //
    // More types: bugfix refactor test infra doku performance analyse probe typing pipeline handoff api sonst (other)
    // States: bauplan (blueprint)(g,r,H,f,B) · baustelle (building site)(g,r,H,f,p,B) (p = progress 0..1)
    //   · verworfen (dropped)(g,r,H,f,p,wild,B) (p = progress when dropped, wild = days since then / 20)
    //   brandruine (burned ruin)(g,r,H,f,stufe,p,B) (stufe = stage 0–4 by days since the fire: <3, <14, <30, <60, older; p = building progress on the day of the fire)
    // Buildings per type: feature(g,r,H) … api(g,r,H). H.feld() returns the task whose building is being built right now (e.g. f.dateien = its files), otherwise null
    // Houses quarter: wohnhaus(hs,art,stock,r,H) · wohnAbstand (minimum distance to the main building) · wohnHausAbstand (between the houses)
    //   · meshes with userData.keinHindernis (e.g. fences) do not count as obstacles · wohnLaterne(g,x,z,H) lantern · wohnTreffpunkt(g,x,z,a,H,r) meeting place
    // Special buildings: meilenstein (milestone)(g,r,H) · paket (large package)(g,r,H)  (one section per task from H.paketStand(); name via texte.abschnitt)
    // baustelle(g, r, H, feld)   replaces crane/containers on building sites (the hologram of the target is added automatically)
    // wohnhaus(hs, art, stockwerke, r, H)   small houses around old buildings; hs is scaled ×3.1 (house ≈ 0.07 wide)
    // Burned and abandoned versions are created automatically from your buildings.
  },

  // ---------- Replace the landscape (natur, optional) ----------
  natur: {
    // feld(g, r, biom, H) { … }   · also: wiese, wald, schneewald, fels, glut, duene. return false = use the built-in one after all
  },

  // ---------- Landscape (landschaft, optional) ----------
  // landschaft: { kristalle: false },   // no glowing crystals in the built-in landscape
  // Note: nature tiles are already baked at their island position. Animate moving parts in them relative to their start position.

  // ---------- Battle (kampf, optional) ----------
  // kampf: { ohneFussvolk: true },   // no foot soldiers: instead 3 (large package: 5) catapults roll up and shoot at the wall from close range

  // ---------- Units (einheiten, must provide certain parts in userData) ----------
  einheiten: {
    // laeufer(H, feind)  foot soldier. userData: { k: upper body group, beine: [leftGroup, rightGroup], muendung: Vector3 (muzzle) }
    // armee(H)           own unit. userData: { turm: rotating part, muendung: Vector3 }
    // drohne(H)          scout. optional userData.fluegel(t) for wing beats, userData.kegel for a search cone
    // geschuetz(H)       gun. userData: { turm, blitz: H.halo(...) with opacity 0 }
    // lager(H, gross, geschuetz)   camp/ship at the island edge, front points toward +x.
    //                    userData: { fahne (flag), leuchte (light), gesch: [geschuetz(), …] }  – geschuetz() creates one of the above
    // bote(H, farbe)     messenger, flies between the regions (front = +z)
    // luftschiff(H, groesse) airship, flies between the zeppelin fields (nose = +z, center of the hull at the origin)
    // kampfluftschiff(H, feind) own war airship on victory (nose = +x). userData: { muendung: Vector3 }
    // schild(H, R)       defense of the tile instead of the dome, e.g. a wall. userData: { setze(st, blitz, t, dt), treffer(A) → Vector3 }
    //                    st = strength 1…0 over the course of the battle, blitz = fresh hit 0…1
    // lager(...)         additionally optional userData.hoehe (hover height, e.g. for a war airship) and luft:true (burns on victory and sinks)
  }
};
})();
