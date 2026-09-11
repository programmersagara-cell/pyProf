/* PYTHON·LAB — Dashboard: learning-focused landing view.
 * Every number shown here comes from the real local progress store
 * (localStorage) or the actual content libraries — nothing is fake. */

import { lessons } from "../lessons/lessons.js";
import { allChallenges } from "../challenges/index.js";
import { debugChallenges } from "../challenges/debugging.js";
import { progress } from "../progress/progress.js";
import { engine } from "../engine/pythonEngine.js";
import { escapeHtml, timeAgo, fmtTime } from "./helpers.js";

export function renderDashboard(root, { openLesson, go }) {
  const p = progress.data;
  const lessonsDone = lessons.filter((l) => progress.isLessonDone(l.id)).length;
  const challengesDone = Object.keys(p.challengesDone).length;
  const bugsDone = Object.keys(p.debugDone).length;
  const nextLesson = lessons.find((l) => !progress.isLessonDone(l.id)) || null;
  const lvl = progress.level();
  const next = progress.nextLevel();
  const levelPct = progress.levelProgress();
  const engineState = engine.getStatus ? engine.getStatus().state : "loading";
  const pyReady = engineState === "ready" || engineState === "idle";
  const events = (p.events || []).slice(0, 6);

  const overall = lessons.length + allChallenges.length + debugChallenges.length;
  const doneTotal = lessonsDone + challengesDone + bugsDone;
  const overallPct = overall ? Math.round((doneTotal / overall) * 100) : 0;

  const continueBtn = nextLesson
    ? `<button class="dash-cta" id="dashContinue">Continue: ${escapeHtml(nextLesson.title)} <span class="dash-cta-sub">Lesson ${nextLesson.num} · ${escapeHtml(nextLesson.track)}</span></button>`
    : `<div class="dash-cta dash-complete">All lessons completed — nice work! Review any lesson or keep sharpening skills with challenges.</div>`;

  root.innerHTML = `
  <div class="page dash">
    <div class="dash-hero">
      <div class="dash-hero-main">
        <h1>Continue Learning</h1>
        <p class="dash-sub">${lessonsDone} of ${lessons.length} lessons complete · ${p.xp} XP · Level: ${escapeHtml(lvl.name)}</p>
        ${continueBtn}
        <div class="dash-quick" role="group" aria-label="Quick actions">
          <button class="pbtn" id="dashGoLessons">Lessons</button>
          <button class="pbtn" id="dashGoPlayground">Python Playground</button>
          <button class="pbtn" id="dashGoChallenges">Challenges</button>
          <button class="pbtn" id="dashGoDebugging">Debugging</button>
          <button class="pbtn" id="dashGoCheat">Cheat Sheet</button>
        </div>
      </div>
      <div class="dash-hero-side">
        <div class="dash-xp">
          <div class="dash-xp-top"><b>${p.xp} XP</b><span>${next ? `${next.xp - p.xp} to ${escapeHtml(next.name)}` : "Max level"}</span></div>
          <div class="dash-bar" role="progressbar" aria-valuenow="${levelPct}" aria-valuemin="0" aria-valuemax="100" aria-label="Level progress"><div style="width:${levelPct}%"></div></div>
        </div>
        <div class="dash-facts">
          <div><span class="df-n">${p.streak.count}</span><span class="df-l">day streak</span></div>
          <div><span class="df-n">${fmtTime(p.timeSpentSec)}</span><span class="df-l">coding time</span></div>
          <div><span class="df-n">${overallPct}%</span><span class="df-l">overall done</span></div>
        </div>
      </div>
    </div>
    <div class="dash-cols">
      <section class="dash-panel" aria-labelledby="dashProgH">
        <h2 id="dashProgH">Progress</h2>
        ${dashBarRow("Lessons", lessonsDone, lessons.length)}
        ${dashBarRow("Challenges", challengesDone, allChallenges.length)}
        ${dashBarRow("Bug hunts", bugsDone, debugChallenges.length)}
        <div class="dash-progress-row"><span>Level</span><div class="dash-bar sm" role="progressbar" aria-valuenow="${levelPct}" aria-valuemin="0" aria-valuemax="100" aria-label="Level progress"><div style="width:${levelPct}%"></div></div><span class="mono">${escapeHtml(lvl.name)}</span></div>
      </section>

      <section class="dash-panel" aria-labelledby="dashActH">
        <h2 id="dashActH">Recent activity</h2>
        ${events.length
          ? `<ul class="dash-events">${events.map((ev) => `<li><span class="mono dash-ev-date">${escapeHtml(timeAgo(ev.date))}</span><span>${escapeHtml(ev.text)}</span></li>`).join("")}</ul>`
          : `<p class="empty-hint">No activity yet. Complete a lesson or solve a challenge to start your history.</p>`}
      </section>
    </div>

    <p class="dash-status mono ${pyReady ? "ok" : "warn"}" id="dashEngineStatus" role="status">● ${pyReady
      ? "Python Ready — playground and lesson editors can run code."
      : engineState === "error"
        ? "Python runtime could not be loaded. Check your internet connection, then open the Workspace and press Retry."
        : "Initializing Python runtime — the WebAssembly engine (~10MB) is downloading. Editors open right away; running code waits until it is ready."}</p>
  </div>`;

  const wire = (id, fn) => { const b = document.getElementById(id); if (b) b.addEventListener("click", fn); };
  const continueEl = document.getElementById("dashContinue");
  if (continueEl && nextLesson) continueEl.addEventListener("click", () => openLesson(nextLesson.id));
  wire("dashGoLessons", () => go("lessons"));
  wire("dashGoPlayground", () => go("workspace"));
  wire("dashGoChallenges", () => go("challenges"));
  wire("dashGoDebugging", () => go("debugging"));
  wire("dashGoCheat", () => go("cheatsheet"));
}

function dashBarRow(label, done, total) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `<div class="dash-progress-row"><span>${escapeHtml(label)}</span><div class="dash-bar sm" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(label)} progress"><div style="width:${pct}%"></div></div><span class="mono">${done}/${total}</span></div>`;
}
