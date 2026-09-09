"""PYTHON·LAB — offline verification harness (part 1)."""
import re, subprocess, sys, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

def read(p): return (ROOT / p).read_text(encoding="utf-8")

def top_level_objects(src):
    objs, depth, start, i, n = [], 0, None, 0, len(src)
    in_bt = False
    while i < n:
        c = src[i]
        if in_bt:
            if c == "\\": i += 2; continue
            if c == "`": in_bt = False
        else:
            if c == "`": in_bt = True
            elif c == "{":
                if depth == 0: start = i
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0 and start is not None:
                    objs.append(src[start:i+1]); start = None
        i += 1
    return objs

def bt(obj, field):
    m = re.search(field + r':\s*`([^`]*)`', obj, re.S)
    return m.group(1) if m else None

def unescape(s): return s.replace("\\n", "\n").replace("\\'", "'").replace('\\"', '"')

def parse_inputs(s):
    s2 = re.sub(r'([{,]\s*)([A-Za-z_]\w*)\s*:', r'\1"\2":', s)
    return json.loads(s2)

def parse_tests(obj):
    m = re.search(r'tests:\s*\[(.*)\n\s*\],?\s*\n?\s*\}', obj, re.S)
    if not m: return []
    tests = []
    for t in top_level_objects(m.group(1)):
        inp = re.search(r'inputs:\s*(\{.*?\})\s*,\s*\n', t, re.S) or re.search(r'inputs:\s*(\{\})', t)
        inputs = parse_inputs(inp.group(1)) if inp else {}
        exp = bt(t, "expected")
        tests.append({"inputs": inputs, "expected": unescape(exp) if exp else "",
                      "prelude": bt(t, "prelude"),
                      "name": (re.search(r'name:\s*"([^"]*)"', t) or [None, None])[1]})
    return tests

def prelude_from(inputs):
    return "\n".join(f"{k} = {json.dumps(v, ensure_ascii=False)}" for k, v in inputs.items())

def run_py(code):
    r = subprocess.run([sys.executable, "-I", "-c", code], capture_output=True, text=True, timeout=5)
    return r.stdout, r.stderr

def norm(s):
    return "\n".join(l.rstrip() for l in str(s).replace("\r\n", "\n").split("\n")).strip()
fails, warn = [], []

# ---------- challenges ----------
for fname in ["src/challenges/beginner.js", "src/challenges/intermediate.js", "src/challenges/advanced.js"]:
    for obj in top_level_objects(read(fname)):
        cid = re.search(r'id:\s*"(.*?)"', obj).group(1)
        title = re.search(r'title:\s*"(.*?)"', obj).group(1)
        print(f"  testing {cid} '{title}'...", flush=True)
        solution_field = bt(obj, "solution")
        if not solution_field:
            warn.append(f"{cid} '{title}': no solution field (skipped)"); continue
        solution = unescape(solution_field)
        tests = parse_tests(obj)
        if not tests:
            fails.append(f"{cid}: no tests parsed"); continue
        for t in tests:
            full = (prelude_from(t["inputs"]) + ("\n" + t["prelude"] if t["prelude"] else "") + "\n" + solution)
            out, err = run_py(full)
            if err.strip():
                fails.append(f"{cid} '{title}' [{t['name'] or 'test'}] crashed: {err.strip().splitlines()[-1]}")
            elif norm(out) != norm(t["expected"]):
                fails.append(f"{cid} '{title}' [{t['name'] or 'test'}]\n  expected: {norm(t['expected'])!r}\n  actual:   {norm(out)!r}")
        req = re.search(r'requires:\s*\[(.*?)\]', obj, re.S)
        if req:
            for p in re.findall(r'"(.*?)"', req.group(1)):
                p = p.replace("\\\\", "\\")  # unescape JS string escapes for regex use
                if not re.search(p, solution): fails.append(f"{cid}: solution violates requires /{p}/")
        forb = re.search(r'forbidden:\s*\[(.*?)\]', obj, re.S)
        if forb:
            for p in re.findall(r'"(.*?)"', forb.group(1)):
                p = p.replace("\\\\", "\\")  # unescape JS string escapes for regex use
                if re.search(p, solution): fails.append(f"{cid}: solution violates forbidden /{p}/")

# ---------- debugging ----------
for obj in top_level_objects(read("src/challenges/debugging.js")):
    did = re.search(r'id:\s*"(.*?)"', obj).group(1)
    title = re.search(r'title:\s*"(.*?)"', obj).group(1)
    solution, broken = unescape(bt(obj, "solution")), unescape(bt(obj, "broken"))
    expected = unescape(bt(obj, "expected"))
    out_b, err_b = run_py(broken)
    if norm(out_b) == norm(expected) and not err_b.strip():
        fails.append(f"{did}: broken code already produces expected output!")
    out, err = run_py(solution)
    if err.strip():
        fails.append(f"{did} '{title}' fix crashed: {err.strip().splitlines()[-1]}")
    elif norm(out) != norm(expected):
        fails.append(f"{did} '{title}'\n  expected: {norm(expected)!r}\n  actual:   {norm(out)!r}")

# ---------- lessons ----------
for obj in top_level_objects(read("src/lessons/lessons.js")):
    lid = re.search(r'id:\s*"(.*?)"', obj).group(1)
    title = re.search(r'title:\s*"(.*?)"', obj).group(1)
    example, expected = bt(obj, "example"), bt(obj, "expectedOutput")
    if not example or not expected: continue
    out, err = run_py(unescape(example))
    if err.strip():
        warn.append(f"{lid} '{title}' example raises: {err.strip().splitlines()[-1]}")
    elif norm(out) != norm(unescape(expected)):
        warn.append(f"{lid} '{title}' example output mismatch:\n  expected: {norm(unescape(expected))!r}\n  actual:   {norm(out)!r}")

print("=== CHALLENGE/DEBUG FAILURES:", len(fails))
for f in fails: print(" -", f)
print("=== LESSON OUTPUT NOTES:", len(warn))
for w in warn: print(" -", w)
print("DONE")
