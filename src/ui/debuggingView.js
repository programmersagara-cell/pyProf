/* PYTHON·LAB — Debugging practice view. */

import { debugChallenges } from "../challenges/debugging.js";
import { engine } from "../engine/pythonEngine.js";
import { explainError, renderErrorHTML } from "../engine/errorHandler.js";
import { createPythonEditor } from "../editor/editor.js";
import { validateChallenge } from "../validation/validator.js";
import { progress } from "../progress/progress.js";
import { history } from "../history/history.js";
import { evaluateBadges } from "../progress/badges.js";
import { toast, escapeHtml, difficultyClass } from "./helpers.js";

export function renderDebugging(root, { openBug, currentId }) {
  if (currentId) return renderBugDetail(root, currentId, openBug);

  const doneCount = debugChallenges.filter((d) => progress.isDebugDone(d.id)).length;
  root.innerHTML = `
  <div class="page">
    <div class="view-head">
      <h1>Debugging Practice <span class="count-chip">${doneCount}/${debugChallenges.length} fixed</span></h1>
      <p>Broken programs to find and fix: syntax, logical, runtime, indentation and variable errors.</p>
    </div>
    <div class="grid" id="bugGrid" role="list"></div>
  </div>`;

  const grid = document.getElementById("bugGrid");
  for (const d of debugChallenges) {
    const done = progress.isDebugDone(d.id);
    const tile = document.createElement("button");
    tile.className = "tile" + (done ? " done" : "");
    tile.setAttribute("role", "listitem");
    tile.innerHTML = `
      <span class="badge-pill ${difficultyClass(d.difficulty)}"><span class="lvl-dots" aria-hidden="true"><i></i><i></i><i></i></span>${escapeHtml(d.bugType)}</span>
      <h3>${done ? `<span class="done-mark" aria-label="completed">[done]</span>` : ""}${escapeHtml(d.title)}</h3>
      <span class="meta-line">${escapeHtml(d.track)}</span>`;
    tile.addEventListener("click", () => openBug(d.id));
    grid.appendChild(tile);
  }
}
function renderBugDetail(root, bugId, openBug) {
  const bug = debugChallenges.find((d) => d.id === bugId);
  if (!bug) { openBug(null); return; }
  let hintsShown = 0;

  root.innerHTML = `
  <div class="ch-detail">
    <aside class="ch-side bug-side">
      <button class="crumb" id="bugBack">← All exercises</button>
      <h1>${escapeHtml(bug.title)}</h1>
      <div class="tile-row">
        <span class="badge-pill ${difficultyClass(bug.difficulty)}"><span class="lvl-dots" aria-hidden="true"><i></i><i></i><i></i></span>${escapeHtml(bug.bugType)}</span>
        <span class="badge-pill p">${escapeHtml(bug.track)}</span>
      </div>
      <div class="spec">${escapeHtml(bug.task)}</div>
      <div class="spec"><b>Expected output:</b><pre class="codeblock">${escapeHtml(bug.expected)}</pre></div>
      <div id="hintArea"></div>
      <button class="pbtn" id="bugHint" style="margin-top:10px">Get a hint (0/3)</button>
      <div class="solution-area"><button class="pbtn danger" id="bugSolution">Reveal the fix</button></div>
    </aside>
    <section style="display:flex;flex-direction:column;min-height:0">
      <div class="panel" style="flex:1">
        <div class="panel-head"><span class="panel-title">buggy.py</span></div>
        <div style="display:flex;flex-direction:column">
          <div id="bugEditorHost"></div>
          <div class="runbar">
            <button class="pbtn primary" id="bugRun">Run Code</button>
            <button class="pbtn" id="bugValidate">Validate Fix</button>
            <button class="pbtn danger" id="bugStop">Stop</button>
          </div>
        </div>
        <div class="term" id="bugOut" aria-live="polite" style="max-height:180px;overflow:auto">Run the broken code first to see what goes wrong.</div>
        <div id="bugResult"></div>
      </div>
    </section>
  </div>`;

  document.getElementById("bugBack").addEventListener("click", () => openBug(null));
  const cm = createPythonEditor(document.getElementById("bugEditorHost"), bug.broken, { onRun: () => doRun() });

  const hintArea = document.getElementById("hintArea");
  const btnHint = document.getElementById("bugHint");
  btnHint.addEventListener("click", () => {
    if (hintsShown >= 3) { toast("All hints revealed"); return; }
    hintArea.insertAdjacentHTML("beforeend",
      `<div class="hintbox"><div class="hint-label">Hint ${hintsShown + 1} of 3</div><div class="hint-body">${escapeHtml(bug.hints[hintsShown]).replace(/\n/g, "<br>")}</div></div>`);
    hintsShown++;
    btnHint.textContent = `Get a hint (${hintsShown}/3)`;
    progress.recordHintUse(bug.track);
    if (hintsShown === 3) btnHint.disabled = true;
  });

  document.getElementById("bugSolution").addEventListener("click", () => {
    cm.setValue(bug.solution);
    toast("The fix is loaded — understand it, then validate!");
  });

  async function doRun() {
    const out = document.getElementById("bugOut");
    if (!out) return;
    const st = engine.getStatus ? engine.getStatus() : { state: engine.ready ? "ready" : "loading" };
    if (st.state === "error") { out.textContent = "Python engine failed to load: " + (st.message || ""); return; }
    if (!engine.ready) {
      out.textContent = "Waiting for Python engine… (still loading)";
      const ok = await engine.waitForReady(90000);
      if (!ok) { out.textContent = "Python engine is still loading. Please wait, then press Run again."; return; }
    }
    out.textContent = "Running…";
    const code = cm.getValue();
    const res = await engine.run(code);
    if (res.notReady) { out.textContent = res.error; return; }
    if (res.ok) {
      out.innerHTML = `${escapeHtml(res.output)}<hr><span class="meta">✓ Ran in ${res.time.toFixed(2)}s</span>`;
    } else if (res.error) {
      out.innerHTML = renderErrorHTML(explainError(res.error, code));
    }
  }

  document.getElementById("bugRun").addEventListener("click", doRun);
  document.getElementById("bugStop").addEventListener("click", () => engine.stop());
  document.getElementById("bugValidate").addEventListener("click", async () => {
    const out = document.getElementById("bugOut");
    const resultBox = document.getElementById("bugResult");
    out.textContent = "Validating…";
    const code = cm.getValue();
    // Validation = behaviour: the fixed program must produce the expected output.
    const validation = await validateChallenge({ tests: [{ inputs: {}, expected: bug.expected }] }, code);
    const pass = validation.passed;
    history.add({ code, status: pass, error: null, source: `debug: ${bug.title}`, challengeName: bug.title });

    if (!pass) {
      progress.recordFail(bug.id, bug.track, "debug");
      const actual = validation.results[0]?.actual ?? "";
      resultBox.innerHTML = `
        <div class="result-card fail" role="status">
          <h3><span class="verdict">FAIL</span>Still not fixed</h3>
          Your program's output must match:<pre class="codeblock">${escapeHtml(bug.expected)}</pre>
          ${actual ? `Actual output:<pre class="codeblock">${escapeHtml(actual)}</pre>` : ""}
        </div>`;
      return;
    }
    const res = progress.solveChallenge(bug.id, { topic: bug.track, usedHints: hintsShown > 0, kind: "debug" });
    const badges = evaluateBadges({ challenges: 60, lessons: 44 });
    resultBox.innerHTML = `
      <div class="result-card pass" role="status">
        <h3><span class="verdict">PASS</span>Bug fixed — the program behaves correctly now</h3>
      </div>`;
    if (res) toast(`+${res.gained} XP${res.levelUp ? ` — Level up: ${res.levelUp}!` : ""}`, true);
    for (const b of badges) toast(`Badge unlocked: ${b.name} — ${b.desc}`, true);
  });
}
