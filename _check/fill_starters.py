"""Fill empty challenge `starter` fields with a helpful comment."""
import pathlib
import verify as V

NL = "\\n"

def fill(fname):
    p = pathlib.Path(fname)
    s = p.read_text(encoding="utf-8")
    edited = 0
    for obj in V.top_level_objects(s):
        cur = V.bt(obj, "starter")
        if cur not in (None, ""):
            continue
        tests = V.parse_tests(obj)
        vars_ = set()
        for t in tests:
            vars_ |= set(t["inputs"].keys())
        varlist = ", ".join(sorted(vars_))
        if varlist:
            line1 = f"# Variables provided: {varlist}"
        else:
            line1 = "# Complete this challenge"
        starter = "starter: `" + line1 + NL + "# Write your solution here." + NL + "`,"
        new = obj.replace("starter: ``,", starter, 1)
        if new == obj:
            continue
        s = s.replace(obj, new, 1)
        edited += 1
    p.write_text(s, encoding="utf-8")
    print(fname, "filled", edited)

for f in ["src/challenges/beginner.js", "src/challenges/intermediate.js",
          "src/challenges/advanced.js"]:
    fill(f)