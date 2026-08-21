import { describe, it, expect } from "vitest";
import { createProjectSchema } from "./project";

describe("createProjectSchema", () => {
  it("accepts a name with no description", () => {
    expect(createProjectSchema.safeParse({ name: "My Project" }).success).toBe(true);
  });

  it("accepts a name with a description", () => {
    expect(createProjectSchema.safeParse({ name: "My Project", description: "About it" }).success).toBe(true);
  });

  it("rejects a name under 2 characters", () => {
    expect(createProjectSchema.safeParse({ name: "A" }).success).toBe(false);
  });

  it("rejects a missing name", () => {
    expect(createProjectSchema.safeParse({ description: "x" }).success).toBe(false);
  });

  it("rejects a description over 2000 characters", () => {
    const result = createProjectSchema.safeParse({ name: "Valid", description: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("trims whitespace-only names down to nothing and rejects them", () => {
    expect(createProjectSchema.safeParse({ name: "   " }).success).toBe(false);
  });
});
