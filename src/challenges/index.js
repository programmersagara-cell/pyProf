/* PYTHON·LAB — aggregated challenge collections. */

import { beginnerChallenges } from "./beginner.js";
import { intermediateChallenges } from "./intermediate.js";
import { advancedChallenges } from "./advanced.js";

export { beginnerChallenges, intermediateChallenges, advancedChallenges };

export const allChallenges = [
  ...beginnerChallenges,
  ...intermediateChallenges,
  ...advancedChallenges,
];
