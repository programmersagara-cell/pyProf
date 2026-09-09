"""Post-transform integrity check for challenge/lesson JS data."""
import pathlib
import verify as V

BT = "`"
def report(fname):
    s = pathlib.Path(fname).read_text(encoding="utf-8")
    # balance checks
    issues = []
    for a, b in [("{", "}"), ("[", "]"), ("(", ")")]:
        if s.count(a) != s.count(b):
            issues.append(f"unbalanced {a}{b} {s.count(a)} vs {s.count(b)}")
    nbt = s.count(BT)
    if nbt % 2 != 0:
        issues.append(f"odd backticks: {nbt}")
    # count challenges & required fields
    objs = V.top_level_objects(s)
    empty_starter = []
    missing_sol = []
    for o in objs:
        cid = V.dq(o, "id")
        if not V.bt(o, "starter"):
            empty_starter.append(cid)
        if not V.bt(o, "solution") and not V.bt(o, "broken"):
            missing_sol.append(cid)
        tests = V.parse_tests(o)
        if "challenges" in fname and not tests:
            issues.append(f"{cid}: no tests")
    print(f"--- {fname}: objects={len(objs)} issues={issues}")
    if missing_sol: print("   MISSING solution:", missing_sol)
    if empty_starter: print("   EMPTY starter:", empty_starter)

for f in ["src/challenges/beginner.js", "src/challenges/intermediate.js",
          "src/challenges/advanced.js", "src/lessons/lessons.js",
          "src/challenges/debugging.js"]:
    report(f)

# global challenge count
tot = sum(len(V.top_level_objects(pathlib.Path(f).read_text(encoding="utf-8")))
          for f in ["src/challenges/beginner.js", "src/challenges/intermediate.js",
                    "src/challenges/advanced.js"])
print("TOTAL CHALLENGES:", tot)
dbg = len(V.top_level_objects(pathlib.Path("src/challenges/debugging.js").read_text(encoding="utf-8")))
print("DEBUG:", dbg)
less = len(V.top_level_objects(pathlib.Path("src/lessons/lessons.js").read_text(encoding="utf-8")))
print("LESSONS:", less)