/* PYTHON·LAB — the main workspace: editor + variable explorer + output. */

import { engine } from "../engine/pythonEngine.js";
import { explainError, renderErrorHTML, escapeHtml } from "../engine/errorHandler.js";
import { createPythonEditor, editorThemeName } from "../editor/editor.js";
import { history } from "../history/history.js";
import { progress } from "../progress/progress.js";
import { store } from "../progress/store.js";
import { formatValue, childrenOf, toast } from "./helpers.js";

let cm = null;
let lastVariables = [];
let lastResult = null;

export function getWorkspaceEditor() { return cm; }

const DEFAULT_CODE = `# Write Python here, then press Run (Ctrl+Enter)
name = "Maria"
age = 21
scores = [90, 85, 95]

print(f"Hello, {name}!")
print(f"Next year you will be {age + 1}")
print("Average score:", sum(scores) / len(scores))
`;

export function renderWorkspace(root) {
  root.innerHTML = `
  <div class="view">
    <div class="ws-tabbar" role="tablist" aria-label="Workspace panels">
      <button role="tab" data-tab="editor" class="active" aria-selected="true">Code</button>
      <button role="tab" data-tab="vars" aria-selected="false">Variables</button>
      <button role="tab" data-tab="term" aria-selected="false">Output</button>
    </div>
    <div class="ws">
      <section class="panel ws-editor ws-panel active" data-panel="editor" aria-label="Code editor">
        <div class="panel-head">
          <span class="panel-title">Editor <span class="fname">main.py</span></span>
          <span class="spacer"></span>
          <button class="pbtn" id="btnCopyCode" title="Copy code to clipboard">Copy</button>
          <button class="pbtn" id="btnDownload" title="Download as main.py">Download</button>
          <button class="pbtn" id="btnFormat" title="Normalize indentation (4 spaces per level)">Tidy</button>
          <button class="pbtn" id="btnClear" title="Clear editor">Clear</button>
          <button class="pbtn danger" id="btnReset" title="Reset code to default">Reset code</button>
        </div>
        <div class="panel-body">
          <div class="editor-host" id="editorHost"></div>
          <div class="runbar">
            <button class="pbtn primary" id="btnRun" disabled title="Python engine is still loading…">Loading Python… <span class="kbd">Ctrl+Enter</span></button>
            <button class="pbtn" id="btnRetryEngine" hidden title="Retry loading the Python engine">Retry</button>
            <button class="pbtn danger" id="btnStop">Stop</button>
            <button class="pbtn" id="btnResetEnv" title="Restart the Python engine">Reset Environment</button>
            <span class="status-dot" id="statusDot" aria-hidden="true"></span>
            <span class="status-text" id="statusText">Initializing Python Engine…</span>
            <span class="spacer" style="flex:1"></span>
            <button class="pbtn" id="btnSave" title="Save code locally (Ctrl+S)">Save</button>
          </div>
        </div>
      </section>
      <section class="panel ws-panel" data-panel="vars" aria-label="Variables explorer">
        <div class="panel-head">
          <span class="panel-title">Variables</span>
          <span class="spacer"></span>
          <span class="panel-title" id="varCount"></span>
        </div>
        <div class="panel-body" id="varBody">
          <div class="empty-hint"><span class="empty-title">No variables inspected yet</span>Run your code and the variables it creates appear here as a table.</div>
        </div>
      </section>
      <section class="panel ws-panel" data-panel="term" aria-label="Output terminal">
        <div class="panel-head">
          <span class="panel-title">Output</span>
          <span class="spacer"></span>
          <button class="pbtn" id="btnCopyTerm" title="Copy output to clipboard">Copy output</button>
          <button class="pbtn" id="btnClearTerm">Clear</button>
        </div>
        <div class="panel-body term" id="termBody" aria-live="polite">
          <span class="meta">Program output appears here. Press Run or Ctrl+Enter.</span>
        </div>
      </section>
    </div>
  </div>`;

  const saved = store.get(store.keys.savedCode, null);
  cm = createPythonEditor(document.getElementById("editorHost"), saved?.code || DEFAULT_CODE, { onRun: () => runCode() });

  const btnRun = document.getElementById("btnRun");
  const btnRetry = document.getElementById("btnRetryEngine");
  btnRun.addEventListener("click", () => runCode());
  if (btnRetry) btnRetry.addEventListener("click", async () => {
    btnRetry.disabled = true;
    toast("Retrying Python engine…");
    try { await engine.retry(); } catch (e) { toast("Retry failed: " + String((e && e.message) || e)); }
    btnRetry.disabled = false;
  });
  document.getElementById("btnStop").addEventListener("click", () => { engine.stop(); toast("Execution stopped"); });
  document.getElementById("btnReset").addEventListener("click", () => { cm.setValue(DEFAULT_CODE); toast("Code reset to default"); });
  document.getElementById("btnClear").addEventListener("click", () => { cm.setValue(""); cm.focus(); });
  document.getElementById("btnSave").addEventListener("click", saveCode);
  document.getElementById("btnCopyCode").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText(cm.getValue());
      btn.textContent = "Copied";
      setTimeout(() => { btn.textContent = "Copy"; }, 1400);
    } catch (err) {
      toast("Clipboard blocked by the browser — select the code and copy manually", "err");
    }
  });
  document.getElementById("btnDownload").addEventListener("click", () => {
    const blob = new Blob([cm.getValue()], { type: "text/x-python" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "main.py";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast("Downloaded main.py");
  });
  document.getElementById("btnResetEnv").addEventListener("click", () => { engine.reset(); toast("Python environment restarting…"); });
  document.getElementById("btnClearTerm").addEventListener("click", () => {
    document.getElementById("termBody").innerHTML = `<span class="meta">Output cleared.</span>`;
  });
  document.getElementById("btnCopyTerm").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    const text = document.getElementById("termBody").innerText || "";
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "Copied";
      setTimeout(() => { btn.textContent = "Copy output"; }, 1400);
    } catch (err) {
      toast("Clipboard blocked by the browser — select the output and copy manually", "err");
    }
  });
  document.getElementById("btnFormat").addEventListener("click", tidyCode);

  root.querySelectorAll(".ws-tabbar button").forEach((btn) => {
    btn.addEventListener("click", () => {
      root.querySelectorAll(".ws-tabbar button").forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("active"); btn.setAttribute("aria-selected", "true");
      root.querySelectorAll(".ws-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === btn.dataset.tab));
      if (cm) cm.refresh();
    });
  });

  engine.on("status", (s) => {
    const state = s.state; const message = s.message;
    const dot = document.getElementById("statusDot");
    const text = document.getElementById("statusText");
    const run = document.getElementById("btnRun");
    const retry = document.getElementById("btnRetryEngine");
    if (dot) dot.className = "status-dot" + (state === "running" || state === "loading" || state === "restarting" ? " busy" : (state === "ready" || state === "idle") ? " ok" : state === "error" ? " err" : "");
    if (text) text.textContent = message || state;
    if (run) {
      if (state === "ready" || state === "idle") {
        run.disabled = false;
        run.innerHTML = `Run <span class="kbd">Ctrl+Enter</span>`;
        run.title = "Run Python code (Ctrl+Enter)";
      } else if (state === "running" || state === "restarting") {
        run.disabled = true;
        run.textContent = state === "running" ? "Running…" : "Restarting…";
      } else if (state === "error") {
        run.disabled = true;
        run.textContent = "Engine failed";
        run.title = message || "Python engine failed to load";
      } else {
        run.disabled = true;
        run.innerHTML = `Loading Python… <span class="kbd">Ctrl+Enter</span>`;
        run.title = message || "Python engine is still loading…";
      }
    }
    if (retry) retry.hidden = (state !== "error");
  });
  // Reflect current engine state immediately (late subscription sync).
  (function syncRunButton() {
    const s = engine.getStatus ? engine.getStatus() : { state: engine.ready ? "ready" : "loading", message: "" };
    const run = document.getElementById("btnRun");
    const retry = document.getElementById("btnRetryEngine");
    const text = document.getElementById("statusText");
    const dot = document.getElementById("statusDot");
    if (text) text.textContent = s.message || s.state;
    if (dot) dot.className = "status-dot" + (s.state === "ready" || s.state === "idle" ? " ok" : s.state === "error" ? " err" : " busy");
    if (run && (s.state === "ready" || s.state === "idle")) { run.disabled = false; run.innerHTML = `Run <span class="kbd">Ctrl+Enter</span>`; }
    if (retry) retry.hidden = (s.state !== "error");
  })();

  if (lastResult) renderResult(lastResult);
}
export async function runCode() {
  if (!cm) return;
  const code = cm.getValue();
  if (!code.trim()) { toast("Type some Python code first"); return; }
  // Gate: if the engine is still booting, wait briefly instead of failing.
  if (!engine.ready) {
    const st = engine.getStatus ? engine.getStatus() : { state: "loading", message: "" };
    if (st.state === "error") {
      setTerminal('<span class="err-t">Engine failed to load.</span>\n<span class="err-b">' + escapeHtml(st.message || "") + '</span>\n<span class="meta">Check your connection, then press Retry or Reset Environment.</span>');
      return;
    }
    setTerminal('<span class="meta">Waiting for Python engine… (still loading)</span>');
    const ok = await engine.waitForReady(90000);
    if (!ok) {
      setTerminal('<span class="err-t">Python engine is still loading.</span>\n<span class="meta">The WebAssembly runtime (~10MB) is downloading. Please wait for "Python Ready", then press Run again.</span>');
      return;
    }
  }
  setTerminal('<span class="meta">Running…</span>');
  const res = await engine.run(code);
  if (res.notReady) {
    // Genuinely still booting — keep the friendly loading text, not the old error.
    setTerminal('<span class="meta">' + escapeHtml(res.error) + '</span>');
    toast(res.error);
    return;
  }
  lastResult = { ...res, code };
  renderResult(lastResult);
  if (res.variables) {
    lastVariables = Object.entries(res.variables);
    renderVariables();
  }
  history.add({ code, status: res.ok, error: res.error || null, source: "workspace" });
  progress.addTime(res.time || 0);
}

function setTerminal(html) {
  const body = document.getElementById("termBody");
  if (body) body.innerHTML = html;
}

function renderResult(res) {
  let html = "";
  if (res.output) html += `<span class="out">${escapeHtml(res.output)}</span>\n`;
  if (res.ok) {
    html += `<hr><span class="meta">Finished in ${(res.time || 0).toFixed(2)}s — exit 0</span>`;
  } else if (res.stopped) {
    html += `<hr><span class="err-t">Stopped by user</span>`;
  } else if (res.error) {
    const ex = explainError(res.error, res.code || "");
    html += renderErrorHTML(ex);
  }
  setTerminal(html);
}

function renderVariables() {
  const body = document.getElementById("varBody");
  if (!body) return;
  const count = document.getElementById("varCount");
  if (count) count.textContent = `${lastVariables.length} variable${lastVariables.length === 1 ? "" : "s"}`;
  if (!lastVariables.length) {
    body.innerHTML = `<div class="empty-hint"><span class="empty-title">No variables in scope</span>Run the program and each top-level name appears here with its type and value.</div>`;
    return;
  }
  let html = `<table class="vartable"><thead><tr><th>Variable</th><th>Type</th><th>Value</th></tr></thead><tbody>`;
  for (const [name, info] of lastVariables) {
    const val = info.value;
    const expandable = val && typeof val === "object" && childrenOf(name, val).length > 0;
    html += `<tr>
      <td class="vt-name">${escapeHtml(name)}</td>
      <td><span class="vt-type">${escapeHtml(info.type)}</span></td>
      <td class="vt-val">${expandable ? `<button class="varrow" data-var="${escapeHtml(name)}" aria-label="Expand ${escapeHtml(name)}">▶</button> ` : ""}${escapeHtml(formatValue(val))}</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  body.innerHTML = html;
  body.querySelectorAll(".varrow").forEach((btn) => {
    btn.addEventListener("click", () => toggleExpand(btn, body));
  });
}

function toggleExpand(btn, body) {
  const name = btn.dataset.var;
  const open = btn.textContent === "▼";
  const info = lastVariables.find(([n]) => n === name)?.[1];
  if (!info) return;
  const kids = childrenOf(name, info.value);
  body.querySelectorAll(`[data-children="${CSS.escape(name)}"]`).forEach((r) => r.remove());
  if (open) { btn.textContent = "▶"; return; }
  btn.textContent = "▼";
  let rowHtml = "";
  for (const [key, val] of kids) {
    const t = val && typeof val === "object" ? (val.__object__ || (val.__dict__ ? "dict" : val.__tuple__ ? "tuple" : val.__set__ ? "set" : "list")) : (typeof val === "string" ? "str" : typeof val);
    rowHtml += `<tr class="vt-children" data-children="${escapeHtml(name)}"><td>${escapeHtml(String(key))}</td><td><span class="vt-type">${escapeHtml(t)}</span></td><td class="vt-val">${escapeHtml(formatValue(val))}</td></tr>`;
  }
  btn.closest("tr").insertAdjacentHTML("afterend", rowHtml);
}

export function saveCode() {
  if (!cm) return;
  store.set(store.keys.savedCode, { code: cm.getValue(), date: new Date().toISOString() });
  toast("Code saved locally (Ctrl+S)");
}

function tidyCode() {
  if (!cm) return;
  const lines = cm.getValue().split("\n");
  let depth = 0;
  const out = [];
  for (let line of lines) {
    const trimmed = line.trim();
    if (/^(else|elif\b|except\b|finally\b)/.test(trimmed)) depth = Math.max(0, depth - 1);
    if (trimmed) out.push("    ".repeat(depth) + trimmed);
    if (/:\s*(#.*)?$/.test(trimmed) && !trimmed.startsWith("#")) depth++;
  }
  cm.setValue(out.join("\n"));
  toast("Code tidied");
}

export function refreshEditorTheme() {
  if (cm) cm.setOption("theme", editorThemeName());
}
