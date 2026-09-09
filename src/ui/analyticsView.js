/* PYTHON·LAB — Analytics / progress dashboard + badges. */

import { lessons } from "../lessons/lessons.js";
import { allChallenges } from "../challenges/index.js";
import { debugChallenges } from "../challenges/debugging.js";
import { progress, LEVELS } from "../progress/progress.js";
import { trackProgress, summary, recommendations, topicDifficulty } from "../progress/analytics.js";
import { BADGES } from "../progress/badges.js";
import { escapeHtml, fmtTime } from "./helpers.js";

export function renderAnalytics(root, { openLesson, openChallenge }) {
  const s = summary();
  const tracks = trackProgress(lessons, allChallenges, debugChallenges);
  const recs = recommendations();
  const topics = topicDifficulty();
  const lvl = progress.level();
  const next = progress.nextLevel();

  root.innerHTML = `
  <div class="page">
    <div class="view-head"><h1>📊 Your Learning Progress</h1>
      <p>${lvl.name}${next ? ` — ${progress.levelProgress()}% to ${next.name} (${next.xp - s.xp} XP to go)` : " — max level!"}</p>
      <div class="bar" style="max-width:420px;margin-top:8px"><div style="width:${progress.levelProgress()}%;background:var(--accent)"></div></div>
    </div>

    <div class="statgrid">
      <div class="stat"><div class="num">${s.xp}</div><div class="lbl">Total XP</div></div>
      <div class="stat"><div class="num">${s.lessons}</div><div class="lbl">Lessons done</div></div>
      <div class="stat"><div class="num">${s.challenges}</div><div class="lbl">Challenges solved</div></div>
      <div class="stat"><div class="num">${s.debugs}</div><div class="lbl">Bugs fixed</div></div>
      <div class="stat"><div class="num">${s.successRate}%</div><div class="lbl">Success rate</div></div>
      <div class="stat"><div class="num">${s.avgAttempts}</div><div class="lbl">Avg attempts / challenge</div></div>
      <div class="stat"><div class="num">${s.streak}🔥</div><div class="lbl">Current streak (best ${s.bestStreak})</div></div>
      <div class="stat"><div class="num">${fmtTime(s.timeSpentMin * 60)}</div><div class="lbl">Time learning</div></div>
    </div>

    <h2 style="margin-top:30px;font-size:16px">Track completion</h2>
    ${Object.entries(tracks).map(([track, pct]) => `
      <div class="progress-row">
        <div class="plabel"><span>${escapeHtml(track)}</span><span>${pct}%</span></div>
        <div class="bar"><div style="width:${pct}%"></div></div>
      </div>`).join("")}

    <h2 style="margin-top:30px;font-size:16px">🧠 Smart recommendations</h2>
    ${recs.map((r) => `
      <div class="reco">
        <div>⚠ ${r.warning}</div>
        <ol style="margin:8px 0 0 18px">${r.steps.map((st) => `<li>${st}</li>`).join("")}</ol>
        ${r.openLesson ? `<button class="pbtn" data-goto="${escapeHtml(r.openLesson)}" style="margin-top:8px">Review the lesson →</button>` : ""}
      </div>`).join("")}

    ${topics.length ? `<h2 style="margin-top:30px;font-size:16px">Topic performance</h2>
      <table class="vartable" style="max-width:520px"><thead><tr><th>Topic</th><th>Solved</th><th>Failed</th><th>Hints</th></tr></thead><tbody>
      ${topics.map((t) => `<tr><td class="vt-name">${escapeHtml(t.topic)}</td><td class="vt-val">${t.solved || 0}</td><td class="vt-val" style="color:${(t.fails || 0) > 0 ? "var(--orange)" : "inherit"}">${t.fails || 0}</td><td class="vt-val">${t.hintUses || 0}</td></tr>`).join("")}
      </tbody></table>` : ""}

    <h2 style="margin-top:30px;font-size:16px">🏅 Badges (${BADGES.filter((b) => progress.data.badges.includes(b.id.trim())).length}/${BADGES.length})</h2>
    <div class="badge-grid">
      ${BADGES.map((b) => {
        const unlocked = progress.data.badges.includes(b.id.trim());
        return `<div class="badge-card ${unlocked ? "unlocked" : ""}" title="${escapeHtml(b.desc)}">
          <span class="em">${b.em}</span>
          <div class="bn">${escapeHtml(b.name)}</div>
          <div class="bd">${escapeHtml(b.desc)}</div>
          <div class="bd" style="color:${unlocked ? "var(--green)" : "var(--text-dim)"}">${unlocked ? "Unlocked" : "Locked"}</div>
        </div>`;
      }).join("")}
    </div>

    ${progress.data.events.length ? `<h2 style="margin-top:30px;font-size:16px">Recent activity</h2>
      <ul style="list-style:none;font-size:13px;color:var(--text-dim)">
        ${progress.data.events.slice(0, 8).map((e) => `<li>${escapeHtml(e.text)} <span class="meta">· ${new Date(e.date).toLocaleString()}</span></li>`).join("")}
      </ul>` : ""}
  </div>`;

  root.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const match = lessons.find((l) => l.title.toLowerCase().includes(btn.dataset.goto));
      if (match) openLesson(match.id);
    });
  });
}

