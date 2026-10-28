import { describe, it, expect } from "vitest";
import { calculateFine } from "../lib/fines";

describe("calculateFine", () => {
  it("returns zero when a book is returned before the due date", () => {
    expect(
      calculateFine("2026-10-20T00:00:00Z", "2026-10-19T00:00:00Z")
    ).toBe(0);
  });

  it("returns zero when a book is returned on the due date", () => {
    expect(
      calculateFine("2026-10-20T00:00:00Z", "2026-10-20T00:00:00Z")
    ).toBe(0);
  });

  it("charges ₹5 for one overdue day", () => {
    expect(
      calculateFine("2026-10-20T00:00:00Z", "2026-10-21T00:00:00Z")
    ).toBe(5);
  });

  it("charges ₹15 for three overdue days", () => {
    expect(
      calculateFine("2026-10-20T00:00:00Z", "2026-10-23T00:00:00Z")
    ).toBe(15);
  });

  it("rounds a partial overdue day up to one day", () => {
    expect(
      calculateFine("2026-10-20T00:00:00Z", "2026-10-20T12:00:00Z")
    ).toBe(5);
  });

  it("throws an error for an invalid date", () => {
    expect(() => calculateFine("invalid-date")).toThrow(
      "Invalid due date or return date"
    );
  });
});