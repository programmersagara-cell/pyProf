/* PYTHON·LAB — badge definitions and unlock checks. */

import { progress } from "./progress.js";

export const BADGES = [
  { id: "hello-world", name: "Hello World", desc: "Complete your first challenge", check: (p) => Object.keys(p.challengesDone).length >= 1 },
  { id: "streak-7", name: "7 Day Streak", desc: "Practice 7 days in a row", check: (p) => p.streak.best >= 7 },
  { id: "problem-solver", name: "Problem Solver", desc: "Complete 20 challenges", check: (p) => Object.keys(p.challengesDone).length >= 20 },
  { id: "bug-hunter", name: "Bug Hunter", desc: "Fix 10 debugging exercises", check: (p) => Object.keys(p.debugDone).length >= 10 },
  { id: "speed-coder", name: "Speed Coder", desc: "Solve a challenge on the first try without hints", check: (p) => Object.values(p.challengesDone).some((c) => c.firstTry && !c.usedHints) },
  { id: "knowledge-seeker", name: "Knowledge Seeker", desc: "Complete 10 lessons", check: (p) => p.lessonsDone.length >= 10 },
  { id: "python-master", name: "Python Master", desc: "Complete all challenges", check: (p, totals) => totals.challenges > 0 && Object.keys(p.challengesDone).length >= totals.challenges },
  { id: "flawless", name: "Flawless", desc: "Solve 5 challenges without using any hint", check: (p) => Object.values(p.challengesDone).filter((c) => !c.usedHints && !c.usedSolution).length >= 5 },
  { id: "lesson-fanatic", name: "Scholar", desc: "Complete every lesson", check: (p, totals) => totals.lessons > 0 && p.lessonsDone.length >= totals.lessons },
  { id: "xp-1000", name: "XP Collector", desc: "Earn 1000 XP", check: (p) => p.xp >= 1000 },
  { id: "debug-master", name: "Debugger", desc: "Fix 5 debugging exercises", check: (p) => Object.keys(p.debugDone).length >= 5 },
  { id: "persistent", name: "Persistent", desc: "Solve something after 3+ failed attempts", check: (p) => Object.entries(p.attempts).some(([id, n]) => n >= 3 && (p.challengesDone[id] || p.debugDone[id])) },
];

/** Check all badges; unlock newly earned ones. Returns list of newly unlocked. */
export function evaluateBadges(totals = { challenges: 60, lessons: 34 }) {
  const p = progress.data;
  const unlocked = [];
  for (const b of BADGES) {
    const id = b.id.trim();
    if (!p.badges.includes(id) && b.check(p, totals)) {
      p.badges.push(id);
      unlocked.push(b);
    }
  }
  if (unlocked.length) progress.save();
  return unlocked;
}
