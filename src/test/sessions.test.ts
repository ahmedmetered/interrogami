import { describe, expect, it } from "vitest";
import { nextSession, zoneForLevel } from "@/lib/sessions";

describe("sessions", () => {
  it("advances Jan → Feb → Jun → Jul → Sep", () => {
    expect(nextSession("January")).toBe("February");
    expect(nextSession("February")).toBe("June");
    expect(nextSession("June")).toBe("July");
    expect(nextSession("July")).toBe("September");
  });
  it("caps at September", () => expect(nextSession("September")).toBe("September"));
  it("places Fellini in September and Commedia in summer", () => {
    expect(zoneForLevel("cinema", 8, 9)).toBe(4);
    expect([3, 4, 5].map((i) => zoneForLevel("cinema", i, 9)).every((z) => z === 2 || z === 3)).toBe(true);
    expect([0, 1, 2].map((i) => zoneForLevel("cinema", i, 9)).every((z) => z <= 1)).toBe(true);
  });
});
