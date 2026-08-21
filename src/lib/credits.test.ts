import { describe, it, expect } from "vitest";
// Imports the pure module directly, not ./credits -- that file imports
// "server-only", which throws unconditionally outside Next's build pipeline
// and would make this whole suite fail to even load. See credits-core.ts.
import { canAfford, RENDER_COST_CREDITS } from "./credits-core";

describe("canAfford", () => {
  it("allows a charge exactly equal to the balance", () => {
    expect(canAfford(RENDER_COST_CREDITS, RENDER_COST_CREDITS)).toBe(true);
  });

  it("allows a charge smaller than the balance", () => {
    expect(canAfford(100, RENDER_COST_CREDITS)).toBe(true);
  });

  it("rejects a charge larger than the balance", () => {
    expect(canAfford(RENDER_COST_CREDITS - 1, RENDER_COST_CREDITS)).toBe(false);
  });

  it("rejects any charge against a zero balance", () => {
    expect(canAfford(0, 1)).toBe(false);
  });

  it("treats a zero-cost charge as always affordable, even at zero balance", () => {
    expect(canAfford(0, 0)).toBe(true);
  });
});
