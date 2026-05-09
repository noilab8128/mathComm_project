export const TIERS = [
  { name: 'Bronze III', minRP: 0 },
  { name: 'Bronze II', minRP: 300 },
  { name: 'Bronze I', minRP: 600 },
  { name: 'Silver III', minRP: 1000 },
  { name: 'Silver II', minRP: 1600 },
  { name: 'Silver I', minRP: 2300 },
  { name: 'Gold III', minRP: 3000 },
  { name: 'Gold II', minRP: 4200 },
  { name: 'Gold I', minRP: 5500 },
  { name: 'Diamond III', minRP: 7000 },
  { name: 'Diamond II', minRP: 9500 },
  { name: 'Diamond I', minRP: 12000 },
  { name: 'Master', minRP: 15000 },
];

/**
 * Calculates the tier name based on the given Ranking Points (RP).
 * @param rp The current Ranking Points.
 * @returns The corresponding tier name.
 */
export function calculateTier(rp: number): string {
  let currentTier = TIERS[0].name;
  for (const tier of TIERS) {
    if (rp >= tier.minRP) {
      currentTier = tier.name;
    } else {
      break;
    }
  }
  return currentTier;
}

/**
 * Calculates the user's level based on their total Experience Points (XP).
 * Using a slow-growth curve: Level = floor(sqrt(XP / 100)) + 1
 * Level 1 = 0 XP
 * Level 2 = 100 XP
 * Level 10 = 8,100 XP
 * Level 30 = 84,100 XP
 * @param xp The total Experience Points.
 * @returns The calculated level.
 */
export function calculateLevel(xp: number): number {
  if (xp <= 0) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Calculates the XP and RP earned for a problem submission.
 * @param difficulty The difficulty of the problem (1-10).
 * @param isCorrect Whether the submission was correct.
 * @param isFirstConqueror Whether the user is one of the first few to solve it.
 * @returns Object containing xpEarned and rpEarned.
 */
export function calculateRewards(
  difficulty: number,
  isCorrect: boolean,
  isFirstConqueror: boolean = false
): { xpEarned: number; rpEarned: number } {
  // Guard against invalid difficulties
  const safeDiff = Math.max(1, Math.min(10, difficulty || 1));

  let xpEarned = 0;
  let rpEarned = 0;

  if (isCorrect) {
    // XP: Base 10 + (Difficulty * 5)
    xpEarned = 10 + safeDiff * 5;

    // RP: Base Difficulty * 10
    rpEarned = safeDiff * 10;

    // Bonus RP for first conquerors (+50%)
    if (isFirstConqueror) {
      rpEarned = Math.floor(rpEarned * 1.5);
    }
  } else {
    // Meaningful attempt (incorrect)
    xpEarned = 2;
    rpEarned = 0; // RP is only earned for correct solutions
  }

  return { xpEarned, rpEarned };
}
