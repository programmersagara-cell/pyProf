/* PYTHON·LAB — Interactive cheat sheet view. */

import { cheatSheet } from "../cheatsheet/cheatsheet.js";
import { escapeHtml } from "./helpers.js";

export function renderCheatsheet(root) {
  const cats = [...new Set(cheatSheet.map((c) => c.cat))];
  root.innerHTML = `
  <div class="page">
    <div class="view-head">
      <h1>Python Cheat Sheet <span class="count-chip">${cheatSheet.length} topics</span></h1>
      <p>${cheatSheet.length} quick-reference topics with syntax, use cases, examples and common mistakes.</p>
      <input type="search" class="searchbox" id="csSearch" placeholder="Search topics… (e.g. slice, except, while)" aria-label="Search cheat sheet">
    </div>
    <div id="csBody"></div>
  </div>`;

  const body = document.getElementById("csBody");
  const draw = (filter = "") => {
    body.innerHTML = "";
    for (const cat of cats) {
      const items = cheatSheet.filter((c) => c.cat === cat && (c.topic + " " + c.explanation).toLowerCase().includes(filter));
      if (!items.length) continue;
      const catDiv = document.createElement("section");
      catDiv.className = "cs-cat";
      catDiv.innerHTML = `<h2>${escapeHtml(cat)} — ${items.length} topics</h2>`;
      for (const c of items) {
        catDiv.insertAdjacentHTML("beforeend", `
          <article class="cs-item">
            <h3>${escapeHtml(c.topic)}</h3>
            <pre class="codeblock">${escapeHtml(c.syntax)}</pre>
            <p class="when"><b>What it does:</b> ${escapeHtml(c.explanation)}</p>
            <p class="when"><b>When to use:</b> ${escapeHtml(c.when)}</p>
            <p class="when"><b>Example:</b></p>
            <pre class="codeblock" style="border-color:var(--green)">${escapeHtml(c.example)}</pre>
            <p class="cs-mistake">Common mistake: <code>${escapeHtml(c.mistake)}</code></p>
          </article>`);
      }
      body.appendChild(catDiv);
    }
    if (!body.children.length) body.innerHTML = `<p class="empty-hint">No topics match your search.</p>`;
  };
  draw();
  document.getElementById("csSearch").addEventListener("input", (e) => draw(e.target.value.toLowerCase()));
}
