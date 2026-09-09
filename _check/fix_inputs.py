"""Transform challenge data to be INPUT-DRIVEN.

The app runs hidden tests by prepending `test.inputs` (as real variables) before
the student code. Many reference solutions ALSO hardcode those input variables,
which overrides the injected inputs and makes hidden tests fail. This script:

  * strips the leading block of `<inputVar> = ...` assignments from `solution`
    and `starter`, and
  * moves the first test's inputs into `defaultInputs` so the visible Run works.

It edits the JS files in place. Verifier (verify_run.py) should then pass.
"""
import re, json, pathlib
import verify as V

ROOT = pathlib.Path(__file__).resolve().parent.parent
NL = "\\n"  # literal backslash-n used inside the JS backtick strings

def strip_leading_inputs(raw, varset):
    """Remove the leading statements that assign to any of varset. Returns new raw."""
    if not varset:
        return raw
    lines = raw.split(NL)
    out = []
    i = 0
    n = len(lines)
    started = False
    while i < n:
        ln = lines[i]
        m = re.match(r'^\s*([A-Za-z_]\w*)\s*=\s*(.*)$', ln)
        # only skip while we are still in the leading declaration block
        if not started and m and m.group(1) in varset:
            val = m.group(2)
            depth = sum(val.count(c) for c in "[{(") - sum(val.count(c) for c in "]})")
            i += 1
            while depth > 0 and i < n:
                depth += sum(lines[i].count(c) for c in "[{(") - sum(lines[i].count(c) for c in "]})")
                i += 1
            continue
        started = True
        out.append(ln)
        i += 1
    while out and out[0].strip() == "":
        out.pop(0)
    return NL.join(out)

def js_dump(v):
    # json.dumps yields a valid JS object/array literal
    return json.dumps(v, ensure_ascii=False)

def process_file(fname):
    path = ROOT / fname
    src = path.read_text(encoding="utf-8")
    changed = False
    for obj in V.top_level_objects(src):
        cid = re.search(r'id:\s*"(.*?)"', obj).group(1)
        tests = V.parse_tests(obj)
        varset = set()
        for t in tests:
            varset |= set(t["inputs"].keys())
        if not varset:
            continue
        first = tests[0]["inputs"]
        edited = obj
        for field in ("solution", "starter"):
            m = re.search(field + r':\s*`((?:[^`]|\\`)*)`', edited, re.S)
            if not m:
                continue
            new_raw = strip_leading_inputs(m.group(1), varset)
            if new_raw != m.group(1):
                edited = edited[:m.start(1)] + new_raw + edited[m.end(1):]
        if re.search(r'defaultInputs:\s*\{\}', edited):
            js = js_dump(first)[1:-1] if first else ""
            edited = re.sub(r'defaultInputs:\s*\{\}', "defaultInputs: {" + js + "}", edited, count=1)
        if edited != obj:
            src = src.replace(obj, edited, 1)
            changed = True
        print(fname, cid, "edited" if edited != obj else "unchanged", flush=True)
    if changed:
        path.write_text(src, encoding="utf-8")
    return changed
    if changed:
        path.write_text(src, encoding="utf-8")
    return changed

for f in ["src/challenges/beginner.js", "src/challenges/intermediate.js", "src/challenges/advanced.js"]:
    print(f, "changed=", process_file(f))