// Deterministic Italian grading rules. Pure functions, covered by tests.

export const PASS_SCORE = 60;

/** Map an internal 0-100 score to an Italian grade; null = "Non superato". */
export function scoreToGrade(score: number): number | null {
  const s = Math.max(0, Math.min(100, score));
  if (s < PASS_SCORE) return null;
  return Math.round(18 + (s - 60) * 0.3);
}

export function questionXp(score: number): number {
  const g = scoreToGrade(score);
  return g === null ? 0 : (g - 17) * 5;
}

export interface LevelOutcome {
  average: number;
  grade: number | null; // null = BOCCIATO
  lode: boolean;
  passed: boolean;
  xp: number;
}

/** scores = final score per question (follow-up already replaced weak score). */
export function levelOutcome(scores: number[], anyFollowup: boolean): LevelOutcome {
  const average = scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length);
  const grade = scoreToGrade(average);
  const passed = grade !== null;
  const lode = passed && average >= 95 && !anyFollowup;
  let xp = 0;
  if (passed) {
    xp = scores.reduce((a, s) => a + questionXp(s), 0) + 50 + (lode ? 70 : 0);
  }
  return { average, grade, lode, passed, xp };
}

export type HatId = "cap" | "chef" | "crown" | "laurel";

export const HATS: { id: HatId; name: string; threshold: number | null }[] = [
  { id: "cap", name: "Graduation Cap", threshold: 100 },
  { id: "chef", name: "Chef Hat", threshold: 300 },
  { id: "crown", name: "Crown", threshold: 600 },
  { id: "laurel", name: "Laurel Wreath", threshold: null },
];

export function hatsForXp(xp: number): HatId[] {
  return HATS.filter((h) => h.threshold !== null && xp >= h.threshold).map((h) => h.id);
}

export function shouldFollowup(score: number, answer: string, aiSays: boolean): boolean {
  return aiSays || score < 55 || answer.trim().split(/\s+/).filter(Boolean).length < 6;
}
