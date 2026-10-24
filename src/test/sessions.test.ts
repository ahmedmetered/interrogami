import { describe, expect, it } from "vitest";
import { nextSession } from "@/lib/sessions";

describe("sessions", () => {
  it("advances Jan → Feb → Jun → Jul → Sep", () => {
    expect(nextSession("January")).toBe("February");
    expect(nextSession("February")).toBe("June");
    expect(nextSession("June")).toBe("July");
    expect(nextSession("July")).toBe("September");
  });
  it("caps at September", () => expect(nextSession("September")).toBe("September"));
});
