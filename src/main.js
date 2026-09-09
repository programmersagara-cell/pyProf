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
  overlay.innerHTML = `
    <div class="logo">🐍</div>
    <div class="bt">PYTHON·LAB — starting the Python engine…</div>
    <div class="bbar"><div></div></div>`;
  document.body.appendChild(overlay);

  // Hard fallback: never leave the overlay up more than 6 seconds, no matter what.
  // Set this FIRST before any other code, so even if initTheme/updateXpWidget throw,
  // the overlay will always be removed.
  let overlayRemoved = false;
  function removeOverlay() {
    if (overlayRemoved) return;
    overlayRemoved = true;
    clearTimeout(fallbackTimer);
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 450);
    // Always render the workspace when the overlay is removed,
    // even if engine.init() never resolved or rejected.
    setView("workspace");
  }
  const fallbackTimer = setTimeout(removeOverlay, 6000);

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
      if (bt) bt.textContent =
        stage === "loading-pyodide" ? "PYTHON·LAB — downloading Python (WebAssembly)…" : "PYTHON·LAB — preparing sandbox…";
    });

    engine.init()
      .then(() => {
        removeOverlay();
        toast("Python engine ready — happy coding! 🐍");
      })
      .catch((err) => {
        // Surface a clear message, then auto-dismiss so the UI is always reachable.
        overlay.querySelector(".bbar")?.remove();
        overlay.classList.add("boot-error");
        const bt = overlay.querySelector(".bt");
        if (bt) bt.textContent =
          "⚠ Could not load the Python engine (offline or CDN blocked). Check your connection and reload.";
        // Auto-dismiss after 4s (or immediately if user clicks)
        setTimeout(removeOverlay, 4000);
        toast("⚠ Python engine failed to load — check your internet connection.", false);
        console.error("[python-lab] engine boot failed:", err);
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

// Global error handler as a last resort
window.addEventListener("error", (e) => {
  console.error("[python-lab] global error:", e.error || e.message);
  // If the boot overlay is still up, remove it so the user can see the UI
  const overlay = document.querySelector(".boot");
  if (overlay) {
    overlay.remove();
    setView("workspace");
  }
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
