#!/usr/bin/env python3
"""Builds the demo world of the repo version (.ai/ganttfort/world-demo.js) from the example world "Harbor Town App".

One source for all versions: build/examples/demo.js. The repo version also gets repos, an architecture
diagram, branches, PRs and commits, so these views show something too.
Usage: python3 build_repo_demo.py <target/world-demo.js> [more targets ...]
"""
import pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
source = (HERE / "examples" / "demo.js").read_text(encoding="utf-8")
m = re.search(r"return fix\((\{.*\})\);\s*\};\s*$", source, re.S)
assert m, "object in examples/demo.js not found"
literal = m.group(1)

HEAD = """// Demo world for world.html?demo – the made-up project "Harbor Town App".
// Generated from build/examples/demo.js (build_repo_demo.py), do not edit by hand.
// All dates are relative to today ("@-3" = three days ago); ?now=... simulates a point in time.
(function(){
  const q=new URLSearchParams(location.search).get("now"), now=q?new Date(q):new Date();
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  const D=n=>{const d=new Date(today.getTime()+n*864e5);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const fix=o=>{ if(typeof o==="string"&&/^@-?\\d+$/.test(o)) return D(+o.slice(1)); if(Array.isArray(o)) return o.map(fix);
    if(o&&typeof o==="object"){ const r={}; for(const k in o) r[k]=fix(o[k]); return r; } return o; };
  const T=(id,region,type,status,title,x={})=>Object.assign({id,region,type,status,title},x);
  const W=fix("""

FOOT = """);
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
"""

targets = sys.argv[1:] or [str(HERE.parent / "template" / ".ai" / "ganttfort" / "world-demo.js")]
for t in targets:
    pathlib.Path(t).write_text(HEAD + literal + FOOT, encoding="utf-8", newline="\n")
    print("written:", t)
