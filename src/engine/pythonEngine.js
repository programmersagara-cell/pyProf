/* PYTHON·LAB — Python engine wrapper (robust lifecycle).
 * States: idle -> loading -> ready | error. Single-flight init(). */

const PYODIDE_VERSION = "v0.26.2";

class PythonEngine {
  constructor() {
    this.worker = null;
    this.ready = false;
    this.status = "idle"; // idle | loading | ready | running | restarting | error
    this.statusMessage = "Python engine not started.";
    this.runSeq = 0;
    this.pending = new Map();
    this.busy = false;
    this.timeoutMs = 15000;
    this.watchdog = null;
    this.listeners = { status: [], boot: [] };
    this._readyPromise = null;
    this._readyResolve = null;
    this._readyReject = null;
    this._initAttempts = 0;
    this._maxAttempts = 2;
    this._initTimer = null;
  }

  on(event, fn) {
    if (this.listeners[event]) this.listeners[event].push(fn);
    // Sync late subscribers immediately so buttons rendered AFTER boot
    // still reflect the true engine state (fixes run-before-ready race).
    if (event === "status" && typeof fn === "function") {
      try { fn({ state: this._publicStatus(), message: this.statusMessage, ready: this.ready }); } catch (e) {}
    }
    return () => this.off(event, fn);
  }

  off(event, fn) {
    const arr = this.listeners[event];
    if (!arr) return;
    const i = arr.indexOf(fn);
    if (i >= 0) arr.splice(i, 1);
  }

  emit(event, data) {
    (this.listeners[event] || []).slice().forEach((fn) => {
      try { fn(data); } catch (e) { console.error("[python-lab] listener error:", e); }
    });
  }

  _setStatus(state, message) {
    this.status = state;
    if (typeof message === "string") this.statusMessage = message;
    this.emit("status", { state: this._publicStatus(), message: this.statusMessage, ready: this.ready });
  }

  _publicStatus() {
    if (this.status === "running") return "running";
    if (this.status === "restarting") return "restarting";
    if (this.status === "error") return "error";
    if (this.status === "loading") return "loading";
    return this.ready ? "idle" : "loading";
  }

  getStatus() {
    return { state: this._publicStatus(), message: this.statusMessage, ready: this.ready, busy: this.busy };
  }

  spawnWorker() {
    this.teardownWorker();
    // import.meta.url keeps this correct on any base path:
    // localhost, /pyProf/, https://USER.github.io/REPO/
    const workerUrl = new URL("./pyodideWorker.js", import.meta.url).href;
    this.worker = new Worker(workerUrl, { type: "classic" });
    this.worker.onmessage = (e) => this._handleMessage(e.data);
    this.worker.onerror = (e) => {
      if (e && e.preventDefault) { try { e.preventDefault(); } catch (_) {} }
      this._failInit(new Error("Python engine crashed: " + ((e && e.message) || "worker error")));
    };
  }

  teardownWorker() {
    if (this.worker) {
      try { this.worker.onmessage = null; this.worker.onerror = null; this.worker.terminate(); } catch (_) {}
      this.worker = null;
    }
  }

  /* Single-flight init: resolves when worker posts init-ok. */
  init() {
    if (this.ready) return Promise.resolve();
    if (this._readyPromise) return this._readyPromise;
    this._readyPromise = new Promise((resolve, reject) => {
      this._readyResolve = resolve;
      this._readyReject = reject;
    });
    this._readyPromise.catch(() => {}); // avoid unhandled rejection noise
    this._attemptInit();
    return this._readyPromise;
  }

  _attemptInit() {
    this._initAttempts += 1;
    this.ready = false;
    this.spawnWorker();
    this._setStatus("loading", this._initAttempts > 1
      ? ("Retrying Python engine… (attempt " + this._initAttempts + "/" + this._maxAttempts + ")")
      : "Initializing Python Engine…");
    clearTimeout(this._initTimer);
    // Pyodide WASM is ~10MB: allow 90s per attempt on slow networks.
    this._initTimer = setTimeout(() => {
      this._failInit(new Error("Python engine timed out during initialization. The Pyodide CDN may be blocked or offline. Check your connection and press Retry."));
    }, 90000);
    try {
      this.worker.postMessage({ type: "init", version: PYODIDE_VERSION });
    } catch (err) { this._failInit(err); }
  }

  _succeedInit() {
    clearTimeout(this._initTimer); this._initTimer = null;
    this.ready = true; this._initAttempts = 0;
    this._setStatus("ready", "Python Ready ✓");
    if (this._readyResolve) this._readyResolve();
    this._readyPromise = null; this._readyResolve = null; this._readyReject = null;
  }

  _failInit(err) {
    if (this._initAttempts < this._maxAttempts && this._readyPromise) {
      this.teardownWorker(); clearTimeout(this._initTimer);
      this._setStatus("loading", "Python engine retry in 1.5s… (" + String((err && err.message) || err) + ")");
      setTimeout(() => { if (this._readyPromise && !this.ready) this._attemptInit(); }, 1500);
      return;
    }
    clearTimeout(this._initTimer); this._initTimer = null;
    this.teardownWorker(); this.ready = false;
    const msg = String((err && err.message) || err || "Python engine failed to load.");
    this._setStatus("error", msg);
    if (this._readyReject) this._readyReject(err instanceof Error ? err : new Error(msg));
    this._readyPromise = null; this._readyResolve = null; this._readyReject = null;
    this._initAttempts = 0;
  }

  retry() {
    if (this.ready) return Promise.resolve();
    if (this._readyPromise) return this._readyPromise;
    return this.init();
  }

  async waitForReady(timeoutMs) {
    if (this.ready) return true;
    const p = this.init();
    const t = new Promise((res) => setTimeout(() => res("timeout"), timeoutMs || 90000));
    const outcome = await Promise.race([p.then(() => "ready", () => "failed"), t]);
    return outcome === "ready";
  }

  _handleMessage(msg) {
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "boot") {
      this.emit("boot", msg.stage || msg);
      if (msg.stage === "loading-pyodide") this._setStatus("loading", "Loading Python Runtime… (downloading WebAssembly)");
      else if (msg.stage === "boot-python") this._setStatus("loading", "Initializing Python Engine…");
      else if (msg.stage === "verifying") this._setStatus("loading", "Verifying Python runtime…");
      return;
    }
    if (msg.type === "init-ok") { this._succeedInit(); return; }
    if (msg.type === "init-fail") { this._failInit(new Error(msg.error || "Python engine failed to initialise.")); return; }
    if (msg.type === "result") {
      clearTimeout(this.watchdog);
      const cb = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      this.busy = this.pending.size > 0;
      if (!this.busy && this.ready) this._setStatus("ready", "Python Ready ✓");
      if (cb) cb(msg);
    }
  }

  /** Run code; resolves { ok, output, error, variables, time, timedOut, notReady } */
  run(code, opts) {
    const prelude = (opts && opts.prelude) || "";
    const timeout = (opts && opts.timeout) || this.timeoutMs;
    return new Promise((resolve) => {
      if (!this.ready || !this.worker) {
        const failed = /fail|block|offline|timed out|crash/i.test(this.statusMessage);
        resolve({ ok: false, output: "",
          error: failed
            ? ("Python engine failed to load. " + this.statusMessage + " Check your connection, then press Retry / Reset Environment.")
            : "Python engine is still loading… Please wait for \u201CPython Ready \u2713\u201D and try again.",
          variables: {}, timedOut: false, notReady: true });
        return;
      }
      const id = ++this.runSeq;
      this.pending.set(id, resolve);
      this.busy = true;
      this._setStatus("running", "Running…");
      this.worker.postMessage({ type: "run", id, code, prelude });
      const limit = timeout || this.timeoutMs;
      clearTimeout(this.watchdog);
      this.watchdog = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          this.busy = false;
          this._terminateAndRespawn();
          resolve({
            ok: false, timedOut: true, time: limit / 1000,
            error: "Execution stopped after " + (limit / 1000) + "s \u2014 your program probably contains an infinite loop (a while loop that never ends, for example).",
            output: "", variables: {},
          });
        }
      }, limit);
    });
  }

  /** User pressed Stop: kill the worker immediately. */
  stop() {
    clearTimeout(this.watchdog);
    this.pending.forEach((resolve) => resolve({ ok: false, stopped: true, error: "Execution stopped by user.", output: "", variables: {}, time: 0 }));
    this.pending.clear();
    this.busy = false;
    if (this.ready || this.worker) this._terminateAndRespawn();
    else this.emit("status", { state: this._publicStatus(), message: this.statusMessage, ready: this.ready });
  }

  _terminateAndRespawn() {
    this.teardownWorker();
    clearTimeout(this.watchdog);
    this.ready = false;
    this._setStatus("restarting", "Restarting Python engine…");
    this._readyPromise = null; this._readyResolve = null; this._readyReject = null;
    this._initAttempts = 0;
    this.init().catch(() => {});
  }

  /** Reset environment: wipe user globals without a full reload. */
  async reset() {
    this.stop();
    const ok = await this.waitForReady(90000);
    return ok;
  }
}

export const engine = new PythonEngine();
