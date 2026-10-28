import { describe, it, expect } from "vitest";
import { loanSchema } from "../lib/validations";

describe("loanSchema", () => {
  it("accepts valid book and member IDs", () => {
    const result = loanSchema.safeParse({
      book_id: "550e8400-e29b-41d4-a716-446655440000",
      member_id: "123e4567-e89b-12d3-a456-426614174000",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid book ID", () => {
    const result = loanSchema.safeParse({
      book_id: "invalid-id",
      member_id: "123e4567-e89b-12d3-a456-426614174000",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid member ID", () => {
    const result = loanSchema.safeParse({
      book_id: "550e8400-e29b-41d4-a716-446655440000",
      member_id: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing book or member IDs", () => {
    expect(loanSchema.safeParse({}).success).toBe(false);
    expect(
      loanSchema.safeParse({
        book_id: "550e8400-e29b-41d4-a716-446655440000",
      }).success
    ).toBe(false);
  });
});