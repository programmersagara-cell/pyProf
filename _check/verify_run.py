import re
print("START", flush=True)
import verify as V

fails, notes = [], []

print("C1", flush=True)
# ---------- challenges ----------
for fname in ["src/challenges/beginner.js", "src/challenges/intermediate.js", "src/challenges/advanced.js"]:
    f = V.read(fname)
    for obj in V.top_level_objects(f):
        cid = re.search(r'id:\s*"(.*?)"', obj).group(1)
        title = re.search(r'title:\s*"(.*?)"', obj).group(1)
        print("CHK", cid, flush=True)
        solution_field = V.bt(obj, "solution")
        tests = V.parse_tests(obj)
        if not solution_field:
            fails.append(f"[{cid}] '{title}' MISSING solution field"); continue
        solution = V.unescape(solution_field)
        if not tests:
            fails.append(f"[{cid}] '{title}' MISSING tests"); continue
        for t in tests:
            full = V.prelude_from(t["inputs"]) + "\n" + solution + (("\n" + t["prelude"]) if t["prelude"] else "")
            print("TEST", cid, flush=True)
            r = V.exec_code(full)
            label = f"[{cid}] '{title}' [{t['name'] or 'test'}]"
            if r.hung: fails.append(f"{label} HUNG (infinite loop?)")
            elif r.err: fails.append(f"{label} CRASH: {str(r.err).strip()}")
            elif V.norm(r.out) != V.norm(t["expected"]):
                fails.append(f"{label}\n  expected: {V.norm(t['expected'])!r}\n  actual:   {V.norm(r.out)!r}")
        req = re.search(r'requires:\s*\[(.*?)\]', obj, re.S)
        if req:
            for p in re.findall(r'"(.*?)"', req.group(1)):
                p = p.replace("\\\\", "\\")
                if not re.search(p, solution): fails.append(f"[{cid}] violates requires /{p}/")
        forb = re.search(r'forbidden:\s*\[(.*?)\]', obj, re.S)
        if forb:
            for p in re.findall(r'"(.*?)"', forb.group(1)):
                p = p.replace("\\\\", "\\")
                if re.search(p, solution): fails.append(f"[{cid}] violates forbidden /{p}/")

# ---------- debugging ----------
print("DBG", flush=True)
for obj in V.top_level_objects(V.read("src/challenges/debugging.js")):
    did = re.search(r'id:\s*"(.*?)"', obj).group(1)
    title = re.search(r'title:\s*"(.*?)"', obj).group(1)
    print("CHKD", did, flush=True)
    solution_field, broken_field, expected_field = V.bt(obj, "solution"), V.bt(obj, "broken"), V.bt(obj, "expected")
    task = V.dq(obj, "task") or ""
    if not solution_field or not broken_field:
        fails.append(f"[{did}] '{title}' MISSING solution/broken"); continue
    solution, broken = V.unescape(solution_field), V.unescape(broken_field)
    expected = V.unescape(expected_field) if expected_field else ""
    tb = (task or "").lower()
    print("   tb:", repr(tb), flush=True)
    if "never end" in tb or "recurses forever" in tb or "sandbox will stop" in tb or "will stop it" in tb:
        print("   SKIP-BROKEN", flush=True)
        pass  # infinite-loop broken code — confirmed broken by design; skip exec
    else:
        rb = V.exec_code(broken)
        print("   BROKEN done hung=", rb.hung, flush=True)
        if rb.hung:
            pass
        elif rb.err is None and V.norm(rb.out) == V.norm(expected):
            fails.append(f"[{did}] '{title}' broken code already produces expected output!")
    print("   solving", flush=True)
    rs = V.exec_code(solution)
    if rs.hung: fails.append(f"[{did}] '{title}' fix HUNG")
    elif rs.err: fails.append(f"[{did}] '{title}' fix CRASH: {str(rs.err).strip()}")
    elif V.norm(rs.out) != V.norm(expected):
        fails.append(f"[{did}] '{title}'\n  fix expected: {V.norm(expected)!r}\n  fix actual:   {V.norm(rs.out)!r}")

# ---------- lessons ----------
for obj in V.top_level_objects(V.read("src/lessons/lessons.js")):
    lid = re.search(r'id:\s*"(.*?)"', obj).group(1)
    title = re.search(r'title:\s*"(.*?)"', obj).group(1)
    example_field, expected_field = V.bt(obj, "example"), V.bt(obj, "expectedOutput")
    if not example_field or not expected_field: continue
    r = V.exec_code(V.unescape(example_field))
    if r.hung: notes.append(f"[{lid}] '{title}' example HUNG")
    elif r.err: notes.append(f"[{lid}] '{title}' example raises: {str(r.err).strip()}")
    elif V.norm(r.out) != V.norm(V.unescape(expected_field)):
        notes.append(f"[{lid}] '{title}' example mismatch:\n  expected: {V.norm(V.unescape(expected_field))!r}\n  actual:   {V.norm(r.out)!r}")

print("RESULT_FAILURES", len(fails))
for f in fails: print(" -", f)
print("RESULT_NOTES", len(notes))
for n in notes: print(" *", n)
print("DONE")