import { describe, expect, it } from "vitest";
import { hatsForXp, levelOutcome, questionXp, scoreToGrade } from "@/lib/grading";

describe("grading", () => {
  it("maps 60/80/100 to 18/24/30", () => {
    expect(scoreToGrade(60)).toBe(18);
    expect(scoreToGrade(80)).toBe(24);
    expect(scoreToGrade(100)).toBe(30);
  });
  it("fails below 60", () => expect(scoreToGrade(59)).toBeNull());
  it("question XP is (grade-17)*5", () => {
    expect(questionXp(80)).toBe(35);
    expect(questionXp(40)).toBe(0);
  });
  it("failed level gives 0 XP", () => expect(levelOutcome([50, 55, 60], false).xp).toBe(0));
  it("passed level adds 50 bonus", () => expect(levelOutcome([80, 80, 80], false).xp).toBe(35 * 3 + 50));
  it("lode needs avg>=95 and no follow-up", () => {
    expect(levelOutcome([95, 95, 95], false).lode).toBe(true);
    expect(levelOutcome([95, 95, 95], true).lode).toBe(false);
    expect(levelOutcome([100, 100, 100], false).xp).toBe(65 * 3 + 50 + 70);
  });
  it("first decent level unlocks the cap", () => {
    expect(hatsForXp(levelOutcome([75, 75, 75], false).xp)).toContain("cap");
  });
  it("laurel is never bought", () => expect(hatsForXp(10000)).not.toContain("laurel"));
});
