/* PYTHON·LAB — learning analytics + smart recommendations. */

import { progress } from "./progress.js";

export const TRACKS = ["Fundamentals", "Control Flow", "Data Structures", "Functions", "Advanced"];

/** Compute per-track completion percentages. */
export function trackProgress(lessons, challenges, debugEx) {
  const p = progress.data;
  const out = {};
  for (const track of TRACKS) {
    const ls = lessons.filter((l) => l.track === track);
    const cs = challenges.filter((c) => c.track === track);
    const ds = (debugEx || []).filter((d) => d.track === track);
    const total = ls.length + cs.length + ds.length;
    let done = ls.filter((l) => p.lessonsDone.includes(l.id)).length;
    done += cs.filter((c) => p.challengesDone[c.id]).length;
    done += ds.filter((d) => p.debugDone[d.id]).length;
    out[track] = total ? Math.round((done / total) * 100) : 0;
  }
  return out;
}

export function summary() {
  const p = progress.data;
  const challengeIds = Object.keys(p.challengesDone);
  const attemptsArr = challengeIds.map((id) => p.challengesDone[id].attempts || 1);
  const avgAttempts = attemptsArr.length
    ? (attemptsArr.reduce((a, b) => a + b, 0) / attemptsArr.length).toFixed(1) : "0";
  const totalAttempts = Object.values(p.attempts).reduce((a, b) => a + b, 0);
  const solved = challengeIds.length + Object.keys(p.debugDone).length;
  const successRate = totalAttempts ? Math.round((solved / (totalAttempts + solved)) * 100) : 0;
  return {
    xp: p.xp,
    lessons: p.lessonsDone.length,
    challenges: challengeIds.length,
    debugs: Object.keys(p.debugDone).length,
    failedAttempts: totalAttempts,
    successRate,
    avgAttempts,
    streak: p.streak.count,
    bestStreak: p.streak.best,
    timeSpentMin: Math.round(p.timeSpentSec / 60),
  };
}

/** Topic difficulty ranking: most problems first. */
export function topicDifficulty() {
  const p = progress.data;
  return Object.entries(p.topicStats)
    .map(([topic, t]) => {
      const score = (t.fails || 0) * 2 + (t.hintUses || 0) * 1.5 - (t.solved || 0);
      return { topic, ...t, score };
    })
    .sort((a, b) => b.score - a.score);
}

/** Smart recommendations based on failures, hints and time. */
export function recommendations() {
  const p = progress.data;
  const recs = [];
  const topics = topicDifficulty().filter((t) => t.score > 0);

  for (const t of topics.slice(0, 2)) {
    const name = t.topic;
    const lower = name.toLowerCase();
    recs.push({
      warning: `You are finding <b>${name}</b> difficult (${t.fails || 0} failed attempt(s), ${t.hintUses || 0} hint(s) used).`,
      steps: [
        `Review the <b>${name}</b> lesson.`,
        `Practice with <b>${name}</b> challenges.`,
        `Try the related <b>debugging exercise</b> to spot typical mistakes.`,
      ],
      openLesson: lessonsMatching(lower),
    });
  }
  if (!recs.length) {
    recs.push({
      warning: "No weak spots detected yet — great work!",
      steps: [
        "Keep the streak going: solve one challenge today.",
        "Move on to the next lesson you have not completed.",
        "Try an advanced challenge to stretch your skills.",
      ],
	  openLesson: null,
    });
  }
  return recs;
}

function lessonsMatching(lower) {
  // resolved lazily by the view via id lookup
  return lower;
}
