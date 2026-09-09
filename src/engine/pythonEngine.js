/* PYTHON·LAB — Python engine wrapper.
 * Owns the worker lifecycle, run timeouts, Stop and Reset. */

class PythonEngine {
  constructor() {
    this.worker = null;
    this.ready = false;
    this.runSeq = 0;
    this.pending = new Map();
    this.busy = false;
    this.timeoutMs = 15000;
    this.watchdog = null;
    this.listeners = { status: [], boot: [] };
  }

  on(event, fn) { this.listeners[event]?.push(fn); }
  emit(event, data) { this.listeners[event]?.forEach((fn) => fn(data)); }

  spawnWorker() {
    // Use an absolute path so the worker resolves correctly regardless of the page URL
    const workerUrl = new URL("src/engine/pyodideWorker.js", document.baseURI).href;
    this.worker = new Worker(workerUrl, { type: "classic" });
    this.worker.onmessage = (e) => this._handleMessage(e.data);
    this.worker.onerror = (e) => {
      this.ready = false;
      const msg = "Python engine crashed: " + (e.message || "unknown");
      this.emit("status", { state: "error", message: msg });
      // Reject any pending init promise so the boot overlay doesn't hang
      if (this._initReject) {
        this._initReject(new Error(msg));
        this._initReject = null;
      }
    };
  }

  init() {
    return new Promise((resolve, reject) => {
      this._initReject = reject;
      this.spawnWorker();
      const bootHandler = ({ stage }) => this.emit("boot", stage);
      this.on("boot", bootHandler);
      const cleanup = () => {
        this._initReject = null;
        const i = this.listeners.boot.indexOf(bootHandler);
        if (i >= 0) this.listeners.boot.splice(i, 1);
        clearTimeout(timer);
      };
      // If the worker never responds (blocked CDN, corrupt script, etc.), fail fast
      // instead of leaving the boot overlay up forever.
      const timer = setTimeout(() => {
        cleanup();
        this.emit("status", { state: "error", message: "Python engine timed out during initialization" });
        reject(new Error("Python engine timed out during initialization. The Pyodide CDN may be blocked or offline."));
      }, 30000);
      const msgHandler = (msg) => {
        if (msg.type === "init-ok") { this.ready = true; cleanup(); this.emit("status", { state: "ready", message: "Python engine ready" }); resolve(); }
        else if (msg.type === "init-fail") { cleanup(); this.emit("status", { state: "error", message: msg.error }); reject(new Error(msg.error)); }
      };
      this.worker.addEventListener("message", msgHandler);
      this.worker.postMessage({ type: "init" });
    });
  }

  _handleMessage(msg) {
    if (msg.type === "result") {
      clearTimeout(this.watchdog);
      const cb = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      this.busy = this.pending.size > 0;
      if (!this.busy) this.emit("status", { state: "idle" });
      cb && cb(msg);
    }
  }

  /** Run code; resolves { ok, output, error, variables, time, timedOut } */
  run(code, { prelude = "", timeout } = {}) {
    return new Promise((resolve) => {
      if (!this.ready || !this.worker) { resolve({ ok: false, error: "Python engine is not ready.", output: "", variables: {}, timedOut: false }); return; }
      const id = ++this.runSeq;
      this.pending.set(id, resolve);
      this.busy = true;
      this.emit("status", { state: "running" });
      this.worker.postMessage({ type: "run", id, code, prelude });
      const limit = timeout ?? this.timeoutMs;
      this.watchdog = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          this._terminateAndRespawn();
          resolve({
            ok: false, timedOut: true, time: limit / 1000,
            error: `Execution stopped after ${limit / 1000}s — your program probably contains an infinite loop (a while loop that never ends, for example).`,
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
    this._terminateAndRespawn();
    this.emit("status", { state: "idle" });
  }

  _terminateAndRespawn() {
    if (this.worker) { this.worker.terminate(); this.worker = null; }
    this.ready = false;
    this.emit("status", { state: "restarting", message: "Restarting Python engine…" });
    this.init().catch(() => {});
  }

  /** Reset environment: wipe user globals without a full reload. */
  async reset() {
    this.stop();
    // wait a tick for the respawned engine
    await new Promise((r) => setTimeout(r, 50));
    return true;
  }
}

export const engine = new PythonEngine();
