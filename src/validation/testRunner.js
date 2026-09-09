/* PYTHON·LAB — test runner used by challenge & debugging views. */

import { validateChallenge, normalizeOutput } from "./validator.js";
import { engine } from "../engine/pythonEngine.js";

/**
 * Run a challenge's visible example (no scoring) so students can try code.
 * Returns engine result.
 */
export function runExample(code, defaultInputs) {
  const prelude = Object.entries(defaultInputs || {})
    .map(([k, v]) => `${k} = ${JSON.stringify(v)}`)
    .join("\n");
  return engine.run(code, { prelude });
}

/** Full validation pass. See validator.validateChallenge. */
export function runTests(challenge, code) {
  return validateChallenge(challenge, code);
}

export { normalizeOutput };
