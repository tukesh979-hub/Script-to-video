import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, resetPasswordRequestSchema, resetPasswordConfirmSchema } from "./auth";

describe("loginSchema", () => {
  it("accepts a valid email/password pair", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "anything" });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts a strong-enough password", () => {
    const result = registerSchema.safeParse({ email: "a@b.com", password: "abcd1234" });
    expect(result.success).toBe(true);
  });

  it("rejects a password under 8 characters", () => {
    const result = registerSchema.safeParse({ email: "a@b.com", password: "abc123" });
    expect(result.success).toBe(false);
  });

  it("rejects a password with no digit", () => {
    const result = registerSchema.safeParse({ email: "a@b.com", password: "abcdefgh" });
    expect(result.success).toBe(false);
  });

  it("rejects a password with no letter", () => {
    const result = registerSchema.safeParse({ email: "a@b.com", password: "12345678" });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed email even with a valid password", () => {
    const result = registerSchema.safeParse({ email: "nope", password: "abcd1234" });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordRequestSchema", () => {
  it("accepts a valid email", () => {
    expect(resetPasswordRequestSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });
  it("rejects an empty email", () => {
    expect(resetPasswordRequestSchema.safeParse({ email: "" }).success).toBe(false);
  });
});

describe("resetPasswordConfirmSchema", () => {
  it("applies the same password strength rule as registration", () => {
    expect(resetPasswordConfirmSchema.safeParse({ password: "abcd1234" }).success).toBe(true);
    expect(resetPasswordConfirmSchema.safeParse({ password: "short1" }).success).toBe(false);
  });
});
