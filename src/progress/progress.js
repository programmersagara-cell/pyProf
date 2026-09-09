/* PYTHON·LAB — progress, XP, levels, streaks, topic statistics. */

import { store } from "./store.js";

export const LEVELS = [
  { name: "Python Beginner", xp: 0 },
  { name: "Python Explorer", xp: 300 },
  { name: "Python Coder", xp: 800 },
  { name: "Python Developer", xp: 1600 },
  { name: "Python Programmer", xp: 3000 },
  { name: "Python Master", xp: 5000 },
];

export const XP = {
  challenge: 50,
  challengeNoHint: 100,
  debug: 60,
  debugNoHint: 120,
  lesson: 25,
  firstTryBonus: 30,
  streakBonus: 10, // per current streak day, capped
};

const todayStr = () => new Date().toISOString().slice(0, 10);

function defaultProgress() {
  return {
    xp: 0,
    lessonsDone: [],            // lesson ids
    challengesDone: {},         // id -> { attempts, usedHints, usedSolution, firstTry, date, timeSpent }
    debugDone: {},
    attempts: {},               // id -> number of failed validations
    topicStats: {},             // topic -> { attempts, solved, fails, hintUses }
    streak: { count: 0, lastDay: null, best: 0 },
    timeSpentSec: 0,
    startedAt: todayStr(),
    badges: [],
    events: [],                 // recent activity feed
  };
}

export class Progress {
  constructor() {
    this.data = Object.assign(defaultProgress(), store.get(store.keys.progress, {}));
  }
  save() { store.set(store.keys.progress, this.data); this._subscribers?.forEach((f) => f()); }
  onChange(fn) { (this._subscribers ||= []).push(fn); }

  level() {
    let lvl = LEVELS[0];
    for (const l of LEVELS) if (this.data.xp >= l.xp) lvl = l;
    return lvl;
  }
  nextLevel() {
    const i = LEVELS.indexOf(this.level());
    return LEVELS[i + 1] || null;
  }
  levelProgress() {
    const cur = this.level(), next = this.nextLevel();
    if (!next) return 100;
    return Math.min(100, Math.round(((this.data.xp - cur.xp) / (next.xp - cur.xp)) * 100));
  }

  addXP(amount, reason = "") {
    const before = this.level().name;
    this.data.xp += amount;
    const after = this.level().name;
    this.save();
    return { gained: amount, reason, levelUp: before !== after ? after : null };
  }

  /** Update the daily streak. Returns bonus XP awarded. */
  touchStreak() {
    const s = this.data.streak;
    const today = todayStr();
    if (s.lastDay === today) return 0;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    s.count = s.lastDay === yesterday ? s.count + 1 : 1;
    s.lastDay = today;
    s.best = Math.max(s.best, s.count);
    const bonus = Math.min(50, s.count * XP.streakBonus);
    if (bonus) this.addXP(bonus, "daily streak");
    this.save();
    return bonus;
  }

  recordEvent(text) {
    this.data.events.unshift({ text, date: new Date().toISOString() });
    if (this.data.events.length > 40) this.data.events.length = 40;
    this.save();
  }

  addTime(sec) {
    this.data.timeSpentSec += Math.max(0, Math.round(sec));
    this.save();
  }

  isLessonDone(id) { return this.data.lessonsDone.includes(id); }
  completeLesson(id, topic) {
    if (!this.isLessonDone(id)) {
      this.data.lessonsDone.push(id);
      this._bumpTopic(topic, "solved");
      this.save();
      return this.addXP(XP.lesson, "lesson complete");
    }
    return null;
  }

  isChallengeDone(id) { return !!this.data.challengesDone[id]; }
  isDebugDone(id) { return !!this.data.debugDone[id]; }

  recordAttempt(id, kind = "challenge") {
    this.data.attempts[id] = (this.data.attempts[id] || 0) + 1;
    this.save();
  }

  /** Called when a challenge/debug exercise passes validation. */
  solveChallenge(id, { topic, usedHints, usedSolution, kind = "challenge" } = {}) {
    const firstTry = (this.data.attempts[id] || 0) === 0;
    const bucket = kind === "debug" ? this.data.debugDone : this.data.challengesDone;
    const already = !!bucket[id];
    if (already) return null;
    bucket[id] = {
      attempts: (this.data.attempts[id] || 0) + 1,
      usedHints: !!usedHints,
      usedSolution: !!usedSolution,
      firstTry,
      date: new Date().toISOString(),
    };
    if (topic) this._bumpTopic(topic, "solved");
    const base = kind === "debug" ? (usedHints || usedSolution ? XP.debug : XP.debugNoHint)
                                 : (usedHints || usedSolution ? XP.challenge : XP.challengeNoHint);
    let total = base;
    if (firstTry) total += XP.firstTryBonus;
    const streakBonus = this.touchStreak();
    const res = this.addXP(total, kind === "debug" ? "debug challenge" : "challenge");
    this.recordEvent(`✅ Solved ${kind === "debug" ? "bug" : "challenge"}: ${id}`);
    res.gained = total + streakBonus;
    return res;
  }

  recordFail(id, topic, kind = "challenge") {
    this.data.attempts[id] = (this.data.attempts[id] || 0) + 1;
    if (topic) { this._bumpTopic(topic, "fails"); this._bumpTopic(topic, "attempts"); }
    this.save();
  }

  recordHintUse(topic) { if (topic) this._bumpTopic(topic, "hintUses"); this.save(); }

  _bumpTopic(topic, key) {
    if (!topic) return;
    const t = (this.data.topicStats[topic] ||= { attempts: 0, solved: 0, fails: 0, hintUses: 0 });
    if (key === "solved") { t.solved++; t.attempts++; }
    else t[key] !== undefined && t[key] !== null ? t[key]++ : (t[key] = 1);
    if (t[key] === undefined) t[key] = 1;
  }
}

export const progress = new Progress();
