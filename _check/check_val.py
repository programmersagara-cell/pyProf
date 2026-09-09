"""Strict JS structural balance check: ignore backtick & quoted string contents."""
import pathlib

def strip_strings(s):
    out = []
    i, n = 0, len(s)
    while i < n:
        c = s[i]
        if c == "`":
            j = i + 1
            while j < n:
                if s[j] == "\\": j += 2; continue
                if s[j] == "`": break
                j += 1
            i = j + 1 if j < n else n
            continue
        if c == '"' or c == "'":
            q = c
            j = i + 1
            while j < n:
                if s[j] == "\\": j += 2; continue
                if s[j] == q: break
                j += 1
            i = j + 1 if j < n else n
            continue
        out.append(c); i += 1
    return "".join(out)

def check(path):
    s = strip_strings(pathlib.Path(path).read_text(encoding="utf-8"))
    bad = []
    for a, b in [("{", "}"), ("[", "]"), ("(", ")")]:
        if s.count(a) != s.count(b):
            bad.append(f"{a}{b}: {s.count(a)} vs {s.count(b)}")
    print(path, "->", bad if bad else "OK")

for f in ["src/challenges/beginner.js", "src/challenges/intermediate.js",
          "src/challenges/advanced.js", "src/lessons/lessons.js",
          "src/challenges/debugging.js", "src/index.js", "src/challenges/index.js"]:
    import os
    if os.path.exists(f):
        check(f)