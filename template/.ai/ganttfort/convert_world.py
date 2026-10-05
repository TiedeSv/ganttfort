#!/usr/bin/env python3
"""One-time converter: old German world format -> English format.

  python .ai/ganttfort/convert_world.py                 converts the old folder .ai/welt/ into .ai/ganttfort/
  python .ai/ganttfort/convert_world.py old.json        converts a single file (e.g. an export from the Artifact)
                                                    and writes old.en.json next to it

What it does with an old folder:
  welt.json -> world.json (keys and values translated, see schema.js)
  regeln.md -> rules.md, profil.md -> profile.md (copied unchanged, the text is yours)
  plan.mmd  -> plan.mmd ("%% entwurf" becomes "%% draft")
Nothing in the old folder is changed or deleted. Check the result, then delete .ai/welt/ yourself.
Afterwards run: python .ai/ganttfort/check_world.py
"""
import json
import pathlib
import re
import shutil
import sys

HERE = pathlib.Path(__file__).resolve().parent


def load_schema():
    text = (HERE / "schema.js").read_text(encoding="utf-8")
    m = re.search(r"/\*JSON\*/(.*?)/\*END\*/", text, re.S)
    if not m:
        sys.exit("schema.js: JSON block not found")
    return json.loads(m.group(1))


S = load_schema()


def to_english(obj, ctx="root", path="", unknown=None):
    unknown = [] if unknown is None else unknown
    if isinstance(obj, list):
        return [to_english(x, ctx, f"{path}[{i}]", unknown) for i, x in enumerate(obj)]
    if not isinstance(obj, dict):
        return obj
    m = S["maps"].get(ctx)
    if m == "@type":
        types = S["values"]["task.typ"]
        return {types.get(k, k): v for k, v in obj.items()}
    if m:
        return {k: to_english(v, m, f"{path}.{k}", unknown) for k, v in obj.items()}
    table, out = S["contexts"].get(ctx, {}), {}
    for k, v in obj.items():
        if k.startswith("_"):
            continue
        entry = table.get(k)
        if not entry:
            out[k] = v
            unknown.append(f"{path}.{k}")
            continue
        en, child = entry
        vmap = S["values"].get(f"{ctx}.{k}")
        if child:
            v = to_english(v, child, f"{path}.{en}", unknown)
        elif vmap and isinstance(v, str):
            v = vmap.get(v, v)
        out[en] = v
    return out


def convert_json(data):
    unknown = []
    data = to_english(data, unknown=unknown)
    data.get("meta", {}).setdefault("lang", "de")   # old worlds were written in German
    return data, unknown


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def report(unknown):
    if unknown:
        print("Kept unchanged (unknown keys, check them):")
        for u in unknown:
            print("  ", u)


def main():
    if len(sys.argv) > 1:
        src = pathlib.Path(sys.argv[1])
        data, unknown = convert_json(json.loads(src.read_text(encoding="utf-8")))
        dst = src.with_name(src.stem + ".en.json")
        write_json(dst, data)
        print(f"Written: {dst}")
        report(unknown)
        return
    old = HERE.parent / "welt"
    if not old.is_dir():
        sys.exit(f"No old folder found at {old}. Pass a JSON file instead: python {pathlib.Path(__file__).name} old.json")
    done = []
    if (old / "welt.json").exists():
        if (HERE / "world.json").exists():
            sys.exit("world.json already exists – not overwriting. Move it away first if you want to convert again.")
        data, unknown = convert_json(json.loads((old / "welt.json").read_text(encoding="utf-8")))
        write_json(HERE / "world.json", data)
        done.append("welt.json -> world.json")
        report(unknown)
    for a, b in (("regeln.md", "rules.md"), ("profil.md", "profile.md")):
        if (old / a).exists() and not (HERE / b).exists():
            shutil.copy(old / a, HERE / b)
            done.append(f"{a} -> {b}")
    if (old / "plan.mmd").exists() and not (HERE / "plan.mmd").exists():
        plan = (old / "plan.mmd").read_text(encoding="utf-8")
        plan = re.sub(r"^(\s*)%%\s*entwurf\s*$", r"\1%% draft", plan, flags=re.M | re.I)
        (HERE / "plan.mmd").write_text(plan, encoding="utf-8")
        done.append("plan.mmd -> plan.mmd")
    print("Converted: " + (", ".join(done) or "nothing"))
    print("Next: python .ai/ganttfort/check_world.py – then delete .ai/welt/ yourself.")


if __name__ == "__main__":
    main()
