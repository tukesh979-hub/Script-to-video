/**
 * Pure credit logic, deliberately split out of credits.ts: that file imports
 * "server-only", which throws unconditionally outside Next's own build
 * pipeline (it isn't a conditional guard in plain Node/Vitest, it's a real
 * throw) -- so nothing in credits.ts, including logic with zero DB
 * dependency, can be unit tested directly. This file has no server-only
 * import and no I/O, so it can.
 */

/** Flat cost per render trigger. Not tiered by duration/resolution yet -- see README. */
export const RENDER_COST_CREDITS = 5;

export function canAfford(balance: number, cost: number): boolean {
  return balance >= cost;
}
