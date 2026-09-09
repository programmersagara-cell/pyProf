"""Verify every JS module import resolves to a real file under src/."""
import pathlib, re, os

root = pathlib.Path("src")
count = {"imports": 0, "missing": 0}
for f in sorted(root.rglob("*.js")):
    s = f.read_text(encoding="utf-8")
    for m in re.finditer(r"import\s+[^;]+?\s+from\s+\"([^\"]+)\"", s):
        rel = m.group(1)
        target = (f.parent / (rel if rel.endswith(".js") else rel + ".js")).resolve()
        count["imports"] += 1
        if not target.exists():
            count["missing"] += 1
            print("MISSING:", f, "->", m.group(1))
    for m in re.finditer(r"import\s+[^;]+?\s+from\s+'([^']+)'", s):
        rel = m.group(1)
        target = (f.parent / (rel if rel.endswith(".js") else rel + ".js")).resolve()
        count["imports"] += 1
        if not target.exists():
            count["missing"] += 1
            print("MISSING:", f, "->", m.group(1))
print("imports:", count["imports"], "missing:", count["missing"])