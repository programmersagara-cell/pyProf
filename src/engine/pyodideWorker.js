/* PYTHON·LAB — Pyodide Web Worker
 * Runs real Python via Pyodide/WASM off the main thread.
 * A run that exceeds its timeout causes the worker to be terminated by the
 * engine (see pythonEngine.js), which guarantees the browser never freezes
 * on infinite loops.
 * GitHub Pages safe: no relative fetch, only versioned CDN with fallback. */

let pyodide = null;
let ready = false;
let cdnUsed = "";

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
        if isinstance(v, (_pl_types.ModuleType, type(_pl_collect))):
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

async function boot(requestedVersion) {
  const version = requestedVersion || "v0.26.2";
  const cdns = [
    "https://cdn.jsdelivr.net/pyodide/" + version + "/full/",
    "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
    "https://cdn.pyodide.org/v0.26.2/full/"
  ];
  let lastErr = null;
  for (const base of cdns) {
    try {
      self.postMessage({ type: "boot", stage: "loading-pyodide" });
      // Fresh importScripts per attempt (a failed one leaves no usable global).
      try { importScripts(base + "pyodide.js"); } catch (e) { throw new Error("Could not download pyodide.js from " + base + " (" + String((e && e.message) || e) + ")"); }
      if (typeof loadPyodide !== "function") throw new Error("pyodide.js loaded but loadPyodide() missing (" + base + ")");
      pyodide = await loadPyodide({ indexURL: base });
      cdnUsed = base;
      break;
    } catch (err) {
      lastErr = err;
      pyodide = null;
      // Try next CDN mirror.
    }
  }
  if (!pyodide) throw lastErr || new Error("Could not load the Pyodide runtime from any CDN. Check your connection.");
  self.postMessage({ type: "boot", stage: "boot-python" });
  // Smoke test: runtime must actually execute before we claim ready.
  const probe = await pyodide.runPythonAsync("2 + 3");
  if (probe !== 5) throw new Error("Pyodide loaded but failed its self-check.");
  self.postMessage({ type: "boot", stage: "verifying" });
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
    if (ready && pyodide) { self.postMessage({ type: "init-ok", cdn: cdnUsed }); return; }
    try {
      await boot(msg.version);
      // Prepare the sandbox: friendly input(), traceback trimming.
      await runPython(FRIENDLY_INPUT);
      self.postMessage({ type: "init-ok", cdn: cdnUsed });
    } catch (err) {
      ready = false;
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
    /** Extract user variables. Works even after an error, so the inspector
     *  shows the partial state that existed when the program failed. */
    function extractVars() {
      try {
        return JSON.parse(pyodide.runPython(EXTRACT_VARS)) || {};
      } catch (ve) {
        // Never silent: a broken extractor would look like "no variables".
        console.warn("[python-lab] variable extraction failed:", ve);
        return {};
      }
    }
    try {
      await runPython(full);
      const vars = extractVars();
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
        variables: extractVars(),
        time: (performance.now() - t0) / 1000,
      });
    }
  }
};
