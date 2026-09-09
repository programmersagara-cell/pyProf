"""Simulate the worker's EXTRACT_VARS script, read LIVE from pyodideWorker.js
so the test can't drift from the source."""
import json, types, io, contextlib, re

src_js = open(r"c:\xampp\htdocs\pyProf\src\engine\pyodideWorker.js", encoding="utf-8").read()
m = re.search(r"const EXTRACT_VARS = `(.*?)`;", src_js, re.S)
assert m, "EXTRACT_VARS block not found in pyodideWorker.js"
EXTRACT_VARS = m.group(1)

USER = '''
name = "Ana"
scores = [90, 75, 88]
student = {"name": name, "grades": scores, "passed": True}
total = sum(scores)
'''

# Mimic pyodide: user code runs in the same global namespace the extractor sees.
g = {"__name__": "__main__"}
buf = io.StringIO()
try:
    with contextlib.redirect_stdout(buf):
        exec(USER, g)
except Exception as e:
    print("USER CODE ERROR:", e)

with contextlib.redirect_stdout(buf):
    result = exec(EXTRACT_VARS, g)   # exec() does NOT return the last expression!
print("exec returned:", result)

# How pyodide.runPython behaves: exec the whole script, return the LAST expression's value.
src = EXTRACT_VARS.rstrip()
body, last = src.rsplit("\n", 1)
try:
    with contextlib.redirect_stdout(buf):
        exec(compile(body, "<extract>", "exec"), g)
        val = eval(compile(last, "<extract-last>", "eval"), g)
    parsed = json.loads(val)
    print("extraction OK, variables:", sorted(parsed.keys()))
    for k, info in parsed.items():
        print(f"  {k}: {info['type']} = {info['repr']}")
except Exception as e:
    import traceback; traceback.print_exc()
    print("EXTRACTION FAILED:", type(e).__name__, e)

# Edge case: user code that errors mid-way (partial state must still extract)
g2 = {"__name__": "__main__"}
try:
    exec("a = 1\nb = [1, 2, 3]\nraise ValueError('boom')", g2)
except Exception:
    pass
try:
    exec(compile(body, "<extract>", "exec"), g2)
    val2 = eval(compile(last, "<extract-last>", "eval"), g2)
    parsed2 = json.loads(val2)
    print("after-error extraction OK:", sorted(parsed2.keys()))
except Exception as e:
    print("AFTER-ERROR EXTRACTION FAILED:", type(e).__name__, e)


