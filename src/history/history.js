/* PYTHON·LAB — history of executed programs (max 50, localStorage). */

import { store } from "../progress/store.js";

const MAX = 50;

export const history = {
  all() { return store.get(store.keys.history, []); },
  add({ code, status, error, challengeName, source }) {
    const items = this.all();
    items.unshift({
      id: Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      code,
      status: status ? "ok" : "error",
      error: error || null,
      challengeName: challengeName || null,
      source: source || "workspace",
      date: new Date().toISOString(),
    });
    if (items.length > MAX) items.length = MAX;
    store.set(store.keys.history, items);
    return items[0];
  },
  remove(id) {
    store.set(store.keys.history, this.all().filter((h) => h.id !== id));
  },
  clear() { store.set(store.keys.history, []); },
  search(q) {
    q = q.toLowerCase();
    return this.all().filter((h) =>
      (h.code || "").toLowerCase().includes(q) ||
      (h.challengeName || "").toLowerCase().includes(q) ||
      (h.status || "").includes(q));
  },
};
