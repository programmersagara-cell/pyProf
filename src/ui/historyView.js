/* PYTHON·LAB — Code history view (last 50 runs, localStorage). */

import { history } from "../history/history.js";
import { escapeHtml, timeAgo, toast } from "./helpers.js";

let currentCode = "";

export function renderHistory(root, { loadCode }) {
  root.innerHTML = `
  <div class="page">
    <div class="view-head">
      <h1>🕘 Code History</h1>
      <p>The last 50 executed programs, stored only on this device.</p>
      <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;align-items:center">
        <input type="search" class="searchbox" style="margin-top:0" id="histSearch" placeholder="Search history…" aria-label="Search history">
        <button class="pbtn danger" id="histClear">🗑 Clear all history</button>
      </div>
    </div>
    <div id="histList"></div>
  </div>`;

  const list = document.getElementById("histList");
  const draw = (items) => {
    if (!items.length) {
      list.innerHTML = `<div class="empty-hint"><span class="big">🕘</span>Nothing here yet. Run some code in the Workspace!</div>`;
      return;
    }
    list.innerHTML = "";
    for (const h of items) {
      const item = document.createElement("div");
      item.className = "hist-item";
      item.innerHTML = `
        <div class="hc">
          <div class="hm">
            <span class="${h.status === "ok" ? "hist-ok" : "hist-err"}">${h.status === "ok" ? "✓ success" : "✗ error"}</span>
            · ${timeAgo(h.date)} · ${escapeHtml(h.source || "workspace")}${h.challengeName ? ` · ${escapeHtml(h.challengeName)}` : ""}
          </div>
          <pre>${escapeHtml(h.code)}</pre>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="pbtn" data-open="${h.id}">Open ↗</button>
          <button class="pbtn danger" data-del="${h.id}">Delete</button>
        </div>`;
      list.appendChild(item);
    }
    list.querySelectorAll("[data-open]").forEach((b) =>
      b.addEventListener("click", () => {
        const h = history.all().find((x) => x.id === b.dataset.open);
        if (h) { loadCode(h.code); toast("Code loaded into the Workspace editor"); }
      }));
    list.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", () => { history.remove(b.dataset.del); draw(history.all()); }));
  };

  draw(history.all());
  document.getElementById("histSearch").addEventListener("input", (e) => draw(history.search(e.target.value)));
  document.getElementById("histClear").addEventListener("click", () => {
    if (confirm("Delete ALL history? This cannot be undone.")) {
      history.clear();
      draw([]);
      toast("History cleared");
    }
  });
}
