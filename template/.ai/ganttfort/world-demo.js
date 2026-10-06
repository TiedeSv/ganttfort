// Demo world for world.html?demo – the made-up project "Harbor Town App".
// Generated from build/examples/demo.js (build_repo_demo.py), do not edit by hand.
// All dates are relative to today ("@-3" = three days ago); ?now=... simulates a point in time.
(function(){
  const q=new URLSearchParams(location.search).get("now"), now=q?new Date(q):new Date();
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  const D=n=>{const d=new Date(today.getTime()+n*864e5);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const fix=o=>{ if(typeof o==="string"&&/^@-?\d+$/.test(o)) return D(+o.slice(1)); if(Array.isArray(o)) return o.map(fix);
    if(o&&typeof o==="object"){ const r={}; for(const k in o) r[k]=fix(o[k]); return r; } return o; };
  const T=(id,region,type,status,title,x={})=>Object.assign({id,region,type,status,title},x);
  const W=fix({
    meta: { project: "Example · Harbor Town App", as_of: "@0", theme: "medieval", lang: "en" },
    report: "A made-up project: Gullhaven gets an app for the ferry timetable, tickets and a town map. " +
      "Accessibility is due today, the traffic peak is overdue with the hand-in at 16:00, and the live positions have their deadline ahead. " +
      "The storm warnings missed their hand-in three days ago; the trial run at the town office was held.",
    regions: [
      { id: "app", name: "App screens", biome: "meadow", description: "Screens, controls, notifications" },
      { id: "server", name: "Server & interfaces", biome: "rock", description: "Interfaces, live data, load" },
      { id: "data", name: "Timetable data", biome: "steppe", description: "Import, data model, special timetables" },
      { id: "map", name: "Town map", biome: "forest", description: "Map, routes, sights" },
      { id: "ops", name: "Operations & build", biome: "sand", description: "Build, servers, delivery" },
      { id: "quality", name: "Quality", biome: "snow", description: "Tests, accessibility, reviews" },
      { id: "launch", name: "Launch", biome: "volcano", description: "Town office, manual, posters" }
    ],
    tasks: [
      // Done: the building shows the kind of work, the houses around it show the age (5/10/20 days -> 2/4/6 houses, from 20 days a village lime tree)
      T("scaffold", "app", "infra", "done", "Project scaffold and build set up", { started: "@-64", ended: "@-62" }),
      T("ci", "ops", "infra", "done", "Automatic build on every commit", { started: "@-50", ended: "@-48",
        explanation: { picture: "Every zeppelin field is infrastructure. Airships travel between all zeppelin fields of the world: these parts supply the whole project." } }),
      T("test-server", "server", "infra", "done", "Test server set up", { started: "@-40", ended: "@-38" }),
      T("data-model", "data", "typing", "done", "Data model for ferries and departures", { started: "@-55", ended: "@-52",
        explanation: { picture: "Stonemason's lodge = typing: every part gets its exact shape. The templates on the wall are the type hints, the rough blocks at the back are code without types yet." } }),
      T("timetable-import", "data", "pipeline", "done", "Timetable import from the ferry company's data", { started: "@-45", ended: "@-41" }),
      T("api-timetable", "server", "api", "done", "Interface for the next departures", { started: "@-38", ended: "@-34" }),
      T("survey", "launch", "research", "done", "Survey at the ferry pier evaluated", { started: "@-36", ended: "@-31" }),
      T("home-screen", "app", "feature", "done", "Home screen with the next departures", { started: "@-33", ended: "@-29" }),
      T("map-base", "map", "feature", "done", "Town map with all piers", { started: "@-30", ended: "@-26" }),
      T("holidays", "data", "bugfix", "done", "Holiday timetable fixed", { started: "@-26", ended: "@-23" }),
      T("api-tests", "quality", "test", "done", "Tests for the departures interface", { started: "@-28", ended: "@-25" }),
      T("offline-trial", "app", "experiment", "done", "Trial: timetable without network in the harbor cellar", { started: "@-24", ended: "@-22" }),
      T("sights", "map", "feature", "done", "Sights on the map", { started: "@-22", ended: "@-18" }),
      T("timetable-docs", "data", "docs", "done", "Timetable format documented", { started: "@-21", ended: "@-19" }),
      T("manual", "launch", "docs", "done", "Manual for the town office", { started: "@-20", ended: "@-16" }),
      T("map-offline", "map", "performance", "done", "Map loads without network", { started: "@-17", ended: "@-13" }),
      T("payment", "server", "api", "done", "Payment through the payment service", { started: "@-20", ended: "@-14", due: "@-12" }),
      T("startup-time", "app", "performance", "done", "App start time cut in half", { started: "@-19", ended: "@-12" }),
      T("map-tests", "quality", "test", "done", "Tests for the map", { started: "@-12", ended: "@-10" }),
      T("receipt", "app", "feature", "done", "Receipt as PDF", { started: "@-13", ended: "@-9", due: "@-7" }),
      T("clock-change", "data", "bugfix", "done", "Wrong departures after the clock change", { started: "@-10", ended: "@-8" }),
      T("map-code", "map", "refactor", "done", "Map code cleaned up", { started: "@-9", ended: "@-6" }),
      T("handover", "launch", "handoff", "done", "Content handed over to the town office", { started: "@-7", ended: "@-4" }),
      T("imprint", "launch", "other", "done", "Imprint and privacy page", { started: "@-5", ended: "@-3" }),
      T("delay-alert", "app", "feature", "done", "Push alert for delays", { started: "@-6", ended: "@0", new: true,
        files: ["app/alerts/delay.py", "app/alerts/texts.json"],
        explanation: { picture: "Finished today: the building stands, the houses only come with the days.",
          learn: "def alert(departure, actual):\n    delay = (actual - departure.planned).minutes\n    if delay >= 5:\n        send(f\"{departure.ferry}: {delay} minutes late\")",
          check: "How many minutes of delay trigger an alert is a plain number in the code." } }),

      // Victory: finished on the day of the battle before 16:00, the attackers withdrew
      T("search", "app", "feature", "done", "Search for stops", { started: "@-12", ended: "@-1", due: "@-2" }),
      // Old fire ruin: deadline missed, finished later after all. The ruin stays forever, the building stands as a rebuild at the island edge
      T("season-pass", "app", "feature", "done", "Season pass management for commuters", { started: "@-40", due: "@-30", ended: "@-22" }),

      // Work in progress with a deadline: every phase of an attack once
      T("tickets", "app", "feature", "in_progress", "Buy ferry tickets in the app", { started: "@-10", due: "@9",
        note: "Deadline in nine days: still on track, \"deadline ahead\" and the scouts only come a week before." }),
      T("live-positions", "server", "api", "in_progress", "Live positions of the ferries", { started: "@-8", due: "@4", after: ["api-timetable"],
        note: "Deadline ahead: scouts are circling." }),
      T("footpaths", "map", "feature", "in_progress", "Footpaths to the piers", { started: "@-9", due: "@1",
        note: "Final stretch: a war airship anchors at the island edge and waits." }),
      T("accessibility", "quality", "test", "in_progress", "Check accessibility", { started: "@-6", due: "@0", critical: true,
        note: "Due today: the building site is under siege." }),
      T("traffic-peak", "server", "performance", "in_progress", "Server survives the rush at the harbor festival", { started: "@-7", due: "@-1",
        note: "Overdue: the deadline was yesterday. If the task is done by the hand-in today at 16:00, it is delivered on time, otherwise the building burns down." }),
      T("storm-warning", "data", "feature", "in_progress", "Show storm warnings", { started: "@-14", due: "@-4",
        note: "Hand-in missed: burned down three days ago at 16:00. The ruin stays, work continues at the island edge." }),
      T("read-aloud", "app", "feature", "in_progress", "Read departures aloud", { started: "@-15", due: "@11",
        moved: [{ on: "@-3", from: "@-2", to: "@11", reason: "The platform's speech output came later" }],
        note: "Deadline moved: the attackers withdrew, their traces stay visible for a while." }),

      // Work in progress without a deadline
      T("cache", "server", "refactor", "in_progress", "Rework the cache", { started: "@-3" }),
      T("posters", "launch", "other", "in_progress", "Posters for the ferry pier", { started: "@-2" }),

      // Dropped: left half built; the longer ago, the more it overgrows
      T("smartwatch", "app", "feature", "dropped", "Smartwatch app", { started: "@-34", ended: "@-25" }),
      T("own-tiles", "map", "research", "dropped", "Render our own map tiles", { started: "@-6", ended: "@-2" }),

      // Planned: building site with material, not started yet
      T("german", "app", "feature", "planned", "German translation", { planned_start: "@5", due: "@20", after: ["tickets"] }),
      T("partner-docs", "server", "docs", "planned", "Interface docs for partners", { planned_start: "@3" }),
      T("ticket-tests", "quality", "test", "planned", "Test the purchase flow", { planned_start: "@8", due: "@12", after: ["tickets"] }),
      T("events", "launch", "feature", "planned", "Events calendar", {})
    ],
    milestones: [
      { id: "trial-run", title: "Trial run at the town office", date: "@-4", tasks: ["handover", "manual", "imprint"],
        description: "Held: everything was done before the deadline, the castle carries golden banners." },
      { id: "harbor-festival", title: "Launch at the harbor festival", date: "@6", tasks: ["tickets", "live-positions", "accessibility"],
        description: "Public launch of the app at the harbor festival. The milestone stands as a castle on the island with most of its tasks." }
    ],
    packages: [
      { id: "ticket-sales", title: "Ticket sales", tasks: ["payment", "receipt", "tickets", "ticket-tests"] },
      { id: "town-map", title: "Town map 2.0", tasks: ["map-base", "sights", "map-offline", "map-tests", "map-code", "footpaths"] },
      { id: "timetable-core", title: "Timetable core", tasks: ["data-model", "timetable-import", "api-timetable", "api-tests", "holidays", "timetable-docs", "clock-change", "home-screen", "live-positions"] }
    ],
    log: [
      { date: "@-64", text: "Project started" },
      { date: "@-29", text: "First version with timetable shared internally" },
      { date: "@-4", text: "Trial run at the town office started" }
    ]
  });
  // Repo version only: two repos, architecture, branches, PRs and commits
  W.meta.project="Demo · Harbor Town App";
  W.meta.plan={file:"plan.mmd",draft:false};
  W.meta.repos={app:{name:"App",pitfall_label:"Kotlin pitfall",code:"kotlin"},server:{name:"Server",pitfall_label:"Python pitfall",code:"py"}};
  W.meta.main_repo="app";
  const REPO={app:"app",map:"app",quality:"app",launch:"app",server:"server",data:"server",ops:"server"};
  W.regions.forEach(r=>{ r.repo=REPO[r.id]||"app"; });
  const task=id=>W.tasks.find(f=>f.id===id);
  const c=(hash,days,text,repo)=>({hash,date:D(days),text,repo});
  Object.assign(task("tickets"),{branch:"feature/tickets",pr:{number:"#42",status:"draft"},
    commits:[c("3f1a9e2",-9,"Tickets: shopping cart scaffold","app"),c("8b20c71",-5,"Tickets: payment step connected","app"),c("d47e0aa",-1,"Tickets: error messages while paying","app")]});
  Object.assign(task("traffic-peak"),{branch:"perf/harbor-festival-load",pr:{number:"#39",status:"open"},
    commits:[c("1c9b3f4",-6,"Load test for 5000 users at once","server"),c("5e7d212",-2,"Cache departures","server")]});
  Object.assign(task("live-positions"),{branch:"feature/live-positions",
    commits:[c("a0e44c9",-7,"Receive ferry positions","server"),c("f3b8d10",-3,"Send positions to the app","server")]});
  Object.assign(task("delay-alert"),{branch:"feature/delay-alert",pr:{number:"#37",status:"merged"},
    commits:[c("7a61c05",-5,"Compute delay from live data","server"),c("c2f9e88",0,"Push alert for delays","app")]});
  Object.assign(task("search"),{pr:{number:"#35",status:"merged"},commits:[c("9d03b6e",-1,"Search for stops","app")]});
  W.diagram={direction:"LR",text:"Demo: the app gets departures and positions from the server, the server reads the timetable data of the ferry company.",
    edges:[{from:"app",to:"server"},{from:"map",to:"server"},{from:"server",to:"data"},{from:"ops",to:"server"},
      {from:"quality",to:"app"},{from:"launch",to:"app"},
      {from:"repo:server",to:"repo:app",text:"departures, positions",kind:"flow"}]};
  window.GANTTFORT_WORLD=W;
})();
