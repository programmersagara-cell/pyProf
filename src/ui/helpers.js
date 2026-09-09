/* PYTHON·LAB — shared UI helpers. */

import { escapeHtml } from "../engine/errorHandler.js";
export { escapeHtml };

export function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

let toastTimer = null;
export function toast(message, xp = false) {
  const t = document.getElementById("toast");
  t.textContent = message;
  t.className = "toast" + (xp ? " xp" : "");
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, xp ? 3500 : 2600);
}

export function openModal(title, bodyHtml) {
  const overlay = document.getElementById("modalOverlay");
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = bodyHtml;
  overlay.hidden = false;
  document.getElementById("modalClose").focus();
}

export function closeModal() {
  document.getElementById("modalOverlay").hidden = true;
}

export function difficultyClass(diff) {
  return diff === "Beginner" ? "b" : diff === "Intermediate" ? "i" : "a";
}

/** Pretty value for the variable explorer */
export function formatValue(v) {
  if (v === null || v === undefined) return "None";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "boolean") return v ? "True" : "False";
  if (Array.isArray(v)) return `[${v.map(formatValue).join(", ")}]`;
  if (typeof v === "object") {
    if (v.__tuple__) return `(${v.__tuple__.map(formatValue).join(", ")})`;
    if (v.__set__) return `{${v.__set__.join(", ")}}`;
    if (v.__dict__) return `{${v.__dict__.map(([k, val]) => `${formatKey(k)}: ${formatValue(val)}`).join(", ")}}`;
    if (v.__object__) {
      const attrs = (v.attrs || []).map(([k, val]) => `${k}=${formatValue(val)}`).join(", ");
      return `<${v.__object__} object: ${attrs}>`;
    }
    return JSON.stringify(v);
  }
  return String(v);
}

function formatKey(k) {
  return typeof k === "string" ? JSON.stringify(k) : formatValue(k);
}

/** Children entries for expandable inspection */
export function childrenOf(name, v) {
  if (v && typeof v === "object") {
    if (v.__tuple__) return v.__tuple__.map((val, i) => [`[${i}]`, val]);
    if (v.__set__) return v.__set__.map((val, i) => [`{${i}}`, val]);
    if (v.__dict__) return v.__dict__.map(([k, val]) => [formatKey(k), val]);
    if (v.__object__) return (v.attrs || []).map(([k, val]) => [`.${k}`, val]);
    if (Array.isArray(v)) return v.map((val, i) => [`[${i}]`, val]);
  }
  return [];
}

export function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString();
}

export function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m} min`;
  return `${Math.round(sec)}s`;
}
