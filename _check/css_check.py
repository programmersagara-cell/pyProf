"""Validate main.css: brace balance + every var() reference resolves."""
import re
css = open(r"c:\xampp\htdocs\pyProf\src\styles\main.css", encoding="utf-8").read()
depth, line, bad = 0, 1, None
for ch in css:
    if ch == "\n": line += 1
    if ch == "{": depth += 1
    if ch == "}":
        depth -= 1
        if depth < 0 and bad is None: bad = line
print("brace depth:", depth, ("first-negative-line:" + str(bad)) if depth < 0 else "OK")
used = {m.group(1) for m in re.finditer(r"var\(--([a-z0-9-]+)", css, re.I)}
defined = {m.group(1) for m in re.finditer(r"--([a-z0-9-]+)\s*:", css)}
missing = sorted(v for v in used if v not in defined)
print("undefined vars:", missing or "none")
# sanity: classes referenced by the new challenge/debug markup
for cls in (".ch-editor-col", ".ch-main", ".editor-host", ".done-pill", ".constraint"):
    print(cls, "defined" if cls in css else "MISSING")
