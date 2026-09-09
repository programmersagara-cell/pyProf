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
  const unlockedCount = BADGES.filter((b) => progress.data.badges.includes(b.id.trim())).length;

  root.innerHTML = `
  <div class="page">
    <div class="view-head"><h1>Progress <span class="count-chip">Level ${escapeHtml(lvl.name)}</span></h1>
      <p>${next ? `${progress.levelProgress()}% to ${escapeHtml(next.name)} — ${next.xp - s.xp} XP to go` : "Max level reached."} Streaks reward daily practice.</p>
      <div class="bar" style="max-width:420px;margin-top:8px" role="progressbar" aria-valuenow="${progress.levelProgress()}" aria-valuemin="0" aria-valuemax="100" aria-label="Progress to next level"><div style="width:${progress.levelProgress()}%"></div></div>
    </div>

    <div class="statgrid" role="table" aria-label="Learning totals">
      <div class="stat"><div class="num">${s.xp}</div><div class="lbl">Total XP</div></div>
      <div class="stat"><div class="num">${s.lessons}</div><div class="lbl">Lessons done</div></div>
      <div class="stat"><div class="num">${s.challenges}</div><div class="lbl">Challenges solved</div></div>
      <div class="stat"><div class="num">${s.debugs}</div><div class="lbl">Bugs fixed</div></div>
      <div class="stat"><div class="num">${s.successRate}%</div><div class="lbl">Success rate</div></div>
      <div class="stat"><div class="num">${s.avgAttempts}</div><div class="lbl">Avg attempts / challenge</div></div>
      <div class="stat"><div class="num">${s.streak}d<span style="font-size:12px;color:var(--text-faint)"> / best ${s.bestStreak}d</span></div><div class="lbl">Current streak</div></div>
      <div class="stat"><div class="num">${fmtTime(s.timeSpentMin * 60)}</div><div class="lbl">Time learning</div></div>
    </div>

    <h2 class="sec-title">Track completion</h2>
    ${Object.entries(tracks).map(([track, pct]) => `
      <div class="progress-row">
        <div class="plabel"><span>${escapeHtml(track)}</span><span>${pct}% complete</span></div>
        <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(track)} completion"><div style="width:${pct}%"></div></div>
      </div>`).join("")}

    <h2 class="sec-title">Recommendations</h2>
    ${recs.map((r) => `
      <div class="reco">
        <div class="reco-head">${r.warning}</div>
        <ol style="margin:8px 0 0 18px">${r.steps.map((st) => `<li>${st}</li>`).join("")}</ol>
        ${r.openLesson ? `<button class="pbtn" data-goto="${escapeHtml(r.openLesson)}" style="margin-top:8px">Review the lesson →</button>` : ""}
      </div>`).join("")}

    ${topics.length ? `<h2 class="sec-title">Topic performance</h2>
      <table class="vartable" style="max-width:560px"><thead><tr><th>Topic</th><th>Solved</th><th>Failed</th><th>Hints</th></tr></thead><tbody>
      ${topics.map((t) => `<tr><td class="vt-name">${escapeHtml(t.topic)}</td><td class="vt-val">${t.solved || 0}</td><td class="vt-val">${t.fails || 0} ${(t.fails || 0) > 0 ? "— needs work" : ""}</td><td class="vt-val">${t.hintUses || 0}</td></tr>`).join("")}
      </tbody></table>` : ""}

    <h2 class="sec-title">Badges <span class="count-chip">${unlockedCount}/${BADGES.length}</span></h2>
    <div class="badge-grid">
      ${BADGES.map((b) => {
        const unlocked = progress.data.badges.includes(b.id.trim());
        const initials = escapeHtml(b.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase());
        return `<div class="badge-card ${unlocked ? "unlocked" : ""}" title="${escapeHtml(b.desc)}">
          <span class="medal" aria-hidden="true">${initials}</span>
          <div class="bn">${escapeHtml(b.name)}</div>
          <div class="bd">${escapeHtml(b.desc)}</div>
          <div class="bstate">${unlocked ? "Unlocked" : "Locked"}</div>
        </div>`;
      }).join("")}
    </div>

    ${progress.data.events.length ? `<h2 class="sec-title">Recent activity</h2>
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

