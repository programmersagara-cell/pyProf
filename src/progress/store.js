/* PYTHON·LAB — versioned localStorage wrapper. All progress stays on-device. */

const PREFIX = "pythonLab_v1_";
const VERSION = 1;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "v" in parsed && parsed.v !== VERSION) {
      return migrate(key, parsed, fallback);
    }
    return parsed?.data !== undefined ? parsed.data : parsed;
  } catch { return fallback; }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ v: VERSION, data: value }));
    return true;
  } catch { return false; }
}

function migrate(key, old) {
  // Future migrations go here; for now pass data through.
  return old?.data !== undefined ? old.data : old;
}

export const store = {
  get: read,
  set: write,
  remove: (key) => localStorage.removeItem(PREFIX + key),
  keys: {
    progress: "progress",
    history: "history",
    settings: "settings",
    savedCode: "savedCode",
  },
  /** Export everything (for backup) */
  exportAll() {
    const out = {};
    for (const k of Object.values(this.keys)) out[k] = read(k, null);
    return JSON.stringify(out, null, 2);
  },
  importAll(json) {
    try {
      const obj = JSON.parse(json);
      for (const k of Object.keys(obj)) if (obj[k] != null) write(k, obj[k]);
      return true;
    } catch { return false; }
  },
  clearAll() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};
