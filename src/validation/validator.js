/* PYTHON·LAB — automated code validation.
 * Primary strategy is behaviour (output + hidden test cases), never
 * textual comparison of the student's source code. */

import { engine } from "../engine/pythonEngine.js";

/** Normalize program output for comparison. */
export function normalizeOutput(out) {
  return String(out ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n+$/g, "")
    .trim();
}

export function outputMatches(actual, expected) {
  return normalizeOutput(actual) === normalizeOutput(expected);
}

/** Structural checks: does the code use required constructs? */
export function structuralCheck(code, requires = [], forbidden = []) {
  const problems = [];
  for (const req of requires) {
    const re = new RegExp(req, "i");
    if (!re.test(code)) problems.push(`Your code must use: ${req.replace(/\\/g, "")}`);
  }
  for (const ban of forbidden) {
    const re = new RegExp(ban, "i");
    if (re.test(code)) problems.push(`Your code must NOT use: ${ban.replace(/\\/g, "")}`);
  }
  return problems;
}

/** Build a python prelude that injects test inputs as real variables. */
function preludeFromInputs(inputs = {}) {
  const lines = Object.entries(inputs).map(([k, v]) => {
    if (typeof v === "string") return `${k} = ${JSON.stringify(v)}`;
    if (Array.isArray(v)) return `${k} = ${JSON.stringify(v).replace(/"/g, '"')}`;
    return `${k} = ${v}`;
  });
  return lines.join("\n");
}

/**
 * Validate a challenge.
 * challenge.tests: [{ inputs:{name:value}, expected:"output text" }]
 * challenge.requires / challenge.forbidden: regex strings (optional)
 * challenge.defaultInputs: inputs used for the visible "Run" button.
 * Returns { passed, results:[{name, pass, expected, actual}], structural:[] , error }
 */
export async function validateChallenge(challenge, code, opts = {}) {
  const tests = challenge.tests || [];
  const results = [];
  let fatal = null;

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    // inputs define variables the code can use (prepended); prelude is the
    // test DRIVER that CALLS functions defined by the code (appended after it),
    // so `def` blocks are defined before the driver runs.
    const source = preludeFromInputs(t.inputs)
      + "\n" + code
      + (t.prelude ? "\n" + t.prelude : "");
    // Each test runs in isolation so tests cannot pollute each other.
    const res = await engine.run(source, { timeout: opts.timeout ?? 8000 });
    if (res.timedOut) { fatal = res.error; results.push({ name: t.name || `Test ${i + 1}`, pass: false, expected: t.expected, actual: "(timed out)" }); continue; }
    if (!res.ok && res.error && !res.output) {
      results.push({ name: t.name || `Test ${i + 1}`, pass: false, expected: t.expected, actual: "Error: " + shortError(res.error) });
      continue;
    }
    results.push({
      name: t.name || `Test ${i + 1}`,
      pass: outputMatches(res.output, t.expected),
      expected: t.expected,
      actual: res.output,
    });
  }

  const structural = structuralCheck(code, challenge.requires, challenge.forbidden);
  const passed = !fatal && results.length > 0 && results.every((r) => r.pass) && structural.length === 0;
  return { passed, results, structural, error: fatal };
}

function shortError(err) {
  const m = String(err).split("\n").filter(Boolean);
  return m[m.length - 1] || err;
}
