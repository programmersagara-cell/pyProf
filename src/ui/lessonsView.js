/* PYTHON·LAB — Lessons view: catalogue + lesson detail with mini editor. */

import { lessons } from "../lessons/lessons.js";
import { engine } from "../engine/pythonEngine.js";
import { explainError, renderErrorHTML, escapeHtml } from "../engine/errorHandler.js";
import { createPythonEditor } from "../editor/editor.js";
import { progress } from "../progress/progress.js";
import { history } from "../history/history.js";
import { toast, escapeHtml } from "./helpers.js";

export function renderLessons(root, { openLesson, currentId }) {
  if (currentId) return renderLessonDetail(root, currentId, openLesson);
  const doneCount = lessons.filter((l) => progress.isLessonDone(l.id)).length;
  const tracks = [...new Set(lessons.map((l) => l.track))];
  root.innerHTML = `
  <div class="page">
    <div class="view-head">
      <h1>📚 Lessons</h1>
      <p>${lessons.length} structured lessons from first print() to decorators — each with a live mini editor. Progress: ${doneCount}/${lessons.length} completed.</p>
      <input type="search" class="searchbox" id="lessonSearch" placeholder="Search lessons… (e.g. loops, dict)" aria-label="Search lessons">
    </div>
    <div id="lessonGrid"></div>
  </div>`;

  const grid = document.getElementById("lessonGrid");
  const draw = (filter = "") => {
    grid.innerHTML = "";
    for (const track of tracks) {
      const items = lessons.filter((l) => l.track === track && (l.title + " " + track).toLowerCase().includes(filter));
      if (!items.length) continue;
      const cat = document.createElement("div");
      cat.className = "cs-cat";
      cat.innerHTML = `<h2>${escapeHtml(track)} — ${items.length} lessons</h2><div class="grid" role="list"></div>`;
      const g = cat.querySelector(".grid");
      for (const l of items) {
        const done = progress.isLessonDone(l.id);
        const tile = document.createElement("button");
        tile.className = "tile" + (done ? " done" : "");
        tile.setAttribute("role", "listitem");
        tile.innerHTML = `
          <span class="badge-pill p">${l.num}</span>
          <h3>${done ? "✅ " : ""}${escapeHtml(l.title)}</h3>
          <span class="meta-line">${track}${done ? " · completed" : ""}</span>`;
        tile.addEventListener("click", () => openLesson(l.id));
        g.appendChild(tile);
      }
      grid.appendChild(cat);
    }
    if (!grid.children.length) grid.innerHTML = `<p class="empty-hint">No lessons match your search.</p>`;
  };
  draw();
  document.getElementById("lessonSearch").addEventListener("input", (e) => draw(e.target.value.toLowerCase()));
}
export function renderLessonDetail(root, lessonId, openLesson) {
  const idx = lessons.findIndex((l) => l.id === lessonId);
  const lesson = lessons[idx];
  if (!lesson) { renderLessons(root, { openLesson }); return; }

  root.innerHTML = `
  <div class="lesson-detail">
    <button class="crumb" id="backToLessons">← All lessons</button>
    <h1>${escapeHtml(lesson.title)}</h1>
    <span class="badge-pill p">Lesson ${lesson.num} · ${escapeHtml(lesson.track)}</span>

    <div class="sec"><h2>Explanation</h2><div class="exp-text">${lesson.explanation}</div></div>
    <div class="sec"><h2>Syntax</h2><pre class="codeblock">${escapeHtml(lesson.syntax)}</pre></div>
    <div class="sec"><h2>Example</h2><pre class="codeblock">${escapeHtml(lesson.example)}</pre>
      <pre class="codeblock" style="border-style:dashed"><span style="color:#5b6673"># Expected output</span>\n${escapeHtml(lesson.expectedOutput)}</pre></div>

    <div class="sec"><h2>Common Mistakes</h2><div class="mistake">
      ${lesson.mistakes.map((m) => `
        <div>
          <div class="lbl wrong-l">❌ Wrong${m.note ? ` — ${escapeHtml(m.note)}` : ""}</div>
          <pre class="codeblock wrong">${escapeHtml(m.wrong)}</pre>
        </div>
        <div>
          <div class="lbl right-l">✓ Correct</div>
          <pre class="codeblock right">${escapeHtml(m.right)}</pre>
        </div>`).join("")}
    </div></div>

    <div class="sec"><h2>Try It Yourself</h2>
      <p class="exp-text">Modify the code and run it — this is a real Python editor.</p>
      <div class="mini-editor"><div id="miniHost"></div>
        <div class="mini-bar">
          <button class="pbtn primary" id="miniRun">▶ Run</button>
          <button class="pbtn" id="miniReset">Reset</button>
          <button class="pbtn" id="miniComplete">✓ Mark lesson complete</button>
        </div>
        <div class="mini-out" id="miniOut" aria-live="polite">Output…</div>
      </div>
    </div>

    <div class="lesson-nav">
      <button class="pbtn" id="prevLesson" ${idx === 0 ? "disabled" : ""}>← Previous</button>
      <button class="pbtn" id="nextLesson" ${idx === lessons.length - 1 ? "disabled" : ""}>Next lesson →</button>
    </div>
  </div>`;

  document.getElementById("backToLessons").addEventListener("click", () => openLesson(null));
  document.getElementById("prevLesson")?.addEventListener("click", () => openLesson(lessons[idx - 1].id));
  document.getElementById("nextLesson")?.addEventListener("click", () => openLesson(lessons[idx + 1].id));

  const mini = createPythonEditor(document.getElementById("miniHost"), lesson.starter, { height: 220 });
  document.getElementById("miniRun").addEventListener("click", async () => {
    const out = document.getElementById("miniOut");
    out.textContent = "Running…";
    const code = mini.getValue();
    const res = await engine.run(code);
    if (res.ok) {
      out.innerHTML = `${escapeHtml(res.output)}<span class="meta">\n✓ ${res.time.toFixed(2)}s</span>`;
    } else if (res.error) {
      out.innerHTML = renderErrorHTML(explainError(res.error, code));
    }
    history.add({ code, status: res.ok, error: res.error || null, source: `lesson: ${lesson.title}` });
    progress.addTime(res.time || 0);
  });
  document.getElementById("miniReset").addEventListener("click", () => mini.setValue(lesson.starter));
  document.getElementById("miniComplete").addEventListener("click", () => {
    const res = progress.completeLesson(lesson.id, lesson.track);
    if (res) toast(`+${res.gained} XP — lesson complete!`, true);
    else toast("Lesson already completed");
  });
}
