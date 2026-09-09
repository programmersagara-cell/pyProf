/* PYTHON·LAB — Pyodide Web Worker
 * Runs real Python via Pyodide/WASM off the main thread.
 * A run that exceeds its timeout causes the worker to be terminated by the
 * engine (see pythonEngine.js), which guarantees the browser never freezes
 * on infinite loops. */

let pyodide = null;
let ready = false;

const EXTRACT_VARS = `
import json as _pl_json, types as _pl_types

def _pl_conv(v, depth=0):
    try:
        if isinstance(v, (str, int, float, bool, type(None))):
            return v
        if depth >= 3:
            return repr(v)[:120]
        if isinstance(v, (list, tuple, set, frozenset)):
            vals = list(v)[:60]
            out = [_pl_conv(x, depth + 1) for x in vals]
            if isinstance(v, tuple):
                return {"__tuple__": out}
            if isinstance(v, (set, frozenset)):
                return {"__set__": [repr(x) for x in vals]}
            return out
        if isinstance(v, dict):
            return {"__dict__": [[ _pl_conv(k, depth+1) if isinstance(k,(list,dict,set)) else k, _pl_conv(val, depth + 1)] for k, val in list(v.items())[:60]]}
        if hasattr(v, "__dict__") and v.__dict__:
            return {"__object__": type(v).__name__, "attrs": [[k, _pl_conv(val, depth + 1)] for k, val in list(vars(v).items())[:40]]}
        return repr(v)[:120]
    except Exception:
        return "<unrepresentable>"

def _pl_collect():
    out = {}
    for k, v in list(globals().items()):
        if k.startswith("_") or k in ("json", "types", "math", "random", "sys"):
            continue
        if isinstance(v, (types.ModuleType, type(_pl_collect))):
            continue
        if callable(v) and not isinstance(v, type):
            continue
        try:
            out[k] = {"type": type(v).__name__, "value": _pl_conv(v), "repr": repr(v)[:160]}
        except Exception:
            continue
    return _pl_json.dumps(out)

_pl_collect()
`;

const FRIENDLY_INPUT = `
import builtins as _pl_builtins

def _pl_input(prompt=""):
    raise RuntimeError(
        "input() cannot pause a background program in this sandbox.\\n"
        "Assign a value directly instead, e.g.  name = \\"Maria\\""
    )
_pl_builtins.input = _pl_input
`;

async function boot() {
  importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");
  self.postMessage({ type: "boot", stage: "loading-pyodide" });
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
  });
  self.postMessage({ type: "boot", stage: "ready" });
  ready = true;
}

let outputBuffer = [];

function runPython(code) {
  outputBuffer = [];
  pyodide.setStdout({ batched: (s) => outputBuffer.push(s) });
  pyodide.setStderr({ batched: (s) => outputBuffer.push(s) });
  return pyodide.runPythonAsync(code);
}

self.onmessage = async (e) => {
  const msg = e.data;
  if (msg.type === "init") {
    try {
      await boot();
      // Prepare the sandbox: friendly input(), traceback trimming.
      await runPython(FRIENDLY_INPUT);
      self.postMessage({ type: "init-ok" });
    } catch (err) {
      self.postMessage({ type: "init-fail", error: String(err && err.message || err) });
    }
    return;
  }
  if (msg.type === "run") {
    if (!ready) {
      self.postMessage({ type: "result", id: msg.id, ok: false, error: "Python engine is not ready yet." });
      return;
    }
    const full = (msg.prelude ? msg.prelude + "\n" : "") + msg.code;
    const t0 = performance.now();
    try {
      await runPython(full);
      // Extract user variables (skip helpers defined by the sandbox itself)
      let vars = {};
      try {
        vars = JSON.parse(pyodide.runPython(EXTRACT_VARS));
      } catch (ve) { vars = {}; }
      self.postMessage({
        type: "result", id: msg.id, ok: true,
        output: outputBuffer.join("\n"),
        variables: vars,
        time: (performance.now() - t0) / 1000,
      });
    } catch (err) {
      self.postMessage({
        type: "result", id: msg.id, ok: false,
        output: outputBuffer.join("\n"),
        error: String(err && err.message || err),
        time: (performance.now() - t0) / 1000,
      });
    }
  }
};
