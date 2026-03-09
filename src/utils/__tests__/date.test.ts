import { extractDateKey, parseAppDateTime } from "../date";

describe("date utils", () => {
  it("parses AM/PM date time format", () => {
    const parsed = parseAppDateTime("2026-03-08 09:30 PM");
    expect(parsed).not.toBeNull();
    expect(extractDateKey("2026-03-08 09:30 PM")).toBe("2026-03-08");
  });

  it("parses 24-hour date time format", () => {
    const parsed = parseAppDateTime("2026-03-08 21:30");
    expect(parsed).not.toBeNull();
    expect(extractDateKey("2026-03-08 21:30")).toBe("2026-03-08");
  });

  it("returns empty date key for invalid input", () => {
    expect(parseAppDateTime("not-a-date")).toBeNull();
    expect(extractDateKey("not-a-date")).toBe("");
  });
});
