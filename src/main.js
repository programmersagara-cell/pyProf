/* PYTHON·LAB — application entry point: router, theme, shortcuts, boot. */

import { engine } from "./engine/pythonEngine.js";
import { renderWorkspace, runCode, saveCode, refreshEditorTheme } from "./ui/workspace.js";
import { renderLessons } from "./ui/lessonsView.js";
import { renderChallenges } from "./ui/challengeView.js";
import { renderDebugging } from "./ui/debuggingView.js";
import { renderCheatsheet } from "./ui/cheatsheetView.js";
import { renderAnalytics } from "./ui/analyticsView.js";
import { renderHistory } from "./ui/historyView.js";
import { progress } from "./progress/progress.js";
import { store } from "./progress/store.js";
import { toast, openModal, closeModal } from "./ui/helpers.js";

const root = document.getElementById("viewRoot");

const state = {
  view: "workspace",
  lessonId: null,
  challengeId: null,
  bugId: null,
  challengeFilters: { difficulty: "All" },
};

/* ---------- theme ---------- */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.getElementById("themeBtn").textContent = theme === "dark" ? "🌙" : "☀️";
  refreshEditorTheme();
}
function initTheme() {
  const saved = store.get(store.keys.settings, {}).theme;
  const theme = saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  applyTheme(theme);
  document.getElementById("themeBtn").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    const settings = store.get(store.keys.settings, {});
    settings.theme = next;
    store.set(store.keys.settings, settings);
  });
}

/* ---------- XP widget ---------- */
function updateXpWidget() {
  const w = document.getElementById("xpWidget");
  const lvl = progress.level();
  const next = progress.nextLevel();
  w.innerHTML = `<b>${lvl.name}</b> · ${progress.data.xp} XP${next ? ` → ${next.xp}` : " · MAX"} · 🔥${progress.data.streak.count}`;
  w.onclick = () => setView("analytics");
}
progress.onChange(updateXpWidget);
/* ---------- router ---------- */
function setView(view, opts = {}) {
  state.view = view;
  if ("lessonId" in opts) state.lessonId = opts.lessonId;
  if ("challengeId" in opts) state.challengeId = opts.challengeId;
  if ("bugId" in opts) state.bugId = opts.bugId;

  document.querySelectorAll(".navbtn").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === view));
  root.scrollTop = 0;

  const openLesson = (id) => setView("lessons", { lessonId: id });
  const openChallenge = (id) => setView("challenges", { challengeId: id });
  const openBug = (id) => setView("debugging", { bugId: id });

  switch (view) {
    case "workspace": renderWorkspace(root); break;
    case "lessons": renderLessons(root, { openLesson, currentId: state.lessonId }); break;
    case "challenges": renderChallenges(root, { openChallenge, currentId: state.challengeId, filters: state.challengeFilters }); break;
    case "debugging": renderDebugging(root, { openBug, currentId: state.bugId }); break;
    case "cheatsheet": renderCheatsheet(root); break;
    case "analytics": renderAnalytics(root, { openLesson, openChallenge }); break;
    case "history": renderHistory(root, { loadCode: loadIntoWorkspace }); break;
  }
  updateXpWidget();
}

function loadIntoWorkspace(code) {
  setView("workspace");
  requestAnimationFrame(() => {
    const host = document.querySelector("#editorHost .CodeMirror");
    if (host?.CodeMirror) host.CodeMirror.setValue(code);
  });
}

document.getElementById("mainNav").addEventListener("click", (e) => {
  const btn = e.target.closest(".navbtn");
  if (btn) setView(btn.dataset.view);
});
document.getElementById("brandHome").addEventListener("click", () => setView("workspace"));
/* ---------- keyboard shortcuts ---------- */
document.addEventListener("keydown", (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key === "Enter") { e.preventDefault(); setView("workspace"); setTimeout(() => runCode(), 60); }
  else if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); saveCode(); }
  else if (e.key === "Escape") { closeModal(); }
  else if (!mod && !e.altKey) {
    const target = e.target;
    const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable || target.closest(".CodeMirror");
    if (typing) return;
    const map = { "1": "workspace", "2": "lessons", "3": "challenges", "4": "debugging", "5": "cheatsheet", "6": "analytics", "7": "history" };
    if (map[e.key]) setView(map[e.key]);
  }
});

document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.getElementById("shortcutsBtn").addEventListener("click", showShortcuts);

function showShortcuts() {
  openModal("⌨ Keyboard Shortcuts", `
    <table class="kbd-table">
      <tr><td><kbd>Ctrl</kbd> + <kbd>Enter</kbd></td><td>Run code</td></tr>
      <tr><td><kbd>Ctrl</kbd> + <kbd>Space</kbd></td><td>Autocomplete</td></tr>
      <tr><td><kbd>Ctrl</kbd> + <kbd>/</kbd></td><td>Comment / uncomment line</td></tr>
      <tr><td><kbd>Ctrl</kbd> + <kbd>S</kbd></td><td>Save code locally</td></tr>
      <tr><td><kbd>Esc</kbd></td><td>Close dialogs</td></tr>
      <tr><td><kbd>1</kbd> … <kbd>7</kbd></td><td>Switch views (Workspace, Lessons, Challenges, Debugging, Cheat Sheet, Progress, History)</td></tr>
      <tr><td><kbd>Tab</kbd></td><td>Indent 4 spaces in the editor</td></tr>
    </table>
    <p style="margin-top:14px;color:var(--text-dim)">Everything runs locally in your browser — your code and progress never leave this device.</p>`);
}
/* ---------- boot ---------- */
function boot() {
  const overlay = document.createElement("div");
  overlay.className = "boot";
  overlay.setAttribute("role", "status");
  overlay.setAttribute("aria-live", "polite");
  overlay.innerHTML = "<div class=\"logo\">PY</div><div class=\"bt\">Initializing Python Engine...</div><div class=\"bbar\"><div></div></div><div class=\"bsub\">Starting up...</div>";
  document.body.appendChild(overlay);

  // Determinate-feel progress: the bar creeps forward while Pyodide (~10MB
  // WASM) downloads, then jumps on real engine milestones. Never stuck.
  const barEl = overlay.querySelector(".bbar");
  const barFill = overlay.querySelector(".bbar>div");
  const subEl = overlay.querySelector(".bsub");
  let shownPct = 5;
  function paintPct(p, label) {
    shownPct = Math.max(shownPct, Math.min(99, Math.round(p)));
    if (barFill) barFill.style.width = shownPct + "%";
    if (barEl) barEl.setAttribute("aria-valuenow", String(shownPct));
    if (label && subEl) subEl.textContent = label + "  " + shownPct + "%";
    else if (subEl && !label) subEl.textContent = "Loading... " + shownPct + "%";
  }
  paintPct(5, "Starting up");
  const creepTimer = setInterval(() => {
    // Ease toward 90% but never reach it without real progress.
    if (overlayRemoved) { clearInterval(creepTimer); return; }
    const next = shownPct + Math.max(0.3, (90 - shownPct) * 0.04);
    paintPct(Math.min(90, next));
  }, 300);
  function finishBar() {
    clearInterval(creepTimer);
    shownPct = 100;
    if (barFill) barFill.style.width = "100%";
    if (barEl) barEl.setAttribute("aria-valuenow", "100");
    if (subEl) subEl.textContent = "Ready  100%";
  }

  // Boot overlay dismissal is ENGINE-DRIVEN (not a blind timer):
  // the overlay stays until the Python runtime is ready or has failed.
  // A 120s safety net only fires if the engine never settles (tab frozen etc.).
  let overlayRemoved = false;
  function removeOverlay() {
    if (overlayRemoved) return;
    overlayRemoved = true;
    clearInterval(creepTimer);
    clearTimeout(fallbackTimer);
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 450);
    // Always render the workspace when the overlay is removed.
    setView("workspace");
  }
  const fallbackTimer = setTimeout(() => {
    if (!engine.ready && engine.getStatus && engine.getStatus().state !== "error") {
      const bt = overlay.querySelector(".bt");
      if (bt) bt.textContent = "Still loading Python… (large download on slow networks — please wait)";
      // Give it another 60s instead of dropping the user into a broken state.
      setTimeout(removeOverlay, 60000);
    } else {
      removeOverlay();
    }
  }, 120000);

  // Click-to-dismiss: user can skip waiting
  overlay.style.cursor = "pointer";
  overlay.addEventListener("click", (e) => {
    // Don't dismiss if they clicked the skip button (it has its own handler)
    if (e.target.tagName === "BUTTON") return;
    removeOverlay();
  });

  // Add a skip button so users can dismiss the overlay immediately
  const skipBtn = document.createElement("button");
  skipBtn.textContent = "Skip ▶";
  skipBtn.style.cssText = "margin-top:18px;background:var(--panel2);border:1px solid var(--border2);color:var(--text-dim);padding:8px 18px;border-radius:8px;font-size:13px;cursor:pointer;";
  skipBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeOverlay();
  });
  overlay.appendChild(skipBtn);

  // Now do the rest of the initialization, wrapped in try-catch
  try {
    initTheme();
    updateXpWidget();

    engine.on("boot", (stage) => {
      const bt = overlay.querySelector(".bt");
      if (!bt) return;
      const text = typeof stage === "string" ? stage : (stage && stage.stage) || stage;
      if (text === "loading-pyodide") { bt.textContent = "Loading Python Runtime... (downloading WebAssembly)"; paintPct(35, "Downloading Python runtime"); }
      else if (text === "boot-python") { bt.textContent = "Initializing Python Engine..."; paintPct(70, "Starting Python"); }
      else if (text === "verifying") { bt.textContent = "Verifying Python runtime..."; paintPct(90, "Verifying"); }
      else { bt.textContent = "Preparing sandbox..."; paintPct(55, "Preparing sandbox"); }
    });

    engine.on("status", (s) => {
      if (!s) return;
      const bt = overlay.querySelector(".bt");
      if (s.state === "ready") { finishBar(); }
      else if (s.state === "error" && bt) { clearInterval(creepTimer); bt.textContent = s.message || "Python engine failed to load."; }
      else if (s.state === "loading" && bt && s.message) bt.textContent = s.message;
      else if (s.state === "restarting" && bt) bt.textContent = s.message || "Restarting Python engine...";
    });

    function bootDone() {
      // Engine finished booting (ready OR failed): dismiss overlay, show app.
      finishBar();
      setTimeout(removeOverlay, 250);
      const st = engine.getStatus ? engine.getStatus() : { state: engine.ready ? "ready" : "loading" };
      if (st.state === "ready") toast("Python Ready - happy coding!");
      else if (st.state === "error") toast("Python engine failed to load - check connection. Press Retry in the Workspace.", false);
    }

    engine.init()
      .then(bootDone, (err) => {
        // Surface a persistent error INSIDE the app shell (with Retry),
        // instead of hanging on the boot overlay forever.
        console.error("[python-lab] engine boot failed:", err);
        overlay.querySelector(".bbar")?.remove();
        overlay.classList.add("boot-error");
        const bt = overlay.querySelector(".bt");
        if (bt) bt.textContent = "Could not load the Python engine (offline or CDN blocked). Check your connection, then press Retry below.";
        let retryBtn = overlay.querySelector("#bootRetry");
        if (!retryBtn) {
          retryBtn = document.createElement("button");
          retryBtn.id = "bootRetry";
          retryBtn.textContent = "Retry loading Python";
          retryBtn.style.cssText = "margin-top:14px;background:var(--accent);color:#111;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;";
          retryBtn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            retryBtn.disabled = true;
            retryBtn.textContent = "Retrying…";
            engine.retry().then(bootDone, (err2) => {
              console.error("[python-lab] engine retry failed:", err2);
              const st = engine.getStatus ? engine.getStatus() : {};
              if (bt) bt.textContent = "Still failing: " + (st.message || String((err2 && err2.message) || err2));
              retryBtn.disabled = false;
              retryBtn.textContent = "Retry loading Python";
            });
          });
          overlay.appendChild(retryBtn);
        }
        // Auto-continue to the app after 12s so the UI is always reachable.
        setTimeout(removeOverlay, 12000);
        toast("Python engine failed to load - check your internet connection.", false);
      });
  } catch (err) {
    // If initTheme/updateXpWidget/engine.init threw synchronously, still show the UI
    console.error("[python-lab] boot initialization error:", err);
    overlay.querySelector(".bbar")?.remove();
    overlay.classList.add("boot-error");
    const bt = overlay.querySelector(".bt");
    if (bt) bt.textContent = "⚠ Something went wrong during startup. Click to continue.";
    setTimeout(removeOverlay, 4000);
    setView("workspace");
  }
}

// Global error handler: log only. Do NOT tear down the UI here —
// runtime errors after boot (e.g. a Pyodide hiccup) must never trigger
// the "Failed to load the application" fallback or wipe the workspace.
window.addEventListener("error", (e) => {
  console.error("[python-lab] global error:", e.error || e.message);
});

// Last-resort safety net: if boot() itself throws synchronously, still show the UI.
try {
  boot();
} catch (err) {
  console.error("[python-lab] boot threw:", err);
  const overlay = document.querySelector(".boot");
  if (overlay) overlay.remove();
  setView("workspace");
}

// Signal that the app has loaded successfully — prevents the fallback
// "Failed to load the application" message in index.html from showing.
window.__pythonLabLoaded = true;
