"""PYTHON·LAB — single-process offline verifier (part 1).

Runs every challenge solution, debug fix and lesson example through real Python
in ONE interpreter (exec in a fresh global namespace with captured stdout), so it
is fast enough to run on machines where spawning Python per-case is too slow.
Infinite-loop debug cases are guarded with a thread-based timeout.
"""
import re, sys, json, pathlib, io, threading, contextlib

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

def dq(obj, field):
    m = re.search(field + r':\s*"((?:[^"\\]|\\.)*)"', obj, re.S)
    if not m: return None
    s = m.group(1)
    return s.replace('\\"', '"').replace("\\\\", "\\")

def unescape(s): return s.replace("\\n", "\n").replace("\\'", "'").replace('\\"', '"')

def parse_inputs(s):
    try:
        return js_literal(s)
    except Exception:
        s2 = re.sub(r'([{,]\\s*)([A-Za-z_]\\w*)\\s*:', r'\\1"\\2":', s)
        return json.loads(s2)

# ---- tiny JS-object-literal -> Python converter (for test inputs) ----
def js_literal(text):
    toks = []
    i, n = 0, len(text)
    while i < n:
        c = text[i]
        if c in " \t\r\n": i += 1; continue
        if c == '"':
            j = i + 1
            while j < n and text[j] != '"':
                if text[j] == "\\": j += 1
                j += 1
            toks.append(["str", text[i+1:j].replace('\\"', '"').replace("\\\\", "\\")]); i = j + 1; continue
        if text.startswith("true", i): toks.append(["lit", True]); i += 4; continue
        if text.startswith("false", i): toks.append(["lit", False]); i += 5; continue
        if text.startswith("null", i): toks.append(["lit", None]); i += 4; continue
        if c in "{}[],:":
            toks.append([c, None]); i += 1; continue
        m = re.match(r'[A-Za-z_$][\w$]*', text[i:])
        if m:
            toks.append(["word", m.group(0)]); i += len(m.group(0)); continue
        m = re.match(r'-?\d+(?:\.\d+)?', text[i:])
        if m:
            toks.append(["num", float(m.group(0)) if "." in m.group(0) else int(m.group(0))]); i += len(m.group(0)); continue
        raise ValueError("unexpected char " + c)
    pos = {"i": 0, "toks": toks}
    val, pos = _jv(pos)
    if pos["i"] != len(toks): raise ValueError("trailing tokens")
    return val

def _jv(pos):
    t = pos["toks"][pos["i"]]
    k = t[0]
    if k == "str" or k == "num" or k == "lit":
        pos["i"] += 1; return t[1], pos
    if k == "[":
        pos["i"] += 1; arr = []
        while pos["i"] < len(pos["toks"]) and pos["toks"][pos["i"]][0] != "]":
            v, pos = _jv(pos)
            arr.append(v)
            if pos["i"] < len(pos["toks"]) and pos["toks"][pos["i"]][0] == ",":
                pos["i"] += 1
        if pos["i"] < len(pos["toks"]): pos["i"] += 1  # consume ]
        return arr, pos
    if k == "{":
        pos["i"] += 1; d = {}
        while pos["i"] < len(pos["toks"]) and pos["toks"][pos["i"]][0] != "}":
            keytok = pos["toks"][pos["i"]]
            key = keytok[1] if keytok[0] == "str" else str(keytok[1])
            pos["i"] += 1
            if pos["i"] < len(pos["toks"]) and pos["toks"][pos["i"]][0] == ":":
                pos["i"] += 1
                v, pos = _jv(pos)
                d[key] = v
            if pos["i"] < len(pos["toks"]) and pos["toks"][pos["i"]][0] == ",":
                pos["i"] += 1
        if pos["i"] < len(pos["toks"]): pos["i"] += 1  # consume }
        return d, pos
    raise ValueError("unexpected " + k)

def parse_tests(obj):
    m = re.search(r'tests\s*:\s*\[', obj)
    if not m: return []
    seg = obj[m.end():]
    # balance to the closing ']' of the tests array (ignore backticks)
    depth, i, in_bt = 1, 0, False
    n = len(seg)
    while i < n and depth:
        c = seg[i]
        if in_bt:
            if c == "\\": i += 2; continue
            if c == "`": in_bt = False
        else:
            if c == "`": in_bt = True
            elif c == "[" or c == "{": depth += 1
            elif c == "]" or c == "}": depth -= 1
        i += 1
    array = seg[:i]
    tests = []
    for t in top_level_objects(array):
        inp = re.search(r'inputs\s*:\s*(\{(?:[^{}]*|\{[^{}]*\})*\})', t, re.S)
        inputs = parse_inputs(inp.group(1)) if inp else {}
        exp = re.search(r'expected\s*:\s*`((?:[^`]|\\`)*)`', t, re.S)
        pre = re.search(r'prelude\s*:\s*`((?:[^`]|\\`)*)`', t, re.S)
        tests.append({"inputs": inputs,
                      "expected": unescape(exp.group(1)) if exp else "",
                      "prelude": unescape(pre.group(1)) if pre else None,
                      "name": (re.search(r'name\s*:\s*"([^"]*)"', t) or [None, None])[1]})
    return tests

def prelude_from(inputs):
    return "\n".join(f"{k} = {json.dumps(v, ensure_ascii=False)}" for k, v in inputs.items())

def norm(s):
    return "\n".join(l.rstrip() for l in str(s).replace("\r\n", "\n").split("\n")).strip()

class _Res:
    def __init__(self):
        self.out = None; self.err = None; self.hung = False

def _exec_target(code, res):
    try:
        g = {"__name__": "__main__"}
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            exec(compile(code, "<py", "exec"), g)
        res.out = buf.getvalue(); res.err = None
    except Exception as e:
        res.err = e

def exec_code(code, timeout=6.0):
    res = _Res()
    t = threading.Thread(target=_exec_target, args=(code, res), daemon=True)
    t.start(); t.join(timeout)
    if t.is_alive():
        res.hung = True
    return res