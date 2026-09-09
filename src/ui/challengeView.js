/* PYTHON·LAB — Challenge view with progressive hints + automated validation. */

import { beginnerChallenges } from "../challenges/beginner.js";
import { intermediateChallenges } from "../challenges/intermediate.js";
import { advancedChallenges } from "../challenges/advanced.js";
import { allChallenges } from "../challenges/index.js";
import { engine } from "../engine/pythonEngine.js";
import { explainError, renderErrorHTML } from "../engine/errorHandler.js";
import { createPythonEditor } from "../editor/editor.js";
import { runExample, runTests } from "../validation/testRunner.js";
import { progress } from "../progress/progress.js";
import { history } from "../history/history.js";
import { evaluateBadges } from "../progress/badges.js";
import { toast, escapeHtml, difficultyClass } from "./helpers.js";

export function renderChallenges(root, { openChallenge, currentId, filters }) {
  if (currentId) return renderChallengeDetail(root, currentId, openChallenge);

  const diff = filters?.difficulty || "All";
  const doneCount = allChallenges.filter((c) => progress.isChallengeDone(c.id)).length;
  root.innerHTML = `
  <div class="page">
    <div class="view-head">
      <h1>🏆 Coding Challenges</h1>
      <p>${allChallenges.length} challenges validated by hidden test cases — any correct solution counts. Completed: ${doneCount}/${allChallenges.length}.</p>
      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap" id="diffFilter" role="group" aria-label="Difficulty filter">
        ${["All", "Beginner", "Intermediate", "Advanced"].map((d) =>
          `<button class="pbtn${diff === d ? " primary" : ""}" data-diff="${d}">${d}</button>`).join("")}
      </div>
      <input type="search" class="searchbox" id="chSearch" placeholder="Search challenges…" aria-label="Search challenges">
    </div>
    <div class="grid" id="chGrid" role="list"></div>
  </div>`;

  const grid = document.getElementById("chGrid");
  const search = document.getElementById("chSearch");
  const draw = () => {
    const q = search.value.toLowerCase();
    grid.innerHTML = "";
    const items = allChallenges.filter((c) =>
      (diff === "All" || c.difficulty === diff) &&
      (c.title + " " + c.track).toLowerCase().includes(q));
    for (const c of items) {
      const done = progress.isChallengeDone(c.id);
      const tile = document.createElement("button");
      tile.className = "tile" + (done ? " done" : "");
      tile.setAttribute("role", "listitem");
      tile.innerHTML = `
        <span class="badge-pill ${difficultyClass(c.difficulty)}">${c.difficulty}</span>
        <h3>${done ? "✅ " : ""}${escapeHtml(c.title)}</h3>
        <span class="meta-line">${escapeHtml(c.track)}</span>`;
      tile.addEventListener("click", () => openChallenge(c.id));
      grid.appendChild(tile);
    }
    if (!items.length) grid.innerHTML = `<p class="empty-hint">No challenges match.</p>`;
  };
  draw();
  search.addEventListener("input", draw);
  document.getElementById("diffFilter").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-diff]");
    if (!btn) return;
    filters.difficulty = btn.dataset.diff;
    renderChallenges(root, { openChallenge, currentId: null, filters });
  });
}
export function renderChallengeDetail(root, challengeId, openChallenge) {
  const ch = allChallenges.find((c) => c.id === challengeId);
  if (!ch) { openChallenge(null); return; }
  let hintsShown = 0;
  let usedSolution = false;

  root.innerHTML = `
  <div class="ch-detail">
    <aside class="ch-side">
      <button class="crumb" id="chBack">← All challenges</button>
      <h1>${escapeHtml(ch.title)}</h1>
      <span class="badge-pill ${difficultyClass(ch.difficulty)}">${ch.difficulty}</span>
      <span class="badge-pill p">${escapeHtml(ch.track)}</span>
      <div class="spec">${ch.brief}<ul>${ch.tasks.map((t) => `<li>${t}</li>`).join("")}</ul></div>
      ${ch.requires ? `<div class="spec">⚠ Your code must use: ${ch.requires.map((r) => `<code>${escapeHtml(r)}</code>`).join(", ")}</div>` : ""}
      ${ch.forbidden ? `<div class="spec">🚫 Your code must not use: ${ch.forbidden.map((r) => `<code>${escapeHtml(r)}</code>`).join(", ")}</div>` : ""}
      <div class="spec">Sample inputs for <b>Run</b>: <code>${escapeHtml(Object.entries(ch.defaultInputs).map(([k, v]) => `${k} = ${JSON.stringify(v)}`).join("; ") || "(none)")}</code></div>
      <div id="hintArea"></div>
      <button class="pbtn" id="btnHint" style="margin-top:10px">💡 Get a hint (0/3)</button>
      <div class="solution-area">
        <button class="pbtn danger" id="btnSolution">Reveal full solution (-XP)</button>
      </div>
    </aside>
    <section style="display:flex;flex-direction:column;min-height:0">
      <div class="panel" style="flex:1">
        <div class="panel-head"><span class="panel-title">solution.py</span>
          <span class="spacer"></span>
          <button class="pbtn danger" id="chResetStarter">Reset starter code</button>
        </div>
        <div style="display:flex;flex-direction:column">
          <div id="chEditorHost"></div>
          <div class="runbar">
            <button class="pbtn primary" id="chRun">▶ Run (sample input)</button>
            <button class="pbtn" id="chValidate">✓ Validate Solution</button>
            <button class="pbtn danger" id="chStop">■ Stop</button>
          </div>
        </div>
        <div class="term" id="chOut" aria-live="polite" style="max-height:180px;overflow:auto">Run your solution with the sample input, then Validate.</div>
        <div id="chResult"></div>
      </div>
    </section>
  </div>`;
  document.getElementById("chBack").addEventListener("click", () => openChallenge(null));
  const cm = createPythonEditor(document.getElementById("chEditorHost"), ch.starter, { onRun: () => doRun() });

  const hintArea = document.getElementById("hintArea");
  const btnHint = document.getElementById("btnHint");
  btnHint.addEventListener("click", () => {
    if (hintsShown >= 3) { toast("All hints revealed"); return; }
    const hint = ch.hints[hintsShown];
    hintArea.insertAdjacentHTML("beforeend",
      `<div class="hintbox"><div class="hint-body" style="padding-top:10px"><b>Hint ${hintsShown + 1}:</b> ${escapeHtml(hint).replace(/\n/g, "<br>")}</div></div>`);
    hintsShown++;
    btnHint.textContent = `💡 Get a hint (${hintsShown}/3)`;
    progress.recordHintUse(ch.track);
    if (hintsShown === 3) btnHint.disabled = true;
  });

  document.getElementById("btnSolution").addEventListener("click", () => {
    if (!usedSolution) {
      usedSolution = true;
      cm.setValue(ch.solution);
      toast("Solution loaded — study it, then try the next challenge!");
    }
  });

  async function doRun() {
    const out = document.getElementById("chOut");
    const runBtn = document.getElementById("chRun");
    const st = engine.getStatus ? engine.getStatus() : { state: engine.ready ? "ready" : "loading" };
    if (st.state === "error") { out.textContent = "Python engine failed to load: " + (st.message || "") + " Press Reset Environment in the Workspace, then retry."; return; }
    if (!engine.ready) {
      out.textContent = "Waiting for Python engine… (still loading)";
      const ok = await engine.waitForReady(90000);
      if (!ok) { out.textContent = "Python engine is still loading. Please wait for Python Ready, then press Run again."; return; }
    }
    out.textContent = "Running…";
    if (runBtn) { runBtn.disabled = true; }
    const code = cm.getValue();
    const res = await runExample(code, ch.defaultInputs);
    if (runBtn) { runBtn.disabled = false; }
    renderRunResult(out, res, code);
  }

  async function doValidate() {
    const resultBox = document.getElementById("chResult");
    const out = document.getElementById("chOut");
    const st = engine.getStatus ? engine.getStatus() : { state: engine.ready ? "ready" : "loading" };
    if (st.state === "error") { out.textContent = "Python engine failed to load: " + (st.message || ""); return; }
    if (!engine.ready) {
      out.textContent = "Waiting for Python engine… (still loading)";
      const ok = await engine.waitForReady(90000);
      if (!ok) { out.textContent = "Python engine is still loading. Please wait, then Validate again."; return; }
    }
    out.textContent = "Validating against hidden test cases…";
    const code = cm.getValue();
    const validation = await runTests(ch, code);
    const pass = validation.passed;
    history.add({ code, status: pass, error: validation.error || null, source: `challenge: ${ch.title}`, challengeName: ch.title });

    if (!pass) {
      progress.recordFail(ch.id, ch.track);
      resultBox.innerHTML = resultCard(false, validation);
      return;
    }
    const res = progress.solveChallenge(ch.id, { topic: ch.track, usedHints: hintsShown > 0, usedSolution });
    const badges = evaluateBadges({ challenges: allChallenges.length, lessons: 44 });
    resultBox.innerHTML = resultCard(true, validation);
    if (res) toast(`+${res.gained} XP${res.levelUp ? ` — Level up: ${res.levelUp}!` : ""}`, true);
    for (const b of badges) toast(`${b.em} Badge unlocked: ${b.name}!`, true);
  }

  document.getElementById("chRun").addEventListener("click", doRun);
  document.getElementById("chValidate").addEventListener("click", doValidate);
  document.getElementById("chStop").addEventListener("click", () => engine.stop());
  document.getElementById("chResetStarter").addEventListener("click", () => cm.setValue(ch.starter));
}

function renderRunResult(out, res, code) {
  if (!out) return;
  if (res.notReady) {
    out.textContent = res.error || "Python engine is still loading. Please wait, then press Run again.";
    return;
  }
  if (res.ok) {
    out.innerHTML = `${escapeHtml(res.output)}<hr><span class="meta">✓ Ran in ${res.time.toFixed(2)}s — now press Validate to check against hidden tests.</span>`;
  } else if (res.error) {
    out.innerHTML = renderErrorHTML(explainError(res.error, code));
  }
}

function resultCard(pass, validation) {
  const rows = validation.results.map((r) => `
    <li>${r.pass ? "✅" : "❌"} <b>${escapeHtml(r.name)}</b>
      ${r.pass ? "" : `<br>expected: <code>${escapeHtml(r.expected)}</code><br>actual: <code>${escapeHtml(r.actual)}</code>`}
    </li>`).join("");
  const structural = validation.structural?.length
    ? `<ul class="testlist">${validation.structural.map((s) => `<li>⚠ ${escapeHtml(s)}</li>`).join("")}</ul>` : "";
  return `
    <div class="result-card ${pass ? "pass" : "fail"}" role="status">
      <h3>${pass ? "🎉 All tests passed — challenge complete!" : "❌ Not passing yet"}</h3>
      ${pass ? "" : "Different solutions are allowed — the hidden tests only check behaviour. Compare your output with the expected one below:"}
      <ul class="testlist">${rows}</ul>${structural}
    </div>`;
}
